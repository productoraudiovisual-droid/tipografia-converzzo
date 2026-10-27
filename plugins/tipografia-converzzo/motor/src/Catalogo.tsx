// Hoja con todas las fuentes de la biblioteca (la usa /fuentes). Se renderiza como imagen.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CATALOGO } from "./lib/catalogo";
import { familia, useFuentes } from "./lib/base";

export const Catalogo: React.FC<{ muestra?: string }> = ({ muestra = "Tu marca 2026" }) => {
  useFuentes(CATALOGO.map((c) => c.archivo).concat(["Montserrat-ExtraBold.ttf"]));
  const grupos = [...new Set(CATALOGO.map((c) => c.grupo))];
  return (
    <AbsoluteFill style={{ background: "#F4F1EA", padding: "70px 70px", fontFamily: familia("Montserrat-ExtraBold.ttf") }}>
      <div style={{ fontSize: 64, color: "#111", letterSpacing: "-0.02em" }}>Biblioteca de fuentes</div>
      <div style={{ fontSize: 26, color: "#6b6b6b", marginTop: 8, marginBottom: 36 }}>40 familias gratuitas (44 variantes) · pídelas por su nombre o su id (por ejemplo "anton")</div>
      <div style={{ columnCount: 3, columnGap: 70 }}>
        {grupos.map((g) => (
          <div key={g} style={{ breakInside: "avoid", marginBottom: 34 }}>
            <div style={{ fontSize: 22, letterSpacing: "0.22em", color: "#FF3B30", marginBottom: 12 }}>{g.toUpperCase()}</div>
            {CATALOGO.filter((c) => c.grupo === g).map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid #DDD6C8", padding: "10px 0" }}>
                <span style={{ fontFamily: familia(c.archivo), fontSize: c.id === "press-start" ? 26 : c.id === "monoton" ? 36 : 46, color: "#111", whiteSpace: "nowrap" }}>{c.nombre}</span>
                <span style={{ fontSize: 20, color: "#8a8a8a", marginLeft: 16, whiteSpace: "nowrap" }}>{c.id}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 70, bottom: 36, fontSize: 20, color: "#9a9a9a" }}>Licencias OFL y Apache: uso comercial libre · tipografia-converzzo por @converzzo</div>
    </AbsoluteFill>
  );
};
