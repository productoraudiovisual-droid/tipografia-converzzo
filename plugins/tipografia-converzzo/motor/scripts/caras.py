"""Detecta la cara en el video (5 veces por segundo) y guarda cajas normalizadas 0..1 en JSON.
Uso: python caras.py video.mp4 caras.json
Lo usan los efectos para no tapar la cara nunca. Modelo: YuNet (OpenCV Zoo, MIT).
"""
import json, os, sys
import cv2

video, salida = sys.argv[1], sys.argv[2]
MODELO = os.path.join(os.path.dirname(__file__), "..", "models", "yunet.onnx")
cap = cv2.VideoCapture(video)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Encuadre final 1080x1920 (object-fit: cover): coordenadas relativas al recorte vertical.
destino = 1080 / 1920
if W / H > destino:
    cw, ch = H * destino, H
else:
    cw, ch = W, W / destino
ox, oy = (W - cw) / 2, (H - ch) / 2

escala = 640 / max(W, H)
det = cv2.FaceDetectorYN.create(MODELO, "", (int(W * escala), int(H * escala)), 0.6, 0.3, 5000)
paso = max(1, round(fps / 5))
out, i = [], 0
while True:
    ok = cap.grab()
    if not ok:
        break
    if i % paso == 0:
        ok, fr = cap.retrieve()
        if not ok:
            break
        peq = cv2.resize(fr, (int(W * escala), int(H * escala)))
        _, caras = det.detect(peq)
        if caras is not None and len(caras):
            x, y, w, h = max(caras, key=lambda c: c[2] * c[3])[:4] / escala
            out.append({"t": round(i / fps, 2), "x": round(float((x - ox) / cw), 4), "y": round(float((y - oy) / ch), 4),
                        "w": round(float(w / cw), 4), "h": round(float(h / ch), 4)})
    i += 1
json.dump(out, open(salida, "w"))
print(f"caras: {len(out)} muestras")
