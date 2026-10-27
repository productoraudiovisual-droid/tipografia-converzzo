// Motion graphics (2): collage-halftone y carrusel-video.
import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, SfxPlan, clamp, eBack, eInOut, eOut, estiloFinal, familia, lerp } from "../lib/base";

const txt = (v: unknown, d = "") => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);

// =====================================================================
// COLLAGE HALFTONE: la persona recortada como papel impreso (puntos de trama) sobre papel kraft,
// con borde blanco de recorte, movimiento "stop motion" y papeles rasgados.
// =====================================================================
export const CollageHalftone: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  if (s < 0 || s > L || typeof capa._recorte !== "string") return null;
  const E = estiloFinal(ctx.estilo);
  const papel = txt(capa.papel, "#C9A57A");
  const tinta = txt(capa.tinta, "#1B1B1B");
  const acento = txt(capa.acento, E.acento);
  const titulo = txt(capa.titulo);
  // stop motion: la posición cambia cada 3 cuadros
  const paso = Math.floor(f / 3);
  const jx = (random(`jx${paso}`) - 0.5) * 8, jy = (random(`jy${paso}`) - 0.5) * 8, jr = (random(`jr${paso}`) - 0.5) * 1.2;
  const entra = eOut(clamp(s / 0.3)), sale = clamp((s - (L - 0.25)) / 0.25);
  const persona = `${capa._recorte}/${String(f).padStart(6, "0")}.webp`;
  const idPapel = `kraft-${capa.desde}`;
  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sale) }}>
      {/* papel kraft con fibras */}
      <AbsoluteFill style={{ background: papel }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.55 }}>
          <filter id={idPapel}><feTurbulence type="fractalNoise" baseFrequency="0.012 0.18" numOctaves={3} seed={7} /><feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.2  0 0 0 0.9 0" /></filter>
          <rect width={W} height={H} filter={`url(#${idPapel})`} />
        </svg>
      </AbsoluteFill>
      {/* papeles rasgados de color detrás */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${-20 + jx} ${H * 0.18} L ${W * 0.62} ${H * 0.12 + jy} L ${W * 0.66} ${H * 0.3} L ${W * 0.4} ${H * 0.34} L ${-20} ${H * 0.31} Z`} fill={acento} opacity={0.9} />
        <path d={`M ${W * 0.35} ${H * 0.62 + jy} L ${W + 20} ${H * 0.57} L ${W + 20} ${H * 0.8} L ${W * 0.5} ${H * 0.84 + jx} Z`} fill={tinta} opacity={0.85} />
      </svg>
      {/* persona: ya viene como papel impreso (trama, borde blanco y sombra) desde recorte.py */}
      <AbsoluteFill style={{ transform: `translate(${jx}px, ${jy}px) rotate(${jr}deg) scale(1.02)` }}>
        <Img src={staticFile(persona)} style={{ position: "absolute", width: W, height: H }} />
      </AbsoluteFill>
      {titulo ? (
        <div style={{ position: "absolute", left: 50, right: 50, bottom: H * 0.17, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {titulo.split(/\s+/).map((p, i) => {
            const a = eBack(clamp((s - 0.2 - i * 0.12) / 0.3), 2);
            const r = (random(`t${i}${Math.floor(f / 4)}`) - 0.5) * 6;
            return (
              <span key={i} style={{ display: "inline-block", background: i % 2 ? "#fff" : tinta, color: i % 2 ? tinta : "#fff", padding: "6px 18px",
                fontFamily: familia(E.fuenteTitulo), fontSize: 70, textTransform: "uppercase", transform: `rotate(${r}deg) scale(${Math.max(0, a)})`,
                boxShadow: "0 6px 12px rgba(0,0,0,.3)" }}>{p}</span>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
export const sonidosCollage = (c: Capa): SfxPlan[] => [{ archivo: "obturador.wav", en: c.desde, vol: 0.5 }];

// =====================================================================
// CARRUSEL A VIDEO: las imágenes de un carrusel de Instagram pasan como en la app
// (deslizamiento, puntos de página y un zoom lento), encima del video o a pantalla completa.
// =====================================================================
export const CarruselVideo: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  if (s < 0 || s > L) return null;
  const E = estiloFinal(ctx.estilo);
  const imgs = (Array.isArray(capa.imagenes_archivos) ? capa.imagenes_archivos : []).filter((x): x is string => typeof x === "string");
  if (!imgs.length) return null;
  const n = imgs.length;
  const tarjeta = capa.modo === "tarjeta";
  const porSlide = L / n, trans = Math.min(0.45, porSlide * 0.3);
  const idx = Math.min(n - 1, Math.floor(s / porSlide));
  const dentro = s - idx * porSlide;
  const pasando = idx < n - 1 && dentro > porSlide - trans ? eInOut((dentro - (porSlide - trans)) / trans) : 0;
  const entra = eOut(clamp(s / 0.35)), sale = clamp((s - (L - 0.3)) / 0.3);
  // tamaño del slide (4:5, como Instagram)
  const sw = tarjeta ? W * 0.78 : W, sh = sw * 1.25;
  const sy = tarjeta ? (H - sh) / 2 - 40 : (H - sh) / 2;
  const kb = (i: number) => 1 + 0.05 * clamp((s - i * porSlide) / porSlide);
  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sale) }}>
      {!tarjeta ? (
        <AbsoluteFill>
          {/* el desenfoque se hace en una versión pequeña y se agranda: mucho más rápido */}
          <div style={{ width: W / 8, height: H / 8, overflow: "hidden", transform: "scale(8.6)", transformOrigin: "0 0", willChange: "transform" }}>
            <Img src={staticFile(imgs[idx])} style={{ width: W / 8, height: H / 8, objectFit: "cover", filter: "blur(5px) brightness(.55) saturate(1.2)" }} />
          </div>
        </AbsoluteFill>
      ) : null}
      <div style={{ position: "absolute", left: (W - sw) / 2, top: sy, width: sw, height: sh, overflow: "hidden", borderRadius: tarjeta ? 28 : 0,
        boxShadow: tarjeta ? "0 30px 70px rgba(0,0,0,.45)" : undefined, transform: tarjeta ? `scale(${lerp(0.9, 1, entra)})` : undefined }}>
        {[idx, idx + 1].filter((i) => i < n).map((i) => (
          <div key={i} style={{ position: "absolute", inset: 0, transform: `translateX(${((i - idx) - pasando) * sw}px)` }}>
            <Img src={staticFile(imgs[i])} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${kb(i)})` }} />
          </div>
        ))}
        {n > 1 ? (
          <div style={{ position: "absolute", right: 22, top: 22, padding: "6px 16px", borderRadius: 999, background: "rgba(0,0,0,.55)", color: "#fff",
            fontFamily: familia(E.fuente), fontSize: 26 }}>{Math.min(n, idx + 1 + (pasando > 0.5 ? 1 : 0))}/{n}</div>
        ) : null}
      </div>
      {n > 1 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: sy + sh + 28, display: "flex", justifyContent: "center", gap: 12 }}>
          {imgs.map((_, i) => {
            const act = i === idx ? 1 - pasando : i === idx + 1 ? pasando : 0;
            return <div key={i} style={{ width: lerp(14, 16, act), height: lerp(14, 16, act), borderRadius: 99, background: act > 0.5 ? E.acento : "rgba(255,255,255,.55)" }} />;
          })}
        </div>
      ) : null}
      {/* mano/dedo que desliza, sugerido con un círculo */}
      {pasando > 0 && pasando < 1 && capa.dedo !== false ? (
        <div style={{ position: "absolute", left: lerp(W * 0.75, W * 0.25, pasando) - 40, top: sy + sh * 0.6, width: 80, height: 80, borderRadius: 99,
          background: "rgba(255,255,255,.45)", border: "3px solid rgba(255,255,255,.85)", opacity: Math.sin(pasando * Math.PI) }} />
      ) : null}
    </AbsoluteFill>
  );
};
export const sonidosCarrusel = (c: Capa): SfxPlan[] => {
  const n = Array.isArray(c.imagenes_archivos) ? c.imagenes_archivos.length : 0;
  const L = c.hasta - c.desde, por = L / Math.max(1, n), tr = Math.min(0.45, por * 0.3);
  return Array.from({ length: Math.max(0, n - 1) }, (_, i) => ({ archivo: "swoosh_baja.wav", en: c.desde + (i + 1) * por - tr, vol: 0.3 }));
};
