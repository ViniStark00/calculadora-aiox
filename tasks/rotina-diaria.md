---
task: Rotina Diária de Monitoramento
responsavel: "@gestor-chief"
responsavel_type: workflow
atomic_layer: composed
status: functional
Entrada: |
  - cliente: Nome de cliente específico (opcional — default: todas as contas)
Saida: |
  - alertas_criticos: Lista de alertas 🔴
  - alertas_atencao: Lista de alertas 🟡
  - info_notify: Lista de ℹ️
  - sem_alertas: Contas dentro dos thresholds
Frequencia: "Diária — rodar toda manhã antes de abrir o gerenciador de anúncios"
---

# *rotina-diaria

Monitora todas as contas da carteira e emite alertas por severidade.
Usar todo dia. Leva ~5 minutos para carteira completa.

## Workflow

```
@alerta-monitor → métricas Meta Ads (last_3d) + comparação com thresholds por especialidade
@task-monitor   → lista tasks inbox + verifica status report e relatório via MCP + organiza por urgência
@validator      → gate: cobertura completa + alertas com evidência quantitativa
@gestor-chief   → entrega lista de alertas estruturada + tasks priorizadas
```

## Uso

```
*rotina-diaria
*rotina-diaria dr-caio-fernandes
```

## Step-by-step

### Step 1 — Monitorar
- Acionar @alerta-monitor
- SE cliente especificado: monitorar só esse cliente
- SE sem parâmetro: iterar pelos 11 clientes em `data/clientes.md` na ordem de prioridade
- Excluir Dr. Laureano Filho do Meta Ads (só Google Ads ativo)
- Lookback: last_3d para CPM/CTR/kill-switch | last_7d para frequência

### Step 2 — Gate de qualidade
- @validator aplica `checklists/alertas-gate.md`
- SE FAIL → retornar ao @alerta-monitor com itens faltando
- SE PASS → prosseguir

### Step 4 — Monitorar tarefas
- Acionar @task-monitor com `*monitor-tarefas`
- Listar tasks inbox do ClickUp por cliente
- Verificar status de status report e relatório semanal via MCP (último comentário / último relatório Reportei)
- Organizar por urgência: 🔴 atrasado / 🟡 vence hoje / ✅ em dia

### Step 5 — Entregar
- @gestor-chief exibe lista de alertas com timestamp e total de contas monitoradas
- Exibe tasks priorizadas por urgência logo abaixo dos alertas
- SE zero alertas críticos → "✅ Carteira saudável em {data} — {N} contas monitoradas"
- SE alertas críticos → listar com evidência quantitativa e threshold de referência
