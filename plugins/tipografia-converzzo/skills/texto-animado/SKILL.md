---
name: texto-animado
description: Anima un texto libre con 9 animaciones: máquina de escribir, deslizar, rebote, ola, desenfoque, máscara, contorno, glitch o tipografía cinética. Úsala con /texto-animado y el video, o cuando pidan animar un texto, kinetic typography o un texto con movimiento.
---

# /texto-animado

Cualquier texto con una animación de entrada a elegir. Debajo de la cara por defecto, o arriba o al centro.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Para frases propias que la persona quiere en pantalla (un mensaje, una promesa, un tip, una lista corta).
- Elige la animación según el tono: `maquina` (historias, tecnología), `deslizar` (limpio, negocios), `rebote` (divertido, niños, comida), `ola` (alegre, verano), `desenfoque` (premium, belleza), `mascara` (elegante, cine), `contorno` (moda, deporte), `glitch` (tecnología, gaming), `cinetica` (una palabra a la vez, mucha energía).
- Dura de 2 a 5 s.

## Capa
```json
{"efecto": "texto-animado", "desde": 5.0, "hasta": 8.0, "texto": "Envíos gratis a todo el país", "animacion": "deslizar"}
```
Opciones: `texto` (usa `/` para partir líneas), `animacion`, `fuente` (cada animación trae una por defecto), `color`, `acento` (segundo color), `tamano`, `mayusculas`, `posicion` (`auto`, `arriba`, `centro`) o `y`, `fondo` (false para quitar la caja en `maquina`).

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
