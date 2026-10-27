#!/usr/bin/env bash
# Instalador del plugin de tipografía de Converzzo. Se puede correr varias veces sin problema.
# Lo llama preparar.sh con --solo-motor (los comandos ya vienen en el plugin).
# Imprime LISTO cuando todo quedó instalado, o FALTA_<cosa> si hay que instalar algo antes.
set -e
cd "$(dirname "$0")"
RAIZ="$(pwd)"

command -v ffmpeg  >/dev/null 2>&1 || { echo "FALTA_FFMPEG (Mac: brew install ffmpeg · Windows: winget install ffmpeg)"; exit 1; }
command -v node    >/dev/null 2>&1 || { echo "FALTA_NODE (instala Node.js 18 o superior desde nodejs.org)"; exit 1; }
node -e 'process.exit(+process.versions.node.split(".")[0] >= 18 ? 0 : 1)' || { echo "FALTA_NODE (se necesita Node.js 18 o superior)"; exit 1; }
PY=""
for v in python3.12 python3.11 python3.13 python3.10 python3 python; do
  if command -v "$v" >/dev/null 2>&1 && "$v" -c 'import sys; sys.exit(0 if sys.version_info[:2] >= (3, 10) else 1)' 2>/dev/null; then PY="$v"; break; fi
done
[ -n "$PY" ] || { echo "FALTA_PYTHON (instala Python 3.10 o superior desde python.org)"; exit 1; }

echo "1/3 Motor de animación..."
( cd motor && npm install --no-audit --no-fund --loglevel=error )

echo "2/3 Detector de cara y transcriptor..."
if [ ! -d motor/.venv ]; then "$PY" -m venv motor/.venv; fi
VPY=motor/.venv/bin/python; [ -x "$VPY" ] || VPY=motor/.venv/Scripts/python.exe
"$VPY" -m pip install -q --upgrade pip
"$VPY" -m pip install -q -r motor/requirements.txt

echo "3/3 Comandos de Claude..."
if [ "$1" != "--solo-motor" ] && [ -d skills ]; then
  mkdir -p "$HOME/.claude/skills"
  for s in skills/*/; do
    n="$(basename "$s")"
    rm -rf "$HOME/.claude/skills/$n"
    cp -R "$s" "$HOME/.claude/skills/$n"
  done
fi

echo "$RAIZ" > "$HOME/.claude/tipografia-converzzo.ruta"
echo "LISTO"
