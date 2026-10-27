// Textos en pantalla: titulo-detras, cita, palabra-clave, capitulo, cuenta-regresiva y pregunta.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, SfxPlan, caraEntre, clamp, eBack, eIn, eInOut, eOut, estiloFinal, familia, lerp, num } from "../lib/base";

const txt = (v: unknown, d = "") => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);
const useVida = (capa: Capa) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  return { f, fps, t, s, L, dentro: s >= -0.02 && s <= L + 0.02, sale: eIn(clamp((s - (L - 0.3)) / 0.3)) };
};
const fuenteDe = (capa: Capa, def: string) => (typeof capa.fuente === "string" ? capa.fuente : def);
// Debajo de la cara (zona segura de Reels).
const bajoCara = (ctx: Ctx, capa: Capa, H: number) => {
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  return Math.min(H * 0.74, Math.max(H * 0.58, (c.y + c.h) * H + 110));
};
const yDe = (capa: Capa, H: number, auto: number) =>
  typeof capa.y === "number" ? capa.y * H : capa.posicion === "arriba" ? H * 0.12 : capa.posicion === "centro" ? H * 0.42 : capa.posicion === "abajo" ? H * 0.66 : auto;

// Reparte un texto en líneas cortas (o respeta los saltos "\n" o "/").
const lineasDe = (texto: string, maxCar: number) => {
  if (/[\n/]/.test(texto)) return texto.split(/\s*[\n/]\s*/).filter(Boolean);
  const ws = texto.split(/\s+/).filter(Boolean), out: string[] = [];
  let act = "";
  for (const w of ws) { if (act && (act + " " + w).length > maxCar) { out.push(act); act = w; } else act = act ? act + " " + w : w; }
  if (act) out.push(act);
  return out;
};

// =====================================================================
// TÍTULO DETRÁS: texto gigante detrás de la persona (la persona queda por delante)
// =====================================================================
export const TituloDetras: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const mayus = capa.mayusculas !== false;
  const lineas = lineasDe(txt(capa.texto), 9).map((l) => (mayus ? l.toUpperCase() : l));
  const fuente = fuenteDe(capa, "anton");
  const ancho = num(capa.ancho_letra, 0.53);
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const tams = lineas.map((l) => Math.min(num(capa.tamano, 380), (W - 40) / Math.max(1, l.length * ancho)));
  const alto = tams.reduce((n, x) => n + x * 0.9, 0);
  const centro = typeof capa.y === "number" ? capa.y * H : (c.y + c.h * 0.05) * H;
  let top = centro - alto / 2;
  const color = txt(capa.color, "#FFFFFF");
  return (
    <AbsoluteFill style={{ opacity: 1 - v.sale }}>
      {lineas.map((l, i) => {
        const fs = tams[i], y0 = top;
        top += fs * 0.9;
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y0, height: fs * 0.95, display: "flex", justifyContent: "center", overflow: "hidden" }}>
            {[...l].map((ch, k) => {
              const a = eOut(clamp((v.s - i * 0.12 - k * 0.03) / 0.4));
              return <span key={k} style={{ fontFamily: familia(fuente), fontSize: fs, lineHeight: 1, color: i === Number(capa.linea_color ?? -1) ? E.sticker : color, whiteSpace: "pre",
                display: "inline-block", transform: `translateY(${(1 - a) * fs}px)`, textShadow: "0 10px 40px rgba(0,0,0,.25)" }}>{ch}</span>;
            })}
          </div>
        );
      })}
      {typeof capa._recorte === "string" ? (
        <Img src={staticFile(`${capa._recorte}/${String(v.f).padStart(6, "0")}.webp`)} style={{ position: "absolute", width: W, height: H }} />
      ) : null}
    </AbsoluteFill>
  );
};
export const sonidosTituloDetras = (c: Capa): SfxPlan[] => [{ archivo: "whoosh.wav", en: c.desde, vol: 0.35 }];

// =====================================================================
// CITA: frase destacada con comillas grandes y autor
// =====================================================================
export const Cita: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const texto = txt(capa.texto), autor = txt(capa.autor);
  const ws = texto.split(/\s+/).filter(Boolean);
  const fs = num(capa.tamano, texto.length > 90 ? 50 : texto.length > 55 ? 58 : 68);
  const top = yDe(capa, H, bajoCara(ctx, capa, H) - 40);
  const acento = txt(capa.color, E.sticker);
  const fuente = fuenteDe(capa, "playfair");
  const paso = Math.min(0.08, (v.L * 0.5) / Math.max(1, ws.length));
  const resaltar = txt(capa.resaltar).toLowerCase().split(/\s+/).filter(Boolean).map((x) => x.replace(/[^\p{L}\p{N}]/gu, ""));
  const abre = eBack(clamp(v.s / 0.4), 1.6);
  return (
    <AbsoluteFill style={{ opacity: 1 - v.sale }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 160, bottom: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.62) 22%, rgba(0,0,0,.78) 100%)", opacity: eOut(clamp(v.s / 0.3)) }} />
      <div style={{ position: "absolute", left: 80, right: 80, top }}>
        <div style={{ fontFamily: familia("playfair"), fontSize: 220, lineHeight: 0.6, height: 110, color: acento, transform: `scale(${abre})`, transformOrigin: "left top" }}>“</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: `${fs * 0.1}px ${fs * 0.24}px`, marginTop: 10 }}>
          {ws.map((w, i) => {
            const a = eOut(clamp((v.s - 0.2 - i * paso) / 0.35));
            const hl = resaltar.includes(w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""));
            return <span key={i} style={{ fontFamily: familia(hl ? "playfair-italic" : fuente), fontSize: fs, lineHeight: 1.18, color: hl ? acento : "#fff", opacity: a,
              transform: `translateY(${(1 - a) * 16}px)`, display: "inline-block" }}>{w}</span>;
          })}
        </div>
        {autor ? (
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 34, opacity: eOut(clamp((v.s - 0.3 - ws.length * paso) / 0.4)) }}>
            <div style={{ width: lerp(0, 70, eOut(clamp((v.s - 0.3 - ws.length * paso) / 0.4))), height: 4, background: acento, borderRadius: 2 }} />
            <span style={{ fontFamily: familia(E.fuente), fontSize: 34, color: "rgba(255,255,255,.85)", letterSpacing: "0.04em" }}>{autor}</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
export const sonidosCita = (c: Capa): SfxPlan[] => [{ archivo: "swoosh_sube.wav", en: c.desde, vol: 0.3 }];

// =====================================================================
// PALABRA CLAVE: una sola palabra enorme que golpea la pantalla
// =====================================================================
export const PalabraClave: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const texto = capa.mayusculas === false ? txt(capa.texto) : txt(capa.texto).toUpperCase();
  const fuente = fuenteDe(capa, "anton");
  const lineas = lineasDe(texto, 10);
  const maxLen = Math.max(...lineas.map((l) => l.length), 1);
  const fs = Math.min(num(capa.tamano, 400), (W - 70) / (maxLen * num(capa.ancho_letra, 0.5)));
  const completa = capa.pantalla_completa === true;
  const fondo = txt(capa.fondo_color, E.acento);
  const cp = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const altoT = lineas.length * fs * 0.92;
  const y = completa ? H / 2 : yDe(capa, H, Math.min(H * 0.8 - altoT / 2, Math.max(bajoCara(ctx, capa, H), (cp.y + cp.h) * H + 50 + altoT / 2)));
  const golpe = eOut(clamp(v.s / 0.16));
  const temblor = v.s < 0.2 ? Math.sin(v.s * 90) * (1 - v.s / 0.2) * 10 : 0;
  return (
    <AbsoluteFill style={{ opacity: 1 - v.sale }}>
      {completa ? <AbsoluteFill style={{ background: fondo, opacity: eOut(clamp(v.s / 0.1)) }} /> : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: y - (lineas.length * fs * 0.92) / 2, display: "flex", flexDirection: "column", alignItems: "center",
        transform: `translateX(${temblor}px) scale(${lerp(1.7, 1, golpe) * (1 + 0.03 * clamp((v.s - 0.16) / Math.max(0.1, v.L)))})` }}>
        {lineas.map((l, i) => (
          <div key={i} style={{ fontFamily: familia(fuente), fontSize: fs, lineHeight: 0.92, color: txt(capa.color, completa ? "#fff" : E.sticker), opacity: golpe, whiteSpace: "pre",
            WebkitTextStroke: completa ? undefined : `${fs * 0.03}px #000`, paintOrder: "stroke fill", textShadow: completa ? "none" : "0 14px 40px rgba(0,0,0,.5)" }}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
export const sonidosPalabraClave = (c: Capa): SfxPlan[] => [{ archivo: "impacto.wav", en: c.desde, vol: 0.45 }];

// =====================================================================
// CAPÍTULO: separador de sección ("Parte 2", "Paso 3") arriba de la cara o a pantalla completa
// =====================================================================
export const Capitulo: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const etiqueta = txt(capa.etiqueta, "PARTE 1"), titulo = txt(capa.titulo);
  const fuente = fuenteDe(capa, E.fuenteTitulo);
  const acento = txt(capa.color, E.sticker);
  if (capa.modo === "pantalla") {
    const cortina = eInOut(clamp(v.s / 0.35)), sale = eInOut(clamp((v.s - (v.L - 0.35)) / 0.35));
    const num_ = etiqueta.match(/\d+/)?.[0];
    return (
      <AbsoluteFill style={{ background: txt(capa.fondo_color, "#111"), clipPath: `inset(0 ${sale * 100}% 0 ${(1 - cortina) * 100}%)` }}>
        {num_ ? <div style={{ position: "absolute", right: -40, bottom: -120, fontFamily: familia("anton"), fontSize: 900, lineHeight: 1, color: "rgba(255,255,255,.07)" }}>{num_}</div> : null}
        <div style={{ position: "absolute", left: 90, right: 90, top: H * 0.4 }}>
          <div style={{ fontFamily: familia(E.fuente), fontSize: 40, letterSpacing: "0.3em", color: acento, opacity: eOut(clamp((v.s - 0.3) / 0.3)) }}>{etiqueta.toUpperCase()}</div>
          <div style={{ width: lerp(0, 160, eOut(clamp((v.s - 0.35) / 0.4))), height: 8, background: acento, margin: "26px 0 30px", borderRadius: 4 }} />
          <div style={{ fontFamily: familia(fuente), fontSize: titulo.length > 22 ? 88 : 112, lineHeight: 1.02, color: "#fff", letterSpacing: "-0.02em",
            opacity: eOut(clamp((v.s - 0.45) / 0.35)), transform: `translateY(${(1 - eOut(clamp((v.s - 0.45) / 0.35))) * 40}px)` }}>{titulo}</div>
        </div>
      </AbsoluteFill>
    );
  }
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const top = typeof capa.y === "number" ? capa.y * H : Math.max(H * 0.08, c.y * H - 300);
  const a = eOut(clamp(v.s / 0.4));
  return (
    <div style={{ position: "absolute", left: 70, top, opacity: 1 - v.sale, transform: `translateX(${-v.sale * 60}px)` }}>
      <div style={{ display: "inline-block", background: acento, color: E.stickerTexto, fontFamily: familia(E.fuente), fontSize: 34, letterSpacing: "0.18em", padding: "10px 22px", borderRadius: 10,
        clipPath: `inset(0 ${(1 - a) * 100}% 0 0)` }}>{etiqueta.toUpperCase()}</div>
      {titulo ? (
        <div style={{ marginTop: 14, maxWidth: W - 140, overflow: "hidden" }}>
          <div style={{ fontFamily: familia(fuente), fontSize: titulo.length > 24 ? 70 : 88, lineHeight: 1.04, color: "#fff", letterSpacing: "-0.02em", textShadow: "0 6px 24px rgba(0,0,0,.55)",
            transform: `translateY(${(1 - eOut(clamp((v.s - 0.2) / 0.4))) * 110}%)` }}>{titulo}</div>
        </div>
      ) : null}
    </div>
  );
};
export const sonidosCapitulo = (c: Capa): SfxPlan[] => [{ archivo: c.modo === "pantalla" ? "whoosh.wav" : "swoosh_sube.wav", en: c.desde, vol: 0.35 }];

// =====================================================================
// CUENTA REGRESIVA: 3-2-1 grande, o reloj de oferta (HH:MM:SS) que baja en vivo
// =====================================================================
const aSeg = (s: string) => s.split(":").map(Number).reduce((n, x) => n * 60 + (isFinite(x) ? x : 0), 0);
const aReloj = (n: number) => { const s = Math.max(0, Math.floor(n)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return [h, m, x].map((k) => String(k).padStart(2, "0")); };
export const CuentaRegresiva: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const acento = txt(capa.color, E.acento);
  if (capa.modo === "reloj") {
    const partes = aReloj(aSeg(txt(capa.tiempo, "00:10:00")) - v.s);
    const top = yDe(capa, H, bajoCara(ctx, capa, H));
    const a = eBack(clamp(v.s / 0.4), 1.6);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - v.sale, transform: `scale(${a})` }}>
        {txt(capa.texto) ? <div style={{ fontFamily: familia(E.fuente), fontSize: 38, color: "#fff", marginBottom: 16, textShadow: "0 3px 12px rgba(0,0,0,.6)", letterSpacing: "0.04em" }}>{txt(capa.texto)}</div> : null}
        <div style={{ display: "flex", gap: 14 }}>
          {partes.map((p, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#111", borderRadius: 22, padding: "14px 20px", minWidth: 150, boxShadow: "0 16px 36px rgba(0,0,0,.35)" }}>
              <span style={{ fontFamily: familia(fuenteDe(capa, "space-grotesk")), fontSize: 100, lineHeight: 1, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{p}</span>
              <span style={{ fontFamily: familia(E.fuente), fontSize: 22, color: acento, letterSpacing: "0.2em", marginTop: 6 }}>{["HORAS", "MIN", "SEG"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const n = Math.max(1, Math.round(num(capa.inicio, 3)));
  const fin = txt(capa.final);
  const tramos = n + (fin ? 1 : 0), d = v.L / tramos;
  const k = Math.min(tramos - 1, Math.floor(v.s / d)), sk = v.s - k * d;
  const valor = k < n ? String(n - k) : fin;
  const golpe = eBack(clamp(sk / 0.25), 2);
  const cc = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const r = 200, cy = typeof capa.y === "number" ? capa.y * H : Math.min(H * 0.72, Math.max(H * 0.5, (cc.y + cc.h) * H + r + 50));
  const prog = clamp(sk / d);
  return (
    <AbsoluteFill style={{ opacity: 1 - v.sale }}>
      {capa.oscurecer !== false ? <AbsoluteFill style={{ background: "rgba(0,0,0,.45)", opacity: eOut(clamp(v.s / 0.2)) }} /> : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={W / 2} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={14} />
        {k < n ? <circle cx={W / 2} cy={cy} r={r} fill="none" stroke={acento} strokeWidth={14} strokeLinecap="round" strokeDasharray={2 * Math.PI * r}
          strokeDashoffset={2 * Math.PI * r * prog} transform={`rotate(-90 ${W / 2} ${cy})`} /> : null}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 160, height: 320, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: familia(fuenteDe(capa, "anton")), fontSize: valor.length > 3 ? 130 : 260, color: "#fff", transform: `scale(${golpe})`, textShadow: "0 12px 40px rgba(0,0,0,.5)" }}>{valor}</div>
    </AbsoluteFill>
  );
};
export const sonidosCuenta = (c: Capa): SfxPlan[] => {
  if (c.modo === "reloj") return [{ archivo: "pop.wav", en: c.desde, vol: 0.35 }];
  const n = Math.max(1, Math.round(num(c.inicio, 3))), tr = n + (typeof c.final === "string" && c.final ? 1 : 0), d = (c.hasta - c.desde) / tr;
  return Array.from({ length: tr }, (_, k) => ({ archivo: k < n ? "tick.wav" : "ding.wav", en: c.desde + k * d, vol: 0.45 }));
};

// =====================================================================
// PREGUNTA: tarjeta tipo encuesta para invitar a comentar
// =====================================================================
export const Pregunta: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const pregunta = txt(capa.pregunta);
  const opciones = (Array.isArray(capa.opciones) ? capa.opciones : []).map((x) => txt(x)).slice(0, 4);
  const pct = (Array.isArray(capa.porcentajes) ? capa.porcentajes : []).map((x) => num(x, 0));
  const elegida = typeof capa.elegida === "number" ? capa.elegida : -1;
  const acento = txt(capa.color, E.acento);
  const ancho = W - 200;
  const top = yDe(capa, H, bajoCara(ctx, capa, H) - 30);
  const a = eBack(clamp(v.s / 0.45), 1.5);
  const tToque = 0.6 + opciones.length * 0.12;
  const verPct = pct.length === opciones.length ? eOut(clamp((v.s - tToque - 0.2) / 0.7)) : 0;
  return (
    <div style={{ position: "absolute", left: (W - ancho) / 2, top, width: ancho, background: "#fff", borderRadius: 34, padding: "34px 34px 30px",
      boxShadow: "0 24px 60px rgba(0,0,0,.35)", opacity: 1 - v.sale, transform: `scale(${a}) rotate(${(1 - clamp(a)) * -4}deg)` }}>
      <div style={{ fontFamily: familia(fuenteDe(capa, E.fuenteTitulo)), fontSize: pregunta.length > 40 ? 44 : 52, lineHeight: 1.1, color: "#111", textAlign: "center", marginBottom: 26 }}>{pregunta}</div>
      {opciones.map((o, i) => {
        const ap = eOut(clamp((v.s - 0.35 - i * 0.12) / 0.3));
        const sel = i === elegida && v.s > tToque;
        const p = pct[i] ?? 0;
        return (
          <div key={i} style={{ position: "relative", height: 84, borderRadius: 20, background: "#F1F1F3", marginTop: i ? 14 : 0, overflow: "hidden", opacity: ap,
            transform: `translateY(${(1 - ap) * 20}px)`, outline: sel ? `4px solid ${acento}` : "none" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${p * verPct}%`, background: sel ? acento : "#D9D9DE", opacity: sel ? 0.9 : 1 }} />
            <div style={{ position: "absolute", inset: "0 26px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: familia(E.fuente), fontSize: 36, color: "#111" }}>
              <span>{o}</span>{verPct > 0 ? <span>{Math.round(p * verPct)}%</span> : null}
            </div>
          </div>
        );
      })}
      {elegida >= 0 && v.s > tToque - 0.3 && v.s < tToque + 0.5 ? (
        <div style={{ position: "absolute", left: ancho * 0.72, top: 34 + 26 + 60 + elegida * 98 + 20, width: 70, height: 70, borderRadius: 99, background: "rgba(0,0,0,.18)",
          border: "4px solid rgba(0,0,0,.35)", transform: `scale(${1 - 0.2 * Math.sin(clamp((v.s - tToque + 0.3) / 0.8) * Math.PI)})` }} />
      ) : null}
    </div>
  );
};
export const sonidosPregunta = (c: Capa): SfxPlan[] => [{ archivo: "pop.wav", en: c.desde, vol: 0.4 },
  ...(typeof c.elegida === "number" ? [{ archivo: "click.wav", en: c.desde + 0.6 + (Array.isArray(c.opciones) ? c.opciones.length : 2) * 0.12, vol: 0.4 }] : [])];
