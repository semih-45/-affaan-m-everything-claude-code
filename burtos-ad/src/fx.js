/* Effets partagés : fond soleil, canvas d'énergie (traits de vitesse + éclairs) */
(function () {
  const U = window.U;
  U.sun = () => '<div class="sun"><div class="rays"></div><div class="dots"></div><div class="vig"></div></div>';
  U.sunUpdate = (root, t, speed = 6) => {
    const r = root._rays || (root._rays = root.querySelector('.rays'));
    r.style.transform = `rotate(${t * speed}deg)`;
  };
  U.fxCanvas = (ctx) => {
    const c = document.createElement('canvas'); c.className = 'fx';
    const dpr = window.devicePixelRatio || 1; c.width = ctx.W * dpr; c.height = ctx.H * dpr;
    const g = c.getContext('2d'); c._g = g; c._dpr = dpr; c._W = ctx.W; c._H = ctx.H;
    return c;
  };
  /* traits d'énergie radiaux + éclairs. power 0..1 */
  U.energy = (c, t, { cx, cy, power = 1, color = '255,255,255', inner = 260, outer = 1300, bolts = 3, boltR = 420, n = 70 }) => {
    const g = c._g; g.setTransform(c._dpr, 0, 0, c._dpr, 0, 0); g.clearRect(0, 0, c._W, c._H);
    if (power <= 0.01) return;
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    const r = U.rng(11);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, sp = 0.5 + r() * 1.1, ph = r(), len = 60 + r() * 240, w = 2 + r() * 6;
      const k = (t * sp + ph) % 1, rad = inner + (outer - inner) * k * k;
      const al = Math.sin(k * Math.PI) * power * 0.75;
      g.strokeStyle = `rgba(${color},${al})`; g.lineWidth = w;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); g.lineTo(cx + Math.cos(a) * (rad + len * (0.4 + k)), cy + Math.sin(a) * (rad + len * (0.4 + k))); g.stroke();
    }
    /* éclairs : nouvelle forme toutes les 2 images à 30 i/s */
    const step = Math.floor(t * 15);
    for (let b = 0; b < bolts; b++) {
      const rb = U.rng(step * 31 + b * 977);
      if (rb() > 0.55 * power) continue;
      const a0 = rb() * Math.PI * 2, span = 0.5 + rb() * 0.8, segs = 9;
      g.shadowColor = '#FFE98A'; g.shadowBlur = 24;
      g.strokeStyle = `rgba(255,255,255,${0.9 * power})`; g.lineWidth = 5; g.lineJoin = 'miter';
      g.beginPath();
      for (let s = 0; s <= segs; s++) {
        const a = a0 + span * s / segs, rr = boltR * (0.92 + rb() * 0.3);
        const x = cx + Math.cos(a) * rr * 1.5, y = cy + Math.sin(a) * rr * 0.62;
        s ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke(); g.shadowBlur = 0;
    }
  };
})();
