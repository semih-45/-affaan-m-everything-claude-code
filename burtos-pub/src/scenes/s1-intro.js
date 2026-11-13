/* SCÈNE 1 — INTRODUCTION : point lumineux -> explosion dorée -> logo, ville nocturne */
(function () {
  const B = Burtos, { h, css, p, mix, E, W, H, V, cx, C, fx } = B;
  const LY = V ? H * .40 : H * .40, LS = V ? 640 : 480;   // position / taille du logo
  let sky, glow, layers = [], wins = [], dot, aura, rays, logo, tag, badge, water;

  function skyline(seed, baseH, minH, maxH, bw, col, winCol, cath) {
    const r = B.rng(seed); let x = -30, s = '', w = ['', '', ''];
    while (x < W + 30) {
      const bwid = bw * (.6 + r() * 1.3), bh = mix(minH, maxH, r() ** 1.6), y = baseH - bh;
      s += `<rect x="${x}" y="${y}" width="${bwid}" height="${bh + 400}" fill="${col}"/>`;
      if (r() < .45) s += `<path d="M${x} ${y} L${x + bwid / 2} ${y - bwid * .35} L${x + bwid} ${y} Z" fill="${col}"/>`;
      else if (r() < .3) s += `<rect x="${x + bwid * .45}" y="${y - 26}" width="4" height="26" fill="${col}"/>`;
      for (let wx = x + 8; wx < x + bwid - 10; wx += 15) for (let wy = y + 12; wy < baseH - 8; wy += 20) if (r() < .42) w[Math.floor(r() * 3)] += `<rect x="${wx}" y="${wy}" width="6" height="9" rx="1"/>`;
      x += bwid + (r() < .2 ? r() * 20 : 0);
    }
    if (cath) { // silhouette de cathédrale gothique (deux tours + flèche), dessin original
      const X = W * (V ? .16 : .24), Y = baseH, t = (dx) => `<path d="M${X + dx} ${Y} v-250 h8 v-22 h8 v-26 h9 v-30 l8 -34 l8 34 v30 h9 v26 h8 v22 h8 v250 Z" fill="${col}"/>`;
      s += t(0) + t(86) + `<rect x="${X + 150}" y="${Y - 170}" width="250" height="170" fill="${col}"/><path d="M${X + 150} ${Y - 170} l125 -52 l125 52 Z" fill="${col}"/><path d="M${X + 262} ${Y - 205} l10 -190 l10 190 Z" fill="${col}"/>`;
      for (let i = 0; i < 6; i++) w[i % 3] += `<path d="M${X + 172 + i * 37} ${Y - 60} v-60 q7 -16 14 0 v60 Z"/>`;
    }
    return { s, w, winCol };
  }

  B.scene({
    id: 'intro',
    build(root) {
      css(root, { background: '#000' });
      sky = css(h('div', 'full', root), { background: 'linear-gradient(#04050d 0%,#0a0f2c 45%,#231640 72%,#5a2a2e 100%)' });
      // étoiles
      const r = B.rng(11); let sh = [];
      for (let i = 0; i < 160; i++) sh.push(`${Math.round(r() * W)}px ${Math.round(r() * H * .6)}px 0 ${r() < .15 ? 1 : 0}px rgba(255,255,255,${(.3 + r() * .7).toFixed(2)})`);
      css(h('div', 'abs', sky), { width: '2px', height: '2px', left: 0, top: 0, borderRadius: '50%', boxShadow: sh.join(',') });
      // croissant de lune
      const moon = css(h('div', 'abs', sky), { left: W * (V ? .70 : .78) + 'px', top: H * .09 + 'px', width: '110px', height: '110px', borderRadius: '50%', boxShadow: 'inset -26px 10px 0 0 #FFE9A0', transform: 'rotate(-25deg)', filter: 'drop-shadow(0 0 30px rgba(255,220,120,.7))' });
      glow = css(h('div', 'abs', root), { left: '-20%', right: '-20%', bottom: '-10%', height: '75%', background: 'radial-gradient(ellipse at 50% 100%,rgba(255,190,0,.9) 0%,rgba(255,120,0,.35) 35%,rgba(255,120,0,0) 70%)' });
      const base = V ? H * .80 : H * .80;
      const defs = [
        [21, base - 30, 60, 250, 46, '#1b1f47', '#ffd76a', false, .5],
        [22, base + 10, 50, 210, 58, '#10132e', '#ffcf40', true, .75],
        [23, base + 60, 30, 130, 80, '#07081a', '#ffc21a', false, 1],
      ];
      defs.forEach(([seed, bh, mn, mx, bw, col, wc, cath], i) => {
        const k = skyline(seed, bh, mn * (V ? 1.2 : 1), mx * (V ? 1.25 : 1), bw, col, wc, cath);
        const g = h('div', 'full', root, `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;overflow:visible">${k.s}${k.w.map(ww => `<g class="w" fill="${wc}" opacity="0">${ww}</g>`).join('')}</svg>`);
        css(g, { transformOrigin: '50% 100%' }); layers.push(g); wins.push([...g.querySelectorAll('.w')]);
      });
      // la Loire : reflets au premier plan
      water = css(h('div', 'abs', root), { left: 0, right: 0, bottom: 0, height: H * .135 + 'px', background: 'linear-gradient(rgba(3,4,12,.2),#03040c 30%)' });
      water.lines = []; const rw = B.rng(5);
      for (let i = 0; i < 26; i++) water.lines.push(css(h('div', 'abs', water), { left: rw() * 100 + '%', top: 12 + rw() * 80 + '%', width: 40 + rw() * 220 + 'px', height: '3px', borderRadius: '3px', background: 'rgba(255,200,40,.7)', filter: 'blur(1px)' }));
      aura = css(h('div', 'abs ctr', root), { left: cx + 'px', top: LY + 'px', width: LS * 2.6 + 'px', height: LS * 2.6 + 'px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,235,120,.95) 0%,rgba(255,190,0,.55) 30%,rgba(255,120,0,.18) 52%,rgba(255,120,0,0) 70%)' });
      rays = css(h('div', 'abs rays', root), { left: cx - LS * 1.7 + 'px', top: LY - LS * 1.7 + 'px', width: LS * 3.4 + 'px', height: LS * 3.4 + 'px', WebkitMaskImage: 'radial-gradient(circle,#000 0%,rgba(0,0,0,.5) 35%,transparent 68%)' });
      logo = css(h('img', 'abs', root), { left: cx - LS / 2 + 'px', top: LY - LS / 2 + 'px', width: LS + 'px', height: LS + 'px', borderRadius: '50%' }); logo.src = C.marque.logo;
      tag = B.mots(root, C.marque.accroche, 'm9 abs');
      css(tag, { left: '50%', top: (V ? LY + LS * .72 : LY + LS * .66) + 'px', width: (V ? 960 : 1800) + 'px', marginLeft: (V ? -480 : -900) + 'px', fontSize: (V ? 74 : 52) + 'px', textShadow: '0 5px 0 #000,0 0 30px rgba(0,0,0,.9)' });
      badge = css(h('div', 'abs raj', root, C.marque.depuis), { left: '50%', top: (V ? LY + LS * .72 + 300 : LY + LS * .66 + 84) + 'px', fontSize: (V ? 30 : 28) + 'px', color: '#111', background: 'var(--j)', padding: '8px 26px', borderRadius: '40px', whiteSpace: 'nowrap' });
      dot = css(h('div', 'abs', root), { left: cx + 'px', top: LY + 'px', width: '10px', height: '10px', marginLeft: '-5px', marginTop: '-5px', borderRadius: '50%', background: '#fff' });
    },
    update(t) {
      const T = 1.5;                                   // instant de l'explosion
      const rev = p(t, T, T + .5), after = t >= T;
      sky.style.opacity = after ? 1 : 0;
      glow.style.opacity = after ? mix(1, .42, E.out2(p(t, T, T + 1.6))) + .06 * Math.sin(t * 5) : 0;
      const k = t / 5;
      layers.forEach((g, i) => {
        const d = [.03, .06, .11][i];
        g.style.opacity = after ? 1 : 0;
        g.style.transform = `translate(${(i - 1) * -30 * k}px,${(1 - E.out5(p(t, T, T + .9 + i * .15))) * (140 + i * 90)}px) scale(${1 + d * k + .02})`;
        wins[i].forEach((w, j) => w.setAttribute('opacity', E.out2(p(t, T + .25 + j * .5 + i * .12, T + .7 + j * .5 + i * .12)) * (.75 + .25 * Math.sin(t * 3 + j * 2 + i))));
      });
      water.style.opacity = after ? 1 : 0;
      water.lines.forEach((l, i) => { l.style.opacity = after ? .25 + .35 * (.5 + .5 * Math.sin(t * 2.2 + i * 1.7)) : 0; l.style.transform = `translateX(${Math.sin(t * .8 + i) * 24}px) scaleX(${.7 + .3 * Math.sin(t * 1.3 + i * 2)})`; });

      // point lumineux qui charge
      const ch = p(t, .25, T), ds = t < .25 ? 0 : 1 + 9 * E.in3(ch) + (.5 + ch) * Math.sin(t * 40) * .6;
      dot.style.opacity = t < T ? 1 : 0; dot.style.transform = `scale(${ds})`;
      const c = fx.ctx;
      if (t > .25 && t < T) { fx.dot(cx, LY, 60 + 420 * ch, '255,150,0', .25 + .35 * ch); fx.dot(cx, LY, 24 + 130 * E.in2(ch), '255,208,0', .9); }
      if (t > .3 && t < T) { // particules aspirées vers le point
        const r = B.rng(77); c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        for (let i = 0; i < 110; i++) {
          const a = r() * 6.283, R = 250 + r() * 900, st = .3 + r() * .9, q = p(t, st, st + .35 + r() * .25); if (q <= 0 || q >= 1) continue;
          const d = R * (1 - q * q), d2 = R * (1 - Math.max(0, q - .08) ** 2), sp = a + (1 - q) * 1.2;
          c.strokeStyle = `rgba(255,${200 + r() * 55 | 0},60,${q})`; c.lineWidth = 1.5 + r() * 3;
          c.beginPath(); c.moveTo(cx + Math.cos(sp + .1) * d2, LY + Math.sin(sp + .1) * d2); c.lineTo(cx + Math.cos(sp) * d, LY + Math.sin(sp) * d); c.stroke();
        }
        c.restore();
        if (t > .8) for (let i = 0; i < 3; i++) { const s = Math.floor(t * 18) * 7 + i, rr = B.rng(s), a = rr() * 6.283, L = 60 + 220 * ch * rr(); fx.bolt(cx, LY, cx + Math.cos(a) * L, LY + Math.sin(a) * L, s, .9, 2); }
      }
      // explosion
      if (after) {
        const a = t - T;
        for (let i = 0; i < 3; i++) fx.ring(cx, LY, Math.max(W, H) * .95 * E.out3(p(a, i * .13, 1.1 + i * .13)), (1 - p(a, i * .13, 1.1 + i * .13)) * .9, { w: 16 - i * 4 });
        fx.burst(cx, LY, a, { n: 170, seed: 5, speed: 2600, life: 1.5, size: 6 });
        fx.burst(cx, LY, a, { n: 60, seed: 6, speed: 1200, life: 2.2, size: 9, color: '255,140,20' });
        // aura : particules ascendantes + éclairs périodiques
        fx.rise(cx, LY - LS * .1, LS * 1.25, LS * 1.5, t, { n: 70, size: 5, speed: .7, alpha: p(a, .2, .6) });
        const slot = Math.floor(t / .22), ph = (t / .22) % 1;
        if (a > .25 && ph < .55 && slot % 2 === 0 || t > 4.4) for (let i = 0; i < (t > 4.4 ? 4 : 2); i++) {
          const s = (t > 4.4 ? Math.floor(t * 20) : slot) * 13 + i, rr = B.rng(s), an = rr() * 6.283, r0 = LS * .5, r1 = LS * (.8 + rr() * .7);
          fx.bolt(cx + Math.cos(an) * r0, LY + Math.sin(an) * r0, cx + Math.cos(an + .3) * r1, LY + Math.sin(an + .3) * r1, s, 1 - ph, 3);
        }
        fx.speed(cx, LY, t, E.in2(p(t, 4.5, 5)) * .9, { r0: LS * .7, color: '255,230,120' });
      }
      // logo : zoom cinématique + rebond
      const end = E.in3(p(t, 4.5, 5));
      const lk = p(t, T, T + .6), ls = (after ? mix(3.8, 1, E.back2(lk)) : 0) * (1 + .012 * Math.sin(t * 5)) * (1 + .22 * end);
      logo.style.opacity = p(t, T, T + .08);
      logo.style.transform = `scale(${ls}) rotate(${(1 - E.out3(lk)) * -14}deg)`;
      logo.style.filter = `blur(${(1 - p(t, T, T + .3)) * 18}px) drop-shadow(0 0 ${30 + 14 * Math.sin(t * 7) + end * 60}px rgba(255,200,0,.95)) brightness(${1 + end * .7})`;
      aura.style.opacity = after ? (.62 + .2 * Math.sin(t * 7)) * p(t, T, T + .3) : 0;
      aura.style.transform = `translate(-50%,-50%) scale(${.9 + .07 * Math.sin(t * 9) + end * .9})`;
      rays.style.opacity = after ? .3 * p(t, T, T + .5) + end * .4 : 0; rays.style.transform = `rotate(${t * 22}deg) scale(${1 + end * .5})`;
      // accroche mot à mot
      tag.spans.forEach((s, i) => B.pop(s, p(t, 2.45 + i * .085, 2.75 + i * .085)));
      tag.style.transform = `scale(${1 + .03 * p(t, 2.4, 5) + end * .15})`; tag.style.opacity = 1 - end;
      const bk = p(t, 3.55, 3.9); badge.style.opacity = bk * (1 - end); badge.style.transform = `translate(-50%,${(1 - E.back(bk)) * 40}px) scale(${mix(.7, 1, E.back(bk))})`;
    },
  });
})();
