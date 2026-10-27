---
name: sub-maquina
description: Subtítulos que se escriben letra por letra como máquina de escribir, en una caja oscura con cursor. Úsala con /sub-maquina y el video, o cuando pidan subtítulos estilo maquina.
---

# /sub-maquina

Subtítulos que se escriben letra por letra como máquina de escribir, en una caja oscura con cursor. Ideal para historias, tecnología, misterio, datos curiosos. Fuente por defecto: VT323.

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
{"efecto": "subtitulos", "desde": 0, "hasta": 45.2, "estilo": "maquina", "correcciones": {"wasap": "WhatsApp"}}
```
Opciones: `fuente` (cualquier fuente de `/fuentes` o un archivo .ttf/.otf), `color` (color de la palabra resaltada), `tamano`, `mayusculas` (true/false), `palabras_por_bloque`, `posicion` (`auto` debajo de la cara, `centro`, `arriba`) o `y` (0 a 1), `correcciones`, `idioma` ("es" por defecto), `frases` (subtítulos ya traducidos).

## Ojo
- Va bien con 3 o 4 palabras por bloque. Si la persona habla muy rápido, sube `palabras_por_bloque` a 5.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
