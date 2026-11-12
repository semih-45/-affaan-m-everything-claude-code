#!/bin/bash
# Reconstruit tout : bande-son + vidéos 4K horizontale et verticale (+ versions sans voix off).
set -e; cd "$(dirname "$0")"; mkdir -p out
python3 audio/make_audio.py
node tools/render.js horizontal out/_h.mp4 2 & node tools/render.js vertical out/_v.mp4 2 & wait
mux() { ffmpeg -y -loglevel error -i "$1" -i "$2" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$3"; }
mux out/_h.mp4 out/audio-mix.wav       out/BURTOS_pub_4K_16x9.mp4
mux out/_v.mp4 out/audio-mix.wav       out/BURTOS_pub_4K_9x16.mp4
mux out/_h.mp4 out/audio-sans-voix.wav out/BURTOS_pub_4K_16x9_sans-voix.mp4
mux out/_v.mp4 out/audio-sans-voix.wav out/BURTOS_pub_4K_9x16_sans-voix.mp4
rm out/_h.mp4 out/_v.mp4; ls -la out/*.mp4
