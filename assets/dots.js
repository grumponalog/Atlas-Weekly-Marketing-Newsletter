/* Atlas — scroll-driven dot field.
   Scattered dots on an even grid collect into the Atlas mark (a dense square-dot
   disc inside a fading-in ring) in the bottom-right corner as the reader scrolls.
   Guards: disabled under 1200px (CSS), honors prefers-reduced-motion, and holds a
   quiet static mark on pages too short to scroll. */
(function () {
  var field = document.getElementById('dotfield');
  var collector = document.getElementById('collector');
  if (!field || !collector) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = function () { return window.matchMedia && window.matchMedia('(max-width:1200px)').matches; };

  var dots = [], scatter = [], target = [], M = 0, cx, cy, R, maxScroll = 0;

  function build() {
    field.innerHTML = ''; dots = []; scatter = []; target = [];
    var W = window.innerWidth, H = window.innerHeight;
    R = Math.max(54, Math.min(W, H) * 0.12);
    cx = W - R - 44; cy = H - R - 44;
    collector.style.left = (cx - R) + 'px';
    collector.style.top = (cy - R) + 'px';
    collector.style.width = (2 * R) + 'px';
    collector.style.height = (2 * R) + 'px';

    var g = R * 0.16, lim = (R - 4) * (R - 4);
    for (var gy = -R; gy <= R + 0.1; gy += g) {
      for (var gx = -R; gx <= R + 0.1; gx += g) {
        if (gx * gx + gy * gy <= lim) target.push([cx + gx, cy + gy]);
      }
    }
    M = target.length;

    var cols = Math.max(1, Math.round(Math.sqrt(M * W / H))), rows = Math.ceil(M / cols);
    var mx = W * 0.07, my = H * 0.07, gw = (W - 2 * mx) / cols, gh = (H - 2 * my) / rows;
    for (var k = 0; k < M; k++) {
      var c = k % cols, r = Math.floor(k / cols);
      scatter.push([mx + (c + 0.5) * gw, my + (r + 0.5) * gh]);
      var d = document.createElement('div');
      d.className = 'dot';
      field.appendChild(d);
      dots.push(d);
    }
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    render();
  }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function quiet() { return reduce || maxScroll < 260; }

  function progress() {
    if (quiet()) return 1;
    return Math.min(1, Math.max(0, window.scrollY / maxScroll));
  }

  var ticking = false;
  function render() {
    var e = ease(progress());
    var q = quiet();
    collector.style.opacity = (q ? 0.14 : e).toFixed(3);
    var floor = 0.14, span = q ? 0 : 0.76;
    for (var i = 0; i < M; i++) {
      var x = scatter[i][0] + (target[i][0] - scatter[i][0]) * e;
      var y = scatter[i][1] + (target[i][1] - scatter[i][1]) * e;
      dots[i].style.transform = 'translate(' + (x - 2.5) + 'px,' + (y - 2.5) + 'px)';
      dots[i].style.opacity = (floor + span * e).toFixed(3);
    }
    ticking = false;
  }

  if (!reduce) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    }, { passive: true });
  }
  window.addEventListener('resize', build);
  build();
})();
