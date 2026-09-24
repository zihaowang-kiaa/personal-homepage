# Design and maintenance notes

## A house with working rooms and a garden

The homepage is the front room: an introduction, research directions, selected papers, and routes to the rest of the house. Three research pages are working rooms. The posts page is the garden, with cinema, music, essays, photography, and lecture notes. The mailbox and CV remain ordinary, directly usable links.

Use atmosphere to support navigation rather than conceal it. Drag interactions on the homepage are an additional way to explore; visitors must retain click and keyboard routes. Implementation notes, authoring commands, and unfinished placeholders belong in documentation, never in visible page copy.

## Editorial style

Keep visible titles and subtitles short, direct, and informative. Use “Open questions”, “Beyond telescope”, “Publications”, and “Contact” rather than decorative phrases. Introduce research by stating what the project studies or does, not how the author's work is organized. Retain scientific meaning, publication titles, author lists, and original quotations. The house/garden concept informs the visual design; it does not need explanatory prose on the page. Album entries show their names without invented mood taglines or small-print collection filler.

## Visual direction

- Near-black `#08090a`, warm ivory `#efeae2`, restrained red `#bd342c`, and muted cyan `#a6c7ce` form the shared palette.
- Large serif titles, small navigational labels, fine rules, and generous spacing provide hierarchy. Avoid turning every section into a generic bordered card.
- Collage and architectural elements give the front room and research pages a theatrical character. Keep them clear of body text and scientific figures.
- Preserve the portrait's original colors. Do not apply grayscale, desaturation, or a color-changing overlay to the portrait.
- Scientific covers and plots need complete, legible presentation. Use contain-style fitting where cropping would remove scientific content.
- The garden is quieter and more intimate: a photographic opening, asymmetric journal layouts, and broad album rows. Expressive preview crops are appropriate for photographs because original files remain available.

## File responsibilities

`index.html` and the four documents in `pages/` contain the published semantic structure and editorial content. `content/*.md` retains the source material and research notes; there is no automatic Markdown-to-HTML conversion.

`assets/css/site.css` provides shared focus, motion-control, and accessibility rules. `home.css`, `research.css`, and `posts.css` own the visual direction of their respective pages. Load the baseline before the page stylesheet.

`assets/js/site.js` manages ambient-video motion preferences, visibility-based pausing, and explicit playback control. `home.js` owns the interactive room stage; `research.js` owns project navigation and external-link behavior; `posts.js` owns section navigation and the photograph viewer. Load shared behavior before page-specific behavior, using deferred scripts.

`assets/js/background-lines.js` is the unmodified original MIT-licensed canvas-nest v1.0.1 script, restored from the earliest local `mousemove.js`. Keep its original white color, opacity 0.18, 120 particles, and z-index −1. The original 6000/20000 squared-distance thresholds, outer-ring-only attraction, and thin strokes are intentional; do not replace them with a denser network or a stronger halo. Load this script synchronously as the final script element, since it reads configuration from the last script tag. The opaque hero scenery naturally covers this background layer, as it did originally. This interaction is part of the user's preferred design and should not be redesigned during visual simplification.

### Homepage scroll depth

`assets/css/home-parallax.css` and `assets/js/home-parallax.js` progressively enhance only the homepage. The hero's background, ground, and four props have separate scroll speeds; project and garden images move inside stationary, clipped frames. Text, navigation, the sticky original-color portrait, the stage container, and the draggable figure are not transformed. Individual CSS `translate` preserves the door/CV rotations and existing hover transforms; moving links retain their actual hitboxes for the stage's rectangle-based drop detection.

Motion is enabled only above 760px and with `prefers-reduced-motion: no-preference`. The hero's “Scroll depth” button can also disable it. Changing the media preference or viewport resets all offsets; unsupported browsers and JavaScript-disabled pages retain the original static layout. A passive scroll listener schedules at most one animation frame per event burst, using stable scene bounds and skipping offscreen writes, with no idle animation loop or scroll interception. Project and Posts image frames have 76px overscan for a maximum 72px translation; the hero background has 128px overscan for a maximum 120px translation.

Keep the new script before the original background-lines script, which must remain the final script tag. Never replace the original global mouse/resize handlers; the new controller uses `addEventListener`. The stylesheet adds no color grading or new palette. Run `node --test tools/test_home_parallax.cjs` for deterministic motion/preference tests; verify actual desktop scrolling, drag/drop after scrolling, image-frame coverage, mobile navigation, and the no-JavaScript fallback when changing this effect.

### Cosmic depth passage

The full-screen passage between 01 / About me and 02 / Open questions uses a generated distant cosmic-web background and a separate transparent near-field gas layer. Scrolling opens a framed view into full bleed, then enlarges the background and foreground at different rates. Both images are decorative artistic material, not scientific data. The two links inside the passage lead to the corresponding research pages. The exact generation prompts and asset provenance are recorded in `docs/media/cosmic-depth.md`.

`assets/js/cosmic-depth.js` scrubs the passage from actual scroll position. It reads scene bounds, schedules one animation frame per scroll burst, and writes only transform/opacity/clip variables. The passage works on desktop and mobile. The desktop “Scroll depth” control also disables the passage; reduced-motion users and no-JavaScript visitors receive a static, fully linked panel. Keep the original background-lines script last, and preserve the portrait colors and existing room navigation.

## Assets and preservation

Published images live under `assets/images/`, organized as `portrait/`, `collage/`, `research/`, `journal/`, `albums/`, and `parallax/`. Published video clips live under `assets/videos/`. The previous `source materials/` paths are superseded by the entries in `docs/asset-map.json`.

The LRD hero uses `assets/videos/bh-star-to-agn-red-to-blue-20s.mp4`, copied unchanged from the 20-second, 1920 × 1080, 60 fps render in `output/bh_star_to_agn_red_to_blue/`. Its matching still is `assets/images/research/bh-star-to-agn-red-to-blue-poster.png`. It preserves the complete evolution from a crimson envelope to an exposed blue-white AGN. Earlier movies remain available as retained assets or local source renders. The movie is an illustrative 3-D rendering, not a calibrated hydrodynamic simulation.

The Proximity zones project retains `assets/images/research/proximity-zones-z6-highres.png`, a 5814 × 6000 PNG rendered directly from the single page of `main_z6.pdf`, and its 1745 × 1800 WebP preview. Keep this scientific original's four-panel layout, colormaps, labels, and scale bars intact; do not apply decorative filters or crop it. The source PDF is retained locally.

The in-page cover is a separately named, AI-assisted artistic rendering (`proximity-zones-z6-art.png`, with a WebP browsing version). At the user's request, the visible caption and original-figure download link have been removed; clicking the image still opens the full-size artwork. Its alternative text retains the artistic-rendering description, and the unmodified 6000-pixel simulation figure remains in the assets. The display version emphasizes the filaments' depth and the ionized regions; it has no numerical labels, source markers, or calibration bars and must not be presented as quantitative data. The exact generation prompt and provenance are recorded in `docs/media/proximity-zones-art.md`. This change does not alter the website palette, portrait, or background interaction.

The `album_previews` mapping pairs each original in `albums/` with its optimized WebP preview in `assets/images/albums/`. Keep the originals and the mapping: previews are for efficient browsing, while original links preserve access to the full photograph. Keep album and photograph order intact. Album order is Sri Lanka, USA, Malaysia & Singapore, Tibet, Qinhuangdao, Haikou, and Experimental.

The current CV is `docs/cv/Zihao_2026.pdf`. Sources and supporting files live under `docs/cv/source/`. The root `Zihao_2026.pdf` is a compatibility copy for existing bookmarks and must remain synchronized when the CV changes.

`archive/` preserves local historical pages, experiments, and source assets. `output/` is for local generated previews and verification artifacts. Preserve these directories locally; do not commit them. Published HTML, CSS, and JavaScript must not depend on either directory.

`tools/organize_assets.py` records the one-time asset-organization workflow (macOS `sips` and `cwebp` are required), and `tools/video/` contains local video-production scripts. Neither is required to serve the website. Review paths and outputs before rerunning media processing; do not replace original photographs with compressed derivatives. The portrait is copied without conversion or color modification.

## Interaction and verification

Use visible focus states, meaningful link labels, and native controls. Albums use `details`/`summary`, so expansion remains available without JavaScript. The photo viewer adds a native modal, previous/next controls, arrow-key navigation, Escape-to-close, an original-file link, and focus restoration. Links to original photographs remain the no-JavaScript fallback.

Honor reduced-motion preferences and keep pause controls for ambient motion. Nonhero photographs should load lazily. No remote font service or JavaScript framework is required.

From the repository root, run `python3 tools/check_site.py`. Serve the site with `python3 -m http.server 8000`, then inspect all five pages in a browser at desktop and mobile widths. Verify keyboard routes, album expansion, viewer controls, media playback, portrait color, figure legibility, and absence of horizontal overflow. The static checker validates local structure and references, not visual appearance or external content.
