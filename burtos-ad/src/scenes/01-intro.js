/* SCÈNE 1 — Introduction : nuit, lumière, onde d'énergie, logo, slogan */
(function () {
  const B = window.BURTOS, U = window.U, [S, E] = B.T.intro, C = B.cues;
  function skyline(W, H, seed, baseH, varH, fill, win) {
    const r = U.rng(seed); let x = -40, out = '';
    while (x < W + 40) {
      const w = 46 + r() * 90, h = baseH + r() * varH, y = H - h;
      out += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${fill}"/>`;
      if (r() > 0.6) out += `<rect x="${(x + w * 0.4).toFixed(0)}" y="${(y - 26).toFixed(0)}" width="5" height="26" fill="${fill}"/>`;
      if (win) for (let wy = y + 14; wy < H - 16; wy += 30) for (let wx = x + 10; wx < x + w - 14; wx += 22)
        if (r() > 0.72) out += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="10" height="14" fill="${r() > 0.25 ? '#FFD45A' : '#FFF3C4'}" opacity="${(0.45 + r() * 0.55).toFixed(2)}"/>`;
      x += w + 2 + r() * 10;
    }
    return out;
  }
  B.scenes.push({
    id: 'intro', start: S, end: E,
    build(root, { W, H, V }) {
      const ch = V ? 700 : 430;
      const svg = (cls, body) => `<svg class="city ${cls}" viewBox="0 0 ${W} ${ch}" height="${ch}">${body}</svg>`;
      root.innerHTML = `<div class="sky"></div>
        <svg class="moon" viewBox="0 0 40 40"><path d="M28 3a18 18 0 1 0 9 30A15 15 0 0 1 28 3z"/></svg>
        ${svg('c3', skyline(W, ch, 3, ch * 0.5, ch * 0.42, '#2A1838', false))}
        ${svg('c2', skyline(W, ch, 5, ch * 0.3, ch * 0.4, '#170F24', true))}
        ${svg('c1', skyline(W, ch, 9, ch * 0.12, ch * 0.3, '#07060C', true))}
        <div class="scrim"></div><div class="glow"></div><div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>
        <div class="orb"></div>
        <div class="logoWrap">${U.logo()}</div>
        <div class="slog s1t">${U.words(B.text.slogan1)}</div>
        <div class="slog s2t">${U.words(B.text.slogan2)}</div>`;
      this.fx = U.fxCanvas({ W, H }); root.insertBefore(this.fx, root.querySelector('.orb'));
      const $ = s => root.querySelector(s);
      this.n = { sky: $('.sky'), moon: $('.moon'), scrim: $('.scrim'), c: [$('.c1'), $('.c2'), $('.c3')], glow: $('.glow'), rings: [...root.querySelectorAll('.ring')], orb: $('.orb'), logo: $('.logoWrap'), s1: $('.s1t'), s2: $('.s2t') };
    },
    update(t, { W, H, V }) {
      const n = this.n, imp = C.impact, cy = H * (V ? 0.36 : 0.38);
      /* la ville s'allume au passage de l'onde */
      const lit = U.outCubic(U.p(t, imp - 0.1, imp + 0.9));
      const amb = 0.06 + 0.18 * U.p(t, C.light, imp);
      n.scrim.style.opacity = U.p(t, C.slogan1 - 0.3, C.slogan1 + 0.4); n.sky.style.opacity = lit; n.moon.style.opacity = lit;
      const push = 1 + 0.08 * U.p(t, 0, E);                      // travelling avant lent
      n.c.forEach((c, i) => { c.style.transform = `scale(${1 + (push - 1) * (1.6 - i * 0.5)}) translateY(${(1 - U.outCubic(U.p(t, 0, imp + 0.6))) * (40 + i * 20)}px)`; c.style.filter = `brightness(${amb + (1 - amb) * lit})`; c.style.opacity = U.p(t, 0.2, 1.4); });
      /* lumière qui grandit puis explose */
      const grow = U.p(t, C.light, imp), g2 = grow * grow;
      const orbS = t < imp ? 0.4 + g2 * 9 + Math.sin(t * 40) * 0.25 * grow : U.lerp(10, 0, U.outExpo(U.p(t, imp, imp + 0.35)));
      n.orb.style.transform = `scale(${Math.max(orbS, 0)})`; n.orb.style.opacity = t < C.light ? 0 : U.p(t, C.light, C.light + 0.25);
      n.rings.forEach((r, i) => { const k = U.p(t, imp + i * 0.14, imp + 1.3 + i * 0.14); r.style.transform = `scale(${0.2 + U.outCubic(k) * (V ? 14 : 16)})`; r.style.opacity = k > 0 && k < 1 ? (1 - k) * 0.9 : 0; r.style.borderWidth = (10 - k * 8) + 'px'; });
      n.glow.style.opacity = t < imp ? g2 * 0.5 : 0.75 + 0.12 * Math.sin(t * 5); n.glow.style.transform = `scale(${t < imp ? 0.15 + g2 * 0.4 : 0.9 + 0.05 * Math.sin(t * 3.1)})`;
      /* logo : zoom avant + rebond */
      const k = U.p(t, imp, imp + 0.6), e = U.outBack(k, 2.2), base = V ? 0.86 : 1;
      n.logo.style.opacity = k > 0 ? 1 : 0;
      n.logo.style.transform = `scale(${(k < 1 ? U.lerp(3.2, 1, e) : 1 + 0.035 * U.p(t, imp + 0.6, E)) * base}) rotate(${(1 - e) * -8}deg)`;
      n.logo.style.filter = `brightness(${1 + 2.5 * (1 - U.p(t, imp, imp + 0.5))})`;
      const pw = U.p(t, imp - 0.5, imp) * (1 - 0.45 * U.p(t, imp + 0.8, imp + 2.2));
      U.energy(this.fx, t, { cx: W / 2, cy, power: pw, color: '255,220,120', inner: V ? 200 : 300, outer: V ? 1300 : 1400, boltR: V ? 330 : 420, bolts: t < imp + 1.5 ? 4 : 2 });
      U.kin(n.s1, t, C.slogan1, { stagger: 0.07, dy: 70, rot: 6 });
      U.kin(n.s2, t, C.slogan2, { stagger: 0.06, dy: 50 });
    },
  });
})();
