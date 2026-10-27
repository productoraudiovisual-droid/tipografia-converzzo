---
name: tipografia-converzzo
description: Aplica varios subtítulos y textos del plugin de tipografía de Converzzo a la vez en un solo render (16 estilos de subtítulos, títulos, citas, contadores, encuestas y texto animado), o muestra la lista. Úsala con /tipografia-converzzo o cuando pidan subtítulos y textos en un video o ver los estilos de tipografía.
---

# /tipografia-converzzo

Comando general del plugin de tipografía: aplica subtítulos y textos en el mismo video, en un solo render.

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cómo armar el plan
- Si la persona nombra lo que quiere ("subtítulos neón y un título detrás al inicio"), arma esas capas.
- Si solo dice "ponle subtítulos" o "textos", elige el estilo de subtítulos según su nicho (ver la tabla de GUIA.md) y, si el inicio lo pide, un `gancho` o un `titulo-detras`.
- Siempre muestra la tabla del plan (Segundo · Texto · Detalle) antes de renderizar.

## Lista
Si la pide, muéstrale los comandos en palabras simples, por grupos: subtítulos (16 estilos), textos en pantalla, texto animado y herramientas (`/fuentes`, `/mi-estilo`, `/srt`, `/traducir-subtitulos`).

## Actualizar
Los estilos nuevos llegan al actualizar el plugin en Personalizar → Plugins.
