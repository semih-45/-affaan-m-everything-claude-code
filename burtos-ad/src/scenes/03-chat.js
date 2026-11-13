/* SCÈNE 3 — Conversation de commande sur smartphone */
(function () {
  const B = window.BURTOS, U = window.U, [S, E] = B.T.chat, C = B.cues;
  B.scenes.push({
    id: 'chat', start: S, end: E,
    build(root) {
      root.innerHTML = `${U.sun()}
        <div class="side"><div class="big"><div class="l1">${U.words(B.text.chatTitle[0])}</div><div class="l2">${U.words(B.text.chatTitle[1])}</div></div><div class="subt">${U.words(B.text.chatSub)}</div></div>
        <div class="p3d"><div class="phone"><div class="screen"><div class="notch"></div>
          <div class="head"><div class="ava">B</div><div><b>${B.brand.name}</b><small>● En ligne · 20h – 05h</small></div></div>
          <div class="msgs">${B.chat.map(m => `<div class="b ${m.from}">${m.text}</div>`).join('')}<div class="typing"><i></i><i></i><i></i></div></div>
          <div class="input"></div></div></div></div>
        <div class="conf"><div class="ck"><svg viewBox="0 0 48 48"><path d="M13 25l8 8 15-17"/></svg></div><div><b>${B.text.chatConfirm}</b><span>${B.text.chatEta}</span></div></div>
        ${B.showDisclaimers ? `<div class="disc">${B.text.chatDisclaimer}</div>` : ''}`;
      const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
      this.n = { root, big: $('.big'), subt: $('.subt'), phone: $('.phone'), bs: $$('.b'), typing: $('.typing'), dots: $$('.typing i'), input: $('.input'), conf: $('.conf'), ck: $('.conf path') };
    },
    update(t, { W, H, V }) {
      const n = this.n; U.sunUpdate(n.root, t, -5);
      U.kin(n.big, t, S + 0.25, { stagger: 0.12, dy: 120, rot: -8 }); U.kin(n.subt, t, S + 0.9, { stagger: 0.07, dy: 40 });
      /* arrivée du téléphone en rotation */
      const k = U.outBack(U.p(t, S + 0.05, S + 0.85), 1.1), dr = U.p(t, S, E);
      n.phone.style.transform = `translateX(${(1 - k) * (V ? 0 : 900)}px) translateY(${(1 - k) * (V ? 1500 : 200) + Math.sin(t * 1.6) * 8}px) rotateY(${(1 - k) * -150 + (V ? 6 - dr * 12 : -16 + dr * 10)}deg) rotateX(${6 - dr * 4}deg) rotateZ(${(1 - k) * 20}deg) scale(${V ? 1.02 : 0.98})`;
      let typ = 0, typY = 0, inputTxt = '';
      n.bs.forEach((b, i) => {
        const c = C.chat[i], kk = U.p(t, c, c + 0.3), e = U.outBack(kk, 2);
        b.style.display = t >= c ? 'block' : 'none'; b.style.transform = `scale(${0.4 + 0.6 * e})`; b.style.opacity = U.clamp(kk * 3);
        const m = B.chat[i];
        if (m.from === 'burtos' && t >= c - 0.62 && t < c) typ = 1;
        if (m.from === 'client' && t >= c - 0.75 && t < c) inputTxt = m.text.slice(0, Math.ceil(m.text.length * U.p(t, c - 0.75, c - 0.1)));
      });
      n.typing.style.display = typ ? 'flex' : 'none';
      if (typ) { const shown = n.bs.filter(b => b.style.display === 'block'); const last = shown[shown.length - 1]; n.typing.style.top = (last ? last.offsetTop + last.offsetHeight + 14 : 0) + 'px'; }
      n.dots.forEach((d, i) => { d.style.transform = `translateY(${Math.sin(t * 14 - i * 0.9) * 5}px)`; });
      n.input.textContent = inputTxt || ''; n.input.style.color = inputTxt ? '#222' : '#aaa'; if (!inputTxt) n.input.textContent = 'Message…';
      /* confirmation */
      const ck = U.p(t, C.confirm, C.confirm + 0.4), ce = U.outBack(ck, 2.6);
      n.conf.style.transform = `${V ? 'translateX(-50%) ' : ''}scale(${ce}) rotate(${(1 - ce) * -6 - 2}deg)`; n.conf.style.opacity = ck > 0 ? 1 : 0;
      n.ck.style.strokeDashoffset = 40 * (1 - U.outCubic(U.p(t, C.confirm + 0.15, C.confirm + 0.5)));
    },
  });
})();
