// Motion graphics: grafica-datos, logo-sting, tier-list, mockup-interfaz y widgets-vidrio.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, SfxPlan, caraEntre, clamp, eBack, eIn, eInOut, eOut, estiloFinal, familia, lerp, num } from "../lib/base";

const txt = (v: unknown, d = "") => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);
const useVida = (capa: Capa) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  return { f, t, s, L, dentro: s >= -0.02 && s <= L + 0.02, entra: eBack(clamp(s / 0.42), 1.5), sale: eIn(clamp((s - (L - 0.3)) / 0.3)) };
};
const sombra = "0 24px 56px rgba(0,0,0,.33), 0 4px 12px rgba(0,0,0,.15)";
// Altura libre para una tarjeta de alto CH (debajo de la cara; si no cabe, arriba).
const ubicarY = (capa: Capa, ctx: Ctx, CH: number, H: number) => {
  if (typeof capa.y === "number") return capa.y * H;
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const bajo = (c.y + c.h) * H, limite = H * 0.86 - CH;
  return bajo + 60 <= limite ? clamp(bajo + 60, H * 0.45, limite) : H * 0.08;
};
const fmt = (n: number, dec: number) => {
  const [e, f] = n.toFixed(dec).split(".");
  return (e.length > 3 ? e.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : e) + (f ? "," + f : "");
};

// =====================================================================
// GRÁFICA DE DATOS: barras, línea o dona con valores reales
// =====================================================================
type Dato = { etiqueta: string; valor: number };
export const GraficaDatos: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const datos = ((Array.isArray(capa.datos) ? capa.datos : []) as Dato[]).map((d) => ({ etiqueta: txt(d.etiqueta), valor: num(d.valor, 0) }));
  if (!datos.length) return null;
  const tipo = txt(capa.tipo, "barras");
  const titulo = txt(capa.titulo), pre = txt(capa.prefijo), suf = txt(capa.sufijo);
  const dec = Math.round(num(capa.decimales, 0));
  const dest = typeof capa.destacar === "number" ? capa.destacar : datos.reduce((bi, d, i, a) => (d.valor > a[bi].valor ? i : bi), 0);
  const CW = W - 120, AH = tipo === "dona" ? 380 : 420, CH = AH + (titulo ? 90 : 0) + 110;
  const top = ubicarY(capa, ctx, CH, H);
  const max = Math.max(...datos.map((d) => d.valor), 1);
  const inicio = 0.35, dur = Math.min(1.6, v.L * 0.45);
  const crece = (i: number) => eOut(clamp((v.s - inicio - i * 0.12) / dur));
  const gris = "rgba(0,0,0,.12)";
  let grafica: React.ReactNode = null;
  const aw = CW - 80;
  if (tipo === "linea") {
    const pts = datos.map((d, i) => ({ x: 70 + (i * (aw - 140)) / Math.max(1, datos.length - 1), y: AH - 70 - (d.valor / max) * (AH - 130) }));
    const camino = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
    const trazo = eInOut(clamp((v.s - inicio) / dur));
    grafica = (
      <svg width={aw} height={AH}>
        {[0, 1, 2, 3].map((k) => <line key={k} x1={0} x2={aw} y1={60 + k * ((AH - 130) / 3)} y2={60 + k * ((AH - 130) / 3)} stroke={gris} strokeWidth={2} />)}
        <path d={`${camino} L ${pts[pts.length - 1].x} ${AH - 70} L ${pts[0].x} ${AH - 70} Z`} fill={E.acento} opacity={0.12 * trazo} />
        <path d={camino} fill="none" stroke={E.acento} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${trazo} 1`} />
        {pts.map((p, i) => {
          const a = eBack(clamp((v.s - inicio - (i / Math.max(1, pts.length - 1)) * dur) / 0.3), 2.2);
          return (
            <g key={i} opacity={clamp(a)}>
              <circle cx={p.x} cy={p.y} r={i === dest ? 14 : 10} fill="#fff" stroke={E.acento} strokeWidth={6} transform={`translate(${p.x} ${p.y}) scale(${Math.max(0, a)}) translate(${-p.x} ${-p.y})`} />
              <text x={p.x} y={p.y - 26} textAnchor="middle" fontFamily={familia(E.fuenteTitulo)} fontSize={i === dest ? 38 : 30} fill={E.texto}>{pre + fmt(datos[i].valor, dec) + suf}</text>
              <text x={p.x} y={AH - 26} textAnchor="middle" fontFamily={familia(E.fuente)} fontSize={26} fill={E.suave}>{datos[i].etiqueta}</text>
            </g>
          );
        })}
      </svg>
    );
  } else if (tipo === "dona") {
    const total = datos.reduce((n, d) => n + d.valor, 0) || 1;
    const R = 150, cx = 190, cy = AH / 2, avance = eInOut(clamp((v.s - inicio) / dur));
    const tonos = [E.acento, E.texto, E.sticker, "#60A5FA", "#34D399", "#A78BFA", "#F472B6"];
    let ac = 0;
    grafica = (
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <svg width={380} height={AH}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={gris} strokeWidth={56} />
          {datos.map((d, i) => {
            const fr = d.valor / total, ini = ac; ac += fr;
            const visible = clamp((avance - ini) / fr);
            return <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={tonos[i % tonos.length]} strokeWidth={i === dest ? 64 : 56}
              pathLength={1} strokeDasharray={`${fr * visible} 1`} strokeDashoffset={-ini} transform={`rotate(-90 ${cx} ${cy})`} />;
          })}
          <text x={cx} y={cy + 16} textAnchor="middle" fontFamily={familia(E.fuenteTitulo)} fontSize={52} fill={E.texto}>{Math.round((datos[dest].valor / total) * 100 * avance)}%</text>
        </svg>
        <div>
          {datos.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, opacity: eOut(clamp((v.s - inicio - i * 0.15) / 0.3)) }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: tonos[i % tonos.length] }} />
              <div style={{ fontFamily: familia(i === dest ? E.fuenteTitulo : E.fuente), fontSize: 32, color: E.texto }}>{d.etiqueta}</div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    const n = datos.length, gap = 26, bw = Math.min(150, (aw - gap * (n - 1)) / n);
    grafica = (
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap, height: AH }}>
        {datos.map((d, i) => {
          const k = crece(i), alto = (d.valor / max) * (AH - 140) * k;
          return (
            <div key={i} style={{ width: bw, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: i === dest ? 40 : 32, color: E.texto, marginBottom: 10, opacity: clamp(k * 3) }}>{pre + fmt(d.valor * k, dec) + suf}</div>
              <div style={{ width: "100%", height: alto, borderRadius: "16px 16px 6px 6px", background: i === dest ? E.acento : "rgba(0,0,0,.18)" }} />
              <div style={{ fontFamily: familia(E.fuente), fontSize: 26, color: E.suave, marginTop: 12, height: 34, whiteSpace: "nowrap" }}>{d.etiqueta}</div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 60, top, width: CW, opacity: clamp(v.entra * 3) * (1 - v.sale), transform: `translateY(${(1 - v.entra) * 70}px) scale(${lerp(0.94, 1, v.entra)})` }}>
      <div style={{ background: E.fondo, borderRadius: 34, padding: "30px 40px", boxShadow: sombra }}>
        {titulo ? <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 46, color: E.texto, letterSpacing: "-0.02em", marginBottom: 14 }}>{titulo}</div> : null}
        {grafica}
        {txt(capa.fuente) ? <div style={{ fontFamily: familia(E.fuente), fontSize: 22, color: E.suave, marginTop: 6 }}>Fuente: {txt(capa.fuente)}</div> : null}
      </div>
    </div>
  );
};
export const sonidosGrafica = (c: Capa): SfxPlan[] => [{ archivo: "pop.wav", en: c.desde, vol: 0.4 }, { archivo: "whoosh.wav", en: c.desde + 0.35, vol: 0.25 },
  { archivo: "ding.wav", en: c.desde + 0.35 + Math.min(1.6, (c.hasta - c.desde) * 0.45), vol: 0.3 }];

// =====================================================================
// LOGO STING: entrada animada del logo (pantalla completa o esquina)
// =====================================================================
export const LogoSting: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const logo = typeof capa.logo_archivo === "string" ? capa.logo_archivo : null;
  const texto = txt(capa.texto);
  const estilo = txt(capa.estilo, "pop");
  const esquina = capa.posicion === "esquina";
  const fondo = txt(capa.fondo, E.texto);
  const L = v.L, s = v.s;
  const salida = eIn(clamp((s - (L - 0.4)) / 0.4));
  const marca = (tam: number, extra: React.CSSProperties = {}) => logo
    ? <Img src={staticFile(logo)} style={{ width: tam, height: tam, objectFit: "contain", ...extra }} />
    : <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: tam * 0.32, color: esquina ? E.texto : E.fondo, ...extra }}>{texto || "LOGO"}</div>;
  if (esquina) {
    const a = eBack(clamp(s / 0.45), 2);
    return (
      <div style={{ position: "absolute", right: 60, top: 150, opacity: 1 - salida, transform: `scale(${Math.max(0, a) * lerp(1, 0.7, salida)})`, transformOrigin: "right top" }}>
        <div style={{ background: E.fondo, borderRadius: 26, padding: 18, boxShadow: sombra }}>{marca(150)}</div>
      </div>
    );
  }
  // pantalla completa: fondo de color que entra en círculo, logo, destellos y salida que revela el video
  const circulo = eInOut(clamp(s / 0.45));
  const radio = Math.hypot(W, H) * (circulo * (1 - salida));
  const a = estilo === "revelado" ? eOut(clamp((s - 0.35) / 0.6)) : eBack(clamp((s - 0.3) / 0.5), 2.4);
  const brillo = clamp((s - 0.8) / 0.6);
  const anillo = clamp((s - 0.45) / 0.7);
  const tam = Math.min(W * 0.5, 520);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: fondo, clipPath: `circle(${radio}px at 50% 50%)` }} />
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 1 - salida }}>
        <div style={{ position: "absolute", width: tam * 1.4, height: tam * 1.4, borderRadius: 999, border: `6px solid ${E.acento}`, opacity: (1 - anillo) * clamp(anillo * 5),
          transform: `scale(${0.6 + anillo * 0.8})` }} />
        <div style={{ position: "relative", overflow: "hidden", transform: estilo === "revelado" ? undefined : `scale(${Math.max(0, a)})`,
          clipPath: estilo === "revelado" ? `inset(0 ${(1 - a) * 100}% 0 0)` : undefined }}>
          {marca(tam)}
          <div style={{ position: "absolute", top: -50, bottom: -50, width: 90, left: lerp(-140, tam + 60, brillo), opacity: brillo > 0 && brillo < 1 ? 0.8 : 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,.9), transparent)", transform: "rotate(18deg)" }} />
        </div>
        {texto && logo ? (
          <div style={{ marginTop: 34, fontFamily: familia(E.fuente), fontSize: 44, color: E.fondo, letterSpacing: "0.06em",
            opacity: eOut(clamp((s - 0.7) / 0.4)), transform: `translateY(${(1 - eOut(clamp((s - 0.7) / 0.4))) * 20}px)` }}>{texto}</div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const sonidosLogo = (c: Capa): SfxPlan[] => c.posicion === "esquina" ? [{ archivo: "pop.wav", en: c.desde, vol: 0.4 }]
  : [{ archivo: "whoosh.wav", en: c.desde, vol: 0.4 }, { archivo: "stamp.wav", en: c.desde + 0.32, vol: 0.5 }, { archivo: "ding.wav", en: c.desde + 0.8, vol: 0.3 }];

// =====================================================================
// TIER LIST: tablero S/A/B/C donde cada ítem cae cuando se nombra
// =====================================================================
type Item = { texto: string; tier: string; en?: number };
export const TierList: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H, fps } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const COL: Record<string, string> = { S: "#FF4D4D", A: "#FF9F43", B: "#FFD43B", C: "#7ED957", D: "#4FC3F7", F: "#B39DDB" };
  const tiers = ((Array.isArray(capa.tiers) ? capa.tiers : ["S", "A", "B", "C"]) as (string | { label: string; color?: string })[])
    .map((x, i) => typeof x === "string" ? { label: x, color: COL[x.toUpperCase()] ?? Object.values(COL)[i % 6] } : { label: x.label, color: x.color ?? COL[x.label.toUpperCase()] ?? Object.values(COL)[i % 6] });
  const items = ((Array.isArray(capa.items) ? capa.items : []) as Item[]).map((it, i, arr) => ({
    texto: txt(it.texto), tier: txt(it.tier).toUpperCase(),
    en: typeof it.en === "number" ? it.en : capa.desde + 0.8 + (i * (capa.hasta - capa.desde - 1.6)) / Math.max(1, arr.length),
  }));
  const titulo = txt(capa.titulo);
  const opaco = capa.fondo === "opaco";
  const zonaTop = H * (opaco ? 0.5 : 0.5), zonaH = H * (opaco ? 0.5 : 0.36);
  const pad = 26, gap = 10, tit = titulo ? 86 : 0, rows = tiers.length;
  const rowH = Math.min(150, (zonaH - pad * 2 - tit - gap * (rows - 1)) / rows);
  const LBL = Math.round(rowH * 0.95);
  const porFila = Math.max(1, ...tiers.map((tr) => items.filter((i) => i.tier === tr.label.toUpperCase()).length));
  const lane = W - pad * 2 - LBL - 12;
  const chipW = Math.min(240, (lane - 16 - (porFila - 1) * 10) / porFila);
  const boardH = tit + rows * rowH + (rows - 1) * gap + pad * 2;
  const entra = eOut(clamp(v.s / 0.45)), sale = eIn(clamp((v.s - (v.L - 0.45)) / 0.45));
  return (
    <div style={{ position: "absolute", left: 0, top: opaco ? zonaTop : zonaTop + (zonaH - boardH) / 2, width: W, height: opaco ? H - zonaTop : boardH,
      transform: `translateY(${(1 - entra) * 1000 + sale * 1100}px)` }}>
      <div style={{ position: "absolute", inset: opaco ? 0 : `0 ${pad - 12}px`, top: tit, borderRadius: opaco ? 0 : 30, background: opaco ? "#141414" : "rgba(20,20,20,.86)", boxShadow: sombra }} />
      {titulo ? <div style={{ position: "absolute", left: pad, top: 0, padding: "12px 26px", borderRadius: 999, background: "#141414", color: "#fff",
        fontFamily: familia(E.fuenteTitulo), fontSize: 36, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{titulo}</div> : null}
      {tiers.map((tr, r) => {
        const k = eBack(clamp((v.s - 0.15 - r * 0.06) / 0.4));
        const y = tit + pad + r * (rowH + gap);
        return (
          <React.Fragment key={r}>
            <div style={{ position: "absolute", left: pad, top: y, width: LBL, height: rowH, borderRadius: 20, background: tr.color, color: "#141414",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: familia(E.fuenteTitulo), fontSize: rowH * 0.55, transform: `scale(${Math.max(0, k)})` }}>{tr.label}</div>
            <div style={{ position: "absolute", left: pad + LBL + 12, top: y, width: lane, height: rowH, borderRadius: 20, background: "rgba(255,255,255,.07)", opacity: clamp(k) }} />
          </React.Fragment>
        );
      })}
      {items.map((it, n) => {
        const r = tiers.findIndex((tr) => tr.label.toUpperCase() === it.tier);
        const c0 = it.en - 6 / fps;
        if (r < 0 || v.t < c0) return null;
        const col = items.filter((o) => o.tier === it.tier).indexOf(it);
        const p = clamp((v.t - c0) / (10 / fps));
        const x = pad + LBL + 20 + col * (chipW + 10), y = tit + pad + r * (rowH + gap) + rowH * 0.12;
        const hl = v.t >= it.en + 4 / fps ? clamp(1 - (v.t - it.en - 4 / fps) / (8 / fps)) : 0;
        const fs = Math.min(36, ((chipW - 26) / Math.max(4, it.texto.length)) * 1.75);
        return (
          <div key={n} style={{ position: "absolute", left: x, top: y, width: chipW, height: rowH * 0.76, borderRadius: 16, background: "#fff", color: "#141414",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", boxSizing: "border-box", textAlign: "center",
            fontFamily: familia(E.fuenteTitulo), fontSize: fs, lineHeight: 1.05,
            transform: `translateY(${lerp(-1000 - r * 140, 0, eBack(p))}px) rotate(${lerp(-20, col % 2 ? 2 : -2, eOut(p))}deg) scale(${lerp(1.3, 1, eOut(p))})`,
            boxShadow: `0 12px 22px rgba(0,0,0,.35), 0 0 0 ${6 * hl}px ${E.acento}` }}>{it.texto}</div>
        );
      })}
    </div>
  );
};
export const sonidosTier = (c: Capa): SfxPlan[] => {
  const items = (Array.isArray(c.items) ? c.items : []) as Item[];
  return [{ archivo: "whoosh.wav", en: c.desde, vol: 0.35 }, ...items.map((it, i) => ({
    archivo: "pop.wav", vol: 0.5, en: (typeof it.en === "number" ? it.en : c.desde + 0.8 + (i * (c.hasta - c.desde - 1.6)) / Math.max(1, items.length)) - 0.05,
  }))];
};

// =====================================================================
// MOCKUP DE INTERFAZ: chat, notificaciones o prompt de IA (genéricos)
// =====================================================================
type Msg = { de?: string; texto: string; en?: number };
type Notif = { app?: string; titulo?: string; texto: string; en?: number };
export const MockupInterfaz: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const tipo = txt(capa.tipo, "chat");
  const tiempoDe = (i: number, n: number, en?: number) => (typeof en === "number" ? en : capa.desde + 0.4 + (i * (capa.hasta - capa.desde - 1.2)) / Math.max(1, n));

  if (tipo === "notificacion") {
    const ns = (Array.isArray(capa.notificaciones) ? capa.notificaciones : []) as Notif[];
    const visibles = ns.map((n, i) => ({ ...n, en: tiempoDe(i, ns.length, n.en) })).filter((n) => v.t >= n.en - 0.05);
    return (
      <div style={{ position: "absolute", left: 40, right: 40, top: 120, opacity: 1 - v.sale }}>
        {visibles.slice().reverse().map((n, k) => {
          const a = eBack(clamp((v.t - n.en) / 0.4), 1.4);
          return (
            <div key={n.texto + k} style={{ marginBottom: 16, borderRadius: 34, padding: "22px 26px", background: "rgba(245,245,247,.86)", backdropFilter: "blur(24px)",
              boxShadow: "0 16px 40px rgba(0,0,0,.25)", display: "flex", gap: 20, alignItems: "center",
              transform: `translateY(${(1 - a) * -160}px) scale(${lerp(0.9, 1, clamp(a))})`, opacity: clamp(a * 2) * (k > 2 ? 0 : 1 - k * 0.12) }}>
              <div style={{ width: 84, height: 84, borderRadius: 20, background: E.acento, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontFamily: familia(E.fuenteTitulo), fontSize: 40 }}>{txt(n.app, "•").slice(0, 1).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: familia(E.fuente), fontSize: 26, color: "#6B7280" }}>
                  <span>{txt(n.app, "App").toUpperCase()}</span><span>ahora</span></div>
                {n.titulo ? <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 34, color: "#111", marginTop: 4 }}>{n.titulo}</div> : null}
                <div style={{ fontFamily: familia(E.fuente), fontSize: 30, color: "#222", marginTop: 2, lineHeight: 1.2 }}>{n.texto}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (tipo === "prompt") {
    const p = (capa.prompt ?? {}) as { texto?: string; respuesta?: string };
    const texto = txt(p.texto), resp = txt(p.respuesta);
    const escribe = clamp((v.s - 0.4) / Math.max(0.6, Math.min(2.2, texto.length * 0.045)));
    const enviado = 0.4 + Math.max(0.6, Math.min(2.2, texto.length * 0.045)) + 0.25;
    const pensando = v.s > enviado && v.s < enviado + 0.9;
    const r = clamp((v.s - enviado - 0.9) / Math.max(0.8, Math.min(2.5, resp.length * 0.03)));
    const CW = W - 120, CH = 520;
    const top = ubicarY(capa, ctx, CH, H);
    return (
      <div style={{ position: "absolute", left: 60, top, width: CW, opacity: clamp(v.entra * 3) * (1 - v.sale), transform: `translateY(${(1 - v.entra) * 60}px)` }}>
        <div style={{ background: "#FAFAF7", borderRadius: 30, padding: 28, boxShadow: sombra, fontFamily: familia(E.fuente) }}>
          {v.s > enviado ? (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
              <div style={{ background: "#ECEAE3", borderRadius: "22px 22px 6px 22px", padding: "16px 22px", fontSize: 30, color: "#222", maxWidth: "80%" }}>{texto}</div>
            </div>
          ) : null}
          {pensando ? <div style={{ display: "flex", gap: 10, padding: "10px 6px 20px" }}>{[0, 1, 2].map((k) => (
            <div key={k} style={{ width: 16, height: 16, borderRadius: 99, background: E.acento, opacity: 0.35 + 0.65 * Math.abs(Math.sin(v.s * 6 - k * 0.7)) }} />))}</div> : null}
          {r > 0 ? <div style={{ fontSize: 30, color: "#222", lineHeight: 1.35, padding: "0 6px 18px" }}>{resp.slice(0, Math.floor(resp.length * r))}</div> : null}
          <div style={{ border: "2px solid #E3E1DA", borderRadius: 24, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, background: "#fff" }}>
            <div style={{ flex: 1, fontSize: 30, color: v.s > enviado || escribe > 0 ? "#222" : "#9CA3AF" }}>
              {v.s > enviado ? "Escribe un mensaje…" : escribe > 0 ? texto.slice(0, Math.floor(texto.length * escribe)) : "Escribe un mensaje…"}
              {v.s <= enviado && escribe > 0 && Math.floor(v.f / 8) % 2 === 0 ? <span style={{ color: E.acento }}>|</span> : null}
            </div>
            <div style={{ width: 62, height: 62, borderRadius: 99, background: escribe >= 1 ? E.acento : "#D9D7D0", display: "flex", alignItems: "center", justifyContent: "center",
              transform: `scale(${v.s > enviado - 0.25 && v.s < enviado ? 0.88 : 1})` }}>
              <svg width={28} height={28} viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // chat (por defecto)
  const ms = ((Array.isArray(capa.mensajes) ? capa.mensajes : []) as Msg[]).map((m, i, a) => ({ ...m, en: tiempoDe(i, a.length, m.en) }));
  const visibles = ms.filter((m) => v.t >= m.en);
  const sig = ms.find((m) => v.t < m.en && m.en - v.t < 0.8 && m.de !== "yo");
  const CW = W - 120, CH = 560;
  const top = ubicarY(capa, ctx, CH, H);
  const nombre = txt(capa.nombre, "Cliente");
  return (
    <div style={{ position: "absolute", left: 60, top, width: CW, opacity: clamp(v.entra * 3) * (1 - v.sale), transform: `translateY(${(1 - v.entra) * 60}px)` }}>
      <div style={{ background: "#F2EFEA", borderRadius: 30, overflow: "hidden", boxShadow: sombra, fontFamily: familia(E.fuente) }}>
        <div style={{ background: "#fff", padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #E5E5E5" }}>
          <div style={{ width: 58, height: 58, borderRadius: 99, background: E.acento, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: familia(E.fuenteTitulo), fontSize: 28 }}>{nombre.slice(0, 1)}</div>
          <div><div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 30, color: "#111" }}>{nombre}</div><div style={{ fontSize: 22, color: "#16A34A" }}>en línea</div></div>
        </div>
        <div style={{ padding: "20px 22px", height: CH - 120, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 12, overflow: "hidden" }}>
          {visibles.slice(-5).map((m, i) => {
            const yo = m.de === "yo";
            const a = eBack(clamp((v.t - m.en) / 0.3), 1.6);
            return (
              <div key={i} style={{ alignSelf: yo ? "flex-end" : "flex-start", maxWidth: "78%", background: yo ? E.acento : "#fff", color: yo ? "#fff" : "#111",
                borderRadius: yo ? "22px 22px 6px 22px" : "22px 22px 22px 6px", padding: "14px 20px", fontSize: 30, lineHeight: 1.25, boxShadow: "0 2px 6px rgba(0,0,0,.08)",
                transform: `scale(${Math.max(0, a)})`, transformOrigin: yo ? "right bottom" : "left bottom" }}>{m.texto}</div>
            );
          })}
          {sig ? <div style={{ alignSelf: "flex-start", background: "#fff", borderRadius: 22, padding: "18px 22px", display: "flex", gap: 8 }}>{[0, 1, 2].map((k) => (
            <div key={k} style={{ width: 14, height: 14, borderRadius: 99, background: "#9CA3AF", transform: `translateY(${Math.sin(v.s * 10 - k) * 4}px)` }} />))}</div> : null}
        </div>
      </div>
    </div>
  );
};
export const sonidosMockup = (c: Capa): SfxPlan[] => {
  const lista = (Array.isArray(c.mensajes) ? c.mensajes : Array.isArray(c.notificaciones) ? c.notificaciones : []) as { en?: number }[];
  const base: SfxPlan[] = [{ archivo: "pop.wav", en: c.desde, vol: 0.35 }];
  return [...base, ...lista.map((m, i) => ({ archivo: "tick.wav", vol: 0.55, en: typeof m.en === "number" ? m.en : c.desde + 0.4 + (i * (c.hasta - c.desde - 1.2)) / Math.max(1, lista.length) }))];
};

// =====================================================================
// WIDGETS DE VIDRIO: tarjetas de vidrio esmerilado con datos alrededor de la persona
// =====================================================================
type Widget = { tipo?: string; titulo?: string; valor?: string | number; detalle?: string; progreso?: number; datos?: number[] };
export const WidgetsVidrio: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const v = useVida(capa);
  const { width: W, height: H } = useVideoConfig();
  if (!v.dentro) return null;
  const E = estiloFinal(ctx.estilo);
  const ws = ((Array.isArray(capa.widgets) ? capa.widgets : []) as Widget[]).slice(0, 4);
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const cx = (c.x + c.w / 2) * W, top = c.y * H, bottom = (c.y + c.h) * H;
  const cw = 430, ch = 230;
  // lugares libres: si hay espacio arriba de la cabeza, los dos primeros van ahí (izquierda y derecha);
  // si no, a los lados de la cara. Los otros dos, a los lados del pecho.
  const espacioLado = Math.min(cx - c.w * W * 0.5, W - (cx + c.w * W * 0.5)) - 50;
  const arriba = top - ch - 40 >= 110;
  const yArriba = arriba ? Math.max(110, top - ch - 40) : top;
  const lugares = [
    { x: arriba || espacioLado >= cw ? 40 : 30, y: arriba ? yArriba : Math.max(110, yArriba - 40) },
    { x: W - cw - 40, y: arriba ? yArriba + 60 : Math.max(110, yArriba + 60) },
    { x: 40, y: Math.min(H * 0.8 - ch, bottom + 130) },
    { x: W - cw - 40, y: Math.min(H * 0.8 - ch, bottom + 210) },
  ];
  void cx;
  const vidrio: React.CSSProperties = { background: "rgba(255,255,255,.18)", backdropFilter: "blur(22px) saturate(1.4)", WebkitBackdropFilter: "blur(22px) saturate(1.4)",
    border: "1.5px solid rgba(255,255,255,.45)", borderRadius: 34, boxShadow: "0 20px 50px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.6)", padding: "24px 28px", color: "#fff" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 1 - v.sale }}>
      {ws.map((w, i) => {
        const a = eBack(clamp((v.s - 0.15 - i * 0.18) / 0.45), 1.6);
        const flota = Math.sin(v.s * 1.6 + i * 1.3) * 8;
        const L = lugares[i % lugares.length];
        const tipo = w.tipo ?? (Array.isArray(w.datos) ? "grafica" : typeof w.progreso === "number" ? "progreso" : "numero");
        const k = eOut(clamp((v.s - 0.4 - i * 0.18) / 1.0));
        return (
          <div key={i} style={{ position: "absolute", left: L.x, top: L.y, width: cw, ...vidrio, opacity: clamp(a * 2), transform: `translateY(${flota + (1 - clamp(a)) * 40}px) scale(${lerp(0.8, 1, Math.max(0, a))})` }}>
            <div style={{ fontFamily: familia(E.fuente), fontSize: 26, opacity: 0.9, textShadow: "0 1px 3px rgba(0,0,0,.25)" }}>{txt(w.titulo)}</div>
            {tipo === "grafica" ? (
              <svg width={cw - 56} height={110} style={{ marginTop: 10 }}>
                {(w.datos ?? []).map((d, j, arr) => {
                  const mx = Math.max(...arr, 1), bw = (cw - 56 - (arr.length - 1) * 10) / arr.length, h = (d / mx) * 100 * eOut(clamp((v.s - 0.5 - j * 0.08) / 0.6));
                  return <rect key={j} x={j * (bw + 10)} y={110 - h} width={bw} height={h} rx={8} fill={j === arr.length - 1 ? E.sticker : "rgba(255,255,255,.75)"} />;
                })}
              </svg>
            ) : tipo === "progreso" ? (
              <>
                <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 64, marginTop: 4, textShadow: "0 2px 8px rgba(0,0,0,.25)" }}>{Math.round(num(w.progreso, 0) * k)}%</div>
                <div style={{ height: 14, borderRadius: 99, background: "rgba(255,255,255,.3)", marginTop: 10 }}>
                  <div style={{ height: "100%", width: `${num(w.progreso, 0) * k}%`, borderRadius: 99, background: E.sticker }} /></div>
              </>
            ) : (
              <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: 72, marginTop: 4, lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,.25)" }}>{txt(w.valor)}</div>
            )}
            {w.detalle ? <div style={{ fontFamily: familia(E.fuente), fontSize: 24, opacity: 0.85, marginTop: 10 }}>{w.detalle}</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const sonidosWidgets = (c: Capa): SfxPlan[] => {
  const ws = (Array.isArray(c.widgets) ? c.widgets : []).slice(0, 4);
  return ws.map((_, i) => ({ archivo: "pop.wav", en: c.desde + 0.15 + i * 0.18, vol: 0.35 }));
};
