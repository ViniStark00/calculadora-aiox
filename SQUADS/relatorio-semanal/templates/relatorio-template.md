# Template de Relatório Semanal
> Baseado em exemplos reais: Dra. Danielle Gondim (META) e Destra Desenvolvimentos (Google).
> Exemplos originais preservados ao final deste arquivo.

---

## TEMPLATE GERAL (META + Google — cliente com ambas as plataformas)

Nesta última semana, entre os dias [DATA_INICIO] e [DATA_FIM], o desempenho das campanhas para [CLIENTE] [ANALISE_GERAL_1_FRASE].

[PARAGRAFO_METRICAS_META — incluir apenas se cliente tem META]
Em relação ao Meta Ads, atingimos um total de [ALCANCE_META] contas alcançadas e geramos [IMPRESSOES_META] impressões totais. Registramos [CONVERSAS_META] conversas iniciadas por mensagem, com CPL de R$ [CPL_META].

[PARAGRAFO_METRICAS_GOOGLE — incluir apenas se cliente tem Google]
No Google Ads, alcançamos um total de [CLIQUES_GOOGLE] cliques, resultando em [CONVERSOES_GOOGLE] conversões diretas. O custo por conversão ficou em R$ [CPC_CONVERSAO_GOOGLE]. O investimento total no período foi de R$ [GOOGLE_SPEND].

O investimento total no período analisado foi de R$ [TOTAL_INVESTIMENTO].


**Investimento na Semana:** R$ [TOTAL_INVESTIMENTO]

**Novos Seguidores:** [SEGUIDORES] [NOTA_SEGUIDORES_SE_NEGATIVO]

**Total de Conversas/Conversões:** [CONVERSAS_OU_CONVERSOES]

**Custo por Conversa (CPL):** R$ [CPL]

[CAMPO_EXTRA_SE_APLICAVEL — ex: Total de Cliques: X]


[SECAO_DESTAQUE — ver variações abaixo]

👇 Confira os dados do relatório no link abaixo:

---

## TEMPLATE META-ONLY (clientes apenas com Meta Ads)

Nesta última semana ([DATA_INICIO] a [DATA_FIM]), [CONTEXTO_OU_NOVIDADE_DA_SEMANA — ex: variação de seguidores, destaque de campanha, etc.]. Em termos de alcance, atingimos um total de [ALCANCE] contas e geramos [IMPRESSOES] impressões totais.

No que diz respeito à conversão direta, registramos [CONVERSAS] conversas iniciadas por mensagem. O custo por conversa iniciada (CPL) ficou em R$ [CPL_META]. O investimento total no período analisado foi de R$ [META_SPEND].


**Investimento na Semana:** R$ [META_SPEND]

**Novos Seguidores:** [SEGUIDORES]

**Total de Conversas:** [CONVERSAS]

**Custo por Conversa (CPL):** R$ [CPL_META]


### Desempenho de Anúncios em Destaque
A análise individual dos criativos mostra variações importantes na eficiência de custo e engajamento:

**[NOME_CRIATIVO_1] ([FORMATO — ex: Performance de Vídeo (Feed)]):** [DESCRICAO_RESULTADO — ex: "O vídeo sobre X gerou Y visitas ao perfil, destacando-se como o criativo de maior engajamento."]

**[NOME_CRIATIVO_2]:** [DESCRICAO_RESULTADO]

👇 Confira os dados do relatório no link abaixo:

---

## TEMPLATE GOOGLE-ONLY (clientes apenas com Google Ads)

Nesta última semana, entre os dias [DATA_INICIO] e [DATA_FIM], o desempenho das campanhas para [CLIENTE] [ANALISE_GERAL — ex: "manteve um fluxo constante de interesse qualificado" / "apresentou crescimento nas conversões"]. Alcançamos um total de [CLIQUES] cliques, que resultaram em [CONVERSOES] conversões diretas.

O investimento total no período analisado foi de R$ [GOOGLE_SPEND]. Com base nesses dados, o custo por conversão ficou estabelecido em R$ [CUSTO_POR_CONVERSAO]. [FRASE_MONITORAMENTO — ex: "Seguimos em monitoramento para otimizar a distribuição do orçamento entre os termos de maior valor."]


**Investimento na Semana:** R$ [GOOGLE_SPEND]

**Total de Conversas/Conversões:** [CONVERSOES]

**Custo por Conversa (CPL):** R$ [CUSTO_POR_CONVERSAO]

**Total de Cliques:** [CLIQUES]


### Desempenho de Palavras-Chave em Destaque
A análise individual dos termos de pesquisa mostra variações importantes na eficiência de custo e volume de conversão:

**[PALAVRA_CHAVE_1]:** [DESCRICAO — ex: "Este foi o termo de maior destaque, gerando X conversões com taxa de conversão de Y%. O custo por conversão para este serviço foi de R$ Z."]

**[PALAVRA_CHAVE_2]:** [DESCRICAO — ex: "Demonstrou boa eficiência com X conversões e custo por conversão de R$ Y."]

**[PALAVRA_CHAVE_3]:** [DESCRICAO — ex: "Apesar de X impressões, não registrou conversões no período, com CPC de R$ Y."]

[PARAGRAFO_MONITORAMENTO — ex: "Estamos monitorando de perto o desempenho de termos como '[TERMO_A]' e '[TERMO_B]', que embora tenham atraído cliques, ainda não converteram na última semana. O objetivo é refinar os anúncios para garantir que o tráfego se converta em diálogos diretos e novas oportunidades de negócio."]

👇 Confira os dados do relatório no link abaixo:

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
