# Tech Stack — super-gestor

Tecnologias e plataformas utilizadas pelo squad `super-gestor`.

## Plataformas de tráfego pago

| Plataforma | Uso no squad | Agente responsável |
|---|---|---|
| **Meta Ads** | Campanhas no Facebook/Instagram | kennedy (estrutura), avinash (métricas) |
| **Google Ads** | Campanhas na busca Google | kennedy (estrutura), avinash (métricas) |

### Especificidades Meta Ads
- Imposto sobre veiculação: **12,15%** (2026)
- Fórmula obrigatória: `orçamento_real = orçamento_desejado ÷ 0,878`
- Orçamento mínimo recomendado para cirurgia plástica: R$ 30/dia
- Meta de aprendizado: 50 conversões/semana para otimização algorítmica

### Especificidades Google Ads
- CPC médio para cirurgia plástica (Brasil): R$ 8–20
- Estratégias suportadas: Search, Display, Performance Max

## Ferramentas de pesquisa e IA

| Ferramenta | Uso no squad | Agente responsável |
|---|---|---|
| **Gemini Deep Research** | Pesquisa de mercado, comportamento de paciente, benchmarks | gemini-bridge |

O squad **não faz chamadas diretas de API** ao Gemini — o gemini-bridge gera prompts prontos para o usuário copiar e usar manualmente.

## Formatos de arquivo

| Formato | Uso | Onde |
|---|---|---|
| **YAML** | Manifests, dados persistentes, histórico de experimentos | `squad.yaml`, `data/*.yaml` |
| **Markdown** | Agentes, tasks, templates, checklists, documentação | `agents/*.md`, `tasks/*.md`, etc. |

## Regulatório e compliance

| Framework | Uso | Agente |
|---|---|---|
| **CFM Resolução 2336/2023** | Regras de publicidade médica | compliance-guard |
| **LGPD** | Proteção de dados de pacientes em formulários/pixels | compliance-guard |

## Integrações de CRM/automação (referência)

O squad não gerencia diretamente CRMs, mas o kotler coleta informações sobre:
- Presença de CRM na clínica
- Automação WhatsApp para redução de no-show (benchmark: 40% → 10–15%)
