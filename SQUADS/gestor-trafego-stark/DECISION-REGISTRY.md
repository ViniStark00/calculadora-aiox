# Decision Registry — gestor-trafego-stark

> **Propósito:** Memória permanente de todas as decisões de mudança neste squad.
> Atualizado a cada checkpoint antes de trocar de sessão.
> Em caso de dúvida sobre o que foi decidido, este documento é a fonte da verdade.

---

## Como ler este documento

| Status | Significado |
|--------|-------------|
| 🟡 PENDENTE | Sugerido por Aria, aguardando aprovação do Vinicius |
| ✅ APROVADO | Vinicius aprovou — será implementado |
| ❌ REPROVADO | Vinicius reprovou — não será implementado |
| 🔄 EM EXECUÇÃO | Implementação iniciada |
| ✔️ CONCLUÍDO | Implementado e verificado |

---

## Sessão 1 — 2026-06-06

**Contexto da sessão:** Diagnóstico inicial do squad. Identificados 5 problemas distribuídos em duas frentes: Planilha (A1–A3) e Monitoramento (B1–B2).

**Agente responsável pelo diagnóstico:** Aria (Architect)

---

### Frente A — Planilha (Google Sheets)

---

#### A1 — Tab management com isolamento multi-gestor

**Status:** ✅ APROVADO

**Problema identificado:**
A aba da semana na planilha Google Sheets deve existir antes de rodar o pipeline. Se não existir, `fill_sheets.py` falha com erro sem tentar criar a aba automaticamente. Isso causa quebra silenciosa toda segunda-feira quando a aba da semana nova ainda não foi criada manualmente.

**Arquivos afetados:**
- `scripts/fill_sheets.py`
- `agents/coletor.md`

**Como era (antes):**
```python
# fill_sheets.py — comportamento atual
# Se a aba não existe, lança exceção e para execução
sheet = spreadsheet.worksheet(sheet_name)  # raises WorksheetNotFound
```

**Como ficará (após aprovação):**
```python
# 1. Tab management
try:
    sheet = spreadsheet.worksheet(sheet_name)   # usa aba existente
except gspread.exceptions.WorksheetNotFound:
    # duplica aba da semana anterior, preservando fórmulas e formatação
    sheet_anterior = spreadsheet.worksheets()[-1]
    sheet = sheet_anterior.duplicate(new_sheet_name=sheet_name)

# 2. Isolamento multi-gestor
# --gestor vinicius  → filtra clientes onde gestores inclui 'vinicius'
# --clientes imcp,dr-carlos  → filtra pelos slugs passados
# Escreve APENAS nas linhas dos clientes solicitados.
# NUNCA limpa a aba. Linhas de outros gestores ficam intocadas.
```

**Motivo da sugestão:** Elimina dependência de ação manual. Garante que um gestor não apague dados de outro ao rodar o script.

**Decisão:** APROVADO com escopo revisado — duplicar aba anterior (não criar em branco), isolamento por `--gestor` ou `--clientes`.
**Motivo da decisão:** Multi-gestor na mesma planilha exige isolamento por linha. Duplicar a aba anterior preserva fórmulas e formatação.

---

#### A2 — Flag `--dry-run` no fill_sheets.py

**Status:** ✅ APROVADO

**Problema identificado:**
Não há como testar o preenchimento sem escrever na planilha real. Qualquer teste de uma nova configuração de cliente ou novo período arriscada sobrescrever dados reais.

**Arquivos afetados:**
- `scripts/fill_sheets.py`

**Como era (antes):**
Sem flag de dry-run. Toda execução do script escreve diretamente na planilha.

**Como ficará (após aprovação):**
```bash
# Novo uso:
python fill_sheets.py --dry-run --metricas-json '...'

# Output em dry-run (apenas imprime, não escreve):
[DRY-RUN] imcp → linha 3 → C=R$1.234,56 | E=R$567,89 | H=12 | K=34 | O=5
[DRY-RUN] dra-danielle → linha 4 → C=R$890,00 | E=R$123,00 | H=8 | K=21 | O=2
[DRY-RUN] Nenhuma célula foi alterada.
```

**Motivo da sugestão:** Segurança ao testar novos clientes, novos períodos ou mudanças no script.

**Decisão:** APROVADO
**Motivo da decisão:** Permite testar sem risco de sobrescrever dados reais.

---

#### A3 — Validação de schema antes de escrever

**Status:** ✅ APROVADO

**Problema identificado:**
`sheet_columns` no `clientes.yaml` é configurado manualmente (ex: `meta_spend: C`). Se alguém editar errado (ex: `meta_spend: CC` ou `meta_spend: 3`), o script tenta escrever em coluna inválida sem avisar antes. Os valores também não são validados — uma string `"N/A"` pode ser escrita em célula numérica.

**Arquivos afetados:**
- `scripts/fill_sheets.py`

**Como era (antes):**
Sem validação. Script aceita qualquer valor do JSON e qualquer coluna do YAML.

**Como ficará (após aprovação):**
```python
# Validações adicionadas:
# 1. Colunas devem ser letras A-Z (ou AA-AZ para planilhas grandes)
# 2. Valores numéricos devem ser float ou int (não string vazia, não None como 0)
# 3. Avisa antes de escrever se algum valor está ausente vs. zero (zero é válido)
```

**Motivo da sugestão:** Previne escrita silenciosa de dados inválidos em células de métricas.

**Decisão:** APROVADO
**Motivo da decisão:** Previne erros silenciosos de configuração no clientes.yaml.

---

### Frente B — Monitoramento (Métricas e Tarefas)

---

#### B1 — Histórico persistido obrigatório (save-history como gate)

**Status:** ✔️ CONCLUÍDO (commit ae52bbc — 2026-06-07)

**Problema identificado:**
A Fase 6 (save-history) é `non-blocking` — se falhar, nenhum histórico é salvo e nenhum alerta é emitido. Sem histórico entre execuções, o sistema é completamente stateless: impossível detectar tendências (ex: CPL subindo 3 semanas consecutivas). Alertas só reagem ao estado atual, nunca antecipam.

**Arquivos afetados:**
- `tasks/rotina-semanal.md`
- `tasks/save-history.md`
- Novo arquivo: `data/historico-metricas.jsonl` (criado em runtime)

**Como era (antes):**
```markdown
<!-- rotina-semanal.md — Fase 6 atual -->
PHASE 6 — WRAP-UP (non-blocking)
├─ coletor → save-history   ← falha silenciosamente
```

**Como ficará (após aprovação):**
```markdown
<!-- rotina-semanal.md — Fase 6 proposta -->
PHASE 6 — WRAP-UP
├─ coletor → save-history   ← se falhar: avisar gestor (não bloquear pipeline, mas notificar)
└─ Formato: JSONL append em data/historico-metricas.jsonl
   {"data": "2026-06-02", "slug": "imcp", "meta_spend": 1234.56, "cpl": 123.45, ...}
```

**Motivo da sugestão:** Habilita detecção de tendências futuras (ex: "CPL de IMCP subiu 3 semanas seguidas"). Sem isso, o sistema nunca terá memória de longo prazo.

**Decisão:** APROVADO
**Motivo da decisão:** Memória de longo prazo é fundamental para alertas preditivos futuros.

---

#### B2 — Indicador de completude de dados no painel de alertas

**Status:** ✔️ CONCLUÍDO (commit 0d1921e — 2026-06-07)

**Problema identificado:**
Clientes com `meta_ad_account_id: null` usam Reportei como fallback. A lógica original assumia que esses clientes nunca teriam CPM/CTR/freq disponíveis — mas testes com o Reportei (2026-06-07) revelaram que isso é falso: quando o cliente tem integração Meta Ads ativa no Reportei, os dados chegam completos.

**Descoberta durante implementação (CP-07):**
Testado `get_project_metrics` para Dr. Leandro Gontijo (project_id: 627550, `meta_ad_account_id: null`). Retornou integração "Leandro Gontijo [Principal]" com `spend: 15837.11`, `cpm: 8.009689`, `ctr: 4.711811`, `frequency: 1.361966`. Ou seja: Reportei tem esses dados quando Meta Ads está integrado.

**Escopo expandido (decisão 2026-06-07):**
Em vez de badge fixo para todos os clientes sem `meta_ad_account_id`, a lógica detecta automaticamente em runtime qual fonte está disponível. Três fontes definidas:

| Fonte | Condição | Dados disponíveis |
|---|---|---|
| `meta_ads_mcp` | `meta_ad_account_id` preenchido | Completos via Meta Ads MCP |
| `reportei_meta` | `meta_ad_account_id: null` + Reportei tem integração Meta Ads | Completos via Reportei |
| `reportei_sem_meta` | `meta_ad_account_id: null` + Reportei sem integração Meta Ads | Parciais — só CPL |

**Badge:** só aparece quando `fonte == 'reportei_sem_meta'`.

**Arquivos afetados:**
- `agents/alerta-monitor.md` — seção `fonte_dados`, `severity_rules`, `metricas_coletadas_output`, `alert_format`, `heuristics`, `voice_dna`, `examples`

**Como era (antes):**
```
✅ [Dra. Nicolli] Sem alertas
# badge aparecia para qualquer cliente sem meta_ad_account_id — errado
```

**Como ficou (após implementação):**
```
✅ [Dr. Leandro Gontijo] OK        ← meta_ad_account_id null, Reportei com Meta Ads — sem badge
✅ [Dra. Nicolli] OK · ⚠️ dados parciais (CPM/CTR/freq indisponíveis — sem integração Meta no Reportei)
```

**Decisão:** APROVADO com escopo expandido
**Motivo:** A lógica original estava errada — badge fixo para todos os clientes sem meta_ad_account_id causaria falsos positivos e cegaria alertas de CPM/CTR/freq para clientes com dados disponíveis no Reportei.

---

### Frente C — Bugs de Período (prioridade sobre A1–A3)

---

#### A0-a — Bug: edge case de domingo em `calcular_aba()`

**Status:** ✅ APROVADO

**Problema identificado:**
A função `calcular_aba()` em `fill_sheets.py` (linha 50–55) usa `(hoje.weekday() + 1) % 7` para encontrar o último domingo. Quando rodada no **domingo** (weekday=6), essa expressão retorna 0 — e o script subtrai 0 dias, apontando para o próprio domingo de hoje como "último domingo". Resultado: retorna a semana atual (seg a dom desta semana) em vez da semana anterior.

**Arquivos afetados:**
- `scripts/fill_sheets.py` — função `calcular_aba()`, linha ~53

**Como era (antes):**
```python
ultimo_domingo = hoje - datetime.timedelta(days=(hoje.weekday() + 1) % 7)
# Domingo: (6+1)%7 = 0 → subtrai 0 → hoje mesmo → semana errada
```

**Como ficará (após aprovação):**
```python
dias_ate_domingo = (hoje.weekday() + 1) % 7
if dias_ate_domingo == 0:
    dias_ate_domingo = 7  # domingo: vai para o domingo anterior, não hoje
ultimo_domingo = hoje - datetime.timedelta(days=dias_ate_domingo)
```

**Motivo da sugestão:** Correção de bug. Comportamento incorreto apenas quando rodado no domingo.

**Decisão:** APROVADO
**Motivo da decisão:** Bug crítico que causa período errado toda vez que roda no domingo.

---

#### A0-b — Bug: API Reportei usa `last_7d` (janela deslizante) em vez de datas fixas

**Status:** ✅ APROVADO

**Problema identificado:**
Os agentes `alerta-monitor.md` e `coletor.md` chamam a API do Reportei com `lookback: "last_7d"`. Esse parâmetro representa os últimos 7 dias corridos a partir de hoje — uma janela deslizante que muda conforme o dia da semana. Isso ignora completamente o cálculo de segunda a domingo feito pelo script. O nome da aba pode estar certo, mas as métricas buscadas cobrem um período diferente.

**Arquivos afetados:**
- `agents/alerta-monitor.md` — chamadas à API Reportei
- `agents/coletor.md` — chamadas à API Reportei

**Como era (antes):**
```yaml
# Chamada atual (janela deslizante — ERRADO)
lookback: "last_7d"
```

**Como ficará (após aprovação):**
```yaml
# Chamada correta (datas fixas calculadas por calcular_aba())
date_from: "2026-06-01"   # segunda-feira da semana anterior
date_to: "2026-06-07"     # domingo da semana anterior
```

Os agentes devem receber `data_inicio` e `data_fim` calculados pelo mesmo método de `calcular_aba()` e passá-los como parâmetros explícitos para a API.

**Motivo da sugestão:** Correção de bug. É a raiz do problema "às vezes pega os dias errados" — não é o nome da aba que está errado, são as métricas buscadas.

**Decisão:** APROVADO
**Motivo da decisão:** Bug crítico — métricas coletadas não correspondem ao período da aba.

---

### Frente H — Hooks (enforcement determinístico)

> Hooks são regras executadas automaticamente pelo Claude Code antes de uma ferramenta ser usada.
> Não dependem do agente seguir a instrução — bloqueiam a chamada se a regra for violada.
> Configurados em `.claude/settings.json` → `hooks` → `PreToolUse`.

---

#### H1 — Hook: período padrão forçado em `fill_sheets.py`

**Status:** ✔️ CONCLUÍDO

**Regra a enforçar:** `fill_sheets.py` nunca deve ser chamado sem `--semana DD/MM/AAAA` explícito.

**Como funciona:**
PreToolUse intercepta chamadas Bash. Se detectar `fill_sheets.py` sem `--semana`, bloqueia e retorna:
```
[HOOK BLOQUEADO] fill_sheets.py chamado sem --semana.
Período correto para esta semana: --semana 01/06/2026
(segunda a domingo da semana anterior — calculado agora)
```
O agente é obrigado a recalcular e passar a data explícita.

**Arquivos afetados:**
- `.claude/settings.json` (ou `settings.local.json`) — novo hook PreToolUse

**Decisão:** APROVADO
**Motivo da decisão:** Enforcement determinístico — garante que o período nunca seja omitido acidentalmente.

---

#### H2 — Hook: bloqueio de `last_7d` em chamadas MCP do Reportei

**Status:** ✔️ CONCLUÍDO

**Regra a enforçar:** Ferramentas MCP do Reportei (`get_metrics`, `get_project_metrics`) não podem receber `lookback: last_7d` como parâmetro.

**Como funciona:**
PreToolUse intercepta chamadas MCP. Se detectar `last_7d` nos inputs, bloqueia:
```
[HOOK BLOQUEADO] Parâmetro last_7d proibido no Reportei.
Use date_from/date_to com segunda a domingo da semana anterior.
```

**Arquivos afetados:**
- `.claude/settings.json` — novo hook PreToolUse para ferramentas MCP Reportei

**Decisão:** APROVADO
**Motivo da decisão:** Complementa A0-b no nível de runtime — bloqueia antes de qualquer agente poder usar last_7d.

---

#### H3 — Hook: bloqueio de credenciais expostas em Bash

**Status:** ✔️ CONCLUÍDO

**Regra a enforçar:** Nenhum comando Bash pode conter tokens, chaves ou paths de service account em texto claro.

**Como funciona:**
PreToolUse escaneia o comando. Se detectar padrões como `REPORTEI_TOKEN=`, `service_account`, chaves JWT ou similares, bloqueia antes de executar.

**Arquivos afetados:**
- `.claude/settings.json` — novo hook PreToolUse para Bash

**Decisão:** APROVADO
**Motivo da decisão:** Segurança — impede vazamento acidental de credenciais em qualquer comando Bash.

---

### Frente C — Melhorias vindas do relatorio-semanal

---

#### C1 — Lotes de 3 nos agentes (configurável via settings.yaml)

**Status:** ✅ APROVADO

**Problema identificado:**
`settings.yaml` define `lote_paralelo: 3` mas nenhum agente usa esse valor. Na prática o squad processa clientes sequencialmente. O `relatorio-semanal` implementa lotes de 3 com base em orçamento de tokens: ~2.600 tokens/cliente × 3 = ~7.800 tokens/lote, margem segura. Acima de 3 (ex: 11 clientes em paralelo) = ~28.600 tokens com degradação observada de qualidade.

**Arquivos afetados:**
- `agents/alerta-monitor.md` — Fase 1 (monitoramento de 28 clientes)
- `agents/coletor.md` — Fase 2 (preenchimento de sheets)
- `tasks/rotina-semanal.md` — orquestração dos lotes

**Como era (antes):** Clientes processados um a um em sequência.

**Como ficará (após aprovação):** Fase 1 processa clientes em lotes de 3 simultaneamente. Fase 3 (geração de relatório) também em lotes de 3. Sheets (Fase 2) permanece serializado — uma chamada ao fill_sheets.py com todos os dados, sem risco de race condition.

**Decisão:** APROVADO — manter lote=3, configurável via `lote_paralelo` em settings.yaml
**Motivo da decisão:** Lote=3 comprovado seguro (~7.800 tokens/lote). Acima disso, risco de degradação de qualidade.

---

#### C2 — Contador global de rate limit Reportei (38 req → pausa 9min)

**Status:** ✅ APROVADO

**Problema identificado:**
O squad usa `sleep(0.6s)` entre chamadas ao Reportei, mas sem contador global. O limite da API é 40 requests por janela de 9 minutos. Com 28+ clientes, é possível atingir o limite e quebrar o pipeline sem recuperação automática. O `relatorio-semanal` tem contador global: ao atingir 38 requests, pausa 9 minutos automaticamente.

**Arquivos afetados:**
- `agents/alerta-monitor.md`
- `agents/coletor.md`

**Como era (antes):** Apenas `sleep(0.6s)` — sem contador, sem recuperação de 429.

**Como ficará (após aprovação):**
```
contador_global = 0
para cada cliente:
  se contador_global >= 38:
    pausar 540s (9 min)
    zerar contador
  chamar API Reportei
  contador_global += 1
```

**Decisão:** APROVADO
**Motivo da decisão:** Com 28+ clientes, o pipeline quebra sem recuperação automática ao atingir o rate limit.

---

#### C3 — MANUAL_MAP: mapeamento fixo Reportei → Planilha

**Status:** ✅ APROVADO

**Problema identificado:**
O nome de um projeto no Reportei frequentemente difere do nome na planilha (abreviações, acentuação, formatação). Sem um mapeamento fixo, o agente faz matching fuzzy em runtime — gastando tokens e podendo errar. O `relatorio-semanal` usa um `MANUAL_MAP` no `clientes-config.yaml` com o nome exato de cada lado.

**Arquivos afetados:**
- `data/clientes.yaml` — novo campo `nome_reportei` por cliente (opcional; se ausente, usa `nome`)
- `agents/coletor.md` — consultar `nome_reportei` antes de qualquer matching

**Como era (antes):** Agente faz busca fuzzy pelo nome do cliente no Reportei em runtime.

**Como ficará (após aprovação):**
```yaml
- nome: "IMCP - Instituto Mineiro de Cirurgia Plastica"
  nome_reportei: "IMCP"   # ← nome exato como aparece no Reportei
  slug: "imcp"
```
Se `nome_reportei` está preenchido → usar diretamente, sem fuzzy match. Zero tokens de busca.

**Dependência:** Item D2 (cross-reference automático) gera esse mapa.

**Decisão:** APROVADO
**Motivo da decisão:** Elimina matching fuzzy em runtime — zero tokens gastos em busca de nome.

---

#### C4 — Melhorias do fill_sheets.py vindas do relatorio-semanal

**Status:** ✅ APROVADO

**Problema identificado:**
Comparação direta entre as duas versões do preenchedor:

| Funcionalidade | stark atual | relatorio-semanal | Gap |
|---|---|---|---|
| `_to_float()` — converte e valida valores antes de escrever | ❌ | ✅ | Adicionar |
| Exception Dr. Javier (moeda ARS) no código, não só no YAML | ❌ | ✅ | Migrar |
| Retry automático 429 → espera 60s → tenta de novo | ❌ | ✅ | Adicionar |
| MANUAL_MAP integrado ao lookup da coluna A | ❌ | ✅ | Adicionar (após C3) |

**Arquivos afetados:**
- `scripts/fill_sheets.py`

**Como ficará (após aprovação):**
1. Função `_to_float(valor)`: converte string/int/None → float seguro; None → None (não escreve); "N/A" → None
2. Bloco try/except 429: ao receber HTTP 429, aguarda 60s e retenta 1x antes de falhar
3. Lógica de exception para clientes com moeda não-BRL: pular coluna de spend sem erro

**Decisão:** APROVADO
**Motivo da decisão:** As 3 melhorias já existem no relatorio-semanal e comprovadamente funcionam — port direto.

---

### Frente D — Dados: Clientes e Mapeamentos

---

#### D1 — Atualizar clientes.yaml com lista completa de clientes ativos

**Status:** ✅ APROVADO

**Problema identificado:**
`data/clientes.yaml` tem 28 clientes (versão da fusão dos dois squads antigos). A lista real de clientes ativos fornecida tem ~90 nomes organizados em blocos por gestor. O YAML está desatualizado e incompleto.

**Contexto:**
- Blocos separados por linha em branco na lista = blocos por gestor
- Alguns clientes têm sufixos informativos: `(MSG)` ou `| Mensagens` = foco em WhatsApp; `| Face` = especialidade facial; `(MaxiOral)` = nome da clínica
- Todos os ~90 nomes são clientes/contas reais gerenciados pelo squad

**Lista recebida (2026-06-06) — organizada por blocos:**

```
Bloco 1: Dra. Taissa Recalde, Dr Carlos Matheus, Dr Luis Fernando Garcia,
  Dra. Marina Rossato (MSG), Dr Fernando Froes, Dr Luciano Esteves,
  Dra. Lívia Dantas, Dra. Ivy Magri

Bloco 2: Dr. Rafael Varella, Dr. Vinicius Camargo, Dr. Eduardo Raulino,
  Dr. Thiago Melo de Souza, Dr Rodolfo Soares, Dr. Alvaro, Dr. Gilberto Filho,
  Dr Fernando Suguita, Dra Nicolle

Bloco 3: Dr Fernando Franco, Dr George, Dr Juan Lopez, Dr Daniel Morais,
  Dr. Edson Prata, Dr. Rafel Mello, Dra. Andrea Yuan, Dr Luiz Fernando,
  Dra. Jussara, Dra. Ana Paula, Dr Alessandro Miron, Dr Adriano Cicarelli

Bloco 4: Dr Charles Berres, Dr Francisco Tribulato, Dr Eduardo Nakagawa,
  Dr Cleber Vieira, Dra Luiza Coutinho | Face, Dra Fernanda Marció,
  Dr. Thiago Faria, Fernanda Comora, Priscilla Lotierzo,
  Dra Lenise Franco (mensagens), Dra Juliana Jordão

Bloco 5: Dra Amandia Marchetti, Samille | Mensagens, Ranierí, Victor Augusto,
  Dr Matheus Manica, Janete Clívea, Clinica Empoderatti | Mensagens,
  Daniel Valente, Anderson Kuboniwa, Marcus Calazans, Dra. Viviane Borba,
  Dr. Carlos Costa, Dr. Enzo, Dr Javier, Dr Ênio Almeida, Dr Thiago Lins

Bloco 6: Dr. Leandro Gontijio, IMCP, Dr. Guilherme Mattar, Dr Luiz Borba,
  Dr. Lucas Consentino, Dr. Humberto, Dr. Laureano Filho,
  Dr. Diego Gonzalez Salvador, DESTRA, Dr. Joel Abdala, Dr. Matheus Ocampo

Bloco 7: Dra. Graciela Machado, Dr. Fernando Bezerra, Dr. Marcelo Bezerra,
  Dra. Érica Marchiori | Ortognática | Mensagens, Dra. Fernanda Encinas,
  Dra. Mariângela Santiago, Dr. Higner Forastieri, Dr. Caio Fernandes,
  Dr. Diego Alencar | Mensagens, Dra. Nicolli Carneiro | Mensagens,
  Dra. Luana Girondi, Concierge IA, Stark Marketing

Bloco 8: Ricardo Martins, IGO Implantes/Mensagens, Dr João Felippe,
  Dr Marcelo Azevedo, Dr. Túlio Martins, Dr. Daniel Rennó (MaxiOral),
  Dra. Anne Groth, Dr.Thiago Iria, Dr. Cadu Gazinelli, Dr. David Zuluaga,
  Dr. Marcello Santos

Bloco 9: Thiago Bandeira, Felipe máximo, Fabrício Camargo
```

**Pré-requisito para implementar:** Item D2 (cross-reference) deve ser feito antes — fornece `reportei_project_id` e `nome_reportei` de cada cliente automaticamente.

**Também necessário antes de implementar:** Confirmação de qual gestor cuida de cada bloco.

**Decisão:** APROVADO — aguardando confirmação de gestor por bloco antes de implementar
**Motivo da decisão:** Lista atual com 28 clientes está desatualizada. YAML precisa refletir os ~90 ativos reais.

---

#### D2 — Cross-reference automático: Reportei × Planilha → MANUAL_MAP

**Status:** ✅ APROVADO

**O que é:**
Tarefa de coleta de dados (não modifica código). Executa via MCP antes de qualquer implementação de D1 ou C3.

**Como funciona:**
1. Consultar MCP Reportei → listar todos os projetos (`list_projects`) → extrair `{id, nome}`
2. Consultar Google Sheets → ler coluna A de uma aba existente → extrair lista de nomes
3. Fazer matching fuzzy entre os dois conjuntos
4. Gerar tabela: `nome_planilha | nome_reportei | project_id | confiança_match`
5. Matches com confiança < 80% são marcados para revisão manual
6. Resultado alimenta `nome_reportei` e `reportei_project_id` no `clientes.yaml`

**Agente executor:** @dev (Dex) usando MCP Reportei + MCP Google Sheets

**Output esperado:**
```
| Nome Planilha         | Nome Reportei       | Project ID | Confiança |
|-----------------------|---------------------|------------|-----------|
| IMCP                  | IMCP                | 688377     | 100%      |
| Dr. Leandro Gontijio  | Leandro Gontijo     | 627550     | 87%       |
| Dr Javier             | Javier Cucchiaro    | XXXXX      | 95%       |
| Dra. Taissa Recalde   | Taissa Recalde      | XXXXX      | 92%       |
...
```

**Decisão:** APROVADO — pré-requisito obrigatório para D1 e C3
**Motivo da decisão:** Sem o mapa, qualquer matching de nome em runtime gasta tokens e pode errar.

---

---

## Sessão 7 — 2026-06-07 (pós-entrega)

**Contexto:** Bug identificado após conclusão do plano original. Vinicius confirmou que a planilha Google Sheets é única e compartilhada para todos os gestores.

---

#### E1 — FASE 2 deve rodar para todos os gestores (bug)

**Status:** ✔️ CONCLUÍDO — commits b8ebc5a + ac6c489 — 2026-06-08

**Bug identificado:**
`tasks/rotina-semanal.md` contém a condição `vinicius in cliente.gestores` que pula a FASE 2 completamente para clientes de outros gestores. O pressuposto era que cada gestor teria sua própria planilha separada. Confirmado por Vinicius que a planilha é **única e compartilhada** — todos os 8 gestores e seus clientes vão para a mesma aba.

**Arquivos afetados:**
- `tasks/rotina-semanal.md` — remover condição que pula FASE 2 para não-Vinicius
- `SQUADS/gestor-trafego-stark/CLAUDE.md` — corrigir linha que diz "só Vinicius tem Sheets"

**Agentes responsáveis:**
- `CLAUDE.md` → **@architect (Aria)** — decisão de design do squad
- `rotina-semanal.md` → **@dev (Dex)** — implementação da task

**Decisão:** APROVADO
**Motivo:** A lógica atual está incorreta — ~80% dos clientes nunca têm dados preenchidos na planilha.

---

---

## Sessão 8 — 2026-06-08

**Contexto:** Continuação do E1. Identificado que `fetch-metrics.md` ainda filtrava só Vinicius. Adicionado modo batch por gestor.

---

#### F1 — fetch-metrics incompleto (E1 parcial)

**Status:** ✔️ CONCLUÍDO (commit b8ebc5a — 2026-06-08)

**Bug identificado:**
O E1 da sessão anterior corrigiu `rotina-semanal.md` (removeu skip de FASE 2 para não-Vinicius), mas `fetch-metrics.md` — a task que FASE 2 chama internamente — ainda filtrava `vinicius in gestores AND ativo: true`. Todos os clientes de Gustavo, Thiago, Wallison, etc. continuavam sendo ignorados na coleta de métricas.

**Arquivos afetados:**
- `tasks/fetch-metrics.md` — input e Passo 3
- `data/clientes.yaml` — comentário de cabeçalho

**O que mudou:**
- Input `clientes_vinicius` → `clientes_ativos`
- Passo 3: `vinicius in gestores AND ativo: true` → `ativo: true`
- Descrição: "bloco Vinicius" → "todos os clientes ativos"
- `clientes.yaml` comentário: "apenas clientes Vinicius" → "todos os clientes com planilha ativa"

**Decisão:** APROVADO
**Motivo:** Complemento obrigatório do E1 — sem isso, o fix anterior era ineficaz.

---

#### F2 — Modo batch por gestor no rotina-semanal

**Status:** ✔️ CONCLUÍDO (commit ac6c489 — 2026-06-08)

**Feature adicionada:**
`*rotina-semanal [nome-do-gestor]` passa a funcionar como **modo batch** — o squad detecta automaticamente que o input é um nome de gestor (vinicius, gustavo, thiago, wallison, andreyves, richard, luiz, mateus), filtra todos os clientes daquele gestor com `ativo: true`, exibe a lista para confirmação e roda o pipeline completo em lotes de 3.

**Contexto:**
`clientes.yaml` já tinha todos os clientes mapeados por gestor (`gestores: [thiago]`, etc.). Faltava apenas ensinar o `rotina-semanal.md` a reconhecer o gestor como entrada válida.

**Arquivos afetados:**
- `tasks/rotina-semanal.md` — PRÉ-EXECUÇÃO: novo Modo 1 (batch) + Modo 2 (individual)

**Comportamento:**
- `*rotina-semanal thiago` → lista 14 clientes do Thiago → confirmação → lotes de 3
- `*rotina-semanal wallison` → lista 9 clientes do Wallison → confirmação → lotes de 3
- `*rotina-semanal Dr. George` → modo individual (comportamento anterior preservado)

**Decisão:** APROVADO
**Motivo:** Dados já estavam mapeados no clientes.yaml. Melhoria natural do E1.

---

## Histórico de Checkpoints

| CP | Data | Sessão | O que foi feito | Próximo passo |
|----|------|--------|-----------------|---------------|
| CP-01 | 2026-06-06 | Sessão 1 | Diagnóstico inicial. 5 melhorias (A1–A3, B1–B2) identificadas. | Aprovar/reprovar itens. |
| CP-02 | 2026-06-06 | Sessão 1 | 2 bugs de período (A0-a, A0-b). 3 hooks (H1, H2, H3). Conceito de hooks determinísticos confirmado. | Aprovar/reprovar novos itens. |
| CP-03 | 2026-06-06 | Sessão 1 | Comparação fill_sheets stark vs. relatorio-semanal (C4). Melhorias do relatorio-semanal (C1, C2, C3). Lista de ~90 clientes ativos recebida (D1). Cross-reference Reportei×Planilha planejado (D2). Fim da Sessão 1 — continuar na Sessão 2. | Sessão 2: Vinicius confirma gestor por bloco (D1) + aprova/reprova todos os 14 itens. |
| CP-04 | 2026-06-06 | Sessão 2 | Todos os 16 itens aprovados. A1 refinada: isolamento por --gestor/--clientes, duplicar aba anterior. Plano detalhado por sessão definido (PRÉ + Sessões 1–6). | Executar PRÉ-SESSÃO (/update-config para hooks H1+H2+H3) e depois Sessão 1 (@dev para D2). Vinicius confirma gestor por bloco antes da Sessão 5. |
| CP-05 | 2026-06-06 | Execução | Sessões 2, 3 e 4 concluídas. A0-a/A0-b, A1/A2/A3/C4, C1/C2 implementados e pushados. | Sessão 5: D1 + C3 no clientes.yaml. |
| CP-06 | 2026-06-07 | Execução | Sessão 5 concluída: clientes.yaml expandido (~70 novos clientes, 8 gestores, nome_reportei em 34 entradas). Commit c742250. | Sessão 6: B2 + B1 + PR + SYNC FINAL. |
| CP-07 | 2026-06-07 | Execução | Sessão 6 em andamento. B2 implementado com escopo expandido (ver decisão B2 acima). Descoberta: Reportei entrega CPM/CTR/freq quando integração Meta Ads ativa. Lógica corrigida para 3 fontes. CLAUDE.md atualizado. Aguardando commit @dev. | @dev commitar B2 → B1 → @devops PR + merge → SYNC FINAL. |
| CP-08 | 2026-06-07 | CONCLUÍDO | Plano encerrado. B2 (commit 0d1921e) e B1 (commit ae52bbc) entregues. PR #2 aberto e mergeado em gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego. SYNC FINAL executado. Todas as 16 melhorias aprovadas implementadas. | — Plano encerrado. |
| CP-09 | 2026-06-07 | Pós-entrega | Bug E1 identificado: planilha é única para todos os gestores — FASE 2 está pulando ~80% dos clientes. Registrado como Sessão 7. | Sessão 7: @architect corrige CLAUDE.md + @dev corrige rotina-semanal.md. |
| CP-10 | 2026-06-08 | Sessão 8 | E1 completado: fetch-metrics.md corrigido (F1, commit b8ebc5a). Modo batch por gestor adicionado ao rotina-semanal (F2, commit ac6c489). Push para repo Gustavo (commit 34a923d). Docs atualizados. | — Nenhum item pendente. |
