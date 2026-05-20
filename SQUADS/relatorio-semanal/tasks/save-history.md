---
task: save-history
tier: 1
triggered_by: coletor
blocking: false
---

# save-history — Salvar Histórico de Métricas por Cliente

Persiste as métricas de uma semana no arquivo `data/historico-clientes.yaml`. Task **não-bloqueante**: qualquer falha emite aviso e o pipeline continua normalmente.

## Inputs esperados

| Campo | Tipo | Origem |
|-------|------|--------|
| `cliente_slug` | string | nome do cliente convertido para lowercase-hífens |
| `periodo_inicio` | string `YYYY-MM-DD` | calculado pelo coletor |
| `periodo_fim` | string `YYYY-MM-DD` | calculado pelo coletor |
| `meta_spend` | float | coluna C da planilha |
| `google_spend` | float | coluna E da planilha |
| `seguidores` | int | coluna H |
| `conversas` | int | coluna K |
| `conversoes` | int | coluna O |
| `cpl` | float | meta_spend / conversas (0 se conversas = 0) |

## Geração do slug

Converter o nome do cliente para slug antes de salvar:

| Nome original | Slug gerado |
|---------------|-------------|
| `IMCP` | `imcp` |
| `Dra Danielle Gondim` | `dra-danielle-gondim` |
| `Dr. Leandro Gontijio` | `dr-leandro-gontijio` |
| `Dr. Guilherme Mattar` | `dr-guilherme-mattar` |
| `DESTRA Desenvolvimentos` | `destra-desenvolvimentos` |

**Regra:** lowercase + substituir espaços/pontos/caracteres especiais por hífen + remover hífens duplicados.

## Fluxo de execução

```
1. Carregar data/historico-clientes.yaml (criar se não existir)
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
    - periodo_inicio: "2026-05-11"
      periodo_fim: "2026-05-17"
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
| Erro de escrita (permissão/disco) | Log warning + continuar pipeline sem bloquear |
| `conversas = 0` | `cpl = 0.0` — sem divisão por zero |
| Limite de 52 entradas atingido | Remover a entrada mais antiga (índice -1) |

## Comportamento de falha (NUNCA BLOQUEIA)

```
⚠️ [save-history] Falha ao salvar histórico de [slug]: [motivo]
   Pipeline continuando normalmente. Histórico desta semana não será persistido.
```

O agente `coletor` não deve verificar o retorno desta task — ela emite o aviso e segue.
