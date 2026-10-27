---
name: srt
description: Exporta los subtítulos del video como archivo .srt (para subirlo a YouTube, TikTok, Facebook o editarlo en CapCut o Premiere), con la transcripción revisada. Úsala con /srt y el video, o cuando pidan el archivo de subtítulos, srt, captions o la transcripción con tiempos.
---

# /srt

Saca el archivo .srt de un video (sin renderizar nada).

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Qué hacer
1. Corre: `cd ~/.claude/tipografia-converzzo/motor && node srt.mjs <video> <salida>.srt --idioma es`
   - `--por-bloque 7`: palabras máximas por subtítulo (7 por defecto; usa 3 o 4 para videos verticales con subtítulos cortos).
   - `--correcciones '{"wasap": "WhatsApp"}'`: arregla marcas o nombres mal transcritos.
2. Abre el .srt, revísalo y corrige errores evidentes de transcripción (nombres, marcas, cifras) antes de entregar. Puedes editarlo a mano.
3. Guárdalo junto al video, con el mismo nombre (`video.srt`), y entrégalo.
4. Recuérdale en una línea dónde subirlo: YouTube (Subtítulos → Subir archivo), TikTok y Facebook (subtítulos o captions al publicar), CapCut o Premiere (importar subtítulos).

Para el .srt en otro idioma usa `/traducir-subtitulos`.
