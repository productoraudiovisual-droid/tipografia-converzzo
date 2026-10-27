"""Mide el color de un tramo del video y propone una corrección automática (exposición y balance de blancos).
Uso: python color.py video.mp4 desde hasta
Imprime JSON: {"r": 1.02, "g": 1.0, "b": 0.95, "brillo": 1.08, "contraste": 1.05}
Método: "mundo gris" para el balance (el promedio de la escena debería ser neutro) y una exposición objetivo
para el brillo, con límites suaves para no exagerar.
"""
import json, subprocess, sys
import numpy as np

video, desde, hasta = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
dur = max(0.5, hasta - desde)
n = 12
W, H = 160, 284
cmd = ["ffmpeg", "-v", "error", "-ss", f"{desde:.3f}", "-t", f"{dur:.3f}", "-i", video,
       "-vf", f"fps={n / dur:.4f},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
raw = subprocess.run(cmd, capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8)
fr = fr[: (len(fr) // (W * H * 3)) * W * H * 3].reshape(-1, H, W, 3).astype(np.float32) / 255.0
if not len(fr):
    print(json.dumps({"r": 1, "g": 1, "b": 1, "brillo": 1, "contraste": 1})); sys.exit()
px = fr.reshape(-1, 3)
luma = px @ np.array([0.2126, 0.7152, 0.0722])
medio = (luma > 0.05) & (luma < 0.95)                     # sin negros ni blancos quemados
m = px[medio].mean(0) if medio.sum() > 100 else px.mean(0)
gris = m.mean()
ganancia = np.clip(gris / np.maximum(m, 1e-3), 0.88, 1.15)
ganancia = 1 + (ganancia - 1) * 0.85                      # corrige el 85 % para que no quede "lavado"
y = float(np.median(luma))
# solo corrige si de verdad hace falta: sube si está oscuro, baja solo si está quemado
if y < 0.40:
    brillo = 1 + (min(1.4, 0.46 / max(y, 1e-3)) - 1) * 0.9
elif y > 0.72:
    brillo = 1 - (1 - max(0.88, 0.66 / y)) * 0.75
else:
    brillo = 1.0
std = float(luma.std())
contraste = float(np.clip(0.2 / max(std, 1e-3), 1.0, 1.12)) if std < 0.18 else 1.0
print(json.dumps({"r": round(float(ganancia[0]), 3), "g": round(float(ganancia[1]), 3), "b": round(float(ganancia[2]), 3),
                  "brillo": round(brillo, 3), "contraste": round(contraste, 3)}))
