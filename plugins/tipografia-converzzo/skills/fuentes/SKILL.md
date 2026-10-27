---
name: fuentes
description: Muestra la biblioteca de 40 fuentes gratuitas del plugin (impacto, modernas, elegantes, manuscritas, divertidas y retro) y ayuda a elegir una o a usar una fuente propia. Úsala con /fuentes o cuando pidan ver las fuentes, cambiar la letra o usar otra tipografía.
---

# /fuentes

Muestra el catálogo de fuentes y ayuda a elegir.

Parte del plugin gratuito de tipografía de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/tipografia-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Qué hacer
1. Muéstrale a la persona la imagen `~/.claude/tipografia-converzzo/catalogo-fuentes.png` (envíala como archivo). Están agrupadas en: Impacto, Modernas, Elegantes, Manuscritas, Divertidas y Retro y tech.
2. Si pide ayuda, recomienda según el nicho:
   - Belleza, moda, joyería: `playfair`, `bodoni`, `cormorant`, `great-vibes`, `italiana`.
   - Restaurantes y comida: `lilita-one`, `pacifico`, `chewy`, `caveat`, `fraunces`.
   - Ropa urbana y deporte: `anton`, `bebas-neue`, `league-gothic`, `barlow-condensed`, `permanent-marker`.
   - Negocios, educación y tecnología: `montserrat`, `inter`, `poppins`, `manrope`, `space-grotesk`, `sora`.
   - Niños y humor: `luckiest-guy`, `bangers`, `fredoka`, `bowlby-one`.
   - Gaming y retro: `press-start`, `vt323`, `orbitron`, `righteous`, `monoton` (solo títulos).
3. Para usarla:
   - En un texto o subtítulo: `"fuente": "anton"` en la capa.
   - En todos los textos de un video: `"estilo": {"fuente": "inter", "fuenteTitulo": "anton", "fuenteSubtitulos": "poppins"}`.
   - Para siempre: `/mi-estilo`.
4. **Fuente propia:** si la persona tiene el archivo de su marca (.ttf u .otf), úsalo con su ruta: `"fuente": "/ruta/MiFuente.otf"`. El motor la copia solo. Recuérdale en una línea que debe tener licencia para usarla en video.

Todas las fuentes del catálogo son gratuitas con licencia OFL o Apache (uso comercial libre).
