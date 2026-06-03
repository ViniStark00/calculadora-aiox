# Clientes — Gestor Tráfego IA

Carteira ativa: 12 clientes, nicho saúde/medicina.

> **Configuração:** `reportei_project_id` e `clickup_status_list_id` pré-carregados para todos os clientes.
> `clickup_task_id` mapeado em 03/06/2026 via rotina semanal. Todos os clientes com task mapeada.
> Pendente: preencher `meta_cpl` para clientes sem meta definida.

---

## Lista de clientes

```yaml
clientes:
  - nome: "Dr. Fernando Bezerra"
    slug: "dr-fernando-bezerra"
    especialidade: saude_geral
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 696403
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5pub"
    prioridade: 1
    nota: "PRIORIDADE — baixo volume de leads"

  - nome: "Dr. Diego Alencar"
    slug: "dr-diego-alencar"
    especialidade: oncologia
    meta_cpl: 80
    reportei_project_id: 1064037
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5prn"
    prioridade: 2
    nota: "CPL crítico — histórico de alertas"

  - nome: "Dr. Marcelo Bezerra"
    slug: "dr-marcelo-bezerra"
    especialidade: cirurgia_plastica
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 610559
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5pu7"
    prioridade: 3
    nota: "Baixo volume de agendamentos — atenção"

  - nome: "Dr. Higner Forastieri"
    slug: "dr-higner-forastieri"
    especialidade: tricologia
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 1097249
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5pqy"
    prioridade: 4
    nota: "Baixo agendamento, CPM alto"

  - nome: "Dra. Mariângela Santiago"
    slug: "dra-mariangela-santiago"
    especialidade: medicina_estetica
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 1097223
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5prg"
    prioridade: 5
    nota: "Ausência de conteúdo orgânico"

  - nome: "Dr. Caio Fernandes"
    slug: "dr-caio-fernandes"
    especialidade: saude_geral
    meta_cpl: 55
    reportei_project_id: 1170455
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5pqv"
    prioridade: 6
    nota: "Alto alcance — monitorar follows"

  - nome: "Dr. Laureano Filho"
    slug: "dr-laureano-filho"
    especialidade: saude_geral
    meta_cpl: null
    reportei_project_id: 982754
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5p22"
    prioridade: 7
    nota: "EXCLUÍDO do monitoramento Meta Ads — toda análise considera apenas Google Ads"

  - nome: "Dra. Nicolli"
    slug: "dra-nicolli"
    especialidade: medicina_estetica
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 642925
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5ptc"
    prioridade: 8
    nota: "Boa conversão — monitorar frequência"

  - nome: "Fernanda Encinas"
    slug: "fernanda-encinas"
    especialidade: medicina_estetica
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 913731
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5pt5"
    prioridade: 9
    nota: "Alto volume de conversas"

  - nome: "Graciela Machado"
    slug: "graciela-machado"
    especialidade: medicina_estetica
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 672682
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5pu1"
    prioridade: 10
    nota: "Bom momento comercial"

  - nome: "Dra. Érica Marchiori"
    slug: "dra-erica-marchiori"
    especialidade: dermatologia
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 1025271
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5prp"
    prioridade: 11
    nota: "Bom momento de fechamento"

  - nome: "Dra. Luana Girondi"
    slug: "dra-luana-girondi"
    especialidade: cirurgia_plastica
    meta_cpl: null # TODO: definir meta de CPL
    reportei_project_id: 989108
    clickup_status_list_id: "901300668557"
    clickup_task_id: "86ahu5prw"
    prioridade: 12
    nota: ""

excluidos:
  - nome: "Dr. Fernando Mattioli - FACE"
    reportei_project_id: 772702
    motivo: "Permanentemente excluído da carteira"
```

---

## Mapeamento slug → nome

| Slug | Nome completo |
|---|---|
| dr-fernando-bezerra | Dr. Fernando Bezerra |
| dr-diego-alencar | Dr. Diego Alencar |
| dr-marcelo-bezerra | Dr. Marcelo Bezerra |
| dr-higner-forastieri | Dr. Higner Forastieri |
| dra-mariangela-santiago | Dra. Mariângela Santiago |
| dr-caio-fernandes | Dr. Caio Fernandes |
| dr-laureano-filho | Dr. Laureano Filho |
| dra-nicolli | Dra. Nicolli |
| fernanda-encinas | Fernanda Encinas |
| graciela-machado | Graciela Machado |
| dra-erica-marchiori | Dra. Érica Marchiori |
| dra-luana-girondi | Dra. Luana Girondi |

---

## TODOs de configuração

1. Preencher `meta_cpl` para cada cliente sem meta definida (CPL meta em R$)
