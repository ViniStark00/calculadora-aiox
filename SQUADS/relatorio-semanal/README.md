# relatorio-semanal

Squad AIOX que automatiza 3 atividades semanais do gestor de tráfego pago.

## As 3 Atividades

| # | Atividade | Tempo antes | Tempo depois |
|---|-----------|-------------|--------------|
| 1 | Preencher planilha de métricas (Reportei → Sheets) | ~45 min | ~2 min |
| 2 | Gerar texto do relatório escrito por cliente | ~30 min/cliente | ~1 min/cliente |
| 3 | Publicar marco na Timeline do Reportei | ~10 min/cliente | ~30 seg/cliente |

## Como Usar

```
# Ativar o orquestrador:
@relatorio-chief

# Rodar o pipeline completo para um cliente:
Rodar pipeline para Destra Desenvolvimentos
```

## Estrutura

```
squads/relatorio-semanal/
├── CLAUDE.md                  # Briefing: voz, regras, restrições
├── squad.yaml                 # Manifest do squad
├── README.md                  # Este arquivo
├── agents/
│   ├── relatorio-chief.md     # Tier 0: Orquestrador do pipeline
│   ├── coletor.md             # Tier 1: API Reportei → Google Sheets
│   ├── redator.md             # Tier 1: Gera narrativa do relatório
│   ├── publicador.md          # Tier 1: Publica na Timeline do Reportei
│   └── quality-gate.md        # Tier 3: Valida coleta e texto
├── tasks/
│   ├── fetch-metrics.md       # Atividade 1: coleta de métricas
│   ├── verify-fill.md         # Verificação pós-preenchimento
│   ├── generate-report.md     # Atividade 2: gera texto
│   ├── validate-report.md     # Validação do texto gerado
│   └── publish-timeline.md    # Atividade 3: publica marco
├── workflows/
│   └── weekly-report-pipeline.md  # Pipeline completo
├── templates/
│   └── relatorio-template.md      # Template de narrativa (preencher na Etapa 5)
├── checklists/
│   └── qa-relatorio.md            # Critério de aceite objetivo
├── config/
│   └── clientes-config.yaml       # MANUAL_MAP, colunas, slugs
└── examples/
    └── .gitkeep                   # Salvar outputs de demo aqui
```

## Pipeline

```
relatorio-chief
    └─→ coletor (fetch-metrics)
          └─→ quality-gate (verify-fill)
                └─→ redator (generate-report)
                      └─→ quality-gate (validate-report)
                            └─→ publicador (publish-timeline)
                                  └─→ resumo final
```

## Pré-requisitos

- Variável `REPORTEI_TOKEN` configurada (Bearer token da API Reportei v2)
- Variável `SHEET_ID` configurada (ID da planilha Google Sheets)
- Variável `GOOGLE_SERVICE_ACCOUNT_JSON` apontando para `service_account.json`
- Aba da semana (`DD/MM/AAAA`) criada manualmente na planilha antes de rodar
- MCP Reportei instalado: `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8`

## MVP

Cliente de referência: **Destra Desenvolvimentos**

Salvar outputs de demonstração em `examples/destra-YYYY-MM-DD.md`.
