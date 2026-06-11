# Configuração de Credenciais — gestor-trafego-stark

## O que já está configurado

| Variável | Status |
|----------|--------|
| `REPORTEI_TOKEN` | ✅ Em `squads/gestor-trafego-stark/.claude/settings.local.json` |
| `SHEET_ID` | ✅ Em `squads/gestor-trafego-stark/.claude/settings.local.json` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ⚠️ Você precisa configurar (veja abaixo) |

---

## Pré-requisitos — instale antes de começar

### 1. Python 3.10+
Baixe em [python.org/downloads](https://www.python.org/downloads/).
Durante a instalação, marque **"Add Python to PATH"**.

Verifique: `python --version`

### 2. Bibliotecas Python necessárias
```bash
pip install google-auth-httplib2 google-api-python-client pyyaml
```

### 3. Claude Code (Claude Desktop)
Baixe em [claude.ai/download](https://claude.ai/download).
Abra o Claude Code na pasta do repositório clonado.

---

## Configurar o Google Service Account

O `service_account.json` é a chave que permite ao script escrever na planilha Google Sheets.

### Passo a passo

**Parte 1 — Criar a conta de serviço no Google Cloud**

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto novo (ex: `stark-sheets`) ou use um existente
3. No menu lateral: **APIs e Serviços → Biblioteca**
4. Busque **Google Sheets API** e clique em **Ativar**
5. No menu lateral: **IAM e Admin → Contas de serviço**
6. Clique em **Criar conta de serviço**
7. Nome: `stark-sheets` → clique em **Criar e continuar** → **Concluído**
8. Clique na conta criada → aba **Chaves** → **Adicionar chave → Criar nova chave → JSON**
9. O arquivo `service_account.json` será baixado automaticamente

**Parte 2 — Colocar o arquivo no lugar certo**

Mova o arquivo baixado para:
```
treinamento-orquestradores-stark-gestoresdetrafego/
  squads/
    gestor-trafego-stark/
      service_account.json   ← aqui
```

**Parte 3 — Compartilhar a planilha com a conta de serviço**

1. Abra o `service_account.json` em qualquer editor de texto
2. Copie o valor do campo `client_email` (parece um e-mail: `stark-sheets@projeto.iam.gserviceaccount.com`)
3. Abra a planilha Google Sheets da Stark
4. Clique em **Compartilhar** (botão azul no canto superior direito)
5. Cole o e-mail copiado e dê permissão de **Editor**
6. Clique em **Enviar**

---

## Verificar se está tudo funcionando

```bash
python squads/gestor-trafego-stark/scripts/fill_sheets.py --dry-run --semana Junho
```

Se aparecer `[INFO] Aba: Junho` sem erros — está configurado corretamente.

---

## Resumo rápido (para quem já tem experiência)

```
1. pip install google-auth-httplib2 google-api-python-client pyyaml
2. Criar service account no Google Cloud Console
3. Ativar Google Sheets API no projeto
4. Baixar chave JSON → salvar em squads/gestor-trafego-stark/service_account.json
5. Compartilhar a planilha com o client_email do JSON (permissão Editor)
6. Pronto — REPORTEI_TOKEN e SHEET_ID já estão configurados no repo
```

---

> **Nunca commite** o `service_account.json` no git — ele já está no `.gitignore`.
