/* SCÈNE 3 — CONVERSATION CLIENT : smartphone 3D + messagerie originale (mise en situation) */
(function () {
  const B = Burtos, { h, css, p, mix, E, W, H, V, cx, cy, C, fx } = B;
  const PW = V ? 520 : 400, PH = V ? 1040 : 840, PX = V ? cx : cx + 430, PY = V ? H * .615 : cy + 6;
  const M = C.conversation;
  // minutage des messages (s) : [début de frappe / "écrit…", envoi]
  const TM = [[.4, .95], [1.2, 1.7], [2.1, 2.6], [2.85, 3.3], [3.6, 4.0]];
  const TCONF = 4.4;
  B.TEL = { TM, TCONF };
  let bg, blobs = [], phone, wrap, msgs = [], area, input, inputTxt, send, heads = [], pills, tagEl, conf, toast, grid;

  B.scene({
    id: 'telephone',
    build(root) {
      css(root, { background: 'radial-gradient(ellipse at 70% 50%,#2b2206 0%,#0c0b09 55%,#040404 100%)' });
      grid = css(h('div', 'abs', root), { left: '-50%', right: '-50%', bottom: '-10%', height: '60%', backgroundImage: 'linear-gradient(rgba(255,208,0,.16) 2px,transparent 2px),linear-gradient(90deg,rgba(255,208,0,.16) 2px,transparent 2px)', backgroundSize: '90px 90px', transform: 'perspective(600px) rotateX(64deg)', transformOrigin: '50% 100%', WebkitMaskImage: 'linear-gradient(transparent,#000 70%)' });
      const r = B.rng(8);
      for (let i = 0; i < 14; i++) { const s = 30 + r() * 150; blobs.push(css(h('div', 'abs', root), { left: r() * W + 'px', top: r() * H + 'px', width: s + 'px', height: s + 'px', borderRadius: '50%', background: i % 3 ? 'rgba(255,200,0,.22)' : 'rgba(255,120,0,.2)', filter: `blur(${6 + r() * 14}px)` })); blobs[i].d = .3 + r(); }
      bg = css(h('div', 'abs ctr', root), { left: PX + 'px', top: PY + 'px', width: PH * 1.5 + 'px', height: PH * 1.5 + 'px', background: 'radial-gradient(circle,rgba(255,200,0,.5) 0%,rgba(255,130,0,.15) 40%,transparent 66%)' });
      // titres cinétiques
      const TX = V ? 60 : 110, TY = V ? 150 : 250, sizes = V ? [92, 50, 50] : [100, 52, 52];
      C.conversationTitres.forEach((tx, i) => {
        const e = B.mots(root, tx, 'abs ' + (i ? 'm9' : 'm9i'));
        css(e, { left: TX + 'px', top: TY + (i ? sizes[0] * 1.2 + (i - 1) * sizes[1] * 1.25 : 0) + 'px', width: (V ? W - 120 : 1000) + 'px', flexWrap: V ? 'wrap' : 'nowrap', justifyContent: V ? 'center' : 'flex-start', fontSize: sizes[i] + 'px', color: i ? '#fff' : 'var(--j)', textShadow: i ? '0 4px 0 #000' : '5px 5px 0 var(--o)' });
        heads.push(e);
      });
      // coordonnées
      pills = css(h('div', 'abs', root), { left: (V ? 0 : TX) + 'px', right: V ? 0 : 'auto', top: (V ? H - 190 : TY + 370) + 'px', display: 'flex', gap: '22px', justifyContent: 'center', flexDirection: V ? 'row' : 'column', alignItems: V ? 'center' : 'flex-start' });
      const ct = C.contact; pills.items = [];
      if (ct.telephone) pills.items.push(h('div', 'pill', pills, `<i>TÉL</i><div><small>APPEL / SMS</small>${ct.telephone}</div>`));
      if (ct.snapchat) pills.items.push(h('div', 'pill', pills, `<i>SNAP</i><div><small>SNAPCHAT</small>${ct.snapchat}</div>`));
      if (V) pills.items.forEach(e => css(e, { fontSize: '30px' }));
      tagEl = css(h('div', 'abs raj', root, C.mentionSituation), { left: (V ? PX - PW / 2 - 4 : PX + PW / 2 + 30) + 'px', top: (V ? PY - PH / 2 - 54 : PY + PH / 2 - 60) + 'px', fontSize: '20px', color: 'rgba(255,255,255,.75)', border: '1.5px solid rgba(255,255,255,.5)', padding: '3px 12px', borderRadius: '6px', whiteSpace: 'nowrap' });
      // téléphone 3D
      wrap = css(h('div', 'full', root), { perspective: '1700px', perspectiveOrigin: `${PX}px ${PY}px` });
      phone = css(h('div', 'phone', wrap), { left: PX - PW / 2 + 'px', top: PY - PH / 2 + 'px', width: PW + 'px', height: PH + 'px' });
      const sc = h('div', 'screen', phone), k = PW / 400;
      css(h('div', 'abs', sc), { left: '50%', top: '10px', width: '110px', height: '26px', marginLeft: '-55px', borderRadius: '14px', background: '#000', zIndex: 5 });
      const hd = css(h('div', 'abs', sc), { left: 0, right: 0, top: 0, height: '112px', background: '#17181d', borderBottom: '1px solid #2a2c33', padding: '46px 18px 0', display: 'flex', gap: '12px', alignItems: 'center' });
      css(h('img', '', hd), { width: '50px', height: '50px', borderRadius: '50%' }).src = C.marque.logo;
      h('div', '', hd, `<div class="m9" style="font-size:20px">${C.marque.nom}</div><div class="m6" style="font-size:13px;color:#9fe870">● En ligne · 20h – 5h</div>`);
      area = css(h('div', 'abs', sc), { left: 0, right: 0, top: '112px', bottom: '74px', overflow: 'hidden', zoom: k });
      area.inner = css(h('div', 'abs', area), { left: 0, right: 0, bottom: '10px' });
      M.forEach((m, i) => {
        const w = css(h('div', '', area.inner), { position: 'relative', overflow: 'visible' });
        w.b = h('div', 'bub ' + (m.de === 'client' ? 'c' : 'b'), w, m.texte); css(w.b, { bottom: 0 });
        if (m.de !== 'client') { w.ty = css(h('div', 'bub b', w, '<span>●</span> <span>●</span> <span>●</span>'), { bottom: 0, fontSize: '13px', padding: '14px 16px' }); w.dots = [...w.ty.querySelectorAll('span')]; w.dots.forEach(d => d.style.display = 'inline-block'); }
        w.m = m; msgs.push(w);
      });
      input = css(h('div', 'abs', sc), { left: '12px', right: '12px', bottom: '14px', height: '50px', borderRadius: '25px', background: '#23252c', padding: '0 60px 0 18px', display: 'flex', alignItems: 'center', overflow: 'hidden' });
      inputTxt = css(h('div', 'm6', input), { fontSize: 15 * k + 'px', whiteSpace: 'nowrap', color: '#fff' });
      send = css(h('div', 'abs m9', input, '➤'), { right: '6px', top: '6px', width: '38px', height: '38px', borderRadius: '50%', background: 'var(--j)', color: '#111', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
      conf = css(h('div', 'abs m9', sc, '✓ COMMANDE CONFIRMÉE'), { left: '50%', top: '128px', whiteSpace: 'nowrap', fontSize: 19 * k + 'px', background: '#9fe870', color: '#0b2a00', padding: '10px 20px', borderRadius: '40px', boxShadow: '0 10px 30px rgba(0,0,0,.5)' });
      toast = css(h('div', 'abs m6', root, `<b class="m9" style="color:var(--j)">${C.marque.nom}</b><br>Nouveau message`), { left: (V ? PX + PW / 2 - 200 : PX + PW / 2 - 40) + 'px', top: PY - PH / 2 + 60 + 'px', fontSize: '20px', lineHeight: 1.3, background: 'rgba(25,25,28,.96)', border: '1px solid #444', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,.6)', whiteSpace: 'nowrap' });
    },
    mesure() { msgs.forEach(w => { w.H = w.b.offsetHeight + 10; if (w.ty) w.TH = w.ty.offsetHeight + 10; }); },
    update(t, dur) {
      const inn = E.out5(p(t, 0, .95)), out = E.in3(p(t, dur - .45, dur));
      grid.style.backgroundPositionY = t * 60 + 'px';
      blobs.forEach((b, i) => b.style.transform = `translate(${Math.sin(t * .6 * b.d + i) * 40 - t * 14 * b.d}px,${-t * 30 * b.d}px)`);
      bg.style.opacity = inn * (.8 + .2 * Math.sin(t * 4)) * (1 - out);
      // caméra : le téléphone entre en rotation 3D, puis lente orbite
      const ry = mix(-80, -16, inn) + t * 4.6, rx = mix(30, 7, inn) - t * .8, rz = mix(-14, 2, inn);
      phone.style.transform = `translate3d(${out * (V ? 0 : 500)}px,${(1 - inn) * 1100 - out * 1500}px,${out * -600}px) rotateY(${ry + out * 60}deg) rotateX(${rx}deg) rotateZ(${rz + out * 25}deg) scale(${.92 + .11 * p(t, 0, dur)})`;
      // messages
      msgs.forEach((w, i) => {
        const [a, s] = TM[i]; let hgt, bo = p(t, s, s + .22);
        if (w.ty) { const tk = p(t, a, a + .15); hgt = t < s ? w.TH * E.out3(tk) : mix(w.TH, w.H, E.out3(bo)); w.ty.style.opacity = t >= a && t < s ? 1 : 0; w.dots.forEach((d, j) => d.style.transform = `translateY(${-4 * Math.max(0, Math.sin(t * 14 - j * .9))}px)`); }
        else hgt = w.H * E.out3(bo);
        w.style.height = hgt + 'px'; w.b.style.opacity = bo * 2; w.b.style.transform = `scale(${mix(.5, 1, E.back(bo))})`;
      });
      // saisie dans la barre de message
      let txt = '', pulse = 0;
      M.forEach((m, i) => { if (m.de !== 'client') return; const [a, s] = TM[i]; if (t >= a && t < s) txt = m.texte.slice(0, Math.ceil(m.texte.length * p(t, a, s - .08))); pulse = Math.max(pulse, Math.exp(-9 * Math.max(0, t - s)) * (t >= s)); });
      inputTxt.innerHTML = txt ? txt + '<span style="color:var(--j)">|</span>' : '<span style="color:#777">Message…</span>';
      inputTxt.style.transform = `translateX(${Math.min(0, (PW - 130) - inputTxt.scrollWidth)}px)`;
      send.style.transform = `scale(${1 + .5 * pulse})`;
      const ck = p(t, TCONF, TCONF + .3); conf.style.opacity = ck * 3; conf.style.transform = `translateX(-50%) scale(${mix(2.2, 1, E.back(ck))}) rotate(${(1 - E.out3(ck)) * -8}deg)`;
      // notification discrète
      const tk = E.out5(p(t, 1.7, 2.0)) - E.in3(p(t, 2.7, 3.0)); toast.style.opacity = tk; toast.style.transform = `translateX(${(1 - tk) * 120}px)`;
      // titres
      [.3, 1.5, 2.3].forEach((t0, i) => heads[i].spans.forEach((s, j) => B.pop(s, p(t, t0 + j * .09, t0 + .3 + j * .09), 50, 1.5)));
      heads.forEach(e => { e.style.opacity = 1 - out; });
      pills.items.forEach((e, i) => { const q = p(t, 3.1 + i * .18, 3.45 + i * .18); e.style.opacity = q * 3 * (1 - out); e.style.transform = `scale(${E.back(q)})`; });
      tagEl.style.opacity = C.mentionSituation ? p(t, .8, 1.1) * (1 - out) : 0;
      // effets
      const c = fx.ctx;
      if (t >= TCONF) { const a = t - TCONF, yy = PY - PH * .28; fx.burst(PX, yy, a, { n: 60, seed: 3, speed: 1300, life: .8, color: '160,240,110', size: 5 }); fx.ring(PX, yy, 60 + 520 * E.out3(a / .7), (1 - a / .7) * .8, { color: '160,240,110', w: 6 }); }
      fx.speed(PX, PY, t, out * .8, { r0: 200 });
    },
  });
})();
