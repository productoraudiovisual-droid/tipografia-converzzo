"""Copia el color de una imagen de referencia al video: genera una LUT 3D (.cube) para ffmpeg.
Uso: python lut_referencia.py video.mp4 referencia.jpg salida.cube [intensidad 0..1]
Método: transferencia de color de Reinhard en espacio Lab (iguala promedio y contraste de cada canal),
con límites para que no se vea artificial. Funciona con una foto, un fotograma de otro video o una paleta.
"""
import subprocess, sys
import cv2
import numpy as np

video, ref, salida = sys.argv[1], sys.argv[2], sys.argv[3]
k = float(sys.argv[4]) if len(sys.argv) > 4 else 0.75


def a_lab(rgb):  # rgb float 0..1 -> Lab (D65)
    c = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def a_rgb(lab):
    fy = (lab[..., 0] + 16) / 116
    fx, fz = fy + lab[..., 1] / 500, fy - lab[..., 2] / 200
    f = np.stack([fx, fy, fz], -1)
    xyz = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * np.array([0.95047, 1.0, 1.08883])
    Mi = np.array([[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]])
    c = np.clip(xyz @ Mi.T, 0, 1)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * c ** (1 / 2.4) - 0.055)


def stats(px):
    lab = a_lab(px.reshape(-1, 3))
    return lab.mean(0), lab.std(0) + 1e-3


# muestras del video
W, H = 160, 284
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps=1,scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
                      "-frames:v", "20", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.uint8)
v = v[: (len(v) // (W * H * 3)) * W * H * 3].reshape(-1, 3).astype(np.float32) / 255
r = cv2.imread(ref, cv2.IMREAD_COLOR)
if r is None:
    sys.exit(f"No pude abrir la referencia: {ref}")
r = cv2.cvtColor(cv2.resize(r, (320, 320)), cv2.COLOR_BGR2RGB).reshape(-1, 3).astype(np.float32) / 255
mv, sv = stats(v)
mr, sr = stats(r)
esc = np.clip(sr / sv, [0.7, 0.5, 0.5], [1.35, 2.0, 2.0])     # luz con cambios moderados; color con más libertad
mr = np.array([mv[0] + np.clip(mr[0] - mv[0], -15, 15), mv[1] + np.clip(mr[1] - mv[1], -22, 22), mv[2] + np.clip(mr[2] - mv[2], -22, 22)])  # cambios con límite

N = 33
g = np.linspace(0, 1, N)
b, gg, rr = np.meshgrid(g, g, g, indexing="ij")              # orden .cube: R varía más rápido
rgb = np.stack([rr, gg, b], -1).reshape(-1, 3)
lab = a_lab(rgb)
nuevo = (lab - mv) * esc + mr
out = a_rgb(nuevo)
out = rgb + (out - rgb) * k
with open(salida, "w") as fh:
    fh.write(f"TITLE \"color-referencia\"\nLUT_3D_SIZE {N}\n")
    for p in out:
        fh.write(f"{p[0]:.5f} {p[1]:.5f} {p[2]:.5f}\n")
print(f"lut: video L={mv[0]:.0f} a={mv[1]:.1f} b={mv[2]:.1f} -> ref L={mr[0]:.0f} a={mr[1]:.1f} b={mr[2]:.1f}")
