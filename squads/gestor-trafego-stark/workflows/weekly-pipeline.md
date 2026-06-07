# weekly-pipeline â€” Fluxo Semanal do Squad gestor-trafego-stark

> Documento de referÃªncia macro â€” nÃ£o Ã© um arquivo executÃ¡vel.
> A lÃ³gica executÃ¡vel estÃ¡ em `tasks/rotina-semanal.md`.

---

## Diagrama de fluxo

```
gestor invoca *rotina-semanal [cliente]
â”‚
â”œâ”€â”€ stark-chief resolve cliente (data/clientes.yaml)
â”‚   â””â”€â”€ fuzzy match threshold 0.60
â”‚
â–¼
FASE 1 â€” MONITORAMENTO (sempre executa)
â”‚   alerta-monitor â†’ todas as contas ativas (28 clientes)
â”‚   â”œâ”€â”€ meta_ad_account_id preenchido â†’ Meta Ads MCP (last_3d + last_7d freq)
â”‚   â””â”€â”€ meta_ad_account_id null     â†’ Reportei MCP fallback (CPL apenas)
â”‚   excluir_meta_monitoring: true   â†’ skip (Dr. Laureano Filho)
â”‚
â”‚   Output: painel alertas ðŸ”´ðŸŸ¡â„¹ï¸âœ… + metricas_coletadas dict
â”‚
â”‚   validator â†’ gate_alertas
â”‚   PASS â†’ continuar â”‚ FAIL â†’ exibir + perguntar gestor
â”‚
â–¼
FASE 2 â€” PLANILHA SHEETS (sÃ³ se vinicius in gestores)
â”‚   coletor recebe metricas_coletadas da FASE 1 (ADR-04)
â”‚   â”œâ”€â”€ reusa meta_spend + conversas (sem nova chamada Meta Ads)
â”‚   â””â”€â”€ SEMPRE busca google_spend + seguidores via Reportei
â”‚   fill_sheets.py â†’ preenche colunas sheet_columns por cliente
â”‚
â”‚   validator â†’ gate_sheets
â”‚   PASS â†’ continuar â”‚ FAIL â†’ STOP (aguarda gestor)
â”‚
â–¼
FASE 3 â€” NARRATIVA DO RELATÃ“RIO
â”‚   contexto-cliente LEITURA (nÃ£o-bloqueante, timeout 10s)
â”‚   â””â”€â”€ Drive MCP â†’ "Contexto - {nome_cliente}" na pasta Contexto Clientes - Stark
â”‚
â”‚   redator â†’ narrativa HTML
â”‚   â”œâ”€â”€ classifica CPL por especialidade (thresholds-por-especialidade.yaml)
â”‚   â”œâ”€â”€ consulta histÃ³rico (historico-clientes.yaml)
â”‚   â””â”€â”€ dados extras via Reportei MCP
â”‚
â”‚   validator â†’ gate_reportei
â”‚   PASS â†’ â–¼ â”‚ FAIL 1Âª â†’ regenerar â”‚ FAIL 2Âª â†’ STOP
â”‚
â–¼                          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
FASE 4 â•‘ FASE 5 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â”‚                          â”‚
â–¼ FASE 4                   â–¼ FASE 5
publicador                 clickup-writer
â”œâ”€â”€ create_timeline_event  â”œâ”€â”€ resolver doc (Vinicius | Gustavo)
â”œâ”€â”€ timeline-log.jsonl     â”œâ”€â”€ reconstituir aÃ§Ãµes (4 fontes)
â””â”€â”€ aciona whatsapp-writer â”œâ”€â”€ draft â†’ aprovaÃ§Ã£o gestor (OBRIGATÃ“RIO)
                           â”œâ”€â”€ append subpÃ¡gina cliente
    whatsapp-writer        â””â”€â”€ validator â†’ gate_clickup
    â””â”€â”€ mensagem WhatsApp
â”‚                          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â”‚
           â–¼
FASE 6 â€” WRAP-UP (nÃ£o-bloqueante, paralelo)
â”œâ”€â”€ coletor â†’ save-history (historico-clientes.yaml)
â”œâ”€â”€ contexto-cliente ATUALIZAÃ‡ÃƒO (Drive â€” aprendizados da semana)
â””â”€â”€ task-monitor â†’ marcar tasks concluÃ­das no ClickUp

           â”‚
           â–¼
stark-chief â†’ RESUMO FINAL (status por fase + mensagem WhatsApp)
```

---

## Handoffs entre fases

| De | Para | Dado transferido |
|----|------|-----------------|
| FASE 1 â†’ FASE 2 | alerta-monitor â†’ coletor | `metricas_coletadas` dict (ADR-04) |
| FASE 1 â†’ stark-chief | alerta-monitor â†’ usuÃ¡rio | painel de alertas |
| FASE 2 â†’ FASE 3 | coletor â†’ redator | mÃ©tricas preenchidas |
| FASE 3 â†’ FASE 3 | contexto-cliente â†’ redator | objeto `contexto_cliente` |
| FASE 3 â†’ FASE 4 | redator â†’ publicador | texto HTML aprovado |
| FASE 4 â†’ FASE 4 | publicador â†’ whatsapp-writer | dados do relatÃ³rio publicado |
| FASE 4 â†’ stark-chief | publicador | timeline_event_id + link |
| FASE 4 â†’ stark-chief | whatsapp-writer | mensagem_whatsapp |
| FASE 5 â†’ stark-chief | clickup-writer | doc_page_id + confirmacao_append |

---

## MCP por fase

| Fase | MCP | Uso |
|------|-----|-----|
| 1 | Meta Ads `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` | MÃ©tricas por conta (CPM/CTR/freq/CPL) |
| 1 | Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | Fallback quando meta_ad_account_id null |
| 2 | Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | MÃ©tricas semanais por projeto |
| 3 | Google Drive `mcp__92a31705-b51e-422b-abc2-e6cb82a79330` | Leitura contexto cliente |
| 3 | Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | Dados extras (CPC, cliques, PoP) |
| 4 | Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | create_timeline_event |
| 5 | ClickUp `mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf` | Docs, subpÃ¡ginas, tarefas |
| 5 | Meta Ads `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` | Sinais de entidades e anomalias |
| 6 | Google Drive `mcp__92a31705-b51e-422b-abc2-e6cb82a79330` | AtualizaÃ§Ã£o contexto cliente |
| 6 | ClickUp `mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf` | Marcar tasks concluÃ­das |

---

## DecisÃµes arquiteturais (ADRs relevantes)

| ADR | DecisÃ£o |
|-----|---------|
| ADR-01 | `gestores` Ã© array â€” clientes compartilhados tÃªm uma entrada, nÃ£o duas |
| ADR-04 | `metricas_coletadas` passa da FASE 1 para FASE 2 â€” sem chamada dupla Ã  API |
| ADR-05 | FASE 4 e FASE 5 executam em paralelo â€” nenhuma bloqueia a outra |
| ADR-06 | Thresholds conservadores quando duas especialidades colidem |
| ADR-07 | Dr. Laureano Filho: CPL = Google Ads, excluir_meta_monitoring: true |

