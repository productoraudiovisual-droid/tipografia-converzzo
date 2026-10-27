---
name: gancho
description: Pone un título grande en los primeros segundos del video para enganchar, palabra por palabra y con una palabra resaltada. Úsala con /gancho y el video, o cuando pidan un gancho, hook, título al inicio o texto para enganchar.
---

# /gancho

Título grande al inicio que aparece palabra por palabra, con una palabra resaltada en caja de color. Se ubica arriba de la cara (o abajo si no hay espacio).

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Usa la primera frase del video o una versión más corta e impactante (máximo unas 8 palabras). Si la persona da el texto, úsalo tal cual.
- `resaltar`: la palabra clave (un número, "gratis", "error", "nunca", el beneficio).
- `desde` = 0,1; `hasta` = cuando termina la primera frase (2 a 4 s).

## Capa
```json
{"efecto": "gancho", "desde": 0.1, "hasta": 2.9, "texto": "WhatsApp quiere cobrarte", "resaltar": "cobrarte"}
```
Opciones: `texto`, `resaltar` (una o varias palabras), `y` (0 a 1 para fijar la altura). La fuente sale de `estilo.fuenteTitulo`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
