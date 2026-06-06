"""
fill_sheets.py — FASE 2: preenche métricas na planilha Google Sheets
Squad: gestor-trafego-stark | Agente: coletor
Uso: python scripts/fill_sheets.py --cliente "nome" --semana "DD/MM/AAAA"

Lê configuração de clientes em data/clientes.yaml.
Recebe métricas via stdin (JSON) ou argumentos.
Filtra clientes com 'vinicius in gestores' e 'ativo: true'.
"""

import os
import sys
import json
import yaml
import datetime
import argparse
from pathlib import Path

# ── Dependências ──────────────────────────────────────────────────────────────
try:
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
except ImportError:
    print("[ERRO] google-auth-httplib2 e google-api-python-client não instalados.")
    print("   pip install google-auth-httplib2 google-api-python-client")
    sys.exit(1)

# ── Configuração ─────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
CLIENTES_YAML = BASE_DIR / "data" / "clientes.yaml"
SERVICE_ACCOUNT_FILE = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "service_account.json")
SHEET_ID = os.environ.get("SHEET_ID", "")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def carregar_clientes():
    """Carrega data/clientes.yaml e filtra clientes Vinicius ativos."""
    with open(CLIENTES_YAML, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    clientes = data.get("clientes", [])
    return [
        c for c in clientes
        if c.get("ativo", True)
        and "vinicius" in c.get("gestores", [])
        and c.get("sheet_columns")
    ]


def calcular_aba():
    """Calcula nome da aba = segunda-feira da semana anterior (DD/MM/AAAA)."""
    hoje = datetime.date.today()
    ultimo_domingo = hoje - datetime.timedelta(days=(hoje.weekday() + 1) % 7)
    segunda = ultimo_domingo - datetime.timedelta(days=6)
    return segunda.strftime("%d/%m/%Y")


def autenticar():
    """Autentica via service account."""
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"[ERRO] Service account não encontrado: {SERVICE_ACCOUNT_FILE}")
        print("   Defina GOOGLE_SERVICE_ACCOUNT_JSON ou coloque o arquivo no diretório atual.")
        sys.exit(1)
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds)


def verificar_aba(sheets, nome_aba):
    """Verifica se a aba existe na planilha."""
    meta = sheets.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
    nomes = [s["properties"]["title"] for s in meta["sheets"]]
    if nome_aba not in nomes:
        print(f"[ERRO] Aba '{nome_aba}' não encontrada na planilha.")
        print(f"   Abas disponíveis: {nomes}")
        print("   Crie a aba manualmente (formato DD/MM/AAAA = segunda-feira) e rode novamente.")
        return False
    print(f"[OK] Aba '{nome_aba}' encontrada.")
    return True


def ler_col_a(sheets, nome_aba):
    """Lê coluna A da aba para localizar linhas dos clientes."""
    result = sheets.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"'{nome_aba}'!A:A"
    ).execute()
    return result.get("values", [])


def localizar_linha(nome_cliente, col_a):
    """Localiza linha do cliente na coluna A (busca parcial case-insensitive)."""
    for i, row in enumerate(col_a):
        if row and nome_cliente.lower() in row[0].lower():
            return i + 1
    return None


def preencher_cliente(sheets, nome_aba, row_idx, metricas, sheet_columns):
    """Preenche colunas do cliente conforme sheet_columns de data/clientes.yaml."""
    updates = []
    for campo, col_letra in sheet_columns.items():
        valor = metricas.get(campo)
        if valor is None:
            continue
        cell_range = f"'{nome_aba}'!{col_letra}{row_idx}"
        updates.append({"range": cell_range, "values": [[valor]]})
        print(f"   {col_letra} ({campo}) <- {valor}")

    if not updates:
        print(f"   [AVISO] Nenhuma métrica para preencher.")
        return 0

    body = {"valueInputOption": "USER_ENTERED", "data": updates}
    response = sheets.spreadsheets().values().batchUpdate(
        spreadsheetId=SHEET_ID, body=body
    ).execute()
    return response.get("totalUpdatedCells", 0)


def main():
    parser = argparse.ArgumentParser(description="fill_sheets.py — stark squad")
    parser.add_argument("--semana", help="Nome da aba DD/MM/AAAA (padrão: calculado automaticamente)")
    parser.add_argument("--metricas-json", help="JSON com métricas por slug: {slug: {meta_spend: X, ...}}")
    args = parser.parse_args()

    if not SHEET_ID:
        print("[ERRO] Variável de ambiente SHEET_ID não definida.")
        sys.exit(1)

    nome_aba = args.semana or calcular_aba()
    print(f"[INFO] Semana: {nome_aba}")

    # Carregar métricas do parâmetro ou stdin
    metricas_por_slug = {}
    if args.metricas_json:
        metricas_por_slug = json.loads(args.metricas_json)
    elif not sys.stdin.isatty():
        metricas_por_slug = json.load(sys.stdin)

    # Carregar clientes
    clientes = carregar_clientes()
    print(f"[INFO] Clientes Vinicius ativos: {len(clientes)}")

    # Autenticar e verificar aba
    service = autenticar()
    sheets = service
    if not verificar_aba(sheets, nome_aba):
        sys.exit(1)

    col_a = ler_col_a(sheets, nome_aba)
    resultados = []
    todos_ok = True

    for cliente in clientes:
        nome = cliente["nome"]
        slug = cliente["slug"]
        sheet_columns = cliente.get("sheet_columns", {})
        metricas = metricas_por_slug.get(slug, {})

        print(f"\n{'='*50}")
        print(f"[CLIENTE] {nome} ({slug})")

        row_idx = localizar_linha(nome, col_a)
        if row_idx is None:
            print(f"[ERRO] '{nome}' não encontrado na coluna A da aba '{nome_aba}'.")
            resultados.append({"slug": slug, "status": "erro", "motivo": "cliente não encontrado na planilha"})
            todos_ok = False
            continue

        print(f"[OK] Linha {row_idx}")

        if not metricas:
            print(f"[AVISO] Nenhuma métrica recebida para {slug} — pulando preenchimento.")
            resultados.append({"slug": slug, "status": "pulado", "motivo": "sem métricas"})
            continue

        cells = preencher_cliente(sheets, nome_aba, row_idx, metricas, sheet_columns)
        print(f"[OK] {cells} células preenchidas")
        resultados.append({"slug": slug, "status": "processado", "celulas": cells, "linha": row_idx})

    # Resumo final
    print(f"\n{'='*50}")
    print(f"RESUMO — ABA {nome_aba}")
    print(f"{'='*50}")
    for r in resultados:
        if r["status"] == "processado":
            print(f"  [OK]    {r['slug']}: linha {r['linha']} — {r.get('celulas', 0)} células")
        elif r["status"] == "pulado":
            print(f"  [SKIP]  {r['slug']}: {r.get('motivo', '')}")
        else:
            print(f"  [ERRO]  {r['slug']}: {r.get('motivo', 'erro desconhecido')}")

    # Output JSON para o coletor
    print("\n[STATUS_JSON]")
    print(json.dumps(resultados, ensure_ascii=False))

    sys.exit(0 if todos_ok else 1)


if __name__ == "__main__":
    main()
