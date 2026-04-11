/* ============================================================
   Minimal JS — number animation + smooth interactions
   ============================================================ */

(function () {
  'use strict';

  // ---- Animate numbers on first view ----

  function animateValue(el, start, end, duration, isDecimal) {
    const startTime = performance.now();
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (isDecimal) {
        el.textContent = prefix + current.toFixed(2) + suffix;
      } else {
        el.textContent = prefix + Math.round(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Ensure final value is exact
        el.textContent = prefix + (isDecimal ? end.toFixed(2) : end) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function initMetricAnimations() {
    const metrics = document.querySelectorAll('.metric-value[data-target]');
    if (!metrics.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseFloat(el.dataset.target);
            const isDecimal = el.dataset.target.includes('.');
            animateValue(el, 0, target, 600, isDecimal);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    metrics.forEach((m) => {
      m.textContent = m.dataset.prefix || '';
      observer.observe(m);
    });
  }

  // ---- Smooth scroll for anchor links ----

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---- Active nav state ----

  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === '#' + id
              );
            });
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // ---- Dark mode toggle ----

  function initDarkMode() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    function updateLabel() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      toggle.textContent = isDark ? 'Light' : 'Dark';
    }

    updateLabel();

    toggle.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateLabel();
    });
  }

  // ---- Monte Carlo Simulation Fan ----

  function initMonteCarloFan() {
    const canvas = document.getElementById('gbm-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Simulation parameters
    const NUM_PATHS = 150;
    const NUM_STEPS = 200;
    const MU = 0.0003;
    const SIGMA = 0.025;
    const PATH_OPACITY = 0.07;
    const PATH_WIDTH = 0.6;

    let rawPaths = [];    // normalized price paths (start at 1.0)
    let medianPath = [];
    let var5Path = [];
    let cvar1Path = [];
    let canvasW = 0;
    let canvasH = 0;
    let paused = false;
    let animProgress = 0;
    let animId = null;
    let mouseX = null;

    function getCSSColor(prop, fallback) {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(prop).trim() || fallback;
    }

    function resize() {
      var wrapper = canvas.parentElement;
      var rect = wrapper.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvasW = rect.width;
      canvasH = rect.height;
    }

    function boxMuller() {
      var u1 = Math.random();
      var u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    function simulate() {
      rawPaths = [];
      var drift = MU - (SIGMA * SIGMA) / 2;

      for (var i = 0; i < NUM_PATHS; i++) {
        var path = new Float64Array(NUM_STEPS);
        path[0] = 1.0;
        for (var t = 1; t < NUM_STEPS; t++) {
          path[t] = path[t - 1] * Math.exp(drift + SIGMA * boxMuller());
        }
        rawPaths.push(path);
      }

      // Compute percentile paths (normalized)
      medianPath = new Float64Array(NUM_STEPS);
      var5Path = new Float64Array(NUM_STEPS);
      cvar1Path = new Float64Array(NUM_STEPS);

      var vals = new Float64Array(NUM_PATHS);
      for (var t = 0; t < NUM_STEPS; t++) {
        for (var i = 0; i < NUM_PATHS; i++) {
          vals[i] = rawPaths[i][t];
        }
        vals.sort();
        medianPath[t] = vals[Math.floor(NUM_PATHS * 0.5)];
        var5Path[t] = vals[Math.floor(NUM_PATHS * 0.05)];
        cvar1Path[t] = vals[Math.floor(NUM_PATHS * 0.01)];
      }
    }

    // Map normalized price (around 1.0) to canvas Y
    // Center of canvas = 1.0, spread fills ~70% of height
    function priceToY(price) {
      var centerY = canvasH * 0.5;
      var scale = canvasH * 0.7;
      // log scale: deviation from 1.0
      return centerY - (price - 1.0) * scale;
    }

    function draw() {
      ctx.clearRect(0, 0, canvasW, canvasH);

      var maxStep = Math.floor(animProgress * (NUM_STEPS - 1));
      if (maxStep < 1) return;

      var xStep = canvasW / (NUM_STEPS - 1);
      var accent = getCSSColor('--color-accent', '#1a5c6b');
      var gbmColor = getCSSColor('--color-gbm', '#7850a0');
      var ruleColor = getCSSColor('--color-rule-light', '#e0dcd4');

      // Draw faint simulation paths
      ctx.lineWidth = PATH_WIDTH;
      ctx.strokeStyle = gbmColor;

      for (var i = 0; i < NUM_PATHS; i++) {
        ctx.globalAlpha = PATH_OPACITY;
        ctx.beginPath();
        ctx.moveTo(0, priceToY(rawPaths[i][0]));
        for (var t = 1; t <= maxStep; t++) {
          ctx.lineTo(t * xStep, priceToY(rawPaths[i][t]));
        }
        ctx.stroke();
      }

      // Median line — same accent, slightly stronger
      drawOverlayLine(medianPath, gbmColor, [], 1.5, 0.35, maxStep, xStep);
      // VaR 5% — use the rule/muted color
      drawOverlayLine(var5Path, ruleColor, [5, 4], 1.0, 0.45, maxStep, xStep);
      // CVaR 1%
      drawOverlayLine(cvar1Path, ruleColor, [2, 3], 0.8, 0.35, maxStep, xStep);

      // Mouse hover: time-slice
      if (mouseX !== null && mouseX >= 0 && mouseX <= canvasW) {
        var sliceT = Math.round(mouseX / xStep);
        if (sliceT >= 0 && sliceT <= maxStep) {
          drawTimeSlice(sliceT, xStep, accent, ruleColor);
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    function drawOverlayLine(path, color, dash, lineW, alpha, maxStep, xStep) {
      // Subtle glow
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW + 3;
      ctx.globalAlpha = alpha * 0.2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.setLineDash(dash);
      ctx.moveTo(0, priceToY(path[0]));
      for (var t = 1; t <= maxStep; t++) {
        ctx.lineTo(t * xStep, priceToY(path[t]));
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Solid
      ctx.beginPath();
      ctx.lineWidth = lineW;
      ctx.globalAlpha = alpha;
      ctx.moveTo(0, priceToY(path[0]));
      for (var t = 1; t <= maxStep; t++) {
        ctx.lineTo(t * xStep, priceToY(path[t]));
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawTimeSlice(sliceT, xStep, accent, ruleColor) {
      var x = sliceT * xStep;
      var textColor = getCSSColor('--color-text-tertiary', '#888');

      // Vertical line
      ctx.beginPath();
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasH);
      ctx.stroke();
      ctx.setLineDash([]);

      var tickW = 10;

      // Median tick
      ctx.beginPath();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      var my = priceToY(medianPath[sliceT]);
      ctx.moveTo(x - tickW / 2, my);
      ctx.lineTo(x + tickW / 2, my);
      ctx.stroke();

      // VaR tick
      ctx.beginPath();
      ctx.strokeStyle = ruleColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      var vy = priceToY(var5Path[sliceT]);
      ctx.moveTo(x - tickW / 2, vy);
      ctx.lineTo(x + tickW / 2, vy);
      ctx.stroke();

      // CVaR tick
      var cy = priceToY(cvar1Path[sliceT]);
      ctx.moveTo(x - tickW / 2, cy);
      ctx.lineTo(x + tickW / 2, cy);
      ctx.stroke();

      // Labels
      ctx.globalAlpha = 0.45;
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = accent;
      ctx.fillText('P50', x + tickW / 2 + 3, my + 3);
      ctx.fillStyle = textColor;
      ctx.fillText('VaR', x + tickW / 2 + 3, vy + 3);
      ctx.fillText('CVaR', x + tickW / 2 + 3, cy + 3);
    }

    function loop() {
      if (!paused && animProgress < 1) {
        animProgress = Math.min(1, animProgress + 0.006);
      }
      draw();
      animId = requestAnimationFrame(loop);
    }

    // Pause when off-screen
    var visObserver = new IntersectionObserver(
      function (entries) { paused = !entries[0].isIntersecting; },
      { threshold: 0 }
    );
    visObserver.observe(canvas.parentElement);

    // Mouse interaction
    canvas.style.pointerEvents = 'auto';
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
    });
    canvas.addEventListener('mouseleave', function () {
      mouseX = null;
    });

    // Init
    resize();
    simulate();
    animId = requestAnimationFrame(loop);

    window.addEventListener('resize', function () {
      resize();
      simulate();
      animProgress = 1;
    });
  }

  // ---- Init ----

  document.addEventListener('DOMContentLoaded', function () {
    initDarkMode();
    initMetricAnimations();
    initSmoothScroll();
    initActiveNav();
    initMonteCarloFan();
  });
})();
