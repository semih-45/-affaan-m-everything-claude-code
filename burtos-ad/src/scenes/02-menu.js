/* SCÈNE 2 — Sélection des produits façon menu de jeu vidéo (carrousel 3D) */
(function () {
  const B = window.BURTOS, U = window.U, [S, E] = B.T.menu, C = B.cues, P = B.products;
  const TRI = '<path d="M30 6 L8 24 L30 42 Z"/>';
  B.scenes.push({
    id: 'menu', start: S, end: E,
    build(root, ctx) {
      root.innerHTML = `${U.sun()}
        <div class="band"><div class="scan"></div></div>
        <div class="title"><b>${B.brand.name}</b><span>${B.text.menuTitle}</span></div>
        <div class="count"><span class="ci">01</span><small> / ${String(P.length).padStart(2, '0')}</small></div>
        <div class="car">${P.map(p => `<div class="card"><div class="aura"></div><div class="in"><img src="../${p.image}"></div></div>`).join('')}</div>
        <svg class="arrow l" viewBox="0 0 48 48">${TRI}</svg><svg class="arrow r" viewBox="0 0 48 48">${TRI}</svg>
        <div class="hud">${P.map(p => `<div class="item"><span class="cat">${p.category}</span>
           <div class="name${p.name.length > 15 ? ' long' : ''}">${p.name}</div>
           <div class="ing">${p.ingredients.map(i => `<span>${i}</span>`).join('')}</div></div>`).join('')}</div>
        <div class="price"><span></span></div>
        <div class="end">${U.words(B.text.menuEnd)}</div>`;
      const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
      this.n = { band: $('.band'), scan: $('.scan'), title: $('.title'), count: $('.count'), ci: $('.ci'), car: $('.car'), cards: $$('.card'), auras: $$('.aura'), arrows: $$('.arrow'), hud: $('.hud'), items: $$('.item'), price: $('.price'), pv: $('.price span'), end: $('.end') };
      this.n.ings = this.n.items.map(it => [...it.querySelectorAll('.ing span')]);
    },
    update(t, { W, H, V }) {
      const n = this.n, sel = C.select, N = P.length;
      U.sunUpdate(n.band.parentNode, t, 5);
      /* position continue du carrousel */
      let pos = 0, cur = 0;
      for (let i = 1; i < N; i++) { const k = U.outExpo(U.p(t, sel[i] - 0.12, sel[i] + 0.3)); pos += k; if (t >= sel[i] - 0.02) cur = i; }
      const speed = sel.reduce((m, s, i) => i ? Math.max(m, 1 - Math.abs(t - (s - 0.04)) / 0.1) : m, 0);   // flou de mouvement
      const wide = U.inOut(U.p(t, C.menuEnd, C.menuEnd + 0.55));
      pos = U.lerp(pos, (N - 1) / 2, wide);
      const enter = 1 - U.outExpo(U.p(t, S, S + 0.55));
      const spacing = U.lerp(V ? 610 : 640, V ? 172 : 306, wide);
      n.car.style.transform = `translateX(${enter * W * 1.2}px) translateY(${wide * (V ? -40 : -30)}px)`;
      n.cards.forEach((c, i) => {
        const d = i - pos, ad = Math.min(Math.abs(d), 1);
        const pulse = t >= sel[i] ? U.outBack(U.p(t, sel[i], sel[i] + 0.32), 3) : 0;
        const active = (1 - ad) * (1 - wide);
        const sc = U.lerp(U.lerp(0.7, V ? 1.18 : 1, 1 - ad) + 0.08 * pulse * active, V ? 0.52 : 0.47, wide);
        const bob = Math.sin(t * 2.2 + i) * 10 * (active + wide * 0.8);
        const ry = U.clamp(-d, -1, 1) * 34 * (1 - wide);
        const gx = V ? (i % 3 - 1) * 335 : (i - (N - 1) / 2) * 306, gy = V ? (Math.floor(i / 3) - 0.5) * 330 - 30 : (i % 2 ? 34 : -34);
        c.style.transform = `translateX(${U.lerp(d * spacing, gx, wide)}px) translateY(${bob + wide * gy}px) translateZ(${-ad * 260 * (1 - wide) + wide * i}px) rotateY(${ry}deg) scale(${sc})`;
        c.style.zIndex = wide > 0.5 ? 100 + i : 100 - Math.round(Math.abs(d) * 10);
        c.style.filter = `brightness(${U.lerp(1 - 0.5 * ad, 1, wide)}) blur(${(speed * 7 * (1 - wide)).toFixed(1)}px)`;
        n.auras[i].style.opacity = active * (0.75 + 0.2 * Math.sin(t * 9)) * U.p(t, sel[0] - 0.1, sel[0] + 0.1);
        n.auras[i].style.transform = `scale(${0.6 + 0.5 * pulse + 0.05 * Math.sin(t * 7)})`;
      });
      n.scan.style.transform = `translateX(${(((t * 0.6) % 1) * 460 - 100)}%)`;
      /* HUD */
      const hudIn = U.outCubic(U.p(t, S + 0.2, S + 0.6)), out = 1 - wide;
      n.title.style.transform = `translateX(${(1 - hudIn) * -300}px)`; n.title.style.opacity = hudIn;
      n.count.style.opacity = hudIn * out; n.ci.textContent = String(cur + 1).padStart(2, '0');
      n.arrows.forEach((a, i) => { const hit = sel.some(s => t >= s - 0.1 && t < s + 0.15); a.style.opacity = hudIn * out * (0.6 + 0.4 * Math.sin(t * 8)); a.style.marginLeft = (i ? 1 : -1) * (hit ? 14 : 0) + 'px'; });
      n.items.forEach((it, i) => {
        const a = sel[i], b = i < N - 1 ? sel[i + 1] : C.menuEnd;
        const kin = U.outExpo(U.p(t, a, a + 0.35)), kout = U.p(t, b - 0.12, b);
        it.style.opacity = t >= a - 0.001 && t < b ? Math.min(kin * 3, 1) * (1 - kout) : 0;
        it.style.transform = `translateX(${(1 - kin) * -160 + kout * 120}px) skewX(${(1 - kin) * -14}deg)`;
        n.ings[i].forEach((s, j) => { const k = U.outBack(U.p(t, a + 0.1 + j * 0.05, a + 0.38 + j * 0.05)); s.style.transform = `scale(${k})`; s.style.opacity = U.clamp(k * 2); });
      });
      const pk = sel.reduce((m, s) => (t >= s ? U.outBack(U.p(t, s, s + 0.3), 3.5) : m), 0);
      n.price.style.transform = `scale(${pk * out}) rotate(${10 - pk * 16}deg)`; n.pv.textContent = P[cur].price || '';
      n.price.style.display = P[cur].price ? 'flex' : 'none';
      n.end.style.opacity = wide > 0 ? 1 : 0; U.kin(n.end, t, C.menuEnd + 0.15, { stagger: 0.09, dy: 90, rot: -6 });
    },
  });
})();
