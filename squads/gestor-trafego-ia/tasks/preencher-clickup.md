---
task: Preencher Status Report no ClickUp
responsavel: "@gestor-chief"
responsavel_type: workflow
atomic_layer: task
status: functional
Entrada: |
  - cliente: Nome do cliente (obrigatório)
    Exemplos: "graciela-machado", "dr-diego-alencar", "dra-nicolli"
  - periodo: Período para as métricas (opcional — default: last_7d)
    Formato: "last_7d", "last_14d", ou "2026-05-12 a 2026-05-18"
Saida: |
  - task_id: ID da tarefa/comentário criado no ClickUp
  - metricas_coletadas: Resumo dos dados escritos (spend, leads, CPL)
  - confirmacao: Timestamp de escrita bem-sucedida
Checklist:
  - "[ ] Cliente encontrado em data/clientes.md"
  - "[ ] Task do cliente localizada no ClickUp (por clickup_status_list_id ou busca por nome)"
  - "[ ] Métricas buscadas do Meta Ads MCP com sucesso"
  - "[ ] Todos os campos obrigatórios preenchidos (sem vazios)"
  - "[ ] Comentário escrito no ClickUp com comment_id confirmado"
  - "[ ] Aprendizado salvo no Google Drive"
  - "[ ] Gate do @validator aprovado"
---

# *status-report-clickup

Busca métricas do Meta Ads para um cliente, monta análise completa com funil e benchmarks,
e escreve o status report como comentário na task do cliente no ClickUp.

## Workflow

```
@clickup-writer → Passo 0 (Drive) + métricas Meta Ads + análise funil + escreve ClickUp + salva Drive
@validator → gate: comentário publicado + análise completa + aprendizado salvo
@gestor-chief → confirma output ao gestor
```

## Uso

```
*status-report-clickup graciela-machado
*status-report-clickup dr-diego-alencar --periodo last_14d
*status-report-clickup dra-nicolli --periodo "2026-05-12 a 2026-05-18"
```

## Step-by-step

### Step 1 — Identificar cliente e contexto
- Localizar cliente em `data/clientes.md` pelo nome informado
- @clickup-writer executa Passo 0: ler doc "Contexto - {cliente}" no Drive
- Classificar sentimento: POSITIVO | NEUTRO | NEGATIVO
- SE cliente não encontrado: PARAR e notificar gestor

### Step 2 — Buscar métricas
- @clickup-writer busca via Meta Ads MCP dois períodos:
  - Período atual: DATE_START → DATE_END
  - Período comparativo: COMP_START → COMP_END (para calcular PoP)
- Métricas: spend, impressions, reach, frequency, CTR, CPM, leads, CPL
- SE messaging_conversation_started_7d indisponível → usar cost_per_result como fallback

### Step 3 — Montar análise completa
- Calcular PoP para investimento, CPL e conversas
- Comparar CPL com meta_cpl do cliente (ou benchmark da especialidade se null)
- Montar análise TOFU + MOFU (maturidade de audiência) + BOFU
- Definir próximos passos — apenas tráfego, nunca atendimento pós-lead
- Aplicar tom por sentimento do contexto (POSITIVO/NEUTRO/NEGATIVO)

### Step 4 — Localizar task e escrever no ClickUp
- SE clickup_status_list_id preenchido em clientes.md → usar diretamente
- SE clickup_status_list_id = TODO → buscar por nome do cliente via clickup_search
- Escrever comentário na task com análise completa
- Confirmar comment_id retornado

### Step 5 — Salvar aprendizado no Drive
- Criar arquivo "Aprendizado - {cliente} - {DATE_START}→{DATE_END}.md"
- Salvar na pasta "Contexto Clientes - Stark" via Google Drive MCP

### Step 6 — Gate de qualidade
- @validator aplica `checklists/clickup-gate.md`
- SE FAIL → retornar ao step com itens faltando
- SE PASS → prosseguir

### Step 7 — Entregar
- @gestor-chief confirma: '✅ Status report de {cliente} publicado no ClickUp — task {id} | comment {id}'
