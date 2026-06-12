---
task: publish-timeline
agent: publicador
squad: gestor-trafego-stark
elicit: false
inputs:
  - texto_relatorio: texto HTML aprovado pela task validate-report
  - reportei_project_id: ID do projeto no Reportei (de data/clientes.yaml)
  - cliente: nome do cliente
  - slug: slug do cliente
  - nome_whatsapp: campo nome_whatsapp de data/clientes.yaml
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA}
  - meta_spend: investimento Meta Ads
  - google_spend: investimento Google Ads
  - conversas: número de conversas WhatsApp
outputs:
  - timeline_event_id: ID do evento criado no Reportei
  - report_id: ID do relatório criado no Reportei
  - link_relatorio: URL do projeto no Reportei
  - confirmacao: boolean
---

# Task: publish-timeline — Publicação na Timeline do Reportei

**FASE 4 do pipeline:** cria o relatório no Reportei, publica o marco na Linha do Tempo com o relatório vinculado.

> ⚠️ ORDEM OBRIGATÓRIA: o relatório deve ser criado ANTES do marco. O marco recebe o `report_id` do relatório criado.

---

## PRÉ-CHECKLIST — verificar antes de qualquer chamada ao MCP

- [ ] `texto_relatorio` aprovado pelo `validate-report` e em HTML (nunca markdown)
- [ ] `reportei_project_id` disponível
- [ ] `texto_relatorio` NÃO contém link `🔗 Confira os dados...` — remover se presente
- [ ] `data_geracao` = hoje (não o fim do período analisado)

---

## Passo 1 — Verificar deduplicação

1. Verificar `data/timeline-log.jsonl`
2. Se entrada com mesmo `cliente` e `periodo_fim` já existir: perguntar ao gestor antes de republicar
3. Se não encontrado: prosseguir

---

## Passo 2 — Resolver project_id

1. Buscar `reportei_project_id` de `data/clientes.yaml`
2. Se null → chamar `list_projects` do MCP para listar projetos + buscar por nome
3. Sugerir ao gestor: "Adicionar ao data/clientes.yaml para próximas execuções?"

---

## Passo 2.5 — Criar Relatório Reportei

> ⚠️ Este passo é OBRIGATÓRIO. Sem um relatório criado e vinculado, o marco não tem valor para o cliente.

### Selecionar integrações (CRÍTICO — leia com atenção)

Chamar `list_integrations` para o projeto e selecionar APENAS integrações de **mídia paga**:

| Incluir | Slug | Motivo |
|---------|------|--------|
| ✅ Sim | `facebook_ads` | Meta Ads — canal principal |
| ✅ Sim | `google_adwords` | Google Ads — se existir |
| ❌ Não | `instagram_business` | Gera seção de conteúdo orgânico — distorce o relatório de tráfego |
| ❌ Não | `facebook` | Página Facebook — métricas orgânicas |
| ❌ Não | `google_analytics_4` | GA4 — separado do tráfego pago |
| ❌ Não | `tiktok` | Conteúdo orgânico |
| ❌ Não | `google_sheets` | Planilhas — não pertencem a relatório de tráfego |

### Chamar create_report

```
MCP: mcp__claude_ai_Reportei_AI
Tool: create_report
```

```yaml
project_id: {reportei_project_id}
title: "Relatório de Tráfego — {DD/MM} a {DD/MM/AAAA}"
subtitle: "Semana {DD/MM} a {DD/MM/AAAA}"
date_start: {periodo.inicio}    # YYYY-MM-DD
date_end: {periodo.fim}         # YYYY-MM-DD
comparison_start: {periodo.inicio - 7 dias}
comparison_end: {periodo.fim - 7 dias}
integration_ids: [{ids_midia_paga}]
template_id: 144815             # "Tráfego 2.0" — template padrão do squad
```

→ Guardar `report_id` retornado para o Passo 3.

---

## Passo 3 — Montar payload do marco

> ⚠️ `content` deve ser HTML válido seguindo `templates/relatorio-template.md`. Markdown resulta em bloco corrido no Reportei.
> ⚠️ `content` NÃO deve conter link `🔗 Confira os dados...` — o relatório já está vinculado via `report_id`.

```yaml
project_id: {reportei_project_id}
title: "Relatório de Tráfego — {DD/MM} a {DD/MM/AAAA}"
content: {texto_relatorio}      # HTML: <p>, <strong>, <br> — nunca markdown, nunca link
date: {data_geracao}            # Data de hoje (dia em que a rotina é executada) — NÃO o fim do período
report_id: {report_id}          # ID do relatório criado no Passo 2.5 — OBRIGATÓRIO
```

---

## Passo 4 — Chamar create_timeline_event

```
MCP: mcp__claude_ai_Reportei_AI
Tool: create_timeline_event
```

---

## Passo 5 — Confirmar publicação e registrar log

1. Verificar que resposta do MCP contém `id` do evento
2. Registrar em `data/timeline-log.jsonl`:
   ```json
   {
     "cliente": "{slug}",
     "periodo_inicio": "YYYY-MM-DD",
     "periodo_fim": "YYYY-MM-DD",
     "tipo": "semanal",
     "report_id": {report_id},
     "timeline_event_id": {timeline_event_id},
     "project_id": {reportei_project_id},
     "publicado_em": "ISO 8601",
     "titulo": "Relatório de Tráfego — DD/MM a DD/MM/AAAA"
   }
   ```
3. Retornar `timeline_event_id`, `report_id` e `link_relatorio` ao `stark-chief`

---

## Passo 6 — Acionar whatsapp-writer

Passar ao `whatsapp-writer`:
- `cliente`, `nome_whatsapp`, `periodo_inicio`, `periodo_fim`
- `link`: `https://app.reportei.com/projects/{reportei_project_id}`
- `timeline_event_id`, `meta_spend`, `google_spend`, `conversas`

---

## Tratamento de erros

| Erro | Ação |
|------|------|
| `reportei_project_id` não encontrado | Listar projetos via `list_projects`, pedir confirmação |
| `create_report` falha | Registrar erro, NÃO criar o marco sem report_id — notificar gestor |
| `create_timeline_event` falha | Registrar erro completo, NÃO tentar novamente automaticamente |
| Token expirado (401) | STOP — "Token Reportei inválido ou expirado. Atualizar REPORTEI_TOKEN." |
| Sem acesso (403) | "Sem acesso ao projeto [ID]. Verificar permissões do token." |

---

## Saída esperada

```
PUBLICAÇÃO CONCLUÍDA
══════════════════════════════════════════════════════
✅ Cliente: [NOME DO CLIENTE]
   Relatório: [report_id] — "Relatório de Tráfego — DD/MM a DD/MM/AAAA"
   Marco: [timeline_event_id] — vinculado ao relatório
   Link: https://app.reportei.com/projects/{project_id}
══════════════════════════════════════════════════════
```
