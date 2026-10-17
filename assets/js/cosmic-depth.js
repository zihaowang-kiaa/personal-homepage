/* Scroll through the architectural collage; no raster enlargement. */
(() => {
  'use strict';
  const scene = document.querySelector('.cosmic-depth');
  if (!scene) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  let active = false, frame = 0;
  function render() {
    frame = 0;
    if (!active || document.hidden) return;
    const r = scene.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
    scene.style.setProperty('--depth-progress', p.toFixed(4));
    scene.style.setProperty('--door-near', (1 + p * 1.65).toFixed(4));
    scene.style.setProperty('--door-mid', (1 + p * 0.7).toFixed(4));
    scene.style.setProperty('--door-far', (1 + p * 0.22).toFixed(4));
    scene.style.setProperty('--cutout-y', (-p * 65) + 'px');
    scene.style.setProperty('--depth-links-opacity', p.toFixed(4));
  }
  function schedule() {
    if (active && !document.hidden && !frame) frame = requestAnimationFrame(render);
  }
  function configure() {
    const next = !reduced.matches && (mobile.matches || root.classList.contains('parallax-ready'));
    if (active === next) return;
    active = next;
    root.classList.toggle('cosmic-depth-live', active);
    cancelAnimationFrame(frame); frame = 0;
    if (active) render(); else scene.style.cssText = '';
  }
  new MutationObserver(configure).observe(root, {attributes:true, attributeFilter:['class']});
  reduced.addEventListener('change', configure);
  mobile.addEventListener('change', configure);
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); frame = 0; schedule();
  });
  configure();
})();
