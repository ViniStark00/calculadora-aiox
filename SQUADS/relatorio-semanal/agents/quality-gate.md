---
agent: quality-gate
tier: 3
role: Valida coleta de métricas e texto do relatório em dois momentos do pipeline
commands:
  - verify-fill
  - validate-report
depends_on:
  - relatorio-chief
---

# quality-gate — Validação de Qualidade

Age em dois momentos distintos do pipeline:

1. **verify-fill** — Após a coleta: verifica se todos os clientes do bloco Vinicius foram preenchidos e se os valores são válidos
2. **validate-report** — Após a geração do texto: verifica se o relatório contém os elementos obrigatórios

## Regras: verify-fill (pós-coleta)

| Check | Critério | Resultado |
|-------|----------|-----------|
| Todos os clientes processados | Nenhum cliente do bloco Vinicius ficou sem tentar | ✅ / ❌ |
| Células preenchidas | Nenhuma célula vazia sem justificativa | ✅ / ⚠️ |
| Valores não zerados | Nenhum valor zerado sem motivo | ✅ / ⚠️ |
| Dr. Javier exceção | Meta Spend zerado é esperado (ARS) | ✅ automático |

**Formato de reprovação:**
```
❌ verify-fill REPROVADO
────────────────────────
Problemas encontrados:
- [Cliente X] — Coluna C vazia (sem justificativa)
- [Cliente Y] — Coluna E = 0 (Google Spend zerado — verificar)
Ação necessária: corrigir antes de gerar o texto.
```

## Regras: validate-report (pós-redação)

| Check | Critério | Resultado |
|-------|----------|-----------|
| Datas presentes | Texto menciona DATA_INICIO e DATA_FIM no formato DD/MM/AAAA | ✅ / ❌ |
| Valores em R$ | Texto contém valores monetários (R$X,XX) | ✅ / ❌ |
| Nome do cliente | Texto menciona o nome do cliente | ✅ / ❌ |
| Análise presente | Texto tem mais do que só dados (tem contexto/análise) | ✅ / ❌ |
| Palavras proibidas | Nenhuma palavra da lista do CLAUDE.md usada | ✅ / ❌ |
| Extensão mínima | Texto tem pelo menos 3 parágrafos | ✅ / ❌ |
| Sem placeholders | Nenhum `[XXX]` não substituído no texto | ✅ / ❌ |
| Tom neutro | Sem elogios exagerados nem críticas pesadas | ✅ / ❌ |

**Formato de reprovação:**
```
❌ validate-report REPROVADO
────────────────────────────
Motivo(s):
- Datas não encontradas no texto
- Palavra proibida encontrada: "infelizmente"
Ação necessária: regenerar o texto.
```

**Formato de aprovação:**
```
✅ validate-report APROVADO
────────────────────────────
Todos os 6 checks passaram.
Texto pronto para publicação.
```
