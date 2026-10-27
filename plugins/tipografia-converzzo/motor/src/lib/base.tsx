// Piezas compartidas por todos los efectos: tipos, animación, fuentes, caras y sonidos.
import React from "react";
import { Audio, Sequence, continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { archivoFuente } from "./catalogo";

export type Cara = { t: number; x: number; y: number; w: number; h: number }; // normalizado 0..1 sobre el encuadre vertical
export type Estilo = {
  fuente?: string;        // archivo dentro de public/fonts (por defecto Montserrat)
  fuenteTitulo?: string;
  fuenteSubtitulos?: string;   // si está, todos los estilos de subtítulos la usan (salvo que la capa pida otra)
  fondo?: string; texto?: string; suave?: string; acento?: string; sticker?: string; stickerTexto?: string;
};
// Una capa = un efecto aplicado en un tramo del video. Las opciones dependen del efecto.
export type Capa = { efecto: string; desde: number; hasta: number; [opcion: string]: unknown };
export type Plan = {
  video: string;          // ruta dentro de public/ (la pone render.mjs)
  duracion: number;       // frames (la pone render.mjs)
  fps: number;            // (la pone render.mjs)
  ancho?: number; alto?: number;   // tamaño original del video (lo pone render.mjs)
  caras?: Cara[];         // (lo pone render.mjs)
  estilo?: Estilo;
  sonido?: boolean;       // sonidos de los efectos (por defecto sí)
  capas: Capa[];
};
// Lo que reciben los efectos gráficos.
export type Ctx = { estilo?: Estilo; caras?: Cara[]; video?: string };
export type SfxPlan = { archivo: string; en: number; vol?: number };

export const ESTILO_BASE: Required<Estilo> = {
  fuente: "Montserrat-ExtraBold.ttf", fuenteTitulo: "Montserrat-Black.ttf", fuenteSubtitulos: "",
  fondo: "#FFFFFF", texto: "#111111", suave: "#8A8A8A", acento: "#FF3B30", sticker: "#FFD60A", stickerTexto: "#111111",
};
export const estiloFinal = (e?: Estilo): Required<Estilo> => ({ ...ESTILO_BASE, ...(e ?? {}) } as Required<Estilo>);

// ---------- animación ----------
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const eOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const eIn = (t: number) => Math.pow(clamp(t), 3);
export const eInOut = (t: number) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const eBack = (t: number, s = 1.7) => { const x = clamp(t) - 1; return 1 + (s + 1) * x * x * x + s * x * x; };
export const num = (v: unknown, def: number) => (typeof v === "number" && isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && isFinite(+v) ? +v : def);

// ---------- fuentes ----------
const cargadas = new Set<string>();
// Acepta un id del catálogo ("anton"), un nombre ("Bebas Neue") o un archivo de public/fonts.
export const familia = (fuente: string) => "F_" + archivoFuente(fuente).replace(/[^a-zA-Z0-9]/g, "_") + ", sans-serif";
export const useFuentes = (fuentes: string[]) => {
  const archivos = [...new Set(fuentes.filter(Boolean).map(archivoFuente))];
  const pend = archivos.filter((a) => !cargadas.has(a));
  const [h] = React.useState(() => (pend.length ? delayRender("fuentes") : null));
  React.useEffect(() => {
    if (!h) return;
    Promise.all(pend.map((a) => new FontFace("F_" + a.replace(/[^a-zA-Z0-9]/g, "_"), `url(${staticFile("fonts/" + a)})`, { weight: "1 1000" }).load()
      .then((f) => { (document.fonts as unknown as Set<FontFace>).add(f); cargadas.add(a); })))
      .catch((e) => console.warn("fuente", e)).finally(() => continueRender(h));
  }, [h]); // eslint-disable-line react-hooks/exhaustive-deps
};

// ---------- caras ----------
const CARA_DEF: Cara = { t: 0, x: 0.375, y: 0.2, w: 0.25, h: 0.18 };
// Caja promedio de la cara entre dos segundos.
export const caraEntre = (caras: Cara[] | undefined, desde: number, hasta: number): Cara => {
  const sel = (caras ?? []).filter((c) => c.t >= desde - 0.2 && c.t <= hasta + 0.2 && c.w > 0);
  if (!sel.length) return { ...CARA_DEF, t: desde };
  const avg = (k: keyof Cara) => sel.reduce((s, c) => s + c[k], 0) / sel.length;
  return { t: desde, x: avg("x"), y: avg("y"), w: avg("w"), h: avg("h") };
};
// Cara suavizada en un instante (promedio de ±ventana segundos).
export const caraEn = (caras: Cara[] | undefined, t: number, ventana = 0.4): Cara => caraEntre(caras, t - ventana + 0.2, t + ventana - 0.2);

// ---------- sonido ----------
export const Sfx: React.FC<SfxPlan> = ({ archivo, en, vol = 0.5 }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.max(0, Math.round(en * fps))} durationInFrames={Math.round(fps * 2)} layout="none">
      <Audio src={staticFile("sfx/" + archivo)} volume={vol} />
    </Sequence>
  );
};
