"""Transcribe el video con tiempos por palabra (faster-whisper, corre en el computador, gratis).
Uso: python transcribir.py video.mp4 transcripcion.json [idioma]
Salida: [{"text": "...", "start": 1.23, "end": 1.5}, ...] e imprime el texto con tiempos.
"""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

video, salida = sys.argv[1], sys.argv[2]
idioma = sys.argv[3] if len(sys.argv) > 3 else None
modelo = WhisperModel("small", device="cpu", compute_type="int8")
# El audio se lee con ffmpeg (más compatible que el lector interno).
crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(crudo, np.int16).astype(np.float32) / 32768.0
segs, info = modelo.transcribe(audio, language=idioma, word_timestamps=True, vad_filter=True)
palabras = []
for s in segs:
    for w in s.words or []:
        palabras.append({"text": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)})
json.dump(palabras, open(salida, "w"), ensure_ascii=False)
linea, t0 = [], None
for w in palabras:
    t0 = w["start"] if t0 is None else t0
    linea.append(w["text"])
    if len(linea) >= 10:
        print(f"[{t0:6.2f}] {' '.join(linea)}"); linea, t0 = [], None
if linea:
    print(f"[{t0:6.2f}] {' '.join(linea)}")
