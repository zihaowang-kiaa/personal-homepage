/* A scroll-scrubbed visual passage between the home stage and the research rooms. */
(() => {
  "use strict";

  const scene = document.querySelector(".cosmic-depth");
  if (!scene || !window.CSS?.supports("transform", "translate3d(0, 0, 0)"))
    return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 760px)");
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smoothstep = (start, end, value) => {
    const t = clamp((value - start) / (end - start), 0, 1);
    return t * t * (3 - 2 * t);
  };
  let active = false;
  let frame = 0;
  const canvas = scene.querySelector(".depth-field");
  const context = canvas?.getContext("2d");

  // Recomputed paths at display resolution, never a scaled bitmap texture.
  function draw(progress) {
    if (!context) return;
    const box = canvas.getBoundingClientRect();
    const w = box.width, h = box.height;
    if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const c = context;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    const u = Math.min(w, h);
    const cx = w * (0.76 - progress * 0.12), cy = h * (0.51 - progress * 0.08);
    const radius = u * (0.33 + progress * 0.37);
    // Fine offset registration grid: architectural space behind the aperture.
    c.strokeStyle = "#efeae21b";
    c.lineWidth = 0.6;
    for (let i = -5; i < 15; i++) {
      const x = i * u * 0.16 + progress * u * 0.09;
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x - h * 0.16, h); c.stroke();
    }
    for (let i = 0; i < 9; i++) {
      const y = i * h / 8 - progress * h * 0.035;
      c.beginPath(); c.moveTo(w * 0.38, y); c.lineTo(w, y); c.stroke();
    }
    // Offset engraved contours, with intentional cuts and non-concentric orbits.
    c.save(); c.translate(cx, cy); c.rotate(-0.48 + progress * 0.95);
    for (let i = 0; i < 105; i++) {
      const f = i / 104;
      c.strokeStyle = i % 7 === 0 ? "#efeae2a8" : `rgba(189,52,44,${0.24 + f * 0.53})`;
      c.lineWidth = i % 7 === 0 ? 0.85 : 0.65;
      c.beginPath();
      for (let j = 0; j <= 220; j++) {
        const a = j / 220 * Math.PI * 2;
        const r = radius * (0.57 + f * 0.67 + 0.055 * Math.sin(a * 3 + f * 7 + progress * 2));
        const x = r * Math.cos(a) + Math.sin(f * 4) * radius * 0.08;
        const y = r * Math.sin(a) * (0.57 + 0.32 * f);
        if (j === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath(); c.stroke();
    }
    // Black cut-out creates a true occlusion rather than a glow effect.
    c.fillStyle = "#08090a";
    c.beginPath(); c.ellipse(0, 0, radius * 0.55, radius * 0.30, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#a6c7ce99"; c.lineWidth = 0.7;
    for (let i = 0; i < 18; i++) {
      c.beginPath();
      c.ellipse(radius * 0.05, 0, radius * (0.77 + i * 0.012), radius * 0.20, 1.15 + progress * 0.4, -0.4, Math.PI * 1.3);
      c.stroke();
    }
    c.restore();
    // Foreground slit crosses at a different speed: an optical printing / collage gesture.
    const slit = w * (0.88 - progress * 0.27);
    c.fillStyle = "#08090ae8";
    c.fillRect(slit, 0, Math.max(12, w * 0.024), h);
    c.fillStyle = "#efeae2";
    c.fillRect(slit - 2, h * 0.12, 1, h * 0.60);
    c.strokeStyle = "#efeae25c"; c.lineWidth = 0.8;
    for (let i = 0; i < 32; i++) {
      const y = h * (0.14 + i * 0.022);
      c.beginPath(); c.moveTo(slit + 15, y); c.lineTo(slit + (i % 4 === 0 ? 30 : 21), y); c.stroke();
    }
    scene.classList.add("depth-drawn");
  }

  function render() {
    frame = 0;
    if (!active || document.hidden) return;

    const rect = scene.getBoundingClientRect();
    const viewport = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewport) return;

    const travel = Math.max(1, rect.height - viewport);
    const progress = clamp(-rect.top / travel, 0, 1);
    draw(progress);
    const reveal = smoothstep(0, 0.24, progress);

    scene.style.setProperty("--depth-progress", progress.toFixed(4));
    scene.style.setProperty("--depth-frame-x", `${((1 - reveal) * 7).toFixed(2)}vw`);
    scene.style.setProperty("--depth-frame-y", `${((1 - reveal) * 8).toFixed(2)}vh`);
    scene.style.setProperty("--depth-title-y", `${(-progress * 18).toFixed(2)}px`);
    scene.style.setProperty("--depth-links-opacity", smoothstep(0.25, 0.65, progress).toFixed(4));
  }

  function schedule() {
    if (active && !document.hidden && !frame) frame = requestAnimationFrame(render);
  }

  function configure() {
    const next = !reducedMotion.matches &&
      (mobile.matches || root.classList.contains("parallax-ready"));
    if (next === active) { if (!active) draw(0.18); return; }
    active = next;
    root.classList.toggle("cosmic-depth-live", active);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (active) render();
    else { scene.style.cssText = ""; draw(0.18); }
  }

  new MutationObserver(configure).observe(root, {
    attributes: true,
    attributeFilter: ["class"],
  });
  reducedMotion.addEventListener("change", configure);
  mobile.addEventListener("change", configure);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => active ? schedule() : draw(0.18), { passive: true });
  window.addEventListener("pageshow", schedule);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) schedule();
  });
  configure();
  draw(0.18);
})();
