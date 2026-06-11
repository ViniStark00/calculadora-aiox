# Configuração de Credenciais — gestor-trafego-stark

## O que já está configurado

| Variável | Status |
|----------|--------|
| `REPORTEI_TOKEN` | ✅ Em `.claude/settings.local.json` |
| `SHEET_ID` | ✅ Em `.claude/settings.local.json` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ⚠️ Você precisa configurar |

## Como configurar o Google Service Account

O arquivo `service_account.json` dá acesso à planilha Google Sheets.
Cada gestor precisa do seu próprio arquivo.

### Passo a passo

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Selecione o projeto da Stark (ou crie um novo)
3. Vá em **IAM e Admin → Contas de serviço**
4. Clique em **Criar conta de serviço**
5. Dê um nome (ex: `stark-sheets`) e clique em **Criar**
6. Na tela seguinte, clique em **Concluído**
7. Clique na conta criada → aba **Chaves** → **Adicionar chave → JSON**
8. Salve o arquivo como `service_account.json` dentro de:
   ```
   squads/gestor-trafego-stark/service_account.json
   ```
9. Compartilhe a planilha Google Sheets com o e-mail da conta de serviço
   (aparece no campo `client_email` dentro do JSON)

### Importante

- **Nunca commite** o `service_account.json` no git (já está no `.gitignore`)
- O caminho `squads/gestor-trafego-stark/service_account.json` já está configurado em `settings.local.json`
