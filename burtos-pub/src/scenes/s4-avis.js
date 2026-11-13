/* SCÈNE 4 — AVIS CLIENTS : cartes 3D flottantes, étoiles dorées */
(function () {
  const B = Burtos, { h, css, p, mix, E, W, H, V, cx, cy, C, fx } = B;
  const A = C.avis, RW = V ? 860 : 580, RH = V ? 300 : 340;
  const POS = V ? [[cx - 40, 640], [cx + 40, 1050], [cx - 30, 1460]] : [[cx - 615, cy + 40], [cx, cy + 110], [cx + 615, cy + 30]];
  const TI = [.3, .7, 1.1];
  B.AVIS = { TI };
  let title, cards = [], wrap, quotes = [], bgr;

  B.scene({
    id: 'avis',
    build(root) {
      css(root, { background: 'radial-gradient(ellipse at 50% 55%,#33280a 0%,#0e0c08 55%,#040404 100%)' });
      bgr = css(h('div', 'abs rays', root), { left: cx - 1500 + 'px', top: cy - 1500 + 'px', width: '3000px', height: '3000px', opacity: .07 });
      ['“', '”'].forEach((q, i) => quotes.push(css(h('div', 'abs bang', root, q), { left: (i ? W - (V ? 300 : 420) : (V ? 40 : 90)) + 'px', top: (i ? H - (V ? 420 : 380) : (V ? 300 : 120)) + 'px', fontSize: (V ? 500 : 600) + 'px', lineHeight: .8, color: 'rgba(255,208,0,.12)' })));
      title = B.mots(root, C.avisTitre, 'abs m9i');
      css(title, { left: '50%', top: (V ? 180 : 96) + 'px', width: (V ? 980 : 1700) + 'px', marginLeft: (V ? -490 : -850) + 'px', fontSize: (V ? 74 : 64) + 'px', textShadow: '4px 4px 0 #000' });
      wrap = css(h('div', 'full', root), { perspective: '1600px' });
      A.forEach((a, i) => {
        const c = css(h('div', 'rev', wrap), { left: POS[i][0] - RW / 2 + 'px', top: POS[i][1] - RH / 2 + 'px', width: RW + 'px', height: RH + 'px' });
        c.innerHTML = `<div style="display:flex;gap:20px;align-items:center"><div class="av">${a.nom[0]}</div><div><div class="m9" style="font-size:${V ? 40 : 34}px;letter-spacing:.04em">${a.nom}</div><div class="st">${'<span>★</span>'.repeat(a.etoiles)}</div></div></div><div class="m6" style="font-size:${V ? 40 : 31}px;line-height:1.25;margin-top:22px">«&nbsp;${a.texte}&nbsp;»</div><div class="glint"></div>`;
        c.stars = [...c.querySelectorAll('.st span')]; c.glint = c.querySelector('.glint'); cards.push(c);
      });
    },
    update(t, dur) {
      const out = E.in3(p(t, dur - .4, dur));
      bgr.style.transform = `rotate(${-t * 8}deg)`;
      quotes.forEach((q, i) => { q.style.transform = `translateY(${Math.sin(t * 1.4 + i * 2) * 20}px) rotate(${Math.sin(t + i) * 4}deg) scale(${E.back(p(t, .1 + i * .2, .6 + i * .2))})`; });
      title.spans.forEach((s, j) => B.pop(s, p(t, .12 + j * .07, .42 + j * .07), 50, 1.6));
      title.style.opacity = 1 - out; title.style.transform = `scale(${1 + .03 * t / dur})`;
      cards.forEach((c, i) => {
        const a = t - TI[i], k = p(a, 0, .7), e = E.back(k), f = E.out5(k);
        const fl = Math.sin(t * 1.9 + i * 2.1), tilt = V ? [5, -5, 4][i] : [16, 0, -16][i];
        c.style.opacity = B.clamp(k * 3) * (1 - out);
        c.style.transform = `translate3d(${(1 - f) * (i - 1) * 500 + (V ? (1 - f) * (i % 2 ? 900 : -900) : 0)}px,${(1 - f) * 300 + fl * 10}px,${(1 - e) * -1600 + out * 900 + (i === 1 && !V ? 60 : 0)}px) rotateY(${(1 - f) * 80 + tilt + Math.sin(t * 1.2 + i) * 3}deg) rotateX(${(1 - f) * -35 + Math.cos(t * 1.5 + i) * 2}deg) rotateZ(${fl * 1.1}deg)`;
        c.stars.forEach((s, j) => { const q = p(a, .45 + j * .075, .7 + j * .075); s.style.opacity = q * 4; s.style.transform = `scale(${q <= 0 ? 0 : mix(2.6, 1, E.back(q))}) rotate(${(1 - E.out3(q)) * -90}deg)`; });
        c.glint.style.left = mix(-40, 130, E.io(p(a, .8, 1.5))) + '%';
        // étincelles à l'apparition des étoiles
        for (let j = 0; j < c.stars.length; j++) { const sa = a - (.45 + j * .075) - .12; if (sa >= 0 && sa < .45) fx.burst(POS[i][0] - RW / 2 + (V ? 160 : 150) + j * (V ? 44 : 42), POS[i][1] - RH / 2 + (V ? 104 : 96), sa, { n: 9, seed: i * 10 + j, speed: 420, life: .45, size: 3.5 }); }
      });
      fx.rise(cx, cy, W, H, t, { n: 50, seed: 61, size: 3.5, speed: .22, alpha: .7 * (1 - out) });
      fx.speed(cx, cy, t, out * .7, { r0: 260 });
    },
  });
})();
