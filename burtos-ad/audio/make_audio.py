#!/usr/bin/env python3
"""Bande-son BURTOS : musique originale (funk électro 120 BPM, synthèse 100 % code),
bruitages synchronisés sur les repères de src/config.js et voix off (Piper, voix libre).
Sorties : out/audio-mix.wav (complet) et out/audio-sans-voix.wav (musique + bruitages)."""
import json, subprocess, sys, os, wave
import numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
cfg = json.loads(subprocess.check_output(['node', '-e', "const B=require('./src/config.js');console.log(JSON.stringify({d:B.duration,cues:B.cues,cuts:B.cuts,vo:B.vo}))"], cwd=ROOT))
DUR, C = cfg['d'], cfg['cues']
N = int(DUR * SR)
rng = np.random.default_rng(45)
BEAT = 0.5; S16 = BEAT / 4

def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output='sos'), x)
def env(n, a, d, curve=1.0):
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d) ** curve
def place(buf, x, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    x = x[:N - i]
    buf[i:i + len(x), 0] += x * gain * (1 - max(pan, 0))
    buf[i:i + len(x), 1] += x * gain * (1 + min(pan, 0))
def hz(m): return 440 * 2 ** ((m - 69) / 12)

# ---------- instruments ----------
def kick():
    n = int(0.32 * SR); t = np.arange(n) / SR
    f = 46 + 120 * np.exp(-t / 0.035)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.11) + 0.25 * filt(rng.standard_normal(n), 'high', 3000) * np.exp(-t / 0.004)) * 0.95
def clap():
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = filt(rng.standard_normal(n), 'band', [900, 3200])
    e = sum(np.exp(-np.maximum(t - d, 0) / 0.012) * (t >= d) for d in (0, 0.011, 0.023)) * 0.5 + np.exp(-t / 0.09) * 0.6
    return x * e * 0.5
def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR); t = np.arange(n) / SR
    return filt(rng.standard_normal(n), 'high', 7500) * np.exp(-t / (0.07 if open_ else 0.014)) * 0.22
def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = 0.6 * np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + (2 * ((f * t) % 1) - 1) * 0.6 + np.sin(2 * np.pi * f * t)
    x = filt(x, 'low', 520) + 0.25 * filt(x, 'band', [700, 1600]) * np.exp(-t / 0.05)
    return x * np.minimum(t / 0.004, 1) * np.exp(-t / (dur * 0.9)) * np.minimum((dur - t) / 0.012, 1) * 0.5
def keys(notes, dur, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in notes:
        f = hz(m)
        x += np.sin(2 * np.pi * f * t + 1.6 * np.exp(-t / 0.08) * np.sin(2 * np.pi * f * 2 * t)) + 0.35 * bright * (2 * ((f * 1.004 * t) % 1) - 1)
    x = filt(x, 'low', 3800)
    return x * np.minimum(t / 0.004, 1) * np.exp(-t / (dur * 0.55)) * np.minimum((dur - t) / 0.02, 1) * 0.11
def pluck(m, dur=0.3):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.05) + 0.2 * np.sign(np.sin(2 * np.pi * f * t))
    return filt(x, 'low', 5000) * np.minimum(t / 0.003, 1) * np.exp(-t / 0.11) * 0.2

# ---------- musique ----------
# grille : Dm9 | G13 | Cmaj9 | Am9   (1 mesure = 2 s)
CH = [(38, [62, 65, 69, 72, 76]), (43, [65, 71, 74, 76, 81]), (36, [64, 67, 71, 74, 79]), (45, [64, 67, 72, 76, 79])]
BASS_PAT = [(0, 0, 2), (3, 12, 1), (4, 0, 1), (6, 0, 2), (8, 7, 1), (10, 12, 1), (11, 0, 1), (13, 10, 1), (14, 12, 2)]
STAB = [2, 5, 8, 11, 14]
LEAD = {0: 81, 2: 84, 3: 81, 6: 79, 8: 76, 11: 79, 12: 81, 16: 84, 18: 86, 19: 84, 22: 81, 24: 79, 27: 76, 28: 74, 30: 76}
drums = np.zeros((N, 2)); mus = np.zeros((N, 2)); K, CL, HT, HO = kick(), clap(), hat(), hat(True)
sections = [(c['t']) for c in cfg['cuts']]
def level(t):  # densité de l'arrangement par section
    if t < C['impact']: return 0
    if t < 6: return 1
    if t < 14: return 3
    if t < 20.5: return 2
    if t < 25.5: return 3
    if t < 35: return 3
    return 3
END = DUR - 1.0
pump = np.ones(N)
bar0 = C['impact']
nb = int((END - bar0) / 2 + 0.001)
for b in range(nb):
    tb = bar0 + b * 2; root, notes = CH[b % 4]
    for s in range(16):
        t = tb + s * S16; lv = level(t)
        if t >= END: break
        fill = any(abs((t + 0.5) - c) < 0.26 and t < c for c in sections)   # relance avant chaque coupe
        if s % 4 == 0:
            place(drums, K, t, 1.0); i = int(t * SR); e = np.arange(int(0.22 * SR)) / (0.22 * SR); pump[i:i + len(e)] = np.minimum(pump[i:i + len(e)], 0.35 + 0.65 * e[:max(0, N - i)] ** 0.7)
        if s % 8 == 4 and lv >= 1: place(drums, CL, t, 0.9)
        if fill and s % 2 == 1: place(drums, CL, t, 0.35 + 0.1 * s % 4)
        if lv >= 2: place(drums, HT, t, 0.9 if s % 4 == 2 else 0.4, pan=0.25)
        elif s % 4 == 2: place(drums, HT, t, 0.8, pan=0.25)
        if lv >= 3 and s == 14: place(drums, HO, t, 0.7, pan=-0.2)
    for s, iv, ln in BASS_PAT:
        t = tb + s * S16
        if t < END: place(mus, bass(root + iv - (12 if iv == 12 and root > 40 else 0), ln * S16 * 0.95), t, 1.0 if level(t) else 0)
    for s in STAB:
        t = tb + s * S16; lv = level(t)
        if t < END and lv != 2: place(mus, keys(notes, S16 * (3 if s in (5, 11) else 1.6), 1.0 if lv >= 3 else 0.5), t, 0.9 if lv >= 3 else 0.6, pan=0.15 if s % 4 else -0.15)
    if b % 2 == 0:
        for s, m in LEAD.items():
            t = tb + s * S16
            if t < END and level(t) >= 3 and (6 <= t < 14 or 25.5 <= t < 35): place(mus, pluck(m), t, 0.8, pan=-0.3)
            if t < END and (35 <= t): place(mus, pluck(m + 0), t, 0.9, pan=0.3)
mus *= pump[:, None]
# accord final
place(mus, keys([60, 64, 67, 71, 74, 79], 1.6, 1.2), END, 2.2); place(mus, bass(36, 1.2), END, 1.2); place(drums, K, END, 1.0); place(drums, HO, END, 0.9)
# intro : nappe filtrée + montée
n = int(C['impact'] * SR); t = np.arange(n) / SR
pad = sum(np.sin(2 * np.pi * hz(m) * t + 0.3 * np.sin(2 * np.pi * 0.7 * t)) for m in (50, 57, 62, 65)) * 0.05 * (t / C['impact']) ** 2
riser = filt(rng.standard_normal(n), 'band', [400, 6000]) * (t / C['impact']) ** 3 * 0.12
place(mus, pad + riser, 0, 1.0)
music = drums * 0.62 + mus * 0.9
# écho léger
d = int(0.375 * SR); echo = np.zeros_like(music); echo[d:] = (mus * 0.9)[:-d][:, ::-1] * 0.16; music += echo

# ---------- bruitages ----------
sfx = np.zeros((N, 2))
def whoosh(dur=0.7, f0=300, f1=5000, g=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; x = rng.standard_normal(n); out = np.zeros(n); nb_ = 12
    for k in range(nb_):
        a, b_ = k / nb_, (k + 1) / nb_; seg = slice(int(a * n), int(b_ * n)); pos = np.sin(np.pi * (a + b_) / 2)
        fc = f0 + (f1 - f0) * pos; y = filt(x, 'band', [fc * 0.6, min(fc * 1.6, 20000)])
        w = np.clip(1 - np.abs(np.arange(n) - (seg.start + seg.stop) / 2) / (n / nb_), 0, 1); out += y * w
    return out * np.sin(np.pi * t / dur) ** 2 * g
def click(f=1900):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t / 0.018) * 0.35 + filt(rng.standard_normal(n), 'high', 5000) * np.exp(-t / 0.004) * 0.2
def tone(fs, dur, decay, g=0.3, gap=0.09):
    n = int((dur + gap * len(fs)) * SR); x = np.zeros(n)
    for i, f in enumerate(fs):
        m = int(dur * SR); t = np.arange(m) / SR; s = int(i * gap * SR)
        x[s:s + m] += (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.minimum(t / 0.003, 1) * np.exp(-t / decay)
    return x * g
def impact(g=0.8):
    n = int(0.9 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.28) + filt(rng.standard_normal(n), 'low', 1800) * np.exp(-t / 0.12) * 0.5) * g
def thump(): return impact(0.35)[:int(0.3 * SR)] * np.exp(-np.arange(int(0.3 * SR)) / SR / 0.08)
# moteur d'intro
n = int(2.0 * SR); t = np.arange(n) / SR; f = 42 + 26 * (t / 2) ** 2
eng = (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 2) / SR)) * (1 + 0.5 * np.sin(2 * np.pi * np.cumsum(f / 2) / SR))
place(sfx, filt(eng, 'low', 260) * np.minimum(t / 0.5, 1) * np.minimum((2 - t) / 0.25, 1) * 0.28, 0)
place(sfx, tone([1320], 0.8, 0.3, 0.12), C['light'])
place(sfx, impact(1.0), C['impact']); place(sfx, whoosh(1.4, 500, 7000, 0.35), C['impact'] - 0.7)
for tt in (C['slogan1'], C['slogan2']): place(sfx, whoosh(0.45, 800, 6000, 0.22), tt - 0.1)
for c in cfg['cuts']: place(sfx, whoosh(0.75, 250, 6500, 0.5), c['t'] - 0.4, pan=0.2); place(sfx, thump(), c['t'], 0.9)
for i, tt in enumerate(C['select']): place(sfx, click(1700 + 120 * (i % 3)), tt, 1.0); place(sfx, whoosh(0.3, 1200, 5000, 0.22), tt - 0.18); place(sfx, tone([880, 1320], 0.18, 0.06, 0.1, 0.05), tt + 0.02)
place(sfx, whoosh(0.6, 400, 5000, 0.35), C['menuEnd'] - 0.1)
place(sfx, whoosh(0.8, 300, 4000, 0.3), 14.05)
for i, tt in enumerate(C['chat']): place(sfx, tone([1175, 1568] if i % 2 else [1568], 0.25, 0.07, 0.2, 0.08), tt, pan=0.3 if i % 2 else -0.3)
place(sfx, tone([784, 988, 1175, 1568], 0.35, 0.12, 0.22, 0.07), C['confirm'])
for i, tt in enumerate(C['reviews']): place(sfx, whoosh(0.4, 500, 4000, 0.25), tt - 0.1); place(sfx, thump(), tt + 0.32, 0.9); [place(sfx, tone([2093 + 150 * j], 0.12, 0.03, 0.07), tt + 0.42 + j * 0.07) for j in range(5)]
place(sfx, whoosh(0.9, 200, 3000, 0.4), C['mapZoom'][0])
for i, tt in enumerate(C['points']): place(sfx, tone([1047 * (1 + 0.25 * i), 2094 * (1 + 0.25 * i)], 0.4, 0.09, 0.2, 0.06), tt)
place(sfx, whoosh(1.0, 300, 3500, 0.35), C['circle'] - 0.4); place(sfx, tone([523, 784, 1047], 0.6, 0.2, 0.16, 0.1), C['circle'] + 0.1)
for i, tt in enumerate(C['info']): place(sfx, thump(), tt + 0.05, 1.0 if i == 0 else 0.6); place(sfx, click(1500), tt + 0.05, 0.6)
place(sfx, impact(0.9), C['outroLogo'] + 0.1)
for tt in C['outroLines'] + [C['outroSlogan']]: place(sfx, whoosh(0.4, 700, 5000, 0.22), tt - 0.1)
place(sfx, tone([1047, 1319, 1568], 0.3, 0.1, 0.16, 0.08), C['outroContacts'])

# ---------- voix off ----------
vo = np.zeros((N, 2)); have_vo = True
for name, t0 in cfg['vo']:
    p = os.path.join(ROOT, 'audio/voice', name + '.wav')
    if not os.path.exists(p): have_vo = False; print('voix manquante :', p); continue
    raw = subprocess.check_output(['ffmpeg', '-loglevel', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'])
    x = np.frombuffer(raw, np.int16).astype(np.float64) / 32768
    x = filt(x, 'high', 90); x = x + 0.25 * filt(x, 'high', 3500); x /= max(np.abs(x).max(), 1e-6)
    x = np.tanh(x * 1.8) / np.tanh(1.8)          # compression douce
    print(f'{name}: {t0:.2f} -> {t0 + len(x) / SR:.2f}s')
    place(vo, x, t0, 0.8)
# la musique s'efface sous la voix
e = np.abs(vo[:, 0]); k = int(0.25 * SR); e = np.convolve(e, np.ones(k) / k, 'same'); duck = 1 - 0.62 * np.clip(e / 0.06, 0, 1)
k2 = int(0.12 * SR); duck = np.convolve(duck, np.ones(k2) / k2, 'same')

def master(x):
    fade = np.ones(N); fo = int(0.3 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2; x = x * fade[:, None]
    x = np.tanh(x * 1.15); return x / np.abs(x).max() * 0.89
def save(name, x):
    os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
    with wave.open(os.path.join(ROOT, 'out', name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
save('audio-sans-voix.wav', master(music * 0.5 + sfx * 0.55))
save('audio-mix.wav', master(music * 0.5 * duck[:, None] + sfx * 0.5 * (0.6 + 0.4 * duck[:, None]) + vo * 0.95))
print('audio OK')
