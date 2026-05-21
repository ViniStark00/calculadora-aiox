---
task: validate-metrics
agent: avinash
elicit: true
inputs:
  - estrutura_campanha_kennedy
outputs:
  - relatorio_metricas
---

# Task: Validar Métricas e Benchmarks

## Pré-condições
- Estrutura de campanha do kennedy disponível (Blocos 1–4 preenchidos)

## Passos

### Check 1 — Orçamento real (imposto Meta)
1. Identificar o `orçamento diário sugerido` preenchido pelo kennedy no Bloco 2
2. Verificar se foi aplicada a fórmula: `orçamento_real = orçamento_desejado ÷ 0,878`
3. Se não foi calculado: calcular agora e apresentar ao usuário
4. Alertar se o orçamento real ficar abaixo de R$ 30/dia (fase de aprendizado muito lenta)

### Check 2 — KPIs corretos
Verificar quais métricas estão sendo usadas como critério de sucesso:

| Métrica informada | Status |
|---|---|
| CPA (custo por agendamento) | ✅ Foco correto — manter |
| CPL (custo por lead) | ⚠️ Secundária — não decidir por ela |
| Curtidas / Alcance / Impressões | ❌ Vaidade — não tomar decisão |
| Taxa de show (comparecimento) | ✅ Crítica para high-ticket |
| CTR | ✅ Diagnóstico de criativo |

Se o gestor estiver focando em métricas de vaidade: alertar e redirecionar para CPA.

### Check 3 — Benchmarks vs knowledge-base
Comparar as metas definidas na estrutura com os dados em `data/knowledge-base.yaml`:

- CPC Google Ads cirurgia plástica: **R$ 8–20** — está dentro da faixa?
- CPC Meta Ads Brasil: **~R$ 0,87** (com imposto) — está dentro da faixa?
- Taxa de no-show sem automação: **~40%** — gestor está ciente?
- Taxa de no-show com automação WhatsApp: **10–15%** — automação está prevista?

### Check 4 — Fase de aprendizado
Verificar se o orçamento suporta o aprendizado do algoritmo:
- Meta Ads precisa de ~50 conversões/semana para otimizar
- Calcular: com o CPA esperado e orçamento definido, quantos dias para atingir 50 conversões?
- Se fase de aprendizado > 30 dias: recomendar aumento de orçamento ou ajuste de objetivo

## Output

```
RELATÓRIO DE VALIDAÇÃO DE MÉTRICAS
════════════════════════════════════════════════════
✅ ORÇAMENTO: R$ [X] desejado → R$ [X ÷ 0,878] real depositado
   Imposto Meta (12,15%) incluso no cálculo

[✅ ou ⚠️] KPIs: [situação — CPA como principal / alerta se vaidade]

[✅ ou ⚠️] BENCHMARKS:
  - CPC Google: R$ [X] — [dentro / fora] da faixa R$ 8–20
  - CPC Meta: R$ [X] — [dentro / fora] da faixa ~R$ 0,87
  - No-show: [automação prevista / não prevista]

[✅ ou ⚠️] FASE DE APRENDIZADO: ~[X] dias estimados
  [alerta se > 30 dias]

PARECER FINAL: [APROVADO / REQUER AJUSTE]
Itens pendentes: [lista se houver]
════════════════════════════════════════════════════
PRÓXIMA FASE: traffic-chief (entrega + registro)
```
