# Template de Mensagem WhatsApp
> Mensagem de convite amigável com link para o relatório completo.
> ⚠️ NÃO usar HTML aqui — WhatsApp renderiza negrito como *asterisco* ao redor do texto.
> Campos entre colchetes são substituídos pelo `whatsapp-writer`.

---

## TEMPLATE ÚNICO (todos os clientes)

```
[SAUDACAO], [NOME_WHATSAPP]!

Segue o relatório de tráfego da semana *[DD/MM] a [DD/MM]*.

Para acessar, clique no link abaixo:
🔗 [LINK]
```

---

## Campos e Regras de Preenchimento

| Campo | Formato | Exemplo |
|-------|---------|---------|
| `[SAUDACAO]` | Determinado pelo horário local | `Boa tarde` |
| `[NOME_WHATSAPP]` | Campo `nome_whatsapp` do cliente em `clientes-config.yaml` | `Dra. Danielle` |
| `[DD/MM]` início | Data da segunda-feira do período | `11/05` |
| `[DD/MM]` fim | Data do domingo do período | `17/05` |
| `[LINK]` | URL do Reportei | `https://app.reportei.com/projects/839737` |

## Regra de Saudação por Horário

| Horário local | Saudação |
|--------------|---------|
| 00h – 11h59 | `Bom dia` |
| 12h – 17h59 | `Boa tarde` |
| 18h – 23h59 | `Boa noite` |

## Exemplo de Saída

```
Boa tarde, Dra. Danielle!

Segue o relatório de tráfego da semana *11/05 a 17/05*.

Para acessar, clique no link abaixo:
🔗 https://app.reportei.com/projects/839737
```
