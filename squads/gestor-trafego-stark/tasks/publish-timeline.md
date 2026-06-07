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
  - conversas: nÃºmero de conversas
outputs:
  - timeline_event_id: ID do evento criado no Reportei
  - link_relatorio: URL do projeto no Reportei
  - confirmacao: boolean
---

# Task: publish-timeline â€” PublicaÃ§Ã£o na Timeline do Reportei

**FASE 4 do pipeline:** publica o relatÃ³rio aprovado como marco na Linha do Tempo do cliente no Reportei .

## PrÃ©-condiÃ§Ãµes

- `texto_relatorio` aprovado pelo `validate-report`
- `reportei_project_id` disponÃ­vel em `data/clientes.yaml`
- MCP `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` disponÃ­vel

## Passo 1 â€” Verificar deduplicaÃ§Ã£o

1. Verificar `data/timeline-log.jsonl` (se existir)
2. Se entrada com mesmo cliente e `periodo_fim` encontrada: perguntar ao gestor antes de republicar
3. Se nÃ£o encontrado: prosseguir normalmente

## Passo 2 â€” Resolver project_id

1. Buscar `reportei_project_id` de `data/clientes.yaml`
2. Se null â†’ chamar `list_projects` do MCP para listar projetos + buscar por nome
3. Sugerir ao gestor: "Adicionar ao data/clientes.yaml para prÃ³ximas execuÃ§Ãµes?"

## Passo 3 â€” Montar payload

> âš ï¸ O campo `content` deve ser **HTML vÃ¡lido**. Markdown enviado como `content` resulta em bloco corrido sem formataÃ§Ã£o no Reportei.

```yaml
project_id: {reportei_project_id}
title: "RelatÃ³rio de TrÃ¡fego"
content: {texto_relatorio}  # HTML: <p>, <strong>, <br> â€” nunca markdown
date: {periodo.fim}         # Data do domingo
```

## Passo 4 â€” Chamar create_timeline_event

```
MCP: mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
Tool: create_timeline_event
```

## Passo 5 â€” Confirmar publicaÃ§Ã£o e registrar log

1. Verificar que resposta do MCP contÃ©m ID do evento
2. Registrar em `data/timeline-log.jsonl`:
   ```json
   {"cliente": "nome", "slug": "slug", "periodo_fim": "YYYY-MM-DD", "event_id": "ID", "timestamp": "ISO 8601"}
   ```
3. Retornar `timeline_event_id` e `link_relatorio` ao `stark-chief`

## Passo 6 â€” Acionar whatsapp-writer

Passar ao `whatsapp-writer`:
- `cliente`, `nome_whatsapp`, `periodo_inicio`, `periodo_fim`
- `link`: `https://app.reportei.com/projects/{reportei_project_id}`
- `timeline_event_id`, `meta_spend`, `google_spend`, `conversas`

## Tratamento de erros

| Erro | AÃ§Ã£o |
|------|------|
| `reportei_project_id` nÃ£o encontrado | Listar projetos via `list_projects`, pedir confirmaÃ§Ã£o |
| MCP retorna erro | Registrar erro completo, NÃƒO tentar novamente automaticamente |
| Token expirado (401) | STOP â€” "Token Reportei invÃ¡lido ou expirado. Atualizar REPORTEI_TOKEN." |
| Sem acesso (403) | "Sem acesso ao projeto [ID]. Verificar permissÃµes do token." |

## SaÃ­da esperada

```
PUBLICAÃ‡ÃƒO CONCLUÃDA
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
âœ… Cliente: [NOME DO CLIENTE]
   Marco: "RelatÃ³rio de TrÃ¡fego"
   ID do evento: [timeline_event_id]
   Link: https://app.reportei.com/projects/{project_id}
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

