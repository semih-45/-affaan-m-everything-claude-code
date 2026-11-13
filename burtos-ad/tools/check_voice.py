#!/usr/bin/env python3
"""Contrôle des voix off : transcription (Whisper) + hauteur médiane. usage : check_voice.py fichiers.wav"""
import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
for p in sys.argv[1:]:
    raw = subprocess.check_output(['ffmpeg', '-nostdin', '-loglevel', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'])
    x = np.frombuffer(raw, np.int16).astype(float) / 32768; f = []
    for i in range(0, len(x) - 1024, 320):
        w = x[i:i + 1024]
        if np.sqrt((w ** 2).mean()) < 0.02: continue
        w = w - w.mean(); ac = np.correlate(w, w, 'full')[1023:]; k = 45 + np.argmax(ac[45:228])
        if ac[k] / ac[0] > 0.45: f.append(16000 / k)
    segs, _ = m.transcribe(x.astype(np.float32), language='fr')
    print(f"{p.split('/')[-1]} {len(x)/16000:.1f}s f0={np.median(f):.0f}Hz [{np.percentile(f,10):.0f}-{np.percentile(f,90):.0f}] :: {' '.join(s.text.strip() for s in segs)}")
