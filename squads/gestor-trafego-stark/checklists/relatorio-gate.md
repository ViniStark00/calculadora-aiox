---
gate: relatorio-gate
agent: validator
phase: FASE 3 → FASE 4
squad: gestor-trafego-stark
---

# relatorio-gate — Checklist de Aceite: Relatório Reportei

**Gate aplicado após:** `redator` gera narrativa HTML completa — **antes da publicação no Reportei**.

---

## Critérios de aceite (5)

- [ ] **1. HTML sem placeholders abertos** — nenhum `[XXX]` não substituído. Campos indisponíveis devem estar como `X`, nunca como placeholder literal.
- [ ] **2. Métricas obrigatórias presentes** — HTML contém pelo menos: `spend`, `leads` ou `conversas`, `CPL` (ou `CPL: -` se total_leads = 0). Ver notas de borda para exceções por tipo de cliente.
- [ ] **3. Saúde de campanhas presente (Meta)** — para clientes com `meta_spend > 0` e `fonte != reportei_fallback`: HTML contém CTR, CPM, Frequência e CPC. Se algum campo for `X`, critério passa desde que aviso tenha sido emitido no output pelo redator.
- [ ] **4. Período correto** — cabeçalho do relatório reflete a semana correta (segunda a domingo da semana anterior) no formato `DD/MM a DD/MM`.
- [ ] **5. HTML válido** — nenhuma tag HTML aberta sem fechar (`<p>`, `<strong>` — verificar fechamento de todas as tags). `<br>` é self-closing em HTML5 — sempre passa.

---

## Resultado esperado

**PASS:** todos os 5 critérios atendidos → `publicador` aciona `create_timeline_event` e pipeline avança para FASE 4

**FAIL — 1ª vez:** retornar ao `redator` para regeneração do texto
**FAIL — 2ª vez:** interromper pipeline; aguardar ação do gestor

---

## Formato de saída do validator

```
✅ GATE PASS — relatorio-gate — [CLIENTE] (semana DD/MM a DD/MM/AAAA)
   5/5 critérios atendidos. Publicação autorizada.
```

```
❌ GATE FAIL — relatorio-gate — [CLIENTE] (semana DD/MM a DD/MM/AAAA)
   Itens com problema:
   1. [Critério N] — [descrição do problema]
   Retornar ao @redator para correção (tentativa N/2).
```

---

## Notas de borda

| Situação | Comportamento |
|----------|--------------|
| `total_leads = 0` e CPL = `-` | Critério 2 passa se texto contém `CPL: -` |
| Cliente Google-only (Dr. Laureano Filho — cirurgia_ortognatica) | Critério 2: exige `conversões`, `CPC`, `cliques` — não exige CPL por conversa. Critério 3: não se aplica (sem Meta Ads) |
| Cliente com `fonte: reportei_fallback` (meta_ad_account_id: null) | Critério 3 não se aplica — CTR/CPM/Frequência/CPC não são coletáveis via Reportei para esse cliente |
| Campo com valor `X` (dado indisponível) | Critério 3 passa se aviso correspondente foi emitido no output pelo redator |
| Evento já existe para o período | Critério 1 FAIL — perguntar ao gestor antes de republicar |
| Tag `<br>` sem fechar | Critério 5 PASS — `<br>` é self-closing em HTML5 |
