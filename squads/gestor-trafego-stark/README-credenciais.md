# Configuração de Credenciais — gestor-trafego-stark

> Este guia ensina como configurar tudo do zero para usar o squad.
> Para cada etapa existe uma versão manual E um prompt pronto para pedir ao Claude Code fazer por você.

---

## O que já está configurado no repositório

| Variável | Status | Onde fica |
|----------|--------|-----------|
| `REPORTEI_TOKEN` | ✅ Pronto | `squads/gestor-trafego-stark/.claude/settings.local.json` |
| `SHEET_ID` | ✅ Pronto | `squads/gestor-trafego-stark/.claude/settings.local.json` |
| Hooks de proteção (H1–H5) | ✅ Prontos | `.claude/settings.json` na raiz |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ⚠️ Você configura | `squads/gestor-trafego-stark/service_account.json` |

---

## ETAPA 1 — Instalar o Python

### Manual
1. Acesse [python.org/downloads](https://www.python.org/downloads/) e baixe a versão mais recente
2. Durante a instalação, **marque obrigatoriamente** a opção **"Add Python to PATH"**
3. Confirme: abra o terminal e rode `python --version`

### Com Claude Code
Abra o Claude Code neste repositório e cole:
```
Verifique se o Python está instalado e na versão 3.10 ou superior.
Se não estiver, me diga exatamente como instalar no Windows marcando
"Add Python to PATH". Depois confirme que está funcionando.
```

---

## ETAPA 2 — Instalar as bibliotecas Python

### Manual
```bash
pip install google-auth-httplib2 google-api-python-client pyyaml
```

### Com Claude Code
```
Instale as bibliotecas Python necessárias para o squad gestor-trafego-stark:
google-auth-httplib2, google-api-python-client e pyyaml.
Confirme que cada uma foi instalada com sucesso.
```

---

## ETAPA 3 — Criar o projeto no Google Cloud e ativar a API

### Manual
1. Acesse [console.cloud.google.com](https://console.cloud.google.com) com sua conta Google
2. Clique em **Selecionar projeto** (topo da página) → **Novo projeto**
3. Nome: `stark-sheets` → **Criar**
4. Aguarde a criação e certifique-se de que o projeto `stark-sheets` está selecionado no topo
5. No menu lateral: **APIs e Serviços → Biblioteca**
6. Na barra de busca, digite `Google Sheets API`
7. Clique no resultado **Google Sheets API** → **Ativar**
8. Aguarde a ativação (pode levar alguns segundos)

### Com Claude Code
```
Me guia para criar um projeto chamado "stark-sheets" no Google Cloud Console
e ativar a Google Sheets API nele. Vou fazendo cada passo enquanto você me instrui.
Me avise quando precisar que eu confirme algo na tela.
```

---

## ETAPA 4 — Criar a conta de serviço e baixar a chave JSON

### Manual
1. No menu lateral do Google Cloud: **IAM e Admin → Contas de serviço**
2. Clique em **Criar conta de serviço**
3. Nome: `stark-sheets` | ID: preenchido automaticamente → **Criar e continuar**
4. Na etapa "Conceder acesso ao projeto": **não precisa preencher** → clique em **Continuar**
5. Na etapa "Conceder acesso aos usuários": **não precisa preencher** → clique em **Concluído**
6. Na lista de contas, clique na que você acabou de criar (`stark-sheets@...`)
7. Aba **Chaves** → **Adicionar chave** → **Criar nova chave**
8. Selecione **JSON** → **Criar**
9. O arquivo `service_account.json` é baixado automaticamente para sua pasta de Downloads

### Com Claude Code
```
Me guia passo a passo para criar uma conta de serviço chamada "stark-sheets"
no projeto Google Cloud que acabei de criar, e baixar a chave no formato JSON.
Me avise em qual etapa posso pular campos e em qual devo prestar atenção.
```

---

## ETAPA 5 — Colocar o arquivo no lugar certo

### Manual
Mova o `service_account.json` da sua pasta Downloads para:
```
treinamento-orquestradores-stark-gestoresdetrafego/
  squads/
    gestor-trafego-stark/
      service_account.json   ← aqui
```

### Com Claude Code
```
Acabei de baixar o service_account.json para minha pasta Downloads.
Me ajuda a mover ele para squads/gestor-trafego-stark/service_account.json
dentro deste repositório.
```

---

## ETAPA 6 — Compartilhar a planilha com a conta de serviço

Esta etapa é obrigatória — sem ela o script não consegue escrever na planilha.

### Manual
1. Abra o arquivo `service_account.json` no Bloco de Notas ou qualquer editor
2. Encontre o campo `"client_email"` — o valor será algo como:
   `stark-sheets@stark-sheets-123456.iam.gserviceaccount.com`
3. Copie esse e-mail
4. Abra a planilha Google Sheets da Stark no navegador
5. Clique em **Compartilhar** (botão verde/azul no canto superior direito)
6. Cole o e-mail no campo de compartilhamento
7. Mude a permissão para **Editor**
8. Desmarque "Notificar pessoas" (opcional)
9. Clique em **Compartilhar**

### Com Claude Code
```
Abra o arquivo squads/gestor-trafego-stark/service_account.json,
extraia o campo "client_email" e me mostre o e-mail que preciso usar
para compartilhar a planilha Google Sheets com permissão de Editor.
```

---

## ETAPA 7 — Verificar se tudo está funcionando

### Manual
Abra o terminal na raiz do repositório e rode:
```bash
python squads/gestor-trafego-stark/scripts/fill_sheets.py --dry-run --semana Junho
```

**Resultado esperado:**
```
[INFO] Aba: Junho | Semana: ... (Sem X)
[OK] Aba 'Junho' encontrada.
[CLIENTE] Nome do cliente (slug)
[DRY-RUN] slug → linha X → D=valor
```

### Com Claude Code
```
Rode o fill_sheets.py em modo dry-run para a aba Junho e me diga
se está tudo configurado corretamente. Se der erro, me explique
o que está errado e como corrigir.
```

---

## Erros comuns e como resolver

| Erro | Causa | Solução |
|------|-------|---------|
| `service_account.json não encontrado` | Arquivo no lugar errado | Mova para `squads/gestor-trafego-stark/service_account.json` |
| `403 Permission denied` | Planilha não compartilhada | Compartilhe a planilha com o `client_email` do JSON (Etapa 6) |
| `google-auth não instalado` | Bibliotecas faltando | Rode `pip install google-auth-httplib2 google-api-python-client` |
| `ModuleNotFoundError: yaml` | Biblioteca faltando | Rode `pip install pyyaml` |
| `[ERRO] SHEET_ID não definido` | settings.local.json ausente | Verifique se o arquivo `.claude/settings.local.json` existe |
| `Aba 'Junho' não encontrada` | Aba errada ou mês errado | Use `--semana` com o nome exato da aba na planilha |

### Com Claude Code (resolver qualquer erro)
```
Rodei o fill_sheets.py e recebi este erro: [COLE O ERRO AQUI]
Me ajuda a identificar a causa e corrigir.
```

---

> **Nunca commite** o `service_account.json` no git — ele já está no `.gitignore`.
