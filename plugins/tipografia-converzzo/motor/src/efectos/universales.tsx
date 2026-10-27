// Gráficos universales: gancho, cartel-nombre, dato, ingredientes y tallas-colores.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, SfxPlan, caraEntre, clamp, eBack, eIn, eOut, estiloFinal, familia, lerp, num } from "../lib/base";

const txt = (v: unknown, d = "") => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);
const useVida = (capa: Capa) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  return { f, t, s, L, dentro: s >= -0.02 && s <= L + 0.02, entra: eBack(clamp(s / 0.42), 1.5), sale: eIn(clamp((s - (L - 0.3)) / 0.3)) };
};
const sombra = "0 22px 50px rgba(0,0,0,.32), 0 4px 10px rgba(0,0,0,.15)";

// =====================================================================
// GANCHO: título grande al inicio, palabra por palabra, con una palabra resaltada
// =====================================================================
export const Gancho: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const texto = txt(capa.texto);
  const resaltar = txt(capa.resaltar).toLowerCase().split(/\s+/).filter(Boolean);
  const palabras = texto.split(/\s+/).filter(Boolean);
  const largo = texto.length;
  const fs = largo > 48 ? 76 : largo > 30 ? 92 : 112;
  // arriba de la cara si hay espacio; si no, en la parte baja
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const lineas = Math.ceil((largo * fs * 0.56) / (W - 140));
  const alto = lineas * fs * 1.12 + 40;
  const arriba = c.y * H - alto - 40 > H * 0.08;
  const top = typeof capa.y === "number" ? capa.y * H : arriba ? Math.max(H * 0.1, c.y * H - alto - 50) : Math.min(H * 0.86 - alto, (c.y + c.h) * H + 80);
  const paso = Math.min(0.12, 0.9 / Math.max(1, palabras.length));
  let i = 0;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${fs * 0.08}px ${fs * 0.24}px`,
      opacity: 1 - v.sale, transform: `translateY(${-v.sale * 30}px)` }}>
      {palabras.map((p, k) => {
        const limpia = p.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        const hl = resaltar.some((r) => r.replace(/[^\p{L}\p{N}]/gu, "") === limpia);
        const a = clamp((v.s - (i++) * paso) / 0.32);
        const caja = hl ? eOut(clamp((v.s - (k * paso + 0.2)) / 0.3)) : 0;
        return (
          <span key={k} style={{ position: "relative", display: "inline-block", fontFamily: familia(E.fuenteTitulo), fontSize: fs, lineHeight: 1.08, letterSpacing: "-0.03em",
            color: hl ? E.stickerTexto : "#fff", textShadow: hl ? "none" : "0 4px 18px rgba(0,0,0,.55), 0 2px 4px rgba(0,0,0,.4)",
            opacity: clamp(a * 2), transform: `translateY(${(1 - eBack(a, 2)) * 40}px) scale(${lerp(0.7, 1, eBack(a, 2))})`, padding: hl ? "0 14px" : 0, zIndex: 1 }}>
            {hl ? <span style={{ position: "absolute", inset: "4px 0", background: E.sticker, borderRadius: 12, transformOrigin: "left center", transform: `scaleX(${caja})`, zIndex: -1, transition: "none" }} /> : null}
            {p}
          </span>
        );
      })}
    </div>
  );
};
export const sonidosGancho = (c: Capa): SfxPlan[] => [{ archivo: "whoosh.wav", en: c.desde, vol: 0.35 }];

// =====================================================================
// CARTEL DE NOMBRE (lower third)
// =====================================================================
export const CartelNombre: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const nombre = txt(capa.nombre), cargo = txt(capa.cargo), handle = txt(capa.usuario);
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const CH = 150 + (handle ? 40 : 0);
  const top = typeof capa.y === "number" ? capa.y * H : clamp((c.y + c.h) * H + 90, H * 0.55, H * 0.84 - CH);
  const barra = eOut(clamp(v.s / 0.35)), caja = eOut(clamp((v.s - 0.12) / 0.45));
  const t1 = eOut(clamp((v.s - 0.3) / 0.35)), t2 = eOut(clamp((v.s - 0.45) / 0.35));
  const salida = v.sale;
  return (
    <div style={{ position: "absolute", left: 60, top, display: "flex", alignItems: "stretch", opacity: 1 - salida, transform: `translateX(${-salida * 60}px)` }}>
      <div style={{ width: 14, borderRadius: 8, background: E.acento, transformOrigin: "top", transform: `scaleY(${barra})` }} />
      <div style={{ marginLeft: 14, background: E.fondo, borderRadius: 18, padding: "20px 30px", boxShadow: sombra, clipPath: `inset(0 ${(1 - caja) * 100}% 0 0 round 18px)` }}>
        <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 50, color: E.texto, letterSpacing: "-0.02em", lineHeight: 1.05, whiteSpace: "nowrap",
          opacity: t1, transform: `translateY(${(1 - t1) * 14}px)` }}>{nombre}</div>
        {cargo ? <div style={{ fontFamily: familia(E.fuente), fontSize: 32, color: E.texto, opacity: 0.7 * t2, marginTop: 8, whiteSpace: "nowrap", transform: `translateY(${(1 - t2) * 12}px)` }}>{cargo}</div> : null}
        {handle ? <div style={{ fontFamily: familia(E.fuente), fontSize: 28, color: E.acento, opacity: t2, marginTop: 6, whiteSpace: "nowrap" }}>{handle}</div> : null}
      </div>
    </div>
  );
};
export const sonidosCartel = (c: Capa): SfxPlan[] => [{ archivo: "whoosh.wav", en: c.desde, vol: 0.25 }];

// =====================================================================
// DATO: número que sube contando, con su etiqueta
// =====================================================================
type Num = { pre: string; n: number; suf: string; dec: number; sep: string; sepDec: string };
const leerNum = (s: string): Num | null => {
  const m = s.trim().match(/^([^\d]*)([\d][\d.,]*)([^\d]*)$/);
  if (!m) return null;
  let cuerpo = m[2], dec = 0, sepDec = ",", sep = ".";
  const d = cuerpo.match(/([.,])(\d{1,2})$/);
  if (d) { dec = d[2].length; sepDec = d[1]; sep = d[1] === "," ? "." : ","; cuerpo = cuerpo.slice(0, -d[0].length).replace(/[.,]/g, "") + "." + d[2]; }
  else { const s1 = cuerpo.match(/[.,]/); sep = s1 ? s1[0] : "."; cuerpo = cuerpo.replace(/[.,]/g, ""); }
  const n = parseFloat(cuerpo);
  return isFinite(n) ? { pre: m[1], n, suf: m[3], dec, sep, sepDec } : null;
};
const fmt = (p: Num, n: number) => {
  const [e, fr] = n.toFixed(p.dec).split(".");
  const conMil = e.length > 3 ? e.replace(/\B(?=(\d{3})+(?!\d))/g, p.sep) : e;
  return p.pre + (fr ? conMil + p.sepDec + fr : conMil) + p.suf;
};
export const Dato: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const valor = txt(capa.valor), etiqueta = txt(capa.etiqueta);
  const p = leerNum(valor);
  const cuenta = eOut(clamp((v.s - 0.2) / Math.min(1.4, v.L * 0.5)));
  const desdeN = num(capa.desde_valor, 0);
  const mostrado = p ? fmt(p, cuenta >= 1 ? p.n : lerp(desdeN, p.n, cuenta)) : valor;
  const fs = Math.min(150, (W - 200) / Math.max(4, valor.length * 0.62));
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const CH = fs * 1.1 + (etiqueta ? 70 : 0) + 60;
  const top = typeof capa.y === "number" ? capa.y * H : (c.y + c.h) * H + 60 + CH < H * 0.86 ? Math.max(H * 0.5, (c.y + c.h) * H + 60) : H * 0.09;
  const golpe = cuenta >= 1 ? Math.sin(clamp((v.s - 0.2 - Math.min(1.4, v.L * 0.5)) / 0.25) * Math.PI) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: clamp(v.entra * 3) * (1 - v.sale),
      transform: `translateY(${(1 - v.entra) * 60}px) scale(${lerp(0.85, 1, v.entra)})` }}>
      <div style={{ background: E.fondo, borderRadius: 34, padding: "26px 54px 30px", boxShadow: sombra, textAlign: "center" }}>
        <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: fs, color: E.acento, lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums",
          transform: `scale(${1 + 0.07 * golpe})` }}>{mostrado}</div>
        {etiqueta ? <div style={{ fontFamily: familia(E.fuente), fontSize: 40, color: E.texto, marginTop: 12, opacity: eOut(clamp((v.s - 0.5) / 0.3)) }}>{etiqueta}</div> : null}
      </div>
    </div>
  );
};
export const sonidosDato = (c: Capa): SfxPlan[] => {
  const dur = Math.min(1.4, (c.hasta - c.desde) * 0.5);
  return [{ archivo: "pop.wav", en: c.desde, vol: 0.4 }, ...[0.25, 0.4, 0.55, 0.7, 0.85].map((k) => ({ archivo: "tick.wav", en: c.desde + 0.2 + dur * k, vol: 0.3 })),
    { archivo: "ding.wav", en: c.desde + 0.2 + dur, vol: 0.35 }];
};

// =====================================================================
// INGREDIENTES: etiquetas que señalan partes de un producto o plato
// =====================================================================
type Punto = { texto: string; x: number; y: number; en?: number };
export const Ingredientes: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const pts = (Array.isArray(capa.puntos) ? capa.puntos : []) as Punto[];
  const titulo = txt(capa.titulo);
  return (
    <AbsoluteFill style={{ opacity: 1 - v.sale, pointerEvents: "none" }}>
      {titulo ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.09, display: "flex", justifyContent: "center" }}>
          <div style={{ background: E.texto, color: E.fondo, fontFamily: familia(E.fuenteTitulo), fontSize: 50, padding: "14px 32px", borderRadius: 18, boxShadow: sombra,
            transform: `scale(${Math.max(0, v.entra)})` }}>{titulo}</div>
        </div>
      ) : null}
      {pts.map((p, i) => {
        const en = typeof p.en === "number" ? p.en : capa.desde + 0.3 + i * Math.min(0.7, (capa.hasta - capa.desde - 1) / Math.max(1, pts.length));
        const s = v.t - en;
        if (s < 0) return null;
        const px = clamp(num(p.x, 0.5)) * W, py = clamp(num(p.y, 0.5)) * H;
        const derecha = px < W / 2;                               // la etiqueta va hacia el lado con más espacio
        const lx = derecha ? Math.min(W - 60, px + 170) : Math.max(60, px - 170), ly = py - 90;
        const linea = eOut(clamp(s / 0.3)), et = eBack(clamp((s - 0.2) / 0.35), 1.8);
        return (
          <React.Fragment key={i}>
            <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
              <circle cx={px} cy={py} r={12 + 12 * ((s * 1.3) % 1)} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - ((s * 1.3) % 1)} />
              <circle cx={px} cy={py} r={10} fill="#fff" stroke={E.acento} strokeWidth={5} />
              <path d={`M ${px} ${py} L ${lerp(px, lx, 0.35)} ${ly} L ${lx} ${ly}`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round"
                pathLength={1} strokeDasharray={`${linea} 1`} style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,.45))" }} />
            </svg>
            <div style={{ position: "absolute", top: ly - 34, ...(derecha ? { left: lx } : { right: W - lx }), background: E.fondo, color: E.texto, borderRadius: 999,
              padding: "12px 26px", fontFamily: familia(E.fuente), fontSize: 34, whiteSpace: "nowrap", boxShadow: sombra,
              transform: `scale(${Math.max(0, et)})`, transformOrigin: derecha ? "left center" : "right center" }}>{p.texto}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
export const sonidosIngredientes = (c: Capa): SfxPlan[] => {
  const pts = (Array.isArray(c.puntos) ? c.puntos : []) as Punto[];
  return pts.map((p, i) => ({ archivo: "pop.wav", en: (typeof p.en === "number" ? p.en : c.desde + 0.3 + i * Math.min(0.7, (c.hasta - c.desde - 1) / Math.max(1, pts.length))) + 0.2, vol: 0.4 }));
};

// =====================================================================
// TALLAS Y COLORES
// =====================================================================
const COLORES: Record<string, string> = {
  negro: "#111111", blanco: "#F7F7F5", gris: "#9CA3AF", "gris oscuro": "#4B5563", beige: "#E8D9C0", crema: "#F3E9D2", cafe: "#7B5137", café: "#7B5137", marron: "#7B5137", marrón: "#7B5137",
  rojo: "#E11D2E", vinotinto: "#6B1027", vino: "#6B1027", rosado: "#F4A6C0", rosa: "#F4A6C0", fucsia: "#E5348F", morado: "#7C3AED", lila: "#C4B5FD",
  azul: "#2563EB", "azul oscuro": "#1E3A8A", "azul marino": "#1E2A4A", celeste: "#7DD3FC", verde: "#16A34A", "verde oliva": "#6B7F3A", menta: "#A7F3D0",
  amarillo: "#FACC15", mostaza: "#C9A227", naranja: "#F97316", dorado: "#C9A44C", plateado: "#C0C4CC", denim: "#4A6FA5", nude: "#E3BFA3",
};
export const TallasColores: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const titulo = txt(capa.titulo);
  const tallas = (Array.isArray(capa.tallas) ? capa.tallas : []).map((x) => txt(x));
  const agotadas = new Set((Array.isArray(capa.agotadas) ? capa.agotadas : []).map((x) => txt(x).toLowerCase()));
  const colores = (Array.isArray(capa.colores) ? capa.colores : []).map((x) => {
    if (typeof x === "string") return { nombre: x, hex: COLORES[x.toLowerCase()] ?? (x.startsWith("#") ? x : "#CCCCCC") };
    const o = x as { nombre?: string; hex?: string };
    return { nombre: txt(o.nombre), hex: txt(o.hex, COLORES[txt(o.nombre).toLowerCase()] ?? "#CCCCCC") };
  });
  const CW = W - 160, CH = 90 + (titulo ? 64 : 0) + (tallas.length ? 130 : 0) + (colores.length ? 150 : 0);
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const top = typeof capa.y === "number" ? capa.y * H : (c.y + c.h) * H + 60 + CH < H * 0.86 ? Math.max(H * 0.47, (c.y + c.h) * H + 60) : H * 0.08;
  const chip = 92;
  return (
    <div style={{ position: "absolute", left: 80, top, width: CW, opacity: clamp(v.entra * 3) * (1 - v.sale), transform: `translateY(${(1 - v.entra) * 60}px) scale(${lerp(0.92, 1, v.entra)})` }}>
      <div style={{ background: E.fondo, borderRadius: 30, padding: "28px 32px", boxShadow: sombra }}>
        {titulo ? <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 44, color: E.texto, letterSpacing: "-0.02em", marginBottom: 18 }}>{titulo}</div> : null}
        {tallas.length ? (
          <>
            <div style={{ fontFamily: familia(E.fuente), fontSize: 26, color: E.suave, letterSpacing: "0.08em", marginBottom: 10 }}>TALLAS</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
              {tallas.map((t, i) => {
                const a = eBack(clamp((v.s - 0.3 - i * 0.08) / 0.3), 2);
                const no = agotadas.has(t.toLowerCase());
                return (
                  <div key={i} style={{ minWidth: chip, height: chip * 0.78, padding: "0 16px", borderRadius: 16, border: `3px solid ${no ? "#DDD" : E.texto}`, display: "flex",
                    alignItems: "center", justifyContent: "center", fontFamily: familia(E.fuenteTitulo), fontSize: 34, color: no ? "#BBB" : E.texto, position: "relative",
                    transform: `scale(${Math.max(0, a)})`, boxSizing: "border-box" }}>
                    {t}
                    {no ? <div style={{ position: "absolute", left: 8, right: 8, top: "50%", height: 3, background: "#BBB", transform: "rotate(-20deg)" }} /> : null}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
        {colores.length ? (
          <>
            <div style={{ fontFamily: familia(E.fuente), fontSize: 26, color: E.suave, letterSpacing: "0.08em", marginBottom: 12 }}>COLORES</div>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              {colores.map((col, i) => {
                const a = eBack(clamp((v.s - 0.6 - tallas.length * 0.08 - i * 0.1) / 0.3), 2);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${Math.max(0, a)})` }}>
                    <div style={{ width: 66, height: 66, borderRadius: 99, background: col.hex, border: "4px solid #fff", boxShadow: "0 0 0 2px #DDD, 0 6px 14px rgba(0,0,0,.18)" }} />
                    <div style={{ fontFamily: familia(E.fuente), fontSize: 24, color: E.texto, opacity: 0.8 }}>{col.nombre}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
export const sonidosTallas = (c: Capa): SfxPlan[] => [{ archivo: "pop.wav", en: c.desde, vol: 0.4 }, { archivo: "tick.wav", en: c.desde + 0.35, vol: 0.4 }, { archivo: "tick.wav", en: c.desde + 0.7, vol: 0.4 }];
