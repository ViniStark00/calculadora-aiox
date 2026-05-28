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
| ADR-05 | FASE 4 e FASE 5 executam em paralelo — nenhuma bloqueia a outra |
| ADR-06 | Thresholds conservadores quando duas especialidades colidem |
| ADR-07 | Dr. Laureano Filho: CPL = Google Ads, excluir_meta_monitoring: true |
