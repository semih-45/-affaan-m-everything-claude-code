/* SCÈNE 2 — SÉLECTION DES PRODUITS : interface façon menu de sélection de jeu vidéo (carrousel 3D) */
(function () {
  const B = Burtos, { h, css, p, mix, E, W, H, V, cx, C, fx } = B;
  const P = C.produits, N = P.length;
  const CW = V ? 800 : 540, CH = V ? 650 : 440, CY = V ? H * .42 : H * .46, SP = V ? 640 : 510;
  const T0 = .5, STEP = (C.scenes.selection[1] - C.scenes.selection[0] - 1) / N;   // 1er produit à 0,5 s puis un par STEP
  B.SEL = { T0, STEP, N };
  let bgr, marquee, cards = [], glowSel, raysSel, brk, title, sub, counter, catEl, nameEl, bars = [], hint, st1, st2, prix, world;
  let curK = -2;

  B.scene({
    id: 'selection',
    build(root) {
      css(root, { background: 'radial-gradient(ellipse at 50% 45%,#2a2205 0%,#0d0c08 55%,#050505 100%)' });
      bgr = css(h('div', 'abs rays', root), { left: cx - 1400 + 'px', top: CY - 1400 + 'px', width: '2800px', height: '2800px', opacity: .1 });
      marquee = css(h('div', 'abs m9i', root, (C.marque.nom + ' · LIVRAISON DE NUIT · ').repeat(6)), { top: CY - (V ? 520 : 400) + 'px', left: 0, whiteSpace: 'nowrap', fontSize: (V ? 220 : 240) + 'px', color: 'transparent', WebkitTextStroke: '2px rgba(255,208,0,.13)' });
      st1 = css(h('div', 'abs stripes', root), { left: '-10%', right: '-10%', top: 0, height: '16px' });
      st2 = css(h('div', 'abs stripes', root), { left: '-10%', right: '-10%', bottom: 0, height: '16px' });
      // HUD
      sub = css(h('div', 'abs raj', root, 'MENU DE NUIT · 20H – 5H'), { left: (V ? 60 : 90) + 'px', top: (V ? 120 : 60) + 'px', fontSize: '26px', color: '#111', background: 'var(--j)', padding: '4px 16px' });
      title = css(h('div', 'abs m9i', root, C.selectionTitre), { left: (V ? 60 : 90) + 'px', top: (V ? 172 : 108) + 'px', fontSize: (V ? 66 : 62) + 'px', textShadow: '4px 4px 0 var(--o)' });
      counter = css(h('div', 'abs raj', root), { right: (V ? 60 : 90) + 'px', top: (V ? 290 : 60) + 'px', fontSize: (V ? 64 : 84) + 'px', lineHeight: 1, textAlign: 'right' });
      // carrousel 3D
      world = css(h('div', 'full', root), { perspective: '1500px', perspectiveOrigin: `50% ${CY}px` });
      raysSel = css(h('div', 'abs rays', world), { left: cx - 650 + 'px', top: CY - 650 + 'px', width: '1300px', height: '1300px', WebkitMaskImage: 'radial-gradient(circle,#000 20%,transparent 68%)' });
      glowSel = css(h('div', 'abs ctr', world), { left: cx + 'px', top: CY + 'px', width: CW * 1.9 + 'px', height: CH * 1.9 + 'px', background: 'radial-gradient(ellipse,rgba(255,208,0,.95) 0%,rgba(255,150,0,.4) 40%,rgba(255,150,0,0) 68%)' });
      P.forEach((pr, i) => {
        const c = css(h('div', 'card', world), { left: cx - CW / 2 + 'px', top: CY - CH / 2 + 'px', width: CW + 'px', height: CH + 'px' });
        c.inn = h('div', 'in', c); c.img = h('img', '', c); c.img.src = pr.photo;
        h('div', 'num', c, String(i + 1).padStart(2, '0')); c.ring = h('div', 'ring', c);
        cards.push(c);
      });
      brk = [0, 1, 2, 3].map(i => css(h('div', 'abs', world), { width: '54px', height: '54px', borderColor: '#fff', borderStyle: 'solid', borderWidth: `${i < 2 ? 6 : 0}px ${i % 2 ? 6 : 0}px ${i < 2 ? 0 : 6}px ${i % 2 ? 0 : 6}px` }));
      // nom du produit
      const NY = CY + CH * .5 + (V ? 150 : 105);
      catEl = css(h('div', 'abs raj', root), { left: '50%', top: NY - 6 + 'px', fontSize: '30px', color: 'var(--j)', transform: 'translateX(-50%)', whiteSpace: 'nowrap' });
      nameEl = css(h('div', 'abs m9i', root), { left: 0, right: 0, top: NY + 30 + 'px', textAlign: 'center', whiteSpace: 'nowrap', textShadow: '5px 5px 0 var(--o),0 0 40px rgba(255,180,0,.5)' });
      prix = css(h('div', 'abs m9', root), { right: (V ? 60 : 90) + 'px', top: NY + 30 + 'px', fontSize: '60px', color: 'var(--j)' });
      // jauges
      const BX = V ? cx - 330 : cx - 480, BY = NY + (V ? 190 : 150), BW = V ? 660 : 290;
      C.statsNoms.forEach((n, i) => {
        const x = V ? BX : BX + i * 335, y = V ? BY + i * 62 : BY;
        css(h('div', 'abs raj', root, n), { left: x + 'px', top: y + 'px', fontSize: '22px', color: '#ddd' });
        const tr = css(h('div', 'abs', root), { left: x + 'px', top: y + 30 + 'px', width: BW + 'px', height: '12px', background: 'rgba(255,255,255,.14)', transform: 'skewX(-20deg)' });
        bars.push(css(h('div', 'abs', tr), { left: 0, top: 0, bottom: 0, width: '100%', background: 'linear-gradient(90deg,var(--o),var(--j))', transformOrigin: '0 50%', boxShadow: '0 0 14px rgba(255,190,0,.8)' }));
      });
      hint = css(h('div', 'abs raj', root, '◀ ▶ PARCOURIR &nbsp;&nbsp;·&nbsp;&nbsp; ● COMMANDER'), { left: 0, right: (V ? 0 : 90) + 'px', bottom: (V ? 110 : 44) + 'px', textAlign: V ? 'center' : 'right', fontSize: '22px', color: 'rgba(255,255,255,.55)' });
    },
    update(t, dur) {
      const out = E.in3(p(t, dur - .35, dur));
      // index flottant du produit sélectionné
      let idx = -1.6; const st = k => T0 + k * STEP;
      idx += 1.6 * E.out5(p(t, .05, T0 + .05));
      for (let k = 1; k < N; k++) idx += E.io(p(t, st(k) - .26, st(k) + .04));
      const K = Math.max(0, Math.min(N - 1, Math.floor((t - T0 + .12) / STEP))), tk = t - st(K);   // produit courant, temps depuis sa sélection
      const hit = Math.exp(-5 * Math.max(0, tk));        // impulsion à chaque sélection
      bgr.style.transform = `rotate(${t * 9}deg)`; marquee.style.transform = `translateX(${-200 - t * 110}px)`;
      st1.style.backgroundPositionX = t * 80 + 'px'; st2.style.backgroundPositionX = -t * 80 + 'px';
      const hk = E.out5(p(t, .1, .6));
      sub.style.transform = `translateX(${(1 - hk) * -500}px)`; title.style.transform = `translateX(${(1 - E.out5(p(t, .18, .7))) * -900}px) skewX(-4deg)`;
      counter.style.opacity = hk; counter.innerHTML = `<span style="color:var(--j)">${String(K + 1).padStart(2, '0')}</span><span style="font-size:.5em;color:#aaa"> / ${String(N).padStart(2, '0')}</span>`;
      counter.style.transform = `scale(${1 + .25 * hit})`; counter.style.transformOrigin = '100% 50%';
      world.style.transform = `scale(${1 + out * .8})`; world.style.opacity = 1 - out;
      cards.forEach((c, i) => {
        const d = i - idx, ad = Math.abs(d), sel = Math.max(0, 1 - ad);
        const x = Math.sign(d) * SP * Math.pow(ad, .82), z = -ad * 260 + sel * 120, ry = B.clamp(-d * 40, -62, 62);
        c.style.transform = `translate3d(${x}px,${Math.sin(t * 2 + i) * 6 * (1 - sel)}px,${z}px) rotateY(${ry}deg) scale(${1 + .16 * sel + .05 * sel * hit})`;
        c.style.zIndex = 100 - Math.round(ad * 10);
        c.style.filter = `brightness(${mix(.38, 1.03, sel)}) saturate(${mix(.7, 1.05, sel)})`;
        c.style.opacity = B.clamp(1.25 - ad * .3);
        c.style.borderColor = sel > .6 ? '#fff' : '#1a1a1a';
        c.style.boxShadow = `0 30px 60px rgba(0,0,0,.6),0 0 ${sel * 70}px ${sel * 14}px rgba(255,200,0,${sel * .85})`;
        // le produit sort de sa carte et avance vers la caméra
        c.img.style.transform = `translateY(${-6 * sel}px) scale(${.94 + .08 * E.out3(sel) + .015 * Math.sin(t * 3) * sel})`;
        c.img.style.filter = `drop-shadow(0 ${24 * sel}px ${26 * sel}px rgba(120,50,0,${.5 * sel}))`;
        c.ring.style.opacity = i === K ? hit * .9 : 0; c.ring.style.transform = `scale(${1 + (1 - hit) * .22})`;
      });
      const sc = 1 + .16;
      glowSel.style.opacity = (.55 + .2 * Math.sin(t * 8) + .4 * hit) * hk; glowSel.style.transform = `translate(-50%,-50%) scale(${1 + .25 * hit})`;
      raysSel.style.opacity = (.22 + .4 * hit) * hk; raysSel.style.transform = `rotate(${t * 40}deg) scale(${.9 + .2 * hit})`;
      const bw = CW * sc / 2 + 34 + 26 * hit + 5 * Math.sin(t * 6), bh = CH * sc / 2 + 34 + 26 * hit + 5 * Math.sin(t * 6);
      brk.forEach((b, i) => { b.style.left = cx + (i % 2 ? bw - 54 : -bw) + 'px'; b.style.top = CY + (i < 2 ? -bh : bh - 54) + 'px'; b.style.opacity = hk * (1 - out); b.style.zIndex = 200; });
      // nom : animation typographique lettre à lettre
      if (K !== curK) {
        curK = K; const nm = P[K].nom; nameEl.innerHTML = '';
        const fs = Math.min(V ? 96 : 104, (V ? 980 : 1500) / (nm.length * .66)); nameEl.style.fontSize = fs + 'px';
        nameEl.ls = [...nm].map(ch => css(h('span', '', nameEl, ch === ' ' ? '&nbsp;' : ch), { display: 'inline-block' }));
        catEl.textContent = '— ' + P[K].categorie + ' —'; prix.textContent = P[K].prix || '';
      }
      nameEl.ls.forEach((s, j) => { const q = p(tk, -.06 + j * .014, .14 + j * .014), e = E.back(q); s.style.opacity = q * 3; s.style.transform = `translateY(${(1 - e) * 70}px) skewX(${(1 - q) * -30}deg) scale(${mix(1.6, 1, E.out3(q))})`; });
      nameEl.style.opacity = catEl.style.opacity = 1 - out;
      catEl.style.letterSpacing = mix(.5, .16, E.out3(p(tk, -.05, .3))) + 'em';
      bars.forEach((b, i) => { const prev = K > 0 ? P[K - 1].stats[i] : 0; b.style.transform = `scaleX(${mix(prev, P[K].stats[i], E.out5(p(tk, 0, .45 + i * .08)))})`; });
      hint.style.opacity = .4 + .3 * Math.sin(t * 6);
      // étincelles autour du produit sélectionné
      fx.rise(cx, CY, CW * 1.25, CH * 1.5, t, { n: 46, seed: 31, size: 4, speed: .9, alpha: hk * (1 - out) });
      if (tk >= 0 && tk < .5) { fx.burst(cx, CY, tk, { n: 36, seed: 40 + K, speed: 1500, life: .5, size: 4 }); fx.ring(cx, CY, 260 + 500 * E.out3(tk * 2), (1 - tk * 2) * .6, { w: 6 }); }
    },
  });
})();
