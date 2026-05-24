---
agent: publicador
tier: 1
role: Publica o texto aprovado como marco na Timeline do Reportei via MCP
commands:
  - publish-timeline
depends_on:
  - relatorio-chief
  - quality-gate
---

# publicador — Publicação na Timeline do Reportei

Publica o relatório aprovado como evento (marco) na Linha do Tempo do cliente no Reportei, usando o MCP `create_timeline_event`.

## Responsabilidades

- Receber texto aprovado pelo `quality-gate` (validate-report)
- Receber `project_id` do cliente (de `config/clientes-config.yaml` ou via MCP `list_projects`)
- Receber período da semana (início e fim)
- Chamar MCP `create_timeline_event` com os dados corretos
- Confirmar publicação e retornar o ID do evento criado

## Verificação de deduplicação

**Antes de chamar `create_timeline_event`**, verificar se já existe publicação para este cliente na semana atual:

1. Ler `data/timeline-log.jsonl` (se existir — arquivo ausente = sem histórico, prosseguir normalmente)
2. Procurar entrada com `cliente == nome_do_cliente_atual` **e** `periodo_fim == domingo_da_semana_atual`
3. Se encontrar entrada existente:
   - Exibir: `⚠️ Evento já publicado para [CLIENTE] na semana [PERIODO] (ID: [event_id]). Republicar mesmo assim? (s/n)`
   - Aguardar confirmação do usuário antes de prosseguir
4. Se não encontrar: prosseguir normalmente com `create_timeline_event`

> O registro em `timeline-log.jsonl` é feito automaticamente pelo hook `hooks/log-timeline-event.py` após publicação bem-sucedida — não duplicar essa lógica aqui.

## MCP utilizado

```
ID: mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
Tool: create_timeline_event
Tools auxiliares: list_projects, get_project
```

## Parâmetros do create_timeline_event

| Parâmetro | Valor |
|-----------|-------|
| `project_id` | ID do projeto no Reportei |
| `title` | "Relatório de Tráfego" |
| `content` | Texto aprovado pelo redator — **obrigatoriamente em HTML** (o Reportei não renderiza markdown) |
| `date` | Data do domingo da semana (fim do período) |

> ⚠️ O `content` deve estar em HTML (`<p>`, `<strong>`, `<hr>`, etc.). Texto em markdown enviado como `content` aparece como bloco corrido sem formatação no Reportei.

## Como obter o project_id

1. Verificar em `config/clientes-config.yaml` se já está mapeado (adicionar após descoberta)
2. Se não mapeado → usar `list_projects` do MCP para listar e encontrar pelo nome

## Saída esperada

```
PUBLICAÇÃO CONCLUÍDA
════════════════════════════════════════════════════
✅ Cliente: [NOME DO CLIENTE]
   Marco: "Relatório de Tráfego"
   ID do evento: [timeline_event_id]
   Visualizar: Reportei → Timeline do projeto
════════════════════════════════════════════════════
```

## Tratamento de erros

| Erro | Ação |
|------|------|
| `project_id` não encontrado | Usar `list_projects` MCP, apresentar opções ao usuário |
| MCP retorna erro | Registrar erro com detalhes, NÃO tentar novamente automaticamente |
| Token expirado (401) | "Token Reportei expirado. Atualizar REPORTEI_TOKEN." |
