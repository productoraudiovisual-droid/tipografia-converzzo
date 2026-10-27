// TEXTO ANIMADO: un texto libre con una de 9 animaciones de entrada.
// maquina · deslizar · rebote · ola · desenfoque · mascara · contorno · glitch · cinetica
import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, SfxPlan, caraEntre, clamp, eBack, eIn, eOut, estiloFinal, familia, lerp, num } from "../lib/base";

const txt = (v: unknown, d = "") => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);
export const ANIMACIONES = ["maquina", "deslizar", "rebote", "ola", "desenfoque", "mascara", "contorno", "glitch", "cinetica"];
const FUENTE_DEF: Record<string, string> = { maquina: "vt323", cinetica: "anton", contorno: "anton", glitch: "space-grotesk", ola: "fredoka", rebote: "luckiest-guy" };
export const fuentesAnimado = (c: Capa) => [typeof c.fuente === "string" ? c.fuente : FUENTE_DEF[String(c.animacion)] ?? "montserrat"];

const lineasDe = (texto: string, maxCar: number) => {
  if (/[\n/]/.test(texto)) return texto.split(/\s*[\n/]\s*/).filter(Boolean);
  const ws = texto.split(/\s+/).filter(Boolean), out: string[] = [];
  let act = "";
  for (const w of ws) { if (act && (act + " " + w).length > maxCar) { out.push(act); act = w; } else act = act ? act + " " + w : w; }
  if (act) out.push(act);
  return out;
};

export const TextoAnimado: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  if (s < -0.02 || s > L + 0.02) return null;
  const E = estiloFinal(ctx.estilo);
  const anim = ANIMACIONES.includes(String(capa.animacion)) ? String(capa.animacion) : "deslizar";
  const fuente = fuentesAnimado(capa)[0];
  const mayus = typeof capa.mayusculas === "boolean" ? capa.mayusculas : !["maquina", "ola", "rebote"].includes(anim);
  const texto = mayus ? txt(capa.texto).toUpperCase() : txt(capa.texto);
  const color = txt(capa.color, "#FFFFFF");
  const acento = txt(capa.acento, E.sticker);
  const sale = eIn(clamp((s - (L - 0.3)) / 0.3));
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const yAuto = Math.min(H * 0.72, Math.max(H * 0.58, (c.y + c.h) * H + 140));
  const y = typeof capa.y === "number" ? capa.y * H : capa.posicion === "arriba" ? H * 0.14 : capa.posicion === "centro" ? H * 0.45 : yAuto;
  const fs = num(capa.tamano, texto.length > 40 ? 70 : texto.length > 20 ? 92 : 120);
  const lineas = lineasDe(texto, Math.max(8, Math.floor((W - 140) / (fs * 0.6))));
  const sombra = "0 6px 22px rgba(0,0,0,.5)";
  const base: React.CSSProperties = { fontFamily: familia(fuente), fontSize: fs, lineHeight: 1.08, color, whiteSpace: "pre", display: "inline-block" };
  const caja = (hijos: React.ReactNode) => (
    <div style={{ position: "absolute", left: 60, right: 60, top: y - fs * 0.6, display: "flex", flexDirection: "column", alignItems: "center", gap: fs * 0.06, opacity: 1 - sale,
      transform: `translateY(${-sale * 20}px)`, textAlign: "center" }}>{hijos}</div>
  );
  const chars = lineas.map((l) => [...l]);
  const total = chars.reduce((n, x) => n + x.length, 0);
  let idx = 0;

  switch (anim) {
    case "maquina": {
      const vel = Math.min(0.06, (L * 0.6) / Math.max(1, total));
      const n = Math.floor(s / vel);
      return caja(
        <div style={{ background: capa.fondo === false ? "transparent" : "rgba(10,10,10,.7)", borderRadius: 18, padding: `${fs * 0.1}px ${fs * 0.3}px` }}>
          {chars.map((l, i) => {
            const desde = idx; idx += l.length;
            const vis = clamp(n - desde, 0, l.length);
            const cursorAqui = n >= desde && (n < idx || i === chars.length - 1);
            return (
              <div key={i} style={{ ...base, display: "block", textShadow: sombra }}>
                {l.slice(0, vis).join("")}<span style={{ opacity: 0 }}>{l.slice(vis).join("")}</span>
                {cursorAqui && (n < total || Math.floor(f / (fps * 0.4)) % 2 === 0) ? <span style={{ color: acento }}>▌</span> : null}
              </div>
            );
          })}
        </div>,
      );
    }
    case "deslizar": {
      const ws = lineas.map((l) => l.split(" "));
      let k = 0;
      return caja(ws.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: fs * 0.25, overflow: "hidden", padding: "0 10px" }}>
          {l.map((w, j) => {
            const a = eOut(clamp((s - (k++) * 0.08) / 0.45));
            return <span key={j} style={{ ...base, textShadow: sombra, opacity: a, transform: `translateX(${(1 - a) * -180}px)` }}>{w}</span>;
          })}
        </div>
      )));
    }
    case "rebote":
      return caja(chars.map((l, i) => (
        <div key={i}>{l.map((ch, j) => {
          const a = clamp((s - (idx++) * 0.035) / 0.5);
          return <span key={j} style={{ ...base, textShadow: sombra, opacity: a > 0 ? 1 : 0, color: (idx % 4 === 0) ? acento : color,
            transform: `translateY(${(1 - eBack(a, 3)) * -260}px) scale(${lerp(0.5, 1, eBack(a, 2))})` }}>{ch}</span>;
        })}</div>
      )));
    case "ola":
      return caja(chars.map((l, i) => (
        <div key={i}>{l.map((ch, j) => {
          const k = idx++;
          const a = eOut(clamp((s - k * 0.03) / 0.3));
          return <span key={j} style={{ ...base, textShadow: sombra, opacity: a, transform: `translateY(${Math.sin(s * 5 - k * 0.45) * fs * 0.12 + (1 - a) * 40}px)` }}>{ch}</span>;
        })}</div>
      )));
    case "desenfoque":
      return caja(chars.map((l, i) => (
        <div key={i}>{l.map((ch, j) => {
          const a = eOut(clamp((s - (idx++) * 0.03) / 0.5));
          return <span key={j} style={{ ...base, textShadow: sombra, opacity: a, filter: a < 0.98 ? `blur(${(1 - a) * 18}px)` : undefined, transform: `scale(${lerp(1.4, 1, a)})` }}>{ch}</span>;
        })}</div>
      )));
    case "mascara":
      return caja(lineas.map((l, i) => {
        const a = eOut(clamp((s - i * 0.14) / 0.5));
        return (
          <div key={i} style={{ overflow: "hidden", padding: "0 6px" }}>
            <span style={{ ...base, textShadow: sombra, transform: `translateY(${(1 - a) * 110}%)` }}>{l}</span>
          </div>
        );
      }));
    case "contorno": {
      const relleno = eOut(clamp((s - 0.5) / 0.7));
      return caja(lineas.map((l, i) => {
        const a = eOut(clamp((s - i * 0.12) / 0.4));
        return (
          <div key={i} style={{ position: "relative", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
            <span style={{ ...base, color: "transparent", WebkitTextStroke: `${Math.max(2, fs * 0.025)}px ${color}` }}>{l}</span>
            <span style={{ ...base, position: "absolute", left: 0, top: 0, color: acento, clipPath: `inset(0 ${(1 - relleno) * 100}% 0 0)` }}>{l}</span>
          </div>
        );
      }));
    }
    case "glitch": {
      const fuerte = s < 0.6 ? 1 - s / 0.6 : random(`g${Math.floor(f / 3)}`) > 0.93 ? 0.6 : 0;
      const dx = (random(`gx${f}`) - 0.5) * 30 * fuerte, dy = (random(`gy${f}`) - 0.5) * 10 * fuerte;
      const aparece = clamp(s / 0.1);
      return caja(lineas.map((l, i) => (
        <div key={i} style={{ position: "relative", opacity: aparece }}>
          {fuerte > 0 ? <>
            <span style={{ ...base, position: "absolute", left: dx, top: dy, color: "#00E5FF", mixBlendMode: "screen", opacity: 0.9 }}>{l}</span>
            <span style={{ ...base, position: "absolute", left: -dx, top: -dy, color: "#FF2D55", mixBlendMode: "screen", opacity: 0.9 }}>{l}</span>
          </> : null}
          <span style={{ ...base, textShadow: sombra, transform: `translateX(${fuerte > 0.3 ? (random(`gs${f}${i}`) - 0.5) * 24 : 0}px)` }}>{l}</span>
        </div>
      )));
    }
    case "cinetica": {
      const ws = texto.split(/\s+/).filter(Boolean);
      const d = (L * 0.88) / Math.max(1, ws.length);
      const k = Math.min(ws.length - 1, Math.floor(s / d));
      const sk = s - k * d;
      const w = ws[k];
      const tam = Math.min(num(capa.tamano, 300), (W - 80) / Math.max(1, w.length * 0.5));
      const a = eOut(clamp(sk / 0.12));
      const rot = (k % 3 - 1) * 4;
      return (
        <div style={{ position: "absolute", left: 0, right: 0, top: (typeof capa.y === "number" ? capa.y * H : capa.posicion === "centro" ? H * 0.45 : capa.posicion === "arriba" ? H * 0.16 : yAuto + tam * 0.3) - tam * 0.55,
          display: "flex", justifyContent: "center", opacity: 1 - sale }}>
          <span style={{ ...base, fontSize: tam, lineHeight: 1, color: k % 2 ? acento : color, textShadow: sombra, WebkitTextStroke: `${tam * 0.025}px #000`, paintOrder: "stroke fill",
            transform: `scale(${lerp(1.6, 1, a)}) rotate(${rot}deg)`, opacity: a }}>{w}</span>
        </div>
      );
    }
  }
  return null;
};
export const sonidosAnimado = (c: Capa): SfxPlan[] => {
  const a = String(c.animacion);
  const L = c.hasta - c.desde;
  if (a === "maquina") {
    const n = Math.min(60, String(c.texto ?? "").length), vel = Math.min(0.06, (L * 0.6) / Math.max(1, n));
    return Array.from({ length: Math.ceil(n / 2) }, (_, k) => ({ archivo: "tecla.wav", en: c.desde + k * 2 * vel, vol: 0.18 }));
  }
  if (a === "cinetica") {
    const ws = String(c.texto ?? "").split(/\s+/).filter(Boolean), d = (L * 0.88) / Math.max(1, ws.length);
    return ws.map((_, k) => ({ archivo: "pop.wav", en: c.desde + k * d, vol: 0.3 }));
  }
  if (a === "glitch") return [{ archivo: "glitch.wav", en: c.desde, vol: 0.35 }];
  return [{ archivo: "whoosh.wav", en: c.desde, vol: 0.3 }];
};
