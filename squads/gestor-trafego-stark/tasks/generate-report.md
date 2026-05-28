---
task: generate-report
agent: redator
squad: gestor-trafego-stark
elicit: false
inputs:
  - metricas: saída da task fetch-metrics (colunas por cliente)
  - contexto_cliente: objeto retornado pelo contexto-cliente (pode ser disponivel: false)
  - cliente: nome do cliente (de data/clientes.yaml)
  - reportei_project_id: ID do projeto no Reportei
  - especialidade: campo do cliente em data/clientes.yaml
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA}
outputs:
  - texto_relatorio: narrativa completa em HTML para publicação no Reportei
---

# Task: generate-report — Geração do Relatório Narrativo

**FASE 3 do pipeline:** gera o texto do relatório semanal em HTML combinando métricas com dados extras do MCP Reportei e contexto do cliente.

## Pré-condições

- Métricas da task `fetch-metrics` disponíveis e aprovadas pelo `verify-fill`
- MCP Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` disponível
- Template em `templates/relatorio-template.md` carregado

## Passo 1 — Incorporar contexto do cliente

Se `contexto_cliente.disponivel: true`:
- Usar `momento_comercial_atual` para enriquecer parágrafo narrativo (se relevante)
- Usar `pontos_de_atencao` para referenciar padrões recorrentes de forma natural
- Usar `aprendizados_recentes` como referência interna — nunca expor literalmente
- Nunca citar o sistema de memória no texto final

Se `disponivel: false`: pular silenciosamente, sem aviso no texto.

## Passo 2 — Classificar CPL por especialidade

1. Ler `data/thresholds-por-especialidade.yaml` → bloco da `especialidade` do cliente
2. Para `cirurgia_ortognatica`: CPL = custo por conversão Google Ads (não por conversa)
3. Para demais: CPL = custo por conversa WhatsApp Meta Ads
4. Classificar: saudavel / atencao / critico (nunca expor esses termos no texto)
5. Nível atencao: "O CPL de R$[X] ficou acima da referência para a especialidade."
6. Nível critico: "O CPL de R$[X] ficou acima de R$[threshold] — recomenda-se revisar segmentação e criativos."
7. Nível saudavel: nenhuma frase adicional sobre threshold

## Passo 3 — Consultar histórico

Ler `data/historico-clientes.yaml` → slug do cliente → últimas 4 entradas.
Calcular variação % do CPL atual vs média histórica.

| Variação | Frase no parágrafo narrativo |
|----------|------------------------------|
| `< -10%` | "O CPL ficou [X]% abaixo da média histórica das últimas [N] semanas." |
| `> +15%` | "O CPL ficou [X]% acima da média histórica das últimas [N] semanas — atenção." |
| Entre -10% e +15% | Omitir ou "O CPL manteve-se estável em relação ao histórico recente." |

Fallback silencioso se arquivo ausente ou menos de 2 entradas.

## Passo 4 — Buscar dados extras via MCP Reportei

```
MCP: mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
Tools: get_report / get_project_metrics
```

Extrair: CPL, CPC, cliques totais, impressões, variação vs semana anterior.
Se MCP indisponível → prosseguir apenas com métricas base (sem inventar dados).

## Passo 5 — Selecionar template e preencher

| Dados disponíveis | Template |
|-------------------|---------|
| `meta_spend > 0` e `google_spend = 0` | META-ONLY |
| `meta_spend > 0` e `google_spend > 0` | META + GOOGLE |
| `meta_spend = 0` e `google_spend > 0` | GOOGLE-ONLY |

Substituir todos os placeholders. Nunca deixar `[XXX]` não substituído.

## Passo 6 — Aplicar regras de voz

Revisar contra lista de palavras proibidas do `CLAUDE.md`:
- Elogios: incrível, surpreendente, excelente, extraordinário, impressionante, fantástico, brilhante, notável
- Críticas: preocupante, alarmante, crítico, péssimo, desastroso, infelizmente
- Jargão de IA: alavancar, potencializar, maximizar, robusto, sinergia, ecossistema, transformador, impactante
- Frases de IA: "é importante ressaltar", "cabe destacar", "vale salientar", "nesse sentido", "isso posto", "outrossim", "observa-se que"

## Passo 7 — Entregar para validate-report

Retornar `texto_relatorio` (HTML) para a task `validate-report`.

## Restrições

- **Nunca inventar dados** — se não há fonte, não mencionar
- **Formato monetário:** R$ X.XXX,XX (vírgula decimal, ponto milhar)
- **Datas:** formato `DD/MM/AAAA`
- **CPL = 0 conversas:** CPL = `-` (nunca dividir por zero)
- **HTML obrigatório:** `<p>`, `<strong>`, `<br>` — nunca markdown puro
