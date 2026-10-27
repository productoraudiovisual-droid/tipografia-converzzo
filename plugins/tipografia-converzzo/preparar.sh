#!/usr/bin/env bash
# Deja listo el motor de tipografía en ~/.claude/tipografia-converzzo (carpeta con permisos de escritura).
# La primera vez (o cuando el plugin se actualiza) copia el motor e instala lo necesario; después responde LISTO al instante.
set -e
PLUGIN="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.claude/tipografia-converzzo"
VERSION="$(cat "$PLUGIN/VERSION")"
if [ -f "$DEST/VERSION" ] && [ "$(cat "$DEST/VERSION")" = "$VERSION" ] && [ -f "$HOME/.claude/tipografia-converzzo.ruta" ] \
   && [ -d "$DEST/motor/node_modules" ] && [ -d "$DEST/motor/.venv" ]; then
  echo "LISTO"; exit 0
fi
echo "Preparando el motor de tipografía (solo la primera vez, 1 a 3 minutos)..."
mkdir -p "$DEST"
( cd "$PLUGIN" && tar --exclude=./skills --exclude=./.claude-plugin --exclude=node_modules --exclude=.venv -cf - . ) | ( cd "$DEST" && tar -xf - )
bash "$DEST/instalar.sh" --solo-motor
