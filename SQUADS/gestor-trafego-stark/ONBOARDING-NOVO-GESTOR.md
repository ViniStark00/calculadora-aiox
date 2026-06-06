# Onboarding — Novo Gestor no Squad gestor-trafego-stark

> Documento para gestores de tráfego da Stark Marketing que vão integrar suas carteiras ao squad unificado.
> Siga as 3 etapas na ordem. Sem completar as 3, o squad vai rodar com dados incompletos.

---

## O que o squad faz por você

Automatiza 4 rotinas que hoje você faz manualmente:

| Rotina | Comando | O que entrega |
|--------|---------|---------------|
| Monitoramento diário | `*rotina-diaria` | Alertas de CPL/CPM/CTR por conta, classificados por severidade (🔴🟡ℹ️) |
| Relatório semanal | `*rotina-semanal [cliente]` | Relatório no Reportei + marco na timeline + mensagem de WhatsApp formatada |
| Preenchimento de planilha | `*planilha [cliente]` | Preenche o Google Sheets com as métricas da semana |
| Status report ClickUp | `*status-report-clickup [cliente]` | Narrativa de ações da semana no ClickUp, para aprovação antes de publicar |

---

## Etapa 1 — Adicionar clientes no clientes.yaml

Arquivo: `squads/gestor-trafego-stark/data/clientes.yaml`

Adicione um bloco para cada cliente da sua carteira seguindo o template abaixo. Campos com `*` são obrigatórios — sem eles o squad não consegue rodar para o cliente.

```yaml
- nome: "Nome Completo do Cliente"          # * nome oficial para relatórios
  slug: "nome-slug"                          # * lowercase, hífens, sem acento — usado como ID
  gestores: [seu_nome]                       # * seu nome em lowercase (ex: breno, roberta, lucas)
  ativo: true                                # * true = ativo, false = pausado
  prioridade: 1                              # * ordem de processamento na rotina (1 = primeiro)
  reportei_project_id: 000000               # * ID do projeto no Reportei (obrigatório para relatório)
  especialidade: cirurgia_plastica           # * ver lista de especialidades válidas abaixo
  meta_ad_account_id: null                   # act_XXXXXXXXX se tiver Meta Ads, null se não tiver
  excluir_meta_monitoring: false             # true apenas se a conta for 100% Google Ads
  nome_whatsapp: "Dr. Fulano"                # * como chamar o cliente na mensagem de WhatsApp
  clickup_status_list_id: "000000000"        # * ID da lista de Status Report no ClickUp
  sheet_columns: *sheet_cols                 # incluir apenas se você preenche o bloco da planilha
  nota: "observação relevante"               # opcional — aparece nos alertas internos
```

### Especialidades válidas

Use exatamente um dos valores abaixo no campo `especialidade`. Isso define quais thresholds de CPL/CPM/CTR o squad vai aplicar nos alertas.

| Valor | Quando usar |
|-------|-------------|
| `cirurgia_plastica` | Cirurgiões plásticos generalistas (corpo + mama) |
| `cirurgia_facial` | Cirurgiões plásticos com foco exclusivo em face/facelift |
| `cirurgia_corporal` | Foco em lipoescultura, abdominoplastia, contorno corporal |
| `cirurgia_ortognatica` | Cirurgia ortognática e buco-maxilofacial |
| `cirurgia_bucomaxilofacial` | Buco-maxilofacial com outros nichos além de ortognática |
| `medicina_estetica` | Médicos estéticos, procedimentos minimamente invasivos |
| `emagrecimento` | Especialistas em emagrecimento, GLP-1, recontorno pós-perda |
| `tricologia` | Especialistas em cabelo e couro cabeludo |
| `ginecologia` | Ginecologistas e obstetras |
| `mommy_makeover` | Especialistas em procedimentos pós-gestação combinados |
| `cirurgia_trans` | Cirurgiões plásticos com foco em pacientes trans |
| `null` | Especialidade desconhecida — alertas serão genéricos, sem benchmark |

> Se a especialidade do seu cliente não está na lista, avise o responsável pelo squad para adicionar os thresholds correspondentes em `data/thresholds-por-especialidade.yaml` antes de ativar o monitoramento.

### Como encontrar o reportei_project_id

No Reportei, abra o projeto do cliente e olhe a URL:
`https://app.reportei.com/projects/XXXXXX/...` — o número é o ID.

### Como encontrar o clickup_status_list_id

No ClickUp, abra a lista de Status Report do cliente → clique nos três pontos → "Copy link". O número longo no final da URL é o ID.

---

## Etapa 2 — Criar documento de contexto no Drive

Para cada cliente, crie um documento na pasta **"Contexto Clientes - Stark"** no Google Drive.

O nome do arquivo deve seguir o padrão: `Contexto - [Nome do Cliente]`
Exemplo: `Contexto - Dr. João Silva`

O squad lê esse documento automaticamente antes de gerar cada relatório. Quanto mais completo, melhor a qualidade da narrativa gerada — especialmente para evitar erros de nicho como se referir a um cirurgião ortognático como dermatologista.

### Template do documento de contexto

```
# Contexto - [Nome do Cliente]

## 1. PERFIL & ESPECIALIDADE

[Especialidade e subespecialidades]
[Procedimentos principais]
[Posicionamento e diferencial]
[Localização]
[Público-alvo]

## 2. MOMENTO COMERCIAL ATUAL

[Métricas do último período]
[Ações em andamento]
[Decisões estratégicas recentes]

## 3. HISTÓRICO DE REUNIÕES

[Resumo das últimas reuniões — data + decisões tomadas]

## 4. PONTOS DE ATENÇÃO RECORRENTES

[Problemas conhecidos, sensibilidades, restrições do cliente]

## 5. APRENDIZADOS DE TRÁFEGO

[O que funcionou, o que não funcionou, benchmarks internos do cliente]

## 6. ÚLTIMA ATUALIZAÇÃO

[Data]
```

> O squad atualiza esse documento automaticamente ao final de cada `*rotina-semanal`. Você só precisa criar o documento inicial — depois ele se mantém sozinho.

---

## Etapa 3 — Validar antes do primeiro uso

Antes de rodar o squad pela primeira vez com um cliente, confirme:

- [ ] Cliente adicionado no `clientes.yaml` com todos os campos obrigatórios preenchidos
- [ ] `reportei_project_id` correto (testar abrindo o projeto no Reportei)
- [ ] `clickup_status_list_id` correto (a lista de Status Report existe no ClickUp)
- [ ] `especialidade` preenchida com um valor válido da lista
- [ ] Documento de contexto criado no Drive na pasta "Contexto Clientes - Stark"
- [ ] Se o cliente tem Meta Ads: confirmar que a conta está integrada no Reportei
- [ ] Se o cliente é 100% Google Ads: setar `excluir_meta_monitoring: true`

Rodando o squad sem esses itens, os erros mais comuns são:

| Erro | Causa | Solução |
|------|-------|---------|
| Relatório sem narrativa de nicho | Documento de contexto ausente no Drive | Criar o doc e rodar novamente |
| Alerta de threshold incorreto | `especialidade: null` ou valor errado | Corrigir no `clientes.yaml` |
| Status report publicado na lista errada | `clickup_status_list_id` null ou incorreto | Atualizar o ID no `clientes.yaml` |
| Relatório sem métricas | `reportei_project_id` incorreto | Verificar o ID no Reportei |

---

## Dúvidas e suporte

Responsáveis pelo squad: **Gustavo Radler** e **Vinicius Lima**

Para adicionar uma nova especialidade nos thresholds ou reportar comportamento inesperado do squad, abrir uma task no ClickUp com o título `[SQUAD] descrição do problema`.

---

*Documento criado em 2026-05-28 — versão 1.0*
