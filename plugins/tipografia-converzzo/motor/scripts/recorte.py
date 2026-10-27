"""Recorta a la persona del fondo en un tramo del video y guarda WebP con transparencia (1080x1920).
Uso: python recorte.py video.mp4 desde hasta fps carpeta_salida [collage]
Con "collage" la persona sale ya convertida en papel impreso (trama de puntos, borde blanco y sombra) para collage-halftone.
Cada imagen se llama con su número de frame (000123.webp). Lo usan dolly-zoom y los efectos de fondo.
Modelo: MediaPipe Selfie Segmenter (Apache 2.0).
"""
import os, subprocess, sys
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.core.base_options import BaseOptions

video, desde, hasta, fps, salida = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
COLLAGE = len(sys.argv) > 6 and sys.argv[6] == "collage"
os.makedirs(salida, exist_ok=True)
W, H = 1080, 1920
MODELO = os.path.join(os.path.dirname(__file__), "..", "models", "selfie_segmenter.tflite")
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=MODELO), running_mode=vision.RunningMode.VIDEO,
    output_confidence_masks=True, output_category_mask=False))


def suavizar_bordes(guia, m, r=8, eps=2e-3):
    """Filtro guiado: pega el borde de la máscara a los bordes reales de la imagen (pelo, hombros)."""
    caja = lambda x: cv2.boxFilter(x, -1, (2 * r + 1, 2 * r + 1))
    mi, mm = caja(guia), caja(m)
    a = (caja(guia * m) - mi * mm) / (caja(guia * guia) - mi * mi + eps)
    b = mm - a * mi
    return np.clip(caja(a) * guia + caja(b), 0, 1)


# ---- estilo collage: trama de puntos real (el tamaño del punto depende de la luz), borde blanco de tijera y sombra ----
CELDA = 9
yy, xx = np.mgrid[0:H, 0:W]
dx = (xx % CELDA) - CELDA / 2 + 0.5
dy = (yy % CELDA) - CELDA / 2 + 0.5
DIST = np.sqrt(dx * dx + dy * dy)
NUCLEO = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19))


def collage(rgb, m):
    gris = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    gris = np.clip((gris - 0.5) * 1.5 + 0.55, 0, 1)
    celdas = cv2.resize(gris, (W // CELDA + 1, H // CELDA + 1), interpolation=cv2.INTER_AREA)
    lum = cv2.resize(celdas, (W // CELDA + 1, H // CELDA + 1))[yy // CELDA, xx // CELDA]
    radio = (1 - lum) * CELDA * 0.72
    tinta = np.clip(radio - DIST + 0.5, 0, 1)                   # punto con borde suave
    papel = np.array([242, 236, 226], np.float32)
    color = papel[None, None, :] * (1 - tinta[..., None]) + np.array([27, 27, 27], np.float32) * tinta[..., None]
    dentro = (m > 0.5).astype(np.uint8)
    borde = cv2.dilate(dentro, NUCLEO)
    corrida = np.zeros_like(borde, np.float32)
    corrida[16:] = borde[:-16]                                    # sombra 16 px más abajo (sin dar la vuelta)
    sombra = cv2.GaussianBlur(corrida, (0, 0), 9) * 0.38
    a_persona = m
    a_borde = borde.astype(np.float32)
    salida = np.zeros((H, W, 4), np.float32)
    # sombra (negra) -> borde (blanco) -> persona (trama)
    salida[..., 3] = np.maximum(sombra, a_borde)
    blanco = np.full((H, W, 3), 255, np.float32)
    base = blanco * a_borde[..., None]
    salida[..., :3] = color * a_persona[..., None] + base * (1 - a_persona[..., None])
    salida[..., :3] = np.where(a_borde[..., None] > 0, salida[..., :3], 0)
    return np.dstack([salida[..., :3], salida[..., 3] * 255]).clip(0, 255).astype(np.uint8)


f0 = round(desde * fps)
n = max(1, round((hasta - desde) * fps)) + 2
cmd = ["ffmpeg", "-v", "error", "-ss", f"{f0 / fps:.4f}", "-i", video, "-frames:v", str(n),
       "-vf", f"fps={fps},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
       "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
prev, i = None, 0
while i < n:
    buf = p.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    peq = cv2.resize(rgb, (W // 2, H // 2))
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(peq))
    m = seg.segment_for_video(img, int((f0 + i) * 1000 / fps)).confidence_masks[-1].numpy_view().astype(np.float32)
    m = cv2.resize(m.reshape(m.shape[0], m.shape[1]), (W, H))
    m = suavizar_bordes(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255, m)
    m = np.clip((m - 0.5) * 1.6 + 0.5, 0, 1)
    if prev is not None:
        m = 0.65 * m + 0.35 * prev          # menos parpadeo entre frames
    prev = m
    rgba = np.dstack([rgb, (m * 255).astype(np.uint8)])
    if COLLAGE:
        rgba = collage(rgb, m)
    cv2.imwrite(os.path.join(salida, f"{f0 + i:06d}.webp"), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_WEBP_QUALITY, 92])
    i += 1
p.stdout.close(); p.wait()
print(f"recorte: {i} frames desde el {f0}")
