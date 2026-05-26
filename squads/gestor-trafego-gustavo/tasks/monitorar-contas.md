---
task: Monitorar Contas e Emitir Alertas
responsavel: "@gestor-chief"
responsavel_type: workflow
atomic_layer: task
status: functional
Entrada: |
  - cliente: Nome de cliente específico (opcional — default: todas as contas)
  - periodo: Lookback para métricas (opcional — default: last_3d)
Saida: |
  - alertas_criticos: Lista de alertas 🔴 (ação imediata)
  - alertas_atencao: Lista de alertas 🟡 (monitorar)
  - info_notify: Lista de ℹ️ (gestor decide)
  - sem_alertas: Lista de contas dentro dos thresholds
Checklist:
  - "[ ] Todas as 11 contas cobertas (ou exclusão justificada)"
  - "[ ] Cada alerta inclui threshold de referência e evidência quantitativa"
  - "[ ] Nenhum alerta sem 3+ dias de lookback e spend > R$ 20"
  - "[ ] Nenhuma recomendação de ação de campanha"
  - "[ ] Seção ✅ SEM ALERTAS presente"
  - "[ ] Gate do @validator aprovado"
---

# *monitorar-contas

Itera sobre as 11 contas da carteira, compara métricas com thresholds por especialidade e emite lista estruturada de alertas por severidade.

## Workflow

```
@alerta-monitor → busca métricas de todas as contas + compara com thresholds
@validator → gate: cobertura completa + alertas com evidência
@gestor-chief → entrega lista de alertas ao gestor
```

## Uso

```
*monitorar-contas
*monitorar-contas dr-diego-alencar
*monitorar-contas --periodo last_7d
```

## Step-by-step

### Step 1 — Iterar sobre clientes
- Acionar @alerta-monitor com lista de `data/clientes.md`
- Buscar métricas Meta Ads para cada conta (lookback: last_3d, level: ad + account)
- Excluir Dr. Laureano Filho do Meta (só Google Ads)

### Step 2 — Avaliar thresholds
- Para cada conta, comparar com `data/thresholds-por-especialidade.md`:
  - CPL vs meta_cpl do cliente
  - CPM vs faixa da especialidade
  - Frequência vs tipo de campanha
  - CTR vs 0,8% (crítico) e 1,5% (atenção)
  - Kill switch: spend + 0 conversas em 3 dias

### Step 3 — Classificar alertas
- 🔴 CRÍTICO: threshold de pause ultrapassado — ação imediata necessária
- 🟡 ATENÇÃO: acima da faixa saudável, abaixo do pause — monitorar
- ℹ️ INFO: verba em pacing, frequência chegando ao limite
- ✅ SEM ALERTAS: todas as métricas dentro da faixa

### Step 4 — Gate de qualidade
- @validator aplica `checklists/alertas-gate.md`
- SE FAIL → retornar ao @alerta-monitor com contas faltando ou alertas incompletos
- SE PASS → prosseguir

### Step 5 — Entregar
- @gestor-chief exibe lista de alertas estruturada
- Incluir timestamp e total de contas monitoradas

## Ordem de processamento (prioridade)
1. Dr. Fernando Bezerra (baixo volume de leads — prioridade máxima)
2. Dr. Diego Alencar (CPL crítico — histórico)
3. Dr. Marcelo Bezerra (atenção contínua)
4. Dr. Higner Forastieri (CPM alto — histórico)
5. Dra. Mariângela Santiago
6. Dr. Caio Fernandes
7. Dra. Nicolli
8. Fernanda Encinas
9. Graciela Machado
10. Dra. Érica Marchiori
11. Dr. Laureano Filho (Google Ads only — excluído do Meta)
