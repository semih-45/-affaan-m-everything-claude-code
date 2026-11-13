/* SCÈNE 5 — CARTE DES LIVRAISONS : carte stylisée (positions GPS réelles), zoom, points qui tombent, rayon de 30 km */
(function () {
  const B = Burtos, { h, css, p, mix, E, W, H, V, cx, cy, C, fx } = B;
  const K = C.carte, O = K.centre;
  const MX = V ? cx : 1250, MY = V ? 830 : 545, PPK = (V ? 400 : 340) / K.rayonKm;   // px par km au zoom 1
  const km = (lat, lon) => [(lon - O.lon) * 111.32 * Math.cos(O.lat * Math.PI / 180), -(lat - O.lat) * 111.2];
  // minutage : proches à partir de 1,15 s ; lointaines à partir de 2,9 s ; cercle à 4,6 s
  const towns = [];
  K.proches.forEach((c, i) => towns.push({ ...c, k: km(c.lat, c.lon), t: 1.15 + i * .17 }));
  K.lointaines.forEach((c, i) => towns.push({ ...c, k: km(c.lat, c.lon), t: 2.9 + i * .2 }));
  const TR = 4.6, DROP = .32;
  B.CARTE = { towns, TR, DROP };
  const zoom = t => mix(mix(.5, 2.35, E.io(p(t, 0, 1.25))), 1, E.io(p(t, 2.6, 3.4))) * (1 - .04 * p(t, 3.4, 7));
  const loire = [[47.59, 1.33], [47.70, 1.51], [47.776, 1.635], [47.825, 1.70], [47.88, 1.80], [47.896, 1.905], [47.895, 1.985], [47.885, 2.03], [47.868, 2.12], [47.86, 2.22], [47.81, 2.31], [47.765, 2.37], [47.72, 2.50], [47.69, 2.63]].map(q => km(q[0], q[1]));
  let world, svg, roads = [], circle, sweep, pins = [], center, list, rows = [], big = [], stamp, note, titleEl, glowC, pulse = [];

  B.scene({
    id: 'carte',
    build(root) {
      css(root, { background: 'radial-gradient(ellipse at 60% 50%,#16181c 0%,#0a0b0d 60%,#040404 100%)' });
      world = css(h('div', 'abs', root), { left: MX + 'px', top: MY + 'px', width: 0, height: 0 });
      const S = 130; let s = '';
      for (let g = -S; g <= S; g += 5) s += `<path d="M${g} ${-S}V${S}M${-S} ${g}H${S}" stroke="rgba(255,255,255,${g % 25 ? .035 : .08})"/>`;
      // routes secondaires décoratives (vers les grandes directions) + rocades
      const far = [[-15, -100], [70, -70], [110, 10], [-90, 60], [5, 110], [-100, -40], [60, 90]];
      far.forEach(([x, y], i) => s += `<path d="M0 0 Q${x * .5 + y * .08} ${y * .5 - x * .08} ${x} ${y}" stroke="rgba(255,255,255,.13)" stroke-width="2.5"/>`);
      s += `<ellipse rx="5.2" ry="4.4" stroke="rgba(255,255,255,.16)" stroke-width="2"/><ellipse rx="10.5" ry="9" stroke="rgba(255,255,255,.08)" stroke-width="2"/>`;
      // la Loire
      const lp = loire.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join(' ');
      s += `<path d="${lp}" stroke="rgba(90,170,255,.22)" stroke-width="14" stroke-linejoin="round"/><path d="${lp}" stroke="rgba(150,205,255,.75)" stroke-width="4" stroke-linejoin="round"/>`;
      s += `<circle class="zc" r="${K.rayonKm}" fill="rgba(255,208,0,.09)" stroke="#FFD000" stroke-width="5" stroke-dasharray="14 9"/>`;
      // routes lumineuses vers chaque commune
      const r = B.rng(4);
      towns.forEach(tw => { const [x, y] = tw.k, b = (r() - .5) * .3; tw.c = [x * .5 - y * b, y * .5 + x * b]; s += `<path class="rd" d="M0 0 Q${tw.c[0].toFixed(2)} ${tw.c[1].toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}" stroke="#FFD000" stroke-width="3.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-linecap="round"/>`; });
      world.innerHTML = `<svg viewBox="${-S} ${-S} ${2 * S} ${2 * S}" width="${2 * S * PPK}" height="${2 * S * PPK}" style="position:absolute;left:${-S * PPK}px;top:${-S * PPK}px;overflow:visible" fill="none"><g vector-effect="non-scaling-stroke">${s}</g></svg>`;
      world.querySelectorAll('path:not(.rd),ellipse,circle').forEach(e => e.setAttribute('vector-effect', 'non-scaling-stroke'));
      roads = [...world.querySelectorAll('.rd')]; circle = world.querySelector('.zc');
      [['LA LOIRE', 15, 6.5, 'rgba(150,205,255,.7)'], ["FORÊT D'ORLÉANS", 17, -9, 'rgba(255,255,255,.22)'], ['SOLOGNE', -6, 27, 'rgba(255,255,255,.22)'], ['BEAUCE', -22, -27, 'rgba(255,255,255,.22)']].forEach(([n, x, y, col]) => {
        css(h('div', 'abs raj', world, n), { left: x * PPK + 'px', top: y * PPK + 'px', fontSize: '15px', color: col, whiteSpace: 'nowrap', fontStyle: 'italic' });
      });
      sweep = css(h('div', 'abs', root), { borderRadius: '50%', background: 'conic-gradient(from 0deg,rgba(255,208,0,0) 0deg,rgba(255,208,0,0) 290deg,rgba(255,208,0,.38) 360deg)' });
      glowC = css(h('div', 'abs ctr', root), { left: MX + 'px', top: MY + 'px', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(255,200,0,.5),transparent 65%)' });
      // points de livraison
      towns.forEach(tw => {
        const e = h('div', 'pin', root); e.tail = h('div', 'tail', e); e.ring = h('div', 'ring', e); e.dot = h('div', 'dot', e);
        e.lab = h('div', 'lab', root, tw.nom); if (V) e.lab.style.fontSize = '24px'; e.tw = tw; pins.push(e);
      });
      center = h('div', 'pin', root); center.ring = h('div', 'ring', center); center.ring2 = h('div', 'ring', center);
      center.dot = css(h('div', 'dot', center), { width: '26px', height: '26px', left: '-13px', top: '-13px', background: 'var(--j)', boxShadow: '0 0 0 5px #fff,0 0 40px 14px rgba(255,200,0,1)' });
      center.lab = css(h('div', 'lab', root, O.nom), { fontSize: (V ? 40 : 36) + 'px', background: 'var(--j)', color: '#111', border: '3px solid #111', padding: '4px 18px' });
      // panneau : titre + liste défilante des communes
      const LX = V ? cx : 110, LY0 = V ? 120 : 150;
      titleEl = css(h('div', 'abs raj', root, K.titre), { left: (V ? 0 : LX) + 'px', right: V ? 0 : 'auto', textAlign: V ? 'center' : 'left', top: LY0 + 'px', fontSize: '30px', color: '#111' });
      titleEl.innerHTML = `<span style="background:var(--j);padding:4px 18px">${K.titre}</span>`;
      list = css(h('div', 'abs', root), { left: (V ? 0 : LX) + 'px', top: LY0 + 70 + 'px', width: (V ? W : 800) + 'px', height: (V ? 210 : 600) + 'px', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(transparent,#000 22%,#000 78%,transparent)' });
      [O, ...towns].forEach((tw, i) => rows.push(css(h('div', 'abs m9', list, `<span class="raj" style="font-size:.5em;color:var(--j);margin-right:14px">${String(i + 1).padStart(2, '0')}</span>${tw.nom}`), { left: 0, right: 0, textAlign: V ? 'center' : 'left', whiteSpace: 'nowrap', fontSize: (V ? 46 : 36) + 'px', transformOrigin: V ? '50% 50%' : '0 50%' })));
      // textes finaux
      const BY = V ? 1300 : 250, sz = V ? [60, 190, 60] : [64, 230, 60];
      let y = BY;
      K.lignes.forEach((l, i) => { big.push(css(h('div', 'abs ' + (i === 1 ? 'm9i' : 'm9'), root, l), { left: (V ? 0 : LX) + 'px', right: V ? 0 : 'auto', textAlign: V ? 'center' : 'left', top: y + 'px', fontSize: sz[i] + 'px', lineHeight: 1, whiteSpace: 'nowrap', color: i === 1 ? 'var(--j)' : '#fff', textShadow: i === 1 ? '7px 7px 0 var(--o),0 0 60px rgba(255,190,0,.6)' : '0 4px 0 #000', transformOrigin: V ? '50% 50%' : '0 50%' })); y += sz[i] * 1.08; });
      stamp = css(h('div', 'abs m9i', root, K.tampon), { left: (V ? cx : LX + 300) + 'px', top: y + (V ? 70 : 80) + 'px', fontSize: (V ? 52 : 44) + 'px', background: 'var(--j)', color: '#111', padding: '12px 28px', whiteSpace: 'nowrap', boxShadow: '8px 8px 0 #fff' });
      note = css(h('div', 'abs m6', root, K.note), { left: (V ? 0 : LX) + 'px', right: V ? 0 : 'auto', textAlign: V ? 'center' : 'left', top: y + (V ? 170 : 185) + 'px', fontSize: (V ? 27 : 25) + 'px', color: 'rgba(255,255,255,.85)' });
    },
    update(t, dur) {
      const z = zoom(t), s = PPK * z, c = fx.ctx, RH = V ? 70 : 76;
      world.style.transform = `scale(${z}) rotate(${mix(-6, 0, E.out3(p(t, 0, 1.6)))}deg)`;
      glowC.style.opacity = .5 + .2 * Math.sin(t * 5); glowC.style.transform = `translate(-50%,-50%) scale(${z * .8})`;
      // Orléans
      const ck = p(t, .75, 1.05);
      center.style.left = MX + 'px'; center.style.top = MY + 'px'; center.dot.style.transform = `scale(${E.back(ck) * (1 + .12 * Math.sin(t * 8))})`;
      [center.ring, center.ring2].forEach((r, i) => { const q = B.frac((t - .9) * .9 + i * .5); r.style.opacity = t > .9 ? (1 - q) * .9 : 0; r.style.transform = `scale(${.3 + q * 3.2 * z})`; });
      center.lab.style.opacity = ck * 3; center.lab.style.transform = `translate(-50%,${-74 - (1 - E.back(ck)) * 40}px) scale(${mix(.5, 1, E.back(ck))})`; center.lab.style.left = MX + 'px'; center.lab.style.top = MY + 'px';
      if (t >= .9 && t < 1.6) fx.burst(MX, MY, t - .9, { n: 40, seed: 2, speed: 900, life: .7, size: 4 });
      // communes : le point tombe, impact, étiquette temporaire
      let last = 0;
      pins.forEach((e, i) => {
        const tw = e.tw, a = t - tw.t, x = MX + tw.k[0] * s, y = MY + tw.k[1] * s, landed = a >= DROP;
        if (a >= 0) last = i + 1;
        const q = p(a, 0, DROP), fall = (1 - E.in2(q)) * -760;
        e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.opacity = a >= 0 ? 1 : 0;
        e.dot.style.transform = `translateY(${fall}px) scale(${landed ? 1 + .6 * Math.exp(-8 * (a - DROP)) + .08 * Math.sin(t * 6 + i) : .8})`;
        e.tail.style.transform = `translateY(${fall}px)`; e.tail.style.opacity = landed ? 0 : q;
        const rq = p(a, DROP, DROP + .6); e.ring.style.opacity = landed ? (1 - rq) : 0; e.ring.style.transform = `scale(${.2 + rq * 2.2})`;
        roads[i].setAttribute('stroke-dashoffset', 1 - E.out3(p(a, DROP - .1, DROP + .45)));
        roads[i].setAttribute('stroke-width', 3.5 / s); roads[i].setAttribute('opacity', .55 + .25 * Math.sin(t * 4 + i));
        if (landed && a < DROP + .5) fx.burst(x, y, a - DROP, { n: 14, seed: 100 + i, speed: 520, life: .5, size: 3.5 });
        // livreur : impulsion lumineuse sur la route
        if (a > DROP + .3) { const u = B.frac((a - DROP) * .55 + i * .37), v = 1 - u, bx = 2 * v * u * tw.c[0] + u * u * tw.k[0], by = 2 * v * u * tw.c[1] + u * u * tw.k[1]; fx.dot(MX + bx * s, MY + by * s, 13, '255,220,80', Math.sin(u * Math.PI)); }
        // étiquette
        const li = p(a, DROP - .02, DROP + .2), lo = p(a, DROP + 1.05, DROP + 1.35), L = e.lab, d = tw.etq, lw = L.offsetWidth, lh = L.offsetHeight;
        let lx = x + (d === 'd' ? 22 : d === 'g' ? -22 - lw : -lw / 2), ly = y + (d === 'b' ? 20 : d === 'h' ? -20 - lh : -lh / 2);
        lx = B.clamp(lx, 14, W - lw - 14);
        const sl = (1 - E.out5(li)) * 26;
        L.style.left = lx + (d === 'd' ? sl : d === 'g' ? -sl : 0) + 'px'; L.style.top = ly + (d === 'b' ? sl : d === 'h' ? -sl : 0) + 'px'; L.style.opacity = li * (1 - lo) * (i < K.proches.length ? 1 - p(t, 2.5, 2.8) : 1); L.style.zIndex = 5;
      });
      // liste défilante
      const cur = t < .8 ? -1 : last, listOut = E.in3(p(t, TR, TR + .3));
      let fpos = t < .8 ? -1 : 0; pins.forEach(e => fpos += E.out3(p(t, e.tw.t, e.tw.t + .16)));
      const mid = V ? 105 - RH / 2 : 300 - RH / 2;
      rows.forEach((r, i) => { const d = i - fpos, on = Math.max(0, 1 - Math.abs(d)); r.style.top = mid + d * RH + 'px'; r.style.opacity = (i <= fpos + .5 ? mix(.35, 1, on) : 0) * (1 - listOut); r.style.color = on > .5 ? '#fff' : '#aaa'; r.style.transform = `scale(${mix(.74, 1, on)}) translateX(${V ? 0 : on * 14}px)`; });
      titleEl.style.opacity = p(t, .2, .5); titleEl.style.transform = `translateX(${(1 - E.out5(p(t, .2, .7))) * (V ? 0 : -300)}px)`;
      list.style.transform = `translateX(${V ? 0 : -listOut * 200}px)`;
      // rayon de 30 km
      const rk = E.out5(p(t, TR, TR + .8));
      circle.setAttribute('r', K.rayonKm * rk); circle.setAttribute('opacity', rk > 0 ? 1 : 0); circle.setAttribute('stroke-dashoffset', -t * 22);
      const R = K.rayonKm * s * rk;
      css(sweep, { left: MX - R + 'px', top: MY - R + 'px', width: 2 * R + 'px', height: 2 * R + 'px', opacity: rk * .9, transform: `rotate(${t * 150}deg)` });
      if (t > TR) { const a = t - TR; fx.ring(MX, MY, K.rayonKm * s * E.out3(p(a, 0, .7)) * 1.0, (1 - p(a, 0, .9)) * .9, { w: 12 }); fx.ring(MX, MY, K.rayonKm * s * (1 + .5 * E.out3(p(a, .1, 1.1))), (1 - p(a, .1, 1.1)) * .5, { w: 5 }); }
      // textes
      big.forEach((b, i) => { const q = p(t, TR + .15 + i * .14, TR + .5 + i * .14); b.style.opacity = q * 3; b.style.transform = i === 1 ? `scale(${q <= 0 ? 0 : mix(2.4, 1, E.back(q)) * (1 + .02 * Math.sin(t * 6))}) skewX(-4deg)` : `translateX(${(1 - E.out5(q)) * (V ? 0 : -400)}px) translateY(${V ? (1 - E.out5(q)) * 60 : 0}px)`; });
      const sq = p(t, 5.6, 5.85); stamp.style.opacity = sq * 4; stamp.style.transform = `translate(-50%,0) rotate(${mix(-22, -4, E.out3(sq))}deg) scale(${sq <= 0 ? 0 : mix(3.2, 1, E.in2(sq)) * (1 + .12 * Math.exp(-9 * Math.max(0, t - 5.85)))})`;
      if (t >= 5.85 && t < 6.5) { const r = stamp.getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, t - 5.85, { n: 50, seed: 8, speed: 1500, life: .6, size: 5, color: '255,255,255' }); }
      const nq = p(t, 6.05, 6.4); note.style.opacity = nq; note.style.transform = `translateY(${(1 - E.out3(nq)) * 20}px)`;
    },
  });
})();
