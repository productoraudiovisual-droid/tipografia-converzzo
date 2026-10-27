---
name: cuenta-regresiva
description: Pone una cuenta regresiva: 3, 2, 1 grande con un anillo que se vacía, o un reloj de oferta (horas, minutos, segundos) que baja en vivo. Úsala con /cuenta-regresiva y el video, o cuando pidan cuenta regresiva, contador, temporizador o reloj de oferta.
---

# /cuenta-regresiva

Dos modos: `numeros` (3, 2, 1 gigante con anillo y sonido de tic) para crear expectativa antes de un revelado, y `reloj` (tarjetas de horas, minutos y segundos que bajan) para ofertas con tiempo límite.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- `numeros`: justo antes de mostrar un resultado, un producto o un antes y después. Cada número dura lo mismo (reparte el tramo).
- `reloj`: cuando la persona menciona que la oferta termina pronto. El tiempo de inicio lo da la persona; nunca lo inventes.

## Capa
```json
{"efecto": "cuenta-regresiva", "desde": 9.0, "hasta": 12.0, "inicio": 3, "final": "¡YA!"}
```
Opciones: `modo` (`numeros` por defecto o `reloj`), `inicio` (desde qué número cuenta), `final` (texto al terminar, opcional), `tiempo` (modo reloj, "HH:MM:SS"), `texto` (encima del reloj), `color`, `oscurecer` (false para no oscurecer el video), `fuente`, `y`.

Se puede combinar con cualquier otro texto del plugin en el mismo plan (ver GUIA.md).
