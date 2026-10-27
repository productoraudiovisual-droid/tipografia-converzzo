# Tipografía y subtítulos · Converzzo

Subtítulos y textos animados para tus videos verticales (Reels, TikTok, Shorts) que Claude aplica por ti con un solo comando: 16 estilos de subtítulos, títulos, citas, contadores, encuestas, texto animado y 40 fuentes gratuitas. Gratis, por [@converzzo](https://instagram.com/converzzo). ¿Buscas zooms, transiciones y motion graphics? Están en el plugin hermano **efectos-converzzo**.

## Cómo instalarlo
**En la app de Claude (Cowork o chat):**
1. Ve a Personalizar → **Plugins** → Agregar → **Agregar marketplace**.
2. Escribe `productoraudiovisual-droid/tipografia-converzzo`.
3. En la pestaña **Descubrir**, abre *tipografia-converzzo* y dale **Agregar**.

**En Claude Code:**
```
/plugin marketplace add productoraudiovisual-droid/tipografia-converzzo
/plugin install tipografia-converzzo@tipografia-converzzo
```

Listo: escribe `/` y verás todos los comandos. La primera vez que uses uno, Claude prepara el motor solo (1 a 3 minutos). Después va directo.

## Cómo usarlo
Adjunta tu video y escribe el comando, por ejemplo:

> /sub-elegante en todo el video

Claude escucha el video, te muestra el plan para que lo apruebes y te entrega el video listo en 1080×1920.

## Subtítulos (un comando por estilo)
| Comando | Cómo se ve |
|---|---|
| `/sub-clasico` | Blanco con borde y la palabra que se dice en amarillo |
| `/sub-caja` | La palabra que se dice va dentro de una caja de color |
| `/sub-pop` | Cada palabra aparece con un salto |
| `/sub-karaoke` | Las palabras se pintan a medida que se dicen |
| `/sub-impacto` | 1 o 2 palabras gigantes, la clave en otro color |
| `/sub-minimal` | Letra fina, sin borde, discreta abajo |
| `/sub-maquina` | Se escribe letra por letra, como máquina de escribir |
| `/sub-neon` | Letras con brillo de neón |
| `/sub-resaltador` | Un marcador pasa detrás de la palabra clave |
| `/sub-burbuja` | Dentro de un globo de chat |
| `/sub-detras` | El texto queda detrás de ti (sin pantalla verde) |
| `/sub-emoji` | Con un emoji que acompaña las palabras clave |
| `/sub-elegante` | Serif con la palabra clave en cursiva dorada |
| `/sub-3d` | Letras gruesas con volumen |
| `/sub-retro` | Pixel de videojuego |
| `/sub-manuscrito` | Letra a mano con subrayado dibujado |

## Textos en pantalla
| Comando | Qué hace |
|---|---|
| `/gancho` | Título grande al inicio para enganchar |
| `/cartel-nombre` | Tu nombre y cargo (lower third) |
| `/dato` | Un número que sube contando ("+30.000 alumnos") |
| `/titulo-detras` | Título gigante detrás de ti |
| `/cita` | Frase destacada con comillas y autor (testimonios, reseñas) |
| `/palabra-clave` | Una sola palabra enorme que golpea la pantalla |
| `/capitulo` | Separador de sección ("Parte 2", "Paso 3") |
| `/cuenta-regresiva` | 3, 2, 1 o reloj de oferta que baja en vivo |
| `/pregunta` | Encuesta para que te comenten |

## Texto animado
`/texto-animado`: cualquier texto con 9 animaciones: máquina de escribir, deslizar, rebote, ola, desenfoque, máscara, contorno, glitch y tipografía cinética.

## Herramientas
| Comando | Qué hace |
|---|---|
| `/fuentes` | Muestra las 40 fuentes gratuitas y te ayuda a elegir (o usar la tuya) |
| `/mi-estilo` | Guarda tus fuentes y colores de marca para todos tus videos |
| `/srt` | Exporta los subtítulos como archivo .srt |
| `/traducir-subtitulos` | Subtítulos en otro idioma, en el video y en .srt |
| `/tipografia-converzzo` | Varios textos a la vez en un solo render |

## Qué necesitas
- Un plan de pago de Claude (Pro, Max, Team o Enterprise).
- Recomendado: Cowork o Claude Code, porque el video se procesa en tu computador.
- Claude instala solo lo que haga falta (ffmpeg, Node.js, Python). No hay costos extra ni cuentas nuevas.

## Para desarrolladores
- `.claude-plugin/marketplace.json`: el marketplace (este repo).
- `plugins/tipografia-converzzo/`: el plugin.
  - `skills/<comando>/SKILL.md`: los comandos.
  - `preparar.sh`: copia el motor a `~/.claude/tipografia-converzzo` e instala dependencias la primera vez o cuando cambia `VERSION`.
  - `motor/`: proyecto Remotion con una sola composición (`Editar`) que aplica capas. Subtítulos en `motor/src/efectos/subtitulos.tsx`, textos en `textos.tsx` y `animado.tsx`, catálogo de fuentes en `motor/src/lib/catalogo.ts`.
  - `motor/render.mjs <video> <plan.json> <salida.mp4> [--still 1.5,3]`: render en un paso.
  - `motor/srt.mjs`: exporta .srt y frases para traducir.
  - `GUIA.md`: el flujo que siguen todos los comandos.
- Para publicar una versión nueva: sube `VERSION` y `version` en `plugin.json` y `marketplace.json`.

Licencia MIT. Ver `plugins/tipografia-converzzo/NOTICE.md` para fuentes, emojis y modelos de terceros.
