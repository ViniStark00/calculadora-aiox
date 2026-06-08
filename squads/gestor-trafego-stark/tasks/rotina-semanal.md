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

## PRÉ-EXECUÇÃO: Resolução do cliente

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

### Orquestração em lotes (C1)
O `alerta-monitor` processa clientes em lotes paralelos:
- Tamanho do lote: `pipeline.lote_paralelo` em `config/settings.yaml` (padrão: 3)
- Cada lote processa todos os seus clientes EM PARALELO
- Próximo lote só inicia após o lote atual terminar completamente
- Rate limit global compartilhado entre clientes do mesmo lote (ver `rate_limit_global` em alerta-monitor)

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

> **Serializada:** FASE 2 processa um cliente por vez — sem paralelismo.

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

### Orquestração em lotes (modo bulk — C1)
Quando `*rotina-semanal` processa múltiplos clientes simultaneamente:
- Tamanho do lote: `pipeline.lote_paralelo` em `config/settings.yaml` (padrão: 3)
- FASE 3 executa em lotes de `lote_paralelo` em paralelo
- Cada lote aguarda o anterior finalizar antes de prosseguir
- FASE 2 (Sheets) permanece serializada — não é afetada por este modo

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
- Persistir métricas da semana em `data/historico-metricas.jsonl` (uma linha JSON por cliente)
- Idempotente: rodar duas vezes na mesma semana não duplica entradas
- Nunca bloqueia; se save-history falhar, emitir aviso no resumo final e continuar

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
