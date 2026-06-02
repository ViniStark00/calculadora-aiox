---
task: rotina-semanal
agent: stark-chief
squad: gestor-trafego-stark
elicit: false
inputs:
  - cliente: nome ou slug do cliente (resolvido pelo stark-chief de data/clientes.yaml)
  - gestor: vinicius | gustavo | ambos (inferido do campo gestores do cliente)
outputs:
  - resumo_final: status completo das 6 fases (COMPLETED | PARTIAL | FAILED por fase)
---

# Task: rotina-semanal — Pipeline Completo Semanal (6 Fases)

**Ativação por comando `*rotina-semanal [cliente]`:** pipeline completo com 6 fases ordenadas, handoffs entre agentes e gates de qualidade. Arquivo mais importante do squad.

---

## DETECÇÃO DO MODO DE EXECUÇÃO

Antes de qualquer resolução, identificar qual dos 3 modos foi solicitado:

| Padrão do trigger | Modo | Pipeline |
|-------------------|------|---------|
| `*rotina-semanal [nome_único]` | Modo 1 — 1 cliente | Sequencial, 6 fases (seção abaixo) |
| `*rotina-semanal todos {gestor}` | Modo 2 — por gestor | Paralelo, 5 estágios (seção Modo Paralelo) |
| `*rotina-semanal {nome1}, {nome2}, ...` | Modo 3 — lista mista | Paralelo, 5 estágios (seção Modo Paralelo) |

**Se Modo 2 ou Modo 3 detectado:** pular as seções FASE 1–6 e ir direto para `## Modo Paralelo`.

---

## PRÉ-EXECUÇÃO: Resolução do cliente (Modo 1 apenas)

Antes de iniciar as fases:

1. **Exact match** por `nome` em `data/clientes.yaml`
2. **Exact match** por `slug` em `data/clientes.yaml`
3. **Fuzzy match** (threshold 0.60) pelo `nome` — aceitar se score ≥ 0.60
4. Se nenhum: listar todos os slugs e pedir confirmação

Determinar `gestor` do cliente:
- `gestores: [vinicius]` → apenas fases Vinicius (inclui FASE 2)
- `gestores: [gustavo]` → FASE 2 pulada
- `gestores: [vinicius, gustavo]` → perguntar "Para qual gestor rodar a rotina semanal?"

---

## FASE 1 — MONITORAMENTO (obrigatória)

**Agente:** `alerta-monitor`
**Task:** `tasks/monitorar-contas.md`

### Ação
Monitorar TODAS as contas ativas — não apenas o cliente solicitado.
O monitoramento é sempre global (carteira completa, ambos os gestores).

### Handoff de saída
```yaml
alertas_ativos: list[alerta]    # 🔴🟡ℹ️ gerados
metricas_coletadas: dict        # keyed por slug — para reuso na FASE 2
```

### Gate: gate_alertas
**Acionado por:** validator
**Resultado PASS:** exibir alertas ao gestor + avançar para FASE 2
**Resultado FAIL:** exibir alertas com problema + perguntar ao gestor: "Deseja continuar mesmo com gate_alertas FAIL?"

### Comportamento se MCP indisponível
- Meta Ads MCP offline → usar Reportei como fallback (metricas_coletadas com fonte: reportei_fallback)
- Continuar sem bloquear o pipeline
- FASE 2 usará metricas_coletadas mesmo que parcial

---

## FASE 2 — PLANILHA GOOGLE SHEETS (condicional: só clientes Vinicius)

**Condição:** `vinicius in cliente.gestores`
**Se cliente só de Gustavo:** PULAR FASE 2 completamente — avançar para FASE 3

**Agente:** `coletor`
**Tasks:** `tasks/fetch-metrics.md` + `tasks/verify-fill.md`

### Handoff recebido da FASE 1
```yaml
metricas_coletadas: dict  # reutilizar dados Meta Ads sem nova chamada à API (ADR-04)
```

### Ação
1. Receber `metricas_coletadas` — usar `meta_spend` e `conversas` de clientes com `fonte: meta_ads`
2. SEMPRE buscar `google_spend` e `seguidores` via Reportei (não disponíveis no metricas_coletadas)
3. Preencher Google Sheets via `fill_sheets.py` com colunas de `sheet_columns` de cada cliente

### Gate: gate_sheets
**Acionado por:** validator
**Resultado PASS:** avançar para FASE 3
**Resultado FAIL:** PARAR — exibir motivos ao gestor — não avançar sem confirmação explícita

---

## FASE 3 — NARRATIVA DO RELATÓRIO (obrigatória)

**Agentes:** `contexto-cliente` (não-bloqueante) → `redator` → `validator`
**Tasks:** `tasks/generate-report.md` + `tasks/validate-report.md`

### Sub-passo 3.1 — Leitura do contexto do cliente (não-bloqueante)

**Agente:** `contexto-cliente` (comando: `carregar-contexto`)
- Buscar `"Contexto - {nome_cliente}"` na pasta `"Contexto Clientes - Stark"` no Google Drive
- Retornar objeto `contexto_cliente` (disponivel: true | false)
- Timeout de 10s → tratar como Drive indisponível → `disponivel: false` → continuar
- Nunca bloqueia o pipeline em nenhuma circunstância

### Sub-passo 3.2 — Geração da narrativa

**Agente:** `redator`
- Receber métricas (FASE 2 ou direto do Reportei se FASE 2 pulada)
- Receber `contexto_cliente` (pode ser `disponivel: false`)
- Classificar CPL por especialidade (thresholds-por-especialidade.yaml)
- Consultar histórico (data/historico-clientes.yaml)
- Buscar dados extras via MCP Reportei
- Gerar narrativa HTML completa

### Gate: gate_reportei
**Acionado por:** validator
**Resultado PASS — 1ª tentativa:** avançar para FASE 4∥5
**Resultado FAIL — 1ª vez:** retornar ao redator para regeneração (tentativa 2/2)
**Resultado FAIL — 2ª vez:** PARAR — aguardar ação do gestor

---

## FASE 4 — PUBLICAÇÃO REPORTEI + WHATSAPP (paralela com FASE 5)

> FASE 4 e FASE 5 executam em paralelo — uma não bloqueia a outra.

**Agentes:** `publicador` → `whatsapp-writer`
**Tasks:** `tasks/publish-timeline.md`

### Ação
1. `publicador`: publicar marco na Timeline do Reportei via MCP
2. `publicador`: verificar deduplicação (timeline-log.jsonl)
3. `publicador`: acionar `whatsapp-writer` com dados do relatório
4. `whatsapp-writer`: gerar mensagem WhatsApp formatada

### Handoff de saída
```yaml
timeline_event_id: str
link_relatorio: "https://app.reportei.com/projects/{project_id}"
mensagem_whatsapp: str
```

### Comportamento se MCP indisponível
- Reportei MCP offline → marcar FASE 4 como SKIPPED
- Continuar FASE 5 independentemente

---

## FASE 5 — STATUS REPORT CLICKUP (paralela com FASE 4)

> FASE 4 e FASE 5 executam em paralelo — uma não bloqueia a outra.

**Agente:** `clickup-writer`
**Task:** `tasks/preencher-clickup.md`

### Ação
1. Resolver doc de destino (Vinicius ou Gustavo) baseado no gestor do cliente
2. Localizar subpágina do cliente no ClickUp
3. Reconstituir ações da semana (4 fontes: Meta Ads, Reportei, Gmail, ClickUp)
4. Gerar draft e apresentar ao gestor para aprovação (OBRIGATÓRIO)
5. Aguardar aprovação explícita antes de escrever
6. Appendar bloco semanal na subpágina

### Gate: gate_clickup
**Acionado por:** validator
**Resultado PASS:** avançar para FASE 6
**Resultado FAIL:** retornar ao clickup-writer com itens com problema

### Comportamento se MCP indisponível
- ClickUp MCP offline → marcar FASE 5 como SKIPPED
- Continuar FASE 6 independentemente

---

## FASE 6 — WRAP-UP (paralelo, não-bloqueante)

> Todas as ações desta fase são não-bloqueantes — qualquer falha emite aviso e não interrompe.

**Agentes:** `coletor` + `contexto-cliente` + `task-monitor`

### Sub-passo 6.1 — Salvar histórico de métricas

**Agente:** `coletor`
**Task:** `tasks/save-history.md`
- Persistir métricas da semana em `data/historico-clientes.yaml`
- Nunca bloqueia; falha emite aviso e continua

### Sub-passo 6.2 — Atualizar contexto do cliente no Drive

**Agente:** `contexto-cliente` (comando: `atualizar-contexto`)
- Gerar 2–4 observações objetivas baseadas nos dados da semana
- Inserir nova entrada no topo da seção `## aprendizados` do documento
- Manter apenas as últimas 8 entradas
- Nunca bloqueia; falha emite `⚠️ Contexto não atualizado esta semana`

### Sub-passo 6.3 — Marcar tarefas concluídas no ClickUp

**Agente:** `task-monitor`
- Verificar tasks do cliente no ClickUp relacionadas ao relatório
- Marcar como concluídas se evidência digital confirmada via MCP
- Nunca bloqueia; falha emite aviso silencioso

---

## RESUMO FINAL

Ao concluir todas as fases, exibir:

```
ROTINA SEMANAL — [CLIENTE] — [DD/MM] a [DD/MM/AAAA]
════════════════════════════════════════════════════
✅ FASE 1 — Monitoramento       COMPLETED · N alertas (X🔴 Y🟡 Z✅)
✅ FASE 2 — Sheets               COMPLETED | SKIPPED (Gustavo-only)
✅ FASE 3 — Relatório            COMPLETED
✅ FASE 4 — Publicação Reportei  COMPLETED · event_id: XXXXX
✅ FASE 5 — Status ClickUp       COMPLETED | AWAITING_APPROVAL | SKIPPED
✅ FASE 6 — Wrap-up              COMPLETED · contexto: ✅ | histórico: ✅ | tasks: ✅

Status geral: COMPLETED | PARTIAL (listar fases com problema)
════════════════════════════════════════════════════
MENSAGEM WHATSAPP — [CLIENTE]
════════════════════════════════════════════════════
[mensagem_whatsapp gerada pelo whatsapp-writer]
════════════════════════════════════════════════════
📋 Copie a mensagem acima e envie ao cliente via WhatsApp.
```

---

---

## Modo Paralelo — Pipeline 5 Estágios (Modos 2 e 3)

> **Ativar quando:** trigger contém "todos {gestor}" (Modo 2) ou lista de múltiplos nomes (Modo 3).
> **Modo 1 (1 cliente) não é afetado** — continua usando as FASES 1–6 acima.

### Resolução de clientes por modo

**Modo 2 — "todos {gestor}":**
```
gestor_solicitado = trim(trigger após "todos ").lower()
# ex: "todos vinicius" → "vinicius"
# ex: "todos gustavo"  → "gustavo"
# ex: "todos matheus"  → "matheus"

clientes = [c for c in data/clientes.yaml if gestor_solicitado in c.gestores AND c.ativo]

Se clientes vazio:
  → "Nenhum cliente ativo encontrado para o gestor '{gestor_solicitado}'.
     Verifique se o nome está correto em data/clientes.yaml."
```

**Modo 3 — lista mista:**
- Resolver cada nome individualmente (fuzzy match 0.60, `ativo: true`)
- Clientes de gestores diferentes são aceitos na mesma lista
- Cada um preencherá o bloco do seu gestor no Estágio 2

---

### ESTÁGIO 1 — COLETA (sequencial rate-limited)

**Agentes:** `alerta-monitor` + `coletor` + `contexto-cliente`

Calcular período único — segunda a domingo da semana anterior (igual para todos os N clientes).

Para cada cliente, sequencialmente, com intervalo de 0.6s entre chamadas Reportei:

1. **alerta-monitor** — task: `monitorar-contas.md`
   - `excluir_meta_monitoring: true` → pular Meta completamente (ex: Dr. Laureano Filho)
   - `meta_ad_account_id: null` → fallback Reportei (apenas CPL)
   - Resultado → `dict_alertas[slug]`

2. **coletor** — task: `fetch-metrics.md`
   - `get_project_metrics` (Reportei): google_spend, seguidores, conversas, conversoes
   - Reutilizar CPL do alerta-monitor — sem chamadas duplicadas ao Meta (ADR-04)
   - Resultado → `dict_resultados[slug]`

3. **contexto-cliente** — LEITURA (chamadas Drive em paralelo/batched)
   - Leitura única aqui → passa como `ctx_cliente[slug]` para Estágios 3 e 4 (ADR-08)
   - NÃO relido em estágios seguintes
   - Falha Drive → `ctx_cliente[slug] = {}` + aviso; pipeline continua

**Falha por cliente:** `status[slug] = FAILED_FETCH`; pipeline continua os demais.
Alertas do `gate_alertas`: exibir ao final (não-bloqueante no modo paralelo).

---

### ESTÁGIO 2 — SHEETS (serializado — TODOS os clientes da rodada)

**Agente:** `coletor` — task: `verify-fill.md`

Todos os clientes da rodada preenchem a planilha — cada um no bloco do seu gestor.
**Não há condicional por gestor:** Vinicius preenche bloco Vinicius, Gustavo preenche bloco Gustavo.

Chamada única com todos os clientes:
```
fill_sheets.py --batch dict_resultados.json
```
(JSON com todos os clientes de uma vez — ADR-09)

Cada cliente usa sua linha correspondente identificada pelo slug.

**Falha parcial:** registrar clientes com erro + continuar.
**Falha total (0 escritas):** exibir aviso + perguntar ao gestor se quer continuar.

---

### ESTÁGIO 3 — GERAÇÃO DE RELATÓRIOS (lotes de 5 em paralelo)

**Agentes:** `validator` + `redator` + `validator`
**Tasks:** `verify-fill.md` + `generate-report.md` + `validate-report.md`

Candidatos: clientes com `status != FAILED_FETCH`.

Para cada lote de 5 clientes (em paralelo):
1. **validator** — task: `verify-fill.md`
   - Gate FAIL → `status[slug] = FAILED_VERIFY`; excluído da publicação
2. **redator** — task: `generate-report.md`
   - Recebe `ctx_cliente[slug]` passado do Estágio 1 (sem releitura Drive — ADR-08)
   - Usa `dict_alertas[slug]` para alertas de contexto
3. **validator** — task: `validate-report.md`
   - Gate FAIL 1ª vez → redator regenera (1 retry por cliente)
   - Gate FAIL 2ª vez → `status[slug] = FAILED_REPORT`; excluído da publicação

Lotes sequenciais até esgotar candidatos.
Falha por cliente: isolada; demais lotes continuam normalmente.

**Projeção de lotes:**
- `todos vinicius` (19 clientes) = 4 lotes (5+5+5+4)
- `todos gustavo` (11 clientes) = 3 lotes (5+5+1)
- `todos` (28 clientes) = 6 lotes (5+5+5+5+5+3)
- Modo 3 (lista mista): calculado dinamicamente

---

### ESTÁGIO 4 — PUBLICAÇÃO (serializado — arquivos compartilhados)

**Agentes:** `publicador` + `coletor`
**Tasks:** `publish-timeline.md` + `save-history.md`

Candidatos: clientes com `status = APPROVED`.

Para cada cliente aprovado, em sequência:

1. **GUARD de idempotência:** verificar `data/timeline-log.jsonl`
   - Se `slug + período` já publicado → `status[slug] = ALREADY_PUBLISHED`; SKIP silencioso
   - Protege contra duplicação de clientes compartilhados (Dr. Laureano, Dra. Nicolli)

2. **publicador** — task: `publish-timeline.md`
   - Recebe `ctx_cliente[slug]` do Estágio 1 (headline personalizada — sem releitura)
   - `create_timeline_event` → append em `data/timeline-log.jsonl`
   - Falha → registrar no resumo; demais clientes continuam

3. **coletor** — task: `save-history.md`
   - Append em `data/historico-clientes.yaml`
   - Falha → aviso no log; pipeline continua

Serialização obrigatória: escritas concorrentes corrompem `timeline-log.jsonl`.

---

### ESTÁGIO 5 — WRAP-UP (paralelo — recursos isolados por cliente)

**Agentes:** `whatsapp-writer` + `clickup-writer` + `contexto-cliente`

Para todos os clientes concluídos, em paralelo:

- **whatsapp-writer**: formatação em memória (isolada por cliente)
- **clickup-writer**: `task_id` isolado por cliente
  - `clickup_status_list_id: null` → aviso; pular ClickUp para este cliente
- **contexto-cliente** ATUALIZAÇÃO: doc Drive isolado por cliente (não-bloqueante)

Falhas no Estágio 5 **nunca** bloqueiam o pipeline.

---

### RESUMO FINAL CONSOLIDADO (Modos 2 e 3)

```
PIPELINE MULTI-CLIENTE CONCLUÍDO — [DD/MM/AAAA] a [DD/MM/AAAA]
═════════════════════════════════════════════════════════════════
MODO: [todos vinicius | todos gustavo | lista mista] | [N]/[TOTAL] publicados | Tempo: ~X min

╔══════════════════════════════════╦══════════╦════════════════════════════╗
║ Cliente                          ║ Sheets   ║ Publicação                 ║
╠══════════════════════════════════╬══════════╬════════════════════════════╣
║ IMCP                             ║ ✅       ║ ✅ ID: 123456              ║
║ Dr. Leandro Gontijio             ║ ✅       ║ ✅ ID: 123457              ║
║ [cliente com erro]               ║ ❌       ║ ❌ FAILED_REPORT           ║
╚══════════════════════════════════╩══════════╩════════════════════════════╝

PLANILHA: [N] clientes × 5 colunas preenchidos ✅

MENSAGENS WHATSAPP:
───────────────────────────────────────────────────────────────
[CLIENTE 1] — pessoal
[mensagem formatada]
───────────────────────────────────────────────────────────────
[CLIENTE 2] — Dr. Leandro
[mensagem formatada]

ERROS (se houver):
  • [CLIENTE] — [estágio] — [motivo detalhado]
═════════════════════════════════════════════════════════════════
```

**Status por cliente (contrato):**

| Status | Significado |
|--------|-------------|
| `APPROVED` | Publicado + wrap-up completo |
| `FAILED_FETCH` | Excluído de todos os estágios seguintes |
| `FAILED_VERIFY` | Excluído da publicação; wrap-up parcial (sem WhatsApp) |
| `FAILED_REPORT` | Excluído da publicação; wrap-up parcial (sem WhatsApp) |
| `FAILED_PUBLISH` | Relatório gerado mas não publicado; WhatsApp gerado (sem link) |
| `SHEETS_ERROR` | Sheets falhou mas geração/publicação continuaram |
| `ALREADY_PUBLISHED` | Guard ativado; duplicação evitada |

---

## Tabela de comportamentos de falha por fase

| Fase | Situação de falha | Comportamento |
|------|------------------|---------------|
| 1 MCP Meta Ads offline | Continuar com fallback Reportei; metricas_coletadas parcial |
| 1 gate_alertas FAIL | Exibir alertas problemáticos; perguntar se quer continuar |
| 2 Aba Sheets não existe | STOP — erro claro; não criar aba automaticamente |
| 2 gate_sheets FAIL | STOP; aguardar correção do gestor |
| 3 MCP Reportei offline | Continuar sem dados extras; texto apenas com métricas base |
| 3 gate_reportei FAIL 1ª | Regenerar com redator (tentativa 2/2) |
| 3 gate_reportei FAIL 2ª | STOP; aguardar ação do gestor |
| 4 MCP Reportei offline | Marcar FASE 4 como SKIPPED; continuar FASE 5 |
| 5 MCP ClickUp offline | Marcar FASE 5 como SKIPPED; continuar FASE 6 |
| 5 Subpágina não encontrada | STOP FASE 5; notificar gestor; continuar FASE 6 |
| 6 qualquer falha | Aviso no resumo final; nunca bloqueia |
