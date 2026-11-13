"""BURTOS — bande son : musique originale (synthèse), sound design, voix off, mixage.
Usage : python3 outils/audio.py        -> rendus/burtos-audio.wav (+ pistes séparées dans assets/)
La musique est une composition originale générée par ce script (aucun sample tiers) : libre de droits.
Pour utiliser une autre musique : déposer assets/musique/musique-perso.wav (48 kHz) — elle remplacera la musique générée."""
import numpy as np, subprocess, os, wave
from scipy import signal
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SR = 48000; DUR = 35.0; N = int(SR * (DUR + 0.5))
rng = np.random.default_rng(7)
STYLE = os.environ.get('BURTOS_STYLE', 'funk')      # funk | disco
MODE_VOIX = os.environ.get('BURTOS_VOIX', '')        # '' (selon config/voix-off.json) | fichier | synthese
SORTIE = os.environ.get('BURTOS_SORTIE', 'burtos-audio')

# ---------------- MINUTAGE (doit rester cohérent avec config/contenu.js) ----------------
S_INTRO, S_SEL, S_TEL, S_AVIS, S_CARTE, S_FINAL = 0, 5, 13, 18.5, 23, 30
VOIX = [  # (début dans le fichier source, fin, position dans la pub, fondu de sortie)
    (0.00, 2.17, 2.05, .03),     # « BUR-TOS, livraison de nuit »                       -> intro
    (11.66, 17.25, 5.70, .05),   # « Vous pouvez également commander des tacos… »        -> sélection
    (6.41, 10.56, 24.00, .10),   # « sur Orléans et ses agglomérations, jusqu'à 30 km »  -> carte
    (2.50, 6.41, 30.17, .03),    # « disponible chaque soir de 20h jusqu'à 5h »          -> final
]
# NB : la prise d'origine dit « 30 kilomètres-heure » ; la coupe à 10,56 s retire le « heure » fautif.

def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def put(buf, t, x, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    x = x[:N - i]; l = np.cos((pan + 1) * np.pi / 4) * 1.414; r = np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:i + len(x), 0] += x * gain * l; buf[i:i + len(x), 1] += x * gain * r
def noise(n): return rng.standard_normal(n)
def filt(x, kind, f, order=2): return signal.sosfilt(signal.butter(order, f, kind, fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def fade(x, a=.005, d=.01):
    x = x.copy(); na, nd = int(a * SR), int(d * SR)
    x[:na] *= np.linspace(0, 1, na); x[-nd:] *= np.linspace(1, 0, nd); return x

# ---------------- instruments ----------------
def kick():
    n = int(.32 * SR); t = np.arange(n) / SR; f = 48 + 110 * np.exp(-t / .035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .11) + .25 * filt(noise(n), 'high', 3000) * np.exp(-t / .004)
def clap():
    n = int(.3 * SR); x = np.zeros(n); nz = filt(noise(n), 'band', [900, 3600])
    for d in (0, .011, .022): i = int(d * SR); x[i:] += nz[:n - i] * env_exp(n - i, .012)
    x += nz * env_exp(n, .09) * .5; return x * .7
def hat(op=False):
    n = int((.22 if op else .05) * SR); return filt(noise(n), 'high', 7500, 4) * env_exp(n, .07 if op else .012)
def pluck(f, dur, bright=7, harm=9, shape='saw'):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for h in range(1, harm + 1):
        if shape == 'sq' and h % 2 == 0: continue
        if f * h > 16000: break
        x += np.sin(2 * np.pi * f * h * t + h) / h * np.exp(-t * (h - 1) * bright)
    return x
def bass(m, dur=.16):
    f = mtof(m); n = int(dur * SR); t = np.arange(n) / SR
    x = pluck(f, dur, bright=9, harm=10) + .7 * np.sin(2 * np.pi * f * t)
    return fade(np.tanh(x * 1.6) * np.minimum(1, np.exp(-(t - dur * .7) / .03)), .003, .02)
def stab(notes, dur=.2):
    n = int(dur * SR); t = np.arange(n) / SR; L = np.zeros(n); Rr = np.zeros(n)
    for m in notes:
        for det, tgt in ((-.07, L), (.07, Rr)): tgt += pluck(mtof(m + det), dur, bright=3.2, harm=8)
    e = np.exp(-t / .085); return np.stack([fade(L * e, .003, .02), fade(Rr * e, .003, .02)], 1) / len(notes)
def lead(m, dur=.22):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m) * (1 + .006 * np.sin(2 * np.pi * 6 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR; x = sum(np.sin(ph * h) / h * np.exp(-t * (h - 1) * 5) for h in (1, 3, 5, 7))
    return fade(x * np.exp(-t / .16), .004, .03)
def pad(notes, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros((n, 2))
    for m in notes:
        for det, ch in ((-.1, 0), (.1, 1)):
            f = mtof(m + det); x[:, ch] += sum(np.sin(2 * np.pi * f * h * t + m) / h ** 1.6 for h in (1, 2, 3, 4))
    e = np.minimum(1, t / .6) * np.minimum(1, (dur - t) / .25); return x * e[:, None] / len(notes)

# ---------------- MUSIQUE : électro-funk 120 BPM, ii–V–I–vi en do majeur ----------------
def musique():
    drums = np.zeros((N, 2)); mus = np.zeros((N, 2)); kicks = []
    CH = [([62, 65, 69, 72, 76], 38), ([62, 65, 67, 71, 77], 43), ([60, 64, 67, 71, 74], 36), ([60, 64, 67, 69, 76], 45)]
    BASS = [(0, 0), (3, 12), (6, 0), (7, 12), (10, 7), (11, 12), (12, 0), (14, 12), (15, 10)]
    STAB = [3, 6, 11, 14]
    LEAD = [[(0, 74), (2, 76), (3, 79), (6, 81), (8, 79), (11, 76), (12, 74)], [(0, 79), (3, 81), (4, 84), (7, 81), (10, 79), (12, 76), (14, 72)]]
    K, Cl, Hc, Ho = kick(), clap(), hat(), hat(True)
    # intro : nappe qui s'ouvre après l'explosion (1,5 s) + charleston + roulement
    p = pad(CH[0][0], 3.5); cut = filt(p[:, 0], 'low', 900), filt(p[:, 1], 'low', 900)
    k = np.linspace(0, 1, len(p)) ** 2; p = np.stack([cut[0] * (1 - k) + p[:, 0] * k, cut[1] * (1 - k) + p[:, 1] * k], 1)
    mus[int(1.5 * SR):int(1.5 * SR) + len(p)] += p * .5
    for i, t in enumerate(np.arange(3.0, 5.0, .25)): put(drums, t, Hc, .25 + .04 * i)
    for i, t in enumerate(np.arange(4.0, 5.0, .125)): put(drums, t, Cl, .12 + .07 * i)
    for t in (3.0, 3.5, 4.0, 4.5): put(drums, t, K, .8); kicks.append(t)
    def bars(t0, nb, mode, ci0=0):
        for b in range(nb):
            ch, root = CH[(ci0 + b) % 4]; bt = t0 + b * 2
            for s in range(16):
                t = bt + s * .125 + (.016 if s % 2 else 0)
                if t >= DUR: continue
                if s % 4 == 0 and mode != 'fin': put(drums, t, K, .95); kicks.append(t)
                if s in (4, 12) and mode != 'creux': put(drums, t, Cl, .55)
                if s in (4, 12) and mode == 'creux': put(drums, t, Hc, .5)
                if s % 4 == 2: put(drums, t, Ho, (.4 if STYLE == 'disco' else .26) if mode != 'creux' else .16, .2)
                elif s % 2 == 0: put(drums, t, Hc, .2, -.2)
                else: put(drums, t, Hc, .09 if mode != 'creux' else .05, .3)
            if STYLE == 'disco':
                pd = pad([m + 12 for m in ch[:4]], 2.0); pd = np.stack([filt(pd[:, 0], 'high', 500), filt(pd[:, 1], 'high', 500)], 1)
                i = int(bt * SR); pd = pd[:max(0, N - i)]; mus[i:i + len(pd)] += pd * (.2 if mode != 'creux' else .1)
                if mode != 'creux':
                    for s, d in ((0, .12), (7, .1), (10, .28)):
                        br = stab([m + 12 for m in ch[1:4]] + [ch[0] + 24], d + .1) * 1.3; i = int((bt + s * .125) * SR); br = br[:max(0, N - i)]; mus[i:i + len(br)] += br * .55
            for s, iv in ([(k, 12 if k % 4 == 2 else 0) for k in range(0, 16, 2)] + [(15, 10)] if STYLE == 'disco' else BASS):
                if mode == 'creux' and s in (7, 11, 15): continue
                put(mus, bt + s * .125 + (.016 if s % 2 else 0), bass(root + iv), .5)
            if mode != 'creux':
                for s in STAB:
                    st = stab(ch); i = int((bt + s * .125 + (.016 if s % 2 else 0)) * SR); mus[i:i + len(st)] += st[:max(0, N - i)] * .5
            if mode in ('plein', 'carte'):
                for s, m in LEAD[b % 2]:
                    x = lead(m); g = .16 if mode == 'plein' else .1
                    put(mus, bt + s * .125, x, g, .15); put(mus, bt + s * .125 + .375, x, g * .35, -.5)
            if mode == 'carte':
                for s in range(16): put(mus, bt + s * .125, lead(ch[s % 5] + 12, .1), .05, np.sin(s))
    bars(5, 4, 'voix')                 # sélection (voix off présente : pas de mélodie)
    bars(13, 3, 'creux', 0)            # téléphone : groove allégé pour laisser entendre les notifications
    for i, t in enumerate(np.arange(18.0, 18.5, .125)): put(drums, t, Cl, .2 + .1 * i)
    bars(19, 2, 'plein', 3)            # avis : groove complet + mélodie
    put(drums, 18.5, K, .95); kicks.append(18.5); st = stab(CH[2][0], .5); mus[int(18.5 * SR):int(18.5 * SR) + len(st)] += st * .6
    bars(23, 3, 'carte', 0)            # carte : arpèges
    for i, t in enumerate(np.arange(29.0, 30.0, .125)): put(drums, t, Cl, .1 + .08 * i)
    bars(30, 2, 'plein', 0)            # final
    st = stab(CH[2][0] + [84], 1.0); mus[int(34 * SR):int(34 * SR) + len(st)] += st * .9
    put(drums, 34.0, K, 1.0); put(drums, 34.0, Cl, .5); kicks.append(34.0); put(mus, 34.0, bass(36, .7), .7)
    # compression latérale (sidechain) sur les kicks
    sc = np.ones(N)
    for t in kicks: i = int(t * SR); e = 1 - .5 * env_exp(min(N - i, int(.3 * SR)), .09); sc[i:i + len(e)] = np.minimum(sc[i:i + len(e)], e)
    mus *= sc[:, None]
    out = mus * .55 + drums * .62
    out[int(34.95 * SR):] *= np.linspace(1, 0, N - int(34.95 * SR))[:, None]
    return out

# ---------------- SOUND DESIGN ----------------
def whoosh(dur, up=True):
    n = int(dur * SR); nz = noise(n); k = np.linspace(0, 1, n); k = k if up else 1 - k
    lo, mi, hi = filt(nz, 'band', [200, 700]), filt(nz, 'band', [700, 2500]), filt(nz, 'band', [2500, 9000])
    x = lo * np.clip(1 - 2 * k, 0, 1) + mi * (1 - np.abs(2 * k - 1)) + hi * np.clip(2 * k - 1, 0, 1)
    return x * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur; f = 110 * 2 ** (k * 3.2)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * .25
    return (x * (1 + .5 * np.sin(2 * np.pi * (6 + 20 * k) * t)) + whoosh(dur) * 1.2) * k ** 1.6
def impact(big=1.0):
    n = int(1.4 * SR); t = np.arange(n) / SR; f = 38 + 70 * np.exp(-t / .06)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .38) * 1.5 + filt(noise(n), 'low', 2200) * np.exp(-t / .1) * .9 + filt(noise(n), 'high', 4000) * np.exp(-t / .03) * .5) * big)
def blip(f1=880, f2=1320):
    n = int(.05 * SR); t = np.arange(n) / SR; a = np.sign(np.sin(2 * np.pi * f1 * t)) * np.exp(-t / .03); b = np.sign(np.sin(2 * np.pi * f2 * t)) * np.exp(-t / .04)
    return filt(np.concatenate([a, b]), 'low', 5000) * .5
def bell(f, dec=.3, n2=2.76):
    n = int(dec * 4 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * n2 * t) * np.exp(-t / (dec * .5))) * np.exp(-t / dec) * np.minimum(1, t / .002)
def pop(f1=420, f2=980, d=.07):
    n = int(d * SR); t = np.arange(n) / SR; f = f1 + (f2 - f1) * t / d; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d)
def tick(): n = int(.012 * SR); return filt(noise(n), 'band', [2500, 6000]) * env_exp(n, .003)
def zap(d=.25):
    n = int(d * SR); x = filt(noise(n), 'high', 2500) * (rng.random(n) > .6) * env_exp(n, d / 3); return x

def sfx():
    s = np.zeros((N, 2))
    # scène 1 : charge, explosion, mots de l'accroche, montée vers le flash
    put(s, .25, riser(1.25), .5); put(s, 1.5, impact(1.3), .95); put(s, 1.5, whoosh(1.2, False), .5); put(s, 1.52, zap(.5), .25, .4)
    for i in range(10): put(s, 2.45 + i * .085 + .1, pop(500 + i * 40, 900 + i * 60, .04), .13, np.sin(i))
    put(s, 3.75, bell(1568, .2), .1); put(s, 4.4, riser(.6), .5); put(s, 5.0, impact(1.1), .8); put(s, 5.0, whoosh(.9, False), .5)
    # scène 2 : sons de sélection façon jeu vidéo
    for k in range(7):
        t = S_SEL + .5 + k * 1.0; put(s, t - .2, whoosh(.22), .22, (-1) ** k * .5); put(s, t, blip(880, 1320 if k % 2 == 0 else 1175), .3); put(s, t, pop(160, 60, .12), .5)
    put(s, 12.62, whoosh(.5), .55); put(s, 13.0, impact(.7), .5)
    # scène 3 : frappe, envoi, réception, confirmation
    for a, e in ((.4, .95), (2.1, 2.6), (3.6, 4.0)):
        for t in np.arange(a, e - .08, .055): put(s, S_TEL + t + rng.random() * .015, tick(), .22 + rng.random() * .1, .4)
        put(s, S_TEL + e, pop(), .4, .4)
    for e in (1.7, 3.3): put(s, S_TEL + e, bell(1318.5, .16), .22, .4); put(s, S_TEL + e + .09, bell(1975.5, .22), .2, .4)
    for i, m in enumerate((84, 88, 91, 96)): put(s, S_TEL + 4.4 + i * .07, bell(mtof(m), .28), .2, .3)
    put(s, S_TEL + 4.4, pop(200, 80, .15), .5); put(s, S_TEL + 5.05, whoosh(.5), .55); put(s, S_AVIS, impact(.6), .45)
    # scène 4 : cartes + étoiles
    for i, ti in enumerate((.3, .7, 1.1)):
        put(s, S_AVIS + ti, whoosh(.4, False), .35, i - 1); put(s, S_AVIS + ti + .6, pop(150, 70, .1), .35, i - 1)
        for j in range(5): put(s, S_AVIS + ti + .57 + j * .075, bell(mtof(84 + [0, 2, 4, 7, 9][j] + i * 2), .14), .1, (i - 1) * .7)
    put(s, 22.6, whoosh(.5), .55); put(s, 23.0, impact(.7), .5)
    # scène 5 : carte
    put(s, 23.0, whoosh(1.2), .25); put(s, 23.9, bell(523.25, .5), .3); put(s, 23.9, pop(180, 70, .16), .5)
    pent = [72, 74, 76, 79, 81, 84, 86, 88]
    tt = [1.15 + i * .17 for i in range(9)] + [2.9 + i * .2 for i in range(8)]
    for i, t in enumerate(tt):
        pan = np.sin(i * 2.1) * .7; put(s, S_CARTE + t, whoosh(.3, False), .12, pan); put(s, S_CARTE + t + .32, bell(mtof(pent[(i * 3) % 8]), .16), .16, pan); put(s, S_CARTE + t + .32, pop(240, 90, .07), .3, pan)
    put(s, S_CARTE + 4.2, riser(.4), .3); put(s, S_CARTE + 4.6, impact(.8), .55); put(s, S_CARTE + 4.6, whoosh(.9, False), .35)
    put(s, S_CARTE + 5.6, whoosh(.25), .4); put(s, S_CARTE + 5.85, impact(.9), .6); put(s, S_CARTE + 5.87, bell(2093, .25), .12)
    # scène 6 : final
    put(s, 29.3, riser(.7), .55); put(s, 30.0, impact(1.4), 1.0); put(s, 30.0, whoosh(1.2, False), .5); put(s, 30.03, zap(.6), .25, -.4)
    for i in range(8): put(s, 30.65 + i * .08 + .1, pop(500 + i * 40, 900 + i * 60, .04), .12, np.sin(i))
    for i in range(2): put(s, 31.1 + i * .16 + .2, pop(300, 700, .06), .25, i - .5)
    put(s, 31.5, whoosh(.35), .3)
    for t in (32.1, 33.3): put(s, t - .16, whoosh(.18), .35); put(s, t, impact(.85), .6)
    for i, m in enumerate((84, 88, 91, 96, 100)): put(s, 34.0 + i * .06, bell(mtof(m), .4), .12, np.sin(i * 2))
    # petite réverbération (échos diffus)
    wet = np.zeros_like(s)
    for d, g in ((.031, .3), (.047, .25), (.073, .2), (.109, .16), (.163, .12), (.251, .08)):
        i = int(d * SR); wet[i:, 0] += s[:-i, 1] * g; wet[i:, 1] += s[:-i, 0] * g
    return s + wet * .6

# ---------------- VOIX OFF ----------------
def voix_synthese(cfg):
    """Voix générée localement (Piper, voix française « tom ») à partir de config/voix-off.json."""
    from piper import PiperVoice
    from piper.config import SynthesisConfig
    pv = PiperVoice.load(os.path.join(R, 'assets/voix-off/modele/fr_FR-tom-medium.onnx'))
    v = np.zeros(N); fin = 0
    for k, ph in enumerate(cfg['phrases']):
        out = os.path.join(R, f'assets/voix-off/synthese/phrase-{k + 1:02d}.wav')
        with wave.open(out, 'wb') as w: pv.synthesize_wav(ph.get('dit', ph['texte']), w, syn_config=SynthesisConfig(length_scale=ph.get('vitesse', cfg.get('vitesse', .9)), noise_scale=.8, noise_w_scale=.9))
        w = wave.open(out); a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768; sr = w.getframerate()
        a = signal.resample_poly(a, SR, sr); nz = np.where(np.abs(a) > .01)[0]; a = fade(a[max(0, nz[0] - 200):nz[-1] + 2000], .005, .03)
        a = a / np.abs(a).max()
        if ph['position'] < fin: print(f"  ATTENTION : la phrase {k + 1} commence avant la fin de la précédente ({fin:.2f} s)")
        i = int(ph['position'] * SR); v[i:i + len(a)] += a[:N - i]; fin = ph['position'] + len(a) / SR
        print(f"  phrase {k + 1:2d} : {ph['position']:5.2f} -> {fin:5.2f} s  {ph['texte']}")
    v = filt(v, 'high', 90)
    e = np.sqrt(signal.sosfilt(signal.butter(1, 12, 'low', fs=SR, output='sos'), v ** 2) + 1e-9); thr = .12
    v *= np.where(e > thr, (thr / e) ** .5, 1); v += filt(v, 'band', [2500, 7000]) * .45
    return v / np.abs(v).max()

def voix():
    import json
    cj = os.path.join(R, 'config/voix-off.json')
    if os.path.exists(cj):
        cfg = json.load(open(cj))
        if (MODE_VOIX or cfg.get('mode')) == 'synthese': return voix_synthese(cfg)
    src = os.path.join(R, 'assets/voix-off/voix-off-originale.mp3')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).astype(np.float64); a = filt(a, 'high', 85)
    v = np.zeros(N); os.makedirs(os.path.join(R, 'assets/voix-off/segments'), exist_ok=True)
    for k, (a0, a1, pos, fo) in enumerate(VOIX):
        seg = fade(a[int(a0 * SR):int(a1 * SR)], .012, fo); i = int(pos * SR); v[i:i + len(seg)] += seg
        ecrire(os.path.join(R, f'assets/voix-off/segments/segment-{k + 1}.wav'), np.stack([seg, seg], 1) / np.abs(a).max() * .9)
    # compression douce + présence
    e = np.sqrt(signal.sosfilt(signal.butter(1, 12, 'low', fs=SR, output='sos'), v ** 2) + 1e-9); thr = .08
    v *= np.where(e > thr, (thr / e) ** .45, 1); v += filt(v, 'band', [2500, 6000]) * .35
    return v / np.abs(v).max()

def ecrire(path, x):
    x = np.clip(x, -1, 1); w = wave.open(path, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes()); w.close()

if __name__ == '__main__':
    perso = os.path.join(R, 'assets/musique/musique-perso.wav')
    if os.path.exists(perso):
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', perso, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
        m = np.zeros((N, 2)); x = np.frombuffer(raw, np.float32).reshape(-1, 2)[:N]; m[:len(x)] = x; print('musique personnalisée utilisée')
    else: m = musique()
    # BURTOS_MUSIQUE=0 : voix + bruitages seuls
    m = m / np.abs(m).max() * .9 * (0 if os.environ.get('BURTOS_MUSIQUE') == '0' else 1); s = sfx(); s = s / np.abs(s).max() * .9; v = voix()
    # la musique s'efface sous la voix (ducking)
    ve = np.sqrt(signal.sosfilt(signal.butter(1, 5, 'low', fs=SR, output='sos'), v ** 2)); ve = np.roll(ve, -int(.08 * SR))
    duck = 1 - .62 * np.clip(ve / .06, 0, 1)
    mix = m * .5 * duck[:, None] + s * .62 * (1 - .25 * np.clip(ve / .06, 0, 1))[:, None] + np.stack([v, v], 1) * .95
    mix = np.tanh(mix * 1.15); mix = mix / np.abs(mix).max() * .89
    n = int(DUR * SR)
    os.makedirs(os.path.join(R, 'rendus'), exist_ok=True)
    ecrire(os.path.join(R, f'rendus/{SORTIE}.wav'), mix[:n])
    ecrire(os.path.join(R, 'assets/musique/musique-originale.wav'), m[:n]); ecrire(os.path.join(R, 'assets/sons/sound-design.wav'), s[:n]); ecrire(os.path.join(R, 'assets/voix-off/voix-off-montee.wav'), np.stack([v, v], 1)[:n] * .9)
    print('audio ok', n / SR, 's')
