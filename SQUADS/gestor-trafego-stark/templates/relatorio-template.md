# Template de Relatório Semanal — Squad gestor-trafego-stark
> ⚠️ TODOS OS TEMPLATES ABAIXO SÃO EM HTML — o Reportei não renderiza markdown.
> Texto em markdown enviado como `content` aparece como bloco corrido sem formatação no Reportei.
> Usar `<p>`, `<strong>`, `<br>` — nunca `**`, `---` ou `\n\n`.

---

## TEMPLATE META-ONLY — HTML (clientes apenas com Meta Ads)

```html
<p><strong>📊 Relatório de Performance | [DATA_INICIO] a [DATA_FIM]</strong></p>

<br>

<p><strong>🚀 Visão Geral do Período</strong></p>
<p>[PARAGRAFO_NARRATIVO — abrir com "Na semana de [DATA_INICIO] a [DATA_FIM]," + alcance, CPL e investimento. 1 parágrafo único e fluido.]</p>
<p><strong>Investimento Total Meta:</strong> R$ [META_SPEND]</p>

<!-- SE total_leads = conversas (apenas WhatsApp): -->
<p><strong>Custo Médio por Lead (CPL):</strong> R$ [CPL]</p>

<!-- SE total_leads > conversas (Respondi ou outros leads detectados): -->
<!-- <p><strong>Custo Médio por Lead (CPL):</strong> R$ [CPL] ([TOTAL_LEADS] leads — WhatsApp: [CONVERSAS] · Respondi: [RESPONDI_LEADS] · Pixel: [PIXEL_LEADS])</p> -->
<!-- (omitir fontes com valor zero ou null na linha de detalhamento) -->

<br>

<p><strong>🔍 Análise do Funil de Vendas (Meta)</strong></p>

<p><strong>Topo de Funil (TOFU) — Atração e Alcance</strong></p>
<p>Alcance: ~[ALCANCE] | Impressões: ~[IMPRESSOES] | Frequência: [FREQUENCIA]</p>
<p>[ANALISE_TOFU — 1–2 frases objetivas sobre alcance, volume e saturação de público.]</p>

<br>

<p><strong>Meio de Funil (MOFU) — Qualificação e Consideração</strong></p>
<p>CTR no link: [CTR]% | CPC estimado: R$ [CPC] | CPM: R$ [CPM]</p>
<p>Taxa clique→conversa: ~[TAXA_CLIQUE_CONVERSA]%</p>
<p>[ANALISE_MOFU — 1–2 frases sobre qualidade do tráfego, engajamento e eficiência de custo por clique.]</p>

<br>

<p><strong>Fundo de Funil (BOFU) — Conversão Direta</strong></p>

<!-- SE total_leads = conversas (apenas WhatsApp): -->
<p>[CONVERSAS] conversas | CPL R$ [CPL] | [STATUS_CPL]</p>

<!-- SE total_leads > conversas (Respondi ou outros): -->
<!-- <p>[TOTAL_LEADS] leads ([CONVERSAS] WhatsApp + [RESPONDI_LEADS] Respondi) | CPL R$ [CPL] | [STATUS_CPL]</p> -->
<!-- (omitir fontes com valor zero ou null) -->

<p>[ANALISE_BOFU — 1–2 frases sobre volume de leads, CPL vs referência da especialidade e variação histórica se disponível.]</p>

<br>

<p><strong>📝 Próximos Passos & Otimizações</strong></p>
<p>→ [ACAO_1]</p>
<p>→ [ACAO_2]</p>

<br>

<p>🔗 Confira os dados do relatório no link abaixo:</p>
```

---

## TEMPLATE META + GOOGLE — HTML (clientes com ambas as plataformas)

```html
<p><strong>📊 Relatório de Performance | [DATA_INICIO] a [DATA_FIM]</strong></p>

<br>

<p><strong>🚀 Visão Geral do Período</strong></p>
<p>[PARAGRAFO_NARRATIVO — abrir com "Na semana de [DATA_INICIO] a [DATA_FIM]," + mencionar ambas as plataformas, alcance, conversas/conversões, CPL/CPC e total investido.]</p>
<p><strong>Investimento Total:</strong> R$ [TOTAL] (Meta: R$ [META_SPEND] + Google: R$ [GOOGLE_SPEND])</p>

<!-- SE total_leads = conversas (apenas WhatsApp): -->
<p><strong>Custo Médio por Lead Meta (CPL):</strong> R$ [CPL]</p>

<!-- SE total_leads > conversas (Respondi ou outros): -->
<!-- <p><strong>Custo Médio por Lead Meta (CPL):</strong> R$ [CPL] ([TOTAL_LEADS] leads — WhatsApp: [CONVERSAS] · Respondi: [RESPONDI_LEADS] · Pixel: [PIXEL_LEADS])</p> -->
<!-- (omitir fontes com valor zero ou null) -->

<p><strong>Custo por Conversão Google:</strong> R$ [CPC_CONVERSAO]</p>

<br>

<p><strong>🔍 Análise do Funil de Vendas (Meta)</strong></p>

<p><strong>Topo de Funil (TOFU) — Atração e Alcance</strong></p>
<p>Alcance: ~[ALCANCE] | Impressões: ~[IMPRESSOES] | Frequência: [FREQUENCIA]</p>
<p>[ANALISE_TOFU]</p>

<br>

<p><strong>Meio de Funil (MOFU) — Qualificação e Consideração</strong></p>
<p>CTR no link: [CTR]% | CPC estimado: R$ [CPC] | CPM: R$ [CPM]</p>
<p>Taxa clique→conversa: ~[TAXA_CLIQUE_CONVERSA]%</p>
<p>[ANALISE_MOFU]</p>

<br>

<p><strong>Fundo de Funil (BOFU) — Conversão Direta</strong></p>

<!-- SE total_leads = conversas (apenas WhatsApp): -->
<p>[CONVERSAS] conversas | CPL R$ [CPL] | [STATUS_CPL]</p>

<!-- SE total_leads > conversas (Respondi ou outros): -->
<!-- <p>[TOTAL_LEADS] leads ([CONVERSAS] WhatsApp + [RESPONDI_LEADS] Respondi) | CPL R$ [CPL] | [STATUS_CPL]</p> -->
<!-- (omitir fontes com valor zero ou null) -->

<p>[ANALISE_BOFU]</p>

<br>

<p><strong>🔍 Análise Google Ads</strong></p>
<p>Cliques: [CLIQUES] | Conversões: [CONVERSOES] | Custo por Conversão: R$ [CPC_CONVERSAO]</p>
<p>[ANALISE_GOOGLE — 1–2 frases sobre performance das palavras-chave e conversões Google.]</p>

<br>

<p><strong>📝 Próximos Passos & Otimizações</strong></p>
<p>→ [ACAO_1]</p>
<p>→ [ACAO_2]</p>

<br>

<p>🔗 Confira os dados do relatório no link abaixo:</p>
```

---

## TEMPLATE GOOGLE-ONLY — HTML (ex: Dr. Laureano Filho — cirurgia_ortognatica)

```html
<p><strong>📊 Relatório de Performance | [DATA_INICIO] a [DATA_FIM]</strong></p>

<br>

<p><strong>🚀 Visão Geral do Período</strong></p>
<p>[PARAGRAFO_NARRATIVO — abrir com "Na semana de [DATA_INICIO] a [DATA_FIM]," + cliques, conversões, custo por conversão e investimento total.]</p>
<p><strong>Investimento Total Google:</strong> R$ [GOOGLE_SPEND]</p>
<p><strong>Custo por Conversão:</strong> R$ [CPC_CONVERSAO]</p>

<br>

<p><strong>🔍 Análise Google Ads</strong></p>

<p><strong>Volume de Tráfego</strong></p>
<p>Cliques: [CLIQUES] | Impressões: ~[IMPRESSOES] | CTR: [CTR]%</p>
<p>[ANALISE_VOLUME — 1–2 frases sobre volume de busca, CTR e qualidade do tráfego.]</p>

<br>

<p><strong>Conversões</strong></p>
<p>[CONVERSOES] conversões | Custo por Conversão: R$ [CPC_CONVERSAO] | [STATUS_CPC]</p>
<p>[ANALISE_CONVERSOES — 1–2 frases sobre volume de conversões, custo vs referência da especialidade e variação histórica se disponível.]</p>

<br>

<p><strong>📝 Próximos Passos & Otimizações</strong></p>
<p>→ [ACAO_1]</p>
<p>→ [ACAO_2]</p>

<br>

<p>🔗 Confira os dados do relatório no link abaixo:</p>
```

---

## REFERÊNCIA DE PLACEHOLDERS

| Placeholder | Fonte | Obrigatório | Notas |
|-------------|-------|-------------|-------|
| `[DATA_INICIO]` | Calculado (segunda-feira) | ✅ | Formato: DD/MM |
| `[DATA_FIM]` | Calculado (domingo) | ✅ | Formato: DD/MM |
| `[PARAGRAFO_NARRATIVO]` | Gerado pelo redator | ✅ | Abre com "Na semana de DD/MM a DD/MM," |
| `[META_SPEND]` | metricas_coletadas | ✅ se META | Formato: R$ X.XXX,XX |
| `[GOOGLE_SPEND]` | metricas_coletadas | ✅ se Google | Formato: R$ X.XXX,XX |
| `[TOTAL]` | Calculado (META + Google) | ✅ se ambos | Formato: R$ X.XXX,XX |
| `[ALCANCE]` | MCP Reportei | ✅ se META | Contas alcançadas |
| `[IMPRESSOES]` | MCP Reportei | ✅ | Impressões totais |
| `[FREQUENCIA]` | MCP Reportei | ⚠️ se disponível | Impressões / Alcance |
| `[CTR]` | MCP Reportei | ✅ | CTR no link (%) |
| `[CPC]` | MCP Reportei | ✅ se META | Custo por clique |
| `[CPM]` | MCP Reportei | ✅ se META | Custo por mil impressões |
| `[TAXA_CLIQUE_CONVERSA]` | Calculado (conversas / cliques × 100) | ⚠️ se disponível | % de cliques que viraram conversa |
| `[CONVERSAS]` | metricas_coletadas | ✅ se META | Leads WhatsApp |
| `[RESPONDI_LEADS]` | Auto-discovery slug `*respondi*` | ⚠️ se detectado | Leads formulário Respondi |
| `[PIXEL_LEADS]` | Auto-discovery slug `offsite_conversion.*` | ⚠️ se detectado | Leads de pixel Meta |
| `[TOTAL_LEADS]` | Calculado (conversas + respondi + pixel) | ⚠️ se múltiplas fontes | Base do CPL quando > conversas |
| `[CPL]` | Calculado (meta_spend / total_leads) | ✅ se META | `R$ X,XX` ou `-` se total_leads = 0 |
| `[STATUS_CPL]` | Classificação por threshold | ✅ se META | Ex: "dentro da referência", "acima da referência para a especialidade" |
| `[CLIQUES]` | MCP Reportei | ✅ se Google | Cliques totais |
| `[CONVERSOES]` | metricas_coletadas | ✅ se Google | Conversões diretas |
| `[CPC_CONVERSAO]` | MCP Reportei | ✅ se Google | Custo por conversão Google |
| `[STATUS_CPC]` | Classificação por threshold | ✅ se Google | Ex: "dentro da referência" |
| `[ANALISE_TOFU]` | Gerado pelo redator | ✅ se META | 1–2 frases objetivas |
| `[ANALISE_MOFU]` | Gerado pelo redator | ✅ se META | 1–2 frases objetivas |
| `[ANALISE_BOFU]` | Gerado pelo redator | ✅ se META | 1–2 frases + CPL vs threshold |
| `[ANALISE_GOOGLE]` | Gerado pelo redator | ✅ se Google | 1–2 frases objetivas |
| `[ACAO_1]`, `[ACAO_2]` | Gerado pelo redator | ✅ | Ações técnicas concretas (ver regras de escopo) |