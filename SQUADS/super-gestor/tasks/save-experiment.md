---
task: save-experiment
agent: traffic-chief
elicit: true
inputs:
  - estrutura_campanha
  - status (EM_TESTE | VALIDADA | DESCARTADA)
  - resultado (opcional, para VALIDADA ou DESCARTADA)
outputs:
  - campaign-history.yaml atualizado
---

# Task: Salvar Experimento no Histórico

## Quando executar

- Ao criar nova estrutura → salva com status `EM_TESTE`
- Quando gestor reporta resultado → atualiza status para `VALIDADA` ou `DESCARTADA`

## Formato de entrada no histórico

```yaml
- id: [incremento automático, ex: EXP-007]
  data: [YYYY-MM-DD]
  plataforma: [Meta Ads / Google Ads / Ambos]
  procedimento: [ex: rinoplastia]
  publico:
    genero: [ex: feminino]
    idade: [ex: 28-48]
    localizacao: [ex: São Paulo capital]
    segmentacao: [ex: interesse rinoplastia + cirurgia plástica]
    tipo: [frio / lookalike / remarketing]
  campanha:
    objetivo: [ex: Mensagens WhatsApp]
    orcamento_diario: R$ [X]
  criativo:
    formato: [ex: Reel 15s]
    gancho: [ex: "O erro que deixa rinoplastia artificial"]
  status: EM_TESTE  # → VALIDADA ou DESCARTADA depois
  resultado: null   # preencher quando houver feedback
  cpa_real: null    # preencher quando houver dados
  origem: [original / cross-nicho: nome_do_nicho]
  notas: ""
```

## Atualização de status

Quando o gestor reportar resultado, o traffic-chief pergunta:
1. "A estrutura EXP-00X funcionou?"
2. Se sim → muda para `VALIDADA`, pede CPA real e notas
3. Se não → muda para `DESCARTADA`, pede motivo principal

## Regra anti-repetição

O kennedy consulta este arquivo antes de qualquer nova sugestão e rejeita combinações com mesmos 3 campos: plataforma + segmentação + formato.
