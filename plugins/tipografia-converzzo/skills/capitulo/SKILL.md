---
name: capitulo
description: Pone un separador de sección (Parte 2, Paso 3, Error 1) con etiqueta de color y título, arriba de la cara o a pantalla completa. Úsala con /capitulo y el video, o cuando pidan dividir el video en partes, capítulos, pasos o secciones.
---

# /capitulo

Separador de sección: etiqueta de color ("PARTE 2") y título que entra deslizándose, arriba de la cara. En modo `pantalla` es una cortina de color a pantalla completa con el número gigante de fondo.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Cuando la persona cambia de tema o enumera ("lo segundo…", "error número 3…").
- Dura de 1,5 a 3 s. En modo `pantalla`, máximo 1,5 s para no perder a la persona.

## Capa
```json
{"efecto": "capitulo", "desde": 21.3, "hasta": 23.8, "etiqueta": "Paso 2", "titulo": "Limpia tu piel"}
```
Opciones: `etiqueta`, `titulo`, `modo` (`barra` por defecto o `pantalla`), `color`, `fondo_color` (modo pantalla), `fuente`, `y`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
