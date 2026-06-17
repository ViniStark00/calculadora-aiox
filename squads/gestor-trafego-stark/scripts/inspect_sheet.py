"""Inspeciona a aba Junho da planilha para ver a estrutura atual."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SA = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON',
    r'C:\Users\Usuario\Desktop\Claude_Stark\squads\relatorio-semanal\service_account.json')
SHEET_ID = os.environ.get('SHEET_ID', '16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM')
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

creds = Credentials.from_service_account_file(SA, scopes=SCOPES)
service = build('sheets', 'v4', credentials=creds)

# Listar abas
meta = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
abas = [s['properties']['title'] for s in meta['sheets']]
print('Abas:', abas)

# Ler primeiras 60 linhas da aba Junho (colunas A-C)
result = service.spreadsheets().values().get(
    spreadsheetId=SHEET_ID,
    range="'Junho'!A1:C60"
).execute()
rows = result.get('values', [])
print(f'\nTotal linhas com dados: {len(rows)}')
for i, r in enumerate(rows):
    if r:
        print(f'  linha {i+1}: {r}')
