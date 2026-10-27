import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { Plan } from "./lib/base";
import { Editar } from "./Editar";
import { Catalogo } from "./Catalogo";

const meta: CalculateMetadataFunction<Plan> = ({ props }) => ({ durationInFrames: Math.max(1, props.duracion), fps: props.fps || 30 });

export const Root: React.FC = () => (
  <>
  <Composition id="Catalogo" component={Catalogo} width={2200} height={1780} durationInFrames={1} fps={30} defaultProps={{}} />
  <Composition id="Editar" component={Editar} width={1080} height={1920} durationInFrames={150} fps={30}
    defaultProps={{ video: "", duracion: 150, fps: 30, capas: [] } as Plan} calculateMetadata={meta} />
  </>
);
