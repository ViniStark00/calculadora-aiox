---
task: publish-timeline
agent: publicador
squad: gestor-trafego-stark
elicit: false
inputs:
  - texto_relatorio: texto HTML aprovado pela task validate-report
  - reportei_project_id: ID do projeto no Reportei (de data/clientes.yaml)
  - cliente: nome do cliente
  - nome_whatsapp: campo nome_whatsapp de data/clientes.yaml
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA}
  - meta_spend: investimento Meta Ads
  - google_spend: investimento Google Ads
  - conversas: número de conversas
outputs:
  - timeline_event_id: ID do evento criado no Reportei
  - link_relatorio: URL do projeto no Reportei
  - confirmacao: boolean
---

# Task: publish-timeline — Publicação na Timeline do Reportei

**FASE 4 do pipeline:** publica o relatório aprovado como marco na Linha do Tempo do cliente no Reportei e aciona o `whatsapp-writer`.

## Pré-condições

- `texto_relatorio` aprovado pelo `validate-report`
- `reportei_project_id` disponível em `data/clientes.yaml`
- MCP `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` disponível

## Passo 1 — Verificar deduplicação

1. Verificar `data/timeline-log.jsonl` (se existir)
2. Se entrada com mesmo cliente e `periodo_fim` encontrada: perguntar ao gestor antes de republicar
3. Se não encontrado: prosseguir normalmente

## Passo 2 — Resolver project_id

1. Buscar `reportei_project_id` de `data/clientes.yaml`
2. Se null → chamar `list_projects` do MCP para listar projetos + buscar por nome
3. Sugerir ao gestor: "Adicionar ao data/clientes.yaml para próximas execuções?"

## Passo 3 — Montar payload

> ⚠️ O campo `content` deve ser **HTML válido**. Markdown enviado como `content` resulta em bloco corrido sem formatação no Reportei.

```yaml
project_id: {reportei_project_id}
title: "Relatório de Tráfego"
content: {texto_relatorio}  # HTML: <p>, <strong>, <br> — nunca markdown
date: {periodo.fim}         # Data do domingo
```

## Passo 4 — Chamar create_timeline_event

```
MCP: mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
Tool: create_timeline_event
```

## Passo 5 — Confirmar publicação e registrar log

1. Verificar que resposta do MCP contém ID do evento
2. Registrar em `data/timeline-log.jsonl`:
   ```json
   {"cliente": "nome", "slug": "slug", "periodo_fim": "YYYY-MM-DD", "event_id": "ID", "timestamp": "ISO 8601"}
   ```
3. Retornar `timeline_event_id` e `link_relatorio` ao `stark-chief`

## Passo 6 — Acionar whatsapp-writer

Passar ao `whatsapp-writer`:
- `cliente`, `nome_whatsapp`, `periodo_inicio`, `periodo_fim`
- `link`: `https://app.reportei.com/projects/{reportei_project_id}`
- `timeline_event_id`, `meta_spend`, `google_spend`, `conversas`

## Tratamento de erros

| Erro | Ação |
|------|------|
| `reportei_project_id` não encontrado | Listar projetos via `list_projects`, pedir confirmação |
| MCP retorna erro | Registrar erro completo, NÃO tentar novamente automaticamente |
| Token expirado (401) | STOP — "Token Reportei inválido ou expirado. Atualizar REPORTEI_TOKEN." |
| Sem acesso (403) | "Sem acesso ao projeto [ID]. Verificar permissões do token." |

## Saída esperada

```
PUBLICAÇÃO CONCLUÍDA
════════════════════════════════════════════════════
✅ Cliente: [NOME DO CLIENTE]
   Marco: "Relatório de Tráfego"
   ID do evento: [timeline_event_id]
   Link: https://app.reportei.com/projects/{project_id}
════════════════════════════════════════════════════
```
