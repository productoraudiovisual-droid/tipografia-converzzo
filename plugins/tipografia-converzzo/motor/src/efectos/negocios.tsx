// Efectos para negocios: antes-despues, cta-whatsapp, paso-a-paso, comparativo, ficha y ubicacion.
// Todos usan el estilo del plan (colores y fuentes) y se ubican solos sin tapar la cara.
import React from "react";
import { AbsoluteFill, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, SfxPlan, caraEntre, clamp, eBack, eIn, eInOut, eOut, estiloFinal, familia, lerp, num } from "../lib/base";

// ---------- utilidades compartidas ----------
const txt = (v: unknown, d = "") => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);
const lista = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : txt((x as { texto?: unknown })?.texto))).filter(Boolean) : []);

// Altura donde va una tarjeta de alto CH: debajo de la cara; si no cabe, arriba. `y` (0..1) la fija a mano.
const ubicarY = (capa: Capa, ctx: Ctx, CH: number, H: number) => {
  if (typeof capa.y === "number") return capa.y * H;
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const bajo = (c.y + c.h) * H, limite = H * 0.86 - CH;
  if (bajo + 60 <= limite) return clamp(bajo + 60, H * 0.46, limite);
  return Math.max(H * 0.07, c.y * H - CH - 50 > H * 0.07 ? H * 0.08 : H * 0.07);
};
// Entrada con rebote y salida suave en los últimos 0,3 s.
const useVida = (capa: Capa) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  return { f, fps, t, s, L, dentro: s >= -0.02 && s <= L + 0.02, entra: eBack(clamp(s / 0.42), 1.5), sale: eIn(clamp((s - (L - 0.3)) / 0.3)) };
};
const tarjeta = (fondo: string): React.CSSProperties => ({ background: fondo, borderRadius: 30, boxShadow: "0 26px 60px rgba(0,0,0,.33), 0 4px 12px rgba(0,0,0,.15)" });
const Check: React.FC<{ color: string; t: number; size?: number }> = ({ color, t, size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44"><circle cx="22" cy="22" r="22" fill={color} />
    <path d="M12 22.5 L19 29.5 L32 15" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${t} 1`} /></svg>
);
const Equis: React.FC<{ color: string; size?: number }> = ({ color, size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44"><circle cx="22" cy="22" r="22" fill={color} />
    <path d="M15 15 L29 29 M29 15 L15 29" stroke="#fff" strokeWidth="5" strokeLinecap="round" /></svg>
);

// =====================================================================
// 1. PASO A PASO: lista numerada que aparece al ritmo en que se dice cada paso
// =====================================================================
export const PasoAPaso: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const pasos = (Array.isArray(capa.pasos) ? capa.pasos : []).map((p, i, arr) => {
    const o = (typeof p === "string" ? { texto: p } : p) as { texto?: string; en?: number };
    const en = typeof o.en === "number" ? o.en : capa.desde + 0.5 + (i * (capa.hasta - capa.desde - 1)) / Math.max(1, arr.length);
    return { texto: txt(o.texto), en };
  });
  const titulo = txt(capa.titulo);
  const fs = pasos.length > 4 ? 34 : 40, fila = fs * 1.9;
  const CH = 60 + (titulo ? 70 : 0) + pasos.length * fila;
  const CW = W - 140;
  const top = ubicarY(capa, ctx, CH, H);
  return (
    <div style={{ position: "absolute", left: 70, top, width: CW, opacity: clamp(v.entra * 3) * (1 - v.sale),
      transform: `translateY(${(1 - v.entra) * 70}px) scale(${lerp(0.92, 1, v.entra)})` }}>
      <div style={{ ...tarjeta(E.fondo), padding: "28px 34px" }}>
        {titulo ? <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 44, color: E.texto, letterSpacing: "-0.02em", marginBottom: 16 }}>{titulo}</div> : null}
        {pasos.map((p, i) => {
          const a = clamp((v.t - p.en + 0.1) / 0.35);
          const actual = v.t >= p.en - 0.1 && (i === pasos.length - 1 || v.t < pasos[i + 1].en - 0.1);
          const hecho = i < pasos.length - 1 && v.t >= pasos[i + 1].en - 0.1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, height: fila, opacity: a <= 0 ? 0.18 : hecho ? 0.55 : 1,
              transform: `translateX(${(1 - eOut(a)) * -30}px)` }}>
              <div style={{ width: fs * 1.35, height: fs * 1.35, flex: "none", borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
                background: actual || hecho ? E.acento : "#E6E6E6", color: actual || hecho ? "#fff" : E.suave, fontFamily: familia(E.fuenteTitulo), fontSize: fs * 0.75,
                transform: `scale(${actual ? 1 + 0.12 * Math.sin(clamp((v.t - p.en) / 0.3) * Math.PI) : 1})` }}>{i + 1}</div>
              <div style={{ fontFamily: familia(E.fuente), fontSize: fs, color: E.texto, lineHeight: 1.1, textDecoration: hecho ? "line-through" : undefined,
                textDecorationColor: E.acento, textDecorationThickness: 4 }}>{p.texto}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const sonidosPasos = (c: Capa): SfxPlan[] => {
  const pasos = Array.isArray(c.pasos) ? c.pasos : [];
  return [{ archivo: "pop.wav", en: c.desde, vol: 0.4 }, ...pasos.map((p, i) => {
    const en = typeof (p as { en?: number })?.en === "number" ? (p as { en: number }).en : c.desde + 0.5 + (i * (c.hasta - c.desde - 1)) / Math.max(1, pasos.length);
    return { archivo: "tick.wav", en, vol: 0.5 };
  })];
};

// =====================================================================
// 2. COMPARATIVO: dos columnas (ellos vs nosotros, opción A vs B)
// =====================================================================
export const Comparativo: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const izq = (capa.izquierda ?? {}) as { titulo?: string; puntos?: unknown };
  const der = (capa.derecha ?? {}) as { titulo?: string; puntos?: unknown };
  const pi = lista(izq.puntos), pd = lista(der.puntos);
  const filas = Math.max(pi.length, pd.length);
  const ganador = capa.ganador === "izquierda" || capa.ganador === "izq" ? "izq" : capa.ganador === "ninguno" ? "" : "der";
  const paso = Math.min(0.6, Math.max(0.25, (v.L - 1.4) / Math.max(1, filas)));
  const fs = 32, fila = 74, CW = W - 100, CH = 120 + filas * fila + 40;
  const top = ubicarY(capa, ctx, CH, H);
  const col = (titulo: string, puntos: string[], lado: "izq" | "der") => {
    const gana = ganador === lado, otro = ganador && !gana;
    return (
      <div style={{ flex: 1, padding: "0 10px" }}>
        <div style={{ textAlign: "center", padding: "12px 0", borderRadius: 16, background: gana ? E.acento : "#ECECEC", color: gana ? "#fff" : E.texto,
          fontFamily: familia(E.fuenteTitulo), fontSize: 36, marginBottom: 18 }}>{titulo}</div>
        {Array.from({ length: filas }).map((_, i) => {
          const a = clamp((v.s - 0.5 - i * paso) / 0.3);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, height: fila, opacity: eOut(a), transform: `translateY(${(1 - eOut(a)) * 16}px)` }}>
              {puntos[i] ? (gana || !ganador ? <Check color="#22C55E" t={a} size={38} /> : otro ? <Equis color="#EF4444" size={38} /> : null) : null}
              <div style={{ fontFamily: familia(E.fuente), fontSize: fs, color: E.texto, lineHeight: 1.08, opacity: otro ? 0.7 : 1 }}>{puntos[i] ?? ""}</div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 50, top, width: CW, opacity: clamp(v.entra * 3) * (1 - v.sale), transform: `translateY(${(1 - v.entra) * 70}px)` }}>
      <div style={{ ...tarjeta(E.fondo), padding: "26px 18px", display: "flex", position: "relative" }}>
        {col(txt(izq.titulo, "Ellos"), pi, "izq")}
        <div style={{ width: 3, background: "#EEE", margin: "70px 4px 10px" }} />
        {col(txt(der.titulo, "Nosotros"), pd, "der")}
        <div style={{ position: "absolute", left: "50%", top: 18, transform: `translateX(-50%) scale(${Math.max(0, eBack(clamp((v.s - 0.25) / 0.35), 2))})`,
          width: 76, height: 76, borderRadius: 99, background: E.sticker, color: E.stickerTexto, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: familia(E.fuenteTitulo), fontSize: 30, border: "5px solid #fff", boxShadow: "0 8px 18px rgba(0,0,0,.25)" }}>VS</div>
      </div>
    </div>
  );
};
export const sonidosComparativo = (c: Capa): SfxPlan[] => [{ archivo: "pop.wav", en: c.desde, vol: 0.45 }, { archivo: "stamp.wav", en: c.desde + 0.28, vol: 0.4 }];

// =====================================================================
// 3. FICHA: tarjeta de producto u outfit con línea que señala el producto
// =====================================================================
export const Ficha: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const titulo = txt(capa.titulo), detalles = lista(capa.detalles), precio = txt(capa.precio);
  const CW = 470, CH = 80 + (titulo.length > 20 ? 92 : 50) + detalles.length * 52 + (precio ? 80 : 0);
  const punto = capa.punto as { x?: number; y?: number } | undefined;
  const px = punto && typeof punto.x === "number" ? punto.x * W : null, py = punto && typeof punto.y === "number" ? punto.y * H : null;
  let left: number, top: number;
  if (px !== null && py !== null) {
    left = px > W / 2 ? Math.max(40, px - CW - 120) : Math.min(W - CW - 40, px + 120);
    top = clamp(py - CH / 2 - 120, H * 0.07, H * 0.86 - CH);
  } else {
    const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
    left = (c.x + c.w / 2) > 0.55 ? 50 : W - CW - 50;
    top = ubicarY(capa, ctx, CH, H);
  }
  const linea = eOut(clamp((v.s - 0.15) / 0.4));
  const ex = px !== null ? (px > W / 2 ? left + CW : left) : 0, ey = top + 60;
  return (
    <AbsoluteFill style={{ opacity: 1 - v.sale, pointerEvents: "none" }}>
      {px !== null && py !== null ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <circle cx={px} cy={py} r={14 + 10 * ((v.s * 1.5) % 1)} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - ((v.s * 1.5) % 1)} />
          <circle cx={px} cy={py} r={11} fill="#fff" stroke={E.acento} strokeWidth={5} />
          <path d={`M ${px} ${py} L ${lerp(px, ex, 0.5)} ${ey} L ${ex} ${ey}`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round"
            pathLength={1} strokeDasharray={`${linea} 1`} style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.4))" }} />
        </svg>
      ) : null}
      <div style={{ position: "absolute", left, top, width: CW, opacity: clamp((v.s - 0.35) / 0.15), transform: `scale(${lerp(0.9, 1, eBack(clamp((v.s - 0.35) / 0.4)))})`,
        transformOrigin: px !== null && px > W / 2 ? "100% 20%" : "0% 20%" }}>
        <div style={{ ...tarjeta(E.fondo), padding: "28px 32px" }}>
          <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 42, color: E.texto, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{titulo}</div>
          <div style={{ height: 4, width: 70, background: E.acento, borderRadius: 4, margin: "14px 0 10px" }} />
          {detalles.map((d, i) => {
            const a = eOut(clamp((v.s - 0.6 - i * 0.15) / 0.3));
            return <div key={i} style={{ fontFamily: familia(E.fuente), fontSize: 30, color: E.texto, opacity: 0.85 * a, lineHeight: "52px", transform: `translateX(${(1 - a) * 14}px)` }}>· {d}</div>;
          })}
          {precio ? (
            <div style={{ display: "inline-block", marginTop: 14, padding: "10px 22px", borderRadius: 14, background: E.texto, color: E.fondo,
              fontFamily: familia(E.fuenteTitulo), fontSize: 40, transform: `scale(${Math.max(0, eBack(clamp((v.s - 0.6 - detalles.length * 0.15) / 0.35)))})`, transformOrigin: "left center" }}>{precio}</div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
export const sonidosFicha = (c: Capa): SfxPlan[] => [{ archivo: "whoosh.wav", en: c.desde + 0.1, vol: 0.25 }, { archivo: "pop.wav", en: c.desde + 0.35, vol: 0.45 }];

// =====================================================================
// 4. CTA WHATSAPP: botón verde con chat, número y toque
// =====================================================================
export const CtaWhatsapp: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const verde = txt(capa.color, "#25D366");
  const texto = txt(capa.texto, "Escríbenos por WhatsApp"), numero = txt(capa.numero), sub = txt(capa.subtexto);
  const CW = W - 160, CH = 150 + (numero ? 60 : 0) + (sub ? 50 : 0);
  const top = typeof capa.y === "number" ? capa.y * H : Math.min(H * 0.86 - CH, Math.max(ubicarY(capa, ctx, CH, H), H * 0.62));
  const toque = Math.min(v.L - 0.6, 1.2);
  const tq = clamp((v.s - toque) / 0.45);
  const presion = v.s > toque && v.s < toque + 0.18 ? 0.95 : 1;
  const pulso = (v.s * 1.1) % 1;
  return (
    <div style={{ position: "absolute", left: 80, top, width: CW, opacity: clamp(v.entra * 3) * (1 - v.sale),
      transform: `translateY(${(1 - v.entra) * 80}px) scale(${lerp(0.85, 1, v.entra) * presion})` }}>
      <div style={{ position: "absolute", inset: -10 - pulso * 26, borderRadius: 60, border: `4px solid ${verde}`, opacity: 0.6 * (1 - pulso) }} />
      <div style={{ ...tarjeta(verde), borderRadius: 48, padding: "28px 36px", display: "flex", alignItems: "center", gap: 26 }}>
        {/* ícono de chat genérico */}
        <svg width={96} height={96} viewBox="0 0 96 96" style={{ flex: "none" }}>
          <circle cx="48" cy="48" r="48" fill="#fff" />
          <path d="M26 30 h44 a8 8 0 0 1 8 8 v20 a8 8 0 0 1 -8 8 h-24 l-14 12 v-12 h-6 a8 8 0 0 1 -8 -8 v-20 a8 8 0 0 1 8 -8z" fill={verde} />
          <circle cx="36" cy="48" r="4.5" fill="#fff" /><circle cx="48" cy="48" r="4.5" fill="#fff" /><circle cx="60" cy="48" r="4.5" fill="#fff" />
        </svg>
        <div>
          <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: texto.length > 24 ? 40 : 46, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em" }}>{texto}</div>
          {numero ? <div style={{ fontFamily: familia(E.fuente), fontSize: 36, color: "#fff", opacity: 0.95, marginTop: 8, letterSpacing: "0.02em" }}>{numero}</div> : null}
          {sub ? <div style={{ fontFamily: familia(E.fuente), fontSize: 28, color: "#fff", opacity: 0.85, marginTop: 6 }}>{sub}</div> : null}
        </div>
      </div>
      {/* toque del dedo */}
      {v.s > toque ? (
        <div style={{ position: "absolute", left: CW * 0.72, top: CH * 0.45, width: 70, height: 70, marginLeft: -35, marginTop: -35, borderRadius: 99,
          background: "rgba(255,255,255,.55)", transform: `scale(${0.4 + tq * 1.4})`, opacity: 1 - tq }} />
      ) : null}
    </div>
  );
};
export const sonidosCta = (c: Capa): SfxPlan[] => [{ archivo: "pop.wav", en: c.desde, vol: 0.5 }, { archivo: "tick.wav", en: c.desde + Math.min(c.hasta - c.desde - 0.6, 1.2), vol: 0.7 }];

// =====================================================================
// 5. UBICACIÓN: mini mapa ilustrado con pin, nombre, dirección y horario
// =====================================================================
export const Ubicacion: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const nombre = txt(capa.nombre), direccion = txt(capa.direccion), horario = txt(capa.horario);
  const CW = W - 160, MAPA = 230, CH = MAPA + 60 + (nombre ? 56 : 0) + (direccion ? 46 : 0) + (horario ? 64 : 0);
  const top = ubicarY(capa, ctx, CH, H);
  const ruta = eInOut(clamp((v.s - 0.3) / 0.8));
  const pin = eBack(clamp((v.s - 0.9) / 0.4), 2);
  const mw = CW - 40;
  return (
    <div style={{ position: "absolute", left: 80, top, width: CW, opacity: clamp(v.entra * 3) * (1 - v.sale), transform: `translateY(${(1 - v.entra) * 70}px) scale(${lerp(0.92, 1, v.entra)})` }}>
      <div style={{ ...tarjeta(E.fondo), padding: 20 }}>
        <svg width={mw} height={MAPA} style={{ display: "block", borderRadius: 20, background: "#EEF1EC" }}>
          {/* manzanas y calles ilustradas */}
          {[0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2].map((j) => (
            <rect key={`${i}-${j}`} x={14 + i * (mw / 6)} y={14 + j * 74} width={mw / 6 - 22} height={56} rx={8} fill={(i + j) % 4 === 0 ? "#D9EBD3" : "#E2E5DF"} />
          )))}
          <path d={`M 30 ${MAPA - 20} C ${mw * 0.3} ${MAPA - 30}, ${mw * 0.35} 60, ${mw * 0.62} 92`} fill="none" stroke={E.acento} strokeWidth={8}
            strokeLinecap="round" strokeDasharray="1 0" pathLength={1} style={{ strokeDasharray: `${ruta} 1` }} />
          <circle cx={30} cy={MAPA - 20} r={10} fill="#fff" stroke={E.texto} strokeWidth={4} />
          <g transform={`translate(${mw * 0.62} ${92}) scale(${Math.max(0, pin)}) translate(0 ${(1 - clamp(pin)) * -40})`}>
            <ellipse cx={0} cy={4} rx={16} ry={6} fill="rgba(0,0,0,.2)" />
            <path d="M0 0 C -26 -30 -26 -62 0 -62 C 26 -62 26 -30 0 0 Z" fill={E.acento} />
            <circle cx={0} cy={-40} r={10} fill="#fff" />
          </g>
        </svg>
        <div style={{ padding: "18px 14px 6px" }}>
          {nombre ? <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 44, color: E.texto, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{nombre}</div> : null}
          {direccion ? <div style={{ fontFamily: familia(E.fuente), fontSize: 30, color: E.texto, opacity: 0.75, marginTop: 8 }}>{direccion}</div> : null}
          {horario ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 14, padding: "8px 18px", borderRadius: 999, background: "#E8F8EE", color: "#15803D",
              fontFamily: familia(E.fuente), fontSize: 28, opacity: eOut(clamp((v.s - 1.2) / 0.3)) }}>
              <span style={{ width: 12, height: 12, borderRadius: 99, background: "#22C55E", display: "inline-block" }} />{horario}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export const sonidosUbicacion = (c: Capa): SfxPlan[] => [{ archivo: "pop.wav", en: c.desde, vol: 0.4 }, { archivo: "stamp.wav", en: c.desde + 0.95, vol: 0.45 }];

// =====================================================================
// 6. ANTES Y DESPUÉS: pantalla dividida con barra deslizante
// =====================================================================
const Medio: React.FC<{ fuente: string | number; ctx: Ctx; desde: number; quieto: boolean }> = ({ fuente, ctx, desde, quieto }) => {
  const { fps, width: W, height: H } = useVideoConfig();
  const estilo: React.CSSProperties = { position: "absolute", width: W, height: H, objectFit: "cover" };
  if (typeof fuente === "string") {
    const esVideo = /\.(mp4|mov|webm|m4v)$/i.test(fuente);
    if (!esVideo) return <Img src={staticFile(fuente)} style={estilo} />;
    const v = <OffthreadVideo src={staticFile(fuente)} muted style={estilo} />;
    return <Sequence from={Math.round(desde * fps)} layout="none">{quieto ? <Freeze frame={0}>{v}</Freeze> : v}</Sequence>;
  }
  // un instante del mismo video
  const v = <OffthreadVideo src={staticFile(ctx.video ?? "")} muted trimBefore={Math.max(0, Math.round(fuente * fps))} style={estilo} />;
  return <Sequence from={Math.round(desde * fps)} layout="none">{quieto ? <Freeze frame={0}>{v}</Freeze> : v}</Sequence>;
};
export const AntesDespues: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const fA = (typeof capa.antes_archivo === "string" ? capa.antes_archivo : num(capa.antes_en, 0)) as string | number;
  const fD = (typeof capa.despues_archivo === "string" ? capa.despues_archivo : num(capa.despues_en, capa.desde)) as string | number;
  const quieto = capa.quieto !== false;
  const horizontal = capa.division === "horizontal";
  const [eA, eD] = Array.isArray(capa.etiquetas) ? [txt(capa.etiquetas[0], "ANTES"), txt(capa.etiquetas[1], "DESPUÉS")] : ["ANTES", "DESPUÉS"];
  // barra: aparece en el borde, barre hasta casi el otro lado y se queda en el centro
  const s = v.s;
  const pos = s < 0.35 ? 1 : s < 1.3 ? lerp(1, 0.12, eInOut((s - 0.35) / 0.95)) : s < 2.1 ? lerp(0.12, 0.5, eInOut((s - 1.3) / 0.8)) : 0.5;
  const fade = clamp(s / 0.25) * (1 - v.sale);
  const corte = horizontal ? `inset(0 0 ${(1 - pos) * 100}% 0)` : `inset(0 ${(1 - pos) * 100}% 0 0)`;
  const lx = horizontal ? 0 : pos * W, ly = horizontal ? pos * H : 0;
  const pill = (t: string, fondo: string, color: string, st: React.CSSProperties) => (
    <div style={{ position: "absolute", padding: "12px 26px", borderRadius: 999, background: fondo, color, fontFamily: familia(E.fuenteTitulo), fontSize: 40,
      letterSpacing: "0.04em", boxShadow: "0 10px 24px rgba(0,0,0,.3)", ...st }}>{t}</div>
  );
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill><Medio fuente={fD} ctx={ctx} desde={capa.desde} quieto={quieto} /></AbsoluteFill>
      <AbsoluteFill style={{ clipPath: corte }}><Medio fuente={fA} ctx={ctx} desde={capa.desde} quieto={quieto} /></AbsoluteFill>
      <div style={horizontal ? { position: "absolute", left: 0, right: 0, top: ly - 3, height: 6, background: "#fff" } : { position: "absolute", top: 0, bottom: 0, left: lx - 3, width: 6, background: "#fff" }} />
      <div style={{ position: "absolute", left: (horizontal ? W / 2 : lx) - 44, top: (horizontal ? ly : H * 0.5) - 44, width: 88, height: 88, borderRadius: 99, background: "#fff",
        boxShadow: "0 8px 22px rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: E.texto, fontFamily: familia(E.fuenteTitulo), fontSize: 34,
        transform: horizontal ? "rotate(90deg)" : undefined }}>‹ ›</div>
      {pill(eA, E.texto, E.fondo, horizontal ? { left: 50, top: 150 } : { left: 50, top: 150, opacity: clamp(pos * 3 - 0.3) })}
      {pill(eD, E.acento, "#fff", horizontal ? { left: 50, top: H / 2 + 50 } : { right: 50, top: 150, opacity: clamp((1 - pos) * 3 - 0.3) })}
    </AbsoluteFill>
  );
};
export const sonidosAntesDespues = (c: Capa): SfxPlan[] => [{ archivo: "whoosh.wav", en: c.desde + 0.35, vol: 0.35 }, { archivo: "whoosh.wav", en: c.desde + 1.3, vol: 0.25 }];
