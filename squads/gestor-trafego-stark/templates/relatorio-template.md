# Template de Relatório Semanal — Squad gestor-trafego-stark
> ⚠️ TODOS OS TEMPLATES ABAIXO SÃO EM HTML — o Reportei não renderiza markdown.
> Texto em markdown enviado como `content` aparece como bloco corrido sem formatação no Reportei.
> Usar `<p>`, `<strong>`, `<br>` — nunca `**`, `---` ou `\n\n`.

---

## TEMPLATE META-ONLY — HTML (clientes apenas com Meta Ads)

```html
<p>Nesta última semana ([DATA_INICIO] a [DATA_FIM]), [CONTEXTO_OU_NOVIDADE]. Em termos de alcance, atingimos um total de [ALCANCE] contas e geramos [IMPRESSOES] impressões totais. No que diz respeito à conversão direta, registramos [CONVERSAS] conversas iniciadas por mensagem. O custo por conversa iniciada (CPL) ficou em R$ [CPL]. O investimento total no período analisado foi de R$ [META_SPEND].</p>

<br>

<p><strong>Investimento na Semana:</strong> R$ [META_SPEND]</p>
<p><strong>Novos Seguidores:</strong> [SEGUIDORES]</p>
<p><strong>Total de Conversas:</strong> [CONVERSAS]</p>
<p><strong>Custo por Conversa (CPL):</strong> R$ [CPL]</p>

<br>

<p><strong>Desempenho de Anúncios em Destaque</strong></p>
<p>A análise individual dos criativos mostra variações importantes na eficiência de custo e engajamento:</p>

<br>

<p><strong>[TITULO_SUBSECAO_1] ([FORMATO]):</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p><strong>[TITULO_SUBSECAO_2] ([FORMATO]):</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p>👇 Confira os dados do relatório no link abaixo:</p>
```

---

## TEMPLATE META + GOOGLE — HTML (clientes com ambas as plataformas)

```html
<p>Nesta última semana, entre os dias [DATA_INICIO] e [DATA_FIM], [ANALISE_GERAL_1_FRASE]. Em relação ao investimento, foram aplicados R$ [META_SPEND] no Meta Ads e R$ [GOOGLE_SPEND] no Google Ads, totalizando R$ [TOTAL]. No Meta, atingimos [ALCANCE] contas e [CONVERSAS] conversas iniciadas, com CPL de R$ [CPL]. No Google, registramos [CLIQUES] cliques e [CONVERSOES] conversões, com custo por conversão de R$ [CPC_CONVERSAO].</p>

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

<p><strong>[TITULO_SUBSECAO_META_1]:</strong> [DESCRICAO_RESULTADO]</p>

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

---

## TEMPLATE GOOGLE-ONLY — HTML (ex: Dr. Laureano Filho — cirurgia_ortognatica)

```html
<p>Nesta última semana, entre os dias [DATA_INICIO] e [DATA_FIM], [ANALISE_GERAL]. Alcançamos um total de [CLIQUES] cliques, que resultaram em [CONVERSOES] conversões diretas. O investimento total no período analisado foi de R$ [GOOGLE_SPEND]. Com base nesses dados, o custo por conversão ficou em R$ [CUSTO_POR_CONVERSAO].</p>

<br>

<p><strong>Investimento na Semana:</strong> R$ [GOOGLE_SPEND]</p>
<p><strong>Total de Conversões:</strong> [CONVERSOES]</p>
<p><strong>Custo por Conversão:</strong> R$ [CUSTO_POR_CONVERSAO]</p>
<p><strong>Total de Cliques:</strong> [CLIQUES]</p>

<br>

<p><strong>Desempenho de Palavras-Chave em Destaque</strong></p>
<p>A análise individual dos termos de pesquisa mostra variações importantes na eficiência de custo e volume de conversão:</p>

<br>

<p><strong>[PALAVRA_CHAVE_1]:</strong> [DESCRICAO]</p>

<br>

<p><strong>[PALAVRA_CHAVE_2]:</strong> [DESCRICAO]</p>

<br>

<p><strong>[PALAVRA_CHAVE_3]:</strong> [DESCRICAO]</p>

<br>

<p>👇 Confira os dados do relatório no link abaixo:</p>
```

---

## REFERÊNCIA DE PLACEHOLDERS

| Placeholder | Fonte | Obrigatório | Notas |
|-------------|-------|-------------|-------|
| `[DATA_INICIO]` | Calculado (segunda-feira) | ✅ | Formato: DD/MM/AAAA |
| `[DATA_FIM]` | Calculado (domingo) | ✅ | Formato: DD/MM/AAAA |
| `[ANALISE_GERAL_1_FRASE]` | Gerado pelo redator | ✅ | Tom neutro — descreve tendência geral |
| `[META_SPEND]` | Sheets col. C / metricas_coletadas | ✅ se META | Formato: R$ X.XXX,XX |
| `[GOOGLE_SPEND]` | Sheets col. E | ✅ se Google | Formato: R$ X.XXX,XX |
| `[TOTAL]` | Calculado (META + Google) | ✅ se ambos | Formato: R$ X.XXX,XX |
| `[SEGUIDORES]` | Sheets col. H | ✅ se META | Pode ser negativo |
| `[CONVERSAS]` | Sheets col. K / metricas_coletadas | ✅ se META | Leads WhatsApp |
| `[CONVERSOES]` | Sheets col. O | ✅ se Google | Conversões diretas |
| `[CPL]` | MCP Reportei ou calculado | ✅ se META | `R$ X,XX` ou `-` se conversas = 0 |
| `[CPC_CONVERSAO]` / `[CUSTO_POR_CONVERSAO]` | MCP Reportei | ✅ se Google | Custo por conversão Google |
| `[CLIQUES]` | MCP Reportei | ✅ se Google | Cliques totais Google |
| `[ALCANCE]` | MCP Reportei | ⚠️ se disponível | Contas alcançadas Meta |
| `[IMPRESSOES]` | MCP Reportei | ⚠️ se disponível | Impressões Meta |
| `[TITULO_SUBSECAO_N]` | MCP Reportei + redator | ✅ | Criativos (META) ou palavras-chave (Google) |
