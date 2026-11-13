/* SCÈNE 6 — FINAL : univers jaune & noir, logo, horaires, zone, slogan, coordonnées */
(function () {
  const B = Burtos, { h, css, p, mix, E, W, H, V, cx, cy, C, fx } = B;
  const M = C.marque, LS = V ? 620 : 560, LX = V ? cx : 380, LY = V ? 420 : cy - 30, RX = V ? cx : 1250;
  let sun, light, logo, halo, hrs = [], dash, strip, slog, pills, band, stripes;

  B.scene({
    id: 'final',
    build(root) {
      css(root, { background: '#FFC800' });
      sun = css(h('div', 'abs sun', root), { left: LX - 1800 + 'px', top: LY - 1800 + 'px', width: '3600px', height: '3600px', borderRadius: '50%' });
      light = css(h('div', 'full', root), { background: `radial-gradient(circle at ${LX}px ${LY}px,rgba(255,255,255,.75) 0%,rgba(255,255,255,0) ${V ? 46 : 38}%)` });
      band = css(h('div', 'abs', root), { left: '-10%', right: '-10%', bottom: V ? '-60px' : '-80px', height: (V ? 330 : 250) + 'px', background: '#0A0A0A', transform: 'rotate(-2deg)', transformOrigin: '50% 100%' });
      stripes = css(h('div', 'abs stripes', band), { left: 0, right: 0, top: '-14px', height: '14px' });
      halo = css(h('div', 'abs ctr', root), { left: LX + 'px', top: LY + 'px', width: LS * 1.5 + 'px', height: LS * 1.5 + 'px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.95) 50%,rgba(255,255,255,0) 70%)' });
      logo = css(h('img', 'abs', root), { left: LX - LS / 2 + 'px', top: LY - LS / 2 + 'px', width: LS + 'px', height: LS + 'px', borderRadius: '50%', boxShadow: '0 0 0 10px #0A0A0A,0 30px 80px rgba(120,60,0,.55)' }); logo.src = M.logo;
      // slogan
      slog = B.mots(root, M.slogan, 'abs m9i');
      css(slog, { left: RX + 'px', top: (V ? 775 : 190) + 'px', width: (V ? 980 : 1150) + 'px', marginLeft: (V ? -490 : -575) + 'px', fontSize: (V ? 64 : 60) + 'px', color: '#fff', textShadow: '4px 4px 0 #0A0A0A,-2px -2px 0 #0A0A0A,2px -2px 0 #0A0A0A,-2px 2px 0 #0A0A0A,7px 8px 0 rgba(0,0,0,.25)' });
      slog.spans.forEach(s => { if (s.className === 'j') css(s, { color: '#0A0A0A', textShadow: '3px 3px 0 #fff,-2px -2px 0 #fff,2px -2px 0 #fff,-2px 2px 0 #fff' }); });
      // horaires
      const HY = V ? 1060 : 420, fs = V ? 118 : 140;
      M.horaires.forEach((x, i) => hrs.push(css(h('div', 'abs m9i', root, x), { left: RX + (i ? 1 : -1) * (V ? 250 : 300) + 'px', top: HY + 'px', fontSize: fs + 'px', lineHeight: 1, color: '#0A0A0A', textShadow: '6px 6px 0 #fff', whiteSpace: 'nowrap' })));
      dash = css(h('div', 'abs', root), { left: RX - 34 + 'px', top: HY + fs * .44 + 'px', width: '68px', height: '20px', background: '#0A0A0A', boxShadow: '5px 5px 0 #fff', transformOrigin: '0 50%' });
      strip = css(h('div', 'abs m9', root, `<span style="color:#fff">${M.jours}</span> &nbsp;·&nbsp; ${M.zone}`), { left: RX + 'px', top: HY + fs + (V ? 40 : 34) + 'px', fontSize: (V ? 46 : 48) + 'px', background: '#0A0A0A', color: 'var(--j)', padding: '10px 34px', whiteSpace: 'nowrap', letterSpacing: '.03em' });
      // coordonnées
      pills = css(h('div', 'abs', root), { left: V ? 0 : RX - 620 + 'px', width: (V ? W : 1240) + 'px', top: (V ? 1640 : 868) + 'px', display: 'flex', gap: (V ? 22 : 30) + 'px', justifyContent: 'center', flexDirection: V ? 'column' : 'row', alignItems: 'center' });
      const ct = C.contact; pills.items = [];
      const mk = (ic, lab, val) => pills.items.push(css(h('div', 'pill', pills, `<i>${ic}</i><div><small>${lab}</small>${val}</div>`), { background: 'var(--j)', color: '#0A0A0A', fontSize: (V ? 46 : 40) + 'px', boxShadow: '0 0 0 4px #fff' }));
      if (ct.telephone) mk('TÉL', 'COMMANDE PAR TÉLÉPHONE', ct.telephone);
      if (ct.snapchat) mk('SNAP', 'SNAPCHAT', ct.snapchat);
      if (ct.instagram) mk('INSTA', 'INSTAGRAM', ct.instagram);
      pills.items.forEach(e => { e.querySelector('i').style.cssText += 'background:#0A0A0A;color:#FFD000'; e.querySelector('small').style.color = '#5a3b00'; });
      if (V) css(pills, { top: (H - 60 - pills.items.length * 100) + 'px' });
    },
    update(t) {
      const c = fx.ctx;
      sun.style.transform = `rotate(${t * 14}deg)`; light.style.opacity = .7 + .2 * Math.sin(t * 4);
      band.style.transform = `rotate(-2deg) translateY(${(1 - E.out5(p(t, .5, 1.1))) * 420}px)`; stripes.style.backgroundPositionX = t * 70 + 'px';
      // logo : impact + rebond, puis respiration
      const k = p(t, 0, .55), hits = Math.exp(-6 * Math.max(0, t - 2.1)) * (t >= 2.1) + Math.exp(-6 * Math.max(0, t - 3.3)) * (t >= 3.3);
      logo.style.transform = `scale(${mix(4.5, 1, E.back2(k)) * (1 + .014 * Math.sin(t * 5) + .05 * hits)}) rotate(${(1 - E.out3(k)) * 20}deg)`;
      logo.style.opacity = p(t, 0, .06); logo.style.filter = `blur(${(1 - p(t, 0, .25)) * 16}px)`;
      halo.style.transform = `translate(-50%,-50%) scale(${.95 + .06 * Math.sin(t * 6) + .25 * hits})`; halo.style.opacity = p(t, .1, .4);
      for (let i = 0; i < 3; i++) fx.ring(LX, LY, Math.max(W, H) * E.out3(p(t, i * .12, 1 + i * .12)), (1 - p(t, i * .12, 1 + i * .12)), { color: i === 1 ? '255,122,0' : '255,255,255', w: 22 - i * 5, blend: 'source-over' });
      fx.burst(LX, LY, t, { n: 150, seed: 12, speed: 2800, life: 1.4, size: 8, color: '255,255,255', blend: 'source-over' });
      fx.burst(LX, LY, t, { n: 70, seed: 13, speed: 2000, life: 1.8, size: 9, color: '20,20,20', blend: 'source-over' });
      fx.burst(LX, LY, t, { n: 60, seed: 14, speed: 1700, life: 1.7, size: 8, color: '255,110,0', blend: 'source-over' });
      // éclairs autour du logo
      const slot = Math.floor(t / .2), ph = (t / .2) % 1;
      if (t > .15 && (slot % 3 === 0 || hits > .3) && ph < .6) for (let i = 0; i < 2; i++) { const s = slot * 17 + i, r = B.rng(s), a = r() * 6.283; fx.bolt(LX + Math.cos(a) * LS * .52, LY + Math.sin(a) * LS * .52, LX + Math.cos(a + .25) * LS * (.85 + r() * .5), LY + Math.sin(a + .25) * LS * (.85 + r() * .5), s, 1 - ph, 4, '255,122,0', 'source-over'); }
      fx.rise(LX, LY, LS * 1.5, LS * 1.6, t, { n: 40, seed: 4, size: 6, speed: .6, color: '255,255,255', blend: 'source-over', alpha: .9 });
      // slogan
      slog.spans.forEach((s, j) => B.pop(s, p(t, .65 + j * .08, .95 + j * .08), 60, 1.8));
      // horaires synchronisés sur la voix ("20h" … "5h")
      [2.1, 3.3].forEach((t0, i) => { const q = p(t, t0 - .14, t0); hrs[i].style.opacity = q * 4; hrs[i].style.transform = `translate(-50%,0) scale(${q <= 0 ? 0 : mix(3.4, 1, E.in2(q)) * (1 + .14 * Math.exp(-9 * Math.max(0, t - t0)))}) skewX(-3deg)`; if (t >= t0 && t < t0 + .6) { const r = hrs[i].getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, t - t0, { n: 46, seed: 20 + i, speed: 1500, life: .6, size: 6, color: i ? '20,20,20' : '255,255,255', blend: 'source-over' }); fx.ring(r.left + r.width / 2, r.top + r.height / 2, 100 + 500 * E.out3((t - t0) / .6), 1 - (t - t0) / .6, { color: '255,255,255', w: 8, blend: 'source-over' }); } });
      dash.style.transform = `scaleX(${E.out3(p(t, 2.45, 3.2))})`;
      const sk = p(t, 1.5, 1.85); strip.style.opacity = sk * 4; strip.style.transform = `translate(-50%,0) rotate(-2deg) scaleX(${E.out5(sk)})`;
      pills.items.forEach((e, i) => { const q = p(t, 1.1 + i * .16, 1.45 + i * .16); e.style.opacity = q * 3; e.style.transform = `scale(${E.back(q) * (1 + .025 * Math.sin(t * 5 + i * 1.5))})`; });
    },
  });
})();
