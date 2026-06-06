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
import time
import argparse
from pathlib import Path

# ── Dependências ──────────────────────────────────────────────────────────────
try:
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
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


def carregar_clientes(gestor=None, slugs=None):
    """Carrega data/clientes.yaml com filtros por gestor ou slugs.
    Padrão (nenhum passado): filtra por 'vinicius'.
    """
    with open(CLIENTES_YAML, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    clientes = data.get("clientes", [])
    ativos = [c for c in clientes if c.get("ativo", True) and c.get("sheet_columns")]
    if slugs:
        return [c for c in ativos if c.get("slug") in slugs]
    if gestor:
        return [c for c in ativos if gestor in c.get("gestores", [])]
    return [c for c in ativos if "vinicius" in c.get("gestores", [])]


def calcular_aba():
    """Calcula nome da aba = segunda-feira da semana anterior (DD/MM/AAAA)."""
    hoje = datetime.date.today()
    dias_ate_domingo = (hoje.weekday() + 1) % 7
    if dias_ate_domingo == 0:
        dias_ate_domingo = 7
    ultimo_domingo = hoje - datetime.timedelta(days=dias_ate_domingo)
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


def verificar_ou_criar_aba(sheets, nome_aba):
    """Verifica se a aba existe; se não, duplica a última aba e renomeia."""
    meta = sheets.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
    abas = meta["sheets"]
    nomes = [s["properties"]["title"] for s in abas]

    if nome_aba in nomes:
        print(f"[OK] Aba '{nome_aba}' encontrada.")
        return True

    ultima_aba = abas[-1]
    source_id = ultima_aba["properties"]["sheetId"]
    source_name = ultima_aba["properties"]["title"]
    print(f"[INFO] Aba '{nome_aba}' não existe. Duplicando '{source_name}'...")
    body = {"requests": [{"duplicateSheet": {
        "sourceSheetId": source_id,
        "insertSheetIndex": len(abas),
        "newSheetName": nome_aba
    }}]}
    sheets.spreadsheets().batchUpdate(spreadsheetId=SHEET_ID, body=body).execute()
    print(f"[OK] Aba '{nome_aba}' criada por duplicação de '{source_name}'.")
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


def _to_float(valor):
    """Converte qualquer formato para float seguro. Retorna None se inválido."""
    if valor is None:
        return None
    if isinstance(valor, (int, float)):
        return float(valor)
    if isinstance(valor, str):
        try:
            return float(valor.strip().replace(",", "."))
        except ValueError:
            return None
    if isinstance(valor, list):
        return sum(v for item in valor if (v := _to_float(item)) is not None)
    if isinstance(valor, dict):
        for chave in ("value", "total"):
            if chave in valor:
                return _to_float(valor[chave])
    return None


def preencher_cliente(sheets, nome_aba, row_idx, metricas, sheet_columns, slug="", dry_run=False, moeda="BRL"):
    """Preenche colunas do cliente. Se dry_run=True, apenas imprime sem escrever."""
    updates = []
    for campo, col_letra in sheet_columns.items():
        if moeda != "BRL" and "spend" in campo:
            print(f"   [AVISO] {slug} — moeda {moeda}, pulando coluna de spend ({campo})")
            continue
        valor = _to_float(metricas.get(campo))
        if valor is None:
            continue
        if dry_run:
            print(f"[DRY-RUN] {slug} → linha {row_idx} → {col_letra}={valor}")
        else:
            cell_range = f"'{nome_aba}'!{col_letra}{row_idx}"
            updates.append({"range": cell_range, "values": [[valor]]})
            print(f"   {col_letra} ({campo}) <- {valor}")

    if dry_run:
        return 0

    if not updates:
        print(f"   [AVISO] Nenhuma métrica para preencher.")
        return 0

    body = {"valueInputOption": "USER_ENTERED", "data": updates}
    try:
        response = sheets.spreadsheets().values().batchUpdate(
            spreadsheetId=SHEET_ID, body=body
        ).execute()
    except HttpError as e:
        if e.resp.status == 429:
            print(f"   [AVISO] Rate limit (429) — aguardando 60s e tentando novamente...")
            time.sleep(60)
            response = sheets.spreadsheets().values().batchUpdate(
                spreadsheetId=SHEET_ID, body=body
            ).execute()
        else:
            raise
    return response.get("totalUpdatedCells", 0)


def validar_metricas(slug, metricas, sheet_columns):
    """Valida colunas e valores antes de escrever. Retorna (ok, motivo)."""
    import re
    for campo, col_letra in sheet_columns.items():
        if not re.fullmatch(r'[A-Z]', str(col_letra)):
            return False, f"coluna inválida '{col_letra}' em sheet_columns"
        valor = metricas.get(campo)
        if valor is None:
            continue
        if not isinstance(valor, (int, float)):
            return False, f"valor inválido para '{campo}': {repr(valor)} (esperado int ou float)"
    return True, ""


def main():
    parser = argparse.ArgumentParser(description="fill_sheets.py — stark squad")
    parser.add_argument("--semana", help="Nome da aba DD/MM/AAAA (padrão: calculado automaticamente)")
    parser.add_argument("--metricas-json", help="JSON com métricas por slug: {slug: {meta_spend: X, ...}}")
    parser.add_argument("--gestor", help="Filtrar por gestor (ex: vinicius, gustavo)")
    parser.add_argument("--clientes", help="Slugs separados por vírgula (ex: imcp,dr-carlos)")
    parser.add_argument("--dry-run", action="store_true", help="Simular escrita sem alterar a planilha")
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
    slugs = [s.strip() for s in args.clientes.split(",")] if args.clientes else None
    clientes = carregar_clientes(gestor=args.gestor, slugs=slugs)
    filtro_desc = f"--clientes {args.clientes}" if slugs else f"--gestor {args.gestor or 'vinicius'}"
    print(f"[INFO] Clientes ({filtro_desc}): {len(clientes)}")

    # Autenticar e verificar aba
    service = autenticar()
    sheets = service
    if not verificar_ou_criar_aba(sheets, nome_aba):
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

        ok, motivo = validar_metricas(slug, metricas, sheet_columns)
        if not ok:
            print(f"[AVISO] {slug} — schema inválido: {motivo}. Pulando cliente.")
            resultados.append({"slug": slug, "status": "pulado", "motivo": f"schema inválido: {motivo}"})
            continue

        moeda = cliente.get("moeda", "BRL")
        cells = preencher_cliente(sheets, nome_aba, row_idx, metricas, sheet_columns, slug=slug, dry_run=args.dry_run, moeda=moeda)
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

    if args.dry_run:
        print("\n[DRY-RUN] Nenhuma célula foi alterada.")

    sys.exit(0 if todos_ok else 1)


if __name__ == "__main__":
    main()
