"""
fill_sheets.py — FASE 2: preenche métricas na planilha Google Sheets
Squad: gestor-trafego-stark | Agente: coletor
Uso: python scripts/fill_sheets.py --gestor vinicius [--semana Junho]

Lê configuração de clientes em data/clientes.yaml.
Recebe métricas via stdin (JSON) ou argumento --metricas-json.
Nova estrutura (jun/2026): abas mensais (Junho, Julho...) — col A=Gestor, col B=Cliente, col C=Sem X
"""

import os
import sys
import json
import yaml
import datetime
import math
import time
import argparse
from pathlib import Path

# Forçar UTF-8 no stdout (fix Windows — evita UnicodeEncodeError em nomes com acentos)
sys.stdout.reconfigure(encoding='utf-8')

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

MESES_PT = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
}

# Colunas que contêm fórmulas automáticas — NUNCA escrever (J=taxa_conv, I=CPL_meta, etc.)
COLUNAS_FORMULA = frozenset({'G', 'H', 'I', 'J', 'L', 'O', 'Q'})

# Allowlist explícita — qualquer coluna fora daqui causa erro imediato (não silencioso)
COLUNAS_PERMITIDAS = frozenset({'D', 'E', 'F', 'K', 'M', 'N', 'P', 'R'})


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
    """Calcula nome da aba mensal e período da semana anterior.

    Retorna: (nome_aba, data_inicio, data_fim)
      nome_aba   — nome do mês em português da semana anterior (ex: "Junho")
      data_inicio — segunda-feira da semana anterior
      data_fim    — domingo da semana anterior
    """
    hoje = datetime.date.today()
    dias = (hoje.weekday() + 1) % 7
    if dias == 0:
        dias = 7
    ultimo_domingo = hoje - datetime.timedelta(days=dias)
    segunda = ultimo_domingo - datetime.timedelta(days=6)
    return MESES_PT[segunda.month], segunda, ultimo_domingo


def calcular_sem_numero(data_inicio):
    """Calcula "Sem X" a partir da data de início da semana.

    Ex: dia 2 → "Sem 1", dia 9 → "Sem 2", dia 16 → "Sem 3", dia 23 → "Sem 4"
    """
    return f"Sem {math.ceil(data_inicio.day / 7)}"


def autenticar():
    """Autentica via service account usando requests como transport (evita bug httplib2/Windows)."""
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"[ERRO] Service account não encontrado: {SERVICE_ACCOUNT_FILE}")
        print("   Defina GOOGLE_SERVICE_ACCOUNT_JSON ou coloque o arquivo no diretório atual.")
        sys.exit(1)
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    # Refresh via requests (não httplib2) para evitar WinError 10060
    import requests as _req
    import google.auth.transport.requests as _gtr
    _req_session = _req.Session()
    auth_request = _gtr.Request(session=_req_session)
    creds.refresh(auth_request)
    # Criar um Http-like adapter sobre requests para o googleapiclient
    from googleapiclient.discovery import build as _build
    from googleapiclient.http import HttpRequest
    import googleapiclient.http

    class _RequestsHttp:
        """Wrapper requests->httplib2-like para contornar bug httplib2 Windows."""
        def __init__(self, session, creds):
            self._session = session
            self._creds = creds

        def request(self, uri, method="GET", body=None, headers=None, **kwargs):
            if headers is None:
                headers = {}
            self._creds.apply(headers)
            resp = self._session.request(method, uri, data=body, headers=headers, timeout=120)
            # Simular interface httplib2: retornar (response_dict, content_bytes)
            class _Resp:
                def __init__(self, r):
                    self.status = r.status_code
                    self.__dict__.update({k.lower(): v for k, v in r.headers.items()})
            return _Resp(resp), resp.content

    http = _RequestsHttp(_req_session, creds)
    return _build("sheets", "v4", http=http, cache_discovery=False)


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


def localizar_linha(sheets, nome_aba, nome_cliente, sem_numero, gestor=None):
    """Localiza linha onde col B = nome_cliente E col C = sem_numero.

    A planilha só preenche col B na linha Sem 1 de cada cliente — as linhas de
    Sem 2, 3, 4 têm col B vazia. Por isso: encontra a linha Sem 1 pelo nome
    e calcula o offset para o sem_numero desejado.

    Se gestor fornecido, restringe a busca ao bloco desse gestor (col A).
    """
    result = sheets.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"'{nome_aba}'!A:C"
    ).execute()
    dados = result.get("values", [])

    inicio_bloco = 0
    fim_bloco = len(dados)

    if gestor:
        gestor_lower = gestor.lower()
        for i, linha in enumerate(dados):
            if linha and linha[0].lower() == gestor_lower:
                inicio_bloco = i
                break
        for i in range(inicio_bloco + 1, len(dados)):
            linha = dados[i]
            if linha and linha[0] and linha[0].lower() != gestor_lower:
                fim_bloco = i
                break

    SEM_OFFSET = {"Sem 1": 0, "Sem 2": 1, "Sem 3": 2, "Sem 4": 3, "Média Mês": 4}

    for i in range(inicio_bloco, fim_bloco):
        linha = dados[i]
        if len(linha) >= 2 and linha[1] == nome_cliente:
            # Linha do cliente encontrada (sempre Sem 1) — calcular offset
            base_sem = linha[2] if len(linha) >= 3 else "Sem 1"
            offset = SEM_OFFSET.get(sem_numero, 0) - SEM_OFFSET.get(base_sem, 0)
            target_idx = i + offset
            if 0 <= target_idx < fim_bloco:
                target = dados[target_idx]
                if len(target) >= 3 and target[2] == sem_numero:
                    return target_idx + 1
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
        col_upper = col_letra.upper()
        if col_upper not in COLUNAS_PERMITIDAS:
            raise ValueError(
                f"[BLOQUEADO] {slug} — coluna '{col_letra}' ({campo}) não está na allowlist "
                f"COLUNAS_PERMITIDAS={sorted(COLUNAS_PERMITIDAS)}. "
                "Corrija o mapeamento em clientes.yaml antes de prosseguir."
            )
        if col_upper in COLUNAS_FORMULA:
            print(f"   [AVISO] {slug} — coluna {col_letra} ({campo}) é fórmula automática — pulando")
            continue
        if moeda != "BRL" and "spend" in campo:
            print(f"   [AVISO] {slug} — moeda {moeda}, pulando coluna de spend ({campo})")
            continue
        valor = _to_float(metricas.get(campo))
        if valor is None:
            motivos = metricas.get("_motivos", {})
            motivo = motivos.get(campo, "não informado pelo coletor")
            print(f"   [WARN] {slug} — {campo} ({col_letra}) vazio")
            print(f"          Motivo: {motivo}")
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
    parser.add_argument("--semana", help="Nome da aba (ex: Junho) — padrão: calculado automaticamente")
    parser.add_argument("--metricas-json", help="JSON com métricas por slug: {slug: {meta_spend_total: X, ...}}")
    parser.add_argument("--metricas-arquivo", help="Caminho para arquivo JSON com métricas por slug (evita problemas de encoding no PowerShell)")
    parser.add_argument("--gestor", help="Filtrar por gestor (ex: vinicius, gustavo)")
    parser.add_argument("--clientes", help="Slugs separados por vírgula (ex: imcp,dr-carlos)")
    parser.add_argument("--dry-run", action="store_true", help="Simular escrita sem alterar a planilha")
    args = parser.parse_args()

    if not SHEET_ID:
        print("[ERRO] Variável de ambiente SHEET_ID não definida.")
        sys.exit(1)

    nome_aba_calculado, data_inicio, data_fim = calcular_aba()
    nome_aba = args.semana or nome_aba_calculado
    sem_numero = calcular_sem_numero(data_inicio)
    print(f"[INFO] Aba: {nome_aba} | Semana: {data_inicio} a {data_fim} ({sem_numero})")

    # Carregar métricas do parâmetro, arquivo ou stdin
    metricas_por_slug = {}
    if args.metricas_json:
        metricas_por_slug = json.loads(args.metricas_json)
    elif args.metricas_arquivo:
        with open(args.metricas_arquivo, encoding="utf-8-sig") as f:
            metricas_por_slug = json.load(f)
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

    resultados = []
    todos_ok = True

    for cliente in clientes:
        nome_yaml = cliente["nome"]
        nome = cliente.get("nome_planilha") or nome_yaml  # nome exato na col B da planilha
        slug = cliente["slug"]
        sheet_columns = cliente.get("sheet_columns", {})
        metricas = metricas_por_slug.get(slug, {})

        print(f"\n{'='*50}")
        if nome != nome_yaml:
            print(f"[CLIENTE] {nome_yaml} ({slug}) → planilha: '{nome}'")
        else:
            print(f"[CLIENTE] {nome_yaml} ({slug})")

        row_idx = localizar_linha(sheets, nome_aba, nome, sem_numero, gestor=args.gestor or "vinicius")
        if row_idx is None:
            print(f"[ERRO] '{nome}' / '{sem_numero}' não encontrado na aba '{nome_aba}'.")
            resultados.append({"slug": slug, "status": "erro", "motivo": "cliente/semana não encontrado na planilha"})
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
    print(f"RESUMO — ABA {nome_aba} / {sem_numero}")
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
