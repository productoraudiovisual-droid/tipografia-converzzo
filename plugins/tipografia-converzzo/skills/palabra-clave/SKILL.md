---
name: palabra-clave
description: Pone una sola palabra enorme que golpea la pantalla para remarcar una idea (GRATIS, ERROR, NUEVO). Úsala con /palabra-clave y el video, o cuando pidan una palabra grande, remarcar una palabra o texto de impacto.
---

# /palabra-clave

Una sola palabra gigante que entra de golpe con un temblor corto. Debajo de la cara o a pantalla completa con fondo de color.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- En la palabra más fuerte del video, justo cuando se dice (`desde` = inicio de la palabra − 0,05 s). Dura de 0,8 a 2 s.
- Una o dos veces por video como máximo; si se repite pierde fuerza.

## Capa
```json
{"efecto": "palabra-clave", "desde": 7.95, "hasta": 9.2, "texto": "gratis"}
```
Opciones: `texto`, `pantalla_completa` (true = fondo de color que tapa el video, usar menos de 1 s), `fondo_color`, `color`, `fuente` (anton por defecto), `tamano`, `posicion` / `y`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
