"""
fill_sheets.py — Atividade 1: preenche métricas na planilha Google Sheets
Squad: relatorio-semanal | Agente: coletor
Uso: python scripts/fill_sheets.py
"""

import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# ── Configuração ─────────────────────────────────────────────────────────────
SERVICE_ACCOUNT_FILE = os.environ.get(
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    r"C:\Users\Usuario\Desktop\Claude_Stark\squads\relatorio-semanal\service_account.json"
)
SHEET_ID = os.environ.get("SHEET_ID", "1crqoxq8hqaQWsoZby5FlQt50gpUZ29buyeRKkv3M5Og")
NOME_ABA = "17/05/2026"   # aba nomeada pelo domingo da semana

# ── Clientes do bloco Vinicius — semana 11/05 a 17/05/2026 ───────────────────
# Coluna C = Meta Spend | E = Google Spend | H = Seguidores | K = Conversas | O = Conversões
CLIENTES = [
    {
        "nome": "Dra Danielle Gondim",
        "metricas": {
            "C": 6486.58,   # Meta Ads Spend
            "E": 0.00,      # Google Ads Spend (sem integração ativa)
            "H": 2448,      # Novos seguidores Instagram
            "K": 93,        # Conversas WhatsApp (messaging_conversation_started_7d)
            "O": 1,         # Conversões (Meta leads)
        }
    },
    {
        "nome": "Dr. Leandro Gontijio",
        "metricas": {
            "C": 11739.71,  # Meta Ads Spend
            "E": 407.94,    # Google Ads Spend (unidade direta)
            "H": 4655,      # Novos seguidores Instagram
            "K": 1212,      # Conversas WhatsApp
            "O": 148,       # Conversões Google Ads (contacts)
        }
    },
    {
        "nome": "IMCP",
        "metricas": {
            "C": 2110.96,   # Meta Ads Spend
            "E": 0.00,      # Google Ads Spend (sem integração)
            "H": 1307,      # Novos seguidores Instagram
            "K": 91,        # Conversas WhatsApp
            "O": 0,         # Conversões
        }
    },
    {
        "nome": "Dr. Guilherme Mattar",
        "metricas": {
            "C": 1011.70,   # Meta Ads Spend
            "E": 563.72,    # Google Ads Spend (unidade direta)
            "H": 0,         # Seguidores (sem integração Instagram)
            "K": 11,        # Conversas WhatsApp
            "O": 250,       # Conversões (107 Meta pixel leads + 143 Google contacts)
        }
    },
]

# ── Helpers ───────────────────────────────────────────────────────────────────
def index_para_range(row_idx, col_letra, aba):
    return f"'{aba}'!{col_letra}{row_idx}"

# ── Principal ─────────────────────────────────────────────────────────────────
def main():
    print(f"[AUTH] Autenticando com service account...")
    creds = Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    service = build("sheets", "v4", credentials=creds)
    sheets = service.spreadsheets()

    # Verificar aba
    print(f"[SHEETS] Verificando aba '{NOME_ABA}'...")
    meta = sheets.get(spreadsheetId=SHEET_ID).execute()
    nomes_abas = [s["properties"]["title"] for s in meta["sheets"]]
    if NOME_ABA not in nomes_abas:
        print(f"[ERRO] Aba '{NOME_ABA}' não encontrada.")
        print(f"   Abas disponíveis: {nomes_abas}")
        print("   Crie a aba manualmente e rode novamente.")
        return False

    print(f"[OK] Aba '{NOME_ABA}' encontrada.")

    # Ler coluna A uma vez (reutilizar para todos os clientes)
    result = sheets.values().get(
        spreadsheetId=SHEET_ID,
        range=f"'{NOME_ABA}'!A:A"
    ).execute()
    valores_col_a = result.get("values", [])

    resultados = []
    todos_ok = True

    for cliente in CLIENTES:
        nome = cliente["nome"]
        metricas = cliente["metricas"]
        print(f"\n{'='*50}")
        print(f"[CLIENTE] {nome}")

        # Localizar linha
        row_idx = None
        for i, row in enumerate(valores_col_a):
            if row and nome.lower() in row[0].lower():
                row_idx = i + 1
                print(f"[OK] Encontrado na linha {row_idx}: '{row[0]}'")
                break

        if row_idx is None:
            print(f"[ERRO] '{nome}' não encontrado na coluna A da aba '{NOME_ABA}'.")
            resultados.append({"cliente": nome, "ok": False, "linha": None})
            todos_ok = False
            continue

        # Preencher colunas
        updates = []
        for col, valor in metricas.items():
            cell_range = index_para_range(row_idx, col, NOME_ABA)
            updates.append({"range": cell_range, "values": [[valor]]})
            print(f"   {col} <- {valor}")

        body = {"valueInputOption": "USER_ENTERED", "data": updates}
        response = sheets.values().batchUpdate(spreadsheetId=SHEET_ID, body=body).execute()
        cells = response.get("totalUpdatedCells", 0)
        print(f"[OK] {cells} células preenchidas para {nome}")
        resultados.append({"cliente": nome, "ok": True, "linha": row_idx, "celulas": cells})

    # Resumo final
    print(f"\n{'='*50}")
    print(f"RESUMO — ABA {NOME_ABA}")
    print(f"{'='*50}")
    for r in resultados:
        status = "[OK]" if r["ok"] else "[ERRO]"
        detalhe = f"linha {r['linha']} — {r.get('celulas', 0)} células" if r["ok"] else "NÃO ENCONTRADO"
        print(f"  {status} {r['cliente']}: {detalhe}")

    return todos_ok

if __name__ == "__main__":
    ok = main()
    exit(0 if ok else 1)
