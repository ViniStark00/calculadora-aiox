---
gate: clickup-gate
agent: validator
phase: FASE 5
squad: gestor-trafego-stark
---

# clickup-gate — Checklist de Aceite: Status Report ClickUp

**Gate aplicado após:** `clickup-writer` appenda bloco semanal na subpágina do cliente

---

## Critérios de aceite (5)

- [ ] **1. Campos obrigatórios presentes** — draft inclui todos os campos do template: `Resumo da semana`, `O que subimos de novo`, `O que ajustamos e pausamos`; seção `Observações adicionais` presente apenas se houver conteúdo real
- [ ] **2. Período e data indicados** — cabeçalho do bloco contém período correto `## Semana de DD/MM a DD/MM/AAAA` e data de geração do bloco
- [ ] **3. Confirmação de escrita no ClickUp** — `clickup_update_document_page` retornou sucesso; doc_id ou page_id da subpágina confirmado no log de saída
- [ ] **4. Sem valores estimados ou vazios** — nenhum campo vazio `""` no draft (zero é aceitável como valor); sem frases como "dados indisponíveis" sem justificativa — `CPL: -` é aceito quando `conversas = 0`
- [ ] **5. CPL como `-` quando leads = 0** — se `conversas = 0` no período, CPL deve ser indicado como `-` (não calculado) em vez de `0` ou divisão por zero

---

## Resultado esperado

**PASS:** todos os 5 critérios atendidos → pipeline avança para FASE 6 (wrap-up)

**FAIL:** retornar ao `clickup-writer` com lista dos critérios falhados
- Aprovação do gestor deve ser obtida novamente se draft foi modificado

---

## Formato de saída do validator

```
✅ GATE PASS — clickup-gate — [CLIENTE] (semana DD/MM a DD/MM/AAAA)
   5/5 critérios atendidos. Bloco appendado em: [doc nome] › [subpágina cliente].
```

```
❌ GATE FAIL — clickup-gate — [CLIENTE] (semana DD/MM a DD/MM/AAAA)
   Itens com problema:
   1. [Critério N] — [descrição do problema]
   Retornar ao @clickup-writer para correção.
```

---

## Notas de borda

| Situação | Comportamento |
|----------|--------------|
| Seção `Observações adicionais` ausente | Critério 1 PASS — remoção da seção quando vazia é correta |
| `conversas = 0` e CPL como `-` | Critério 4 e 5 PASS |
| Bloco appendado no doc errado (Vinicius vs Gustavo) | Critério 3 FAIL — verificar roteamento de doc |
| Aprovação do gestor não registrada no log | Critério 3 FAIL — `clickup-writer` não deve escrever sem aprovação explícita |
| Conteúdo anterior da subpágina sobrescrito | Critério 3 FAIL imediato — deve ser append, nunca replace |
