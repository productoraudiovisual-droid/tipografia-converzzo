// Aplica un plan de efectos (uno o varios a la vez) sobre un video, en un solo render.
// Uso: node render.mjs <video> <plan.json> <salida.mp4> [--still 1.5,3]
//  - plan.json: { "capas": [ { "efecto": "zoom-in", "desde": 2.1, "hasta": 3.0 }, ... ], "estilo": {...}, "sonido": true }
//  - Detecta la cara y recorta a la persona automáticamente cuando un efecto lo necesita.
//  - Con --still solo saca fotos de control (rápido) en esos segundos.
//  - El video final sale en 1080x1920 con el audio original a -14 LUFS.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EFECTOS_TIEMPO, filtro, mapear, piezas, remapearPlan } from "./tiempo.mjs";

const MOTOR = path.dirname(fileURLToPath(import.meta.url));
const [video, planFile, salida, ...resto] = process.argv.slice(2);
if (!video || !planFile || !salida) {
  console.log("Uso: node render.mjs <video> <plan.json> <salida.mp4> [--still 1.5,3]");
  process.exit(1);
}
let still = resto[0] === "--still" ? resto[1].split(",").map(Number) : null;
const PY = fs.existsSync(path.join(MOTOR, ".venv/bin/python")) ? path.join(MOTOR, ".venv/bin/python") : path.join(MOTOR, ".venv/Scripts/python.exe");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"], cwd: MOTOR, shell: process.platform === "win32", maxBuffer: 1 << 26 }).toString();
const NECESITAN_RECORTE = ["dolly-zoom", "color-pop", "fondo-borroso", "cambiar-fondo", "collage-halftone"];
const CONOCIDOS = [...EFECTOS_TIEMPO, "cortar-silencios", "subtitulos", "limpiar-voz", "musica", "zoom-in", "zoom-suave", "zoom-out", "sacudida", "dolly-zoom", "reencuadre", "barrido", "zoom-transicion", "look", "color-auto", "cambiar-fondo", "color-pop", "fondo-borroso", "grano", "flash", "glitch", "precio-pop", "antes-despues", "cta-whatsapp", "paso-a-paso", "comparativo", "ficha", "ubicacion", "gancho", "cartel-nombre", "dato", "ingredientes", "tallas-colores", "grafica-datos", "logo-sting", "tier-list", "mockup-interfaz", "widgets-vidrio", "collage-halftone", "carrusel-video", "color-referencia", "look-pelicula", "efectos-sonido",
  "titulo-detras", "cita", "palabra-clave", "capitulo", "cuenta-regresiva", "pregunta", "texto-animado"];
const necesitaRecorte = (c) => NECESITAN_RECORTE.includes(c.efecto) || c.efecto === "titulo-detras" || (c.efecto === "subtitulos" && c.estilo === "detras");

// 1. datos del video
const datos = (archivo) => {
  const pr = JSON.parse(run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,r_frame_rate,width,height:stream_side_data=rotation:format=duration", "-of", "json", archivo]));
  const st = pr.streams.find((x) => x.codec_type === "video");
  const [a, b] = st.r_frame_rate.split("/").map(Number);
  const fps = Math.min(60, Math.round((a / (b || 1)) * 1000) / 1000);
  const seg = parseFloat(pr.format.duration);
  const girado = Math.abs(st.side_data_list?.[0]?.rotation ?? 0) === 90;
  const [ancho, alto] = girado ? [st.height, st.width] : [st.width, st.height];
  return { fps, seg, ancho, alto, audio: pr.streams.some((x) => x.codec_type === "audio") };
};
let info = datos(path.resolve(video));

let plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
// mi-estilo: fuentes y colores de marca guardados con /mi-estilo (el plan siempre manda)
const MI_ESTILO = path.join(path.dirname(MOTOR), "mi-estilo.json");
if (fs.existsSync(MI_ESTILO) && plan.usar_mi_estilo !== false) {
  try { plan.estilo = { ...JSON.parse(fs.readFileSync(MI_ESTILO, "utf8")), ...(plan.estilo ?? {}) }; console.log("Usando mi-estilo."); } catch { console.warn("mi-estilo.json no se pudo leer; sigo sin él."); }
}
// fuentes propias (.ttf/.otf): se copian a public/fonts y se usan por su nombre de archivo
const fuentePropia = (v) => {
  if (typeof v !== "string" || !/\.(ttf|otf)$/i.test(v)) return v;
  const o = path.isAbsolute(v) ? v : path.resolve(path.dirname(path.resolve(planFile)), v);
  if (!fs.existsSync(o)) return path.basename(v);
  const nom = path.basename(o).replace(/[^\w.-]/g, "_");
  fs.copyFileSync(o, path.join(MOTOR, "public", "fonts", nom));
  return nom;
};
if (plan.estilo) for (const k of ["fuente", "fuenteTitulo", "fuenteSubtitulos"]) plan.estilo[k] = fuentePropia(plan.estilo[k]);
for (const c of plan.capas ?? []) if (c.fuente) c.fuente = fuentePropia(c.fuente);
for (const c of plan.capas ?? []) {
  if (!CONOCIDOS.includes(c.efecto)) { console.error(`Efecto desconocido: ${c.efecto}. Disponibles: ${CONOCIDOS.join(", ")}`); process.exit(1); }
  if (!(c.hasta > c.desde)) { console.error(`La capa ${c.efecto} necesita "desde" menor que "hasta".`); process.exit(1); }
}
if ((plan.capas ?? []).some((c) => c.efecto === "reencuadre") && (plan.capas ?? []).some((c) => c.efecto === "dolly-zoom"))
  console.warn("Aviso: dolly-zoom no se combina con reencuadre en el mismo tramo; úsalos en momentos distintos.");

// 2. copia temporal dentro de public/
const id = "_in_" + Date.now();
const dirIn = path.join(MOTOR, "public", id);
fs.mkdirSync(dirIn, { recursive: true });

try {
  let origen = path.resolve(video);
  const capa = (e) => (plan.capas ?? []).find((c) => c.efecto === e);

  // limpiar-voz: reduce ruido de fondo, quita retumbe y da presencia a la voz (todo el video)
  const lv = capa("limpiar-voz");
  if (lv && info.audio) {
    const nr = { suave: 8, media: 14, fuerte: 22 }[lv.intensidad] ?? 14;
    console.log("Limpiando la voz...");
    const limpio = path.join(dirIn, "limpio.mp4");
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", origen, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy",
      "-af", `highpass=f=80,afftdn=nr=${nr}:nf=-42:tn=1,deesser=i=0.35,acompressor=threshold=-20dB:ratio=3:attack=10:release=160:makeup=2,equalizer=f=3500:t=q:w=1.2:g=2`,
      "-c:a", "aac", "-b:a", "256k", limpio]);
    origen = limpio;
  }

  // color-referencia: copia el color de una imagen de referencia al video (LUT 3D aplicada antes de todo)
  const cr = capa("color-referencia");
  if (cr && typeof cr.referencia_archivo === "string") {
    const ref = path.resolve(path.dirname(path.resolve(planFile)), cr.referencia_archivo);
    if (!fs.existsSync(ref)) { console.error(`No encuentro la referencia ${cr.referencia_archivo}.`); process.exit(1); }
    const lut = path.join(dirIn, "referencia.cube");
    console.log(run(PY, [path.join(MOTOR, "scripts/lut_referencia.py"), origen, ref, lut, String(cr.intensidad ?? 0.75)]).trim());
    const conColor = path.join(dirIn, "color.mp4");
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", origen, "-vf", `lut3d=${lut.replace(/\\/g, "/").replace(/:/g, "\\:")}`, "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-c:a", "copy", conColor]);
    origen = conColor;
  }

  // look-pelicula: color de cine, halo en las luces, grano y viñeta con ffmpeg (mucho más rápido que en el navegador)
  const lp = capa("look-pelicula");
  if (lp) {
    const k = Math.max(0, Math.min(1, Number(lp.intensidad ?? 1)));
    const en = `enable='between(t,${lp.desde},${lp.hasta})'`;
    const q = (x) => x.toFixed(3);
    const vf = [
      `format=yuv420p,split=2[a0][b]`,
      `[a0]format=gbrp[a]`,
      `[b]lutyuv=y='if(gt(val,205),val,16)':u=128:v=128,format=gbrp,gblur=sigma=22,colorchannelmixer=rr=1:gg=0.4:bb=0.18[h]`,
      `[a][h]blend=all_mode=screen:all_opacity=${q(0.38 * k)}:${en}[m]`,
      `[m]curves=r='0/${q(0.025 * k)} 0.5/${q(0.5 - 0.02 * k)} 1/${q(1 - 0.02 * k)}':g='0/${q(0.035 * k)} 0.5/0.5 1/${q(1 - 0.03 * k)}':b='0/${q(0.055 * k)} 0.5/${q(0.5 - 0.03 * k)} 1/${q(1 - 0.09 * k)}':${en}`,
      `eq=contrast=${q(1 + 0.1 * k)}:saturation=${q(1 - 0.12 * k)}:${en}`,
      `noise=alls=${Math.round(9 * k)}:allf=t:${en}`,
      `vignette=angle=${q(0.55 * k + 0.05)}:${en}`,
      `format=yuv420p`,
    ].join(";").replace(/;(?=curves|eq|noise|vignette|format)/g, ",");
    const peli = path.join(dirIn, "pelicula.mp4");
    console.log("Aplicando look de película...");
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", origen, "-filter_complex", vf, "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-c:a", "copy", peli]);
    origen = peli;
  }

  // transcripción del original (una sola vez): la usan cortar-silencios y los subtítulos
  const cs = capa("cortar-silencios");
  const subsSin = (plan.capas ?? []).filter((c) => c.efecto === "subtitulos" && !Array.isArray(c.palabras) && !Array.isArray(c.frases));
  let palabras = null;
  if ((cs || subsSin.length) && info.audio) {
    console.log("Transcribiendo...");
    const tj = path.join(dirIn, "palabras.json");
    run(PY, [path.join(MOTOR, "scripts/transcribir.py"), origen, tj, String((subsSin[0] ?? cs).idioma ?? "es")]);
    palabras = JSON.parse(fs.readFileSync(tj, "utf8"));
    subsSin.forEach((c) => { c.palabras = palabras; });   // en tiempo del original: se ajustan solas si cambia la duración
  }

  // cortar-silencios: quita las pausas largas entre palabras (y el silencio del inicio y del final)
  let cortes = [];
  if (cs && palabras && palabras.length) {
    const umbral = Math.max(0.2, Number(cs.umbral ?? 0.45)), margen = Number(cs.margen ?? 0.12);
    const huecos = [[0, palabras[0].start], ...palabras.slice(1).map((w, i) => [palabras[i].end, w.start]), [palabras[palabras.length - 1].end, info.seg]];
    huecos.forEach(([a, b], i) => {
      if (b - a < umbral) return;
      const ca = i === 0 ? 0 : a + margen, cb = i === huecos.length - 1 ? info.seg : b - margen;
      if (cb - ca >= 0.15) cortes.push([ca, cb]);
    });
    console.log(`cortar-silencios: ${cortes.length} pausas (${cortes.reduce((n, [a, b]) => n + b - a, 0).toFixed(1)} s menos)`);
  } else if (cs && info.audio) {
    // sin palabras (video sin voz clara): por nivel de audio
    const umbral = Math.max(0.2, Number(cs.umbral ?? 0.45)), margen = Number(cs.margen ?? 0.12), ruido = Number(cs.ruido_db ?? -38);
    const r = spawnSync("ffmpeg", ["-hide_banner", "-i", origen, "-map", "0:a:0", "-af", `silencedetect=noise=${ruido}dB:d=${umbral}`, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
    const ini = [...r.stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
    const fin = [...r.stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
    ini.forEach((a, i) => {
      const b = fin[i] ?? info.seg;
      const ca = a <= 0.05 ? 0 : a + margen, cb = b >= info.seg - 0.05 ? info.seg : b - margen;
      if (cb - ca >= 0.15) cortes.push([ca, cb]);
    });
    console.log(`cortar-silencios: ${cortes.length} pausas (${cortes.reduce((n, [a, b]) => n + b - a, 0).toFixed(1)} s menos)`);
  }

  // efectos de tiempo: se arma primero un video nuevo con las velocidades cambiadas
  const pz = piezas(plan.capas ?? [], info.seg, cortes);
  if (pz.hayTiempo) {
    console.log("Ajustando tiempos (silencios, cámara lenta, congelar, rebobinar)...");
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", origen, "-filter_complex", filtro(pz.piezas, Math.round(info.fps), info.audio), "-map", "[vout]", "-map", "[aout]",
      "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-c:a", "aac", "-b:a", "256k", path.join(dirIn, "video.mp4")]);
    plan = remapearPlan(plan, pz.piezas);
    // las fotos de control también se piden en tiempo del video original
    if (still) for (let i = 0; i < still.length; i++) {
      const pausa = pz.piezas.find((p) => p.tipo === "congelar" && Math.abs(p.a - still[i]) < 0.05);
      still[i] = Math.round((pausa ? pausa.inicio + Math.min(0.9, pausa.d / 2) : mapear(still[i], pz.piezas)) * 100) / 100;
    }
    info = datos(path.join(dirIn, "video.mp4"));
  } else {
    fs.copyFileSync(origen, path.join(dirIn, "video.mp4"));
  }
  const fuente = path.join(dirIn, "video.mp4");
  // archivos que traen algunas capas (por ejemplo antes_archivo / despues_archivo): se copian junto al video
  (plan.capas ?? []).forEach((c, i) => {
    for (const k of Object.keys(c)) {
      if (k.endsWith("_archivos") && Array.isArray(c[k])) {   // listas de archivos (por ejemplo imagenes_archivos del carrusel)
        c[k] = c[k].map((rel, j) => {
          const o = path.resolve(path.dirname(path.resolve(planFile)), String(rel));
          if (!fs.existsSync(o)) { console.error(`No encuentro el archivo ${rel} (${k} de ${c.efecto}).`); process.exit(1); }
          const nom = `capa${i}_${k}_${j}${path.extname(o).toLowerCase()}`;
          fs.copyFileSync(o, path.join(dirIn, nom));
          return `${id}/${nom}`;
        });
        continue;
      }
      if (!k.endsWith("_archivo") || typeof c[k] !== "string" || k === "referencia_archivo") continue;
      const origen = path.resolve(path.dirname(path.resolve(planFile)), c[k]);
      if (!fs.existsSync(origen)) { console.error(`No encuentro el archivo ${c[k]} (${k} de ${c.efecto}).`); process.exit(1); }
      const nombre = `capa${i}_${k}${path.extname(origen).toLowerCase()}`;
      fs.copyFileSync(origen, path.join(dirIn, nombre));
      c[k] = `${id}/${nombre}`;
    }
  });
  if (!plan.caras) {
    const carasJson = path.join(dirIn, "caras.json");
    run(PY, [path.join(MOTOR, "scripts/caras.py"), fuente, carasJson]);
    plan.caras = JSON.parse(fs.readFileSync(carasJson, "utf8"));
  }
  // color-auto: mide el color del tramo y guarda la corrección
  (plan.capas ?? []).forEach((c) => {
    if (c.efecto !== "color-auto" || c._ajuste) return;
    c._ajuste = JSON.parse(run(PY, [path.join(MOTOR, "scripts/color.py"), fuente, String(c.desde), String(c.hasta)]).trim().split("\n").pop());
    console.log("color-auto:", JSON.stringify(c._ajuste));
  });
  (plan.capas ?? []).forEach((c, i) => {
    if (!necesitaRecorte(c)) return;
    const dir = path.join(dirIn, `recorte_${i}`);
    run(PY, [path.join(MOTOR, "scripts/recorte.py"), fuente, String(c.desde), String(c.hasta), String(info.fps), dir, ...(c.efecto === "collage-halftone" ? ["collage"] : [])]);
    c._recorte = `${id}/recorte_${i}`;
  });
  const fps = info.fps, duracion = Math.ceil(info.seg * fps);
  Object.assign(plan, { video: `${id}/video.mp4`, fps, duracion, ancho: info.ancho, alto: info.alto });
  const tmpProps = path.join(os.tmpdir(), id + "_plan.json");
  fs.writeFileSync(tmpProps, JSON.stringify(plan));

  if (still) {
    for (const s of still) {
      const out = salida.replace(/\.(png|mp4)$/i, "") + `_${s}.png`;
      run(npx, ["remotion", "still", "src/index.ts", "Editar", path.resolve(out), `--frame=${Math.min(duracion - 1, Math.round(s * fps))}`, `--props=${tmpProps}`, "--log=error"]);
      console.log("foto:", out);
    }
  } else {
    const crudo = path.join(os.tmpdir(), id + "_render.mp4");
    run(npx, ["remotion", "render", "src/index.ts", "Editar", crudo, `--props=${tmpProps}`, "--crf=17", "--log=error", `--concurrency=${Math.max(1, Math.floor(os.cpus().length / 2))}`]);
    const mu = capa("musica");
    if (mu && typeof mu.musica_archivo === "string") {
      // música de fondo que baja sola cuando hay voz (ducking) + audio final a -14 LUFS
      const a = Math.max(0, mu.desde), b = Math.min(info.seg, mu.hasta), vol = Number(mu.volumen ?? 0.22);
      const fi = Math.min(1.5, (b - a) / 4), fo = Math.min(2.5, (b - a) / 3);
      const duck = mu.bajar_con_voz === false ? "[m]anull[md]" : "[m][key]sidechaincompress=threshold=0.025:ratio=10:attack=15:release=380:makeup=1[md]";
      run("ffmpeg", ["-y", "-loglevel", "error", "-i", crudo, "-stream_loop", "-1", "-i", path.join(MOTOR, "public", mu.musica_archivo),
        "-filter_complex", `[0:a]asplit=2[voz][key];[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${(b - a).toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=${fi.toFixed(2)},afade=t=out:st=${(b - a - fo).toFixed(2)}:d=${fo.toFixed(2)},volume=${vol},adelay=${Math.round(a * 1000)}|${Math.round(a * 1000)}[m];${duck};[voz][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[out]`,
        "-map", "0:v", "-map", "[out]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", path.resolve(salida)]);
    } else {
      // audio a -14 LUFS (estándar de Reels/TikTok)
      run("ffmpeg", ["-y", "-loglevel", "error", "-i", crudo, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", path.resolve(salida)]);
    }
    fs.rmSync(crudo, { force: true });
    console.log("listo:", path.resolve(salida));
  }
} finally {
  fs.rmSync(dirIn, { recursive: true, force: true });
  // Remotion guarda copias del proyecto en la carpeta temporal en cada render: se borran para no llenar el disco.
  for (const d of fs.readdirSync(os.tmpdir())) if (d.startsWith("remotion-webpack-bundle-")) fs.rmSync(path.join(os.tmpdir(), d), { recursive: true, force: true });
}
