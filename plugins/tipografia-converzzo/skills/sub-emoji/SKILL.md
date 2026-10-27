---
name: sub-emoji
description: Subtítulos clásicos con un emoji que aparece arriba cuando se dice una palabra clave. Úsala con /sub-emoji y el video, o cuando pidan subtítulos estilo emoji.
---

# /sub-emoji

Subtítulos clásicos con un emoji que aparece arriba cuando se dice una palabra clave. Ideal para contenido divertido, comida, ventas y redes. Fuente por defecto: Montserrat.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Va en todo el video: `desde` 0, `hasta` = duración (o solo el tramo que pida la persona). El motor transcribe solo.
- Revisa la transcripción: marcas, nombres o palabras mal escritas se arreglan en `correcciones` (`{"wasap": "WhatsApp"}`).
- Si el video tiene un `gancho` o un texto grande al inicio, empieza los subtítulos después para que no se pisen.
- Para subtítulos en otro idioma usa `/traducir-subtitulos`.

## Capa
```json
{"efecto": "subtitulos", "desde": 0, "hasta": 45.2, "estilo": "emoji", "correcciones": {"wasap": "WhatsApp"}, "emojis": {"dinero": "💰", "error": "❌"}}
```
Opciones: `fuente` (cualquier fuente de `/fuentes` o un archivo .ttf/.otf), `color` (color de la palabra resaltada), `tamano`, `mayusculas` (true/false), `palabras_por_bloque`, `posicion` (`auto` debajo de la cara, `centro`, `arriba`) o `y` (0 a 1), `correcciones`, `idioma` ("es" por defecto), `frases` (subtítulos ya traducidos).

## Emojis
- Elige tú 1 emoji por cada 2 o 3 bloques, solo en palabras clave (dinero 💰, fuego 🔥, error ❌, tiempo ⏰, comida 🍔…). No llenes todo de emojis.
- Usa solo emojis de la lista disponible en `~/.claude/tipografia-converzzo/motor/public/emoji/lista.json`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
