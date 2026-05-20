---
task: publish-timeline
agent: publicador
elicit: false
inputs:
  - texto_relatorio: texto aprovado pela task validate-report
  - project_id: ID do projeto no Reportei
  - cliente: nome do cliente
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA}
outputs:
  - timeline_event_id: ID do evento criado
  - confirmacao: boolean
---

# Task: publish-timeline — Publicação na Timeline do Reportei

**Atividade 3 do pipeline:** publica o relatório aprovado como marco na Linha do Tempo do cliente no Reportei.

## Pré-condições

- `texto_relatorio` aprovado pelo `quality-gate` (validate-report)
- `project_id` disponível (da config ou resolvido via MCP `list_projects`)
- MCP `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` disponível

## Passos

### Passo 1 — Verificar project_id
1. Buscar em `config/clientes-config.yaml` o campo `reportei_project_id` do cliente
2. Se não mapeado → chamar `list_projects` do MCP para listar projetos
3. Identificar o projeto pelo nome do cliente
4. Sugerir ao usuário: "Adicionar ao clientes-config.yaml para próximas execuções?"

### Passo 2 — Montar payload do evento
```yaml
project_id: {project_id}
title: "Relatório Semanal — {periodo.inicio} a {periodo.fim}"
content: {texto_relatorio}
date: {periodo.fim}  # data do domingo
```

### Passo 3 — Chamar create_timeline_event
```
MCP: mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
Tool: create_timeline_event
Payload: (ver passo 2)
```

### Passo 4 — Confirmar publicação
1. Verificar que resposta do MCP contém ID do evento
2. Retornar `timeline_event_id` ao `relatorio-chief`

## Tratamento de erros

| Erro | Ação |
|------|------|
| `project_id` não encontrado | Listar projetos via `list_projects`, pedir confirmação |
| MCP retorna erro | Registrar erro completo, NÃO tentar novamente automaticamente |
| Token expirado (401) | STOP — "Atualizar REPORTEI_TOKEN" |
| Duplicate event | Avisar usuário: "Já existe evento para este período?" |

## Saída esperada

```
✅ PUBLICAÇÃO CONCLUÍDA
════════════════════════════════════════════════════
Cliente:    [NOME DO CLIENTE]
Marco:      "Relatório Semanal — [DD/MM] a [DD/MM/AAAA]"
Event ID:   [timeline_event_id]
Publicado:  [timestamp]

Visualizar: Reportei → Projetos → [Cliente] → Timeline
════════════════════════════════════════════════════
```
