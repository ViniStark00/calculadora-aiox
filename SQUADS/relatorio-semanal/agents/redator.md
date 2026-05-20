---
agent: redator
tier: 1
role: Gera narrativa do relatório semanal usando métricas e dados do MCP Reportei
commands:
  - generate-report
depends_on:
  - relatorio-chief
  - quality-gate
---

# redator — Geração de Relatório Narrativo

Recebe as métricas coletadas pelo `coletor` + dados extras via MCP Reportei (CPL, CPC, cliques, impressões) e gera o texto narrativo do relatório semanal.

## Responsabilidades

- Receber métricas da task `fetch-metrics` (resultado da coleta — pode ter zeros/nulls)
- Consultar MCP Reportei para dados complementares: CPL, CPC, cliques, impressões, comparativo semana anterior
- **Escrever apenas sobre o que tiver dado real** — sem configuração manual de plataforma
- Preencher o template de `templates/relatorio-template.md`
- Aplicar as regras de voz definidas em `CLAUDE.md`
- Entregar texto para validação pelo `quality-gate`

## Lógica de seleção de conteúdo (automática)

O redator verifica os dados recebidos e monta o texto dinamicamente:

| Dado disponível | Ação |
|-----------------|------|
| `meta_spend > 0` | Incluir parágrafo de Meta Ads + seção "Desempenho de Anúncios em Destaque" |
| `google_spend > 0` | Incluir parágrafo de Google Ads + seção "Desempenho de Palavras-Chave em Destaque" |
| Ambos > 0 | Incluir as duas seções |
| `meta_spend = 0` ou `null` | Não mencionar Meta Ads no texto |
| `google_spend = 0` ou `null` | Não mencionar Google Ads no texto |
| `seguidores < 0` | Mencionar a variação negativa + explicar (limpeza de inativos pelo META, se for o caso) |

Sem config manual: o redator decide o que escrever com base nos dados que chegaram.

## Regras de voz obrigatórias

**Tom:** Neutro e informativo. Dados objetivos, sem emoção excessiva.

**Proibido usar:**
- Elogios: incrível, surpreendente, excelente, extraordinário, impressionante, fantástico, brilhante, notável
- Críticas: preocupante, alarmante, crítico, péssimo, desastroso, infelizmente
- Jargão de IA: alavancar, potencializar, maximizar, robusto, sinergia, ecossistema, transformador, impactante
- Frases de IA: "é importante ressaltar", "cabe destacar", "vale salientar", "nesse sentido", "outrossim", "observa-se que", "depreende-se", "faz-se necessário"

**Exemplo correto:**
> "O investimento em Meta Ads totalizou R$ 1.716,26, abaixo do orçamento de R$ 8.785,00."

**Exemplo errado:**
> "Infelizmente o resultado ficou muito abaixo do esperado."

## Estrutura do texto gerado

> ⚠️ **OBRIGATÓRIO: o texto final deve ser HTML válido.** O Reportei não renderiza markdown — usar `<p>`, `<strong>`, `<br>` etc. Markdown puro (`**`, `---`, `\n`) resulta em bloco de texto corrido sem formatação.

---

### ═══ PADRÃO VISUAL — PILAR INVIOLÁVEL ═══

**Regra de espaçamento:** cada bloco do relatório é separado por `<br>` para criar respiro visual. Sem `<br>` entre blocos, o texto aparece colado no Reportei.

| Separador | Onde usar |
|-----------|-----------|
| `<br>` | Entre o parágrafo narrativo e o bloco de métricas |
| `<br>` | Entre o bloco de métricas e a seção de destaque |
| `<br>` | Entre cada sub-seção dentro do "Desempenho em Destaque" |
| `<br>` | Entre a última sub-seção e o rodapé |

**Estrutura obrigatória (META-only):**

```html
<p>[PARAGRAFO_NARRATIVO — 1 parágrafo único, fluido, com datas, alcance, CPL e investimento]</p>

<br>

<p><strong>Investimento na Semana:</strong> R$ [META_SPEND]</p>
<p><strong>Novos Seguidores:</strong> [SEGUIDORES]</p>
<p><strong>Total de Conversas:</strong> [CONVERSAS]</p>
<p><strong>Custo por Conversa (CPL):</strong> R$ [CPL]</p>

<br>

<p><strong>Desempenho de Anúncios em Destaque</strong></p>
<p>A análise individual dos criativos mostra variações importantes na eficiência de custo e engajamento:</p>

<br>

<p><strong>[TITULO_SUBSECAO_1] ([FORMATO — ex: Feed/Reels, Stories]):</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p><strong>[TITULO_SUBSECAO_2]:</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p>👇 Confira os dados do relatório no link abaixo:</p>
```

**Estrutura obrigatória (META + Google):**

```html
<p>[PARAGRAFO_NARRATIVO — mencionar ambas as plataformas, alcance, conversas/conversões, CPL/CPC e total investido]</p>

<br>

<p><strong>Investimento na Semana:</strong> R$ [TOTAL] (Meta: R$ [META_SPEND] + Google: R$ [GOOGLE_SPEND])</p>
<p><strong>Novos Seguidores:</strong> [SEGUIDORES]</p>
<p><strong>Total de Conversas:</strong> [CONVERSAS]</p>
<p><strong>Total de Conversões:</strong> [CONVERSOES]</p>
<p><strong>Custo por Conversa (CPL):</strong> R$ [CPL]</p>

<br>

<p><strong>Desempenho de Anúncios em Destaque</strong></p>
<p>A análise individual dos criativos mostra variações importantes na eficiência de custo e engajamento:</p>

<br>

<p><strong>[TITULO_SUBSECAO_1]:</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p><strong>Desempenho de Palavras-Chave em Destaque</strong></p>
<p>A análise individual dos termos de pesquisa mostra variações importantes na eficiência de custo e volume de conversão:</p>

<br>

<p><strong>[PALAVRA_CHAVE_1]:</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p>👇 Confira os dados do relatório no link abaixo:</p>
```

**Estrutura obrigatória (Google-only):**

```html
<p>[PARAGRAFO_NARRATIVO — cliques, conversões, CPC, investimento]</p>

<br>

<p><strong>Investimento na Semana:</strong> R$ [GOOGLE_SPEND]</p>
<p><strong>Total de Conversões:</strong> [CONVERSOES]</p>
<p><strong>Custo por Conversão:</strong> R$ [CPC_CONVERSAO]</p>
<p><strong>Total de Cliques:</strong> [CLIQUES]</p>

<br>

<p><strong>Desempenho de Palavras-Chave em Destaque</strong></p>
<p>A análise individual dos termos de pesquisa mostra variações importantes na eficiência de custo e volume de conversão:</p>

<br>

<p><strong>[PALAVRA_CHAVE_1]:</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p><strong>[PALAVRA_CHAVE_2]:</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p>👇 Confira os dados do relatório no link abaixo:</p>
```

### ═══ FIM DO PADRÃO VISUAL ═══

---

## Dados extras a buscar via MCP Reportei

Usar `get_report` ou `get_metrics` do MCP `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8`:
- CPL (custo por lead)
- CPC (custo por clique) — Meta e Google separados
- Cliques totais
- Impressões
- Conversões por campanha (se disponível)
- Variação vs semana anterior

## Tratamento de dados ausentes

Se dado extra não disponível via MCP → mencionar apenas as métricas disponíveis. Nunca inventar ou estimar valores sem fonte.
