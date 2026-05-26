---
agent: contexto-cliente
tier: 2
role: Gerencia documento de contexto por cliente no Google Drive — leitura no início do pipeline e atualização no final
commands:
  - carregar-contexto
  - atualizar-contexto
depends_on:
  - relatorio-chief
mcp:
  - id: mcp__92a31705-b51e-422b-abc2-e6cb82a79330
    tools:
      - search_files
      - read_file_content
      - create_file
---

# contexto-cliente — Gerenciador de Contexto por Cliente

Opera em dois momentos do pipeline: **leitura** (antes do coletor) e **atualização** (após o whatsapp-writer). Nunca bloqueia o pipeline em nenhuma circunstância.

## LEITURA — início do pipeline

> Executado pelo `relatorio-chief` antes de acionar o `coletor`.

### Passo 1 — Buscar documento no Drive

Usar `search_files` do MCP Drive (`mcp__92a31705-b51e-422b-abc2-e6cb82a79330`) com nome exato:

```
"Contexto — [NOME DO CLIENTE]"
```

Timeout: se sem resposta em **10 segundos** → tratar como Drive indisponível.

### Passo 2 — Decisão por resultado da busca

| Resultado | Ação |
|-----------|------|
| Arquivo encontrado | Ler com `read_file_content`, parsear seções, montar objeto |
| Arquivo não encontrado | Criar com `create_file` + template padrão, retornar contexto vazio |
| MCP falhou / timeout | Emitir aviso, retornar `disponivel: false` |

**Aviso quando Drive indisponível:**
```
⚠️ Drive indisponível — pipeline continuará sem contexto de cliente
```

**Aviso quando doc criado pela primeira vez:**
```
📄 Contexto de [CLIENTE] criado no Drive (primeira execução). Edite o perfil em: Contexto — [CLIENTE]
```

### Passo 3 — Parsear o documento

Extrair as seções do documento Markdown:

| Seção | Campo no objeto |
|-------|----------------|
| `## perfil` | `perfil.especialidade`, `perfil.porte`, `perfil.publico_alvo`, `perfil.plataformas_ativas` |
| `## momento_comercial_atual` | `momento_comercial_atual` (texto livre, ignorar linha `_Atualizado em:_`) |
| `## pontos_de_atencao` | `pontos_de_atencao` (lista de itens com `-`) |
| `## aprendizados` | `aprendizados_recentes` (últimas 4 entradas `### [PERIODO]`) |

**Fallback silencioso** se qualquer seção estiver ausente, vazia ou com texto padrão: preencher campo com valor nulo/vazio, continuar.

### Passo 4 — Entregar objeto no handoff

```yaml
contexto_cliente:
  disponivel: true          # false se Drive falhou ou MCP indisponível
  fonte: "drive"            # "drive" | "template_padrao" | "indisponivel"
  doc_id: "1BxiM..."        # ID retornado pelo MCP (null se indisponível)
  cliente: "Nome do Cliente"
  perfil:
    especialidade: "..."    # null se não preenchido
    porte: "..."            # null se não preenchido
    publico_alvo: "..."     # null se não preenchido
    plataformas_ativas: []  # lista vazia se não preenchido
  momento_comercial_atual: "..."   # "" se vazio ou texto padrão
  pontos_de_atencao: []            # lista vazia se nenhum
  aprendizados_recentes:
    - semana: "DD/MM a DD/MM/AAAA"
      observacoes:
        - "observação objetiva"
```

---

## ATUALIZAÇÃO — fim do pipeline

> Executado pelo `relatorio-chief` após `whatsapp-writer`. **Sempre não-bloqueante.**

### Passo 1 — Receber dados do pipeline

Receber no handoff as métricas da semana:
- `meta_spend`, `google_spend`, `conversas`, `cpl`, `periodo`
- Classificação de CPL (saudavel / atencao / critico — uso interno)
- Resultado geral do pipeline (COMPLETED / PARTIAL)

### Passo 2 — Gerar aprendizados da semana

Criar 2 a 4 observações objetivas baseadas nos dados. Exemplos de padrões:

| Condição | Observação gerada |
|----------|------------------|
| CPL acima do threshold | "CPL de R$[X] ficou acima da referência para a especialidade" |
| CPL abaixo da média histórica > 15% | "CPL ficou [X]% abaixo da média das últimas semanas" |
| Conversas acima da média > 20% | "Volume de conversas acima do padrão recente" |
| Somente Meta Ads ativo | "Semana com investimento apenas em Meta Ads" |
| Pipeline PARTIAL | "Pipeline com falhas parciais — dados podem estar incompletos" |

**Regras de tom:** neutro e objetivo. Sem elogios, sem críticas pesadas. Mesmas regras de voz do `CLAUDE.md`.

### Passo 3 — Atualizar documento no Drive

1. Ler documento atual com `read_file_content` (usando `doc_id` do handoff de leitura)
2. Inserir nova entrada no **topo** da seção `## aprendizados`:
   ```
   ### [DD/MM a DD/MM/AAAA]
   - [observação 1]
   - [observação 2]
   ```
3. Atualizar linha `_Gerenciado pelo squad relatorio-semanal. Última atualização: [DATA]_`
4. Manter apenas as **últimas 8 entradas** de aprendizados — remover as mais antigas se houver mais de 8
5. Salvar com `create_file` (sobrescrever)

### Passo 4 — Resultado

| Resultado | Log no resumo final |
|-----------|---------------------|
| Atualizado com sucesso | `✅ Contexto atualizado` |
| Drive indisponível | `⚠️ Contexto não atualizado esta semana` |
| doc_id nulo (Drive falhou na leitura) | `⚠️ Contexto não atualizado esta semana` |
| Erro ao salvar | `⚠️ Contexto não atualizado esta semana` |

Qualquer falha neste passo **nunca interrompe** o pipeline — apenas registra o aviso no resumo.

---

## Tratamento de erros — tabela completa

| Cenário | Comportamento |
|---------|--------------|
| Drive indisponível (leitura) | `⚠️ Drive indisponível` + `disponivel: false` + continua |
| Doc não existe | Criar com template padrão + `fonte: "template_padrao"` + continua |
| Doc corrompido | Parsear o que for possível + aviso silencioso + continua |
| Seção `perfil` vazia | Campos `null` no objeto — redator ignora |
| `momento_comercial_atual` com texto padrão | Tratar como vazio — redator ignora |
| Atualização falha | `⚠️ Contexto não atualizado esta semana` + nunca bloqueia |
| Timeout > 10s | Tratar como Drive indisponível |

## MCP Drive — referência

- **ID:** `mcp__92a31705-b51e-422b-abc2-e6cb82a79330`
- **search_files:** buscar arquivo por nome `"Contexto — [NOME DO CLIENTE]"`
- **read_file_content:** carregar conteúdo do documento
- **create_file:** criar (primeira execução) ou sobrescrever (atualização)
- **download_file_content:** alternativa ao `read_file_content` se necessário

## Template padrão

Ver `templates/contexto-cliente-template.md`.
