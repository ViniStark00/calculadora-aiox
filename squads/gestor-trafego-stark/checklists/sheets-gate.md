---
gate: sheets-gate
agent: validator
phase: FASE 2
squad: gestor-trafego-stark
---

# sheets-gate — Checklist de Aceite: Preenchimento Google Sheets

**Gate aplicado após:** `coletor` executa `fill_sheets.py` e retorna status

---

## Critérios de aceite (7)

- [ ] **1. Exit code 0** — `fill_sheets.py` retornou exit code 0 sem erros fatais
- [ ] **2. Cobertura de clientes** — número de linhas preenchidas bate com count de clientes ativos com `vinicius in gestores` em `data/clientes.yaml`
- [ ] **3. Período correto** — data preenchida corresponde à segunda a domingo da semana anterior (não semana corrente)
- [ ] **4. Campos obrigatórios não-vazios** — nenhum campo obrigatório ficou vazio (string vazia `""`); zeros (`0`, `0.0`) são valores válidos
- [ ] **5. Colunas corretas por cliente** — colunas preenchidas correspondem ao `sheet_columns` de cada cliente em `data/clientes.yaml`
- [ ] **6. Sem valores estimados** — origem dos dados confirmada pelo script (fonte explícita no output: `reportei_api` ou `meta_ads_mcp`); nenhum valor interpolado ou inferido
- [ ] **7. Aba da semana existe** — aba com nome `DD/MM/AAAA` (domingo da semana anterior) existe na planilha antes da execução; script não criou aba automaticamente

---

## Resultado esperado

**PASS:** todos os 7 critérios atendidos → pipeline avança para FASE 3

**FAIL:** 1 ou mais critérios falhados → retornar ao `coletor` com lista exata dos critérios

---

## Formato de saída do validator

```
✅ GATE PASS — sheets-gate — Bloco Vinicius (semana DD/MM/AAAA)
   7/7 critérios atendidos. Pipeline avança para FASE 3.
```

```
❌ GATE FAIL — sheets-gate — Bloco Vinicius (semana DD/MM/AAAA)
   Itens com problema:
   1. [Critério N] — [descrição do problema]
   Retornar ao @coletor para correção.
```

---

## Notas de borda

| Situação | Comportamento |
|----------|--------------|
| `conversas = 0` | Critério 4 passa — zero é valor válido |
| `google_spend` ausente para cliente META-only | Critério 5 passa se `sheet_columns` não inclui `google_spend` para este cliente |
| Aba não existe | Critério 7 FAIL — interromper com erro claro |
| Script retornou exit 1 com aviso parcial | Critério 1 FAIL — verificar clientes com erro no status |
