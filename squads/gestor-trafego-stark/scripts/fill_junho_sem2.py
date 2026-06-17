"""
fill_junho_sem2.py — Preenche métricas Sem 2 de Junho para clientes de Vinicius.
Usa batchUpdate direto com row numbers conhecidos (lidos via check_junho.py).

Colunas permitidas: D=tofu_spend, E=meta_spend_total, F=seguidores,
                    K=conversas_whats, M=leads_meta, N=leads_respondi,
                    P=cpa_google, R=google_spend
NUNCA escrever em G/H/I/J/L/O/Q (fórmulas automáticas).
"""
import os
import sys
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SHEET_ID = os.environ.get("SHEET_ID", "16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM")
SA_JSON = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
TAB = "Junho"

# Proteção contra escrita acidental em colunas com fórmulas
COLUNAS_FORMULA = frozenset({'G', 'H', 'I', 'J', 'L', 'O', 'Q'})
COLUNAS_PERMITIDAS = frozenset({'D', 'E', 'F', 'K', 'M', 'N', 'P', 'R'})

# Métricas compiladas — período 08/06 a 14/06/2026 (Sem 2)
# Formato: { row_number: { col_letter: value, ... }, ... }
METRICS = {
    # Dr. Leandro Gontijio — Sem 2
    320: {"D": 10080.43, "E": 15756.26, "F": 9996, "K": 925, "M": 0, "N": 0, "P": 13.88, "R": 457.92},
    # IMCP — Sem 2
    325: {"D": 1672.61, "E": 2023.82, "F": 978, "K": 74, "M": 0, "N": 0, "P": 0, "R": 0},
    # Dr. Guilherme Mattar — Sem 2
    330: {"D": 0, "E": 1017.40, "F": 0, "K": 14, "M": 243, "N": 0, "P": 3.29, "R": 545.98},
    # Luiz Borba — Sem 2
    335: {"D": 1340.97, "E": 1946.61, "F": 629, "K": 196, "M": 0, "N": 0, "P": 0, "R": 0},
    # Diego Gonzalez Salvador — Sem 2
    340: {"D": 304.59, "E": 857.55, "F": 206, "K": 20, "M": 0, "N": 0, "P": 0, "R": 0},
    # DESTRA — Sem 2
    345: {"D": 0, "E": 0, "F": 0, "K": 0, "M": 0, "N": 0, "P": 41.59, "R": 707.10},
    # JOEL — Sem 2
    350: {"D": 1655.53, "E": 2251.99, "F": 501, "K": 45, "M": 0, "N": 0, "P": 0, "R": 0},
    # Dr. Lucas Consentino — Sem 2 (tofu_spend=0 por erro MCP)
    355: {"D": 0, "E": 1140.41, "F": 68, "K": 34, "M": 0, "N": 0, "P": 0, "R": 0},
    # Dr. Matheus Ocampo — Sem 2
    360: {"D": 0, "E": 699.70, "F": 32, "K": 0, "M": 0, "N": 0, "P": 0, "R": 0},
}

CLIENT_NAMES = {
    320: "Dr. Leandro Gontijio",
    325: "IMCP",
    330: "Dr. Guilherme Mattar",
    335: "Luiz Borba",
    340: "Diego Gonzalez Salvador",
    345: "DESTRA",
    350: "JOEL",
    355: "Dr. Lucas Consentino",
    360: "Dr. Matheus Ocampo",
}


def build_batch_data():
    data = []
    for row_num, cols in METRICS.items():
        for col_letter, value in cols.items():
            col_upper = col_letter.upper()
            if col_upper not in COLUNAS_PERMITIDAS:
                raise ValueError(
                    f"[BLOQUEADO] linha {row_num} — coluna '{col_letter}' não está na allowlist "
                    f"COLUNAS_PERMITIDAS={sorted(COLUNAS_PERMITIDAS)}. Corrija METRICS."
                )
            if col_upper in COLUNAS_FORMULA:
                print(f"[AVISO] linha {row_num} — coluna {col_letter} é fórmula automática — pulando")
                continue
            data.append({
                "range": f"'{TAB}'!{col_letter}{row_num}",
                "values": [[value]]
            })
    return data


def main():
    if not SA_JSON:
        print("ERRO: GOOGLE_SERVICE_ACCOUNT_JSON não definido.", file=sys.stderr)
        sys.exit(1)

    creds = Credentials.from_service_account_file(SA_JSON, scopes=["https://www.googleapis.com/auth/spreadsheets"])
    service = build("sheets", "v4", credentials=creds, cache_discovery=False)
    sheets = service.spreadsheets()

    data = build_batch_data()
    body = {"valueInputOption": "RAW", "data": data}

    print(f"Gravando {len(data)} células na aba '{TAB}'...")
    res = sheets.values().batchUpdate(spreadsheetId=SHEET_ID, body=body).execute()
    updated = res.get("totalUpdatedCells", 0)

    print(f"\n✅ Planilha atualizada — {updated} células gravadas")
    print(f"Período: 08/06/2026 a 14/06/2026 (Sem 2)\n")
    for row_num, name in CLIENT_NAMES.items():
        cols = METRICS[row_num]
        print(f"  Linha {row_num} | {name}")
        print(f"    D={cols['D']} | E={cols['E']} | F={cols['F']} | K={cols['K']} | M={cols['M']} | N={cols['N']} | P={cols['P']} | R={cols['R']}")

    print("\n⚠️  Avisos:")
    print("  - Dr. Lucas Consentino: tofu_spend=0 (Meta Ads MCP perdeu conexão — revisar manualmente)")
    print("  - Diego Gonzalez Salvador: leads_respondi=0 (campanha [RESPONDI] detectada, lead count não extraído)")


if __name__ == "__main__":
    main()
