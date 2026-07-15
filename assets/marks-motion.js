/* Atlas — per-issue scroll motion.
   A registry of scroll-driven animations, each resolving into one of the Atlas
   marks in the bottom-right corner. Each issue is assigned an animation
   deterministically by its date (data-issue on #markmotion), so a given issue
   always shows the same one but the digest varies week to week.
   Guards: disabled under 1200px, honors prefers-reduced-motion, holds a quiet
   static mark on pages too short to scroll. Add animations to ANIMS to expand. */
(function () {
  var host = document.getElementById('markmotion');
  if (!host) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = function () { return window.matchMedia && window.matchMedia('(max-width:1200px)').matches; };
  var NS = 'http://www.w3.org/2000/svg';
  function mk(name, geom, style) {
    var e = document.createElementNS(NS, name);
    if (geom) for (var k in geom) e.setAttribute(k, geom[k]);
    if (style) for (var s in style) e.style[s] = style[s];
    return e;
  }
  var stroke = { fill: 'none', stroke: 'var(--ink)', strokeWidth: '2' };
  var root = document.documentElement, INK = [20, 20, 20], PAPER = [251, 250, 247];
  function lerpCol(a, b, f) { return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' + Math.round(a[1] + (b[1] - a[1]) * f) + ',' + Math.round(a[2] + (b[2] - a[2]) * f) + ')'; }
  function smoothPath(p) {
    if (p.length < 3) return 'M' + p[0][0] + ' ' + p[0][1] + ' L' + p[p.length - 1][0] + ' ' + p[p.length - 1][1];
    var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  var W, H, R, cx, cy, current, maxScroll = 0, render = null, ticking = false;

  /* ---------- animation registry ----------
     Each entry builds its elements into `host` and returns render(e), e in 0..1 eased. */
  var ANIMS = {};

  /* Offset — lens-flare rings slide down an axis and settle into the offset contour stack. */
  ANIMS.offset = function () {
    var rads = [0.85, 0.30, 1.15, 0.50, 0.20, 0.65], ts = [0.05, 0.26, 0.44, 0.63, 0.80, 0.95], N = rads.length;
    var ax = W * 0.12, ay = H * 0.16, bx = cx, by = cy, cs = [];
    for (var i = 0; i < N; i++) { var c = mk('circle', null, stroke); host.appendChild(c); cs.push(c); }
    return function (e) {
      for (var i = 0; i < N; i++) {
        var sx = ax + (bx - ax) * ts[i], sy = ay + (by - ay) * ts[i];
        var er = R * (1 - i * 0.14), ecx = bx - i * 0.03 * R, ecy = by + i * 0.045 * R;
        var x = sx + (ecx - sx) * e, y = sy + (ecy - sy) * e, r0 = rads[i] * R, r = r0 + (er - r0) * e;
        cs[i].setAttribute('cx', x.toFixed(1)); cs[i].setAttribute('cy', y.toFixed(1));
        cs[i].setAttribute('r', Math.max(1, r).toFixed(1));
        cs[i].setAttribute('opacity', (0.08 + 0.42 * e).toFixed(3));
      }
    };
  };

  /* Concentric — a scattered grid of dots collects into staggered concentric rings. */
  ANIMS.concentric = function () {
    var dr = R * 0.2, target = [], scatter = [], dots = [];
    target.push([cx, cy]);
    for (var ri = 1; ri * dr <= R + 0.1; ri++) {
      var rad = ri * dr, cnt = Math.max(1, Math.round(2 * Math.PI * rad / dr)), off = (ri % 2) * (Math.PI / cnt);
      for (var a = 0; a < cnt; a++) { var th = off + a * 2 * Math.PI / cnt; target.push([cx + rad * Math.cos(th), cy + rad * Math.sin(th)]); }
    }
    var M = target.length, cols = Math.max(1, Math.round(Math.sqrt(M * W / H))), rows = Math.ceil(M / cols);
    var mx = W * 0.07, my = H * 0.07, gw = (W - 2 * mx) / cols, gh = (H - 2 * my) / rows;
    for (var k = 0; k < M; k++) {
      var c = k % cols, r = Math.floor(k / cols);
      scatter.push([mx + (c + 0.5) * gw, my + (r + 0.5) * gh]);
      var d = mk('circle', { r: 2.5 }, { fill: 'var(--ink)' }); host.appendChild(d); dots.push(d);
    }
    return function (e) {
      for (var i = 0; i < M; i++) {
        var x = scatter[i][0] + (target[i][0] - scatter[i][0]) * e, y = scatter[i][1] + (target[i][1] - scatter[i][1]) * e;
        dots[i].setAttribute('cx', x.toFixed(1)); dots[i].setAttribute('cy', y.toFixed(1));
        dots[i].setAttribute('opacity', (0.14 + 0.58 * e).toFixed(3));
      }
    };
  };

  /* Eclipse — a page-sized, soft-edged shadow shrinks toward the corner as the moon
     transits; the edge sharpens, the outline arrives late, and in the final stretch the
     whole page flips to a negative (--ink/--paper swap) for a totality moment. The flip is
     suppressed in quiet mode (reduced-motion / short pages) so nobody is left on an inverted page. */
  ANIMS.eclipse = function () {
    var bigR = Math.min(W, H) * 0.62;
    var defs = mk('defs');
    var mask = mk('mask', { id: 'mkEclipse', maskUnits: 'userSpaceOnUse', x: -W, y: -H, width: 3 * W, height: 3 * H });
    var mw = mk('circle', { fill: '#fff' });
    var cut = mk('circle', { fill: '#000' });
    mask.appendChild(mw); mask.appendChild(cut); defs.appendChild(mask);
    var filt = mk('filter', { id: 'mkSoft', filterUnits: 'userSpaceOnUse', x: -W, y: -H, width: 3 * W, height: 3 * H });
    var gb = mk('feGaussianBlur', { stdDeviation: 0 });
    filt.appendChild(gb); defs.appendChild(filt); host.appendChild(defs);
    var g = mk('g', { filter: 'url(#mkSoft)' });
    var shadow = mk('circle', { mask: 'url(#mkEclipse)' }, { fill: 'var(--ink)' });
    g.appendChild(shadow); host.appendChild(g);
    var ring = mk('circle', null, stroke); host.appendChild(ring);
    return function (e) {
      var ccx = W / 2 + (cx - W / 2) * e, ccy = H / 2 + (cy - H / 2) * e, cr = bigR + (R - bigR) * e;
      [mw, shadow, ring].forEach(function (el) { el.setAttribute('cx', ccx.toFixed(1)); el.setAttribute('cy', ccy.toFixed(1)); el.setAttribute('r', cr.toFixed(1)); });
      cut.setAttribute('cx', (ccx - cr * (2.2 - 2.04 * e)).toFixed(1));
      cut.setAttribute('cy', (ccy - cr * (0.10 * e)).toFixed(1));
      cut.setAttribute('r', cr.toFixed(1));
      gb.setAttribute('stdDeviation', ((1 - e) * (1 - e) * 42).toFixed(1));
      shadow.setAttribute('opacity', (0.10 + 0.40 * e).toFixed(3));
      ring.setAttribute('opacity', Math.max(0, (e - 0.35) / 0.65).toFixed(3));
      var flip = quiet() ? 0 : Math.min(1, Math.max(0, (e - 0.85) / 0.15));
      root.style.setProperty('--ink', lerpCol(INK, PAPER, flip));
      root.style.setProperty('--paper', lerpCol(PAPER, INK, flip));
    };
  };

  /* Graticule — an aperture vortex of curved lines spins and pulls in; each line takes a
     role: five arcs close the outline, three form the meridians (one straight center line,
     two ellipses), five straighten into latitudes. Resolves into the graticule globe.
     Heaviest effect — redraws every path each frame. */
  ANIMS.graticule = function () {
    var K = 18, Rmax = 0.95 * Math.max(W, H), CURL = 3.6, AP = 0.05 * Rmax, TAN = 1.5;
    var roles = [
      { t: 'arc', a0: 0, a1: 2 * Math.PI / 5, w: 2.4 }, { t: 'arc', a0: 2 * Math.PI / 5, a1: 4 * Math.PI / 5, w: 2.4 },
      { t: 'arc', a0: 4 * Math.PI / 5, a1: 6 * Math.PI / 5, w: 2.4 }, { t: 'arc', a0: 6 * Math.PI / 5, a1: 8 * Math.PI / 5, w: 2.4 },
      { t: 'arc', a0: 8 * Math.PI / 5, a1: 2 * Math.PI, w: 2.4 },
      { t: 'vmer', w: 1.6 }, { t: 'ell', rx: 0.356, w: 1.6 }, { t: 'ell', rx: 0.689, w: 1.6 },
      { t: 'lat', m: 0, w: 1.5 }, { t: 'lat', m: 0.444, w: 1.4 }, { t: 'lat', m: -0.444, w: 1.4 }, { t: 'lat', m: 0.756, w: 1.4 }, { t: 'lat', m: -0.756, w: 1.4 }
    ];
    var N = roles.length, g = mk('g'), arms = [];
    host.appendChild(g);
    for (var i = 0; i < N; i++) {
      var role = roles[i], base = i * 2 * Math.PI / N, s = [], en = [];
      for (var k = 0; k < K; k++) {
        var tk = k / (K - 1), r = AP + tk * (Rmax - AP), ang = base + TAN + tk * CURL;
        s.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]);
        var ex, ey;
        if (role.t === 'arc') { var a = role.a0 + (role.a1 - role.a0) * tk; ex = cx + R * Math.cos(a); ey = cy + R * Math.sin(a); }
        else if (role.t === 'vmer') { ex = cx; ey = cy - R + 2 * R * tk; }
        else if (role.t === 'ell') { var th = -Math.PI / 2 + 2 * Math.PI * tk; ex = cx + role.rx * R * Math.cos(th); ey = cy + R * Math.sin(th); }
        else { var dy = role.m * R, fy = cy + dy, hw = Math.sqrt(Math.max(0, R * R - dy * dy)); ex = cx - hw + 2 * hw * tk; ey = fy; }
        en.push([ex, ey]);
      }
      var p = mk('path', null, { fill: 'none', stroke: 'var(--ink)', strokeWidth: role.w, strokeLinecap: 'round', strokeLinejoin: 'round' });
      g.appendChild(p); arms.push({ el: p, s: s, e: en });
    }
    return function (e) {
      var spin = (1 - e) * 2.2 * 180 / Math.PI;
      g.setAttribute('transform', 'rotate(' + spin.toFixed(2) + ' ' + cx + ' ' + cy + ')');
      arms.forEach(function (a) {
        var pts = [];
        for (var k = 0; k < K; k++) pts.push([a.s[k][0] + (a.e[k][0] - a.s[k][0]) * e, a.s[k][1] + (a.e[k][1] - a.s[k][1]) * e]);
        a.el.setAttribute('d', smoothPath(pts));
        a.el.setAttribute('opacity', (0.22 + 0.78 * e).toFixed(3));
      });
    };
  };

  var KEYS = Object.keys(ANIMS);
  function hash(s) { var h = 2166136261 >>> 0; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  function pick() { var key = host.getAttribute('data-issue') || location.pathname; return KEYS[hash(key) % KEYS.length]; }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function quiet() { return reduce || maxScroll < 260; }
  function progress() { return quiet() ? 1 : Math.min(1, Math.max(0, window.scrollY / maxScroll)); }
  function frame() { if (render) render(ease(progress())); ticking = false; }

  function build() {
    while (host.firstChild) host.removeChild(host.firstChild);
    if (narrow()) { render = null; return; }
    W = window.innerWidth; H = window.innerHeight;
    R = Math.max(54, Math.min(W, H) * 0.12); cx = W - R - 44; cy = H - R - 44;
    host.setAttribute('width', W); host.setAttribute('height', H); host.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    current = current || pick();
    render = ANIMS[current]();
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    host.style.opacity = quiet() ? '0.5' : '1';
    frame();
  }

  if (!reduce) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  }
  window.addEventListener('resize', build);
  build();
})();
