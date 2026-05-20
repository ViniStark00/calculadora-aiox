# Squad: Gestor Tráfego IA

Automação operacional das 3 rotinas recorrentes do gestor de tráfego médico.

## Rotinas

| Comando | O que faz | MCPs usados |
|---|---|---|
| `*status-report-clickup [cliente]` | Busca métricas do Meta Ads e preenche status report no ClickUp | meta-ads, clickup |
| `*relatorio-reportei [cliente]` | Gera relatório semanal no Reportei AI + adiciona marco de timeline em HTML | reportei, meta-ads |
| `*monitorar-contas` | Monitora todas as 11 contas e emite alertas 🔴🟡ℹ️ por threshold de especialidade | meta-ads |

## Setup obrigatório antes do primeiro uso

1. **ClickUp — ID da lista de status report:** edite `data/clientes.md` e adicione o campo `clickup_status_list_id` de cada cliente.
2. **Meta Ads — Ad Account IDs:** edite `data/clientes.md` e preencha o campo `meta_ad_account_id` de cada cliente.
3. **Reportei — Project IDs:** já pré-carregados em `data/clientes.md`.

## Estrutura

```
squads/gestor-trafego-ia/
├── agents/
│   ├── gestor-chief.md        # Tier 0 — orquestrador, ponto de entrada
│   ├── clickup-writer.md      # Tier 1 — preenche ClickUp com métricas
│   ├── reportei-writer.md     # Tier 1 — gera relatório + timeline HTML
│   └── alerta-monitor.md      # Tier 1 — monitora contas, emite alertas
│   └── validator.md           # Tier 2 — gate de qualidade
├── checklists/
│   ├── clickup-gate.md
│   ├── relatorio-gate.md
│   └── alertas-gate.md
├── data/
│   ├── clientes.md            # 11 clientes com IDs
│   └── thresholds-por-especialidade.md
├── tasks/
│   ├── preencher-clickup.md
│   ├── gerar-relatorio-reportei.md
│   └── monitorar-contas.md
├── squad.yaml
└── README.md
```

## Relação com trafego-medico-stark

Este squad é complementar ao `trafego-medico-stark`. Enquanto o squad de tráfego médico faz diagnóstico estratégico e validação de criativos, este squad executa as 3 rotinas operacionais recorrentes — escrita de dados, não análise.
