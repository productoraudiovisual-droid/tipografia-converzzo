# Guía para Claude: cómo aplicar la tipografía de Converzzo

Todos los comandos del plugin siguen este flujo. La persona normalmente no es técnica: háblale en español sencillo, con tuteo y en frases cortas. Haz tú todo el trabajo y nunca le pidas que corra comandos.

## 0. Rutas
- `PACK` = `~/.claude/tipografia-converzzo` (lo deja listo `preparar.sh` del plugin). `MOTOR` = `PACK/motor`.
- `PY` = `MOTOR/.venv/bin/python` (en Windows `MOTOR/.venv/Scripts/python.exe`).
- Los avisos que salen al cerrar los scripts de Python (`Exception ignored…`, `distutils…`, `inference_feedback_manager`) son inofensivos.

## 1. El video
- Usa el video que la persona adjuntó o nombró. Si tiene una carpeta "Material crudo", búscalo ahí. Si no hay video, pídelo.
- Nunca modifiques el original: todo sale como un archivo nuevo.
- Sirve vertical u horizontal. La salida siempre es 1080×1920.

## 2. Encuentra los momentos
- Si la persona dice el momento ("en la palabra dinero", "en el segundo 5"), úsalo.
- Si no, transcribe: `PY MOTOR/scripts/transcribir.py <video> <carpeta>/transcripcion.json es` (imprime el texto con tiempos). Elige el momento según lo que diga cada comando.
- Cada palabra trae `start` y `end` en segundos. Para que un texto caiga justo en una palabra, usa `desde` = `start` de esa palabra menos 0,05 s.
- Los subtítulos no necesitan este paso: el motor transcribe solo. Pero revisa la transcripción para llenar `correcciones` (marcas y nombres mal escritos).

## 3. Arma el plan (uno o varios textos)
Escribe `plan.json` junto al video. Cada texto es una "capa" con `efecto`, `desde` y `hasta` en segundos, más sus opciones:
```json
{
  "capas": [
    {"efecto": "titulo-detras", "desde": 0.1, "hasta": 2.6, "texto": "Glow Skin"},
    {"efecto": "subtitulos", "desde": 2.6, "hasta": 41.3, "estilo": "elegante", "correcciones": {"glouskin": "Glow Skin"}},
    {"efecto": "pregunta", "desde": 38.0, "hasta": 41.3, "pregunta": "¿Cuál pruebas primero?", "opciones": ["Sérum", "Crema"]}
  ],
  "estilo": {},
  "sonido": true
}
```
**Antes de renderizar, muestra el plan en una tabla corta** (Segundo · Texto · Detalle) y espera el visto bueno. Si la persona ya lo dejó todo claro en su mensaje, puedes renderizar directo.

## 4. Fotos de control
`cd MOTOR && node render.mjs <video> <plan.json> <carpeta>/control.png --still 3.1,9.5`
Usa un momento en que se esté hablando (los subtítulos solo aparecen mientras hay voz). Mira las fotos tú mismo: la cara no puede quedar tapada (salvo en los estilos "detrás", donde la persona va delante del texto), los textos deben leerse completos y nada puede salirse del borde. Ajusta (`tamano`, `y`, `palabras_por_bloque`) y repite si hace falta.

## 5. Render final
`cd MOTOR && node render.mjs <video> <plan.json> <salida>.mp4`
- Sale en 1080×1920 con el audio original a -14 LUFS y sonidos sutiles en algunos textos. Para quitarlos: `"sonido": false`.
- Guárdalo como `<nombre>_texto.mp4` en la carpeta "Resultados" si existe, o junto al original. Entrega el archivo y recuerda en una línea que lo revise antes de publicar.
- Para hacer cambios después ("más grande", "otro color", "cambia la fuente"), edita el plan y vuelve a renderizar.

## Subtítulos (un comando por estilo)
Todos usan `"efecto": "subtitulos"` y cambian solo el `estilo`:

| Comando | `estilo` | Se ve | Ideal para |
|---|---|---|---|
| `/sub-clasico` | `clasico` | Blanco con borde, palabra dicha en amarillo | Cualquier nicho |
| `/sub-caja` | `caja` | Palabra dicha dentro de una caja de color | Educación, negocios |
| `/sub-pop` | `pop` | Cada palabra aparece con un salto | Humor, tendencias |
| `/sub-karaoke` | `karaoke` | Se pintan a medida que se dicen | Tutoriales |
| `/sub-impacto` | `impacto` | 1 o 2 palabras gigantes | Ventas, motivación |
| `/sub-minimal` | `minimal` | Fina, sin borde, discreta | Marcas premium, belleza |
| `/sub-maquina` | `maquina` | Letra por letra con cursor, en caja oscura | Historias, tecnología |
| `/sub-neon` | `neon` | Brillo de neón | Noche, música, gaming |
| `/sub-resaltador` | `resaltador` | Marcador detrás de la palabra | Clases, tips |
| `/sub-burbuja` | `burbuja` | Globo de chat | Atención al cliente, cercanía |
| `/sub-detras` | `detras` | Gigantes detrás de la persona | Frases cortas de impacto |
| `/sub-emoji` | `emoji` | Clásico + emoji en palabras clave | Comida, ventas, redes |
| `/sub-elegante` | `elegante` | Serif con cursiva dorada | Moda, joyería, gastronomía |
| `/sub-3d` | `3d` | Letras gruesas con volumen | Niños, comida rápida |
| `/sub-retro` | `retro` | Pixel de videojuego | Gaming, nostalgia |
| `/sub-manuscrito` | `manuscrito` | Letra a mano con subrayado | Recetas, notas, diarios |

Opciones comunes: `fuente`, `color` (resaltado), `tamano`, `mayusculas`, `palabras_por_bloque`, `posicion` (`auto`, `centro`, `arriba`) o `y`, `correcciones`, `idioma`, `frases` (traducidos, ver `/traducir-subtitulos`). En `emoji`: `emojis` (`{"palabra": "🔥"}`, solo de `MOTOR/public/emoji/lista.json`).

## Textos en pantalla
| `efecto` | Qué hace | Opciones |
|---|---|---|
| `gancho` | Título grande al inicio, palabra por palabra | `texto`, `resaltar`, `y` |
| `cartel-nombre` | Nombre y cargo (lower third) | `nombre`, `cargo`, `usuario`, `y` |
| `dato` | Número que sube contando | `valor`, `etiqueta`, `desde_valor`, `y` |
| `titulo-detras` | Título gigante detrás de la persona | `texto` (`/` parte líneas), `fuente`, `color`, `linea_color`, `tamano`, `y` |
| `cita` | Frase con comillas y autor | `texto`, `autor`, `resaltar`, `color`, `fuente`, `tamano` |
| `palabra-clave` | Una palabra enorme de golpe | `texto`, `pantalla_completa`, `fondo_color`, `color`, `fuente` |
| `capitulo` | Separador "Parte 2" | `etiqueta`, `titulo`, `modo` (`barra`/`pantalla`), `color` |
| `cuenta-regresiva` | 3-2-1 o reloj de oferta | `modo` (`numeros`/`reloj`), `inicio`, `final`, `tiempo`, `texto` |
| `pregunta` | Encuesta para comentar | `pregunta`, `opciones`, `porcentajes`, `elegida` |
| `texto-animado` | Texto libre animado | `texto`, `animacion` (maquina, deslizar, rebote, ola, desenfoque, mascara, contorno, glitch, cinetica), `fuente`, `color`, `acento`, `tamano`, `posicion` |

Todos aceptan `posicion` (`arriba`, `centro`, `abajo`) o `y` (0 a 1) para fijar la altura, y `fuente` para cambiar la letra.

## Fuentes y estilo
- Biblioteca: 40 fuentes gratuitas en `MOTOR/public/fonts`, catálogo en `PACK/catalogo-fuentes.png` (ver `/fuentes`). Se piden por id (`"anton"`), nombre (`"Bebas Neue"`) o archivo propio (`"/ruta/MiFuente.otf"`).
- `estilo` del plan: `fuente`, `fuenteTitulo`, `fuenteSubtitulos`, `acento`, `sticker`, `stickerTexto`, `texto`, `fondo`, `suave`.
- Si existe `PACK/mi-estilo.json` (lo crea `/mi-estilo`), se aplica solo a todos los videos. El `estilo` del plan manda sobre él. `"usar_mi_estilo": false` lo desactiva.
- Si la persona describe un estilo ("rosado y elegante") o pasa referencias (logo, feed), saca de ahí los colores en hex.

## Reglas para combinar
- Subtítulos y textos grandes no deben pisarse: si hay `gancho`, `titulo-detras`, `cita` o `palabra-clave`, corta los subtítulos en ese tramo (usa dos capas de subtítulos: antes y después).
- Un solo estilo de subtítulos por video (salvo que la persona pida mezclar).
- Los textos nunca tapan la cara (excepto los estilos "detrás", donde la persona queda por delante).
- `sub-detras` y `titulo-detras` recortan a la persona: no los pongas en el mismo tramo que zooms u otros efectos de cámara, y úsalos en tramos cortos (tardan más en renderizar).
- Nunca inventes datos: cifras, nombres, cargos, testimonios, porcentajes y tiempos de oferta solo si la persona los dice o los escribe.
- Efectos de video, zooms y motion graphics están en el plugin hermano **efectos-converzzo** (otro GitHub). Si la persona tiene los dos, primero se aplican los efectos y al final este plugin, sobre el video que salió del primero.

## Tiempos de render
En un computador normal: subtítulos y textos, más o menos lo que dura el video. Los estilos "detrás" tardan más porque recortan a la persona cuadro por cuadro.
