---
task: descobrir-ids-reportei
agent: stark-chief
squad: gestor-trafego-stark
elicit: true
inputs:
  - clientes_yaml: squads/gestor-trafego-stark/data/clientes.yaml (todos os clientes com reportei_project_id: null)
  - reportei_token: variável de ambiente REPORTEI_TOKEN
outputs:
  - clientes_yaml_atualizado: IDs confirmados gravados em data/clientes.yaml
  - resumo: tabela de matches + contagem de preenchidos / não encontrados
---

# Task: descobrir-ids-reportei — Descoberta e Vinculação de IDs Reportei

**Uso:** `*descobrir-ids-reportei` — executa uma vez para preencher `reportei_project_id` em clientes que ainda estão com `null`.

> **One-time operation:** Após executar e confirmar, os IDs ficam gravados no YAML. Runs futuros leem diretamente — nunca re-executar para os mesmos clientes, a menos que o projeto Reportei mude.

---

## Pré-condições

- Variável de ambiente `REPORTEI_TOKEN` configurada
- `data/clientes.yaml` acessível
- Reportei MCP disponível (`list_projects`)

---

## Passo 1 — Listar todos os projetos no Reportei

Chamar o Reportei MCP:

```
list_projects()
```

Retorno esperado: lista de objetos `{ id, name, ... }`.

Se a chamada falhar (401/503):
- 401 → STOP: "Token Reportei expirado. Atualizar REPORTEI_TOKEN."
- outro erro → STOP: exibir mensagem de erro + código HTTP.

---

## Passo 2 — Filtrar clientes sem ID

Ler `data/clientes.yaml` e filtrar:

```
clientes_sem_id = [c for c in clientes if c.reportei_project_id is null AND c.ativo == true]
```

Se `clientes_sem_id` estiver vazio:
```
✅ Todos os clientes ativos já possuem reportei_project_id. Nenhuma ação necessária.
```
→ STOP (sucesso, sem alterações).

---

## Passo 3 — Fuzzy match por nome

Para cada cliente em `clientes_sem_id`, procurar correspondência na lista do Reportei:

**Algoritmo de score:**
1. Normalizar ambos os nomes: minúsculas, sem acentos, sem pontuação
2. Calcular similaridade (ratio de sequência — Levenshtein ou token_sort_ratio)
3. Registrar o projeto com maior score

**Limiares:**
- `score >= 0.80` → match automático (confiança alta)
- `0.70 <= score < 0.80` → match com confirmação obrigatória
- `score < 0.70` → não encontrado (ação manual)

---

## Passo 4 — Exibir tabela de matches (elicit: true)

Exibir a tabela abaixo e aguardar confirmação do gestor **antes de gravar qualquer dado**:

```
📋 Matches encontrados — confirme antes de salvar:

| # | Cliente (YAML)            | Projeto Reportei            | ID       | Confiança | Ação         |
|---|---------------------------|-----------------------------|----------|-----------|--------------|
| 1 | Dr. Fernando Bezerra      | Dr. Fernando Bezerra        | 696403   | 100%      | ✅ Auto       |
| 2 | Dr. Diego Alencar         | Diego Alencar Med           | 1064037  | 82%       | ✅ Auto       |
| 3 | Clínica Estética Bem Viver| Bem Viver Estética          | 998271   | 74%       | ⚠️ Confirmar  |
| 4 | Dra. Patrícia Mendes      | —                           | —        | <70%      | ❌ Não encontrado |

Clientes não encontrados (ação manual):
  - Dra. Patrícia Mendes → buscar ID manualmente no painel Reportei e adicionar ao clientes.yaml

Digite:
  - CONFIRMAR → salvar todos os matches com ✅ (auto e confirmados)
  - REJEITAR {#} → excluir linha específica antes de salvar  (ex: REJEITAR 3)
  - CANCELAR → abortar sem salvar nada
```

> **Regra de confirmação:** Itens com `⚠️ Confirmar` (0.70–0.79) NÃO são salvos sem resposta explícita do gestor. Se o gestor digitar `CONFIRMAR`, todos os `⚠️` são aceitos. Se quiser rejeitar individualmente, usar `REJEITAR {#}` antes de `CONFIRMAR`.

---

## Passo 5 — Processar resposta do gestor

**CONFIRMAR:**
- Incluir todos os itens `✅ Auto` e `⚠️ Confirmar` não rejeitados
- Prosseguir para Passo 6

**REJEITAR {#}:**
- Remover o item da lista de aprovados
- Perguntar: "Item {#} removido. Digite CONFIRMAR para salvar os restantes ou CANCELAR para abortar."

**CANCELAR:**
```
❌ Operação cancelada. Nenhum dado foi alterado em clientes.yaml.
```
→ STOP.

---

## Passo 6 — Gravar IDs em clientes.yaml

Para cada cliente aprovado, localizar a entrada no YAML pelo `slug` e atualizar `reportei_project_id`:

```yaml
# Antes:
- nome: "Dr. Fernando Bezerra"
  slug: "dr-fernando-bezerra"
  reportei_project_id: null

# Depois:
- nome: "Dr. Fernando Bezerra"
  slug: "dr-fernando-bezerra"
  reportei_project_id: 696403
```

**Regras de escrita:**
- Atualizar APENAS o campo `reportei_project_id` — não alterar nenhum outro campo
- Preservar âncoras YAML (`*sheet_cols`) e comentários existentes
- Um cliente por vez; não fazer writes em batch que possam corromper o YAML

---

## Passo 7 — Exibir resumo final

```
✅ Descoberta concluída:

  IDs preenchidos: {N}
  Não encontrados: {M} (ação manual necessária)

Clientes atualizados:
  - Dr. Fernando Bezerra → 696403
  - Dr. Diego Alencar → 1064037

Clientes sem match (adicionar manualmente ao clientes.yaml):
  - Dra. Patrícia Mendes → buscar em app.reportei.com.br
```

---

## Tratamento de erros

| Situação | Ação |
|----------|------|
| Token expirado (401) | STOP — "Atualizar REPORTEI_TOKEN" |
| Outro erro HTTP (500, 503) | STOP — exibir mensagem + código HTTP |
| list_projects retorna vazio | STOP — "Nenhum projeto retornado pelo Reportei. Verificar token." |
| YAML malformado após escrita | STOP — exibir diff do erro; não continuar |
| Score empate entre dois projetos | Exibir ambos como `⚠️ Confirmar` com opção de escolha manual |
