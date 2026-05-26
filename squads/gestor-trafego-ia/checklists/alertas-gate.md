# Checklist: Alertas de Monitoramento Gate

Gate de qualidade para output do `*monitorar-contas`.
Aplicado pelo @validator antes de entregar ao @gestor-chief.

## Cobertura da carteira

- [ ] Todas as 11 contas cobertas (ou exclusão documentada — ex: Dr. Laureano: Google only)
- [ ] Seção ✅ SEM ALERTAS presente com pelo menos 1 cliente listado (ou explicação)
- [ ] Timestamp e data do monitoramento presentes

## Qualidade dos alertas 🔴🟡

- [ ] Cada alerta 🔴 e 🟡 inclui o threshold de referência explícito (ex: "> pause R$ 30 — Tricologia")
- [ ] Cada alerta inclui o valor atual da métrica (ex: "CPM R$ 34")
- [ ] Cada alerta identifica o objeto problemático (conjunto, anúncio ou conta)
- [ ] Nenhum alerta com lookback < 3 dias
- [ ] Nenhum alerta com spend < R$ 20 no período
- [ ] Nenhum alerta de frequência com menos de 1.000 impressões

## Integridade dos vetos

- [ ] Nenhuma recomendação de pause, escala ou ação de campanha no output
- [ ] Verba excessiva classificada como ℹ️ INFO/NOTIFY (nunca 🔴 CRÍTICO)
- [ ] Dr. Laureano Filho: excluído do monitoramento Meta (nota explicativa presente)
- [ ] Campanhas awareness/reach: CPM alto não classificado como crítico

## RESULTADO

**PASS** → output aprovado para entrega ao gestor.

**FAIL** → retornar ao @alerta-monitor com lista numerada dos itens com problema.
