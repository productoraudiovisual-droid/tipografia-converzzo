---
name: cartel-nombre
description: Pone el nombre y cargo de quien habla en un cartel inferior (lower third) que entra con una barra de color. Úsala con /cartel-nombre y el video, o cuando pidan poner el nombre, presentar a alguien, lower third o cartel de nombre.
---

# /cartel-nombre

Cartel con nombre, cargo y usuario (lower third) que entra con una barra de color y se va solo. Para presentar a quien habla o a un invitado.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Ponlo cuando la persona se presenta ("soy…", "mi nombre es…") o en los primeros 2 a 5 s si no lo dice.
- Nombre y cargo solo si la persona los dice o te los da. Dura de 3 a 4 s.

## Capa
```json
{"efecto": "cartel-nombre", "desde": 1.0, "hasta": 4.5, "nombre": "Ana Gómez", "cargo": "Fundadora de Ana Cosméticos", "usuario": "@anacosmeticos"}
```
Opciones: `nombre`, `cargo`, `usuario` (opcional), `y`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
