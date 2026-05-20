---
task: validate-report
agent: quality-gate
elicit: false
inputs:
  - texto_relatorio: texto gerado pela task generate-report
  - cliente: nome do cliente esperado no texto
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA}
outputs:
  - aprovado: boolean
  - motivos_reprovacao: lista (vazia se aprovado)
---

# Task: validate-report — Validação do Relatório

**Pós-Atividade 2:** valida se o texto gerado contém todos os elementos obrigatórios e não viola as regras de voz.

## Checklist de validação (6 checks)

### Check 1 — Datas presentes
- [ ] Texto contém `DATA_INICIO` no formato DD/MM/AAAA
- [ ] Texto contém `DATA_FIM` no formato DD/MM/AAAA

### Check 2 — Valores monetários
- [ ] Texto contém pelo menos um valor no formato R$ X.XXX,XX ou R$ XXX,XX

### Check 3 — Nome do cliente
- [ ] Texto menciona o nome do cliente (ou variação reconhecível)

### Check 4 — Análise presente
- [ ] Texto tem no mínimo 3 parágrafos
- [ ] Texto contém mais do que apenas lista de números (tem contexto ou análise)

### Check 5 — Palavras proibidas ausentes
Verificar contra lista completa do `CLAUDE.md`:
- [ ] Nenhum elogio exagerado
- [ ] Nenhuma crítica pesada
- [ ] Nenhum jargão de IA
- [ ] Nenhuma frase de IA

### Check 6 — Integridade dos dados
- [ ] Nenhum placeholder `[XXX]` não substituído no texto
- [ ] Nenhum valor claramente impossível (ex: R$ 0,00 em todas as métricas)

## Formato de saída

**Aprovado:**
```
✅ validate-report APROVADO
════════════════════════════════════════════════════
Todos os 6 checks passaram.
Texto pronto para publicação na Timeline do Reportei.
════════════════════════════════════════════════════
```

**Reprovado:**
```
❌ validate-report REPROVADO
════════════════════════════════════════════════════
Motivo(s):
- [Check X] [descrição do problema]
- [Check Y] [descrição do problema]

Ação necessária: regenerar o texto com as correções acima.
════════════════════════════════════════════════════
```

## Política de rejeição

- 1 ou mais checks falhados → REPROVAR (sem exceções)
- Após reprovação → `relatorio-chief` solicita regeneração ao `redator`
- Máximo de 2 tentativas de regeneração antes de interromper com erro
