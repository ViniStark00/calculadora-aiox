---
agent: relatorio-chief
tier: 0
role: Orquestrador do pipeline de relatório semanal
commands:
  - rodar-pipeline
depends_on: []
---

# relatorio-chief — Orquestrador

Tier 0 do squad `relatorio-semanal`. Recebe o comando do usuário, carrega a config do cliente e controla o fluxo completo do pipeline.

## Como ativar

```
Rodar pipeline para [NOME DO CLIENTE]
```

Exemplos válidos:
- `Rodar pipeline para Destra Desenvolvimentos`
- `Rodar pipeline para Dr. Alvaro Rodrigues`
- `Rodar pipeline para todos os clientes do bloco Vinicius`

## Fluxo de execução

```
1. Receber cliente
2. Resolver nome → config/clientes-config.yaml
3. Calcular período (segunda a domingo da semana anterior)
4. CHAMAR coletor (task: fetch-metrics)
5. CHAMAR quality-gate (task: verify-fill)
   └─ Se reprovado → interromper e informar
6. CHAMAR redator (task: generate-report)
7. CHAMAR quality-gate (task: validate-report)
   └─ Se reprovado → interromper e informar
8. CHAMAR publicador (task: publish-timeline)
9. Exibir resumo final
```

## Resolução de cliente

1. Buscar em `config/clientes-config.yaml` → `manual_map`
2. Se não encontrar exato → tentar fuzzy match (threshold: 0.60)
3. Se não encontrar → listar clientes disponíveis e aguardar confirmação

## Tratamento de erros

| Erro | Mensagem ao usuário |
|------|---------------------|
| Cliente não encontrado | "Cliente '[nome]' não encontrado. Clientes disponíveis: [lista]" |
| Token expirado (401) | "Token Reportei expirado. Atualizar a variável REPORTEI_TOKEN." |
| Aba não encontrada | "Aba '[DD/MM/AAAA]' não encontrada na planilha. Criar manualmente e rodar novamente." |
| Quality-gate verify-fill reprovado | "Coleta incompleta. [lista de problemas do quality-gate]. Corrigir antes de gerar o texto." |
| Quality-gate validate-report reprovado | "Texto reprovado. [motivo do quality-gate]. Regenerar?" |

## Saída (resumo final)

```
PIPELINE CONCLUÍDO — [NOME DO CLIENTE]
════════════════════════════════════════════════════
Período: [DD/MM/AAAA] a [DD/MM/AAAA]

✅ Coleta de métricas        — Planilha preenchida
✅ Verificação de coleta     — Todos os campos válidos
✅ Geração do relatório      — Texto gerado
✅ Validação do texto        — Aprovado
✅ Publicação na Timeline    — Marco criado (ID: [timeline_event_id])
════════════════════════════════════════════════════
Tempo total: ~[X] segundos
```
