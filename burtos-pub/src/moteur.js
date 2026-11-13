/* BURTOS — moteur d'animation déterministe : chaque image est une fonction pure du temps t. */
(function () {
  const Q = new URLSearchParams(location.search);
  const V = Q.get('format') === 'v';
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  const C = window.BURTOS_CONFIG;
  const B = window.Burtos = { V, W, H, cx: W / 2, cy: H / 2, C, liste: [] };

  // ---------- maths ----------
  const clamp = B.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  B.p = (t, a, b) => clamp((t - a) / (b - a));
  B.mix = (a, b, k) => a + (b - a) * k;
  B.E = {
    in2: x => x * x, in3: x => x * x * x,
    out2: x => 1 - (1 - x) ** 2, out3: x => 1 - (1 - x) ** 3, out5: x => 1 - (1 - x) ** 5,
    io: x => x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2,
    back: x => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2,
    back2: x => 1 + 4.2 * (x - 1) ** 3 + 3.2 * (x - 1) ** 2,
    elastic: x => x <= 0 ? 0 : x >= 1 ? 1 : 2 ** (-10 * x) * Math.sin((x * 10 - .75) * 2.0944) + 1,
  };
  B.rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  B.frac = x => x - Math.floor(x);

  // ---------- DOM ----------
  B.h = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  B.css = (e, o) => { Object.assign(e.style, o); return e; };
  B.px = n => n + 'px';
  /* "UN *MOT* JAUNE" -> conteneur .mots, retourne la liste des <span> */
  B.mots = (parent, texte, cls) => {
    const c = B.h('div', 'mots ' + (cls || ''), parent);
    c.spans = texte.split(' ').map(m => { const j = /^\*.*\*$/.test(m); return B.h('span', j ? 'j' : '', c, m.replace(/\*/g, '')); });
    return c;
  };
  /* apparition "pop" d'un mot : k = progression 0..1 */
  B.pop = (e, k, dy = 40, sc = 1.7) => {
    const q = B.E.back(k);
    e.style.opacity = clamp(k * 4);
    e.style.transform = `translateY(${(1 - q) * dy}px) scale(${B.mix(sc, 1, B.E.out3(k))}) rotate(${(1 - q) * -6}deg)`;
  };

  // ---------- FX canvas ----------
  let ctx;
  B.fx = {
    /* éclat radial de particules (traînées) */
    burst(x, y, age, o) {
      o = Object.assign({ n: 80, seed: 1, speed: 900, life: 1, color: '255,210,40', size: 4, grav: 0, blend: 'lighter', spread: Math.PI * 2, dir: 0 }, o);
      if (age < 0 || age > o.life) return;
      const r = B.rng(o.seed); ctx.save(); ctx.globalCompositeOperation = o.blend; ctx.lineCap = 'round';
      for (let i = 0; i < o.n; i++) {
        const a = o.dir + (r() - .5) * o.spread, v = o.speed * (.25 + r() * .75), l = o.life * (.5 + r() * .5), s = o.size * (.4 + r());
        const k = age / l; if (k > 1) continue;
        const d = v * l * (1 - (1 - k) ** 2.2) * .5, d0 = v * l * (1 - (1 - Math.max(0, k - .06)) ** 2.2) * .5;
        const gx = o.grav * age * age;
        ctx.strokeStyle = `rgba(${o.color},${(1 - k) ** 1.5})`; ctx.lineWidth = s * (1 - k * .6);
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0 + gx); ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d + gx + .1); ctx.stroke();
      }
      ctx.restore();
    },
    ring(x, y, rad, alpha, o) {
      o = Object.assign({ color: '255,210,40', w: 10, blend: 'lighter' }, o);
      if (alpha <= 0 || rad <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = o.blend; ctx.strokeStyle = `rgba(${o.color},${alpha})`; ctx.lineWidth = o.w;
      ctx.shadowColor = `rgba(${o.color},1)`; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.stroke(); ctx.restore();
    },
    /* éclair : ligne brisée par déplacement du point milieu */
    bolt(x1, y1, x2, y2, seed, alpha = 1, w = 3, color = '255,220,60', blend = 'lighter') {
      const r = B.rng(seed); let pts = [[x1, y1], [x2, y2]];
      let disp = Math.hypot(x2 - x1, y2 - y1) * .22;
      for (let it = 0; it < 5; it++) { const n = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; n.push(a, [(a[0] + b[0]) / 2 + (r() - .5) * disp, (a[1] + b[1]) / 2 + (r() - .5) * disp]); } n.push(pts[pts.length - 1]); pts = n; disp *= .55; }
      ctx.save(); ctx.globalCompositeOperation = blend; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const path = () => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); };
      ctx.shadowColor = `rgba(${color},1)`; ctx.shadowBlur = 24; ctx.strokeStyle = `rgba(${color},${alpha * .8})`; ctx.lineWidth = w * 2.2; path();
      ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(255,255,255,${alpha})`; ctx.lineWidth = w * .8; path(); ctx.restore();
    },
    /* particules qui montent en boucle (aura / braises) dans une zone */
    rise(x, y, w, h, t, o) {
      o = Object.assign({ n: 60, seed: 3, color: '255,200,30', size: 4, speed: .5, blend: 'lighter', alpha: 1 }, o);
      const r = B.rng(o.seed); ctx.save(); ctx.globalCompositeOperation = o.blend;
      for (let i = 0; i < o.n; i++) {
        const px = r(), ph = r(), sp = .5 + r(), s = o.size * (.3 + r()), wob = r() * 6.28;
        const k = B.frac(t * o.speed * sp + ph);
        const X = x + (px - .5) * w + Math.sin(t * 2 + wob) * 14, Y = y + h / 2 - k * h;
        ctx.fillStyle = `rgba(${o.color},${o.alpha * Math.sin(k * Math.PI) ** 1.2})`;
        ctx.beginPath(); ctx.arc(X, Y, s * (1 - k * .5), 0, 7); ctx.fill();
      }
      ctx.restore();
    },
    dot(x, y, rad, color, alpha, blend = 'lighter') {
      if (alpha <= 0) return; ctx.save(); ctx.globalCompositeOperation = blend;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, `rgba(255,255,255,${alpha})`); g.addColorStop(.25, `rgba(${color},${alpha})`); g.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); ctx.restore();
    },
    /* lignes de vitesse radiales */
    speed(x, y, t, alpha, o) {
      o = Object.assign({ n: 70, seed: 9, color: '255,255,255', r0: 300, r1: 1400, blend: 'lighter' }, o);
      if (alpha <= 0) return; const r = B.rng(o.seed + Math.floor(t * 30)); ctx.save(); ctx.globalCompositeOperation = o.blend;
      for (let i = 0; i < o.n; i++) { const a = r() * 6.283, a0 = o.r0 * (.7 + r() * .8), l = 80 + r() * 500; ctx.strokeStyle = `rgba(${o.color},${alpha * r()})`; ctx.lineWidth = 1 + r() * 4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * a0, y + Math.sin(a) * a0); ctx.lineTo(x + Math.cos(a) * (a0 + l), y + Math.sin(a) * (a0 + l)); ctx.stroke(); }
      ctx.restore();
    },
    get ctx() { return ctx; },
  };

  // ---------- scènes ----------
  B.scene = def => B.liste.push(def);

  // Transitions globales
  const FLASH = [ // [t, couleur, montée, descente, intensité]
    [1.5, '#fff', .04, .55, 1],
    [C.scenes.selection[0], 'radial-gradient(circle,#fff 0%,#FFE040 30%,#FFC400 100%)', .3, .5, 1],
    [C.scenes.avis[0], '#fff', .1, .35, .75],
    [C.scenes.final[0], 'radial-gradient(circle,#fff 0%,#FFE040 35%,#FFB800 100%)', .16, .5, 1],
  ];
  const BARS = [C.scenes.telephone[0], C.scenes.carte[0]];
  const SHAKE = [[1.5, 26], [C.scenes.selection[0], 14], [C.scenes.final[0], 30], [C.scenes.final[0] + 2.1, 12], [C.scenes.final[0] + 3.3, 14], [C.scenes.carte[0] + 5.6, 10]];
  B.SHAKE = SHAKE;

  B.demarrer = async function () {
    const stage = document.getElementById('stage'); B.css(stage, { width: W + 'px', height: H + 'px' });
    const cv = document.getElementById('fx'); cv.width = W * 2; cv.height = H * 2; ctx = cv.getContext('2d');
    const root = document.getElementById('scenes');
    await document.fonts.ready;
    await Promise.all(['900 20px Mont', 'italic 900 20px Mont', '800 20px Mont', '600 20px Mont', '20px Bang', '700 20px Raj', '600 20px Raj'].map(f => document.fonts.load(f)));
    for (const s of B.liste) { s.root = B.h('div', 'scene', root); s.root.style.display = 'block'; s.build(s.root); [s.t0, s.t1] = C.scenes[s.id]; }
    await Promise.all([...document.images].map(i => i.decode ? i.decode().catch(() => { }) : 0));
    for (const s of B.liste) if (s.mesure) s.mesure();
    const barsEl = document.getElementById('bars'); const cols = ['#FFD000', '#0A0A0A', '#FF7A00', '#FFD000', '#fff', '#0A0A0A', '#FFD000', '#FF7A00', '#0A0A0A', '#FFD000'];
    const bars = cols.map((c, i) => B.css(B.h('div', '', barsEl), { left: (i * 10) + '%', width: '10.4%', background: c }));
    const flashEl = document.getElementById('flash');

    window.renderAt = function (t) {
      t = clamp(t, 0, C.duree);
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, W, H);
      const last = B.liste[B.liste.length - 1];
      for (const s of B.liste) {
        const on = t >= s.t0 && (t < s.t1 || s === last);
        s.root.style.display = on ? 'block' : 'none';
        if (on) s.update(t - s.t0, s.t1 - s.t0);
      }
      // flashs
      let fo = 0, fb = '#fff';
      for (const [ft, col, a, d, m] of FLASH) { const k = t < ft ? B.E.in3(B.p(t, ft - a, ft)) : 1 - B.E.out2(B.p(t, ft, ft + d)); if (k * m > fo) { fo = k * m; fb = col; } }
      flashEl.style.opacity = fo; if (fo > 0) flashEl.style.background = fb;
      // volets diagonaux
      let bon = false;
      for (const bt of BARS) if (t > bt - .42 && t < bt + .42) {
        bon = true;
        bars.forEach((b, i) => { const d = i * .016; const y = t < bt ? 105 * (1 - B.E.out3(B.p(t, bt - .4 + d, bt - .12 + d))) : -105 * B.E.in2(B.p(t, bt + .02 + d, bt + .3 + d)); b.style.transform = `translateY(${i % 2 ? -y : y}%)`; });
      }
      barsEl.style.display = bon ? 'block' : 'none';
      // tremblement caméra
      let sx = 0, sy = 0;
      for (const [st, amp] of SHAKE) { const d = t - st; if (d >= 0 && d < .7) { const e = amp * Math.exp(-7 * d); sx += e * Math.sin(d * 95); sy += e * Math.cos(d * 78 + 1); } }
      root.style.transform = (sx || sy) ? `translate(${sx}px,${sy}px) scale(1.035)` : '';
      return true;
    };
    // modes aperçu : ?t=12.5 (image fixe) ou ?play=1 (lecture temps réel avec son si rendu présent)
    if (Q.get('play')) {
      const au = new Audio('../rendus/burtos-audio.wav'); au.play().catch(() => { });
      const t0 = performance.now(); const loop = () => { const t = ((performance.now() - t0) / 1000) % C.duree; renderAt(t); requestAnimationFrame(loop); }; loop();
    } else renderAt(parseFloat(Q.get('t') || '0'));
    window.READY = true;
  };
})();
