---
task: preencher-clickup
agent: clickup-writer
squad: gestor-trafego-stark
elicit: false
inputs:
  - cliente: nome do cliente (de data/clientes.yaml)
  - gestor: vinicius | gustavo (resolvido pelo stark-chief)
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA}
outputs:
  - draft_aprovado: boolean
  - doc_page_id: ID da subpágina atualizada no ClickUp
  - confirmacao_append: boolean
---

# Task: preencher-clickup — Status Report Narrativo no ClickUp

**FASE 5 do pipeline:** reconstitui ações de gestão da semana e appenda narrativa aprovada na subpágina do cliente no ClickUp.

## Pré-condições

- MCP ClickUp `mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf` disponível
- Gestor e doc de destino resolvidos pelo `stark-chief`
- Subpágina do cliente existe no doc (nunca criar nova página)

## Passo 1 — Resolver doc de destino

```
se gestor == "vinicius": doc = "Status Report - Vinicius"
se gestor == "gustavo":  doc = "Status Report - Gustavo"
se cliente.gestores == [vinicius, gustavo]: perguntar antes de prosseguir
```

## Passo 2 — Localizar subpágina no ClickUp

```
clickup_get_workspace_hierarchy → localizar doc resolvido
clickup_list_document_pages → capturar page_id da subpágina do cliente
```

Se subpágina não encontrada → PARAR e notificar `stark-chief`. Nunca criar subpágina.

## Passos 3–7 — Reconstituição de ações

Ver workflow completo em `agents/clickup-writer.md` (passos 3 a 7):
- Passo 3: sinais do Reportei (métricas, timeline)
- Passo 4: sinais do Meta Ads (entidades, anomalias, tendências)
- Passo 5: anotações de reunião (Gmail + Drive)
- Passo 6: tarefas concluídas no ClickUp (criativos + otimizações)
- Passo 7: cruzar fontes e inferir ações

## Passo 8 — Gerar draft e apresentar para aprovação

**OBRIGATÓRIO:** nunca escrever no ClickUp sem aprovação explícita.

Exibir draft completo com:
- Cabeçalho do bloco: `## Semana de DD/MM a DD/MM/AAAA`
- Seções: Resumo da semana / O que subimos de novo / O que ajustamos e pausamos
- Indicar: doc de destino, subpágina, blocos sem lastro qualitativo
- Aguardar aprovação: gestor pode aprovar, corrigir ou reprovar

## Passo 9 — Appendar na subpágina

**Só executar após aprovação explícita.**

```
clickup_get_document_pages → ler conteúdo atual da subpágina
Concatenar conteúdo existente + nova seção SEMANA_CORRENTE
clickup_update_document_page → salvar conteúdo atualizado
```

Regras:
- NUNCA substituir conteúdo existente — sempre append no final
- NUNCA criar novas páginas ou tasks

## Passo 10 — Gate de qualidade

Acionar `@validator` com `gate_clickup`.

## Tratamento de erros

| Situação | Ação |
|----------|------|
| Subpágina não encontrada | PARAR — notificar gestor |
| MCP ClickUp indisponível | Registrar FASE 5 como SKIPPED, continuar FASE 6 |
| Gestor não identificado para cliente compartilhado | PARAR — perguntar ao gestor |
| Aprovação negada | Aguardar correções e nova aprovação |
