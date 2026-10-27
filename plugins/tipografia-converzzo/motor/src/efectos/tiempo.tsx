// Gráficos de los efectos de tiempo (el cambio de velocidad lo hace tiempo.mjs antes del render).
//  _congelar: destello corto, viñeta, texto con flecha dibujada hacia la cara.
//  _vhs: look de cinta rebobinando (líneas, franja de ruido, "◀◀").
//  _etiqueta: una etiqueta corta, por ejemplo "0.5x" o "x4".
import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, SfxPlan, caraEntre, clamp, eBack, eOut, estiloFinal, familia, lerp } from "../lib/base";

const ventana = (c: Capa, t: number) => ({ s: t - c.desde, L: c.hasta - c.desde, dentro: t >= c.desde && t <= c.hasta });

export const Congelar: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { s, L, dentro } = ventana(capa, f / fps);
  if (!dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const color = String(capa.color ?? E.acento);
  const texto = typeof capa.texto === "string" ? capa.texto : "";
  const sale = clamp((s - (L - 0.2)) / 0.2);
  const cara = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const cx = (cara.x + cara.w / 2) * W, cy = (cara.y + cara.h / 2) * H;
  // texto debajo de la cara (o arriba si la cara está muy abajo)
  const abajo = (cara.y + cara.h) * H < H * 0.62;
  const ty = abajo ? Math.min(H * 0.78, (cara.y + cara.h) * H + 260) : Math.max(H * 0.1, cara.y * H - 300);
  const tx = W / 2;
  const entra = eBack(clamp((s - 0.12) / 0.3), 1.4);
  const dibuja = eOut(clamp((s - 0.3) / 0.45));
  // flecha a mano desde el texto hacia el borde de la cara
  const x0 = tx + (cx < W / 2 ? 120 : -120), y0 = ty + (abajo ? -40 : 40);
  const x1 = cx + (cx < W / 2 ? cara.w * W * 0.55 : -cara.w * W * 0.55), y1 = cy + (abajo ? cara.h * H * 0.45 : -cara.h * H * 0.2);
  const mx = (x0 + x1) / 2 + (abajo ? 90 : -90), my = (y0 + y1) / 2;
  const ang = Math.atan2(y1 - my, x1 - mx);
  const punta = (d: number) => `M ${x1 - 34 * Math.cos(ang - d)} ${y1 - 34 * Math.sin(ang - d)} L ${x1} ${y1} L ${x1 - 34 * Math.cos(ang + d)} ${y1 - 34 * Math.sin(ang + d)}`;
  return (
    <AbsoluteFill style={{ opacity: 1 - sale, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#fff", opacity: clamp(0.6 - s / 0.18) }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,.45) 100%)" }} />
      {texto ? (
        <>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <path d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round"
              pathLength={1} strokeDasharray={`${dibuja} 1`} style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,.4))" }} />
            {dibuja >= 1 ? <path d={punta(0.5)} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /> : null}
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: ty - 60, display: "flex", justifyContent: "center" }}>
            <div style={{ transform: `scale(${Math.max(0, entra)}) rotate(-3deg)`, background: color, color: "#fff", fontFamily: familia(E.fuenteTitulo),
              fontSize: texto.length > 18 ? 52 : 64, padding: "18px 34px", borderRadius: 18, maxWidth: W * 0.8, textAlign: "center", lineHeight: 1.05,
              boxShadow: "0 18px 40px rgba(0,0,0,.35)", letterSpacing: "-0.02em" }}>{texto}</div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const Vhs: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { s, L, dentro } = ventana(capa, f / fps);
  if (!dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const k = clamp(Math.min(s / 0.08, (L - s) / 0.08, 1));
  const banda = ((s * 1.7) % 1) * (H + 200) - 100;
  const parpadeo = Math.floor(f / Math.max(1, Math.round(fps / 4))) % 2 === 0;
  return (
    <AbsoluteFill style={{ opacity: k, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "rgba(40,60,140,.18)", mixBlendMode: "color" }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0px, rgba(0,0,0,.22) 2px, transparent 2px, transparent 5px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: banda, height: 70 + random(`b${f}`) * 60, background: "rgba(255,255,255,.16)", filter: "blur(6px)",
        transform: `translateX(${(random(`x${f}`) - 0.5) * 40}px)` }} />
      <div style={{ position: "absolute", left: 70, top: 170, color: "#fff", fontFamily: familia(E.fuenteTitulo), fontSize: 64, letterSpacing: "0.04em",
        textShadow: "3px 0 rgba(255,0,60,.8), -3px 0 rgba(0,200,255,.8)", opacity: parpadeo ? 1 : 0.75 }}>
        ◀◀ {String(capa.texto ?? "REBOBINANDO")}
      </div>
    </AbsoluteFill>
  );
};

export const Etiqueta: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, L, dentro } = ventana(capa, f / fps);
  if (!dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const a = eBack(clamp(s / 0.3)), b = clamp((s - (L - 0.2)) / 0.2);
  return (
    <div style={{ position: "absolute", right: 70, top: 170, transform: `scale(${Math.max(0, a) * lerp(1, 0.6, b)})`, opacity: 1 - b, background: "rgba(0,0,0,.6)",
      color: "#fff", fontFamily: familia(E.fuenteTitulo), fontSize: 54, padding: "12px 28px", borderRadius: 999 }}>{String(capa.texto)}</div>
  );
};

export const sonidosTiempo = (c: Capa): SfxPlan[] => {
  switch (c.efecto) {
    case "_congelar": return [{ archivo: "freeze.wav", en: c.desde, vol: 0.55 }];
    case "_vhs": return [{ archivo: "rewind.wav", en: c.desde, vol: 0.5 }];
    default: return [];
  }
};
