"""Verifica estrutura da aba Junho na planilha."""
import os
import sys
import io

# Forçar UTF-8 no terminal Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SHEET_ID = os.environ.get("SHEET_ID", "16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM")
SA_JSON = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")

creds = Credentials.from_service_account_file(SA_JSON, scopes=["https://www.googleapis.com/auth/spreadsheets"])
service = build("sheets", "v4", credentials=creds, cache_discovery=False)
sheets = service.spreadsheets()

result = sheets.values().get(
    spreadsheetId=SHEET_ID,
    range="Junho!A:C"
).execute()
rows = result.get("values", [])
for i, row in enumerate(rows):
    print(f"Linha {i+1}: {row}")
