---
task: check-compliance
agent: compliance-guard
elicit: false
inputs:
  - estrutura_campanha (output do kennedy)
outputs:
  - parecer_compliance
  - status (APROVADO | BLOQUEADO)
  - itens_pendentes
---

# Task: Verificar Conformidade CFM + LGPD

## Quando executar
Após kennedy montar a estrutura de campanha, antes da entrega final.

## Passos

1. Receber a estrutura de campanha preenchida
2. Percorrer o checklist de 8 itens (CFM + LGPD)
3. Para cada item BLOQUEADO: descrever exatamente o que precisa ser corrigido
4. Emitir parecer final

## Checklist executado automaticamente

```
CFM 2336/2023
[ ] Perfil tem nome completo + CRM + estado + "MÉDICO" visível?
[ ] Perfil tem especialidade + número RQE visível?
[ ] Se criativo usa antes/depois: tem texto educativo + complicações incluídas?
[ ] Nenhuma promessa de resultado garantido ou linguagem sensacionalista?
[ ] Imagens não foram manipuladas digitalmente?

LGPD
[ ] Site tem política de privacidade publicada?
[ ] Formulário/quiz tem campo de consentimento expresso?
[ ] Pixel instalado com conformidade (dados não enviados antes do consentimento)?
```

## Regra de bloqueio

**Se qualquer item for NÃO:** estrutura BLOQUEADA.
O compliance-guard não libera para avinash até correção.

## Output

```
PARECER DE COMPLIANCE
──────────────────────
STATUS: ✅ APROVADO / ❌ BLOQUEADO

Itens aprovados: [X]/8
Risco geral: BAIXO / MÉDIO / ALTO

Itens pendentes (se houver):
  ❌ [item] — o que fazer: [instrução clara]

PRÓXIMA FASE:
  ✅ APROVADO → avinash (validação de métricas)
  ❌ BLOQUEADO → retorna ao usuário para correção
```
