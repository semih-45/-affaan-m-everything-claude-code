// Exporte l'animation en MP4 (1080x1920, 30 i/s).
//   python3 make_audio.py         → burtos-audio.wav (bande-son, à lancer avant)
//   node render.js                → burtos.mp4
//   node render.js --frames 1,5.6 → images fixes dans ./frames (pour vérifier)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const url = 'file://' + path.join(__dirname, 'index.html') + '?capture';
const framesArg = process.argv.indexOf('--frames');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('Erreur page :', e.message); process.exitCode = 1; });
  await page.goto(url);
  await page.waitForFunction('window.ready === true');
  const duration = await page.evaluate('window.DURATION');

  if (framesArg > -1) {
    const dir = path.join(__dirname, 'frames');
    fs.mkdirSync(dir, { recursive: true });
    for (const t of process.argv[framesArg + 1].split(',').map(Number)) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: path.join(dir, `t${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 80 });
    }
    await browser.close();
    return;
  }

  const out = path.join(__dirname, 'burtos.mp4');
  // La bande-son est ajoutée si burtos-audio.wav existe (python3 make_audio.py).
  const audio = path.join(__dirname, 'burtos-audio.wav');
  const withAudio = fs.existsSync(audio);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    ...(withAudio ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(duration * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('OK →', out);
})();
