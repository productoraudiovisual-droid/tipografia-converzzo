---
name: cita
description: Muestra una frase destacada con comillas grandes, en serif elegante, con autor y una palabra resaltada en cursiva. Úsala con /cita y el video, o cuando pidan resaltar una frase, cita, testimonio o reseña de un cliente.
---

# /cita

Frase destacada con comillas grandes, palabras que aparecen una por una, una palabra en cursiva de color y el autor abajo. Va en la parte baja con un degradado oscuro para que se lea.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Para la frase más importante del video, un testimonio o una reseña real de un cliente.
- Usa las palabras exactas de la persona o del cliente; nunca inventes testimonios.
- Dura de 3 a 6 s según el largo.

## Capa
```json
{"efecto": "cita", "desde": 12.0, "hasta": 16.5, "texto": "El mejor sérum que he probado en mi vida", "autor": "Laura, clienta", "resaltar": "mejor"}
```
Opciones: `texto`, `autor` (opcional), `resaltar` (palabras en cursiva de color), `color`, `fuente` (playfair por defecto), `tamano`, `posicion` / `y`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
