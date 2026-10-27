---
name: traducir-subtitulos
description: Traduce los subtítulos de un video a otro idioma (inglés, portugués u otro) y los pone en el video con cualquier estilo del plugin, además del archivo .srt traducido. Úsala con /traducir-subtitulos y el video, o cuando pidan subtítulos en inglés, en otro idioma o traducir el video.
---

# /traducir-subtitulos

Subtítulos traducidos, en el video y en .srt.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Qué hacer
1. Idioma: si la persona no lo dijo, pregúntalo. Estilo: si no lo dijo, usa `clasico` (o el de su `/mi-estilo`).
2. Saca las frases con sus tiempos. `--por-bloque` según el estilo: 2 para `impacto`, `detras` y `3d`; 5 para `minimal` y `burbuja`; 3 para los demás.
   `cd ~/.claude/tipografia-converzzo/motor && node srt.mjs <video> <carpeta>/original.srt --idioma es --por-bloque 3 --bloques <carpeta>/frases_es.json`
3. Traduce tú cada `texto` de `frases_es.json` y guarda `frases_<idioma>.json` con los mismos `desde` y `hasta`:
   - Traducción natural, como lo diría un nativo, no literal. Igual de corta que el original (si una frase queda muy larga, resúmela).
   - No traduzcas marcas, nombres propios ni @usuarios.
4. Escribe el .srt traducido: `node srt.mjs --frases <carpeta>/frases_<idioma>.json <video sin extensión>_<idioma>.srt`
5. Pon los subtítulos en el video con la capa (el contenido de `frases_<idioma>.json` va en `frases`):
```json
{"efecto": "subtitulos", "desde": 0, "hasta": 45.2, "estilo": "clasico", "frases": [{"desde": 0.4, "hasta": 1.4, "texto": "WhatsApp is looking"}]}
```
   y sigue el flujo de GUIA.md (fotos de control y render).
6. Entrega el video y el .srt traducido. Avisa en una línea que revise la traducción antes de publicar.

En estos subtítulos el resaltado avanza parejo dentro de cada frase (no palabra por palabra exacta, porque la voz sigue en el idioma original).
