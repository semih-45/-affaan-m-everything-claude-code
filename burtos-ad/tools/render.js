/* Rendu image par image avec Chromium (Playwright) -> flux JPEG vers ffmpeg.
   usage : node tools/render.js <horizontal|vertical> <sortie.mp4> [scale=2] [t0] [t1]
           node tools/render.js <format> --still <t> <sortie.png> [scale] */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const B = require('../src/config.js');
(async () => {
  const [format, out, a3, a4, a5, a6] = process.argv.slice(2);
  const still = out === '--still';
  const scale = +(still ? a6 : a3) || 2;
  const V = format === 'vertical', W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); });
  await page.goto('file://' + path.resolve(__dirname, '../src/index.html') + `?render&format=${format}`);
  await page.waitForFunction('window.READY === true');
  if (still) { for (const t of a3.split(',')) { await page.evaluate(t => window.renderFrame(t), +t); await page.screenshot({ path: a4.replace('%t', t) }); } await browser.close(); return; }
  const t0 = +a4 || 0, t1 = +a5 || B.duration, n = Math.round((t1 - t0) * B.fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(B.fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-maxrate', '9M', '-bufsize', '18M', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const start = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.renderFrame(t), t0 + i / B.fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`${format} ${i}/${n} — ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close(); console.log('OK', out);
})();
