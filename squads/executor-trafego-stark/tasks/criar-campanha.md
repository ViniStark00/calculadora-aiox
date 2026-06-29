# Task: criar-campanha.md

> **Executor:** Agente Criador
> **DESIGN.md:** seções 4 (lógica de criação por formato), 10 (mapa optimization_goal), 15 (nomenclatura padrão)
> **Entradas:** `ids_resolvidos` (de `resolver-ids.md`) + `assets_prontos` (de `upload-assets-drive.md`)
> **Saída:** `campanha_criada` — payload estruturado para o Revisor

---

## Objetivo

Criar a hierarquia completa de campanha no Meta Ads em estado **PAUSED** usando os IDs resolvidos na FASE 0 e os assets carregados pelo pipeline Drive → Meta. Nenhuma entidade é ativada nesta task.

---

## Pré-condições obrigatórias

Antes de qualquer criação, verificar que as entradas estão disponíveis:

| Entrada | De onde vem | Se ausente |
|---------|-------------|-----------|
| `ids_resolvidos.ad_account_id` | `resolver-ids.md` | **Bloquear** — informar o que está faltando |
| `ids_resolvidos.page_id` | `resolver-ids.md` | **Bloquear** |
| `ids_resolvidos.audience_id` | `resolver-ids.md` | **Bloquear** |
| `assets_prontos.image_hashes` ou `assets_prontos.video_ids` | `upload-assets-drive.md` | **Bloquear** |

Se qualquer pré-condição faltar: parar e informar explicitamente o que está faltando. Nunca prosseguir com dados incompletos.

---

## Passo 1 — Montar nomes automáticos (seção 15 do DESIGN.md)

O Criador interpreta o `briefing_interpretado` e monta os nomes automaticamente — o gestor não precisa digitar no formato correto.

### Nome da campanha

**Estrutura:** `[FUNIL][OBJETIVO][PRODUTO/EXPERT][TIPO][ORÇAMENTO]`

| Campo | Fonte no briefing | Exemplos |
|-------|-------------------|---------|
| `[FUNIL]` | `briefing_interpretado.funil` | `TOFU`, `MOFU`, `BOFU` |
| `[OBJETIVO]` | derivado do `objective` | `Tráfego`, `Msgs`, `Leads`, `Vendas`, `Engaj` |
| `[PRODUTO/EXPERT]` | `briefing_interpretado.campaign_name_raw` | `DrIngrid`, `R24R`, `Perfil Ingrid` |
| `[TIPO]` | `briefing_interpretado.tipo_veiculacao` | `TESTE`, `ESCALA` |
| `[ORÇAMENTO]` | `briefing_interpretado.orcamento_tipo` | `ABO`, `CBO` |

**Exemplos:**
```
[TOFU][Tráfego][Perfil Ingrid][TESTE][ABO]
[BOFU][Msgs WPP][R24R Felipe][ESCALA][CBO]
```

### Nome do conjunto de anúncios

**Estrutura:** `[NUMERAÇÃO + PÚBLICO][CONVERSÃO][GEO]`

| Campo | Fonte no briefing | Exemplos |
|-------|-------------------|---------|
| `[PÚBLICO]` | numeração sequencial + nome do público escolhido | `00-Aberto Mulheres 25-55` |
| `[CONVERSÃO]` | derivado do `destination_type` | `WPP`, `SITE`, `Formulário`, `Perfil IG` |
| `[GEO]` | `briefing_interpretado.geo_locations` | `BR`, `SP`, `BH`, `Raio 40km` |

**Exemplos:**
```
[00-Aberto Mulheres 25-55_WPP_BR]
[01-Int. Cirurgia Plástica_SITE_SP]
```

### Nome dos anúncios

**Estrutura:** `[DATA][NOME DO CRIATIVO][FORMATO][VARIAÇÃO][TIPO]`

| Campo | Fonte | Exemplos |
|-------|-------|---------|
| `[DATA]` | data atual (DD.MM) | `16.01`, `29.06` |
| `[NOME]` | nome do arquivo do Drive (sem extensão) | `AnteseDepois`, `Depoimento` |
| `[FORMATO]` | `creative_format` | `IMG`, `VID`, `CAR` |
| `[VARIAÇÃO]` | sequencial por arquivo | `V1`, `V2`, `V3` |
| `[TIPO]` | padrão `Feed` (Dark post se informado) | `Feed`, `Dark post` |

**Exemplos:**
```
[29.06_AnteseDepois_IMG_V1_Feed]
[29.06_Depoimento_VID_V1_Feed]
[29.06_Criativos_CAR_V1_Feed]
```

---

## Passo 2 — Exibir nomes para confirmação

Antes de criar qualquer entidade, exibir os nomes montados ao gestor:

```
Nomes que serão usados:

Campanha:  [TOFU][Tráfego][Perfil Ingrid][TESTE][ABO]
Conjunto:  [00-Aberto Mulheres 25-55_WPP_BR]
Anúncios:  [29.06_AnteseDepois_IMG_V1_Feed]
           [29.06_Depoimento_IMG_V2_Feed]

Confirmar? (Enter para continuar ou "AJUSTAR nome" para corrigir)
```

- Se o gestor responder `AJUSTAR nome`: aplicar as correções informadas e exibir novamente
- Apenas após confirmação (silêncio, "ok", "confirmar" ou Enter) prosseguir para criação

---

## Passo 3 — Criar a campanha (`ads_create_campaign`)

```python
params = {
    "name": nome_campanha,           # montado no Passo 1
    "objective": objective,          # ODAX resolvido do briefing
    "status": "PAUSED",              # SEMPRE PAUSED — nunca ACTIVE
    "special_ad_categories": [],     # lista vazia para campanhas comuns
}
# ads_create_campaign(ad_account_id=ids_resolvidos.ad_account_id, **params)
```

- Capturar `campaign_id` da resposta
- **Se falhar:** reportar o erro completo e parar — nunca prosseguir sem `campaign_id`
- Confirmar visualmente: `"Campanha criada: {campaign_id} — {nome_campanha}"`

---

## Passo 4 — Criar o conjunto de anúncios (`ads_create_ad_set`)

### Mapa de optimization_goal por objetivo + destino

| Objetivo | Destino | optimization_goal |
|----------|---------|-------------------|
| OUTCOME_SALES | WHATSAPP | CONVERSATIONS |
| OUTCOME_SALES | Site + pixel | OFFSITE_CONVERSIONS |
| OUTCOME_SALES | Site sem pixel | LINK_CLICKS |
| OUTCOME_TRAFFIC | Qualquer | LINK_CLICKS |
| OUTCOME_LEADS | Form | LEAD_GENERATION |
| OUTCOME_ENGAGEMENT | Vídeo | THRUPLAY |
| OUTCOME_ENGAGEMENT | Post | POST_ENGAGEMENT |

### promoted_object por objetivo

| Objetivo | promoted_object |
|----------|----------------|
| OUTCOME_TRAFFIC | `{"page_id": page_id}` |
| OUTCOME_SALES + WhatsApp | `{"page_id": page_id}` |
| OUTCOME_SALES + pixel | `{"pixel_id": pixel_id, "custom_event_type": "PURCHASE"}` |
| OUTCOME_LEADS | `{"page_id": page_id}` |
| OUTCOME_ENGAGEMENT | `{"page_id": page_id}` |

### Targeting

```python
targeting = {
    "geo_locations": briefing_interpretado["geo_locations"],
    "custom_audiences": [{"id": ids_resolvidos["audience_id"]}],
    "age_min": briefing_interpretado["age_min"],
    "age_max": briefing_interpretado["age_max"],
    "genders": briefing_interpretado["genders"],
}

# Se ADV+ Audience desativado (padrão):
targeting["targeting_automation"] = {"advantage_audience": 0}
```

### Campos ADV+ no conjunto

```python
adset_params = {
    "name": nome_conjunto,
    "campaign_id": campaign_id,
    "billing_event": "IMPRESSIONS",
    "optimization_goal": optimization_goal,     # derivado do mapa acima
    "daily_budget": briefing_interpretado["daily_budget_centavos"],  # em centavos — DA-B07
    "targeting": targeting,
    "promoted_object": promoted_object,
    "status": "PAUSED",
}

# Se ADV+ Creative desativado:
adset_params["is_dynamic_creative"] = False
adset_params["is_dynamic_creative_format_automation"] = False

# Se posicionamento manual:
adset_params["automatic_manual_state"] = "MANUAL"
```

- Capturar `ad_set_id` da resposta
- **Se falhar:** reportar o erro e parar — nunca criar anúncios sem `ad_set_id`

---

## Passo 5 — Criar os anúncios por formato

### Formato: Imagem

Para cada `image_hash` em `assets_prontos.image_hashes`:

```python
# 1. Criar criativo
creative_params = {
    "object_story_spec": {
        "page_id": page_id,
        "link_data": {
            "image_hash": image_hash,
            "link": briefing_interpretado["link_url"],     # URL de destino
            "message": briefing_interpretado["message_text"],
            "call_to_action": {"type": cta_type},
        }
    }
}
# ads_create_creative(ad_account_id=..., **creative_params) → creative_id

# 2. Criar anúncio
ad_params = {
    "name": nome_anuncio,      # montado no Passo 1
    "adset_id": ad_set_id,
    "creative": {"creative_id": creative_id},
    "status": "PAUSED",
}

# Se ADV+ Creative desativado:
ad_params["creative"]["degrees_of_freedom_spec"] = {
    "creative_features_spec": {
        "standard_enhancements": {"enroll_status": "OPT_OUT"}
    }
}
# ads_create_ad(ad_account_id=..., **ad_params) → ad_id
```

Um anúncio por imagem retornada pelo pipeline Drive → Meta.

### Formato: Vídeo

Para cada par `(video_id, thumbnail_hash)` em `assets_prontos.videos`:

```python
# Criar anúncio inline com video_data (DA-B05 — thumbnail obrigatória)
ad_params = {
    "name": nome_anuncio,
    "adset_id": ad_set_id,
    "creative": {
        "object_story_spec": {
            "page_id": page_id,
            "video_data": {
                "video_id": video_id,
                "image_hash": thumbnail_hash,     # DA-B05 — obrigatório
                "message": briefing_interpretado["message_text"],
                "call_to_action": {
                    "type": cta_type,
                    # DA-B10: NÃO incluir value.link em WHATSAPP_MESSAGE
                }
            }
        }
    },
    "status": "PAUSED",
}

# Se ADV+ Creative desativado:
ad_params["creative"]["degrees_of_freedom_spec"] = {
    "creative_features_spec": {
        "standard_enhancements": {"enroll_status": "OPT_OUT"}
    }
}
# ads_create_ad(ad_account_id=..., **ad_params) → ad_id
```

> **DA-B05:** Se `thumbnail_hash` estiver ausente, **bloquear** com mensagem — nunca criar anúncio de vídeo sem thumbnail.
> **DA-B10:** Para `destination_type: WHATSAPP`, o `call_to_action` em `video_data` inclui apenas `type` — **nunca incluir `value.link`**.

### Formato: Carrossel estático (DA-B04)

```python
# NÃO usar ads_create_creative para carrossel — a API não suporta (DA-B04)
# Criar anúncio inline com child_attachments

child_attachments = [
    {
        "image_hash": image_hash,
        "link": briefing_interpretado["link_url"],
        "name": f"Card {i+1}",
    }
    for i, image_hash in enumerate(assets_prontos["image_hashes"])
]

ad_params = {
    "name": nome_anuncio,
    "adset_id": ad_set_id,
    "creative": {
        "object_story_spec": {
            "page_id": page_id,
            "link_data": {
                "message": briefing_interpretado["message_text"],
                "link": briefing_interpretado["link_url"],
                "child_attachments": child_attachments,
            }
        }
    },
    "status": "PAUSED",
}
# ads_create_ad(ad_account_id=..., **ad_params) → ad_id
```

---

## Tratamento de falhas na criação de anúncios

- Se `ads_create_campaign` ou `ads_create_ad_set` falhar: **parar** e reportar — não há como continuar
- Se `ads_create_ad` falhar para um anúncio específico: **registrar a falha**, continuar com os demais e sinalizar `criacao_parcial: true` na saída
- Ao final, reportar o resultado completo ao gestor antes de fazer handoff para o Revisor

---

## Saída: `campanha_criada`

```yaml
campanha_criada:
  campaign_id: "..."
  campaign_name: "[TOFU][Tráfego][Perfil Ingrid][TESTE][ABO]"
  ad_set_id: "..."
  ad_set_name: "[00-Aberto Mulheres 25-55_WPP_BR]"
  ad_ids: ["...", "...", "..."]
  ad_names:
    - "[29.06_AnteseDepois_IMG_V1_Feed]"
    - "[29.06_Depoimento_IMG_V2_Feed]"
  objetivo: "OUTCOME_TRAFFIC"
  optimization_goal: "LINK_CLICKS"
  daily_budget_brl: 50.00
  daily_budget_centavos: 5000
  audience_nome: "[IG] Envolvimento IMCP 180D"
  audience_id: "..."
  adv_audience: false
  adv_creative: false
  status_todos: "PAUSED"
  criacao_parcial: false    # true se algum ad_id falhou na criação
  ad_ids_falhados: []       # lista de anúncios que falharam (se criacao_parcial: true)
```

Este payload é entregue ao **Revisor** (`agents/revisor.md`) para o gate humano obrigatório.

---

## Checklist final antes do handoff

Antes de entregar ao Revisor, verificar:

- [ ] `campaign_id` foi capturado com sucesso
- [ ] `ad_set_id` foi capturado com sucesso
- [ ] Pelo menos um `ad_id` foi criado com sucesso
- [ ] `status_todos` é `"PAUSED"` — **nunca** `"ACTIVE"`
- [ ] `ads_activate_entity` **não foi chamado** em nenhum momento desta task
- [ ] `daily_budget_centavos` = `daily_budget_brl × 100` (verificar conversão)
- [ ] Nenhum ID foi inventado — todos vieram de `ids_resolvidos`
