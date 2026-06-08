# Template de Relatório Semanal — Squad gestor-trafego-stark
> ⚠️ TODOS OS TEMPLATES ABAIXO SÃO EM HTML — o Reportei não renderiza markdown.
> Texto em markdown enviado como `content` aparece como bloco corrido sem formatação no Reportei.
> Usar `<p>`, `<strong>`, `<br>` — nunca `**`, `---` ou `\n\n`.

---

## TEMPLATE META-ONLY — HTML (clientes apenas com Meta Ads)

```html
<p><strong>📊 Relatório de Performance | [DATA_INICIO] a [DATA_FIM]</strong></p>

<br>

<p><strong>💰 Investimento & Canais</strong></p>

<!-- SE total_leads = conversas (apenas WhatsApp — sem Respondi): -->
<p><strong>Meta Ads:</strong> R$ [META_SPEND] investidos | conversas: [CONVERSAS] | <strong>CPL: R$ [CPL]</strong> [STATUS_CPL_TEXTO]</p>

<!-- SE total_leads > conversas (Respondi detectado) E meta_ad_account_id disponível (CPL por fonte calculável): -->
<!-- <p><strong>Meta Ads:</strong> R$ [META_SPEND] investidos | [TOTAL_LEADS] leads | <strong>CPL médio: R$ [CPL]</strong> [STATUS_CPL_TEXTO]</p> -->
<!-- <p>↳ WhatsApp: [CONVERSAS] leads | CPL: R$ [CPL_WPP]</p> -->
<!-- <p>↳ Respondi: [RESPONDI_LEADS] leads | CPL: R$ [CPL_RESPONDI] <em>(formulário — tende a ser mais qualificado)</em></p> -->

<!-- SE total_leads > conversas (Respondi detectado) E meta_ad_account_id null (CPL por fonte não calculável): -->
<!-- <p><strong>Meta Ads:</strong> R$ [META_SPEND] investidos | [TOTAL_LEADS] leads | <strong>CPL médio: R$ [CPL]</strong> [STATUS_CPL_TEXTO]</p> -->
<!-- <p>↳ WhatsApp: [CONVERSAS] · Respondi: [RESPONDI_LEADS]</p> -->

<p><strong>Crescimento do Perfil:</strong> +[SEGUIDORES] novos seguidores</p>

<br>

<p><strong>📈 Saúde das Campanhas (Meta Ads)</strong></p>
<p><strong>CPM: R$ [CPM]</strong> | <strong>Frequência: [FREQUENCIA]</strong> — [ANALISE_LEILAO]</p>
<p><strong>CTR: [CTR]%</strong> | <strong>CPC: R$ [CPC]</strong> — [ANALISE_ENGAJAMENTO]</p>

<br>

<p><strong>⚠️ Próximos Passos & Diagnóstico</strong></p>
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

<p><strong>💰 Investimento & Canais</strong></p>

<!-- SE total_leads = conversas (apenas WhatsApp — sem Respondi): -->
<p><strong>Meta Ads:</strong> R$ [META_SPEND] investidos | conversas: [CONVERSAS] | <strong>CPL: R$ [CPL]</strong> [STATUS_CPL_TEXTO]</p>

<!-- SE total_leads > conversas (Respondi detectado) E meta_ad_account_id disponível (CPL por fonte calculável): -->
<!-- <p><strong>Meta Ads:</strong> R$ [META_SPEND] investidos | [TOTAL_LEADS] leads | <strong>CPL médio: R$ [CPL]</strong> [STATUS_CPL_TEXTO]</p> -->
<!-- <p>↳ WhatsApp: [CONVERSAS] leads | CPL: R$ [CPL_WPP]</p> -->
<!-- <p>↳ Respondi: [RESPONDI_LEADS] leads | CPL: R$ [CPL_RESPONDI] <em>(formulário — tende a ser mais qualificado)</em></p> -->

<!-- SE total_leads > conversas (Respondi detectado) E meta_ad_account_id null (CPL por fonte não calculável): -->
<!-- <p><strong>Meta Ads:</strong> R$ [META_SPEND] investidos | [TOTAL_LEADS] leads | <strong>CPL médio: R$ [CPL]</strong> [STATUS_CPL_TEXTO]</p> -->
<!-- <p>↳ WhatsApp: [CONVERSAS] · Respondi: [RESPONDI_LEADS]</p> -->

<p><strong>Google Ads:</strong> R$ [GOOGLE_SPEND] investidos | [CONVERSOES] contatos | <strong>CPL: R$ [CPC_CONVERSAO]</strong> [STATUS_CPC_TEXTO]</p>
<p><strong>Geral:</strong> R$ [TOTAL] investidos | [TOTAL_LEADS_GERAL] leads | <strong>CPL Médio: R$ [CPL_MEDIO]</strong></p>
<p><strong>Crescimento do Perfil:</strong> +[SEGUIDORES] novos seguidores</p>

<br>

<p><strong>📈 Saúde das Campanhas (Meta Ads)</strong></p>
<p><strong>CPM: R$ [CPM]</strong> | <strong>Frequência: [FREQUENCIA]</strong> — [ANALISE_LEILAO]</p>
<p><strong>CTR: [CTR]%</strong> | <strong>CPC: R$ [CPC]</strong> — [ANALISE_ENGAJAMENTO]</p>

<br>

<p><strong>⚠️ Próximos Passos & Diagnóstico</strong></p>
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

<p><strong>💰 Investimento & Canais</strong></p>
<p><strong>Google Ads:</strong> R$ [GOOGLE_SPEND] investidos | [CONVERSOES] contatos | <strong>CPL: R$ [CPC_CONVERSAO]</strong> [STATUS_CPC_TEXTO]</p>

<br>

<p><strong>📈 Saúde das Campanhas (Google Ads)</strong></p>
<p><strong>Cliques: [CLIQUES]</strong> | <strong>Impressões: ~[IMPRESSOES]</strong> | <strong>CTR: [CTR]%</strong> — [ANALISE_VOLUME]</p>
<p><strong>Conversões: [CONVERSOES]</strong> | <strong>Custo por Conversão: R$ [CPC_CONVERSAO]</strong> — [ANALISE_CONVERSOES]</p>

<br>

<p><strong>⚠️ Próximos Passos & Diagnóstico</strong></p>
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
| `[META_SPEND]` | metricas_coletadas | ✅ se META | Formato: R$ X.XXX,XX |
| `[GOOGLE_SPEND]` | metricas_coletadas | ✅ se Google | Formato: R$ X.XXX,XX |
| `[TOTAL]` | Calculado (META + Google) | ✅ se ambos | Formato: R$ X.XXX,XX |
| `[TOTAL_LEADS]` | Calculado (conversas + respondi_leads + pixel_leads) | ✅ se META | Base do CPL médio |
| `[CONVERSAS]` | metricas_coletadas | ✅ se META | Leads WhatsApp |
| `[RESPONDI_LEADS]` | Auto-discovery | ⚠️ se detectado | Leads formulário Respondi |
| `[CPL]` | Calculado (meta_spend / total_leads) | ✅ se META | CPL médio; `-` se total_leads = 0 |
| `[CPL_WPP]` | Calculado (spend_campanhas_mensagens / conversas) | ⚠️ se Respondi + meta_ad_account_id disponível | Omitir se meta_ad_account_id null |
| `[CPL_RESPONDI]` | Calculado (spend_campanhas_leads / respondi_leads) | ⚠️ se Respondi + meta_ad_account_id disponível | Omitir se meta_ad_account_id null |
| `[STATUS_CPL_TEXTO]` | Classificação por threshold | ✅ se META | Ex: "*(dentro da referência para a especialidade)*" |
| `[SEGUIDORES]` | MCP Reportei | ✅ se META | Novos seguidores; `X` se indisponível |
| `[CPM]` | MCP Reportei | ✅ se META | `X` se indisponível — emitir aviso |
| `[FREQUENCIA]` | MCP Reportei | ✅ se META | `X` se indisponível — emitir aviso |
| `[CTR]` | MCP Reportei | ✅ se META | `X` se indisponível — emitir aviso |
| `[CPC]` | MCP Reportei | ✅ se META | `X` se indisponível — emitir aviso |
| `[ANALISE_LEILAO]` | Gerado pelo redator | ✅ se META | 1 frase sobre CPM/Frequência |
| `[ANALISE_ENGAJAMENTO]` | Gerado pelo redator | ✅ se META | 1 frase sobre CTR/CPC |
| `[CONVERSOES]` | metricas_coletadas | ✅ se Google | Conversões diretas |
| `[CPC_CONVERSAO]` | MCP Reportei | ✅ se Google | Custo por conversão Google |
| `[STATUS_CPC_TEXTO]` | Classificação por threshold | ✅ se Google | Ex: "*(dentro da referência)*" |
| `[CLIQUES]` | MCP Reportei | ✅ se Google | Cliques totais |
| `[IMPRESSOES]` | MCP Reportei | ✅ se Google | Impressões totais |
| `[ANALISE_VOLUME]` | Gerado pelo redator | ✅ se Google-only | 1 frase sobre volume e qualidade |
| `[ANALISE_CONVERSOES]` | Gerado pelo redator | ✅ se Google-only | 1 frase sobre conversões e custo |
| `[ACAO_1]`, `[ACAO_2]` | Gerado pelo redator | ✅ | Ações técnicas concretas |
| `[TOTAL_LEADS_GERAL]` | Calculado (TOTAL_LEADS + CONVERSOES) | ✅ se META+Google | Base do CPL Médio |
| `[CPL_MEDIO]` | Calculado ((meta_spend + google_spend) / TOTAL_LEADS_GERAL) | ✅ se META+Google | `R$ X,XX` |
