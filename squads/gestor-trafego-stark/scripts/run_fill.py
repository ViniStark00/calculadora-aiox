"""Wrapper para fill_sheets.py — passa arquivo JSON em vez de string (evita bug de encoding PowerShell)"""
import sys, os

scripts_dir = os.path.dirname(__file__)
json_path = os.path.join(scripts_dir, "metricas_junho_sem2.json")

sys.argv = [
    "fill_sheets.py",
    "--semana", "Junho",
    "--gestor", "vinicius",
    "--clientes", "imcp,dr-leandro-gontijio,dr-guilherme-mattar,dr-luiz-borba,diego-gonzalez-salvador,destra-desenvolvimentos,dr-joel-abdala,dr-lucas-consentino,dr-matheus-ocampo",
    "--metricas-arquivo", json_path,
]

sys.path.insert(0, scripts_dir)
import fill_sheets
fill_sheets.main()
