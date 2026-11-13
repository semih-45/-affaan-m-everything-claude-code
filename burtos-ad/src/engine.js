/* Moteur d'animation déterministe : tout est fonction du temps t (secondes).
   -> lecture temps réel dans le navigateur ET rendu image par image identiques. */
(function () {
  const B = window.BURTOS;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const U = {
    clamp,
    lerp: (a, b, k) => a + (b - a) * k,
    p: (t, a, b) => clamp((t - a) / (b - a)),            // progression 0→1 entre a et b
    outCubic: k => 1 - Math.pow(1 - k, 3),
    outQuint: k => 1 - Math.pow(1 - k, 5),
    outExpo: k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
    inCubic: k => k * k * k,
    inOut: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    outBack: (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
    outElastic: k => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
    rng: seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; },
    el: (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; },
    /* '*mot*' => surligné ; découpe en mots animables */
    words: (str) => {
      let hl = false;
      return str.split(/(\*)/).map(part => {
        if (part === '*') { hl = !hl; return ''; }
        return part.split(/\s+/).filter(Boolean).map(w => `<span class="w${hl ? ' hl' : ''}"><i>${w}</i></span>`).join(' ');
      }).join(' ');
    },
    /* anime les mots d'un bloc : montée + fondu, décalés */
    kin: (root, t, t0, { stagger = 0.06, dur = 0.45, dy = 60, rot = 0 } = {}) => {
      const ws = root._w || (root._w = [...root.querySelectorAll('.w > i')]);
      ws.forEach((w, i) => {
        const k = U.p(t, t0 + i * stagger, t0 + i * stagger + dur);
        const e = U.outBack(k, 1.4);
        w.style.transform = `translateY(${(1 - e) * dy}px) rotate(${(1 - e) * rot}deg) scale(${0.6 + 0.4 * e})`;
        w.style.opacity = clamp(k * 3);
      });
    },
    logo: (cls = '') => B.brand.logoImage
      ? `<div class="logo img ${cls}"><img src="../${B.brand.logoImage}"></div>`
      : `<div class="logo ${cls}"><div class="word" data-t="${B.brand.logoText}">${B.brand.logoText}</div>
         <div class="sub"><svg viewBox="0 0 40 40"><path d="M28 3a18 18 0 1 0 9 30A15 15 0 0 1 28 3z"/></svg><span data-t="${B.brand.logoSub}">${B.brand.logoSub}</span></div></div>`,
    stars: n => '<span class="stars">' + Array.from({ length: n }, () => '<svg viewBox="0 0 24 24"><path d="M12 1.6l3.2 6.6 7.2 1-5.2 5.1 1.2 7.2L12 18.1l-6.4 3.4 1.2-7.2L1.6 9.2l7.2-1z"/></svg>').join('') + '</span>',
  };
  window.U = U;

  const q = new URLSearchParams(location.search);
  const V = q.get('format') === 'vertical';
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  const ctx = { V, W, H, B, U };

  function init() {
    const stage = document.getElementById('stage');
    stage.style.width = W + 'px'; stage.style.height = H + 'px';
    stage.classList.toggle('v', V); stage.classList.toggle('h', !V);

    B.scenes.sort((a, b) => a.start - b.start).forEach(s => {
      s.root = document.createElement('section');
      s.root.className = 'scene ' + s.id;
      stage.appendChild(s.root);
      s.build(s.root, ctx);
    });

    /* particules dorées globales */
    const pc = document.createElement('canvas'); pc.className = 'particles';
    const dpr = window.devicePixelRatio || 1;
    pc.width = W * dpr; pc.height = H * dpr; stage.appendChild(pc);
    const g = pc.getContext('2d'); const r = U.rng(7);
    const parts = Array.from({ length: 70 }, () => ({ x: r(), y: r(), s: 2 + r() * 9, v: 0.02 + r() * 0.06, ph: r() * 6.28, a: 0.15 + r() * 0.5 }));
    ctx.drawParticles = t => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        const y = (((p.y - t * p.v) % 1) + 1) % 1 * (H + 80) - 40;
        const x = p.x * W + Math.sin(t * 0.7 + p.ph) * 40;
        const a = p.a * (0.6 + 0.4 * Math.sin(t * 2 + p.ph * 3));
        const gr = g.createRadialGradient(x, y, 0, x, y, p.s * 2.2);
        gr.addColorStop(0, `rgba(255,244,190,${a})`); gr.addColorStop(1, 'rgba(255,200,60,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, p.s * 2.2, 0, 6.3); g.fill();
      }
    };

    /* transitions */
    const tr = U.el('<div class="transitions"><div class="flash"></div><div class="wp w1"></div><div class="wp w2"></div><div class="wp w3"></div></div>');
    stage.appendChild(tr);
    const flash = tr.querySelector('.flash'), wps = [...tr.querySelectorAll('.wp')];
    ctx.drawTransitions = t => {
      let f = 0; const pos = [null, null, null];
      for (const c of B.cuts) {
        if (c.type === 'flash') f = Math.max(f, t < c.t ? U.inCubic(U.p(t, c.t - 0.2, c.t)) : 1 - U.outCubic(U.p(t, c.t, c.t + 0.45)));
        else wps.forEach((_, i) => { const d = (i - 1) * 0.07, k = U.p(t, c.t - 0.36 + d, c.t + 0.36 + d); if (k > 0 && k < 1) pos[i] = k; });
      }
      flash.style.opacity = f;
      wps.forEach((w, i) => {
        if (pos[i] == null) { w.style.display = 'none'; return; }
        w.style.display = 'block';
        const e = U.inOut(pos[i]) * 2 - 1;                 // -1 → 1, 0 = écran couvert
        w.style.transform = V ? `translateY(${-e * 150}%) skewY(-8deg)` : `translateX(${e * 150}%) skewX(-14deg)`;
      });
    };

    const fit = () => { const s = Math.min(innerWidth / W, innerHeight / H); stage.style.transform = `scale(${s})`; };
    if (!q.has('render')) { fit(); addEventListener('resize', fit); }
  }

  function render(t) {
    for (const s of B.scenes) {
      const on = t >= s.start - 0.001 && t < s.end;
      s.root.style.display = on ? 'block' : 'none';
      if (on) s.update(t, ctx);
    }
    ctx.drawParticles(t); ctx.drawTransitions(t);
  }

  window.addEventListener('DOMContentLoaded', async () => {
    init();
    await document.fonts.ready;
    await Promise.all(['900 20px Montserrat', '800 20px Montserrat', '600 20px Montserrat', '20px "Luckiest Guy"'].map(f => document.fonts.load(f)));
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    window.renderFrame = render; render(+q.get('t') || 0); window.READY = true;
    if (q.has('render')) return;
    /* aperçu temps réel : espace = lecture/pause, clic sur la barre = navigation */
    const audio = new Audio('../out/audio-mix.wav'); let playing = false, t0 = 0, base = +q.get('t') || 0;
    const bar = document.getElementById('bar'), fill = bar.firstElementChild;
    const tick = () => { if (!playing) return; let t = base + (performance.now() - t0) / 1000; if (t >= B.duration) { t = 0; base = 0; t0 = performance.now(); audio.currentTime = 0; }
      render(t); fill.style.width = t / B.duration * 100 + '%'; requestAnimationFrame(tick); };
    const toggle = () => { playing = !playing; if (playing) { t0 = performance.now(); audio.currentTime = base; audio.play().catch(() => {}); tick(); } else { base += (performance.now() - t0) / 1000; audio.pause(); } };
    addEventListener('keydown', e => { if (e.code === 'Space') toggle(); });
    bar.addEventListener('click', e => { base = e.offsetX / bar.clientWidth * B.duration; t0 = performance.now(); audio.currentTime = base; render(base); fill.style.width = base / B.duration * 100 + '%'; });
  });
})();
