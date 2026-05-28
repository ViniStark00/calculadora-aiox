---
task: validate-report
agent: validator
squad: gestor-trafego-stark
elicit: false
inputs:
  - texto_relatorio: texto HTML gerado pela task generate-report
  - cliente: nome do cliente esperado no texto
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA}
  - tentativa: 1 | 2
outputs:
  - aprovado: boolean
  - motivos_reprovacao: lista (vazia se aprovado)
---

# Task: validate-report — Validação do Relatório Narrativo

**Pós-FASE 3:** valida se o texto HTML gerado contém todos os elementos obrigatórios e não viola as regras de voz antes da publicação no Reportei.

## Checklist de validação (6 checks)

### Check 1 — Datas presentes
- [ ] Texto contém DATA_INICIO no formato DD/MM/AAAA
- [ ] Texto contém DATA_FIM no formato DD/MM/AAAA

### Check 2 — Valores monetários
- [ ] Texto contém pelo menos um valor no formato R$ X.XXX,XX ou R$ XXX,XX

### Check 3 — Nome do cliente
- [ ] Texto menciona o nome do cliente ou variação reconhecível

### Check 4 — Análise presente
- [ ] Texto tem no mínimo 3 parágrafos HTML (`<p>...</p>`)
- [ ] Texto contém mais do que apenas lista de números (tem contexto ou análise)

### Check 5 — Palavras proibidas ausentes
- [ ] Nenhum elogio exagerado (incrível, surpreendente, excelente, extraordinário, impressionante, fantástico, brilhante, notável)
- [ ] Nenhuma crítica pesada (preocupante, alarmante, crítico, péssimo, desastroso, infelizmente)
- [ ] Nenhum jargão de IA (alavancar, potencializar, maximizar, robusto, sinergia, ecossistema, transformador, impactante)
- [ ] Nenhuma frase de IA ("é importante ressaltar", "cabe destacar", "vale salientar", "nesse sentido", "isso posto", "outrossim", "observa-se que")

### Check 6 — Integridade do HTML
- [ ] Nenhum placeholder `[XXX]` não substituído no texto
- [ ] Nenhum valor claramente impossível (ex: R$ 0,00 em todas as métricas sem justificativa)
- [ ] HTML bem formado: tags `<p>`, `<strong>`, `<br>` abertas e fechadas corretamente

## Formato de saída

**Aprovado:**
```
✅ validate-report APROVADO
════════════════════════════════════════════════════
Todos os 6 checks passaram.
Texto HTML pronto para publicação na Timeline do Reportei.
════════════════════════════════════════════════════
```

**Reprovado:**
```
❌ validate-report REPROVADO (tentativa N/2)
════════════════════════════════════════════════════
Motivo(s):
- [Check X] [descrição do problema]
- [Check Y] [descrição do problema]

Ação necessária: regenerar o texto com as correções acima.
════════════════════════════════════════════════════
```

## Política de rejeição

- 1 ou mais checks falhados → REPROVAR (sem exceções)
- Após reprovação 1ª vez → `stark-chief` solicita regeneração ao `redator`
- Após reprovação 2ª vez → interromper com erro; aguardar ação do gestor
