// Exporta subtítulos .srt y prepara frases para traducir.
// Uso:
//   node srt.mjs <video> <salida.srt> [--idioma es] [--por-bloque 7] [--correcciones '{"wasap":"WhatsApp"}'] [--bloques frases.json]
//      Transcribe el video y escribe el .srt. Con --bloques guarda además las frases con sus tiempos
//      (formato [{desde, hasta, texto}]) para traducirlas y usarlas en "frases" de los subtítulos.
//   node srt.mjs --frases frases.json <salida.srt>
//      Escribe el .srt a partir de frases ya traducidas.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MOTOR = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const frasesIn = opt("--frases"), idioma = opt("--idioma", "es"), porBloque = Number(opt("--por-bloque", "7")), bloquesOut = opt("--bloques");
const correcciones = JSON.parse(opt("--correcciones", "{}"));
const PY = fs.existsSync(path.join(MOTOR, ".venv/bin/python")) ? path.join(MOTOR, ".venv/bin/python") : path.join(MOTOR, ".venv/Scripts/python.exe");

const tc = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), x = Math.floor((ms % 60000) / 1000), r = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")},${String(r).padStart(3, "0")}`;
};
// Parte una frase larga en dos líneas parecidas.
const dosLineas = (t) => {
  if (t.length <= 32) return t;
  const ws = t.split(" ");
  let best = t, dif = Infinity;
  for (let i = 1; i < ws.length; i++) {
    const a = ws.slice(0, i).join(" "), b = ws.slice(i).join(" ");
    if (Math.abs(a.length - b.length) < dif) { dif = Math.abs(a.length - b.length); best = a + "\n" + b; }
  }
  return best;
};
const escribir = (frases, salida) => {
  fs.writeFileSync(salida, frases.map((f, i) => `${i + 1}\n${tc(f.desde)} --> ${tc(f.hasta)}\n${dosLineas(f.texto.trim())}\n`).join("\n"));
  console.log(`srt: ${frases.length} subtítulos -> ${path.resolve(salida)}`);
};

if (frasesIn) {
  const salida = args[0];
  if (!salida) { console.log("Falta la ruta del .srt de salida."); process.exit(1); }
  escribir(JSON.parse(fs.readFileSync(frasesIn, "utf8")), salida);
  process.exit(0);
}

const [video, salida] = args;
if (!video || !salida) { console.log("Uso: node srt.mjs <video> <salida.srt> [--idioma es] [--por-bloque 7] [--bloques frases.json]"); process.exit(1); }
const tj = path.join(os.tmpdir(), `srt_${Date.now()}.json`);
console.log("Transcribiendo...");
execFileSync(PY, [path.join(MOTOR, "scripts/transcribir.py"), path.resolve(video), tj, idioma], { stdio: ["ignore", "ignore", "inherit"] });
const limpia = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const palabras = JSON.parse(fs.readFileSync(tj, "utf8")).map((p) => {
  const fijo = Object.entries(correcciones).find(([a]) => limpia(a) === limpia(p.text));
  return { ...p, text: fijo ? p.text.replace(/[\p{L}\p{N}]+/u, fijo[1]) : p.text };
});
fs.rmSync(tj, { force: true });
// bloques: hasta N palabras, 42 caracteres, y cortes en pausas o signos de puntuación
const frases = [];
let act = [];
const cerrar = () => { if (act.length) frases.push({ desde: act[0].start, hasta: act[act.length - 1].end, texto: act.map((p) => p.text).join(" ") }); act = []; };
for (const p of palabras) {
  const prev = act[act.length - 1];
  const car = act.reduce((n, x) => n + x.text.length + 1, 0) + p.text.length;
  if (act.length && (act.length >= porBloque || car > 42 || p.start - prev.end > 0.5 || /[.?!…]$/.test(prev.text))) cerrar();
  act.push(p);
}
cerrar();
frases.forEach((f, i) => { const sig = frases[i + 1]; f.hasta = sig && sig.desde - f.hasta < 0.5 ? sig.desde : f.hasta + 0.2; f.desde = Math.round(f.desde * 1000) / 1000; f.hasta = Math.round(f.hasta * 1000) / 1000; });
escribir(frases, salida);
if (bloquesOut) { fs.writeFileSync(bloquesOut, JSON.stringify(frases, null, 1)); console.log(`frases para traducir -> ${path.resolve(bloquesOut)}`); }
