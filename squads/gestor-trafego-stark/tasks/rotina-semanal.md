---
task: rotina-semanal
agent: stark-chief
squad: gestor-trafego-stark
elicit: false
inputs:
  - cliente: nome, slug do cliente OU nome do gestor (resolvido pelo stark-chief de data/clientes.yaml)
  - gestor: vinicius | gustavo | thiago | wallison | andreyves | richard | luiz | mateus (inferido do input ou do campo gestores do cliente)
outputs:
  - resumo_final: status completo das 6 fases (COMPLETED | PARTIAL | FAILED por fase)
---

# Task: rotina-semanal â€” Pipeline Completo Semanal (6 Fases)

<<<<<<< HEAD
**AtivaÃ§Ã£o por comando `*rotina-semanal [cliente]`:** pipeline completo com 6 fases ordenadas, handoffs entre agentes e gates de qualidade. Arquivo mais importante do squad.

---

## PRÃ‰-EXECUÃ‡ÃƒO: ResoluÃ§Ã£o do cliente
=======
**Ativação por comando `*rotina-semanal [cliente ou gestor]`:** pipeline completo com 6 fases ordenadas, handoffs entre agentes e gates de qualidade. Arquivo mais importante do squad.

---

## PRÉ-EXECUÇÃO: Resolução do input
>>>>>>> main

### Modo 1 — Input é nome de gestor (modo batch)

Gestores válidos: `vinicius`, `gustavo`, `thiago`, `wallison`, `andreyves`, `richard`, `luiz`, `mateus`

Se o input bater exatamente com um desses nomes (case-insensitive):
1. Filtrar `data/clientes.yaml` → todos os clientes onde `[gestor] in gestores AND ativo: true`
2. Exibir lista ao gestor:
   ```
   🗂 Modo batch — [N] clientes encontrados para [gestor]:
   1. [nome-cliente-1]
   2. [nome-cliente-2]
   ...
   Confirmar? (s/n)
   ```
3. Aguardar confirmação antes de iniciar
4. Rodar o pipeline completo para cada cliente **em lotes** (tamanho: `pipeline.lote_paralelo` em `config/settings.yaml`, padrão: 3)
5. FASE 2 (Sheets) permanece serializada mesmo em batch — um cliente por vez

### Modo 2 — Input é nome ou slug de cliente (modo individual)

1. **Exact match** por `nome` em `data/clientes.yaml`
2. **Exact match** por `slug` em `data/clientes.yaml`
3. **Fuzzy match** (threshold 0.60) pelo `nome` â€” aceitar se score â‰¥ 0.60
4. Se nenhum: listar todos os slugs e pedir confirmaÃ§Ã£o

Determinar `gestor` do cliente:
<<<<<<< HEAD
- `gestores: [vinicius]` â†’ apenas fases Vinicius (inclui FASE 2)
- `gestores: [gustavo]` â†’ FASE 2 pulada
- `gestores: [vinicius, gustavo]` â†’ perguntar "Para qual gestor rodar a rotina semanal?"
=======
- `gestores: [X]` → rodar pipeline completo (todas as 6 fases)
- `gestores: [X, Y]` → perguntar "Para qual gestor rodar a rotina semanal?"
>>>>>>> main

---

## FASE 1 â€” MONITORAMENTO (obrigatÃ³ria)

**Agente:** `alerta-monitor`
**Task:** `tasks/monitorar-contas.md`

### AÃ§Ã£o
Monitorar TODAS as contas ativas â€” nÃ£o apenas o cliente solicitado.
O monitoramento Ã© sempre global (carteira completa, ambos os gestores).

<<<<<<< HEAD
### Handoff de saÃ­da
=======
### Orquestração em lotes (C1)
O `alerta-monitor` processa clientes em lotes paralelos:
- Tamanho do lote: `pipeline.lote_paralelo` em `config/settings.yaml` (padrão: 3)
- Cada lote processa todos os seus clientes EM PARALELO
- Próximo lote só inicia após o lote atual terminar completamente
- Rate limit global compartilhado entre clientes do mesmo lote (ver `rate_limit_global` em alerta-monitor)

### Handoff de saída
>>>>>>> main
```yaml
alertas_ativos: list[alerta]    # ðŸ”´ðŸŸ¡â„¹ï¸ gerados
metricas_coletadas: dict        # keyed por slug â€” para reuso na FASE 2
```

### Gate: gate_alertas
**Acionado por:** validator
**Resultado PASS:** exibir alertas ao gestor + avanÃ§ar para FASE 2
**Resultado FAIL:** exibir alertas com problema + perguntar ao gestor: "Deseja continuar mesmo com gate_alertas FAIL?"

### Comportamento se MCP indisponÃ­vel
- Meta Ads MCP offline â†’ usar Reportei como fallback (metricas_coletadas com fonte: reportei_fallback)
- Continuar sem bloquear o pipeline
- FASE 2 usarÃ¡ metricas_coletadas mesmo que parcial

---

<<<<<<< HEAD
## FASE 2 â€” PLANILHA GOOGLE SHEETS (condicional: sÃ³ clientes Vinicius)

**CondiÃ§Ã£o:** `vinicius in cliente.gestores`
**Se cliente sÃ³ de Gustavo:** PULAR FASE 2 completamente â€” avanÃ§ar para FASE 3
=======
## FASE 2 — PLANILHA GOOGLE SHEETS (obrigatória para todos os gestores)

> **Serializada:** FASE 2 processa um cliente por vez — sem paralelismo.
>>>>>>> main

**Agente:** `coletor`
**Tasks:** `tasks/fetch-metrics.md` + `tasks/verify-fill.md`

### Handoff recebido da FASE 1
```yaml
metricas_coletadas: dict  # reutilizar dados Meta Ads sem nova chamada Ã  API (ADR-04)
```

### AÃ§Ã£o
1. Receber `metricas_coletadas` â€” usar `meta_spend` e `conversas` de clientes com `fonte: meta_ads`
2. SEMPRE buscar `google_spend` e `seguidores` via Reportei (nÃ£o disponÃ­veis no metricas_coletadas)
3. Preencher Google Sheets via `fill_sheets.py` com colunas de `sheet_columns` de cada cliente

### Gate: gate_sheets
**Acionado por:** validator
**Resultado PASS:** avanÃ§ar para FASE 3
**Resultado FAIL:** PARAR â€” exibir motivos ao gestor â€” nÃ£o avanÃ§ar sem confirmaÃ§Ã£o explÃ­cita

---

## FASE 3 â€” NARRATIVA DO RELATÃ“RIO (obrigatÃ³ria)

<<<<<<< HEAD
**Agentes:** `contexto-cliente` (nÃ£o-bloqueante) â†’ `redator` â†’ `validator`
=======
### Orquestração em lotes (modo bulk — C1)
Quando `*rotina-semanal` processa múltiplos clientes simultaneamente:
- Tamanho do lote: `pipeline.lote_paralelo` em `config/settings.yaml` (padrão: 3)
- FASE 3 executa em lotes de `lote_paralelo` em paralelo
- Cada lote aguarda o anterior finalizar antes de prosseguir
- FASE 2 (Sheets) permanece serializada — não é afetada por este modo

**Agentes:** `contexto-cliente` (não-bloqueante) → `redator` → `validator`
>>>>>>> main
**Tasks:** `tasks/generate-report.md` + `tasks/validate-report.md`

### Sub-passo 3.1 â€” Leitura do contexto do cliente (nÃ£o-bloqueante)

**Agente:** `contexto-cliente` (comando: `carregar-contexto`)
- Buscar `"Contexto - {nome_cliente}"` na pasta `"Contexto Clientes - Stark"` no Google Drive
- Retornar objeto `contexto_cliente` (disponivel: true | false)
- Timeout de 10s â†’ tratar como Drive indisponÃ­vel â†’ `disponivel: false` â†’ continuar
- Nunca bloqueia o pipeline em nenhuma circunstÃ¢ncia

### Sub-passo 3.2 â€” GeraÃ§Ã£o da narrativa

**Agente:** `redator`
<<<<<<< HEAD
- Receber mÃ©tricas (FASE 2 ou direto do Reportei se FASE 2 pulada)
=======
- Receber métricas da FASE 2 (Google Sheets já preenchido)
>>>>>>> main
- Receber `contexto_cliente` (pode ser `disponivel: false`)
- Classificar CPL por especialidade (thresholds-por-especialidade.yaml)
- Consultar histÃ³rico (data/historico-clientes.yaml)
- Buscar dados extras via MCP Reportei
- Gerar narrativa HTML completa

### Gate: gate_reportei
**Acionado por:** validator
**Resultado PASS â€” 1Âª tentativa:** avanÃ§ar para FASE 4âˆ¥5
**Resultado FAIL â€” 1Âª vez:** retornar ao redator para regeneraÃ§Ã£o (tentativa 2/2)
**Resultado FAIL â€” 2Âª vez:** PARAR â€” aguardar aÃ§Ã£o do gestor

---

## FASE 4 â€” PUBLICAÃ‡ÃƒO REPORTEI + WHATSAPP (paralela com FASE 5)

> FASE 4 e FASE 5 executam em paralelo â€” uma nÃ£o bloqueia a outra.

**Agentes:** `publicador` â†’ `whatsapp-writer`
**Tasks:** `tasks/publish-timeline.md`

### AÃ§Ã£o
1. `publicador`: publicar marco na Timeline do Reportei via MCP
2. `publicador`: verificar deduplicaÃ§Ã£o (timeline-log.jsonl)
3. `publicador`: acionar `whatsapp-writer` com dados do relatÃ³rio

### Handoff de saÃ­da
```yaml
timeline_event_id: str
link_relatorio: "https://app.reportei.com/projects/{project_id}"
mensagem_whatsapp: str
```

### Comportamento se MCP indisponÃ­vel
- Reportei MCP offline â†’ marcar FASE 4 como SKIPPED
- Continuar FASE 5 independentemente

---

## FASE 5 â€” STATUS REPORT CLICKUP (paralela com FASE 4)

> FASE 4 e FASE 5 executam em paralelo â€” uma nÃ£o bloqueia a outra.

**Agente:** `clickup-writer`
**Task:** `tasks/preencher-clickup.md`

### AÃ§Ã£o
1. Resolver doc de destino (Vinicius ou Gustavo) baseado no gestor do cliente
2. Localizar subpÃ¡gina do cliente no ClickUp
3. Reconstituir aÃ§Ãµes da semana (4 fontes: Meta Ads, Reportei, Gmail, ClickUp)
4. Gerar draft e apresentar ao gestor para aprovaÃ§Ã£o (OBRIGATÃ“RIO)
5. Aguardar aprovaÃ§Ã£o explÃ­cita antes de escrever
6. Appendar bloco semanal na subpÃ¡gina

### Gate: gate_clickup
**Acionado por:** validator
**Resultado PASS:** avanÃ§ar para FASE 6
**Resultado FAIL:** retornar ao clickup-writer com itens com problema

### Comportamento se MCP indisponÃ­vel
- ClickUp MCP offline â†’ marcar FASE 5 como SKIPPED
- Continuar FASE 6 independentemente

---

## FASE 6 â€” WRAP-UP (paralelo, nÃ£o-bloqueante)

> Todas as aÃ§Ãµes desta fase sÃ£o nÃ£o-bloqueantes â€” qualquer falha emite aviso e nÃ£o interrompe.

**Agentes:** `coletor` + `contexto-cliente` + `task-monitor`

### Sub-passo 6.1 â€” Salvar histÃ³rico de mÃ©tricas

**Agente:** `coletor`
**Task:** `tasks/save-history.md`
<<<<<<< HEAD
- Persistir mÃ©tricas da semana em `data/historico-clientes.yaml`
- Nunca bloqueia; falha emite aviso e continua
=======
- Persistir métricas da semana em `data/historico-metricas.jsonl` (uma linha JSON por cliente)
- Idempotente: rodar duas vezes na mesma semana não duplica entradas
- Nunca bloqueia; se save-history falhar, emitir aviso no resumo final e continuar
>>>>>>> main

### Sub-passo 6.2 â€” Atualizar contexto do cliente no Drive

**Agente:** `contexto-cliente` (comando: `atualizar-contexto`)
- Gerar 2â€“4 observaÃ§Ãµes objetivas baseadas nos dados da semana
- Inserir nova entrada no topo da seÃ§Ã£o `## aprendizados` do documento
- Manter apenas as Ãºltimas 8 entradas
- Nunca bloqueia; falha emite `âš ï¸ Contexto nÃ£o atualizado esta semana`

### Sub-passo 6.3 â€” Marcar tarefas concluÃ­das no ClickUp

**Agente:** `task-monitor`
- Verificar tasks do cliente no ClickUp relacionadas ao relatÃ³rio
- Marcar como concluÃ­das se evidÃªncia digital confirmada via MCP
- Nunca bloqueia; falha emite aviso silencioso

---

## RESUMO FINAL

Ao concluir todas as fases, exibir:

```
<<<<<<< HEAD
ROTINA SEMANAL â€” [CLIENTE] â€” [DD/MM] a [DD/MM/AAAA]
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
âœ… FASE 1 â€” Monitoramento       COMPLETED Â· N alertas (XðŸ”´ YðŸŸ¡ Zâœ…)
âœ… FASE 2 â€” Sheets               COMPLETED | SKIPPED (Gustavo-only)
âœ… FASE 3 â€” RelatÃ³rio            COMPLETED
âœ… FASE 4 â€” PublicaÃ§Ã£o Reportei  COMPLETED Â· event_id: XXXXX
âœ… FASE 5 â€” Status ClickUp       COMPLETED | AWAITING_APPROVAL | SKIPPED
âœ… FASE 6 â€” Wrap-up              COMPLETED Â· contexto: âœ… | histÃ³rico: âœ… | tasks: âœ…
=======
ROTINA SEMANAL — [CLIENTE] — [DD/MM] a [DD/MM/AAAA]
════════════════════════════════════════════════════
✅ FASE 1 — Monitoramento       COMPLETED · N alertas (X🔴 Y🟡 Z✅)
✅ FASE 2 — Sheets               COMPLETED
✅ FASE 3 — Relatório            COMPLETED
✅ FASE 4 — Publicação Reportei  COMPLETED · event_id: XXXXX
✅ FASE 5 — Status ClickUp       COMPLETED | AWAITING_APPROVAL | SKIPPED
✅ FASE 6 — Wrap-up              COMPLETED · contexto: ✅ | histórico: ✅ | tasks: ✅
>>>>>>> main

Status geral: COMPLETED | PARTIAL (listar fases com problema)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
MENSAGEM WHATSAPP â€” [CLIENTE]
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
ðŸ“‹ Copie a mensagem acima e envie ao cliente via WhatsApp.
```

---

## Tabela de comportamentos de falha por fase

| Fase | SituaÃ§Ã£o de falha | Comportamento |
|------|------------------|---------------|
| 1 MCP Meta Ads offline | Continuar com fallback Reportei; metricas_coletadas parcial |
| 1 gate_alertas FAIL | Exibir alertas problemÃ¡ticos; perguntar se quer continuar |
| 2 Aba Sheets nÃ£o existe | STOP â€” erro claro; nÃ£o criar aba automaticamente |
| 2 gate_sheets FAIL | STOP; aguardar correÃ§Ã£o do gestor |
| 3 MCP Reportei offline | Continuar sem dados extras; texto apenas com mÃ©tricas base |
| 3 gate_reportei FAIL 1Âª | Regenerar com redator (tentativa 2/2) |
| 3 gate_reportei FAIL 2Âª | STOP; aguardar aÃ§Ã£o do gestor |
| 4 MCP Reportei offline | Marcar FASE 4 como SKIPPED; continuar FASE 5 |
| 5 MCP ClickUp offline | Marcar FASE 5 como SKIPPED; continuar FASE 6 |
| 5 SubpÃ¡gina nÃ£o encontrada | STOP FASE 5; notificar gestor; continuar FASE 6 |
| 6 qualquer falha | Aviso no resumo final; nunca bloqueia |

