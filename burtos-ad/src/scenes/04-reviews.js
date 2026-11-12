/* SCÈNE 4 — Avis clients : cartes flottantes en profondeur */
(function () {
  const B = window.BURTOS, U = window.U, [S, E] = B.T.reviews, C = B.cues;
  const LAY = { h: [[110, 330, -4], [675, 520, 2.5], [1240, 310, -2]], v: [[90, 500, -3], [190, 900, 2.5], [90, 1300, -2]] };
  B.scenes.push({
    id: 'reviews', start: S, end: E,
    build(root, { V }) {
      root.innerHTML = `${U.sun()}<div class="ttl">${U.words(B.text.reviewsTitle)}</div>
        <div class="space">${B.reviews.map((r, i) => { const [x, y] = (V ? LAY.v : LAY.h)[i % 3];
          return `<div class="rc" style="left:${x}px;top:${y}px">${U.stars(5)}<div class="txt">« ${r.text} »</div><div class="who"><i>${r.name[0]}</i>${r.name}</div></div>`; }).join('')}</div>
        ${B.showDisclaimers ? `<div class="disc">${B.text.reviewsDisclaimer}</div>` : ''}`;
      this.n = { root, ttl: root.querySelector('.ttl'), space: root.querySelector('.space'), rc: [...root.querySelectorAll('.rc')] };
      this.n.st = this.n.rc.map(c => [...c.querySelectorAll('.stars svg')]);
    },
    update(t, { V }) {
      const n = this.n; U.sunUpdate(n.root, t, 5);
      U.kin(n.ttl, t, S + 0.2, { stagger: 0.07, dy: 80, rot: 5 });
      n.space.style.transform = `scale(${1 + 0.05 * U.p(t, S, E)})`;
      n.rc.forEach((c, i) => {
        const a = C.reviews[i], k = U.p(t, a, a + 0.6), e = U.outBack(k, 1.8), rot = (V ? LAY.v : LAY.h)[i % 3][2];
        c.style.opacity = U.clamp(k * 4);
        c.style.transform = `translateZ(${(1 - e) * -1400}px) translateY(${(1 - e) * 260 + Math.sin(t * 1.7 + i * 2) * 12}px) rotate(${rot + (1 - e) * 14 + Math.sin(t * 1.3 + i) * 1.2}deg) rotateY(${(1 - e) * 50 + Math.sin(t * 1.1 + i * 1.7) * 5}deg)`;
        n.st[i].forEach((s, j) => { const ks = U.outBack(U.p(t, a + 0.3 + j * 0.07, a + 0.55 + j * 0.07), 4); s.style.transform = `scale(${ks}) rotate(${(1 - ks) * -90}deg)`; });
      });
    },
  });
})();
