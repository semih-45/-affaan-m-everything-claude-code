// Rendu image par image en 4K. Usage : node outils/rendu.js h|v [debut] [fin]
//   h -> 3840x2160 (16:9)   v -> 2160x3840 (9:16)   — 30 i/s, puis encodage H.264 + audio par ffmpeg
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const fmt = process.argv[2] || 'h', v = fmt === 'v', FPS = 30, DUR = 35, WORKERS = 4;
const f0 = Math.round((parseFloat(process.argv[3] || '0')) * FPS), f1 = Math.round((parseFloat(process.argv[4] || DUR)) * FPS);
const root = path.join(__dirname, '..'), dir = path.join(root, 'rendus/images-' + fmt); fs.mkdirSync(dir, { recursive: true });
(async () => {
  const t0 = Date.now(); let done = 0;
  await Promise.all([...Array(WORKERS)].map(async (_, w) => {
    const b = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
    const pg = await b.newPage({ viewport: v ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
    pg.on('pageerror', e => { console.error('ERREUR PAGE', e.message); process.exit(1); });
    await pg.goto('file://' + path.join(root, 'src/index.html') + '?format=' + fmt); await pg.waitForFunction('window.READY===true');
    for (let f = f0 + w; f < f1; f += WORKERS) {
      await pg.evaluate(t => renderAt(t), f / FPS);
      await pg.screenshot({ path: path.join(dir, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 96 });
      if (++done % 100 === 0) console.log(`${fmt}: ${done}/${f1 - f0} images — ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    await b.close();
  }));
  if (fs.readdirSync(dir).filter(x => x.endsWith('.jpg')).length >= DUR * FPS) {   // toutes les images présentes -> encodage
    const out = path.join(root, 'rendus', v ? 'BURTOS-pub-vertical-9x16-4K.mp4' : 'BURTOS-pub-16x9-4K.mp4');
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg'), '-i', path.join(root, 'rendus/burtos-audio.wav'),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-r', String(FPS),
      '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', '-t', String(DUR), out], { stdio: 'inherit' });
    console.log('VIDÉO :', out);
  }
})();
