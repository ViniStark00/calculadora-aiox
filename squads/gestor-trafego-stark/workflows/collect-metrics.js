export const meta = {
  name: 'collect-metrics',
  description: 'Coleta métricas do Reportei e Meta Ads em lotes paralelos de 3 clientes e preenche o Google Sheets',
  phases: [
    { title: 'Preparação', detail: 'Calcular período, ler clientes ativos, verificar checkpoint' },
    { title: 'Coleta', detail: 'Lotes paralelos de 3 clientes via Reportei MCP e Meta Ads MCP' },
    { title: 'Planilha', detail: 'Executar fill_sheets.py por gestor para preencher Google Sheets' },
  ]
}

// ─── FASE 1: Preparação ───────────────────────────────────────────────────────
phase('Preparação')

const PREP_SCHEMA = {
  type: 'object',
  properties: {
    data_inicio:          { type: 'string', description: 'YYYY-MM-DD — segunda-feira da semana anterior' },
    data_fim:             { type: 'string', description: 'YYYY-MM-DD — domingo da semana anterior' },
    nome_aba:             { type: 'string', description: 'Ex: Junho' },
    sem_numero:           { type: 'string', description: 'Ex: Sem 2' },
    metricas_tmp:         { type: 'string', description: 'Caminho absoluto do arquivo JSON de checkpoint' },
    slugs_ja_coletados:   { type: 'array',  items: { type: 'string' } },
    batches: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            slug:                 { type: 'string' },
            reportei_project_id:  { type: ['number', 'null'] },
            meta_ad_account_id:   { type: ['string', 'null'] },
            gestor:               { type: 'string' }
          },
          required: ['slug', 'gestor']
        }
      }
    },
    gestores_unicos: {
      type: 'array',
      items: { type: 'string' },
      description: 'Lista de gestores únicos de TODOS os clientes ativos'
    }
  },
  required: ['data_inicio', 'data_fim', 'nome_aba', 'sem_numero', 'metricas_tmp', 'slugs_ja_coletados', 'batches', 'gestores_unicos']
}

// args opcionais: { data_inicio, data_fim, nome_aba, sem_numero } — passados pelo stark-chief
const argsValidos = args && args.data_inicio && args.data_fim && args.nome_aba && args.sem_numero

const prepPromptPeriodo = argsValidos
  ? `PERÍODO JÁ CALCULADO (passado via args):
- data_inicio: ${args.data_inicio}
- data_fim: ${args.data_fim}
- nome_aba: ${args.nome_aba}
- sem_numero: ${args.sem_numero}

Não calcule novamente. Use estes valores diretamente.`
  : `CALCULAR PERÍODO DA SEMANA ANTERIOR:
Use JavaScript Date para calcular:
  const hoje = new Date()
  const diasDesdeDomingo = (hoje.getDay() + 1) % 7 || 7
  const ultimoDomingo = new Date(hoje); ultimoDomingo.setDate(hoje.getDate() - diasDesdeDomingo)
  const segunda = new Date(ultimoDomingo); segunda.setDate(ultimoDomingo.getDate() - 6)

  MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
  nome_aba   = MESES_PT[segunda.getMonth()]
  sem_numero = "Sem " + Math.ceil(segunda.getDate() / 7)
  data_inicio = segunda como "YYYY-MM-DD"
  data_fim    = ultimoDomingo como "YYYY-MM-DD"`

const prep = await agent(
  `Você é o agente de preparação do workflow collect-metrics. Execute os 3 passos abaixo e retorne o JSON.

## PASSO 1 — Período

${prepPromptPeriodo}

## PASSO 2 — Checkpoint incremental

Com nome_aba e sem_numero do passo anterior:
- nome_arquivo = "metricas_stark_" + nome_aba + "_" + sem_numero.replace(" ","_") + ".json"
  Exemplo: "metricas_stark_Junho_Sem_2.json"
- metricas_tmp = caminho do diretório temporário do SO + "/" + nome_arquivo
  Use Bash: python -c "import tempfile,os; print(os.path.join(tempfile.gettempdir(),'metricas_stark_NOME_ABA_SEM_NUMERO.json'))"
  (substitua NOME_ABA e SEM_NUMERO pelos valores calculados)

Verifique se o arquivo existe (Bash: dir "<path>" no Windows ou ls "<path>"):
- Se existir: leia o JSON e extraia as chaves como slugs_ja_coletados
- Se não existir: crie o arquivo com conteúdo "{}" usando Write tool

## PASSO 3 — Clientes e lotes

Leia squads/gestor-trafego-stark/data/clientes.yaml (Read tool).
- Filtre ativo: true
- Para cada cliente ativo extraia: slug, reportei_project_id, meta_ad_account_id, gestores[0] (ou "" se array vazio)
- IGNORE slugs já presentes em slugs_ja_coletados
- Divida os clientes restantes em lotes de 3 (o último lote pode ter menos)
- Colete gestores_unicos: lista de gestores únicos de TODOS os clientes ativos (incluindo slugs_ja_coletados)
  Exemplo: ["vinicius", "gustavo", "andreyves", "richard", "luiz", "mateus", "thiago", "wallison", "amanda"]
  Atenção: ignore gestores vazios ("") desta lista.

Retorne o JSON estruturado conforme o schema.`,
  { schema: PREP_SCHEMA, label: 'prep-coleta', phase: 'Preparação' }
)

if (!prep || !prep.batches || prep.batches.length === 0) {
  log('Nenhum cliente novo para coletar — checkpoint já está completo ou nenhum cliente ativo.')
  return {
    status: 'ok',
    periodo: { data_inicio: prep && prep.data_inicio, data_fim: prep && prep.data_fim, nome_aba: prep && prep.nome_aba, sem_numero: prep && prep.sem_numero },
    metricas_tmp: prep && prep.metricas_tmp,
    status_por_cliente: (prep && prep.slugs_ja_coletados || []).map(slug => ({ slug, status: 'pulado', aviso: 'já coletado no checkpoint' })),
    fill_sheets: []
  }
}

log(`Preparação concluída: ${prep.slugs_ja_coletados.length} já no checkpoint, ${prep.batches.flat().length} a coletar em ${prep.batches.length} lote(s).`)

// ─── FASE 2: Coleta paralela por lotes de 3 ──────────────────────────────────
phase('Coleta')

const BATCH_RESULT_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      slug:   { type: 'string' },
      status: { type: 'string', enum: ['processado', 'aviso', 'erro', 'pulado'] },
      aviso:  { type: ['string', 'null'] }
    },
    required: ['slug', 'status']
  }
}

// Captura variáveis de prep em closure (executado após prep ser resolvido)
const DATA_INICIO    = prep.data_inicio
const DATA_FIM       = prep.data_fim
const NOME_ABA       = prep.nome_aba
const SEM_NUMERO     = prep.sem_numero
const METRICAS_TMP   = prep.metricas_tmp

const batchResults = await pipeline(
  prep.batches,
  (batch, _, batchIdx) => {
    const clientesDesc = batch.map(c =>
      `  - slug="${c.slug}" | reportei_project_id=${c.reportei_project_id || 'null'} | meta_ad_account_id=${c.meta_ad_account_id || 'null'} | gestor=${c.gestor}`
    ).join('\n')

    return agent(
      `Você é o agente de coleta de métricas (lote ${batchIdx + 1} de ${prep.batches.length}).

## CONTEXTO
- Período: ${DATA_INICIO} a ${DATA_FIM}
- nome_aba: ${NOME_ABA} | sem_numero: ${SEM_NUMERO}
- Arquivo de checkpoint: ${METRICAS_TMP}
- MCP Reportei: prefixo mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
- MCP Meta Ads: prefixo mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52

## CLIENTES DESTE LOTE
${clientesDesc}

## INSTRUÇÃO GERAL
Processe CADA cliente sequencialmente (um por vez). Para cada cliente:

### PASSO 5A — Reportei MCP (se reportei_project_id não for null)

Use ToolSearch para encontrar a tool de métricas do Reportei (busque "get_project_metrics" ou "get_metrics" no prefixo mcp__30ebe978).
Busque: GET /v2/projects/{reportei_project_id}/metrics?start=${DATA_INICIO}&end=${DATA_FIM}

Extraia por integração e campo (valores ausentes → 0.0):
| Campo destino      | Integração Reportei    | Campo na resposta                                       |
|--------------------|------------------------|---------------------------------------------------------|
| meta_spend_total   | facebook_ads           | spend                                                   |
| leads_meta         | facebook_ads           | actions_lead                                            |
| conversas_whats    | facebook_ads           | actions_onsite_conversion.messaging_conversation_started_7d |
| seguidores         | instagram_business     | new_followers_count  (DIRETO — não dividir por nada)    |
| google_spend       | google_adwords         | cost_micros          (já em R$ — não dividir)           |
| cpa_google         | google_adwords         | cost_per_conversion                                     |
| leads_respondi     | facebook_ads           | actions_lead         (fallback se Meta MCP não responde)|

- ATENÇÃO: slug da integração Google é "google_adwords" — NÃO "google_ads"
- Se 429: aguardar 60s, tentar 1x. Se falhar: status "erro"
- Se 401: status "erro", aviso "Token Reportei expirado. Atualizar REPORTEI_TOKEN."
- Se reportei_project_id é null: pular passo 5A, todos os campos em 0.0

### PASSO 5B — Meta Ads MCP (somente se meta_ad_account_id não for null)

Use ToolSearch para encontrar ads_get_ad_entities no prefixo mcp__c0a7182d.
Parâmetros:
- ad_account_id: meta_ad_account_id do cliente
- level: "campaign"
- fields: ["id", "name", "spend", "lead"]
- time_range: {"since": "${DATA_INICIO}", "until": "${DATA_FIM}"}

Parse do valor monetário (ex: "R$1.137,56 BRL" → 1137.56):
  s.replace("R$","").replace(" BRL","").replace(".","").replace(",",".")

Extraia:
- tofu_spend:      sum(spend) de campanhas com "[TOFU]" ou "[IMP]" no nome
- leads_respondi:  sum(lead)  de campanhas com "RESPONDI" no nome (case-insensitive)
  Nota: campo correto é "lead" (level=campaign). "actions_lead" retorna erro nesse nível.

Se meta_ad_account_id é null: tofu_spend=0.0, leads_respondi=0.0, aviso "sem meta_ad_account_id".

### PASSO 5C — Salvar checkpoint após cada cliente

Após processar o cliente (mesmo que haja aviso):
1. Leia o arquivo ${METRICAS_TMP} (Read tool)
2. Adicione/atualize a chave do slug com as métricas:
   {
     "tofu_spend":       <float>,
     "meta_spend_total": <float>,
     "seguidores":       <float>,
     "conversas_whats":  <float>,
     "leads_meta":       <float>,
     "leads_respondi":   <float>,
     "cpa_google":       <float>,
     "google_spend":     <float>
   }
3. Escreva o arquivo atualizado (Write tool)
4. Registre: "[CHECKPOINT] {slug} salvo ({N} clientes no disco)"

## RESTRIÇÕES ABSOLUTAS
- PROIBIDO: browser, Chrome, Playwright, Claude in Chrome, qualquer URL externa
- PROIBIDO: criar aba no Sheets
- PROIBIDO: usar google_ads como slug — sempre google_adwords
- NÃO retornar os dados brutos de métricas — retornar APENAS o array de status

Retorne APENAS o array JSON de status por cliente conforme o schema.`,
      { schema: BATCH_RESULT_SCHEMA, label: `lote-${batchIdx + 1}`, phase: 'Coleta' }
    )
  }
)

const statusNovos = batchResults.filter(Boolean).flat()
const statusCheckpoint = prep.slugs_ja_coletados.map(slug => ({
  slug,
  status: 'pulado',
  aviso: 'já coletado no checkpoint — retomada após compactação'
}))

const erros = statusNovos.filter(r => r.status === 'erro')
log(`Coleta concluída: ${statusNovos.filter(r => r.status === 'processado').length} processados, ${statusNovos.filter(r => r.status === 'aviso').length} com aviso, ${erros.length} erros, ${statusCheckpoint.length} reutilizados do checkpoint.`)

// ─── FASE 3: Preencher planilha por gestor ────────────────────────────────────
phase('Planilha')

const FILL_RESULT_SCHEMA = {
  type: 'object',
  properties: {
    gestor:               { type: 'string' },
    status:               { type: 'string', enum: ['ok', 'erro', 'aviso'] },
    clientes_preenchidos: { type: 'number' },
    saida:                { type: 'string' }
  },
  required: ['gestor', 'status', 'saida']
}

const gestores = (prep.gestores_unicos || []).filter(g => g && g.length > 0)

if (gestores.length === 0) {
  log('Nenhum gestor encontrado — pulando fill_sheets.py.')
} else {
  log(`Preenchendo planilha para ${gestores.length} gestor(es): ${gestores.join(', ')}`)
}

const fillResults = gestores.length > 0
  ? await parallel(
      gestores.map(gestor => () =>
        agent(
          `Execute fill_sheets.py para o gestor "${gestor}".

COMANDO (execute via Bash tool — use "python", não "python3"):
python squads/gestor-trafego-stark/scripts/fill_sheets.py --metricas-arquivo "${METRICAS_TMP}" --gestor ${gestor}

REGRAS:
- Execute o comando EXATAMENTE como está acima (não modifique os parâmetros)
- Capture toda a saída (stdout e stderr)
- Se a saída contiver "[ERRO]" ou o comando falhar: retorne status "erro"
- Se a saída contiver "[OK]" ou "[STATUS_JSON]": retorne status "ok"
- Conte quantos clientes foram preenchidos (linhas com "← " na saída)
- Retorne a saída completa no campo "saida"`,
          { schema: FILL_RESULT_SCHEMA, label: `fill-${gestor}`, phase: 'Planilha' }
        )
      )
    )
  : []

const fillOk    = fillResults.filter(r => r && r.status === 'ok').length
const fillErro  = fillResults.filter(r => r && r.status === 'erro').length
log(`Planilha: ${fillOk} gestor(es) preenchidos com sucesso, ${fillErro} erro(s).`)

// ─── Resultado final ──────────────────────────────────────────────────────────
return {
  status: erros.length === 0 && fillErro === 0 ? 'ok' : 'parcial',
  periodo: {
    data_inicio: DATA_INICIO,
    data_fim:    DATA_FIM,
    nome_aba:    NOME_ABA,
    sem_numero:  SEM_NUMERO
  },
  metricas_tmp: METRICAS_TMP,
  status_por_cliente: [...statusNovos, ...statusCheckpoint],
  fill_sheets: fillResults.filter(Boolean)
}
