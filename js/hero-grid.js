/**
 * Hero Section — Animated Data Connector Grid Background
 * Circuit-board style: signals travel along H/V grid paths with monetization popups.
 * Flat design. Self-contained IIFE, independent from existing Three.js code.
 */
(function () {
  'use strict';

  // ── CONFIG ────────────────────────────────────────────────────────────
  var CONFIG = {
    gridSpacing: 52,

    // Dots
    dotRadius: 1.2,
    dotOpacity: 0.10,

    // Grid lines
    lineOpacity: 0.04,
    lineWidth: 0.5,

    // Signals
    signalCount: 24,
    signalRadius: 2.5,
    signalOpacity: 0.55,
    signalSpeed: 1.2,           // nodes per second
    trailFadeTime: 1.2,         // seconds for trail segment to fade
    trailOpacity: 0.18,
    signalMaxLife: 25,          // max nodes before respawn

    // Money popups
    moneyChance: 0.12,
    moneyFont: '9px "JetBrains Mono", monospace',
    moneyMaxOpacity: 0.30,
    moneyDuration: 2.5,         // seconds
    moneyFloatDist: 14,         // px upward float
    moneyMaxActive: 15,

    // Vignette
    vignetteStart: 0.35,

    // Performance
    maxDPR: 2,
    resizeDebounce: 200,
    exclusionPadding: 30
  };

  // ── COLORS (dark mode only) ────────────────────────────────────────────
  var theme = {
    colorDot: '59, 130, 246',
    colorLine: '59, 130, 246',
    colorSignal: '96, 165, 250',
    colorMoney: '74, 222, 128',
    vignetteBg: '10, 10, 11',
    vignetteAlpha: 0.85
  };

  // ── STATE ─────────────────────────────────────────────────────────────
  var canvas, ctx, W, H, dpr;
  var gridRows = 0, gridCols = 0;
  var grid = [];        // 2D array: grid[row][col] = {x,y} or null
  var signals = [];
  var popups = [];
  var animId = null;
  var visible = true;
  var reducedMotion = false;
  var zone = null;
  var prevTime = 0;

  var MONEY_VALUES = [
    '+$0.0001', '+$0.0003', '+$0.0006', '+$0.0008',
    '+$0.0012', '+$0.0024', '+$0.0048', '+$0.0096'
  ];

  // ── HELPERS ───────────────────────────────────────────────────────────
  function rand(a, b) { return a + Math.random() * (b - a); }

  function inZone(x, y) {
    return zone && x >= zone.x && x <= zone.x + zone.w &&
                   y >= zone.y && y <= zone.y + zone.h;
  }

  function measureZone() {
    var el = canvas.parentElement.querySelector('.hero-content');
    if (!el) { zone = null; return; }
    var hr = canvas.parentElement.getBoundingClientRect();
    var cr = el.getBoundingClientRect();
    var p = CONFIG.exclusionPadding;
    zone = {
      x: cr.left - hr.left - p,
      y: cr.top - hr.top - p,
      w: cr.width + p * 2,
      h: cr.height + p * 2
    };
  }

  function nd(r, c) {
    if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) return null;
    return grid[r] ? grid[r][c] : null;
  }

  // ── GENERATION ────────────────────────────────────────────────────────
  function generate() {
    grid = [];
    signals = [];
    popups = [];
    measureZone();

    var sp = CONFIG.gridSpacing;
    gridCols = Math.ceil(W / sp) + 1;
    gridRows = Math.ceil(H / sp) + 1;
    var ox = (W - (gridCols - 1) * sp) / 2;
    var oy = (H - (gridRows - 1) * sp) / 2;

    for (var r = 0; r < gridRows; r++) {
      grid[r] = [];
      for (var c = 0; c < gridCols; c++) {
        var x = ox + c * sp, y = oy + r * sp;
        grid[r][c] = inZone(x, y) ? null : { x: x, y: y };
      }
    }

    for (var s = 0; s < CONFIG.signalCount; s++) spawn();
  }

  // ── SIGNALS ───────────────────────────────────────────────────────────
  function spawn() {
    var n = null, r, c, tries = 0;
    while (!n && tries < 100) {
      r = Math.floor(Math.random() * gridRows);
      c = Math.floor(Math.random() * gridCols);
      n = nd(r, c);
      tries++;
    }
    if (!n) return;

    // Pick a valid initial direction
    var DIRS = [[0,1],[0,-1],[1,0],[-1,0]];
    var valid = [];
    for (var i = 0; i < 4; i++) {
      if (nd(r + DIRS[i][0], c + DIRS[i][1])) valid.push(DIRS[i]);
    }
    if (!valid.length) return;

    var d = valid[Math.floor(Math.random() * valid.length)];
    signals.push({
      r: r, c: c,
      tr: r + d[0], tc: c + d[1],
      p: Math.random(),
      spd: rand(CONFIG.signalSpeed * 0.7, CONFIG.signalSpeed * 1.4),
      dr: d[0], dc: d[1],
      trail: [],
      life: Math.floor(rand(12, CONFIG.signalMaxLife))
    });
  }

  function stepSignal(sig, dt) {
    sig.p += sig.spd * dt;
    if (sig.p < 1) return true;

    // Arrived at target node
    sig.p = 0;
    sig.life--;

    // Record trail segment
    sig.trail.push({ fr: sig.r, fc: sig.c, tr: sig.tr, tc: sig.tc, age: 0 });

    // Advance position
    sig.r = sig.tr;
    sig.c = sig.tc;

    // Maybe spawn money popup
    var n = nd(sig.r, sig.c);
    if (n && Math.random() < CONFIG.moneyChance && popups.length < CONFIG.moneyMaxActive) {
      popups.push({
        x: n.x, y: n.y,
        val: MONEY_VALUES[Math.floor(Math.random() * MONEY_VALUES.length)],
        age: 0
      });
    }

    // Pick next direction — prefer straight (weight 3) over turns (weight 1)
    var choices = [];
    var straight = nd(sig.r + sig.dr, sig.c + sig.dc);
    if (straight) choices.push({ dr: sig.dr, dc: sig.dc, w: 3 });

    // Perpendicular directions
    if (sig.dr === 0) {
      // Moving horizontally → can turn vertically
      if (nd(sig.r + 1, sig.c)) choices.push({ dr: 1, dc: 0, w: 1 });
      if (nd(sig.r - 1, sig.c)) choices.push({ dr: -1, dc: 0, w: 1 });
    } else {
      // Moving vertically → can turn horizontally
      if (nd(sig.r, sig.c + 1)) choices.push({ dr: 0, dc: 1, w: 1 });
      if (nd(sig.r, sig.c - 1)) choices.push({ dr: 0, dc: -1, w: 1 });
    }

    if (!choices.length || sig.life <= 0) return false;

    // Weighted random pick
    var tw = 0;
    for (var i = 0; i < choices.length; i++) tw += choices[i].w;
    var pick = Math.random() * tw, cum = 0, ch = choices[0];
    for (var j = 0; j < choices.length; j++) {
      cum += choices[j].w;
      if (pick <= cum) { ch = choices[j]; break; }
    }

    sig.dr = ch.dr;
    sig.dc = ch.dc;
    sig.tr = sig.r + ch.dr;
    sig.tc = sig.c + ch.dc;
    return true;
  }

  // ── DRAWING ───────────────────────────────────────────────────────────
  function draw(time) {
    var dt = Math.min((time - prevTime) / 1000, 0.1);
    prevTime = time;
    ctx.clearRect(0, 0, W, H);

    // Grid lines (batched)
    ctx.beginPath();
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.strokeStyle = 'rgba(' + theme.colorLine + ',' + CONFIG.lineOpacity + ')';
    for (var r = 0; r < gridRows; r++) {
      for (var c = 0; c < gridCols; c++) {
        var n = nd(r, c);
        if (!n) continue;
        var right = nd(r, c + 1);
        if (right) { ctx.moveTo(n.x, n.y); ctx.lineTo(right.x, right.y); }
        var down = nd(r + 1, c);
        if (down) { ctx.moveTo(n.x, n.y); ctx.lineTo(down.x, down.y); }
      }
    }
    ctx.stroke();

    // Grid dots (batched)
    ctx.beginPath();
    ctx.fillStyle = 'rgba(' + theme.colorDot + ',' + CONFIG.dotOpacity + ')';
    for (var r2 = 0; r2 < gridRows; r2++) {
      for (var c2 = 0; c2 < gridCols; c2++) {
        var n2 = nd(r2, c2);
        if (!n2) continue;
        ctx.moveTo(n2.x + CONFIG.dotRadius, n2.y);
        ctx.arc(n2.x, n2.y, CONFIG.dotRadius, 0, Math.PI * 2);
      }
    }
    ctx.fill();

    // Update & draw signals
    for (var s = signals.length - 1; s >= 0; s--) {
      var sig = signals[s];

      if (!reducedMotion) {
        if (!stepSignal(sig, dt)) {
          signals.splice(s, 1);
          spawn();
          continue;
        }
      }

      var fromN = nd(sig.r, sig.c);
      var toN = nd(sig.tr, sig.tc);
      if (!fromN || !toN) continue;

      // Fade & clean old trail segments
      for (var t = sig.trail.length - 1; t >= 0; t--) {
        var seg = sig.trail[t];
        seg.age += dt;
        if (seg.age > CONFIG.trailFadeTime) { sig.trail.splice(t, 1); continue; }
        var sf = nd(seg.fr, seg.fc), st = nd(seg.tr, seg.tc);
        if (!sf || !st) continue;
        var a = CONFIG.trailOpacity * (1 - seg.age / CONFIG.trailFadeTime);
        ctx.beginPath();
        ctx.moveTo(sf.x, sf.y);
        ctx.lineTo(st.x, st.y);
        ctx.strokeStyle = 'rgba(' + theme.colorSignal + ',' + a + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Current segment lit trail (node → signal head)
      var sx = fromN.x + (toN.x - fromN.x) * sig.p;
      var sy = fromN.y + (toN.y - fromN.y) * sig.p;
      ctx.beginPath();
      ctx.moveTo(fromN.x, fromN.y);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = 'rgba(' + theme.colorSignal + ',' + CONFIG.trailOpacity + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Signal head (flat circle)
      ctx.beginPath();
      ctx.arc(sx, sy, CONFIG.signalRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + theme.colorSignal + ',' + CONFIG.signalOpacity + ')';
      ctx.fill();
    }

    // Money popups
    ctx.font = CONFIG.moneyFont;
    for (var m = popups.length - 1; m >= 0; m--) {
      var pop = popups[m];
      pop.age += dt;
      if (pop.age >= CONFIG.moneyDuration) { popups.splice(m, 1); continue; }
      var prog = pop.age / CONFIG.moneyDuration;
      var fadeIn = Math.min(1, pop.age / 0.3);
      var fadeOut = pop.age > CONFIG.moneyDuration - 0.5
        ? (CONFIG.moneyDuration - pop.age) / 0.5 : 1;
      var alpha = CONFIG.moneyMaxOpacity * Math.max(0, fadeIn * fadeOut);
      ctx.fillStyle = 'rgba(' + theme.colorMoney + ',' + alpha + ')';
      ctx.fillText(pop.val, pop.x + 8, pop.y - 8 - CONFIG.moneyFloatDist * prog);
    }

    // Vignette
    var cx = W / 2, cy = H / 2;
    var maxR = Math.sqrt(cx * cx + cy * cy);
    var g = ctx.createRadialGradient(cx, cy, maxR * CONFIG.vignetteStart, cx, cy, maxR);
    g.addColorStop(0, 'rgba(' + theme.vignetteBg + ',0)');
    g.addColorStop(1, 'rgba(' + theme.vignetteBg + ',' + theme.vignetteAlpha + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // ── RESIZE ────────────────────────────────────────────────────────────
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      sizeCanvas();
      generate();
      if (reducedMotion) draw(0);
    }, CONFIG.resizeDebounce);
  }

  function sizeCanvas() {
    var r = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR);
    W = r.width;
    H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ── LOOP ──────────────────────────────────────────────────────────────
  function loop(t) {
    if (!visible) { animId = null; return; }
    draw(t);
    animId = requestAnimationFrame(loop);
  }
  function start() { if (!animId) animId = requestAnimationFrame(loop); }
  function stop() { if (animId) { cancelAnimationFrame(animId); animId = null; } }

  // ── INIT ──────────────────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('hero-grid-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mq.matches;
    if (mq.addEventListener) {
      mq.addEventListener('change', function (e) {
        reducedMotion = e.matches;
        if (reducedMotion) { stop(); draw(0); } else start();
      });
    }

    sizeCanvas();
    generate();
    if (reducedMotion) draw(0); else start();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !reducedMotion) start(); else stop();
      }, { threshold: 0.05 }).observe(canvas.parentElement);
    }

    window.addEventListener('resize', onResize);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
