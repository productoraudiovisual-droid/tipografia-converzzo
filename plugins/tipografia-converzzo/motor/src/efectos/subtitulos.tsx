// Subtítulos palabra por palabra en 16 estilos. Cada estilo tiene su propio comando (/sub-<estilo>).
// Las palabras vienen de la transcripción (render.mjs) o de "frases" ya traducidas (se reparten los tiempos).
import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, caraEntre, clamp, eBack, eOut, estiloFinal, familia, lerp, num } from "../lib/base";

type Palabra = { text: string; start: number; end: number };
type Bloque = { palabras: Palabra[]; desde: number; hasta: number };

// Configuración base de cada estilo (todo se puede cambiar desde la capa).
type Cfg = { fuente: string; maxPal: number; maxCar: number; tam: number; mayus: boolean };
export const ESTILOS_SUB: Record<string, Cfg> = {
  clasico: { fuente: "montserrat", maxPal: 3, maxCar: 18, tam: 78, mayus: true },
  caja: { fuente: "montserrat", maxPal: 3, maxCar: 18, tam: 78, mayus: true },
  pop: { fuente: "montserrat", maxPal: 3, maxCar: 18, tam: 80, mayus: true },
  karaoke: { fuente: "montserrat", maxPal: 3, maxCar: 18, tam: 78, mayus: true },
  impacto: { fuente: "anton", maxPal: 2, maxCar: 12, tam: 150, mayus: true },
  minimal: { fuente: "inter-medium", maxPal: 5, maxCar: 30, tam: 54, mayus: false },
  maquina: { fuente: "vt323", maxPal: 4, maxCar: 22, tam: 84, mayus: false },
  neon: { fuente: "righteous", maxPal: 3, maxCar: 16, tam: 84, mayus: true },
  resaltador: { fuente: "poppins", maxPal: 4, maxCar: 22, tam: 70, mayus: false },
  burbuja: { fuente: "inter", maxPal: 5, maxCar: 26, tam: 56, mayus: false },
  detras: { fuente: "anton", maxPal: 2, maxCar: 11, tam: 250, mayus: true },
  emoji: { fuente: "montserrat", maxPal: 3, maxCar: 18, tam: 78, mayus: true },
  elegante: { fuente: "playfair", maxPal: 4, maxCar: 22, tam: 78, mayus: false },
  "3d": { fuente: "bowlby-one", maxPal: 2, maxCar: 13, tam: 96, mayus: true },
  retro: { fuente: "press-start", maxPal: 3, maxCar: 14, tam: 48, mayus: true },
  manuscrito: { fuente: "caveat", maxPal: 4, maxCar: 22, tam: 96, mayus: false },
};
const cfgDe = (capa: Capa) => ESTILOS_SUB[String(capa.estilo ?? "clasico")] ?? ESTILOS_SUB.clasico;
// Fuentes que usa la capa (para cargarlas antes de renderizar).
export const fuentesSubtitulos = (capa: Capa) => {
  const c = cfgDe(capa);
  return [typeof capa.fuente === "string" ? capa.fuente : c.fuente, ...(capa.estilo === "elegante" ? ["playfair-italic"] : [])];
};

// Agrupa las palabras en bloques cortos que se leen de un vistazo.
export const bloques = (palabras: Palabra[], maxPal: number, maxCar: number): Bloque[] => {
  const out: Bloque[] = [];
  let act: Palabra[] = [];
  const cerrar = () => { if (act.length) out.push({ palabras: act, desde: act[0].start, hasta: act[act.length - 1].end }); act = []; };
  for (const p of palabras) {
    const prev = act[act.length - 1];
    const car = act.reduce((n, x) => n + x.text.length + 1, 0) + p.text.length;
    if (act.length && (act.length >= maxPal || car > maxCar || p.start - prev.end > 0.35 || /[.?!…,;:]$/.test(prev.text))) cerrar();
    act.push(p);
  }
  cerrar();
  for (let i = 0; i < out.length; i++) {
    const sig = out[i + 1];
    out[i].hasta = sig && sig.desde - out[i].hasta < 0.6 ? sig.desde : out[i].hasta + 0.25;
  }
  return out;
};

// Frases traducidas -> bloques con palabras de tiempo repartido según su largo.
const desdeFrases = (frases: { desde: number; hasta: number; texto: string }[]): Bloque[] =>
  frases.filter((f) => typeof f.texto === "string" && f.hasta > f.desde).map((f) => {
    const ws = f.texto.trim().split(/\s+/).filter(Boolean);
    const total = ws.reduce((n, w) => n + w.length + 2, 0);
    const dur = (f.hasta - f.desde) * 0.92;
    let t = f.desde;
    const palabras = ws.map((w) => { const d = (dur * (w.length + 2)) / total; const p = { text: w, start: t, end: t + d }; t += d; return p; });
    return { palabras, desde: f.desde, hasta: f.hasta };
  });

const emojiSrc = (e: string) => {
  const cps = [...e].map((c) => c.codePointAt(0)!.toString(16));
  return { con: `emoji/${cps.join("-")}.svg`, sin: `emoji/${cps.filter((c) => c !== "fe0f").join("-")}.svg` };
};
const limpiar = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export const Subtitulos: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps;
  if (t < capa.desde || t > capa.hasta) return null;
  const E = estiloFinal(ctx.estilo);
  const estilo = String(capa.estilo ?? "clasico");
  const cfg = cfgDe(capa);
  const fuente = typeof capa.fuente === "string" ? capa.fuente : ctx.estilo?.fuenteSubtitulos ?? cfg.fuente;
  const corr = (capa.correcciones ?? {}) as Record<string, string>;
  const mayus = typeof capa.mayusculas === "boolean" ? capa.mayusculas : cfg.mayus;
  const maxPal = Math.round(num(capa.palabras_por_bloque, cfg.maxPal));
  const bs: Bloque[] = Array.isArray(capa.frases)
    ? desdeFrases(capa.frases as never)
    : bloques(((Array.isArray(capa.palabras) ? capa.palabras : []) as Palabra[])
      .filter((p) => p.end >= capa.desde && p.start <= capa.hasta)
      .map((p) => {
        const fijo = Object.entries(corr).find(([a]) => limpiar(a) === limpiar(p.text));
        return { ...p, text: fijo ? p.text.replace(/[\p{L}\p{N}]+/u, fijo[1]) : p.text };
      }), maxPal, Math.max(cfg.maxCar, maxPal * 6));
  const bi = bs.findIndex((x) => t >= x.desde && t < x.hasta);
  if (bi < 0) return null;
  const b = bs[bi];
  const fs = num(capa.tamano, cfg.tam);
  const resalte = String(capa.color ?? (estilo === "elegante" ? "#F3D9B1" : estilo === "neon" ? "#FF4FD8" : E.sticker));
  const cara = caraEntre(ctx.caras, b.desde, b.hasta);
  const bajoCara = Math.min(H * 0.76, Math.max(H * 0.6, (cara.y + cara.h) * H + 140));
  const yBase = estilo === "minimal" ? Math.min(H * 0.78, bajoCara + 60) : estilo === "detras" ? (cara.y + cara.h * 0.05) * H : bajoCara;
  const y = capa.posicion === "centro" ? H * 0.5 : capa.posicion === "arriba" ? H * 0.2 : typeof capa.y === "number" ? capa.y * H : yBase;
  const sb = t - b.desde;
  const entraB = eBack(clamp(sb / 0.18), 2);
  const fam = familia(fuente);
  const borde = (k: number, c = "#000") => ({ WebkitTextStroke: `${fs * k}px ${c}`, paintOrder: "stroke fill" } as React.CSSProperties);
  const sombra = "0 6px 18px rgba(0,0,0,.45)";

  const palabra = (p: Palabra, i: number) => {
    const dicha = t >= p.start - 0.03;
    const ahora = dicha && (i === b.palabras.length - 1 || t < b.palabras[i + 1].start - 0.03);
    const texto = mayus ? p.text.toUpperCase() : p.text;
    const sp = t - p.start + 0.03;
    const salto = eBack(clamp(sp / 0.16), 2.4);
    const base: React.CSSProperties = { fontFamily: fam, fontSize: fs, lineHeight: 1.05, position: "relative", display: "inline-block", whiteSpace: "pre" };
    switch (estilo) {
      case "caja":
        return <span key={i} style={{ ...base, letterSpacing: "-0.02em", color: "#fff", padding: "2px 14px", borderRadius: 14,
          ...(ahora ? { background: E.acento } : { ...borde(0.11), textShadow: sombra }), transform: ahora ? `scale(${1 + 0.06 * clamp(salto)})` : undefined }}>{texto}</span>;
      case "pop":
        return <span key={i} style={{ ...base, letterSpacing: "-0.02em", ...borde(0.11), textShadow: sombra, color: ahora ? resalte : "#fff", opacity: dicha ? 1 : 0, transform: `scale(${dicha ? Math.max(0, salto) : 0})` }}>{texto}</span>;
      case "karaoke":
        return <span key={i} style={{ ...base, letterSpacing: "-0.02em", ...borde(0.11), textShadow: sombra, color: dicha ? resalte : "#fff" }}>{texto}</span>;
      case "impacto":
        return <span key={i} style={{ ...base, lineHeight: 0.95, ...borde(0.08), textShadow: "0 10px 30px rgba(0,0,0,.55)", color: ahora ? resalte : "#fff",
          transform: `scale(${ahora ? 1 + 0.08 * (1 - clamp(sp / 0.25)) : 1})` }}>{texto}</span>;
      case "minimal":
        return <span key={i} style={{ ...base, color: "#fff", opacity: dicha ? 1 : 0.45, textShadow: "0 2px 12px rgba(0,0,0,.6)", letterSpacing: "-0.01em" }}>{texto}</span>;
      case "maquina": {
        const dur = Math.max(0.12, Math.min(p.end - p.start, texto.length * 0.06));
        const n = dicha ? Math.ceil(texto.length * clamp(sp / dur)) : 0;
        const escribiendo = ahora && n < texto.length;
        const cursor = (ahora || (i === b.palabras.length - 1 && dicha)) && (escribiendo || Math.floor(f / (fps * 0.4)) % 2 === 0);
        return (
          <span key={i} style={{ ...base, color: "#fff" }}>
            <span>{texto.slice(0, n)}</span><span style={{ opacity: 0 }}>{texto.slice(n)}</span>
            {cursor ? <span style={{ position: "absolute", left: `${(n / Math.max(1, texto.length)) * 100}%`, top: "8%", width: fs * 0.42, height: "84%", background: resalte }} /> : null}
          </span>
        );
      }
      case "neon": {
        const c = ahora ? resalte : "#7DF9FF";
        const parpadeo = dicha && sp < 0.22 ? (random(`n${i}${b.desde}${Math.floor(sp * 30)}`) > 0.45 ? 1 : 0.25) : 1;
        return <span key={i} style={{ ...base, letterSpacing: "0.02em", color: dicha ? "#FFFFFF" : "rgba(255,255,255,.25)", opacity: parpadeo,
          textShadow: dicha ? `0 0 4px ${c}, 0 0 12px ${c}, 0 0 26px ${c}, 0 0 48px ${c}` : "none", WebkitTextStroke: dicha ? `2px ${c}` : undefined }}>{texto}</span>;
      }
      case "resaltador": {
        const m = ahora ? eOut(clamp(sp / 0.2)) : 0;
        return (
          <span key={i} style={{ ...base, color: m > 0.5 ? "#111" : "#fff", padding: "0 10px", ...(m > 0.5 ? {} : { ...borde(0.06), textShadow: sombra }), zIndex: 1 }}>
            <span style={{ position: "absolute", left: 0, right: 0, top: "12%", bottom: "6%", background: resalte, borderRadius: 10, transform: `skewX(-8deg) scaleX(${m})`, transformOrigin: "left", zIndex: -1 }} />
            {texto}
          </span>
        );
      }
      case "burbuja":
        return <span key={i} style={{ ...base, color: ahora ? E.acento : "#111", letterSpacing: "-0.01em" }}>{texto}</span>;
      case "detras":
        return <span key={i} style={{ ...base, lineHeight: 0.9, color: resalte === E.sticker ? "#fff" : resalte, opacity: dicha ? 1 : 0,
          transform: `translateY(${dicha ? (1 - eOut(clamp(sp / 0.25))) * 60 : 60}px)`, textShadow: "0 12px 40px rgba(0,0,0,.35)" }}>{texto}</span>;
      case "elegante": {
        const a = dicha ? eOut(clamp(sp / 0.3)) : 0;
        return <span key={i} style={{ ...base, fontFamily: ahora ? familia("playfair-italic") : fam, color: ahora ? resalte : "#fff", opacity: a,
          transform: `translateY(${(1 - a) * 18}px)`, textShadow: "0 3px 16px rgba(0,0,0,.55)", letterSpacing: "0.005em" }}>{texto}</span>;
      }
      case "3d": {
        const prof = Array.from({ length: 10 }, (_, k) => `${k + 1}px ${k + 1}px 0 #5A3A00`).join(", ");
        return <span key={i} style={{ ...base, color: ahora ? resalte : "#fff", ...borde(0.05, "#111"), textShadow: `${prof}, 12px 14px 22px rgba(0,0,0,.5)`,
          transform: `rotate(${ahora ? -3 : 0}deg) scale(${ahora ? 1 + 0.1 * clamp(salto) : dicha ? 1 : 0.92})`, opacity: dicha ? 1 : 0.55 }}>{texto}</span>;
      }
      case "retro": {
        const pal = ["#FF4D4D", "#FFD60A", "#4DFF88", "#4DD2FF", "#FF7BF2"];
        const visible = dicha && sp >= 0;
        const paso = visible ? Math.min(1, Math.floor(sp / 0.05) / 3) : 0;
        return <span key={i} style={{ ...base, lineHeight: 1.35, color: pal[(Math.round(b.desde * 10) + i) % pal.length], textShadow: "6px 6px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          opacity: visible ? 1 : 0, transform: `scale(${lerp(0.4, 1, paso)})` }}>{texto}</span>;
      }
      case "manuscrito": {
        const dur = Math.max(0.15, Math.min(0.45, p.end - p.start));
        const r = dicha ? clamp(sp / dur) : 0;
        return (
          <span key={i} style={{ ...base, color: ahora ? resalte : "#fff", textShadow: "0 3px 12px rgba(0,0,0,.6)", clipPath: `inset(-20% ${(1 - r) * 100}% -20% -5%)` }}>
            {texto}
            {ahora ? (
              <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{ position: "absolute", left: "-2%", width: "104%", bottom: "-4%", height: fs * 0.16, overflow: "visible" }}>
                <path d="M2 8 C 30 3, 60 11, 98 5" fill="none" stroke={resalte} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp((sp - 0.1) / 0.3)} vectorEffect="non-scaling-stroke" />
              </svg>
            ) : null}
          </span>
        );
      }
      default: // clasico y emoji
        return <span key={i} style={{ ...base, letterSpacing: "-0.02em", ...borde(0.11), textShadow: sombra, color: ahora ? resalte : "#fff",
          transform: ahora ? `scale(${1 + 0.04 * clamp(salto)})` : undefined }}>{texto}</span>;
    }
  };

  const gap = estilo === "impacto" || estilo === "detras" ? `${fs * 0.02}px ${fs * 0.2}px` : `${fs * 0.08}px ${fs * 0.3}px`;
  const fila = (
    <div style={{ position: "absolute", left: estilo === "detras" ? 20 : 60, right: estilo === "detras" ? 20 : 60, top: y - fs * 0.6, display: "flex", flexWrap: "wrap", justifyContent: "center", gap,
      transform: estilo === "pop" || estilo === "detras" || estilo === "elegante" ? undefined : estilo === "impacto" ? `scale(${lerp(1.25, 1, eOut(clamp(sb / 0.15)))})` : `scale(${0.92 + 0.08 * entraB})` }}>
      {b.palabras.map(palabra)}
    </div>
  );

  if (estilo === "maquina") {
    return (
      <div style={{ position: "absolute", left: 50, right: 50, top: y - fs * 0.75, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "rgba(10,10,10,.72)", borderRadius: 18, padding: `${fs * 0.12}px ${fs * 0.3}px`, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${fs * 0.32}px`, maxWidth: W - 100 }}>
          {b.palabras.map(palabra)}
        </div>
      </div>
    );
  }
  if (estilo === "burbuja") {
    const a = eBack(clamp(sb / 0.25), 1.8);
    return (
      <div style={{ position: "absolute", left: 70, right: 70, top: y - fs * 0.7, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", background: "#fff", borderRadius: 36, padding: `${fs * 0.32}px ${fs * 0.5}px`, display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: `${fs * 0.06}px ${fs * 0.28}px`, boxShadow: "0 14px 34px rgba(0,0,0,.3)", transform: `scale(${a})`, transformOrigin: "20% 100%", maxWidth: W - 160 }}>
          {b.palabras.map(palabra)}
          <svg width={48} height={34} viewBox="0 0 48 34" style={{ position: "absolute", left: 46, bottom: -26 }}><path d="M0 0 H40 L6 34 Z" fill="#fff" /></svg>
        </div>
      </div>
    );
  }
  if (estilo === "emoji") {
    const em = (capa.emojis ?? {}) as Record<string, string>;
    const conEmoji = b.palabras.map((p) => ({ p, e: Object.entries(em).find(([k]) => limpiar(k) === limpiar(p.text))?.[1] })).filter((x) => x.e && t >= x.p.start - 0.03);
    const ult = conEmoji[conEmoji.length - 1];
    const sz = 200;
    return (
      <>
        {fila}
        {ult ? (() => {
          const a = eBack(clamp((t - ult.p.start + 0.03) / 0.3), 2.2);
          const src = emojiSrc(ult.e!);
          return <Img src={staticFile(src.sin)} onError={() => undefined} style={{ position: "absolute", left: W / 2 - sz / 2, top: y - fs * 0.6 - sz - 10, width: sz, height: sz,
            transform: `scale(${a}) rotate(${(1 - clamp(a)) * -25}deg)`, filter: "drop-shadow(0 8px 14px rgba(0,0,0,.35))" }} />;
        })() : null}
      </>
    );
  }
  if (estilo === "detras" && typeof capa._recorte === "string") {
    return (
      <AbsoluteFill>
        {fila}
        <Img src={staticFile(`${capa._recorte}/${String(f).padStart(6, "0")}.webp`)} style={{ position: "absolute", width: W, height: H }} />
      </AbsoluteFill>
    );
  }
  return fila;
};
