---
task: save-history
agent: coletor
squad: gestor-trafego-stark
blocking: false
triggered_by: coletor
phase: FASE 6 (não-bloqueante)
---

# Task: save-history — Salvar Histórico de Métricas por Cliente

**FASE 6 do pipeline (não-bloqueante):** persiste as métricas de uma semana em `data/historico-clientes.yaml`. Qualquer falha emite aviso e o pipeline continua normalmente.

## Inputs esperados

| Campo | Tipo | Origem |
|-------|------|--------|
| `cliente_slug` | string | slug do cliente em data/clientes.yaml |
| `periodo_inicio` | string `YYYY-MM-DD` | calculado pelo coletor |
| `periodo_fim` | string `YYYY-MM-DD` | calculado pelo coletor |
| `meta_spend` | float | coluna sheet_columns.meta_spend |
| `google_spend` | float | coluna sheet_columns.google_spend |
| `seguidores` | int | coluna sheet_columns.seguidores |
| `conversas` | int | coluna sheet_columns.conversas |
| `conversoes` | int | coluna sheet_columns.conversoes |
| `cpl` | float | meta_spend / conversas (0.0 se conversas = 0) |

## Geração do slug

| Nome original | Slug gerado |
|---------------|-------------|
| `IMCP` | `imcp` |
| `Dra Danielle Gondim` | `dra-danielle-gondim` |
| `Dr. Laureano Filho` | `dr-laureano-filho` |

**Regra:** lowercase + substituir espaços/pontos/caracteres especiais por hífen + remover hífens duplicados.

## Fluxo de execução

```
1. Carregar data/historico-clientes.yaml (criar com "clientes: {}" se não existir)
2. Se clientes[slug] não existe → inicializar lista vazia
3. VERIFICAR IDEMPOTÊNCIA:
   - Se já existe entrada com mesmo periodo_inicio E periodo_fim → SKIP silencioso
   - Log: "⏭ Histórico já registrado para [slug] — semana [inicio/fim]. Pulando."
4. Calcular total_spend = meta_spend + google_spend
5. Calcular cpl = meta_spend / conversas (se conversas > 0, senão 0.0)
6. Inserir nova entrada no início da lista (mais recente primeiro)
7. Limitar lista a 52 entradas (descartar as mais antigas se exceder)
8. Salvar data/historico-clientes.yaml
9. Log: "✅ Histórico salvo — [slug] | [inicio] → [fim]"
```

## Formato de entrada no YAML

```yaml
clientes:
  imcp:
    - periodo_inicio: "2026-05-18"
      periodo_fim: "2026-05-24"
      meta_spend: 2110.96
      google_spend: 0.00
      conversas: 91
      conversoes: 0
      seguidores: 1307
      cpl: 23.19
      total_spend: 2110.96
```

## Regras de robustez

| Situação | Comportamento |
|----------|---------------|
| Arquivo não existe | Criar automaticamente com `clientes: {}` |
| Arquivo corrompido | Log warning + reinicializar para o cliente afetado |
| Erro de escrita | Log warning + continuar pipeline sem bloquear |
| `conversas = 0` | `cpl = 0.0` — sem divisão por zero |
| Limite 52 entradas atingido | Remover entrada mais antiga (índice -1) |

## Comportamento de falha (NUNCA BLOQUEIA)

```
⚠️ [save-history] Falha ao salvar histórico de [slug]: [motivo]
   Pipeline continuando normalmente. Histórico desta semana não será persistido.
```
