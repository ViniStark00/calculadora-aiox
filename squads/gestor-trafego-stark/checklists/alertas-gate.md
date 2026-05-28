---
gate: alertas-gate
agent: validator
phase: FASE 1
squad: gestor-trafego-stark
---

# alertas-gate — Checklist de Aceite: Monitoramento de Contas

**Gate aplicado após:** `alerta-monitor` gera painel de alertas para todos os clientes ativos

---

## Critérios de aceite (6)

- [ ] **1. Cobertura completa** — todas as contas ativas de `data/clientes.yaml` (ativo: true) cobertas; contas com `excluir_meta_monitoring: true` listadas na seção `EXCLUÍDAS` com justificativa
- [ ] **2. Threshold explícito por alerta** — cada alerta 🔴 e 🟡 inclui threshold de referência (ex: `CPM R$ 34 > pause R$ 30 — Tricologia`); nenhum alerta sem threshold documentado
- [ ] **3. Evidência quantitativa por alerta** — cada alerta inclui valor atual vs valor de referência (ex: `CPL R$ 195 > meta R$ 80 × 1.6 = R$ 128`); nenhum alerta subjetivo
- [ ] **4. Lookback e spend mínimos respeitados** — nenhum alerta emitido com lookback < 3 dias ou spend < R$ 20 no período; contas abaixo do mínimo listadas em INFO
- [ ] **5. Seção SEM ALERTAS presente** — output inclui seção `✅ SEM ALERTAS` listando todos os clientes que não geraram alerta (mesmo que vazia a seção, listagem dos clientes OK é obrigatória)
- [ ] **6. Sem recomendação de ação** — nenhuma frase recomenda pause, escala ou alteração de campanha; output é NOTIFY apenas (gestor decide a ação)

---

## Resultado esperado

**PASS:** todos os 6 critérios atendidos → `stark-chief` exibe alertas ao gestor; `metricas_coletadas` disponibilizado para FASE 2

**FAIL:** retornar ao `alerta-monitor` com lista precisa dos critérios falhados
- Se FAIL por cobertura incompleta → alerta-monitor reprocessa clientes faltantes
- Se FAIL por recomendação de ação → alerta-monitor reformula output sem ação

---

## Formato de saída do validator

```
✅ GATE PASS — alertas-gate — Vinicius + Gustavo (DD/MM/AAAA · HH:mm)
   6/6 critérios atendidos. 27 contas cobertas, 1 excluída (Dr. Laureano Filho).
   metricas_coletadas disponível para coletor (FASE 2).
```

```
❌ GATE FAIL — alertas-gate — Vinicius + Gustavo (DD/MM/AAAA · HH:mm)
   Itens com problema:
   1. [Critério N] — [descrição: ex: "[Dr. X] alerta sem threshold explícito"]
   Retornar ao @alerta-monitor para correção.
```

---

## Notas de borda

| Situação | Comportamento |
|----------|--------------|
| Conta com `meta_ad_account_id: null` coberta via Reportei | Critério 1 PASS — fonte alternativa aceita |
| CPM/CTR/freq não verificados em conta via Reportei | Critério 2 PASS — campos indisponíveis não geram alerta |
| Conta com `ativo: false` ausente do painel | Critério 1 PASS — contas inativas são excluídas por design |
| `metricas_coletadas` vazio (MCP indisponível) | Critério 1 PASS — `coletor` buscará dados do zero na FASE 2 |
