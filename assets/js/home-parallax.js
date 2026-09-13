/* Event-driven scroll depth. Never replaces the original canvas mouse handlers. */
(() => {
  "use strict";

  if (!window.CSS?.supports("translate", "0 1px")) return;
  const scenes = [...document.querySelectorAll("[data-parallax-scene]")].map(
    (root) => ({
      root,
      hero: root.dataset.parallaxScene === "hero",
      layers: [root, ...root.querySelectorAll("[data-parallax-depth]")]
        .filter((node) => node.hasAttribute("data-parallax-depth"))
        .map((node) => ({
          node,
          depth: Number(node.dataset.parallaxDepth) || 0,
          limit: Math.max(0, Number(node.dataset.parallaxLimit) || 28),
        })),
    }),
  );
  if (!scenes.length) return;

  const media = window.matchMedia(
    "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
  );
  const control = document.querySelector(".parallax-control");
  const stateLabel = control?.querySelector("[data-parallax-state]");
  let userPaused = false;
  let enabled = false;
  let frame = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function render() {
    frame = 0;
    if (!enabled || document.hidden) return;
    const viewport = window.innerHeight;
    // Read stable scene bounds before any writes: no transformed-bound feedback.
    const measures = scenes.map((scene) => ({
      scene,
      rect: scene.root.getBoundingClientRect(),
    }));
    for (const { scene, rect } of measures) {
      const visible = rect.bottom > -160 && rect.top < viewport + 160;
      scene.root.toggleAttribute("data-parallax-active", visible);
      if (!visible) continue;
      const travel = scene.hero
        ? clamp(-rect.top, 0, rect.height)
        : viewport / 2 - (rect.top + rect.height / 2);
      for (const { node, depth, limit } of scene.layers) {
        const offset = clamp(travel * depth, -limit, limit);
        node.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      }
    }
  }

  function schedule() {
    if (enabled && !document.hidden && !frame) {
      frame = window.requestAnimationFrame(render);
    }
  }

  function cancelFrame() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  function configure() {
    enabled = media.matches && !userPaused;
    document.documentElement.classList.toggle("parallax-ready", enabled);
    if (control) {
      control.hidden = !media.matches;
      control.setAttribute("aria-pressed", String(enabled));
    }
    if (stateLabel) stateLabel.textContent = enabled ? "On" : "Off";
    cancelFrame();
    if (enabled) render();
    else {
      for (const { root, layers } of scenes) {
        root.removeAttribute("data-parallax-active");
        for (const { node } of layers)
          node.style.removeProperty("--parallax-y");
      }
    }
  }

  control?.addEventListener("click", () => {
    userPaused = !userPaused;
    configure();
  });
  // One frame per scroll burst, no idle animation loop or intercepted scrolling.
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);
  window.addEventListener("load", schedule, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelFrame();
    else schedule();
  });
  media.addEventListener("change", configure);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(schedule);
    scenes.forEach(({ root }) => observer.observe(root));
  }
  configure();
})();
