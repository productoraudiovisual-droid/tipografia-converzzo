// Composición única: aplica todas las capas del plan sobre el video en un solo render.
// Orden: escena (video + cámara + color + fondo) → glitch → grano → gráficos → flash.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Capa, Ctx, Plan, Sfx, SfxPlan, estiloFinal, useFuentes } from "./lib/base";
import { EFECTOS_CAMARA, EFECTOS_IMAGEN, Escena, carasEnPantalla, sonidosEscena } from "./efectos/camara";
import { BandasPelicula, ConGlitch, EFECTOS_SUPERFICIE, Flash, Grano, sonidosSuperficie } from "./efectos/superficie";
import { CarruselVideo, CollageHalftone, sonidosCarrusel, sonidosCollage } from "./efectos/motion2";
import { PrecioPop, sonidosPrecio } from "./efectos/PrecioPop";
import { Congelar, Etiqueta, Vhs, sonidosTiempo } from "./efectos/tiempo";
import { CartelNombre, Dato, Gancho, Ingredientes, TallasColores, sonidosCartel, sonidosDato, sonidosGancho, sonidosIngredientes, sonidosTallas } from "./efectos/universales";
import { Subtitulos, fuentesSubtitulos } from "./efectos/subtitulos";
import { Capitulo, Cita, CuentaRegresiva, PalabraClave, Pregunta, TituloDetras, sonidosCapitulo, sonidosCita, sonidosCuenta, sonidosPalabraClave, sonidosPregunta, sonidosTituloDetras } from "./efectos/textos";
import { TextoAnimado, fuentesAnimado, sonidosAnimado } from "./efectos/animado";
import { GraficaDatos, LogoSting, MockupInterfaz, TierList, WidgetsVidrio, sonidosGrafica, sonidosLogo, sonidosMockup, sonidosTier, sonidosWidgets } from "./efectos/motion";
import { AntesDespues, Comparativo, CtaWhatsapp, Ficha, PasoAPaso, Ubicacion, sonidosAntesDespues, sonidosComparativo, sonidosCta, sonidosFicha, sonidosPasos, sonidosUbicacion } from "./efectos/negocios";

// Efectos gráficos (van encima del video y no se mueven con la cámara).
// Para agregar uno nuevo: crea su componente en efectos/ y regístralo aquí.
type Grafico = { C: React.FC<{ capa: never; ctx: Ctx }>; sonidos?: (c: never) => SfxPlan[] };
const GRAFICOS: Record<string, Grafico> = {
  "precio-pop": { C: PrecioPop as Grafico["C"], sonidos: sonidosPrecio as Grafico["sonidos"] },
  "antes-despues": { C: AntesDespues as Grafico["C"], sonidos: sonidosAntesDespues as Grafico["sonidos"] },
  "cta-whatsapp": { C: CtaWhatsapp as Grafico["C"], sonidos: sonidosCta as Grafico["sonidos"] },
  "paso-a-paso": { C: PasoAPaso as Grafico["C"], sonidos: sonidosPasos as Grafico["sonidos"] },
  comparativo: { C: Comparativo as Grafico["C"], sonidos: sonidosComparativo as Grafico["sonidos"] },
  ficha: { C: Ficha as Grafico["C"], sonidos: sonidosFicha as Grafico["sonidos"] },
  ubicacion: { C: Ubicacion as Grafico["C"], sonidos: sonidosUbicacion as Grafico["sonidos"] },
  gancho: { C: Gancho as Grafico["C"], sonidos: sonidosGancho as Grafico["sonidos"] },
  "cartel-nombre": { C: CartelNombre as Grafico["C"], sonidos: sonidosCartel as Grafico["sonidos"] },
  dato: { C: Dato as Grafico["C"], sonidos: sonidosDato as Grafico["sonidos"] },
  ingredientes: { C: Ingredientes as Grafico["C"], sonidos: sonidosIngredientes as Grafico["sonidos"] },
  "tallas-colores": { C: TallasColores as Grafico["C"], sonidos: sonidosTallas as Grafico["sonidos"] },
  subtitulos: { C: Subtitulos as Grafico["C"] },
  "titulo-detras": { C: TituloDetras as Grafico["C"], sonidos: sonidosTituloDetras as Grafico["sonidos"] },
  cita: { C: Cita as Grafico["C"], sonidos: sonidosCita as Grafico["sonidos"] },
  "palabra-clave": { C: PalabraClave as Grafico["C"], sonidos: sonidosPalabraClave as Grafico["sonidos"] },
  capitulo: { C: Capitulo as Grafico["C"], sonidos: sonidosCapitulo as Grafico["sonidos"] },
  "cuenta-regresiva": { C: CuentaRegresiva as Grafico["C"], sonidos: sonidosCuenta as Grafico["sonidos"] },
  pregunta: { C: Pregunta as Grafico["C"], sonidos: sonidosPregunta as Grafico["sonidos"] },
  "texto-animado": { C: TextoAnimado as Grafico["C"], sonidos: sonidosAnimado as Grafico["sonidos"] },
  "grafica-datos": { C: GraficaDatos as Grafico["C"], sonidos: sonidosGrafica as Grafico["sonidos"] },
  "logo-sting": { C: LogoSting as Grafico["C"], sonidos: sonidosLogo as Grafico["sonidos"] },
  "tier-list": { C: TierList as Grafico["C"], sonidos: sonidosTier as Grafico["sonidos"] },
  "mockup-interfaz": { C: MockupInterfaz as Grafico["C"], sonidos: sonidosMockup as Grafico["sonidos"] },
  "widgets-vidrio": { C: WidgetsVidrio as Grafico["C"], sonidos: sonidosWidgets as Grafico["sonidos"] },
  "collage-halftone": { C: CollageHalftone as Grafico["C"], sonidos: sonidosCollage as Grafico["sonidos"] },
  "carrusel-video": { C: CarruselVideo as Grafico["C"], sonidos: sonidosCarrusel as Grafico["sonidos"] },
  // capas internas que crea tiempo.mjs (congelar, rebobinar, etiquetas de velocidad)
  _congelar: { C: Congelar as Grafico["C"], sonidos: sonidosTiempo as Grafico["sonidos"] },
  _vhs: { C: Vhs as Grafico["C"], sonidos: sonidosTiempo as Grafico["sonidos"] },
  _etiqueta: { C: Etiqueta as Grafico["C"] },
};
export const EFECTOS = [...EFECTOS_CAMARA, ...EFECTOS_IMAGEN, ...EFECTOS_SUPERFICIE, ...Object.keys(GRAFICOS)];

const sonidosDe = (c: Capa): SfxPlan[] => {
  if (EFECTOS_CAMARA.includes(c.efecto) || EFECTOS_IMAGEN.includes(c.efecto)) return sonidosEscena(c);
  if (EFECTOS_SUPERFICIE.includes(c.efecto)) return sonidosSuperficie(c);
  return GRAFICOS[c.efecto]?.sonidos?.(c as never) ?? [];
};

export const Editar: React.FC<Plan> = (plan) => {
  const { width: W, height: H } = useVideoConfig();
  const E = estiloFinal(plan.estilo);
  // todas las fuentes que usa el plan (estilo, fuentes por defecto de cada efecto y las que pida cada capa)
  const DEF: Record<string, string[]> = { "titulo-detras": ["anton"], "palabra-clave": ["anton"], cita: ["playfair", "playfair-italic"], "cuenta-regresiva": ["anton", "space-grotesk"] };
  useFuentes([E.fuente, E.fuenteTitulo, ...(plan.estilo?.fuenteSubtitulos ? [plan.estilo.fuenteSubtitulos] : []), ...plan.capas.flatMap((c) => [
    ...(c.efecto === "subtitulos" ? fuentesSubtitulos(c) : c.efecto === "texto-animado" ? fuentesAnimado(c) : DEF[c.efecto] ?? []),
    ...(typeof c.fuente === "string" ? [c.fuente] : []),
  ])]);
  const ctx: Ctx = { estilo: plan.estilo, caras: carasEnPantalla(plan, W, H), video: plan.video };
  const es = plan.capas.find((c) => c.efecto === "efectos-sonido");
  const nivel = es ? ({ sutil: 0.6, medio: 1, fuerte: 1.4 } as Record<string, number>)[String(es.nivel ?? "medio")] ?? 1 : 1;
  const extra: SfxPlan[] = es ? [
    ...((Array.isArray(es.sonidos) ? es.sonidos : []) as { tipo?: string; en?: number; vol?: number }[])
      .filter((x) => typeof x.en === "number").map((x) => ({ archivo: `${String(x.tipo ?? "whoosh").replace(/\.wav$/, "")}.wav`, en: x.en as number, vol: x.vol ?? 0.5 })),
    ...(es.en_cortes !== false ? plan.capas.filter((c) => c.efecto === "_alterno").flatMap((c) => ((c.cortes ?? []) as number[]).map((en) => ({ archivo: "swoosh_baja.wav", en: en - 0.04, vol: 0.18 }))) : []),
  ] : [];
  const sonidos = plan.sonido === false ? [] : [...plan.capas.flatMap(sonidosDe), ...extra].map((x) => ({ ...x, vol: Math.min(1, (x.vol ?? 0.5) * nivel) }));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ConGlitch plan={plan}>
        <Escena plan={plan} />
        <Grano plan={plan} />
        {plan.capas.map((c, i) => {
          const g = GRAFICOS[c.efecto];
          return g ? <g.C key={i} capa={c as never} ctx={ctx} /> : null;
        })}
      </ConGlitch>
      <BandasPelicula plan={plan} />
      <Flash plan={plan} />
      {sonidos.map((s, i) => <Sfx key={i} {...s} />)}
    </AbsoluteFill>
  );
};
