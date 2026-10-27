---
name: mi-estilo
description: Guarda las fuentes y colores de la marca de la persona para que todos sus subtítulos y textos salgan siempre con su estilo. Úsala con /mi-estilo o cuando pidan guardar su estilo, sus colores de marca, su fuente o su identidad visual.
---

# /mi-estilo

Guarda el estilo de marca (fuentes y colores) para que se aplique solo en todos los videos.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Qué hacer
1. Pregunta o saca el estilo de lo que la persona tenga: su logo, una captura de su feed, su manual de marca o una descripción ("rosado y elegante"). Mira las imágenes tú mismo y saca los colores en hex.
2. Propón (y muestra en una tabla corta para que la persona apruebe):
   - `fuenteTitulo`: títulos, ganchos y palabras grandes.
   - `fuente`: textos pequeños, etiquetas y tarjetas.
   - `fuenteSubtitulos` (opcional): si la pone, todos los estilos de subtítulos usan esa fuente. Si no, cada estilo usa la suya.
   - `acento`: color principal (cajas, botones, barras).
   - `sticker`: color de resaltado (la palabra que se dice, palabras clave).
   - `stickerTexto`: color del texto encima del resaltado (que contraste).
   - `texto` y `fondo`: texto oscuro y fondo claro de las tarjetas.
   Las fuentes salen del catálogo (`/fuentes`) o de un archivo propio.
3. Si la persona da un archivo de fuente propio, cópialo a `~/.claude/tipografia-converzzo/mis-fuentes/` y usa su ruta completa.
4. Escribe `~/.claude/tipografia-converzzo/mi-estilo.json`, por ejemplo:
```json
{"fuenteTitulo": "playfair", "fuente": "poppins", "fuenteSubtitulos": "poppins", "acento": "#C8507A", "sticker": "#F7C8D8", "stickerTexto": "#3A1020", "texto": "#2B2B2B", "fondo": "#FFF8F5"}
```
5. Si la persona tiene un video a mano, haz una foto de control con un `gancho` y `/sub-caja` para que vea cómo queda.

## Cómo funciona después
- Todos los comandos del plugin lo usan solos. Lo que pida la persona en un video concreto manda sobre lo guardado.
- Para un video sin su estilo: `"usar_mi_estilo": false` en el plan.
- Para cambiarlo: vuelve a correr `/mi-estilo`. Para borrarlo: elimina el archivo `mi-estilo.json` (confírmalo antes con la persona).
