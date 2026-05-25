---
task: fetch-metrics
agent: coletor
elicit: false
inputs:
  - gestor_block: "Vinicius"
  - periodo: calculado automaticamente (último domingo)
  - sheet_id: variável de ambiente SHEET_ID
  - reportei_token: variável de ambiente REPORTEI_TOKEN
outputs:
  - planilha_preenchida: colunas C/E/H/K/O na aba da semana
  - status_por_cliente: lista com status de cada cliente (processado/pulado/erro)
---

# Task: fetch-metrics — Coleta de Métricas

**Atividade 1 do pipeline:** busca métricas no Reportei API v2 e preenche o Google Sheets.

## Pré-condições

- Variáveis de ambiente `REPORTEI_TOKEN`, `SHEET_ID` e `GOOGLE_SERVICE_ACCOUNT_JSON` configuradas
- Aba da semana (`DD/MM/AAAA`) já criada na planilha manualmente
- `config/clientes-config.yaml` acessível

## Passos

### Passo 1 — Calcular período
```
data_hoje = hoje
ultimo_domingo = hoje - timedelta(days=(hoje.weekday() + 1) % 7)
data_inicio = ultimo_domingo - timedelta(days=6)  # segunda-feira
data_fim = ultimo_domingo                          # domingo
nome_aba = data_inicio.strftime('%d/%m/%Y')
```

### Passo 2 — Verificar aba no Sheets
1. Abrir planilha via Google Sheets API (service account)
2. Buscar aba com nome `nome_aba`
3. **Se não existir:** interromper com erro claro:
   > "Aba '[DD/MM/AAAA]' não encontrada na planilha [SHEET_ID]. Criar manualmente e rodar novamente."

### Passo 3 — Buscar projetos do Reportei

**Estratégia em duas camadas (Plano B — IDs diretos têm prioridade):**

A API `GET /v2/projects` retorna apenas 4 projetos com o token do Vinicius (Admin).
Para contornar, o config tem `project_ids` com IDs conhecidos — usar lookup direto.

```
todos_projetos = []
project_ids_config = clientes_config.get('project_ids', {})

# Camada 1 — IDs configurados: chamar GET /v2/projects/{id} diretamente
for nome_planilha, project_id in project_ids_config.items():
    resp = GET /v2/projects/{project_id}
    if resp.status_code == 200:
        projeto = resp.json()
        todos_projetos.append(projeto)
        sleep(0.6)
    else:
        registrar aviso: f"ID {project_id} ({nome_planilha}): erro {resp.status_code}"

# Camada 2 — Descoberta por listagem (fallback para clientes sem ID configurado)
ids_ja_carregados = {p['id'] for p in todos_projetos}
page = 1
while True:
    resp = GET /v2/projects?per_page=100&page={page}
    projetos = resp.json()
    for p in projetos:
        if p['id'] not in ids_ja_carregados:
            todos_projetos.append(p)
            ids_ja_carregados.add(p['id'])
    if len(projetos) < 100: break
    page += 1
    sleep(0.6)
```

> **Nota:** Quando todos os clientes tiverem IDs mapeados em `project_ids`, a Camada 2
> (listagem paginada) não adicionará projetos novos — serve apenas de fallback para novos
> clientes ainda não mapeados.

### Passo 4 — Identificar bloco Vinicius na planilha
1. Ler todas as linhas da aba `nome_aba`
2. Localizar header "Vinicius" → início do bloco
3. Localizar próximo header de gestor → fim do bloco
4. Extrair lista de clientes (coluna A) do bloco

### Passo 5 — Para cada cliente do bloco
1. Resolver nome via `manual_map` em `clientes-config.yaml`
2. Se não encontrado → tentar fuzzy match (threshold 0.60)
3. Se ainda não encontrado → registrar como ERRO e continuar com próximo
4. Buscar métricas: `GET /v2/projects/{project_id}/metrics?start={data_inicio}&end={data_fim}`
5. Extrair valores usando `_to_float()`:
   - `meta_spend` → buscar por plataforma `meta` ou `facebook_ads`
   - `google_spend` → buscar por plataforma `google_adwords` (NÃO `google_ads`)
   - `seguidores` → buscar por `ref == 'ig:new_followers_count'`
   - `conversas` → buscar por `ref == 'messaging_conversation_started_7d'`
   - `conversoes` → buscar por tipo `conversions`
6. **Exceção Dr. Javier:** pular `meta_spend` sem erro
7. `sleep(0.6)` após cada chamada
8. Se erro 429: aguardar 60s mínimo e tentar novamente 1x

### Passo 6 — Preencher planilha
Para cada cliente processado com sucesso, escrever na linha correspondente:
- Coluna C: `meta_spend`
- Coluna E: `google_spend`
- Coluna H: `seguidores`
- Coluna K: `conversas`
- Coluna O: `conversoes`

### Passo 7 — Retornar status
Montar e retornar `status_por_cliente` (lista de dicts) para o `quality-gate` (verify-fill).

## Tratamento de erros

| Situação | Ação |
|----------|------|
| Aba não existe | STOP — erro claro ao usuário |
| Token expirado (401) | STOP — "Atualizar REPORTEI_TOKEN" |
| Projeto não encontrado | Registrar ERRO no status, continuar |
| Rate limit (429) | Aguardar 60s, retry 1x, se falhar → registrar ERRO |
| Valor ausente na métrica | `_to_float(None)` → 0.0, registrar aviso |
