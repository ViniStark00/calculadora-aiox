#!/usr/bin/env python3
"""
Hook PostToolUse — Squad relatorio-semanal
Loga automaticamente cada publicação na Timeline do Reportei.
Dispara após qualquer chamada ao MCP create_timeline_event.
"""
import json
import sys
from pathlib import Path
from datetime import datetime

SQUAD_ROOT = Path(__file__).parent.parent  # squads/relatorio-semanal/
LOG_PATH = SQUAD_ROOT / "data" / "timeline-log.jsonl"


def extract_event_id(response):
    """Extrai o event_id da resposta do MCP, que pode vir em formatos diferentes."""
    if isinstance(response, dict):
        if "id" in response:
            return response["id"]
        for item in response.get("content", []):
            if isinstance(item, dict):
                try:
                    parsed = json.loads(item.get("text", "{}"))
                    if "id" in parsed:
                        return parsed["id"]
                except Exception:
                    pass
    return None


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # Sai silenciosamente se não conseguir ler stdin

    # Só processa chamadas ao create_timeline_event
    if "create_timeline_event" not in data.get("tool_name", ""):
        sys.exit(0)

    tool_input = data.get("tool_input", {})
    tool_response = data.get("tool_response", {})

    event_id = extract_event_id(tool_response)
    cliente = tool_input.get("project_id", "desconhecido")

    entry = {
        "timestamp": datetime.now().isoformat(),
        "event_id": event_id,
        "cliente": str(cliente),
    }

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"📋 Logado: Event ID {event_id} — projeto {cliente}")
    sys.exit(0)


if __name__ == "__main__":
    main()
