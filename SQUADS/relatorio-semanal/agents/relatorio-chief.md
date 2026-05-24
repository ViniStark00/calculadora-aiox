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
1.  Receber cliente
2.  Resolver nome → config/clientes-config.yaml
3.  Calcular período (segunda a domingo da semana anterior)
4.  CHAMAR contexto-cliente (LEITURA) — NÃO-BLOQUEANTE
    └─ Carrega contexto do Drive; falha → continua sem contexto
5.  CHAMAR coletor (task: fetch-metrics)
6.  CHAMAR coletor (task: save-history) — NÃO-BLOQUEANTE
7.  CHAMAR quality-gate (task: verify-fill)
    └─ Se reprovado → interromper e informar
8.  CHAMAR redator (task: generate-report)
9.  CHAMAR quality-gate (task: validate-report)
    └─ Se reprovado (1ª vez) → retornar ao redator para regenerar
    └─ Se reprovado (2ª vez) → interromper e informar
10. CHAMAR publicador (task: publish-timeline)
11. CHAMAR whatsapp-writer — OBRIGATÓRIO, executa automaticamente sem aguardar solicitação
12. CHAMAR monitor-tarefas-clickup — NÃO-BLOQUEANTE
    └─ Marca tarefas concluídas no ClickUp; falha → aviso, continua
13. CHAMAR contexto-cliente (ATUALIZAÇÃO) — NÃO-BLOQUEANTE
    └─ Atualiza aprendizados no Drive; falha → aviso, continua
14. Exibir resumo final
```

## Resolução de cliente

1. Buscar em `config/clientes-config.yaml` → `manual_map`
2. Se não encontrar exato → tentar fuzzy match (threshold: 0.60)
3. Se não encontrar → listar clientes disponíveis e aguardar confirmação
4. Ao resolver o cliente, carregar também `nome_whatsapp_por_cliente[cliente]` → repassar ao publicador como `nome_whatsapp` para uso no whatsapp-writer

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

✅ Contexto carregado        — Drive OK  (ou ⚠️ Drive indisponível)
✅ Coleta de métricas        — Planilha preenchida
✅ Histórico salvo           — (ou ⚠️ aviso)
✅ Verificação de coleta     — Todos os campos válidos
✅ Geração do relatório      — Texto gerado
✅ Validação do texto        — Aprovado
✅ Publicação na Timeline    — Marco criado (ID: [timeline_event_id])
✅ Mensagem WhatsApp         — Pronta para copiar
✅ Tarefas ClickUp           — [N] marcadas  (ou ⚠️ ClickUp indisponível)
✅ Contexto atualizado       — Drive OK  (ou ⚠️ não atualizado esta semana)
════════════════════════════════════════════════════
Tempo total: ~[X] segundos
```
