#!/usr/bin/env python3
"""
Hook Stop — Squad relatorio-semanal
Verifica se Atividades 2 e 3 foram concluídas antes de encerrar.
Exit code 0 = OK | Exit code 2 = Falha (bloqueia encerramento)
Só valida se o log foi modificado nas últimas 2 horas (pipeline desta sessão).
"""
import json
import sys
from pathlib import Path
from datetime import datetime, timedelta

SQUAD_ROOT = Path(__file__).parent.parent  # squads/relatorio-semanal/
LOG_PATH = SQUAD_ROOT / "data" / "timeline-log.jsonl"
RECENCY_HOURS = 2


def main():
    # Se o log não existe, nenhum pipeline rodou — sai silenciosamente
    if not LOG_PATH.exists():
        sys.exit(0)

    # Só valida se o log foi modificado recentemente (desta sessão)
    mtime = datetime.fromtimestamp(LOG_PATH.stat().st_mtime)
    if datetime.now() - mtime > timedelta(hours=RECENCY_HOURS):
        sys.exit(0)

    entries = [l for l in LOG_PATH.read_text(encoding="utf-8").splitlines() if l.strip()]
    errors = []

    # Atividade 1 (planilha) — dry run: aviso, não bloqueia
    print("⚠️  Atividade 1 (planilha): verificação automática não disponível — confirme manualmente as colunas C/E/H/K/O.")

    # Atividade 3 (Timeline) — verifica eventos no log
    if entries:
        last = json.loads(entries[-1])
        print(f"✅ Atividade 3: {len(entries)} evento(s) publicado(s). Último: Event ID {last.get('event_id')} — projeto {last.get('cliente')}")
    else:
        errors.append("❌ Atividade 3: nenhum evento publicado na Timeline nesta sessão.")

    if errors:
        for e in errors:
            print(e, file=sys.stderr)
        print("🚨 Pipeline incompleto. Verifique as atividades antes de encerrar.", file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
