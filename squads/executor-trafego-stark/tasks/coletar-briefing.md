# Task: coletar-briefing.md

> **Executor:** Agente Criador
> **DESIGN.md:** seções 4 (RQ-UX-001, RQ-UX-002, DA-B14), 10 (Schema do Briefing)
> **Saída:** `briefing_interpretado` — campos mapeados para parâmetros da API

---

## Objetivo

Coletar o briefing do gestor em linguagem natural (one-shot) e interpretar a resposta em campos estruturados prontos para uso nas tasks seguintes (`resolver-ids.md`, `criar-campanha.md`).

---

## Passo 1 — Identificar o tipo de campanha

Antes de exibir o briefing, o Criador pergunta:

```
Qual tipo de campanha vamos criar?

1. Vendas (WhatsApp, site ou landing page)
2. Tráfego (link externo)
3. Leads (formulário do Meta)
4. Engajamento (post ou vídeo)
```

Aguardar a resposta do gestor. Avançar apenas com um tipo confirmado.

---

## Passo 2 — Exibir briefing completo (one-shot, RQ-UX-001)

Exibir **todos os campos relevantes de uma só vez** — nunca campo a campo. O gestor responde em linguagem natural.

### Briefing: Vendas (WhatsApp / Site / Landing Page)

```
📋 BRIEFING — Campanha de Vendas

1. Nome da campanha:
2. Conta de anúncios: [lista numerada das contas disponíveis via ads_get_ad_accounts]
3. Destino: (WhatsApp / Site / Landing page)
4. Link de destino: (se site/landing page — obrigatório)
5. Pasta do Drive com criativos: (link da pasta)
6. Formato dos criativos: (imagem / vídeo / carrossel)
7. Público: [lista numerada via ads_get_ad_account_custom_audiences] → escolha o número
8. Orçamento diário: (valor em reais)
9. ADV+ Audience: (ativado / desativado) [padrão: desativado]
10. ADV+ Creative: (ativado / desativado) [padrão: desativado]
11. Posicionamentos: (automático / manual)
12. Texto do anúncio (message):
13. Título do anúncio (headline): [opcional]
14. Localização: (cidade + raio em km, ex: BH 40km) — obrigatório
15. Faixa etária: (ex: 25-55) [padrão: 18-65+]
16. Gênero: (todos / apenas mulheres / apenas homens) [padrão: todos]
```

### Briefing: Tráfego (link externo)

```
📋 BRIEFING — Campanha de Tráfego

1. Nome da campanha:
2. Conta de anúncios: [lista numerada]
3. Link de destino: (URL do site/landing page) — obrigatório
4. Pasta do Drive com criativos: (link da pasta)
5. Formato dos criativos: (imagem / vídeo / carrossel)
6. Público: [lista numerada] → escolha o número
7. Orçamento diário: (valor em reais)
8. ADV+ Audience: (ativado / desativado) [padrão: desativado]
9. ADV+ Creative: (ativado / desativado) [padrão: desativado]
10. Posicionamentos: (automático / manual)
11. Texto do anúncio (message):
12. Título do anúncio (headline): [opcional]
13. Localização: (cidade + raio em km) — obrigatório
14. Faixa etária: [padrão: 18-65+]
15. Gênero: [padrão: todos]
```

### Briefing: Leads (formulário do Meta)

```
📋 BRIEFING — Campanha de Leads

1. Nome da campanha:
2. Conta de anúncios: [lista numerada]
3. Formulário: (usar formulário existente / criar novo) — obrigatório
4. Pasta do Drive com criativos: (link da pasta)
5. Formato dos criativos: (imagem / vídeo / carrossel)
6. Público: [lista numerada] → escolha o número
7. Orçamento diário: (valor em reais)
8. ADV+ Audience: (ativado / desativado) [padrão: desativado]
9. ADV+ Creative: (ativado / desativado) [padrão: desativado]
10. Posicionamentos: (automático / manual)
11. Texto do anúncio (message):
12. Título do anúncio (headline): [opcional]
13. Localização: (cidade + raio em km) — obrigatório
14. Faixa etária: [padrão: 18-65+]
15. Gênero: [padrão: todos]
```

> **Nota leadgen_tos:** Se objetivo for Leads, verificar `leadgen_tos_accepted` da página durante FASE 0 (`resolver-ids.md`). Se `false`, bloquear com mensagem antes de criar — a API rejeitará o anúncio.

### Briefing: Engajamento (post ou vídeo)

```
📋 BRIEFING — Campanha de Engajamento

1. Nome da campanha:
2. Conta de anúncios: [lista numerada]
3. Criativo: (impulsionar post existente / criar dark post)
   → Se post existente: URL ou ID do post
   → Se dark post: pasta do Drive com criativos
4. Formato: (imagem / vídeo / carrossel) [se dark post]
5. Público: [lista numerada] → escolha o número
6. Orçamento diário: (valor em reais)
7. ADV+ Audience: (ativado / desativado) [padrão: desativado]
8. ADV+ Creative: (ativado / desativado) [padrão: desativado]
9. Posicionamentos: (automático / manual)
10. Texto do anúncio (message): [se dark post]
11. Localização: (cidade + raio em km) — obrigatório
12. Faixa etária: [padrão: 18-65+]
13. Gênero: [padrão: todos]
```

---

## Passo 3 — Interpretar a resposta em linguagem natural (RQ-UX-002)

Após a resposta do gestor, interpretar usando a tabela abaixo:

| Resposta do gestor | Resolução interna |
|---|---|
| "whats" / "zap" / "WhatsApp" | `destination_type: WHATSAPP` |
| "reels e stories" | posicionamento explícito: reels + stories |
| "ADV+ tudo off" | `advantage_audience: 0` + `is_dynamic_creative: false` + `automatic_manual_state: MANUAL` |
| "R$ 50" / "50 reais" / "50" | `daily_budget: 5000` (× 100 — conversão obrigatória) |
| "carrossel" | formato `child_attachments` via `object_story_spec` |
| "vendas" / "compras" / "conversão" | `objective: OUTCOME_SALES` |
| "tráfego" / "visitas" / "link" | `objective: OUTCOME_TRAFFIC` |
| "leads" / "formulário" / "cadastro" | `objective: OUTCOME_LEADS` |
| "engajamento" / "curtidas" / "alcance" | `objective: OUTCOME_ENGAGEMENT` |
| "automático" / "auto" | `placements: automatic` |
| "manual" (posicionamentos) | `automatic_manual_state: MANUAL` |
| "todos" (gênero) | `genders: [1, 2]` |
| "apenas mulheres" / "só mulheres" | `genders: [2]` |
| "apenas homens" / "só homens" | `genders: [1]` |
| "18-55" / "25 a 65" (faixa etária) | `age_min: N, age_max: M` |

**Regra:** Sempre preferir a resolução explícita — nunca inferir intenção não declarada.

---

## Passo 4 — Verificar campos obrigatórios ausentes (DA-B14)

Após interpretar a resposta, verificar os campos obrigatórios que **não foram mencionados**. Se houver campos faltando, agrupá-los em **uma única mensagem**:

```
Alguns campos não foram informados. Responda ou pressione Enter para usar o padrão:

Localização? (ex: BH 40km) ← obrigatório, sem padrão
Faixa etária? (padrão: 18-65+)
Gênero? (padrão: todos)
Posicionamento? (padrão: automático)
Período de veiculação? (padrão: sem data de fim)
```

**Regras de exibição:**
- Exibir **apenas** os campos genuinamente não mencionados — nunca repetir o que o gestor já respondeu
- Campos com padrão seguro: mostrar o padrão entre parênteses — gestor pode pressionar Enter para aceitar
- Campos sem padrão (`localização`, `link de destino`): marcar como obrigatórios — **bloquear** se não respondidos
- Tudo em uma única mensagem — sem ir e vir campo por campo

---

## Saída: `briefing_interpretado`

Ao final deste passo, o Criador possui o `briefing_interpretado` com todos os campos mapeados:

```yaml
briefing_interpretado:
  # Identificação
  account: "nome-da-conta"              # informado pelo gestor — nunca assumido
  campaign_name_raw: "..."              # nome livre do gestor (antes da nomenclatura automática)

  # Objetivo e destino
  objective: "OUTCOME_TRAFFIC"          # ODAX resolvido
  destination_type: "WHATSAPP"          # WHATSAPP | WEBSITE | LEAD_FORM | POST_ENGAGEMENT

  # Assets
  creative_folder: "https://drive.google.com/drive/folders/..."
  creative_format: "imagem"             # imagem | video | carrossel

  # Público (escolhido pelo gestor pelo número)
  audience_choice: 3                    # número escolhido pelo gestor
  # audience_id será resolvido em resolver-ids.md

  # Orçamento
  daily_budget_brl: 50.00
  daily_budget_centavos: 5000           # conversão obrigatória

  # ADV+
  adv_audience: false
  adv_creative: false
  placements: "automatic"              # automatic | manual

  # Copy
  message_text: "..."
  headline: "..."                       # opcional
  cta_type: "LEARN_MORE"               # derivado do destino

  # Targeting
  geo_locations:
    cities: [{key: "...", name: "BH", radius: 40, distance_unit: "kilometer"}]
  age_min: 25
  age_max: 55
  genders: [1, 2]                       # 1=homem, 2=mulher; [1,2]=todos

  # Veiculação
  end_time: null                        # null = sem data de fim

  # Tipo (para nomenclatura automática)
  funil: "TOFU"                         # TOFU | MOFU | BOFU — perguntar se não óbvio
  tipo_veiculacao: "TESTE"              # TESTE | ESCALA — perguntar se não informado
  orcamento_tipo: "ABO"                 # ABO | CBO — perguntar se não informado
```

Este `briefing_interpretado` é passado como entrada para `resolver-ids.md` (FASE 0).

---

## Notas de implementação

- A lista de contas (`ads_get_ad_accounts`) e de públicos (`ads_get_ad_account_custom_audiences`) é obtida **antes** de exibir o briefing, para que o gestor possa já escolher pelos números
- Se `ads_get_ad_accounts` retornar mais de uma conta: listar todas numeradas e aguardar escolha — nunca assumir
- Se `ads_get_ad_accounts` retornar apenas uma conta: mencionar o nome e confirmar com o gestor antes de prosseguir (guardrail #8)
- Público deve ser apresentado com nome e tipo (ex: "Engajamento — Instagram") para facilitar a escolha do gestor
- Após escolha do público, verificar `delivery_status` — se não for `ACTIVE`, alertar o gestor antes de continuar
