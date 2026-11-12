"""Génère la bande-son de la vidéo Burtos : instru originale + bruitages calés sur l'animation.

    python3 make_audio.py   →  burtos-audio.wav   (nécessite numpy et scipy)

Tout est synthétisé ici : aucun sample ni musique externe, donc aucun droit d'auteur à gérer.
"""
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

MUSIC_GAIN = 0.60   # volume de la musique
SFX_GAIN = 0.85     # volume des bruitages

music = np.zeros((N, 2))
sfx = np.zeros((N, 2))


def add(bus, sig, t, gain=1.0, pan=0.0):
    """Pose un son mono à l'instant t (secondes). pan : -1 gauche … +1 droite."""
    i = int(t * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[i:i + len(sig), 0] += sig * gain * l
    bus[i:i + len(sig), 1] += sig * gain * r


def tt(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def fade(x, a=0.004, r=0.02):
    na, nr = int(a * SR), int(r * SR)
    x = x.copy()
    x[:na] *= np.linspace(0, 1, na)
    x[-nr:] *= np.linspace(1, 0, nr)
    return x


# ---------------------------------------------------------------- instruments
def kick():
    t = tt(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    click = filt(rng.standard_normal(len(t)), "high", 2500) * np.exp(-t * 220) * 0.25
    return fade(np.tanh((body + click) * 1.6))


def snare():
    t = tt(0.3)
    noise = filt(rng.standard_normal(len(t)), "band", [900, 7000]) * np.exp(-t * 20)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5
    clap = sum(np.roll(noise, int(d * SR)) for d in (0, 0.011, 0.023)) / 2
    return fade(clap * 0.5 + tone)


def hat(decay=70):
    t = tt(0.12)
    return fade(filt(rng.standard_normal(len(t)), "high", 7500) * np.exp(-t * decay), 0.001)


def bass808(m, d):
    t = tt(d)
    f = hz(m) * (1 + 0.6 * np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = np.tanh(s * 2.2) * 0.8 + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)   # harmoniques : audible sur téléphone
    return fade(s * np.exp(-t * 1.6), 0.005, 0.06)


def epiano(notes, d):
    t = tt(d)
    out = np.zeros(len(t))
    for k, m in enumerate(notes):
        f = hz(m) * (1 + (k - 1.5) * 0.0012)
        out += (np.sin(2 * np.pi * f * t) + 0.32 * np.sin(4 * np.pi * f * t) * np.exp(-t * 5)
                + 0.12 * np.sin(8 * np.pi * f * t) * np.exp(-t * 9))
    out *= np.exp(-t * 2.2) * (1 + 0.12 * np.sin(2 * np.pi * 5 * t)) / len(notes)
    return fade(filt(out, "low", 2600), 0.006, 0.08)


def bell(m, d=0.7):
    t = tt(d)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 12)
    return fade(s * np.exp(-t * 6), 0.003, 0.05)


def pad(notes, d):
    t = tt(d)
    out = np.zeros(len(t))
    for m in notes:
        for det in (-0.004, 0.004):
            f = hz(m) * (1 + det)
            out += 2 * (np.arange(len(t)) * f / SR % 1) - 1
    out = filt(out / (2 * len(notes)), "low", 700, 4)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 0.6)
    return out * env


# ---------------------------------------------------------------- bruitages
def whoosh(d=0.8, f0=300, f1=5000):
    """Souffle de transition : bruit filtré dont la fréquence monte."""
    n = int(d * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    low = band = 0.0
    fc = f0 * (f1 / f0) ** (np.linspace(0, 1, n) ** 1.2)
    g = 2 * np.sin(np.pi * fc / SR)
    for i in range(n):                      # filtre passe-bande à fréquence variable
        low += g[i] * band
        band += g[i] * (noise[i] - low - 0.5 * band)
        out[i] = band
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return out * env * 0.5


def impact(power=1.0):
    t = tt(0.7)
    f = 38 + 90 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    crack = filt(rng.standard_normal(len(t)), "band", [300, 5000]) * np.exp(-t * 16) * 0.5
    return fade(np.tanh((sub + crack) * 1.8 * power), 0.001, 0.1)


def pop(m, d=0.14):
    t = tt(d)
    f = hz(m) * (1 + 0.9 * np.exp(-t * 60))
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26), 0.001)


def tick():
    t = tt(0.05)
    return fade(np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 110), 0.0005, 0.01)


def slide(f0, f1, d):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, (d - t) / (d * 0.6)), 0.01, 0.05)


def riser(d):
    n = int(d * SR)
    return filt(rng.standard_normal(n), "high", 3000) * np.linspace(0, 1, n) ** 2.5 * 0.35


def engine(d):
    t = tt(d)
    f = 62 + 26 * np.minimum(1, t / 0.8) + 4 * np.sin(2 * np.pi * 1.3 * t) + 70 * np.maximum(0, t - (d - 0.6)) / 0.6
    ph = np.cumsum(f) / SR
    s = (2 * (ph % 1) - 1) * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * ph / 2)))
    s = filt(s, "low", 900, 2) + 0.08 * filt(rng.standard_normal(len(t)), "band", [800, 2500])
    return fade(s, 0.25, 0.25) * 0.5


def horn():
    t = tt(0.13)
    return fade((np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 554 * t)) * 0.5, 0.005, 0.02)


def ding():
    t = tt(1.2)
    return fade((np.sin(2 * np.pi * 1319 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t)) * np.exp(-t * 4.5), 0.002, 0.1)


# ================================================================ MUSIQUE
# 75 BPM, mesures de 3,2 s calées sur les changements de scène (7,11 · 10,31 · 13,51 · 16,71).
STEP = 0.2            # double-croche
BAR = 3.2
T0 = 0.71             # début de la 1re mesure
DROP = T0 + BAR       # 3,91 : le beat démarre quand le nom apparaît
CHORDS = [            # (accord, basse)  — La mineur
    ([57, 60, 64, 67], 33),   # Am7
    ([53, 57, 60, 64], 29),   # Fmaj7
    ([55, 60, 64, 71], 36),   # Cmaj7
    ([55, 59, 62, 69], 31),   # Gadd9
]
MELODY = [  # (pas, note)
    [(0, 76), (3, 79), (6, 81), (10, 79), (12, 76)],
    [(0, 72), (3, 76), (6, 79), (10, 76), (14, 72)],
    [(0, 76), (3, 79), (6, 84), (10, 83), (12, 79)],
    [(0, 74), (3, 79), (6, 81), (10, 79), (12, 74), (14, 76)],
]
K, S, H, HO = kick(), snare(), hat(), hat(22)

# Intro : nappe + tic-tac de l'horloge
add(music, pad([45, 57, 60, 64], DROP + 0.3), 0, 0.5)
add(music, epiano(CHORDS[0][0], 2.8), T0, 0.45)
add(music, riser(1.3), DROP - 1.3, 0.8)
for k in range(8):
    add(sfx, tick(), 0.4 + k * 0.4, 0.35 if k % 2 else 0.5, pan=0.2)

# Le beat (5 mesures : 3,91 → 19,91)
for bar in range(5):
    tb = DROP + bar * BAR
    chord, root = CHORDS[bar % 4]
    last = bar == 4
    for step in (0, 7, 10):
        add(music, K, tb + step * STEP, 0.95)
    add(music, bass808(root, 1.3), tb, 0.7)
    add(music, bass808(root, 0.5), tb + 7 * STEP, 0.55)
    add(music, bass808(root + (0 if bar % 2 else 3), 0.9), tb + 10 * STEP, 0.6)
    add(music, S, tb + 8 * STEP, 0.6)
    if not last:
        for step in range(0, 16, 2):
            add(music, H, tb + step * STEP, 0.16 if step % 4 else 0.24, pan=0.3)
        for step in (13, 15):
            add(music, H, tb + step * STEP, 0.12, pan=-0.3)
        add(music, HO, tb + 6 * STEP, 0.14, pan=-0.2)
    add(music, epiano(chord, 2.2), tb, 0.5, pan=-0.15)
    add(music, epiano(chord, 1.6), tb + 6 * STEP, 0.38, pan=0.15)
    for step, note in ([] if last else MELODY[bar % 4]):
        for echo in range(3):                               # petit écho
            add(music, bell(note), tb + step * STEP + echo * 0.3, 0.2 * 0.45 ** echo, pan=(-0.5, 0.5, 0)[echo])
    if bar in (0, 1, 2, 3):
        add(music, riser(0.6), tb + BAR - 0.6, 0.35)
# Accord final qui résonne
add(music, epiano([45, 57, 60, 64, 69, 72], 3.0), DROP + 4 * BAR, 0.55)

# ================================================================ BRUITAGES
for t in (3.2, 6.7, 9.9, 13.1, 16.3):                       # transitions
    add(sfx, whoosh(), t - 0.05, 0.7)
add(sfx, impact(0.7), 0.95, 0.6)                            # « T'as faim ? »
add(sfx, pop(64), 1.8, 0.25)                                # « Tout est fermé. »
add(sfx, impact(1.2), 2.55, 0.95)                           # « Sauf nous. »
for i in range(7):                                          # les lettres arrivent
    add(sfx, pop(60 + i * 2, 0.09), 3.72 + i * 0.045, 0.2, pan=-0.6 + i * 0.2)
for i in range(5):
    add(sfx, pop(62 + i * 2, 0.09), 4.02 + i * 0.045, 0.2, pan=-0.4 + i * 0.2)
add(sfx, slide(900, 160, 0.8), 4.75, 0.22)                  # les lettres en trop tombent
add(sfx, whoosh(0.6, 400, 3000), 4.9, 0.4)                  # les lettres se rassemblent
add(sfx, impact(1.1), 5.55, 0.9)                            # BURTOS !
add(sfx, ding(), 5.56, 0.22)
add(sfx, pop(69), 5.95, 0.3)                                # la pastille
for i in range(6):                                          # le burger se monte
    add(sfx, pop(57 + i * 3), 7.8 + i * 0.17, 0.45, pan=(-0.2, 0.2)[i % 2])
add(sfx, impact(0.6), 8.65, 0.5)
add(sfx, whoosh(0.7, 250, 2500), 10.45, 0.45)               # le tacos arrive
add(sfx, impact(0.5), 11.05, 0.4)
for i in range(5):                                          # les frites
    add(sfx, pop(72 + i * 2, 0.1), 11.12 + i * 0.07, 0.35, pan=-0.4 + i * 0.2)
add(sfx, slide(700, 330, 0.9), 11.4, 0.1)                   # la sauce coule
eng = engine(3.3)                                           # le scooter (de gauche à droite)
i0 = int(13.45 * SR)
pan = np.clip(np.concatenate([np.linspace(-1, 0, int(0.9 * SR)), np.zeros(len(eng))])[: len(eng)]
              + np.maximum(0, (tt(3.3) - 2.6) / 0.7), -1, 1)
sfx[i0:i0 + len(eng), 0] += eng * np.cos((pan + 1) * np.pi / 4) * 0.5
sfx[i0:i0 + len(eng), 1] += eng * np.sin((pan + 1) * np.pi / 4) * 0.5
add(sfx, horn(), 14.25, 0.2)
add(sfx, horn(), 14.45, 0.2)
add(sfx, impact(1.2), 16.8, 0.9)                            # le logo final
for i in range(6):
    add(sfx, pop(57 + i * 2, 0.1), 16.8 + i * 0.06, 0.25, pan=-0.5 + i * 0.2)
add(sfx, pop(76), 17.55, 0.25)                              # le slogan
add(sfx, ding(), 17.95, 0.4)                                # le bouton

# ================================================================ MIXAGE
mix = music * MUSIC_GAIN + sfx * SFX_GAIN
mix = np.tanh(mix * 1.15)                                   # limiteur doux
out_fade = np.ones(N)
n_out = int(0.9 * SR)
out_fade[-n_out:] = np.linspace(1, 0, n_out) ** 1.5
mix *= out_fade[:, None]
mix *= 0.89 / np.abs(mix).max()                             # crête à -1 dB
wavfile.write("burtos-audio.wav", SR, (mix * 32767).astype(np.int16))
print("OK → burtos-audio.wav")
