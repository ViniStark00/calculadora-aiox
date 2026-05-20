# Template de Relatório Semanal
> Baseado em exemplos reais: Dra. Danielle Gondim (META) e Destra Desenvolvimentos (Google).
> ⚠️ TODOS OS TEMPLATES ABAIXO SÃO EM HTML — o Reportei não renderiza markdown.
> Padrão visual documentado em `agents/redator.md` → seção "PADRÃO VISUAL — PILAR INVIOLÁVEL".

---

## TEMPLATE META-ONLY — HTML (clientes apenas com Meta Ads)

```html
<p>Nesta última semana ([DATA_INICIO] a [DATA_FIM]), [CONTEXTO_OU_NOVIDADE — ex: as campanhas mantiveram desempenho estável / houve variação de seguidores]. Em termos de alcance, atingimos um total de [ALCANCE] contas e geramos [IMPRESSOES] impressões totais. No que diz respeito à conversão direta, registramos [CONVERSAS] conversas iniciadas por mensagem. O custo por conversa iniciada (CPL) ficou em R$ [CPL]. O investimento total no período analisado foi de R$ [META_SPEND].</p>

<br>

<p><strong>Investimento na Semana:</strong> R$ [META_SPEND]</p>
<p><strong>Novos Seguidores:</strong> [SEGUIDORES]</p>
<p><strong>Total de Conversas:</strong> [CONVERSAS]</p>
<p><strong>Custo por Conversa (CPL):</strong> R$ [CPL]</p>

<br>

<p><strong>Desempenho de Anúncios em Destaque</strong></p>
<p>A análise individual dos criativos mostra variações importantes na eficiência de custo e engajamento:</p>

<br>

<p><strong>[TITULO_SUBSECAO_1] ([FORMATO — ex: Performance de Vídeo (Feed/Reels)]):</strong> [DESCRICAO_RESULTADO]</p>

<br>

<p><strong>[TITULO_SUBSECAO_2] ([FORMATO — ex: Volume de Atração (Stories)]):</strong> [DESCRICAO_RESULTADO]</p>

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

<p><strong>[TITULO_SUBSECAO_1]:</strong> [DESCRICAO_RESULTADO]</p>

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

## TEMPLATE GOOGLE-ONLY — HTML (clientes apenas com Google Ads)

```html
<p>Nesta última semana, entre os dias [DATA_INICIO] e [DATA_FIM], [ANALISE_GERAL — ex: as campanhas mantiveram fluxo constante de interesse qualificado]. Alcançamos um total de [CLIQUES] cliques, que resultaram em [CONVERSOES] conversões diretas. O investimento total no período analisado foi de R$ [GOOGLE_SPEND]. Com base nesses dados, o custo por conversão ficou em R$ [CUSTO_POR_CONVERSAO].</p>

<br>

<p><strong>Investimento na Semana:</strong> R$ [GOOGLE_SPEND]</p>
<p><strong>Total de Conversões:</strong> [CONVERSOES]</p>
<p><strong>Custo por Conversão:</strong> R$ [CUSTO_POR_CONVERSAO]</p>
<p><strong>Total de Cliques:</strong> [CLIQUES]</p>

<br>

<p><strong>Desempenho de Palavras-Chave em Destaque</strong></p>
<p>A análise individual dos termos de pesquisa mostra variações importantes na eficiência de custo e volume de conversão:</p>

<br>

<p><strong>[PALAVRA_CHAVE_1]:</strong> [DESCRICAO — ex: "Este foi o termo de maior destaque, gerando X conversões com taxa de conversão de Y%. O custo por conversão para este serviço foi de R$ Z."]</p>

<br>

<p><strong>[PALAVRA_CHAVE_2]:</strong> [DESCRICAO — ex: "Demonstrou boa eficiência com X conversões e custo por conversão de R$ Y."]</p>

<br>

<p><strong>[PALAVRA_CHAVE_3]:</strong> [DESCRICAO — ex: "Apesar de X impressões, não registrou conversões no período, com CPC de R$ Y."]</p>

<br>

<p>[PARAGRAFO_MONITORAMENTO_OPCIONAL — ex: "Seguimos monitorando termos como '[TERMO_A]' e '[TERMO_B]', que atraíram cliques mas ainda não converteram."]</p>

<br>

<p>👇 Confira os dados do relatório no link abaixo:</p>
```

---

## REFERÊNCIA DE PLACEHOLDERS

| Placeholder | Fonte | Obrigatório | Notas |
|-------------|-------|-------------|-------|
| `[DATA_INICIO]` | Calculado (segunda-feira) | ✅ | Formato: DD/MM/AAAA |
| `[DATA_FIM]` | Calculado (domingo) | ✅ | Formato: DD/MM/AAAA |
| `[CLIENTE]` | clientes-config.yaml | ✅ | Nome exato conforme planilha |
| `[ANALISE_GERAL_1_FRASE]` | Gerado pelo redator | ✅ | Tom neutro — descreve tendência geral |
| `[META_SPEND]` | Sheets col. C | ✅ se META | Formato: R$ X.XXX,XX |
| `[GOOGLE_SPEND]` | Sheets col. E | ✅ se Google | Formato: R$ X.XXX,XX |
| `[TOTAL_INVESTIMENTO]` | Calculado (C + E) | ✅ | Formato: R$ X.XXX,XX |
| `[SEGUIDORES]` | Sheets col. H | ✅ se META | Pode ser negativo |
| `[NOTA_SEGUIDORES_SE_NEGATIVO]` | Redator | ⚠️ se negativo | Ex: "devido a limpeza do META de usuários inativos" |
| `[CONVERSAS]` | Sheets col. K | ✅ se META | Leads WhatsApp |
| `[CONVERSOES]` | Sheets col. O | ✅ se Google | Conversões diretas |
| `[CPL_META]` | MCP Reportei | ⚠️ se disponível | Custo por conversa Meta |
| `[CUSTO_POR_CONVERSAO]` | MCP Reportei | ⚠️ se disponível | Custo por conversão Google |
| `[CLIQUES]` | MCP Reportei | ⚠️ se disponível | Cliques totais Google |
| `[ALCANCE]` | MCP Reportei | ⚠️ se disponível | Contas alcançadas Meta |
| `[IMPRESSOES]` | MCP Reportei | ⚠️ se disponível | Impressões Meta |
| `[SECAO_DESTAQUE]` | MCP Reportei + redator | ✅ | Criativos (META) ou palavras-chave (Google) |

---

## EXEMPLOS REAIS (referência de voz e formato)

### Exemplo 1 — Dra. Danielle Gondim (META-only) — semana 04/05 a 10/05/2026

Nesta última semana (04/05/2026 a 10/05/2026), tivemos uma variação de -668 seguidores devido a uma atualização do META, onde ele removeu vários usuários inativos nas contas. Em termos de alcance, atingimos um total de 297.939 contas e geramos 574.444 impressões totais.

No que diz respeito à conversão direta, registramos 23 conversas iniciadas por mensagem. O custo por conversa iniciada (CPL) ficou em R$ 16,86. O investimento total no período analisado foi de R$ 6.457,05.


**Investimento na Semana:** R$ 6.457,05

**Novos Seguidores:** -668

**Total de Conversas:** 23

**Custo por Conversa (CPL):** R$ 16,86


**Desempenho de Anúncios em Destaque**
A análise individual dos criativos mostra variações importantes na eficiência de custo e engajamento:

**Performance de Vídeo (Feed):** Os conteúdos em vídeo publicados em meados de março continuam gerando visitas ao perfil. O vídeo sobre "Cicatrizes" e o vídeo "A Val veio de Boston" se destacaram, somando juntos mais de 680 visitas ao perfil.

**Volume de Atração:** Outro criativo de vídeo focado em "13 dicas fundamentais" resultou em 267 visitas ao perfil, mantendo o público engajado com o conteúdo educativo.

👇 Confira os dados do relatório no link abaixo:

---

### Exemplo 2 — Destra Desenvolvimentos (Google-only) — semana 04/05 a 10/05/2026

Nesta última semana, entre os dias 04/05/2026 e 10/05/2026, o desempenho das campanhas para a Destra Desenvolvimentos manteve um fluxo constante de interesse qualificado. Alcançamos um total de 189 cliques, que resultaram em 21 conversões diretas.

O investimento total no período analisado foi de R$ 579,33. Com base nesses dados, o custo por conversão ficou estabelecido em R$ 27,59. Seguimos em monitoramento para otimizar a distribuição do orçamento entre os termos de maior valor.


**Investimento na Semana:** R$ 579,33

**Total de Conversas/Conversões:** 21

**Custo por Conversa (CPL):** R$ 27,59

**Total de Cliques:** 189


**Desempenho de Palavras-Chave em Destaque**
A análise individual dos termos de pesquisa mostra variações importantes na eficiência de custo e volume de conversão:

**Registro de Imóveis Rurais:** Este foi o termo de maior destaque, gerando 6 conversões com uma excelente taxa de conversão de 30,4%. O custo por conversão para este serviço específico foi de R$ 11,95, apresentando o melhor ROI do período.

**Autorização Ambiental:** Demonstrou boa eficiência com 3 conversões e um custo por conversão de R$ 17,80.

**Outorga de Água:** Apesar de ter gerado o maior volume de impressões (376), este termo não registrou conversões diretas no período, resultando em um CPC de R$ 3,35.

Estamos monitorando de perto o desempenho de termos como "Licenciamento Ambiental" e "Gestão de Resíduos", que embora tenham atraído cliques, ainda não converteram na última semana. O objetivo é refinar os anúncios para garantir que o tráfego se converta em diálogos diretos e novas oportunidades de negócio.

👇 Confira os dados do relatório no link abaixo:
