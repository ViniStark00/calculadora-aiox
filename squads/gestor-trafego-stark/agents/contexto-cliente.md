---
agent: contexto-cliente
tier: 1
squad: gestor-trafego-stark
role: Gerencia documento de contexto por cliente no Google Drive — leitura no início e atualização no final do pipeline
commands:
  - carregar-contexto
  - atualizar-contexto
depends_on:
  - stark-chief
mcp:
  - id: mcp__92a31705-b51e-422b-abc2-e6cb82a79330
    tools:
      - search_files
      - read_file_content
      - create_file
      - download_file_content
---

# contexto-cliente — Gerenciador de Contexto por Cliente

Opera em dois momentos do pipeline: **leitura** (não-bloqueante, antes do redator) e **atualização** (não-bloqueante, na FASE 6). Nunca bloqueia o pipeline em nenhuma circunstância.

## LEITURA — início do pipeline (FASE 3)

### Passo 1 — Buscar documento no Drive

Usar `search_files` do MCP Drive (`mcp__92a31705-b51e-422b-abc2-e6cb82a79330`) com nome:

```
"Contexto - {nome_cliente}"
```

Pasta: `"Contexto Clientes - Stark"` no Google Drive.
Timeout: se sem resposta em 10 segundos → tratar como Drive indisponível.

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
📄 Contexto de [CLIENTE] criado no Drive (primeira execução). Edite o perfil em: Contexto - [CLIENTE]
```

### Passo 3 — Parsear o documento

| Seção | Campo no objeto |
|-------|----------------|
| `## perfil` | `perfil.especialidade`, `perfil.porte`, `perfil.publico_alvo`, `perfil.plataformas_ativas` |
| `## momento_comercial_atual` | `momento_comercial_atual` |
| `## pontos_de_atencao` | `pontos_de_atencao` (lista de itens com `-`) |
| `## aprendizados` | `aprendizados_recentes` (últimas 4 entradas `### [PERIODO]`) |

Fallback silencioso se qualquer seção estiver ausente, vazia ou com texto padrão.

### Passo 4 — Entregar objeto no handoff

```yaml
contexto_cliente:
  disponivel: true          # false se Drive falhou ou MCP indisponível
  fonte: "drive"            # "drive" | "template_padrao" | "indisponivel"
  doc_id: "1BxiM..."        # ID retornado pelo MCP (null se indisponível)
  cliente: "Nome do Cliente"
  perfil:
    especialidade: "..."    # null se não preenchido
    porte: "..."
    publico_alvo: "..."
    plataformas_ativas: []
  momento_comercial_atual: "..."   # "" se vazio ou texto padrão
  pontos_de_atencao: []
  aprendizados_recentes:
    - semana: "DD/MM a DD/MM/AAAA"
      observacoes:
        - "observação objetiva"
```

---

## ATUALIZAÇÃO — fim do pipeline (FASE 6, não-bloqueante)

### Passo 1 — Receber dados do pipeline

- `meta_spend`, `google_spend`, `conversas`, `cpl`, `periodo`
- Resultado geral do pipeline (COMPLETED / PARTIAL)

### Passo 2 — Gerar aprendizados da semana

Criar 2 a 4 observações objetivas baseadas nos dados:

| Condição | Observação gerada |
|----------|------------------|
| CPL acima do threshold | "CPL de R$[X] ficou acima da referência para a especialidade" |
| CPL abaixo da média histórica > 15% | "CPL ficou [X]% abaixo da média das últimas semanas" |
| Conversas acima da média > 20% | "Volume de conversas acima do padrão recente" |
| Somente Meta Ads ativo | "Semana com investimento apenas em Meta Ads" |
| Pipeline PARTIAL | "Pipeline com falhas parciais — dados podem estar incompletos" |

Tom: neutro e objetivo. Sem elogios, sem críticas pesadas. Mesmas regras de voz do `CLAUDE.md`.

### Passo 3 — Atualizar documento no Drive

1. Ler documento atual com `read_file_content` (usando `doc_id` do handoff de leitura)
2. Inserir nova entrada no topo da seção `## aprendizados`:
   ```
   ### [DD/MM a DD/MM/AAAA]
   - [observação 1]
   - [observação 2]
   ```
3. Atualizar linha `_Gerenciado pelo squad gestor-trafego-stark. Última atualização: [DATA]_`
4. Manter apenas as últimas 8 entradas — remover as mais antigas se houver mais de 8
5. Salvar com `create_file` (sobrescrever)

### Passo 4 — Resultado no resumo final

| Resultado | Log |
|-----------|-----|
| Atualizado com sucesso | `✅ Contexto atualizado` |
| Drive indisponível | `⚠️ Contexto não atualizado esta semana` |
| doc_id nulo | `⚠️ Contexto não atualizado esta semana` |
| Erro ao salvar | `⚠️ Contexto não atualizado esta semana` |

Qualquer falha neste passo **nunca interrompe** o pipeline — apenas registra o aviso.

---

## Tratamento de erros

| Cenário | Comportamento |
|---------|--------------|
| Drive indisponível (leitura) | `⚠️ Drive indisponível` + `disponivel: false` + continua |
| Doc não existe | Criar com template padrão + `fonte: "template_padrao"` + continua |
| Doc corrompido | Parsear o que for possível + aviso silencioso + continua |
| Seção `perfil` vazia | Campos `null` no objeto — redator ignora |
| `momento_comercial_atual` com texto padrão | Tratar como vazio — redator ignora |
| Atualização falha | `⚠️ Contexto não atualizado esta semana` + nunca bloqueia |
| Timeout > 10s | Tratar como Drive indisponível |

## Template padrão

Ver `templates/contexto-cliente-template.md`.
