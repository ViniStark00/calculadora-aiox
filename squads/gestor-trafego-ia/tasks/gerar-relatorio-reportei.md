---
task: Gerar Relatório Semanal no Reportei AI
responsavel: "@gestor-chief"
responsavel_type: workflow
atomic_layer: task
status: functional
Entrada: |
  - cliente: Nome do cliente (obrigatório)
  - periodo: Período do relatório (opcional — default: last_7d)
    Formato: "last_7d" ou "2026-05-12 a 2026-05-18"
Saida: |
  - report_id: ID do relatório criado no Reportei
  - timeline_event_id: ID do marco de timeline adicionado
  - html_preview: Prévia do HTML do marco de timeline
Checklist:
  - "[ ] Cliente encontrado em data/clientes.md com project_id"
  - "[ ] Relatório criado no Reportei com report_id confirmado"
  - "[ ] Marco de timeline adicionado com timeline_event_id confirmado"
  - "[ ] HTML do marco contém métricas obrigatórias (spend, leads, CPL, CTR, CPM)"
  - "[ ] Rate limit respeitado (< 40 requests / 9min)"
  - "[ ] Gate do @validator aprovado"
---

# *relatorio-reportei

Gera relatório semanal no Reportei AI e adiciona marco de timeline com HTML formatado.

## Workflow

```
@reportei-writer → cria relatório no Reportei + adiciona marco de timeline HTML
@validator → gate: report_id + timeline_event_id + HTML completo
@gestor-chief → confirma output ao gestor
```

## Uso

```
*relatorio-reportei graciela-machado
*relatorio-reportei dra-nicolli --periodo last_14d
*relatorio-reportei dr-diego-alencar --periodo "2026-05-12 a 2026-05-18"
```

## Step-by-step

### Step 1 — Identificar cliente e projeto
- Localizar cliente em `data/clientes.md` pelo nome informado
- Confirmar `reportei_project_id` configurado
- SE faltando: PARAR e notificar gestor

### Step 2 — Criar relatório
- Acionar @reportei-writer → `create_report` no Reportei
- Confirmar `report_id` na resposta antes de prosseguir

### Step 3 — Adicionar marco de timeline
- @reportei-writer → `create_timeline_event` com HTML formatado
- HTML deve conter: spend, leads, CPL, CTR, CPM, frequência
- Confirmar `timeline_event_id` na resposta

### Step 4 — Gate de qualidade
- @validator aplica `checklists/relatorio-gate.md`
- SE FAIL → retornar ao Step 2/3 com itens faltando
- SE PASS → prosseguir

### Step 5 — Entregar
- @gestor-chief confirma ao gestor:
  '✅ Relatório de {cliente} criado — ID {report_id} | Timeline ID {timeline_event_id}'

## Gestão de rate limit

- Máximo 40 requests por 9 minutos no Reportei
- Para múltiplos clientes em sequência: processar em lotes
- Ao atingir 38 requests → `ScheduleWakeup(delaySeconds: 540)` e aguardar
