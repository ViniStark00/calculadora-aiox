# gestor-trafego-stark

Squad unificado para gestores de tráfego pago Vinicius Lima e Gustavo Radler.

**28 clientes ativos | nicho saúde/medicina | Meta Ads + Google Ads + Reportei + Sheets + ClickUp**

---

## Comandos disponíveis

| Comando | Descrição | Gestor |
|---------|-----------|--------|
| `*rotina-semanal` | Pipeline completo: 6 fases — monitor, sheets, relatório, publicação, ClickUp, wrap-up | Ambos |
| `*rotina-diaria` | Alertas de métricas + inbox ClickUp | Ambos |
| `*planilha` | Coleta métricas e preenche Sheets para um cliente específico | Vinicius |
| `*relatorio-reportei` | Gera narrativa e publica marco no Reportei | Vinicius |
| `*status-report-clickup` | Draft de status report → aprovação → escrita no ClickUp | Ambos |
| `*monitorar-contas` | Monitora métricas de todas as contas ativas | Ambos |
| `*monitor-tarefas` | Lista inbox ClickUp por assignee, organizado por urgência | Ambos |

---

## Como usar

### Rotina semanal completa
```
*rotina-semanal [cliente] [semana]
# Exemplo: *rotina-semanal "IMCP" "12-18/05/2026"
# Se sem argumentos: solicita cliente e semana interativamente
```

### Rotina diária
```
*rotina-diaria [gestor]
# Exemplo: *rotina-diaria vinicius
# Executa: alertas de métricas + inbox ClickUp do gestor
```

### Monitoramento pontual
```
*monitorar-contas
# Monitora todas as contas ativas de ambos os gestores
# Output: painel de alertas classificados por severidade
```

### Status report ClickUp
```
*status-report-clickup [cliente]
# Apresenta draft para aprovação antes de escrever no ClickUp
```

---

## Arquitetura

```
stark-chief (Tier 0 — orquestrador)
├── alerta-monitor    (Tier 1 — monitoramento Meta Ads + Reportei)
├── coletor           (Tier 1 — métricas + Sheets, exclusivo Vinicius)
├── redator           (Tier 1 — narrativa Reportei)
├── publicador        (Tier 1 — publicação Timeline Reportei)
├── whatsapp-writer   (Tier 1 — mensagem WhatsApp)
├── contexto-cliente  (Tier 1 — contexto Drive)
├── clickup-writer    (Tier 1 — status report ClickUp)
├── task-monitor      (Tier 1 — inbox ClickUp)
└── validator         (Tier 2 — gates de qualidade)
    ├── gate_alertas  → checklists/alertas-gate.md
    ├── gate_sheets   → checklists/sheets-gate.md
    ├── gate_reportei → checklists/relatorio-gate.md
    └── gate_clickup  → checklists/clickup-gate.md
```

### Pipeline rotina-semanal (6 fases)

```
FASE 1 — MONITORAMENTO    alerta-monitor → gate_alertas → metricas_coletadas
FASE 2 — SHEETS           [Vinicius] coletor (reutiliza metricas_coletadas) → gate_sheets
FASE 3 — NARRATIVA        redator → gate_reportei (retry 1x)
FASE 4 — PUBLICAÇÃO       publicador + whatsapp-writer   ┐ em paralelo
FASE 5 — STATUS CLICKUP   clickup-writer → gate_clickup  ┘
FASE 6 — WRAP-UP          save-history + contexto-cliente + task-monitor (não-bloqueantes)
```

---

## Pré-requisitos

Antes do primeiro uso, confirme:

1. **Variáveis de ambiente configuradas:**
   - `REPORTEI_TOKEN` — bearer token da API Reportei v2
   - `SHEET_ID` — ID da planilha Google Sheets (bloco Vinicius)
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — path do arquivo de credenciais Google

2. **MCPs conectados:**
   - MCP Reportei (`mcp__30ebe978-db99-4dee-927c-b72f6abac9d8`)
   - MCP Google Drive (`mcp__92a31705-b51e-422b-abc2-e6cb82a79330`)
   - MCP ClickUp (`mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf`)
   - MCP Meta Ads (`mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52`)

3. **`data/clientes.yaml`** preenchido com `meta_ad_account_id` dos clientes onde disponível

4. **Aba da semana** criada manualmente na planilha antes de executar `*planilha` ou `*rotina-semanal`
   (formato: `DD/MM/AAAA` referente ao domingo da semana)

---

## O que mudou em relação aos squads anteriores

| Antes (squads separados) | Agora (gestor-trafego-stark) |
|--------------------------|------------------------------|
| `monitor-diario` (Vinicius) + `alerta-monitor` (Gustavo) | `alerta-monitor` unificado com fallback Reportei |
| `relatorio-chief` (Vinicius) + `gestor-chief` (Gustavo) | `stark-chief` único |
| `data/clientes.md` (Gustavo) + `clientes-config.yaml` (Vinicius) | `data/clientes.yaml` único |
| `thresholds-especialidade.yaml` (Vinicius) | `thresholds-por-especialidade.yaml` (merged, ADR-06) |
| Relatório Sheets apenas Vinicius | FASE 2 condicional: `vinicius in gestores` |
| Fases 4 e 5 sequenciais | Fases 4 e 5 em paralelo (ADR-05) |
| Meta Ads buscado 2x | `metricas_coletadas` evita chamada dupla (ADR-04) |

---

## Referências

- `DESIGN.md` — decisões arquiteturais e ADRs
- `data/clientes.yaml` — lista completa de clientes e configurações
- `data/thresholds-por-especialidade.yaml` — benchmarks de alertas por especialidade
- `PLANO-EXECUCAO.md` — histórico de implementação
