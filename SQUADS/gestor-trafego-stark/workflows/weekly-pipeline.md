# weekly-pipeline — Fluxo Semanal do Squad gestor-trafego-stark

> Documento de referência macro — não é um arquivo executável.
> A lógica executável está em `tasks/rotina-semanal.md`.

---

## Diagrama de fluxo

```
gestor invoca *rotina-semanal [cliente]
│
├── stark-chief resolve cliente (data/clientes.yaml)
│   └── fuzzy match threshold 0.60
│
▼
FASE 1 — MONITORAMENTO (sempre executa)
│   alerta-monitor → todas as contas ativas (28 clientes)
│   ├── meta_ad_account_id preenchido → Meta Ads MCP (last_3d + last_7d freq)
│   └── meta_ad_account_id null     → Reportei MCP fallback (CPL apenas)
│   excluir_meta_monitoring: true   → skip (Dr. Laureano Filho)
│
│   Output: painel alertas 🔴🟡ℹ️✅ + metricas_coletadas dict
│
│   validator → gate_alertas
│   PASS → continuar │ FAIL → exibir + perguntar gestor
│
▼
FASE 2 — PLANILHA SHEETS (só se vinicius in gestores)
│   coletor recebe metricas_coletadas da FASE 1 (ADR-04)
│   ├── reusa meta_spend + conversas (sem nova chamada Meta Ads)
│   └── SEMPRE busca google_spend + seguidores via Reportei
│   fill_sheets.py → preenche colunas sheet_columns por cliente
│
│   validator → gate_sheets
│   PASS → continuar │ FAIL → STOP (aguarda gestor)
│
▼
FASE 3 — NARRATIVA DO RELATÓRIO
│   contexto-cliente LEITURA (não-bloqueante, timeout 10s)
│   └── Drive MCP → "Contexto - {nome_cliente}" na pasta Contexto Clientes - Stark
│
│   redator → narrativa HTML
│   ├── classifica CPL por especialidade (thresholds-por-especialidade.yaml)
│   ├── consulta histórico (historico-clientes.yaml)
│   └── dados extras via Reportei MCP
│
│   validator → gate_reportei
│   PASS → ▼ │ FAIL 1ª → regenerar │ FAIL 2ª → STOP
│
▼                          ┌─────────────────────────────┐
FASE 4 ║ FASE 5 ──────────────────────────────────────────
│                          │
▼ FASE 4                   ▼ FASE 5
publicador                 clickup-writer
├── create_timeline_event  ├── resolver doc (Vinicius | Gustavo)
├── timeline-log.jsonl     ├── reconstituir ações (4 fontes)
└── aciona whatsapp-writer ├── draft → aprovação gestor (OBRIGATÓRIO)
                           ├── append subpágina cliente
    whatsapp-writer        └── validator → gate_clickup
    └── mensagem WhatsApp
│                          │
└──────────┬───────────────┘
           │
           ▼
FASE 6 — WRAP-UP (não-bloqueante, paralelo)
├── coletor → save-history (historico-clientes.yaml)
├── contexto-cliente ATUALIZAÇÃO (Drive — aprendizados da semana)
└── task-monitor → marcar tasks concluídas no ClickUp

           │
           ▼
stark-chief → RESUMO FINAL (status por fase + mensagem WhatsApp)
```

---

## Diagrama — Modo Paralelo (Modos 2 e 3)

> Ativo quando trigger é `todos {gestor}` (Modo 2) ou lista de múltiplos nomes (Modo 3).
> Modo 1 (1 cliente) usa o diagrama sequencial acima.

```
INPUT: "todos vinicius" | "todos gustavo" | "{nome1}, {nome2}, ..."
│
├── MODO 2: gestor_solicitado = trim(trigger após "todos ").lower()
│           clientes = [c if gestor_solicitado in c.gestores AND c.ativo]
│           Vazio → erro claro com nome do gestor solicitado
│
└── MODO 3: resolver cada nome individualmente (fuzzy 0.60, ativo: true)

período único: segunda → domingo da semana anterior (igual para todos os N clientes)

───────────────────────────────────────────────────────────────────
ESTÁGIO 1 — COLETA  (sequencial rate-limited, 0.6s entre chamadas)
───────────────────────────────────────────────────────────────────
Para cada cliente:
│   alerta-monitor → dict_alertas[slug]
│   ├── excluir_meta_monitoring: true → skip Meta (Dr. Laureano Filho)
│   └── meta_ad_account_id: null     → fallback Reportei (CPL apenas)
│
│   coletor (fetch-metrics) → dict_resultados[slug]
│   └── reusa CPL do alerta-monitor (ADR-04) — sem chamada dupla ao Meta
│
│   contexto-cliente LEITURA (Drive em paralelo/batched)
│   └── ctx_cliente[slug] → pass-through para Estágios 3 e 4 (ADR-08)
│       Falha Drive → ctx_cliente[slug] = {} + aviso; continua
│
│   Falha por cliente → status[slug] = FAILED_FETCH; demais continuam

───────────────────────────────────────────────────────────────────
ESTÁGIO 2 — SHEETS  (serializado — TODOS, sem condicional por gestor)
───────────────────────────────────────────────────────────────────
│   fill_sheets.py --batch dict_resultados.json  (ADR-09)
│   ├── Cada cliente → bloco do seu gestor na planilha (via slug)
│   ├── Falha parcial → registra + continua
│   └── Falha total (0 escritas) → PAUSA + confirmação gestor

───────────────────────────────────────────────────────────────────
ESTÁGIO 3 — GERAÇÃO  (lotes de 5 em paralelo — ADR-05)
───────────────────────────────────────────────────────────────────
│   Candidatos: status != FAILED_FETCH
│
│   [lote de 5 em paralelo]
│   ├── validator (verify-fill) → FAIL → FAILED_VERIFY
│   ├── redator (generate-report)
│   │   └── recebe ctx_cliente[slug] do Estágio 1 (ADR-08 — sem releitura Drive)
│   └── validator (validate-report)
│       ├── FAIL 1ª → redator regenera (1 retry)
│       └── FAIL 2ª → FAILED_REPORT
│
│   Falha por cliente: isolada; demais lotes continuam

───────────────────────────────────────────────────────────────────
ESTÁGIO 4 — PUBLICAÇÃO  (serializado — guard de idempotência)
───────────────────────────────────────────────────────────────────
│   Candidatos: status = APPROVED
│
│   Para cada cliente (em sequência):
│   ├── GUARD: timeline-log.jsonl → slug+período já publicado → SKIP (ALREADY_PUBLISHED)
│   │   Protege Dr. Laureano e Dra. Nicolli (clientes compartilhados)
│   ├── publicador (publish-timeline) → create_timeline_event → append timeline-log.jsonl
│   └── coletor (save-history) → append historico-clientes.yaml
│
│   Serialização obrigatória: escritas concorrentes corrompem timeline-log.jsonl

───────────────────────────────────────────────────────────────────
ESTÁGIO 5 — WRAP-UP  (paralelo — recursos isolados por cliente)
───────────────────────────────────────────────────────────────────
│   Para todos os clientes concluídos, em paralelo:
│   ├── whatsapp-writer (formatação em memória — isolada por cliente)
│   ├── clickup-writer (task_id isolado — condicional: clickup_status_list_id != null)
│   └── contexto-cliente ATUALIZAÇÃO (Drive isolado por cliente — não-bloqueante)
│
│   Falhas no Estágio 5 nunca bloqueiam o pipeline

           │
           ▼
stark-chief → RESUMO FINAL CONSOLIDADO
  ├── Tabela: N clientes × [Sheets ✅/❌ | Publicação ✅/❌ ID]
  ├── Mensagens WhatsApp agrupadas por cliente
  └── Erros detalhados por estágio
```

---

## Handoffs entre fases

| De | Para | Dado transferido |
|----|------|-----------------|
| FASE 1 → FASE 2 | alerta-monitor → coletor | `metricas_coletadas` dict (ADR-04) |
| FASE 1 → stark-chief | alerta-monitor → usuário | painel de alertas |
| FASE 2 → FASE 3 | coletor → redator | métricas preenchidas |
| FASE 3 → FASE 3 | contexto-cliente → redator | objeto `contexto_cliente` |
| FASE 3 → FASE 4 | redator → publicador | texto HTML aprovado |
| FASE 4 → FASE 4 | publicador → whatsapp-writer | dados do relatório publicado |
| FASE 4 → stark-chief | publicador | timeline_event_id + link |
| FASE 4 → stark-chief | whatsapp-writer | mensagem_whatsapp |
| FASE 5 → stark-chief | clickup-writer | doc_page_id + confirmacao_append |

---

## MCP por fase

| Fase | MCP | Uso |
|------|-----|-----|
| 1 | Meta Ads `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` | Métricas por conta (CPM/CTR/freq/CPL) |
| 1 | Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | Fallback quando meta_ad_account_id null |
| 2 | Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | Métricas semanais por projeto |
| 3 | Google Drive `mcp__92a31705-b51e-422b-abc2-e6cb82a79330` | Leitura contexto cliente |
| 3 | Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | Dados extras (CPC, cliques, PoP) |
| 4 | Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | create_timeline_event |
| 5 | ClickUp `mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf` | Docs, subpáginas, tarefas |
| 5 | Meta Ads `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` | Sinais de entidades e anomalias |
| 6 | Google Drive `mcp__92a31705-b51e-422b-abc2-e6cb82a79330` | Atualização contexto cliente |
| 6 | ClickUp `mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf` | Marcar tasks concluídas |

---

## Decisões arquiteturais (ADRs relevantes)

| ADR | Decisão |
|-----|---------|
| ADR-01 | `gestores` é array — clientes compartilhados têm uma entrada, não duas |
| ADR-04 | `metricas_coletadas` passa da FASE 1 para FASE 2 — sem chamada dupla à API |
| ADR-05 (Modo 1) | FASE 4 e FASE 5 executam em paralelo — nenhuma bloqueia a outra |
| ADR-05 (Modos 2/3) | Batch size = 5 no Estágio 3 — 40% menos lotes vs. batch 3, margem segura (~13k tokens/lote) |
| ADR-06 | Falha isolada por cliente em todos os estágios — pipeline nunca para por falha individual |
| ADR-06-threshold | Thresholds conservadores quando duas especialidades colidem |
| ADR-07 | Dr. Laureano Filho: CPL = Google Ads, excluir_meta_monitoring: true |
| ADR-08 | `ctx_cliente` lido UMA vez no Estágio 1 e passado como parâmetro — sem releitura Drive |
| ADR-09 | `fill_sheets.py` recebe batch JSON único com TODOS os clientes da rodada |
