---
name: pregunta
description: Muestra una tarjeta tipo encuesta con una pregunta y opciones (con porcentajes si los da la persona) para invitar a comentar. Úsala con /pregunta y el video, o cuando pidan una encuesta, una pregunta al público o generar comentarios.
---

# /pregunta

Tarjeta blanca tipo encuesta con la pregunta y 2 a 4 opciones. Si hay porcentajes, las barras se llenan; si hay opción elegida, se ve un toque sobre ella.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Cuando la persona le pregunta algo al público ("¿tú cuál prefieres?", "cuéntame en comentarios") o al final para cerrar con interacción.
- Porcentajes solo si son reales (de una encuesta de historias, por ejemplo). Si no, ponla sin porcentajes.
- Dura de 3 a 5 s.

## Capa
```json
{"efecto": "pregunta", "desde": 30.2, "hasta": 34.5, "pregunta": "¿Cuál pides primero?", "opciones": ["Hamburguesa", "Pizza"]}
```
Opciones: `pregunta`, `opciones` (2 a 4), `porcentajes` (misma cantidad que opciones), `elegida` (número de opción que se toca, desde 0), `color`, `fuente`, `posicion` / `y`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
