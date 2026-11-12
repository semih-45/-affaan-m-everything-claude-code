/* SCÈNE 5 — Carte stylisée : zoom sur Orléans, points de livraison, rayon de 30 km */
(function () {
  const B = window.BURTOS, U = window.U, [S, E] = B.T.map, C = B.cues;
  const O = B.zones.find(z => z.main) || B.zones[0];
  const km = (lat, lon) => [(lon - O.lon) * 111.32 * Math.cos(O.lat * Math.PI / 180), (lat - O.lat) * 110.57];   // x est, y nord
  const TOWNS = (B.towns || []).map(tw => ({ ...tw, p: km(tw.lat, tw.lon) }));
  const LOIRE = [[47.47, 2.93], [47.686, 2.631], [47.765, 2.375], [47.862, 2.22], [47.866, 2.123], [47.897, 1.905], [47.825, 1.70], [47.776, 1.635], [47.585, 1.335], [47.41, 0.98], [47.39, 0.69], [47.33, 0.4]].map(p => km(p[0], p[1]));
  const ROADS = TOWNS.map(tw => tw.p);
  B.scenes.push({
    id: 'map', start: S, end: E,
    build(root, ctx) {
      root.innerHTML = `<div class="rad">${U.words(B.text.mapRadius.replace(/(\d+) KM/, '*$1_KM*')).replace('_', '&nbsp;')}</div>
        <div class="info i1">${B.mapInfo[0]}</div><div class="info i2">${B.mapInfo[1]}</div>
        <div class="info i3"><span>${B.mapInfo[2].replace(/(MINIMUM DE COMMANDE)/, '<b>$1</b><br>')}</span></div>`;
      this.c = U.fxCanvas(ctx); this.c.className = ''; root.insertBefore(this.c, root.firstChild);
      const $ = s => root.querySelector(s); this.n = { rad: $('.rad'), i: [$('.i1'), $('.i2'), $('.i3')] };
      this.pts = B.zones.map(z => ({ ...z, p: km(z.lat, z.lon) }));
    },
    update(t, { W, H, V }) {
      const c = this.c, g = c._g, R = B.radiusKm; g.setTransform(c._dpr, 0, 0, c._dpr, 0, 0);
      /* caméra : région -> Orléans -> rayon 30 km */
      const z1 = U.inOut(U.p(t, C.mapZoom[0], C.mapZoom[1])), z2 = U.inOut(U.p(t, C.circle - 0.5, C.circle + 0.6));
      const s0 = Math.min(W, H) / 330, s1 = (V ? 62 : 58) * (1 + 0.06 * U.p(t, C.mapZoom[1], C.circle)), s2 = V ? 13.2 : 11.6;
      const sc = Math.exp(U.lerp(U.lerp(Math.log(s0), Math.log(s1), z1), Math.log(s2), z2));
      const f1 = [V ? 0 : 0, V ? 2.6 : 2.6], f2 = V ? [0, -17] : [24, 0], f0 = [-25, -50];
      const cx = U.lerp(U.lerp(f0[0], f1[0], z1), f2[0], z2), cy = U.lerp(U.lerp(f0[1], f1[1], z1), f2[1], z2);
      const X = p => W / 2 + (p[0] - cx) * sc, Y = p => H / 2 - (p[1] - cy) * sc, XY = p => [X(p), Y(p)];
      const bg = g.createRadialGradient(X([0, 0]), Y([0, 0]), 0, X([0, 0]), Y([0, 0]), Math.max(W, H));
      bg.addColorStop(0, '#1A1A22'); bg.addColorStop(0.5, '#0C0C12'); bg.addColorStop(1, '#050508');
      g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0; g.fillStyle = bg; g.fillRect(0, 0, W, H);
      /* grille */
      const grid = (step, al) => { if (al <= 0.01) return; g.strokeStyle = `rgba(255,201,7,${al})`; g.lineWidth = 1; g.beginPath();
        const x0 = cx - W / 2 / sc, x1 = cx + W / 2 / sc, y0 = cy - H / 2 / sc, y1 = cy + H / 2 / sc;
        for (let x = Math.ceil(x0 / step) * step; x < x1; x += step) { g.moveTo(X([x, 0]), 0); g.lineTo(X([x, 0]), H); }
        for (let y = Math.ceil(y0 / step) * step; y < y1; y += step) { g.moveTo(0, Y([0, y])); g.lineTo(W, Y([0, y])); } g.stroke(); };
      grid(50, 0.07 * U.clamp(2 - sc / 6)); grid(10, 0.06 * U.clamp((sc - 4) / 6) * U.clamp(2 - sc / 40)); grid(1, 0.05 * U.clamp((sc - 25) / 20));
      const line = (pts, col, w, glow, prog = 1) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; g.shadowColor = col; g.shadowBlur = glow; g.beginPath();
        const m = (pts.length - 1) * prog; for (let i = 0; i <= Math.floor(m); i++) { const [x, y] = XY(pts[i]); i ? g.lineTo(x, y) : g.moveTo(x, y); }
        if (m % 1 > 0) { const a = pts[Math.floor(m)], b = pts[Math.floor(m) + 1], k = m % 1; g.lineTo(X([a[0] + (b[0] - a[0]) * k, 0]), Y([0, a[1] + (b[1] - a[1]) * k])); } g.stroke(); g.shadowBlur = 0; };
      /* Loire (courbe lissée) */
      const smooth = []; for (let i = 0; i < LOIRE.length - 1; i++) for (let k = 0; k < 8; k++) { const p0 = LOIRE[Math.max(i - 1, 0)], p1 = LOIRE[i], p2 = LOIRE[i + 1], p3 = LOIRE[Math.min(i + 2, LOIRE.length - 1)], u = k / 8;
        smooth.push([0, 1].map(d => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u * u + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u * u * u))); }
      line(smooth, 'rgba(70,130,190,.75)', Math.max(3, sc * 0.35), 16);
      /* routes lumineuses depuis Orléans */
      const rp = U.outCubic(U.p(t, S, S + 1.2));
      ROADS.forEach((r, i) => { const mid = [r[0] * 0.5 + (i % 2 ? 3 : -3), r[1] * 0.5 + (i % 3 - 1) * 3]; line([[0, 0], mid, r], 'rgba(255,201,7,.55)', 3, 12, rp);
        const k = (t * 0.35 + i * 0.37) % 1, q = k < 0.5 ? [mid[0] * k * 2, mid[1] * k * 2] : [mid[0] + (r[0] - mid[0]) * (k - 0.5) * 2, mid[1] + (r[1] - mid[1]) * (k - 0.5) * 2];
        g.fillStyle = '#FFF3C4'; g.shadowColor = '#FFC907'; g.shadowBlur = 16; g.beginPath(); g.arc(X(q), Y(q), 4, 0, 6.3); g.fill(); g.shadowBlur = 0; });
      /* voirie stylisée proche d'Orléans */
      const near = U.clamp((sc - 6) / 14);
      if (near > 0) { g.strokeStyle = `rgba(255,201,7,${0.22 * near})`; g.lineWidth = 2;
        [2.2, 4.6, 8.5].forEach((r, i) => { g.beginPath(); g.arc(X([0, 0]), Y([0, 0]), r * sc, 0.4 + i, 5.2 + i * 1.3); g.stroke(); });
        for (let a = 0; a < 14; a++) { const an = a * 0.449 + 0.2, r0 = a % 3 ? 0.5 : 2.2, r1 = 8 + (a * 7 % 5) * 2.4; g.beginPath(); g.moveTo(X([Math.cos(an) * r0, 0]), Y([0, Math.sin(an) * r0])); g.lineTo(X([Math.cos(an) * r1, 0]), Y([0, Math.sin(an) * r1])); g.stroke(); } }
      /* villes repères */
      const far = U.clamp(1.6 - sc / 9) * (1 - z1);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (far > 0.01) {
        g.font = `900 ${V ? 54 : 64}px Montserrat`; g.fillStyle = `rgba(255,201,7,${0.9 * far})`; g.fillText(B.text.mapRegion, W / 2, H * (V ? 0.2 : 0.14)); }
      /* rayon de 30 km */
      const ck = U.p(t, C.circle, C.circle + 0.9);
      if (ck > 0) { const e = U.outCubic(ck), ox = X([0, 0]), oy = Y([0, 0]), rr = R * sc;
        g.fillStyle = `rgba(255,201,7,${0.13 * e})`; g.beginPath(); g.arc(ox, oy, rr * U.outBack(ck, 1.2), 0, 6.3); g.fill();
        g.save(); g.translate(ox, oy); g.rotate(t * 1.4); const sw = g.createConicGradient(0, 0, 0); sw.addColorStop(0, 'rgba(255,201,7,0)'); sw.addColorStop(0.2, `rgba(255,201,7,${0.3 * e})`); sw.addColorStop(0.201, 'rgba(255,201,7,0)'); sw.addColorStop(1, 'rgba(255,201,7,0)');
        g.fillStyle = sw; g.beginPath(); g.arc(0, 0, rr, 0, 6.3); g.fill(); g.restore();
        g.strokeStyle = '#FFC907'; g.lineWidth = 6; g.shadowColor = '#FFC907'; g.shadowBlur = 30; g.beginPath(); g.arc(ox, oy, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * e); g.stroke(); g.shadowBlur = 0;
        g.setLineDash([4, 18]); g.lineWidth = 3; g.strokeStyle = `rgba(255,243,196,${0.7 * e})`; g.lineDashOffset = -t * 30; g.beginPath(); g.arc(ox, oy, rr + 20, 0, 6.3); g.stroke(); g.setLineDash([]);
        const la = U.p(t, C.circle + 0.5, C.circle + 0.9), ang = -0.35; if (la > 0) { g.strokeStyle = `rgba(255,253,245,${la})`; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(ang) * rr * la, oy + Math.sin(ang) * rr * la); g.stroke(); g.setLineDash([]);
          g.font = '900 34px Montserrat'; const tx = ox + Math.cos(ang) * rr * 0.62, ty = oy + Math.sin(ang) * rr * 0.62 - 26; g.fillStyle = `rgba(11,11,13,${la})`; g.beginPath(); g.roundRect(tx - 70, ty - 26, 140, 50, 25); g.fill(); g.fillStyle = `rgba(255,201,7,${la})`; g.fillText(R + ' KM', tx, ty + 2); } }
      /* communes desservies dans le rayon */
      TOWNS.forEach((tw, i) => { const t0 = C.circle + 0.7 + i * 0.13, k = U.p(t, t0, t0 + 0.4); if (k <= 0) return; const e = U.outBack(k, 3), x = X(tw.p), y = Y(tw.p), dn = tw.label === 'bas' ? 1 : -1;
        const w = U.p(t, t0, t0 + 0.7); g.strokeStyle = `rgba(255,201,7,${(1 - w) * 0.9})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 10 + w * 40, 0, 6.3); g.stroke();
        g.fillStyle = '#FFFDF5'; g.shadowColor = '#FFC907'; g.shadowBlur = 18; g.beginPath(); g.arc(x, y, 9 * e, 0, 6.3); g.fill(); g.shadowBlur = 0;
        g.globalAlpha = U.clamp(k * 3); g.font = `800 ${V ? 25 : 24}px Montserrat`; g.lineWidth = 6; g.strokeStyle = 'rgba(8,8,12,.9)'; g.lineJoin = 'round';
        const ly = y + dn * (26 + (1 - e) * 10); g.strokeText(tw.name, x, ly); g.fillStyle = '#FFFDF5'; g.fillText(tw.name, x, ly); g.globalAlpha = 1; });
      /* liaisons entre secteurs */
      const ps = this.pts, lk = [[0, 1, C.points[1]], [0, 2, C.points[2]], [1, 2, C.points[2] + 0.25]];
      lk.forEach(([a, b, t0]) => { if (!ps[a] || !ps[b]) return; const k = U.outCubic(U.p(t, t0 - 0.1, t0 + 0.45)); if (k <= 0) return; const A = ps[a].p, Bp = ps[b].p, end = [A[0] + (Bp[0] - A[0]) * k, A[1] + (Bp[1] - A[1]) * k];
        line([A, end], '#FFE169', 5, 22); const m = (t * 0.9 + a) % 1; if (k >= 1) { g.fillStyle = '#fff'; g.shadowColor = '#FFC907'; g.shadowBlur = 20; g.beginPath(); g.arc(X([A[0] + (Bp[0] - A[0]) * m, 0]), Y([0, A[1] + (Bp[1] - A[1]) * m]), 7, 0, 6.3); g.fill(); g.shadowBlur = 0; } });
      /* points de livraison + étiquettes */
      ps.forEach((z, i) => { const t0 = C.points[i]; if (t0 == null || t < t0) return; const k = U.p(t, t0, t0 + 0.45), e = U.outBack(k, 3), x = X(z.p), y = Y(z.p), big = z.main ? 1.25 : 1;
        for (let r = 0; r < 2; r++) { const w = ((t - t0) * 0.8 + r * 0.5) % 1; g.strokeStyle = `rgba(255,201,7,${(1 - w) * 0.8})`; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 18 + w * 80 * big, 0, 6.3); g.stroke(); }
        g.fillStyle = '#FFC907'; g.shadowColor = '#FFC907'; g.shadowBlur = 36; g.beginPath(); g.arc(x, y, 20 * e * big, 0, 6.3); g.fill(); g.shadowBlur = 0; g.fillStyle = '#0B0B0D'; g.beginPath(); g.arc(x, y, 8 * e * big, 0, 6.3); g.fill();
        const fade = z.main ? 1 : 1 - z2; if (fade <= 0.01) return;
        const fs = (z.main ? 44 : 36) * (V ? 0.92 : 1); g.font = `900 ${fs}px Montserrat`; const tw = g.measureText(z.name).width + 44, th = fs + 26;
        const side = V ? [[0, 1], [-1, -1], [1, -1]][i % 3] : [[0, 1], [-1, 0], [1, 0]][i % 3];
        const lx = x + side[0] * (tw / 2 + 58) , ly = y + (side[1] || 0) * (th / 2 + 34) + (V && side[0] ? 0 : 0) + (!side[1] && !side[0] ? th : 0);
        const lxx = V && side[0] ? x + side[0] * (tw / 2 - 10) : lx;
        g.save(); g.translate(lxx, ly + (1 - e) * 30); g.scale(e, e); g.globalAlpha = fade * U.clamp(k * 3);
        g.fillStyle = '#0B0B0D'; g.strokeStyle = '#FFC907'; g.lineWidth = 4; g.beginPath(); g.roundRect(-tw / 2, -th / 2, tw, th, th / 2); g.fill(); g.stroke();
        g.fillStyle = '#FFFDF5'; g.fillText(z.name, 0, 3); g.restore(); });
      /* vignette */
      const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      /* textes */
      const n = this.n; n.rad.style.opacity = t >= C.circle + 0.3 ? 1 : 0; U.kin(n.rad, t, C.circle + 0.35, { stagger: 0.07, dy: 60, rot: 4 });
      n.i.forEach((el, i) => { const k = U.p(t, C.info[i], C.info[i] + 0.4), e = U.outBack(k, i ? 2 : 3); el.style.opacity = U.clamp(k * 4);
        el.style.transform = i === 0 ? `scale(${U.lerp(1.6, 1, e)}) rotate(${(1 - e) * -5}deg)` : `translateY(${(1 - e) * 80}px)`; });
    },
  });
})();
