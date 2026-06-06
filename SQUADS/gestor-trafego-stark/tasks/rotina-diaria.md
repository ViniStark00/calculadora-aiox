---
task: rotina-diaria
agent: stark-chief
squad: gestor-trafego-stark
elicit: false
inputs:
  - gestor: vinicius | gustavo | ambos (opcional — padrão: ambos)
outputs:
  - painel_alertas: output do alerta-monitor
  - relatorio_tarefas: output do task-monitor por gestor
---

# Task: rotina-diaria — Monitoramento + Inbox ClickUp

**Ativação por comando `*rotina-diaria`:** executa monitoramento de contas e verifica inbox de tarefas. Rotina rápida, sem geração de relatórios.

## Pré-condições

- `data/clientes.yaml` acessível
- MCPs Meta Ads e ClickUp disponíveis (fallback Reportei se Meta Ads offline)

## Bloco 1 — Monitoramento de contas

Acionar `alerta-monitor` com comando `*monitor`:
- Iterar sobre todos os clientes ativos
- Aplicar thresholds por especialidade
- Gerar painel de alertas 🔴🟡ℹ️✅

Ver task `tasks/monitorar-contas.md` para detalhes de execução.

**Comportamento se MCP indisponível:**
- Meta Ads offline → usar Reportei como fallback (CPL apenas)
- Reportei offline → registrar clientes como indisponíveis, exibir painel parcial

## Bloco 2 — Inbox de tarefas

Acionar `task-monitor` com parâmetro de gestor:

| Parâmetro | Ação |
|-----------|------|
| `*rotina-diaria vinicius` | Inbox do Vinicius apenas |
| `*rotina-diaria gustavo` | Inbox do Gustavo apenas |
| `*rotina-diaria` (sem parâmetro) | Pergunta: "Qual gestor? Vinicius, Gustavo ou ambos?" |

Para cada gestor solicitado:
- Buscar tasks abertas por assignee
- Verificar tasks de status report e relatório via MCP
- Marcar automaticamente as confirmadas
- Organizar por urgência

Ver workflow completo em `agents/task-monitor.md`.

## Formato de saída

```
ROTINA DIÁRIA — [DATA] · [HORA]
═══════════════════════════════════════════════════

── MONITORAMENTO DE CONTAS ────────────────────────
[output do alerta-monitor]

── INBOX — VINICIUS ───────────────────────────────
[output do task-monitor para Vinicius]

── INBOX — GUSTAVO ────────────────────────────────
[output do task-monitor para Gustavo]

═══════════════════════════════════════════════════
Rotina diária concluída em [tempo].
```

## Comportamento de falha

| Fase | Falha | Comportamento |
|------|-------|--------------|
| Monitoramento | MCP indisponível | Exibir painel parcial com aviso — continuar para inbox |
| Inbox Vinicius | MCP ClickUp offline | Marcar bloco como SKIPPED — exibir inbox Gustavo |
| Inbox Gustavo | MCP ClickUp offline | Marcar bloco como SKIPPED |
