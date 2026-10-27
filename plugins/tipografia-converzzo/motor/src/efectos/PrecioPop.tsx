// /precio-pop · Etiqueta de precio con descuento que aparece junto al producto sin tapar la cara.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Ctx, SfxPlan, caraEntre, clamp, eBack, eIn, eOut, estiloFinal, familia, lerp } from "../lib/base";

export type Tarjeta = {
  producto?: string;      // "Sérum de vitamina C"
  antes?: string;         // "$89.900"
  ahora: string;          // "$59.900"
  descuento?: string;     // "-33%" (si no viene, se calcula)
  nota?: string;          // "Solo hoy" / "Envío gratis"
  desde: number; hasta: number;   // segundos
  lado?: "auto" | "izq" | "der";
  y?: number;             // 0..1, borde superior de la tarjeta (opcional)
};

// ---------- precios ----------
type Precio = { pre: string; n: number; suf: string; dec: number; sepMil: string; sepDec: string };
const leerPrecio = (s?: string): Precio | null => {
  if (!s) return null;
  const m = s.trim().match(/^([^\d]*)([\d][\d.,\s]*)([^\d]*)$/);
  if (!m) return null;
  let cuerpo = m[2].replace(/\s/g, "");
  let dec = 0, sepDec = ",", sepMil = ".";
  const d = cuerpo.match(/([.,])(\d{1,2})$/);
  if (d && !(d[1] === "." && /\.\d{3}/.test(cuerpo) && d[2].length !== 2)) {
    // termina en 1 o 2 dígitos tras un separador → son decimales
    if (d[2].length <= 2) { dec = d[2].length; sepDec = d[1]; sepMil = d[1] === "," ? "." : ","; cuerpo = cuerpo.slice(0, -d[0].length) + "." + d[2]; }
  }
  if (!dec) { const s1 = cuerpo.match(/[.,]/); sepMil = s1 ? s1[0] : "."; }
  const n = parseFloat(dec ? cuerpo.replace(/[.,](?=.*\.)/g, "") : cuerpo.replace(/[.,]/g, ""));
  return isFinite(n) ? { pre: m[1], n, suf: m[3], dec, sepMil, sepDec } : null;
};
const escribir = (p: Precio, n: number) => {
  const [ent, frac] = n.toFixed(p.dec).split(".");
  const conMil = ent.replace(/\B(?=(\d{3})+(?!\d))/g, p.sepMil);
  return { pre: p.pre, num: frac ? conMil + p.sepDec + frac : conMil, suf: p.suf };
};

// ---------- una tarjeta ----------
export const PrecioPop: React.FC<{ capa: Tarjeta; ctx: Ctx }> = ({ capa: t, ctx: props }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const E = estiloFinal(props.estilo);
  const fT = familia(E.fuenteTitulo), fB = familia(E.fuente);
  const s = f / fps - t.desde;
  const largo = t.hasta - t.desde;
  if (s < -0.05 || s > largo + 0.05) return null;
  const k = clamp((largo - 0.35) / 2.3, 0.45, 1);           // comprime la coreografía si la ventana es corta
  const p = (a: number, d: number) => clamp((s - a * k) / (d * k));

  const antes = leerPrecio(t.antes), ahora = leerPrecio(t.ahora);
  const descuento = t.descuento ?? (antes && ahora && antes.n > ahora.n ? `-${Math.round((1 - ahora.n / antes.n) * 100)}%` : undefined);

  // medidas
  const CW = 500;
  const largoNombre = (t.producto ?? "").length;
  const CH = 60 + (t.producto ? (largoNombre > 22 ? 80 : 44) : 0) + (antes ? 52 : 0) + 120 + (t.nota ? 70 : 0);
  const fin = ahora ? escribir(ahora, ahora.n) : { pre: "", num: t.ahora, suf: "" };
  const fsPrecio = Math.min(112, 392 / (fin.num.length * 0.68 + fin.pre.length * 0.4 + fin.suf.length * 0.42));

  // ubicación: debajo de la barbilla, del lado con más aire; si no cabe, arriba
  const c = caraEntre(props.caras, t.desde, t.hasta);
  const bajoCara = (c.y + c.h) * H;
  const limiteInf = H * 0.86 - CH;                             // zona segura de Reels abajo
  let top = t.y !== undefined ? t.y * H : clamp(bajoCara + 70, H * 0.5, limiteInf);
  if (t.y === undefined && bajoCara + 70 > limiteInf) top = H * 0.08;
  const cx = (c.x + c.w / 2) * W;
  const lado = t.lado && t.lado !== "auto" ? t.lado : cx > W * 0.58 ? "izq" : cx < W * 0.42 ? "der" : "izq";
  const left = lado === "izq" ? 56 : W - CW - 120;

  // coreografía
  const entra = eBack(p(0, 0.42), 1.5);
  const sale = eIn(clamp((s - (largo - 0.3)) / 0.3));
  const aterriza = 1.35;
  const roll = eOut(p(0.75, 0.6));
  const golpe = s > aterriza * k ? Math.sin(clamp((s - aterriza * k) / (0.22 * k)) * Math.PI) : 0;
  const flota = s > 1.6 * k ? Math.sin((s - 1.6 * k) * 2.4) * 4 : 0;
  const valor = antes && ahora ? lerp(antes.n, ahora.n, roll) : ahora?.n ?? 0;
  const precio = ahora ? escribir(ahora, roll >= 1 || !antes ? ahora.n : valor) : { pre: "", num: t.ahora, suf: "" };
  const tachon = eOut(p(0.55, 0.25));
  const sello = eBack(p(1.38, 0.3), 2.2);
  const brillo = p(1.9, 0.6);

  return (
    <div style={{ position: "absolute", left, top, width: CW, transformOrigin: "30% 100%",
      transform: `translateY(${(1 - entra) * 90 + sale * 30 + flota}px) scale(${lerp(0.85, 1, entra) * lerp(1, 0.9, sale)}) rotate(${lerp(-7, -2, entra)}deg)`,
      opacity: clamp(entra * 3) * (1 - sale) }}>
      {/* tarjeta */}
      <div style={{ position: "relative", background: E.fondo, borderRadius: 34, padding: "30px 34px 28px 66px", overflow: "hidden",
        boxShadow: "0 26px 60px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.18)" }}>
        {/* agujero de etiqueta */}
        <div style={{ position: "absolute", left: 24, top: 34, width: 22, height: 22, borderRadius: 99, background: "rgba(0,0,0,.14)", boxShadow: "inset 0 2px 4px rgba(0,0,0,.25)" }} />
        {t.producto ? (
          <div style={{ fontFamily: fB, fontSize: 27, lineHeight: 1.2, color: E.texto, opacity: 0.8 * eOut(p(0.15, 0.25)), textTransform: "uppercase", letterSpacing: "0.04em",
            transform: `translateY(${(1 - eOut(p(0.15, 0.25))) * 14}px)`, maxWidth: 360 }}>{t.producto}</div>
        ) : null}
        {antes ? (
          <div style={{ position: "relative", display: "inline-block", marginTop: 10, fontFamily: fB, fontSize: 34, color: E.suave, opacity: eOut(p(0.3, 0.2)) }}>
            {t.antes}
            <div style={{ position: "absolute", left: -4, top: "52%", height: 5, borderRadius: 4, background: E.acento, width: `calc(${tachon * 100}% + ${tachon * 8}px)`, transform: "rotate(-4deg)" }} />
          </div>
        ) : null}
        <div style={{ fontFamily: fT, color: E.texto, lineHeight: 1, marginTop: 6, whiteSpace: "nowrap", letterSpacing: "-0.03em",
          transform: `scale(${1 + golpe * 0.08})`, transformOrigin: "left center", opacity: antes ? 1 : eOut(p(0.6, 0.2)) }}>
          <span style={{ fontSize: fsPrecio * 0.55, verticalAlign: "top", position: "relative", top: fsPrecio * 0.08 }}>{precio.pre}</span>
          <span style={{ fontSize: fsPrecio, fontVariantNumeric: "tabular-nums" }}>{precio.num}</span>
          <span style={{ fontSize: fsPrecio * 0.42 }}>{precio.suf}</span>
        </div>
        {t.nota ? (
          <div style={{ display: "inline-block", marginTop: 14, padding: "9px 20px", borderRadius: 999, background: E.acento, color: "#fff", fontFamily: fB, fontSize: 26,
            transform: `scale(${Math.max(0, eBack(p(1.6, 0.3)))})`, transformOrigin: "left center" }}>{t.nota}</div>
        ) : null}
        {/* brillo */}
        <div style={{ position: "absolute", top: -40, bottom: -40, width: 120, left: lerp(-200, CW + 100, brillo), opacity: brillo > 0 && brillo < 1 ? 1 : 0,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent)", transform: "rotate(18deg)" }} />
      </div>
      {/* sello de descuento */}
      {descuento ? (
        <div style={{ position: "absolute", right: -52, top: -56, width: 150, height: 150, borderRadius: 999, background: E.sticker, color: E.stickerTexto,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fT, fontSize: descuento.length > 4 ? 38 : 46, letterSpacing: "-0.03em",
          boxShadow: "0 14px 30px rgba(0,0,0,.3)", border: "5px solid rgba(255,255,255,.9)",
          transform: `scale(${Math.max(0, lerp(2.2, 1, sello)) * (sello > 0 ? 1 : 0)}) rotate(${lerp(25, -14, sello)}deg)`, opacity: clamp(sello * 4) }}>{descuento}</div>
      ) : null}
    </div>
  );
};

// Sonidos de la etiqueta: pop al entrar, conteo, ding al aterrizar y golpe del sello.
export const sonidosPrecio = (t: Tarjeta): SfxPlan[] => {
  const k = clamp((t.hasta - t.desde - 0.35) / 2.3, 0.45, 1);
  const conRoll = !!(leerPrecio(t.antes) && leerPrecio(t.ahora));
  const sello = !!(t.descuento || conRoll);
  return [
    { archivo: "pop.wav", en: t.desde, vol: 0.55 },
    ...(conRoll ? [0.8, 0.92, 1.04, 1.16].map((a) => ({ archivo: "tick.wav", en: t.desde + a * k, vol: 0.35 })) : []),
    { archivo: "ding.wav", en: t.desde + 1.35 * k, vol: 0.32 },
    ...(sello ? [{ archivo: "stamp.wav", en: t.desde + 1.4 * k, vol: 0.6 }] : []),
  ];
};
