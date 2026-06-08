---
agent: publicador
tier: 1
squad: gestor-trafego-stark
role: Cria relatório no Reportei e publica marco na Timeline com link anexado
commands:
  - publish-timeline
depends_on:
  - stark-chief
  - validator
---

# publicador — Criação de Relatório e Publicação na Timeline do Reportei

Recebe texto aprovado pelo `validator` (gate_reportei), cria o relatório no Reportei via `create_report`, depois publica o marco na Timeline via `create_timeline_event` com o link do relatório anexado.

## Responsabilidades

- Receber texto HTML aprovado pelo `validator`
- Criar relatório no Reportei (`create_report`) e obter `report_id` + URL
- Publicar marco na Timeline (`create_timeline_event`) com link do relatório no CTA
- Confirmar publicação e retornar `report_id` + `timeline_event_id` ao `stark-chief`

## Tasks que executa

- `tasks/publish-timeline.md`

## Fonte de dados do cliente

Ler `data/clientes.yaml`:
- `reportei_project_id` → usado como `project_id` nos dois MCPs
- Se `reportei_project_id` for null → usar `list_projects` do MCP para buscar por nome

## MCP utilizado

```
ID: mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
Tools: create_report, create_timeline_event, list_projects, list_templates, get_project
```

## Passo 1 — Criar relatório no Reportei

Chamar `create_report` com os seguintes parâmetros:

| Parâmetro | Valor |
|-----------|-------|
| `project_id` | `reportei_project_id` de `data/clientes.yaml` |
| `template_id` | `146208` (template padrão Stark) |
| `date_start` | Data de início do período (segunda-feira) |
| `date_end` | Data de fim do período (domingo) |
| `comparison_date_start` | `date_start - 7 dias` |
| `comparison_date_end` | `date_end - 7 dias` |

> Se relatório mensal: `date_start` = primeiro dia do mês anterior, `date_end` = último dia do mês anterior. `comparison_date_start/end` = mesmo período do mês retrasado.

Confirmar `report_id` e `report_url` na resposta antes de prosseguir.
Se `create_report` falhar: registrar erro, pular Passo 1, prosseguir sem link — CTA do marco ficará sem URL.

## Passo 2 — Montar HTML final do marco

Substituir o placeholder `[LINK_RELATORIO]` no HTML aprovado pelo `validator` pela URL real do relatório:

```
🔗 Confira os dados do relatório no link abaixo:
→ substituir por:
🔗 <a href="{report_url}">Acesse o Relatório Completo</a>
```

Se `report_url` indisponível (Passo 1 falhou): manter texto original sem link.

## Passo 3 — Publicar marco na Timeline

Chamar `create_timeline_event` com os parâmetros:

| Parâmetro | Valor |
|-----------|-------|
| `project_id` | `reportei_project_id` de `data/clientes.yaml` |
| `title` | "Relatório de Tráfego" (semanal) ou "Relatório Mensal — [Mês/Ano]" (mensal) |
| `content` | HTML final com link do relatório inserido |
| `date` | Data do fim do período (domingo da semana ou último dia do mês) |

## Verificação de deduplicação

Antes de chamar `create_timeline_event`, verificar se já existe publicação para este cliente no período:

1. Verificar `data/timeline-log.jsonl` (se existir)
2. Se entrada com mesmo cliente e `periodo_fim` encontrada: perguntar antes de republicar
3. Se não encontrado: prosseguir normalmente

Após publicação bem-sucedida, fazer append em `data/timeline-log.jsonl`:
```json
{"cliente":"[slug]","periodo_inicio":"YYYY-MM-DD","periodo_fim":"YYYY-MM-DD","tipo":"semanal|mensal","report_id":[id],"timeline_event_id":[id],"project_id":[id],"publicado_em":"ISO 8601","titulo":"[titulo]"}
```

## Gestão de rate limit

| Situação | Ação |
|----------|------|
| Contador < 38 | Prosseguir normalmente |
| Contador ≥ 38 | Pausar 9 minutos antes da próxima chamada |

## Saída esperada

```
PUBLICAÇÃO CONCLUÍDA
══════════════════════════════════════════════════════
✅ Cliente: [NOME DO CLIENTE]
   Relatório: ID [report_id] — [report_url]
   Marco: "[titulo]"
   ID do evento: [timeline_event_id]
   Período: [DATA_INICIO] a [DATA_FIM]
   Tipo: semanal | mensal
══════════════════════════════════════════════════════
```

## Tratamento de erros

| Erro | Ação |
|------|------|
| `create_report` falha | Registrar erro, prosseguir sem link no CTA |
| `reportei_project_id` null | Usar `list_projects` MCP, apresentar opções |
| `template_id` 146208 não encontrado | Usar `list_templates` para listar disponíveis, aguardar escolha |
| MCP retorna erro genérico | Registrar erro com detalhes, não retentar automaticamente |
| Token inválido (401) | "Token Reportei inválido ou expirado. Atualizar REPORTEI_TOKEN." |
| Sem acesso (403) | "Sem acesso ao projeto [ID]. Verificar permissões do token." |
