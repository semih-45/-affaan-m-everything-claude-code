// Aperçu rapide : node outils/apercu.js h|v 1.2 3.5 ...  -> rendus/apercu/*.jpg (1 px = 1 px, non 4K)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [fmt, ...ts] = process.argv.slice(2); const v = fmt === 'v';
  const out = path.join(__dirname, '../rendus/apercu'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: v ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  pg.on('console', m => console.log('console:', m.text())); pg.on('pageerror', e => console.log('ERREUR:', e.message));
  await pg.goto('file://' + path.join(__dirname, '../src/index.html') + '?format=' + fmt); await pg.waitForFunction('window.READY===true', null, { timeout: 30000 });
  for (const t of ts) { await pg.evaluate(t => renderAt(t), parseFloat(t)); await pg.screenshot({ path: `${out}/${fmt}-${String(t).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
  await b.close();
})();
