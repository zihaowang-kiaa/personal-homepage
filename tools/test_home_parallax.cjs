"use strict";

const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = readFileSync(
  path.join(__dirname, "../assets/js/home-parallax.js"),
  "utf8",
);

class EventTargetMock {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, callback, options) {
    const listeners = this.listeners.get(type) || [];
    listeners.push({ callback, options });
    this.listeners.set(type, listeners);
  }

  dispatch(type) {
    const listeners = [...(this.listeners.get(type) || [])];
    for (const listener of listeners) {
      listener.callback({ type, target: this, matches: this.matches });
      if (listener.options?.once) {
        this.listeners.set(
          type,
          this.listeners.get(type).filter((item) => item !== listener),
        );
      }
    }
  }
}

function element(dataset = {}, rect = {}, log = []) {
  const node = new EventTargetMock();
  const attributes = new Map(
    Object.entries(dataset).map(([key, value]) => [
      `data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
      String(value),
    ]),
  );
  const properties = new Map();
  const classes = new Set();
  Object.assign(node, {
    dataset,
    children: [],
    hidden: false,
    textContent: "",
    rect: { top: 0, height: 200, ...rect },
    reads: 0,
    style: {
      setProperty(name, value) {
        log.push("write");
        properties.set(name, value);
      },
      removeProperty(name) {
        log.push("write");
        properties.delete(name);
      },
      getPropertyValue(name) {
        return properties.get(name) || "";
      },
    },
    classList: {
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
    hasAttribute(name) {
      return attributes.has(name);
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    toggleAttribute(name, enabled) {
      if (enabled) attributes.set(name, "");
      else attributes.delete(name);
    },
    querySelectorAll(selector) {
      assert.equal(selector, "[data-parallax-depth]");
      return this.children;
    },
    getBoundingClientRect() {
      log.push("read");
      this.reads += 1;
      return { ...this.rect, bottom: this.rect.top + this.rect.height };
    },
  });
  return node;
}

function setup(options = {}) {
  const log = [];
  const hero = element({ parallaxScene: "hero" }, { height: 820 }, log);
  const background = element(
    { parallaxDepth: "0.24", parallaxLimit: "120" },
    {},
    log,
  );
  const ground = element(
    { parallaxDepth: "-0.1", parallaxLimit: "64" },
    {},
    log,
  );
  hero.children = [background, ground];
  const image = element(
    {
      parallaxScene: "image",
      parallaxDepth: "0.14",
      parallaxLimit: "28",
    },
    { top: 300, height: 200 },
    log,
  );
  const scenes = options.noScenes ? [] : [hero, image];
  const control = element();
  control.hidden = true;
  const label = element();
  control.querySelector = (selector) => {
    assert.equal(selector, "[data-parallax-state]");
    return label;
  };
  const document = new EventTargetMock();
  document.hidden = Boolean(options.hidden);
  document.documentElement = element();
  document.querySelectorAll = (selector) => {
    assert.equal(selector, "[data-parallax-scene]");
    return scenes;
  };
  document.querySelector = (selector) => {
    assert.equal(selector, ".parallax-control");
    return options.noControl ? null : control;
  };

  const media = new EventTargetMock();
  media.matches = options.mediaMatches ?? true;
  const window = new EventTargetMock();
  const originalResize = () => {};
  const originalMousemove = () => {};
  const originalMouseout = () => {};
  const pending = new Map();
  const canceled = [];
  let nextFrame = 0;
  window.innerHeight = 800;
  window.onresize = originalResize;
  window.onmousemove = originalMousemove;
  window.onmouseout = originalMouseout;
  window.CSS = {
    supports(property, value) {
      assert.equal(property, "translate");
      assert.equal(value, "0 1px");
      return options.supportsTranslate ?? true;
    },
  };
  window.matchMedia = (query) => {
    assert.equal(
      query,
      "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
    );
    return media;
  };
  window.requestAnimationFrame = (callback) => {
    const id = ++nextFrame;
    pending.set(id, callback);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    canceled.push(id);
    pending.delete(id);
  };
  const observers = [];
  class ResizeObserverMock {
    constructor(callback) {
      this.callback = callback;
      this.observed = [];
      observers.push(this);
    }

    observe(node) {
      this.observed.push(node);
    }
  }
  if (options.resizeObserver) window.ResizeObserver = ResizeObserverMock;

  vm.runInNewContext(
    source,
    { window, document, ResizeObserver: ResizeObserverMock },
    { filename: "home-parallax.js" },
  );

  return {
    window,
    document,
    media,
    hero,
    background,
    ground,
    image,
    control,
    label,
    pending,
    canceled,
    observers,
    log,
    originalResize,
    originalMousemove,
    originalMouseout,
    offset(node) {
      return node.style.getPropertyValue("--parallax-y");
    },
    flush() {
      const current = [...pending.entries()];
      pending.clear();
      current.forEach(([, callback]) => callback(100));
    },
    scroll() {
      window.dispatch("scroll");
      this.flush();
    },
    setMedia(matches) {
      media.matches = matches;
      media.dispatch("change");
    },
  };
}

test("hero layers use signed scroll depth and individual limits", () => {
  const env = setup();
  assert.equal(env.offset(env.background), "0.00px");
  assert.equal(env.offset(env.ground), "0.00px");
  env.hero.rect.top = -200;
  env.scroll();
  assert.equal(env.offset(env.background), "48.00px");
  assert.equal(env.offset(env.ground), "-20.00px");
  env.hero.rect.top = -800;
  env.scroll();
  assert.equal(env.offset(env.background), "120.00px");
  assert.equal(env.offset(env.ground), "-64.00px");
  env.hero.rect.top = 30;
  env.scroll();
  assert.equal(env.offset(env.background), "0.00px");
  assert.equal(env.offset(env.ground), "0.00px");
});

test("image offset tracks its stationary frame center and clamps both directions", () => {
  const env = setup();
  assert.equal(env.offset(env.image), "0.00px");
  env.image.rect.top = 400;
  env.scroll();
  assert.equal(env.offset(env.image), "-14.00px");
  env.image.rect.top = 900;
  env.scroll();
  assert.equal(env.offset(env.image), "-28.00px");
  env.image.rect.top = -100;
  env.scroll();
  assert.equal(env.offset(env.image), "28.00px");
  assert.equal(env.image.hasAttribute("data-parallax-active"), true);
});

test("offscreen scenes lose their active hint and skip style writes", () => {
  const env = setup();
  env.image.rect.top = 500;
  env.scroll();
  const previous = env.offset(env.image);
  env.image.rect.top = 961;
  env.scroll();
  assert.equal(env.image.hasAttribute("data-parallax-active"), false);
  assert.equal(env.offset(env.image), previous);
  env.image.rect.top = 300;
  env.scroll();
  assert.equal(env.image.hasAttribute("data-parallax-active"), true);
  assert.equal(env.offset(env.image), "0.00px");
});

test("scroll/resize bursts coalesce into one frame and do not start an idle loop", () => {
  const env = setup();
  assert.equal(env.pending.size, 0);
  const reads = env.hero.reads;
  for (let index = 0; index < 20; index += 1) {
    env.window.dispatch("scroll");
    env.window.dispatch("resize");
  }
  assert.equal(env.pending.size, 1);
  assert.equal(env.hero.reads, reads);
  env.flush();
  assert.equal(env.hero.reads, reads + 1);
  assert.equal(env.pending.size, 0);
  env.flush();
  assert.equal(env.hero.reads, reads + 1);
  assert.equal(env.window.listeners.get("scroll")[0].options.passive, true);
  assert.equal(env.window.listeners.get("resize")[0].options.passive, true);
});

test("all stable scene bounds are read before any layer style is written", () => {
  const env = setup();
  env.log.length = 0;
  env.scroll();
  assert.deepEqual(env.log, ["read", "read", "write", "write", "write"]);
});

for (const preference of ["mobile viewport", "reduced motion"]) {
  test(`${preference} media change cancels work and resets every layer`, () => {
    const env = setup();
    env.hero.rect.top = -200;
    env.scroll();
    env.window.dispatch("scroll");
    assert.equal(env.pending.size, 1);
    // Both conditions disable the controller's combined matchMedia query.
    env.setMedia(false);
    assert.equal(env.pending.size, 0);
    assert.equal(env.canceled.length, 1);
    assert.equal(
      env.document.documentElement.classList.contains("parallax-ready"),
      false,
    );
    for (const node of [env.background, env.ground, env.image]) {
      assert.equal(env.offset(node), "");
    }
    for (const scene of [env.hero, env.image]) {
      assert.equal(scene.hasAttribute("data-parallax-active"), false);
    }
    assert.equal(env.control.hidden, true);
    assert.equal(env.control.getAttribute("aria-pressed"), "false");
    assert.equal(env.label.textContent, "Off");
    env.window.dispatch("scroll");
    assert.equal(env.pending.size, 0);
    env.setMedia(true);
    assert.equal(env.control.hidden, false);
    assert.equal(env.control.getAttribute("aria-pressed"), "true");
    assert.equal(env.offset(env.background), "48.00px");
    assert.equal(env.pending.size, 0);
  });
}

test("disabled initial preference leaves the page static until the media matches", () => {
  const env = setup({ mediaMatches: false });
  assert.equal(env.hero.reads, 0);
  assert.equal(env.offset(env.background), "");
  assert.equal(env.control.hidden, true);
  env.window.dispatch("pageshow");
  assert.equal(env.pending.size, 0);
  env.setMedia(true);
  assert.equal(env.hero.reads, 1);
  assert.equal(env.control.hidden, false);
});

test("manual control resets offsets, keeps itself available, and persists across media changes", () => {
  const env = setup();
  env.hero.rect.top = -200;
  env.scroll();
  env.control.dispatch("click");
  assert.equal(env.control.hidden, false);
  assert.equal(env.control.getAttribute("aria-pressed"), "false");
  assert.equal(env.label.textContent, "Off");
  assert.equal(env.offset(env.background), "");
  env.setMedia(false);
  env.setMedia(true);
  assert.equal(env.control.hidden, false);
  assert.equal(env.control.getAttribute("aria-pressed"), "false");
  assert.equal(
    env.document.documentElement.classList.contains("parallax-ready"),
    false,
  );
  env.control.dispatch("click");
  assert.equal(env.control.getAttribute("aria-pressed"), "true");
  assert.equal(env.label.textContent, "On");
  assert.equal(env.offset(env.background), "48.00px");
});

test("a hidden document cancels scheduled work and resumes once on visibility", () => {
  const env = setup();
  env.window.dispatch("scroll");
  env.document.hidden = true;
  env.document.dispatch("visibilitychange");
  assert.equal(env.pending.size, 0);
  assert.equal(env.canceled.length, 1);
  const reads = env.hero.reads;
  env.window.dispatch("scroll");
  env.window.dispatch("resize");
  env.window.dispatch("pageshow");
  assert.equal(env.pending.size, 0);
  env.flush();
  assert.equal(env.hero.reads, reads);
  env.hero.rect.top = -100;
  env.document.hidden = false;
  env.document.dispatch("visibilitychange");
  assert.equal(env.pending.size, 1);
  env.flush();
  assert.equal(env.offset(env.background), "24.00px");
  assert.equal(env.pending.size, 0);
});

test("initially hidden documents do not measure or animate", () => {
  const env = setup({ hidden: true });
  assert.equal(env.hero.reads, 0);
  assert.equal(env.pending.size, 0);
  env.document.hidden = false;
  env.document.dispatch("visibilitychange");
  env.flush();
  assert.equal(env.hero.reads, 1);
});

test("original background-line window handlers are preserved", () => {
  const env = setup();
  env.window.dispatch("resize");
  env.flush();
  env.control.dispatch("click");
  env.setMedia(false);
  assert.equal(env.window.onresize, env.originalResize);
  assert.equal(env.window.onmousemove, env.originalMousemove);
  assert.equal(env.window.onmouseout, env.originalMouseout);
  assert.equal(env.window.listeners.has("mousemove"), false);
  assert.equal(env.window.listeners.has("mouseout"), false);
});

test("ResizeObserver, load, and pageshow use the same one-frame scheduler", () => {
  const env = setup({ resizeObserver: true });
  assert.equal(env.observers.length, 1);
  assert.deepEqual(env.observers[0].observed, [env.hero, env.image]);
  env.observers[0].callback();
  env.window.dispatch("load");
  env.window.dispatch("pageshow");
  assert.equal(env.pending.size, 1);
  env.flush();
  assert.equal(env.pending.size, 0);
  env.window.dispatch("load");
  assert.equal(env.pending.size, 0);
});

test("unsupported individual translate and empty pages exit without listeners", () => {
  for (const options of [{ supportsTranslate: false }, { noScenes: true }]) {
    const env = setup(options);
    assert.equal(env.window.listeners.size, 0);
    assert.equal(env.media.listeners.size, 0);
    assert.equal(env.pending.size, 0);
    assert.equal(env.hero.reads, 0);
    assert.equal(env.control.hidden, true);
  }
});

test("decorative scene motion does not depend on the optional manual control", () => {
  const env = setup({ noControl: true });
  env.hero.rect.top = -100;
  env.scroll();
  assert.equal(env.offset(env.background), "24.00px");
  env.setMedia(false);
  assert.equal(env.offset(env.background), "");
});
