/* SCÈNE 6 — Conclusion et appel à la commande */
(function () {
  const B = window.BURTOS, U = window.U, [S, E] = B.T.outro, C = B.cues, br = B.brand;
  const PHONE = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';
  const CHAT = '<svg viewBox="0 0 24 24"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>';
  B.scenes.push({
    id: 'outro', start: S, end: E,
    build(root, ctx) {
      const contacts = [[PHONE, br.phone], [CHAT, br.snapchat && 'Snapchat : ' + br.snapchat], [CHAT, br.instagram && 'Instagram : ' + br.instagram]].filter(c => c[1]);
      root.innerHTML = `${U.sun()}<div class="cam"><div class="halo"></div><div class="lg">${U.logo()}</div>
        <div class="lines"><div class="pill">${br.hours}</div><div class="pill wt">${br.zone}</div></div>
        <div class="slog">${U.words(B.text.outroSlogan)}</div>
        <div class="contacts">${contacts.map(c => `<div class="pill wt"><span class="ic">${c[0]}</span>${c[1]}</div>`).join('')}</div></div>`;
      this.fx = U.fxCanvas(ctx); root.insertBefore(this.fx, root.querySelector('.cam'));
      const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
      this.n = { root, cam: $('.cam'), halo: $('.halo'), lg: $('.lg'), lines: $$('.lines .pill'), slog: $('.slog'), ct: $$('.contacts .pill') };
    },
    update(t, { W, H, V }) {
      const n = this.n; U.sunUpdate(n.root, t, 9);
      n.cam.style.transform = `scale(${1 + 0.04 * U.p(t, S, E)})`;
      const k = U.p(t, C.outroLogo, C.outroLogo + 0.6), e = U.outBack(k, 2.4);
      n.lg.style.transform = `scale(${U.lerp(0.1, 1, e) * (1 + 0.012 * Math.sin(t * 6))}) rotate(${(1 - e) * 10}deg)`; n.lg.style.opacity = U.clamp(k * 4);
      n.halo.style.transform = `scale(${e * (0.9 + 0.06 * Math.sin(t * 5))})`; n.halo.style.opacity = 0.85;
      U.energy(this.fx, t, { cx: W / 2, cy: H * (V ? 0.27 : 0.3), power: U.p(t, C.outroLogo, C.outroLogo + 0.3) * (1 - 0.5 * U.p(t, S + 2.5, E)), inner: V ? 260 : 380, outer: 1500, boltR: V ? 340 : 480, bolts: 3 });
      n.lines.forEach((p, i) => { const kk = U.p(t, C.outroLines[i], C.outroLines[i] + 0.4), ee = U.outBack(kk, 2); p.style.transform = `translateX(${(1 - ee) * (i ? 500 : -500)}px) skewX(${(1 - ee) * (i ? -20 : 20)}deg)`; p.style.opacity = U.clamp(kk * 3); });
      U.kin(n.slog, t, C.outroSlogan, { stagger: 0.07, dy: 80, rot: -5 });
      n.ct.forEach((p, i) => { const kk = U.p(t, C.outroContacts + i * 0.15, C.outroContacts + 0.4 + i * 0.15), ee = U.outBack(kk, 2.4); p.style.transform = `scale(${ee})`; p.style.opacity = U.clamp(kk * 3); });
    },
  });
})();
