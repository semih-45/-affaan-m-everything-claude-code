#!/usr/bin/env python3
"""Voix off expressive avec Parler-TTS (modèle multilingue, licence Apache 2.0).
Le ton est décrit en anglais (STYLE) ; le texte vient de audio/voice/script.json.
Chaque segment est généré plusieurs fois ; la prise la mieux prononcée (contrôle par
transcription Whisper) est gardée, puis les segments sont assemblés et ajustés à la durée max.
usage : python3 audio/tts_parler.py [vo1 vo2 ...]"""
import sys, os, json, re, subprocess, difflib, unicodedata, wave
import torch, numpy as np
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = 'parler-tts/parler-tts-mini-multilingual-v1.1'
STYLE = ("Daniel speaks in a very cheerful, lively and enthusiastic tone, like a fun radio advertisement, "
         "with a fast pace and very expressive, animated intonation. The recording is very clear, close-up, with no background noise.")
TRIES = int(os.environ.get('TRIES', 8)); GOOD = 0.92
torch.set_num_threads(4)
model = ParlerTTSForConditionalGeneration.from_pretrained(M); tok = AutoTokenizer.from_pretrained(M)
dtok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path); SR = model.config.sampling_rate
asr = WhisperModel('small', device='cpu', compute_type='int8')
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'burth?os+e?|burto\b', 'burtos', s); s = s.replace('30', 'trente').replace('km', 'kilometres')
    return re.sub(r'[^a-z ]+', ' ', s).split()
def trim(x, thr=0.02):
    e = np.abs(x) > thr * np.abs(x).max(); i = np.argmax(e); j = len(x) - np.argmax(e[::-1])
    return x[max(i - int(0.02 * SR), 0): j + int(0.06 * SR)]
def take(txt, seed):
    torch.manual_seed(seed); d = dtok(STYLE, return_tensors='pt'); p = tok(txt, return_tensors='pt')
    with torch.no_grad():
        a = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask, prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask, do_sample=True, temperature=0.85)
    x = trim(a.cpu().numpy().squeeze().astype(np.float64)); x16 = np.interp(np.arange(0, len(x), SR / 16000), np.arange(len(x)), x).astype(np.float32)
    heard = ' '.join(s.text for s in asr.transcribe(x16, language='fr')[0])
    return x, difflib.SequenceMatcher(None, norm(txt), norm(heard)).ratio(), heard.strip()
script = json.load(open(os.path.join(ROOT, 'audio/voice/script.json'), encoding='utf-8'))
for vid, item in script.items():
    if sys.argv[1:] and vid not in sys.argv[1:]: continue
    parts = []
    for si, seg in enumerate(item['segs']):
        says = seg['say'] if isinstance(seg, dict) else [seg]; target = seg['target'] if isinstance(seg, dict) else seg
        cache = os.path.join(ROOT, 'audio/voice/segs', f'{vid}.{si}.npz'); best = None
        if os.path.exists(cache):
            c = np.load(cache, allow_pickle=True)
            if str(c['target']) == target and float(c['r']) >= GOOD: best = (0, c['x'], float(c['r']), str(c['heard']) + ' (cache)')
        for k in range(TRIES if best is None else 0):
            x, _, heard = take(says[k % len(says)], 100 * (si + 1) + k + int(vid[2:]) * 1000)
            r = difflib.SequenceMatcher(None, norm(target), norm(heard)).ratio()
            if says[k % len(says)] != target and len(norm(heard)) != len(norm(target)): r -= 0.2   # variante : mots en plus = prise rejetée
            score = r - 0.01 * len(x) / SR
            if best is None or score > best[0]: best = (score, x, r, heard)
            if r >= GOOD: break
        os.makedirs(os.path.dirname(cache), exist_ok=True); np.savez(cache, x=best[1], r=best[2], heard=best[3].replace(' (cache)', ''), target=target)
        print(f'  {vid}.{si} ratio={best[2]:.2f} {len(best[1]) / SR:.1f}s :: {best[3]}', flush=True)
        parts += [best[1] / np.abs(best[1]).max(), np.zeros(int(0.16 * SR))]
    x = np.concatenate(parts[:-1]) * 0.95; out = os.path.join(ROOT, 'audio/voice', vid + '.wav'); tmp = out + '.tmp.wav'
    with wave.open(tmp, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
    tempo = min(max(len(x) / SR / item['max'], 1.0), 1.3)
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-loglevel', 'error', '-i', tmp, '-af', f'atempo={tempo:.3f}', out], check=True); os.remove(tmp)
    print(f'{vid} {len(x) / SR:.2f}s -> tempo x{tempo:.2f} (max {item["max"]}s)', flush=True)
