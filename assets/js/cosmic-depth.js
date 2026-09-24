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

  function render() {
    frame = 0;
    if (!active || document.hidden) return;

    const rect = scene.getBoundingClientRect();
    const viewport = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewport) return;

    const travel = Math.max(1, rect.height - viewport);
    const progress = clamp(-rect.top / travel, 0, 1);
    const reveal = smoothstep(0, 0.24, progress);
    const fadeForeground = smoothstep(0.48, 1, progress);

    scene.style.setProperty("--depth-progress", progress.toFixed(4));
    scene.style.setProperty("--depth-frame-x", `${((1 - reveal) * 7).toFixed(2)}vw`);
    scene.style.setProperty("--depth-frame-y", `${((1 - reveal) * 8).toFixed(2)}vh`);
    scene.style.setProperty("--depth-background-scale", (1 + progress * 0.78).toFixed(4));
    scene.style.setProperty("--depth-foreground-scale", (1 + progress * 1.35).toFixed(4));
    scene.style.setProperty("--depth-foreground-y", `${(-progress * 13).toFixed(2)}vh`);
    scene.style.setProperty("--depth-foreground-opacity", (1 - fadeForeground * 0.72).toFixed(4));
    scene.style.setProperty("--depth-title-y", `${(-progress * 18).toFixed(2)}px`);
    scene.style.setProperty("--depth-links-opacity", smoothstep(0.25, 0.65, progress).toFixed(4));
  }

  function schedule() {
    if (active && !document.hidden && !frame) frame = requestAnimationFrame(render);
  }

  function configure() {
    const next = !reducedMotion.matches &&
      (mobile.matches || root.classList.contains("parallax-ready"));
    if (next === active) return;
    active = next;
    root.classList.toggle("cosmic-depth-live", active);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (active) render();
    else scene.style.cssText = "";
  }

  new MutationObserver(configure).observe(root, {
    attributes: true,
    attributeFilter: ["class"],
  });
  reducedMotion.addEventListener("change", configure);
  mobile.addEventListener("change", configure);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) schedule();
  });
  configure();
})();
