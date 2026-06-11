---
task: onboarding-gestor
agent: onboarding-manager
squad: gestor-trafego-stark
elicit: true
inputs:
  - gestor_nome: nome do gestor em lowercase (ex: breno, roberta)
  - clientes: lista de nomes dos clientes da carteira
outputs:
  - clientes_cadastrados: lista de slugs gravados em clientes.yaml
  - docs_drive: lista de IDs dos documentos criados no Drive
---

# Task: onboarding-gestor — Cadastro de Novo Gestor

**Acionada por:** `@stark-chief *onboarding gestor=[nome]`

## Pré-condições

- MCP Reportei disponível (para busca automática de IDs)
- MCP Google Drive disponível (para criação de documentos de contexto)
- `data/clientes.yaml` acessível para leitura e escrita
- `templates/contexto-cliente-template.md` disponível

## Fluxo de execução

### Passo 1 — Identificação do gestor

Perguntar nome do gestor (lowercase, sem acento) e lista de clientes da carteira.
Registrar internamente antes de prosseguir.

### Passo 2 — Coleta por cliente (loop)

Para cada cliente da lista, executar em ordem:

1. Coletar nome oficial e gerar slug (confirmar com gestor)
2. Apresentar lista de especialidades válidas — aguardar escolha
3. Buscar `reportei_project_id` automaticamente via `list_projects` do MCP Reportei
   - Match encontrado → apresentar para confirmação
   - Match não encontrado → solicitar ID manualmente com instrução da URL
4. Perguntar se tem Meta Ads ativo → se sim, solicitar `meta_ad_account_id`
5. Solicitar `clickup_status_list_id` com instrução de como encontrar no ClickUp
6. Solicitar `nome_whatsapp`, `meta_cpl` (opcional), `nota` (opcional)
7. Apresentar bloco de confirmação completo — só prosseguir com "sim" explícito
8. Gravar em `data/clientes.yaml`
9. Criar documento de contexto no Drive

### Passo 3 — Próximo cliente

Após gravar, perguntar: "Próximo cliente?" — continuar loop até lista esgotada.

### Passo 4 — Resumo final

Exibir tabela de todos os clientes cadastrados com status de cada etapa.
Listar clientes com campos opcionais ausentes (meta_cpl, nota) para atenção posterior.
Sugerir primeiro teste: `*rotina-semanal [primeiro cliente cadastrado]`

## Restrições

- **Nunca gravar sem confirmação** — bloco de confirmação é obrigatório por cliente
- **Nunca inventar dados** — perguntar sempre que informação não foi fornecida
- **Slug único** — verificar colisão em clientes.yaml antes de gravar
- **Drive** — nome do arquivo DEVE seguir padrão "Contexto - [nome do cliente]"
- **Pasta Drive** — DEVE ser "Contexto Clientes - Stark" — não criar em outro local
