---
task: Rotina Semanal Completa
responsavel: "@gestor-chief"
responsavel_type: workflow
atomic_layer: composed
status: functional
Entrada: |
  - cliente: Nome do cliente (obrigatório)
    Exemplos: "dr-caio-fernandes", "dra-nicolli", "graciela-machado"
  - periodo: Período do relatório (opcional — default: last_7d calculado da data atual)
Saida: |
  - alertas: Relatório de monitoramento do cliente
  - report_id: ID do relatório criado no Reportei
  - timeline_event_id: ID do marco de timeline
  - clickup_comment_id: ID do comentário publicado no ClickUp
  - whatsapp: Mensagem WhatsApp formatada
  - aprendizado_drive: Arquivo de aprendizado salvo no Drive
Frequencia: "Semanal — rodar toda quarta-feira para cada cliente da carteira"
---

# *rotina-semanal

Executa as 3 atividades semanais em sequência para um cliente:
monitor → relatório Reportei → status report ClickUp.

O monitor roda primeiro e seus alertas são passados automaticamente
para o relatório e o status report — sem buscar os dados duas vezes.

## Workflow

```
FASE 1 — MONITORAMENTO
@alerta-monitor → métricas Meta Ads + alertas por severidade
@validator → gate alertas
        ↓ alertas_ativos passados para as próximas fases

FASE 2 — RELATÓRIO REPORTEI
@reportei-writer → Passo 0 (Drive) + métricas + HTML timeline + WhatsApp + aprendizado Drive
@validator → gate relatório

FASE 3 — STATUS REPORT CLICKUP
@clickup-writer → análise completa com funil + escreve ClickUp + aprendizado Drive
@validator → gate clickup

@gestor-chief → entrega consolidado das 3 fases
```

## Uso

```
*rotina-semanal dr-caio-fernandes
*rotina-semanal dra-nicolli --periodo "2026-05-12 a 2026-05-18"
```

## Step-by-step

### FASE 1 — Monitoramento

#### Step 1.1 — Monitorar conta
- Acionar @alerta-monitor para o cliente especificado
- Lookback: last_3d para CPM/CTR/kill-switch | last_7d para frequência
- Persistir alertas_ativos em memória para uso nas fases 2 e 3

#### Step 1.2 — Gate monitor
- @validator aplica `checklists/alertas-gate.md`
- SE FAIL → corrigir antes de prosseguir para Fase 2
- SE PASS → continuar

---

### FASE 2 — Relatório Reportei

#### Step 2.1 — Contexto e métricas
- @reportei-writer executa Passo 0: ler doc "Contexto - {cliente}" no Drive
- Classificar sentimento: POSITIVO | NEUTRO | NEGATIVO
- Calcular janela de datas automaticamente a partir de HOJE
- Buscar métricas via Reportei MCP + Meta Ads MCP

#### Step 2.2 — Montar e publicar relatório
- Criar relatório no Reportei com template ID 146208
- Montar HTML do marco de timeline com análise TOFU + MOFU + BOFU
- Incluir alertas_ativos da Fase 1 na seção de Alertas do HTML
- Publicar marco de timeline via create_timeline_event
- Gerar mensagem WhatsApp

#### Step 2.3 — Salvar aprendizado
- Criar arquivo "Aprendizado - {cliente} - {DATE_START}→{DATE_END}.md" no Drive

#### Step 2.4 — Gate relatório
- @validator aplica `checklists/relatorio-gate.md`
- SE FAIL → corrigir antes de prosseguir para Fase 3
- SE PASS → continuar

---

### FASE 3 — Status Report ClickUp

#### Step 3.1 — Reutilizar contexto e métricas
- @clickup-writer herda contexto do Drive e métricas já coletadas na Fase 2
- NÃO rebuscar dados — reutilizar da sessão atual
- Incorporar alertas_ativos da Fase 1 na seção de alertas do status report

#### Step 3.2 — Montar análise e publicar
- Montar análise completa com funil (TOFU + MOFU + BOFU) e PoP
- Comparar CPL com meta_cpl e benchmark da especialidade
- Localizar task do cliente no ClickUp (por clickup_status_list_id ou busca por nome)
- Publicar comentário com análise completa

#### Step 3.3 — Gate ClickUp
- @validator aplica `checklists/clickup-gate.md`
- SE FAIL → corrigir e republicar
- SE PASS → continuar

---

### ENTREGA CONSOLIDADA

@gestor-chief entrega resumo das 3 fases:

```
✅ Rotina semanal — {cliente} — {data}

MONITOR
{lista de alertas ou "✅ Sem alertas críticos"}

REPORTEI
report_id: {id} | timeline_event_id: {id}
{mensagem WhatsApp pronta para envio}

CLICKUP
task_id: {id} | comment_id: {id}
{link da task}
```

## Regras de handoff entre fases

- SE Fase 1 retornar alertas 🔴 → incluir obrigatoriamente na seção Alertas do HTML (Fase 2) e no status report (Fase 3)
- SE Fase 2 falhar no gate → NÃO prosseguir para Fase 3 — corrigir primeiro
- SE cliente não tiver task no ClickUp → Fase 3 notifica gestor e encerra sem erro
- Dados de métricas são compartilhados entre fases — nunca buscar duas vezes na mesma sessão

## Gestão de rate limit Reportei

- Máximo 40 requests por janela de 9 minutos
- Ao atingir 38 requests → ScheduleWakeup(delaySeconds: 540)
- Para rodar rotina de múltiplos clientes em sequência: aguardar conclusão de cada um antes de iniciar o próximo
