// Efectos de superficie: grano de película, flash y glitch.
// El glitch distorsiona todo lo que tiene debajo; el grano y el flash van encima.
import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Plan, SfxPlan, clamp, eInOut, num } from "../lib/base";

export const EFECTOS_SUPERFICIE = ["grano", "flash", "glitch", "look-pelicula"];

const activa = (plan: Plan, efecto: string, t: number) => plan.capas.find((c) => c.efecto === efecto && t >= c.desde && t <= c.hasta);

// Grano de película (textura que cambia cada cuadro).
export const Grano: React.FC<{ plan: Plan }> = ({ plan }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps;
  const c = activa(plan, "grano", t);
  if (!c) return null;
  const L = c.hasta - c.desde, s = t - c.desde, fade = Math.min(0.3, L / 2);
  const k = eInOut(Math.min(s / fade, (L - s) / fade, 1)) * clamp(num(c.intensidad, 1), 0, 2);
  // texturas de grano ya hechas (8 cuadros que se alternan): mucho más rápido que generarlo en cada cuadro
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.45 * k, pointerEvents: "none" }}>
      <Img src={staticFile(`texturas/grano_${f % 8}.jpg`)} style={{ width: W, height: H }} />
    </AbsoluteFill>
  );
};

// Flash: destello que entra rápido y se apaga suave (ideal en un corte o cambio de idea).
export const Flash: React.FC<{ plan: Plan }> = ({ plan }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  let op = 0, color = "#FFFFFF";
  for (const c of plan.capas) {
    if (c.efecto !== "flash") continue;
    const s = t - c.desde, dur = Math.max(0.15, c.hasta - c.desde);
    if (s < -0.06 || s > dur) continue;
    const v = s < 0 ? clamp((s + 0.06) / 0.06) : Math.pow(1 - s / dur, 2.2);
    if (v * clamp(num(c.intensidad, 1), 0, 1) > op) { op = v * clamp(num(c.intensidad, 1), 0, 1); color = String(c.color ?? "#FFFFFF"); }
  }
  return op > 0.001 ? <AbsoluteFill style={{ background: color, opacity: op, pointerEvents: "none" }} /> : null;
};

// Glitch: separa los colores y corta la imagen en franjas que saltan, a ráfagas.
export const ConGlitch: React.FC<{ plan: Plan; children: React.ReactNode }> = ({ plan, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const c = activa(plan, "glitch", t);
  const on = c ? random(`g-${f}`) > 0.3 : false;
  if (!c || !on) return <AbsoluteFill>{children}</AbsoluteFill>;
  const i = clamp(num(c.intensidad, 1), 0.2, 2);
  const d = (10 + random(`d-${f}`) * 18) * i;
  const id = `glitch-${f}`;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={d} dy={0} result="ro" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={-d} dy={0} result="bo" />
          <feBlend in="ro" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="bo" mode="screen" result="rgb" />
          <feTurbulence type="fractalNoise" baseFrequency="0.00001 0.035" numOctaves={1} seed={f % 997} result="n" />
          <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1" result="n2" />
          <feDisplacementMap in="rgb" in2="n2" scale={90 * i} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const sonidosSuperficie = (c: Capa): SfxPlan[] => {
  switch (c.efecto) {
    case "flash": return [{ archivo: "flash.wav", en: c.desde - 0.03, vol: 0.35 }];
    case "glitch": return [{ archivo: "glitch.wav", en: c.desde, vol: 0.4 }];
    default: return [];
  }
};

// Look de película: el color, el halo, el grano y la viñeta los hace ffmpeg antes del render (render.mjs, rápido);
// aquí solo van las bandas negras, que deben quedar fijas encima de todo.
export const BandasPelicula: React.FC<{ plan: Plan }> = ({ plan }) => {
  const f = useCurrentFrame();
  const { fps, height: H } = useVideoConfig();
  const t = f / fps;
  const c = activa(plan, "look-pelicula", t);
  if (!c || c.bandas === false) return null;
  const L = c.hasta - c.desde, s = t - c.desde, fade = Math.min(Number(c.transicion ?? 0.4), L / 2);
  const k = fade <= 0 ? 1 : eInOut(Math.min(s / fade, (L - s) / fade, 1));
  const h = H * 0.075 * k;
  return (<>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h, background: "#000" }} />
  </>);
};
