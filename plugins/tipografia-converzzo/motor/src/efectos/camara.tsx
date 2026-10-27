// Escena: el video con todo lo que lo transforma (cámara, color, fondo).
//  - Cámara: zoom-in, zoom-suave, zoom-out, sacudida, dolly-zoom, reencuadre.
//  - Transiciones de cámara: barrido, zoom-transicion.
//  - Color y fondo: look, color-auto, color-pop, fondo-borroso, cambiar-fondo (tocan solo el video, no los gráficos).
// Los gráficos (precio-pop, etc.) van encima y no se mueven con la cámara.
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Cara, Plan, SfxPlan, caraEn, caraEntre, clamp, eInOut, eOut, lerp, num } from "../lib/base";

export const EFECTOS_CAMARA = ["zoom-in", "zoom-suave", "zoom-out", "sacudida", "dolly-zoom", "reencuadre", "barrido", "zoom-transicion"];
export const EFECTOS_IMAGEN = ["look", "color-auto", "color-pop", "fondo-borroso", "cambiar-fondo"];
export const NECESITAN_RECORTE = ["dolly-zoom", "color-pop", "fondo-borroso", "cambiar-fondo"];

// Entrada y salida suave de un efecto que dura todo un tramo (0 → 1 → 0).
const presencia = (c: Capa, t: number, fade = 0.3) => {
  const s = t - c.desde, L = c.hasta - c.desde;
  if (s < 0 || s > L) return 0;
  const f = Math.min(num(c.transicion, fade), L / 2);
  return f <= 0 ? 1 : eInOut(Math.min(s / f, (L - s) / f, 1));
};

// ---------- reencuadre: video horizontal → vertical siguiendo la cara ----------
const tamVideo = (plan: Plan, W: number, H: number) => {
  const asp = (plan.ancho ?? 9) / (plan.alto ?? 16);
  return asp > W / H ? { vw: H * asp, vh: H } : { vw: W, vh: W / asp };
};
export const desplazamiento = (plan: Plan, t: number, W: number, H: number) => {
  const r = plan.capas.find((c) => c.efecto === "reencuadre" && t >= c.desde - 0.01 && t <= c.hasta + 0.01);
  if (!r) return 0;
  const { vw } = tamVideo(plan, W, H);
  const margen = (vw - W) / 2;
  if (margen <= 0) return 0;
  const c = caraEn(plan.caras, t, num(r.suavidad, 0.6));
  return clamp(W * num(r.posicion, 0.5) - (c.x + c.w / 2) * W, -margen, margen);
};
export const carasEnPantalla = (plan: Plan, W: number, H: number): Cara[] | undefined =>
  plan.caras?.map((c) => ({ ...c, x: c.x + desplazamiento(plan, c.t, W, H) / W }));

// ---------- cámara virtual ----------
type Mov = { s: number; tx: number; ty: number; rot: number; blur?: number };
const movimiento = (c: Capa, t: number, fps: number): Mov | null => {
  const s = t - c.desde, L = Math.max(0.05, c.hasta - c.desde);
  if (s < 0 || s > L) return null;
  const m: Mov = { s: 1, tx: 0, ty: 0, rot: 0 };
  switch (c.efecto) {
    case "zoom-in": {             // zoom marcado pero suave hacia la cara
      const z = num(c.zoom, 1.25), dur = Math.min(num(c.rapidez, 0.45), L * 0.8);
      const entra = eInOut(s / dur);
      const sale = c.volver === "suave" ? eInOut(clamp((s - (L - 0.4)) / 0.4)) : 0;
      m.s = 1 + (z - 1) * entra * (1 - sale);
      break;
    }
    case "zoom-suave": {          // acercamiento lento y cinematográfico
      const z = num(c.zoom, 1.18);
      const finSubida = c.volver === "suave" ? Math.max(0.1, L - 0.5) : L;
      const sale = c.volver === "suave" ? eInOut(clamp((s - (L - 0.5)) / 0.5)) : 0;
      m.s = 1 + (z - 1) * eInOut(s / finSubida) * (1 - sale);
      break;
    }
    case "zoom-out": {            // se abre el plano para revelar
      const z = num(c.zoom, 1.45);
      m.s = z - (z - 1) * eInOut(s / L);
      break;
    }
    case "sacudida": {            // temblor de cámara (solo si la persona lo pide)
      const i = num(c.intensidad, 1);
      const caida = Math.pow(1 - s / L, 2);
      const f = Math.round(t * fps);
      const r = (k: string) => random(`${k}-${f}-${c.desde}`) * 2 - 1;
      m.tx = r("x") * 30 * i * caida; m.ty = r("y") * 22 * i * caida; m.rot = r("r") * 1.6 * i * caida;
      m.s = 1 + 0.07 * i * caida;
      break;
    }
    case "_alterno": {             // cortes de silencio: un tramo normal, el siguiente un poco más cerca (oculta el salto)
      const cortes = (Array.isArray(c.cortes) ? c.cortes : []) as number[];
      const n = cortes.filter((x) => x <= t + 1e-4).length;
      m.s = n % 2 === 1 ? num(c.zoom, 1.08) : 1;
      break;
    }
    case "zoom-transicion": {     // zoom rápido hacia adentro hasta el corte y sale abriendo (como pasar a través de la imagen)
      const z = num(c.zoom, 2.2), p = s / L;
      m.s = p < 0.5 ? lerp(1, z, Math.pow(p * 2, 2.2)) : lerp(z, 1, 1 - Math.pow(1 - (p - 0.5) * 2, 2.2));
      m.blur = Math.sin(clamp(p) * Math.PI) * 9;
      break;
    }
    default: return null;
  }
  return m;
};
// Barrido (whip pan): la imagen sale disparada hacia un lado y vuelve a entrar por el otro, con desenfoque de movimiento.
const barrido = (plan: Plan, t: number, W: number) => {
  const c = plan.capas.find((x) => x.efecto === "barrido" && t >= x.desde && t <= x.hasta);
  if (!c) return null;
  const p = (t - c.desde) / Math.max(0.05, c.hasta - c.desde);
  const dir = c.direccion === "derecha" ? 1 : -1;
  const x = p < 0.5 ? Math.pow(p * 2, 2.4) * 0.5 : 0.5 + (1 - Math.pow(1 - (p - 0.5) * 2, 2.4)) * 0.5;   // 0 → 1 (un ancho completo)
  const vel = Math.sin(clamp(p) * Math.PI);
  return { dx: dir * x * W, blur: vel * 38 };
};

export const sonidosEscena = (c: Capa): SfxPlan[] => {
  switch (c.efecto) {
    case "zoom-in": return [{ archivo: "whoosh.wav", en: c.desde - 0.05, vol: 0.3 }];
    case "zoom-out": return [{ archivo: "whoosh.wav", en: c.desde, vol: 0.3 }];
    case "sacudida": return [{ archivo: "boom.wav", en: c.desde, vol: 0.7 }];
    case "dolly-zoom": return [{ archivo: "riser.wav", en: c.desde, vol: 0.4 }];
    case "barrido": return [{ archivo: "whoosh.wav", en: c.desde, vol: 0.5 }];
    case "zoom-transicion": return [{ archivo: "whoosh.wav", en: c.desde + (c.hasta - c.desde) * 0.15, vol: 0.45 }];
    default: return [];
  }
};

// ---------- looks de color ----------
const LOOKS: Record<string, string> = {
  calido: "sepia(0.18) saturate(1.18) hue-rotate(-6deg) contrast(1.05) brightness(1.02)",
  frio: "saturate(0.92) hue-rotate(8deg) contrast(1.06) brightness(1.02)",
  cine: "contrast(1.14) saturate(0.82) brightness(0.97)",
  bn: "grayscale(1) contrast(1.18) brightness(1.03)",
  vintage: "sepia(0.38) contrast(0.9) saturate(0.85) brightness(1.06)",
  vivo: "saturate(1.35) contrast(1.08)",
};
// Mezcla un filtro con la imagen original según intensidad (0..1) usando dos capas.
const lookActivo = (plan: Plan, t: number) => {
  const c = plan.capas.find((x) => x.efecto === "look" && t >= x.desde && t <= x.hasta);
  if (!c) return null;
  const nombre = String(c.estilo ?? c.look ?? "cine").toLowerCase().replace("blanco y negro", "bn").replace("cálido", "calido").replace("frío", "frio");
  return { filtro: LOOKS[nombre] ?? LOOKS.cine, nombre, k: presencia(c, t) * clamp(num(c.intensidad, 1), 0, 1) };
};

// Escena completa.
export const Escena: React.FC<{ plan: Plan }> = ({ plan }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps;
  const { vw, vh } = tamVideo(plan, W, H);
  const dx = desplazamiento(plan, t, W, H);

  // 1. cámara: movimientos combinados
  let S = 1, TX = 0, TY = 0, ROT = 0, BLUR = 0;
  const activas: Capa[] = [];
  for (const c of plan.capas) {
    const m = movimiento(c, t, fps);
    if (!m) continue;
    activas.push(c);
    S *= m.s; TX += m.tx; TY += m.ty; ROT += m.rot; BLUR = Math.max(BLUR, m.blur ?? 0);
  }
  // Ancla fija por efecto: la cara promedio de todo el tramo (no se mueve cuadro a cuadro → sin temblor).
  const dolly = plan.capas.find((c) => c.efecto === "dolly-zoom" && t >= c.desde && t <= c.hasta);
  const refAncla = activas.find((c) => c.efecto !== "_alterno") ?? dolly ?? activas[0];
  const cara = refAncla ? caraEntre(plan.caras, refAncla.desde, refAncla.hasta) : caraEn(plan.caras, t);
  const ax = clamp((cara.x + cara.w / 2) * W + dx, W * 0.2, W * 0.8);
  const ay = clamp((cara.y + cara.h / 2) * H, H * 0.15, H * 0.7);

  // 2. persona recortada (dolly-zoom, color-pop, fondo-borroso)
  const conRecorte = plan.capas.find((c) => NECESITAN_RECORTE.includes(c.efecto) && t >= c.desde && t <= c.hasta && typeof c._recorte === "string");
  let fondoS = 1;
  if (dolly && typeof dolly._recorte === "string") {
    const z = num(dolly.zoom, 1.35);
    const p = eInOut((t - dolly.desde) / Math.max(0.1, dolly.hasta - dolly.desde));
    fondoS = (dolly.direccion === "cierra" ? lerp(1, z, p) : lerp(z, 1, p)) / z;
    S *= z;
  }

  // 3. filtros del fondo y de la persona
  const look = lookActivo(plan, t);
  const pop = plan.capas.find((c) => c.efecto === "color-pop" && t >= c.desde && t <= c.hasta);
  const borroso = plan.capas.find((c) => c.efecto === "fondo-borroso" && t >= c.desde && t <= c.hasta);
  const kPop = pop ? presencia(pop, t, 0.35) : 0;
  const kBlur = borroso ? presencia(borroso, t, 0.4) : 0;
  const nuevoFondo = plan.capas.find((c) => c.efecto === "cambiar-fondo" && t >= c.desde && t <= c.hasta);
  const kFondo = nuevoFondo ? presencia(nuevoFondo, t, 0.35) : 0;
  const auto = plan.capas.find((c) => c.efecto === "color-auto" && t >= c.desde && t <= c.hasta && c._ajuste);
  const aj = auto ? (auto._ajuste as { r: number; g: number; b: number; brillo: number; contraste: number }) : null;
  const kAuto = auto ? presencia(auto, t, 0.3) * clamp(num(auto.intensidad, 1), 0, 1) : 0;
  const filtroFondo = [
    kPop > 0 ? `grayscale(${kPop.toFixed(3)}) contrast(${(1 + 0.12 * kPop).toFixed(3)})` : "",
    kBlur > 0 ? `blur(${(num(borroso!.desenfoque, 12) * kBlur).toFixed(2)}px)` : "",
  ].filter(Boolean).join(" ");
  const escalaFondo = fondoS * (1 + 0.04 * kBlur);   // un poco más grande al desenfocar para que no se vean bordes

  // corrección automática: matriz de color (balance) + brillo/contraste, mezclada según intensidad
  const idAuto = `auto-${plan.video.replace(/[^a-z0-9]/gi, "")}`;
  const mezcla = (v: number) => (1 + (v - 1) * kAuto).toFixed(4);
  const filtroAuto = aj && kAuto > 0 ? `url(#${idAuto}) brightness(${mezcla(aj.brillo)}) contrast(${mezcla(aj.contraste)})` : "";
  const defsAuto = aj && kAuto > 0 ? (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={idAuto} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={`${mezcla(aj.r)} 0 0 0 0  0 ${mezcla(aj.g)} 0 0 0  0 0 ${mezcla(aj.b)} 0 0  0 0 0 1 0`} />
      </filter>
    </svg>
  ) : null;
  const elVideo = <OffthreadVideo src={staticFile(plan.video)} style={{ position: "absolute", width: vw, height: vh, left: (W - vw) / 2 + dx, top: (H - vh) / 2 }} />;
  // fondo nuevo (cambiar-fondo): imagen, video o color detrás de la persona
  const fondoNuevo = nuevoFondo && kFondo > 0 ? (
    <AbsoluteFill style={{ opacity: kFondo, background: typeof nuevoFondo.color === "string" ? nuevoFondo.color : "#111" }}>
      {typeof nuevoFondo.fondo_archivo === "string" ? (/\.(mp4|mov|webm|m4v)$/i.test(nuevoFondo.fondo_archivo)
        ? <OffthreadVideo src={staticFile(nuevoFondo.fondo_archivo)} muted style={{ width: W, height: H, objectFit: "cover", filter: nuevoFondo.desenfoque ? `blur(${num(nuevoFondo.desenfoque, 0)}px)` : undefined }} />
        : <Img src={staticFile(nuevoFondo.fondo_archivo)} style={{ width: W, height: H, objectFit: "cover", filter: nuevoFondo.desenfoque ? `blur(${num(nuevoFondo.desenfoque, 0)}px)` : undefined }} />) : null}
    </AbsoluteFill>
  ) : null;
  const video = (
    <AbsoluteFill style={{ filter: filtroAuto || undefined }}>
      {kBlur > 0 ? (
        // fondo borroso: el video se dibuja a 1/4 de tamaño, se desenfoca ahí (barato) y se agranda
        <AbsoluteFill style={{ transformOrigin: `${ax}px ${ay}px`, transform: `scale(${escalaFondo})` }}>
          <div style={{ width: W / 4, height: H / 4, overflow: "hidden", transform: "scale(4)", transformOrigin: "0 0", willChange: "transform",
            filter: `${kPop > 0 ? `grayscale(${kPop.toFixed(3)}) ` : ""}blur(${((num(borroso!.desenfoque, 12) * kBlur) / 4).toFixed(2)}px)` }}>
            <OffthreadVideo src={staticFile(plan.video)} style={{ position: "absolute", width: vw / 4, height: vh / 4, left: ((W - vw) / 2 + dx) / 4, top: (H - vh) / 8 }} />
          </div>
          {kBlur < 1 ? <AbsoluteFill style={{ opacity: 1 - kBlur }}>{elVideo}</AbsoluteFill> : null}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ transformOrigin: `${ax}px ${ay}px`, transform: `scale(${escalaFondo})`, filter: filtroFondo || undefined }}>{elVideo}</AbsoluteFill>
      )}
      {fondoNuevo}
    </AbsoluteFill>
  );
  const persona = conRecorte ? (
    <Img src={staticFile(`${conRecorte._recorte}/${String(f).padStart(6, "0")}.webp`)}
      style={{ position: "absolute", left: 0, top: 0, width: W, height: H, filter: filtroAuto || undefined }} />
  ) : null;
  const camara = (contenido: React.ReactNode) => (
    <AbsoluteFill style={{ transformOrigin: `${ax}px ${ay}px`, transform: `translate(${TX}px, ${TY}px) rotate(${ROT}deg) scale(${S})` }}>
      {contenido}
    </AbsoluteFill>
  );
  const wp = barrido(plan, t, W);
  // con barrido la escena se repite a los lados para que al desplazarse nunca se vea negro
  const conBarrido = (nodo: React.ReactNode) => !wp ? nodo : (
    <AbsoluteFill style={{ filter: `url(#barrido-${f})` }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={`barrido-${f}`} x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${wp.blur.toFixed(1)} 0`} /></filter>
      </svg>
      {[-1, 0, 1].map((k) => <AbsoluteFill key={k} style={{ transform: `translateX(${wp.dx - Math.sign(wp.dx || 1) * 0 + k * W}px)` }}>{nodo}</AbsoluteFill>)}
    </AbsoluteFill>
  );
  const conBlur = (nodo: React.ReactNode) => (BLUR > 0.3 ? <AbsoluteFill style={{ filter: `blur(${BLUR.toFixed(2)}px)` }}>{nodo}</AbsoluteFill> : nodo);
  const capaBase = conBlur(conBarrido(camara(<>{video}{persona}</>)));

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {defsAuto}
      {capaBase}
      {look && look.k > 0 ? (
        // la versión con look encima, con opacidad = intensidad (así entra y sale suave)
        <AbsoluteFill style={{ opacity: look.k, filter: look.filtro }}>{conBlur(conBarrido(camara(<>{video}{persona}</>)))}</AbsoluteFill>
      ) : null}
      {look && look.k > 0 && (look.nombre === "cine" || look.nombre === "vintage") ? (
        <AbsoluteFill style={{ opacity: look.k * 0.55, background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
      ) : null}
    </AbsoluteFill>
  );
};
