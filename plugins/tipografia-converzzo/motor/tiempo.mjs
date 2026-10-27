// Efectos de tiempo: camara-lenta, acelerar, congelar, rebobinar y cortar-silencios.
// Cambian la duración del video, así que se hacen antes del render con ffmpeg:
//  1. se arma un video nuevo con los tramos cambiados de velocidad (con su audio),
//  2. los tiempos de las demás capas (que vienen en el tiempo del video original) se pasan al tiempo nuevo,
//  3. congelar y rebobinar dejan una capa gráfica (_congelar, _vhs) para el texto y el look.
export const EFECTOS_TIEMPO = ["camara-lenta", "acelerar", "congelar", "rebobinar"];

const n = (v, d) => (typeof v === "number" && isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && isFinite(+v) ? +v : d);

// Arma las piezas del video nuevo a partir del plan (tiempos del original).
// `cortes`: tramos [a, b] del original que se quitan (silencios detectados).
export function piezas(capas, dur, cortes = []) {
  const tiempo = capas.filter((c) => EFECTOS_TIEMPO.includes(c.efecto)).sort((a, b) => a.desde - b.desde);
  const fin = (c) => (c.efecto === "congelar" ? c.desde : c.hasta);   // congelar ocurre en un instante; su "hasta" es cuánto dura la pausa
  for (let i = 1; i < tiempo.length; i++)
    if (tiempo[i].desde < fin(tiempo[i - 1]) - 0.01) throw new Error(`Los efectos de tiempo no se pueden encimar: ${tiempo[i - 1].efecto} y ${tiempo[i].efecto}.`);
  const out = [];
  let t = 0;
  const normal = (a, b) => { if (b - a > 0.02) out.push({ tipo: "normal", a, b }); };
  for (const c of tiempo) {
    const a = Math.max(0, Math.min(dur, c.desde)), b = Math.max(a, Math.min(dur, c.hasta));
    if (c.efecto === "congelar") {
      normal(t, a);
      out.push({ tipo: "congelar", a, dur: Math.max(0.3, b - a), capa: c });
      t = a;                               // el video sigue desde donde se congeló
      continue;
    }
    normal(t, a);
    if (c.efecto === "camara-lenta") out.push({ tipo: "velocidad", a, b, v: Math.min(0.9, Math.max(0.2, n(c.velocidad, 0.5))), capa: c });
    if (c.efecto === "acelerar") out.push({ tipo: "velocidad", a, b, v: Math.min(8, Math.max(1.25, n(c.velocidad, 2))), capa: c });
    if (c.efecto === "rebobinar") {
      out.push({ tipo: "normal", a, b });
      out.push({ tipo: "reversa", a, b, v: Math.min(6, Math.max(1.5, n(c.velocidad, 3))), capa: c });
      if (c.repetir !== false) { t = a; continue; }   // vuelve a reproducir el tramo después de rebobinar
    }
    t = b;
  }
  normal(t, dur);
  // quitar los silencios de las piezas normales (los tramos con efectos de velocidad no se tocan)
  const final = [];
  for (const p of out) {
    if (p.tipo !== "normal" || !cortes.length) { final.push(p); continue; }
    let a = p.a;
    for (const [ca, cb] of cortes) {
      if (cb <= a || ca >= p.b) continue;
      if (ca - a > 0.02) final.push({ tipo: "normal", a, b: ca, corte: true });
      a = Math.max(a, cb);
    }
    if (p.b - a > 0.02) final.push({ tipo: "normal", a, b: p.b });
  }
  out.length = 0; out.push(...final);
  // duración de cada pieza en el video nuevo
  let acc = 0;
  for (const p of out) {
    p.d = p.tipo === "normal" ? p.b - p.a : p.tipo === "congelar" ? p.dur : (p.b - p.a) / p.v;
    p.inicio = acc; acc += p.d;
  }
  return { piezas: out, duracionNueva: acc, hayTiempo: tiempo.length > 0 || cortes.length > 0 };
}

// Tiempo del original → tiempo del video nuevo (la primera vez que aparece ese instante).
export function mapear(t, ps) {
  for (const p of ps) {
    if (p.tipo === "normal" && t >= p.a - 1e-6 && t <= p.b + 1e-6) return p.inicio + (t - p.a);
    if (p.tipo === "velocidad" && t >= p.a && t <= p.b) return p.inicio + (t - p.a) / p.v;
    if (p.tipo === "congelar" && Math.abs(t - p.a) < 1e-6) return p.inicio;
  }
  // si cae en un tramo quitado (silencio), va al inicio de lo que sigue
  const sig = ps.find((p) => (p.tipo === "normal" || p.tipo === "velocidad") && p.a >= t);
  if (sig) return sig.inicio;
  const ult = ps[ps.length - 1];
  return ult ? ult.inicio + ult.d : t;
}

// Filtro de ffmpeg que construye el video nuevo. Sale en vertical listo para el motor.
export function filtro(ps, fps, conAudio) {
  const N = ps.length;
  const esc = "scale='if(gt(a,9/16),-2,1080)':'if(gt(a,9/16),1920,-2)':flags=lanczos";
  const v = [`[0:v]${esc},fps=${fps},format=yuv420p,split=${N}${ps.map((_, i) => `[vi${i}]`).join("")}`];
  const a = conAudio ? [`[0:a:0]aformat=sample_rates=48000:channel_layouts=stereo,asplit=${N}${ps.map((_, i) => `[ai${i}]`).join("")}`] : [];
  const atempo = (x) => { const f = []; while (x < 0.5) { f.push("atempo=0.5"); x /= 0.5; } while (x > 2) { f.push("atempo=2"); x /= 2; } f.push(`atempo=${x.toFixed(4)}`); return f.join(","); };
  ps.forEach((p, i) => {
    const vin = `[vi${i}]`, ain = `[ai${i}]`, vo = `[v${i}]`, ao = `[a${i}]`;
    // silencio: si el video tiene audio, la entrada de esta pieza se descarta (anullsink) para que no quede suelta
    const silencio = `${conAudio ? `${ain}anullsink;` : ""}anullsrc=r=48000:cl=stereo,atrim=duration=${p.d.toFixed(4)}${ao}`;
    if (p.tipo === "normal") {
      v.push(`${vin}trim=start=${p.a}:end=${p.b},setpts=PTS-STARTPTS${vo}`);
      a.push(conAudio ? `${ain}atrim=start=${p.a}:end=${p.b},asetpts=PTS-STARTPTS${ao}` : silencio);
    } else if (p.tipo === "velocidad") {
      const fluido = p.v < 1 && p.capa.fluido !== false;
      const interp = p.v < 1 ? (fluido ? `,minterpolate=fps=${fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1` : `,minterpolate=fps=${fps}:mi_mode=blend`) : `,fps=${fps}`;
      v.push(`${vin}trim=start=${p.a}:end=${p.b},setpts=(PTS-STARTPTS)/${p.v}${interp}${vo}`);
      const mudo = p.capa.audio === "silencio";
      a.push(conAudio && !mudo ? `${ain}atrim=start=${p.a}:end=${p.b},asetpts=PTS-STARTPTS,${atempo(p.v)}${ao}` : silencio);
    } else if (p.tipo === "reversa") {
      v.push(`${vin}trim=start=${p.a}:end=${p.b},setpts=PTS-STARTPTS,reverse,setpts=PTS/${p.v},fps=${fps}${vo}`);
      a.push(conAudio ? `${ain}atrim=start=${p.a}:end=${p.b},asetpts=PTS-STARTPTS,areverse,${atempo(p.v)},volume=0.45${ao}` : silencio);
    } else if (p.tipo === "congelar") {
      const cuadros = Math.max(1, Math.round(p.d * fps));
      v.push(`${vin}trim=start=${p.a},setpts=PTS-STARTPTS,trim=end_frame=1,loop=loop=${cuadros - 1}:size=1:start=0,setpts=N/(${fps}*TB)${vo}`);
      a.push(silencio);
    }
  });
  const concat = `${ps.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${N}:v=1:a=1[vout][aout]`;
  return [...v, ...a, concat].join(";");
}

// Pasa el plan al tiempo nuevo y agrega las capas gráficas de congelar y rebobinar.
export function remapearPlan(plan, ps) {
  const capas = [];
  for (const c of plan.capas) {
    if (EFECTOS_TIEMPO.includes(c.efecto) || c.efecto === "cortar-silencios") continue;
    const desde = mapear(c.desde, ps), hasta = Math.max(desde + 0.05, mapear(c.hasta, ps));
    // también se ajustan los instantes internos: "en" (pasos) y los que terminan en "_en" (antes_en, despues_en)
    const ajustar = (o) => Array.isArray(o) ? o.map(ajustar) : o && typeof o === "object"
      ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "number" && (k === "en" || k === "start" || k === "end" || k.endsWith("_en")) ? mapear(v, ps) : ajustar(v)])) : o;
    capas.push({ ...ajustar(c), desde, hasta });
  }
  for (const p of ps) {
    if (p.tipo === "congelar") capas.push({ efecto: "_congelar", desde: p.inicio, hasta: p.inicio + p.d, texto: p.capa.texto, flecha: p.capa.flecha, color: p.capa.color });
    if (p.tipo === "reversa") capas.push({ efecto: "_vhs", desde: p.inicio, hasta: p.inicio + p.d, texto: p.capa.texto ?? "REBOBINANDO" });
    if (p.tipo === "velocidad" && p.capa.etiqueta) capas.push({ efecto: "_etiqueta", desde: p.inicio, hasta: p.inicio + p.d, texto: p.capa.etiqueta });
  }
  // cortes de silencio: zoom alterno en cada corte para que el salto no se note (salvo que se pida sin zoom)
  const cs = plan.capas.find((c) => c.efecto === "cortar-silencios");
  if (cs && cs.zoom_alterno !== false) {
    const marcas = ps.filter((p) => p.corte).map((p) => p.inicio + p.d);
    const total = ps.length ? ps[ps.length - 1].inicio + ps[ps.length - 1].d : 0;
    if (marcas.length) capas.unshift({ efecto: "_alterno", desde: 0, hasta: total, cortes: marcas, zoom: cs.zoom ?? 1.08 });
  }
  return { ...plan, capas };
}
