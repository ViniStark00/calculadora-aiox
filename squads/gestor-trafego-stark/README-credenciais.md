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

> 💡 **Dica: deixe o Claude Code te guiar**
> Se tiver dúvida em qualquer etapa abaixo, abra o Claude Code neste repositório e cole:
> ```
> Me ajuda a configurar o service_account.json do Google Cloud para usar o squad gestor-trafego-stark.
> Já clonei o repositório e preciso: criar o projeto no Google Cloud, ativar a Google Sheets API,
> criar a conta de serviço, baixar o JSON e compartilhar a planilha.
> Me guia passo a passo.
> ```
> O Claude vai te conduzir por cada etapa interativamente, inclusive abrindo as telas certas.

---

### Passo a passo manual

**Parte 1 — Criar projeto e ativar a API**

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) e faça login com sua conta Google
2. Clique em **Selecionar projeto** (topo da página) → **Novo projeto**
3. Nome: `stark-sheets` → **Criar**
4. Com o projeto selecionado, vá em **APIs e Serviços → Biblioteca**
5. Busque `Google Sheets API` → clique nela → **Ativar**

**Parte 2 — Criar a conta de serviço e baixar a chave**

6. No menu lateral: **IAM e Admin → Contas de serviço**
7. Clique em **Criar conta de serviço**
8. Nome: `stark-sheets` → **Criar e continuar**
9. Em "Conceder a esta conta de serviço acesso ao projeto": pule clicando em **Continuar**
10. Clique em **Concluído**
11. Na lista, clique na conta criada → aba **Chaves**
12. **Adicionar chave → Criar nova chave → JSON → Criar**
13. O arquivo `service_account.json` é baixado automaticamente

**Parte 3 — Colocar o arquivo no lugar certo**

14. Mova o arquivo baixado para:
```
treinamento-orquestradores-stark-gestoresdetrafego/
  squads/
    gestor-trafego-stark/
      service_account.json   ← aqui
```

**Parte 4 — Compartilhar a planilha**

15. Abra o `service_account.json` em qualquer editor de texto (Bloco de Notas serve)
16. Copie o valor do campo `"client_email"` — parece um e-mail como:
    `stark-sheets@stark-sheets-123456.iam.gserviceaccount.com`
17. Abra a planilha Google Sheets da Stark (o link da planilha da sua equipe)
18. Clique em **Compartilhar** (botão verde/azul no canto superior direito)
19. Cole o e-mail copiado, selecione permissão **Editor** e clique em **Enviar**

---

## Verificar se está tudo funcionando

Abra o terminal na pasta do repositório e rode:

```bash
python squads/gestor-trafego-stark/scripts/fill_sheets.py --dry-run --semana Junho
```

✅ Correto: aparece `[INFO] Aba: Junho` e lista os clientes
❌ Erro comum: `service_account.json não encontrado` → arquivo está no lugar errado
❌ Erro comum: `403 Permission denied` → planilha não foi compartilhada com o client_email

---

> **Nunca commite** o `service_account.json` no git — ele já está no `.gitignore`.
