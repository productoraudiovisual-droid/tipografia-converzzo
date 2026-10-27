---
name: dato
description: Muestra un número que sube contando (+30.000, 97%, $2,5M) con una etiqueta, justo cuando se menciona en el video. Úsala con /dato y el video, o cuando pidan resaltar una cifra, un número o una estadística.
---

# /dato

Un número grande que sube contando con su etiqueta ("+30.000 alumnos"), en el momento en que la persona lo dice.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Úsalo cuando la persona dice una cifra importante. El valor tal cual se escribe en su país (`+30.000`, `97%`, `$2,5M`).
- Nunca inventes cifras. `desde` = cuando empieza a decir el número; dura de 2,5 a 4 s.

## Capa
```json
{"efecto": "dato", "desde": 14.4, "hasta": 17.4, "valor": "+30.000", "etiqueta": "alumnos en LATAM"}
```
Opciones: `valor`, `etiqueta`, `desde_valor` (desde qué número cuenta; 0 por defecto), `y`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
