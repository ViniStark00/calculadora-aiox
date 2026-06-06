---
gate: relatorio-gate
agent: validator
phase: FASE 3 → FASE 4
squad: gestor-trafego-stark
---

# relatorio-gate — Checklist de Aceite: Relatório Reportei

**Gate aplicado após:** `redator` gera narrativa HTML + `publicador` publica marco na Timeline

---

## Critérios de aceite (5)

- [ ] **1. report_id confirmado** — resposta do MCP `create_timeline_event` contém ID do evento criado
- [ ] **2. timeline_event_id confirmado** — ID do evento não é null e foi registrado em `data/timeline-log.jsonl`
- [ ] **3. HTML contém métricas obrigatórias** — texto do marco de timeline contém pelo menos: `spend`, `leads` ou `conversas`, `CPL` (ou `CPL: -` se conversas = 0), `CTR`, `CPM` — nenhum placeholder `[XXX]` não substituído
- [ ] **4. Período correto** — título ou cabeçalho do relatório e do marco refletem a semana correta (segunda a domingo da semana anterior)
- [ ] **5. HTML válido** — nenhuma tag HTML aberta sem fechar (`<p>`, `<strong>`, `<br>` — verificar fechamento de todas as tags)

---

## Resultado esperado

**PASS:** todos os 5 critérios atendidos → `publicador` aciona `whatsapp-writer` e pipeline avança para FASE 4∥5

**FAIL — 1ª vez:** retornar ao `redator` para regeneração do texto
**FAIL — 2ª vez:** interromper pipeline; aguardar ação do gestor

---

## Formato de saída do validator

```
✅ GATE PASS — relatorio-gate — [CLIENTE] (semana DD/MM a DD/MM/AAAA)
   5/5 critérios atendidos. Publicação confirmada: timeline_event_id = XXXXX.
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
| `conversas = 0` e CPL = `-` | Critério 3 passa se texto contém `CPL: -` ou `CPL não calculável` |
| Cliente Google-only (Dr. Laureano Filho) | Critério 3 não exige `CPL/conversas` — exige `conversões`, `CPC`, `cliques` em vez disso |
| Tag `<br>` sem fechar | Critério 5 PASS — `<br>` é self-closing em HTML5 |
| Evento já existe para o período | Critério 1 FAIL — perguntar ao gestor antes de republicar |
