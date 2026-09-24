# Homepage cosmic depth artwork

Created 2026-09-24 with the built-in imagegen tool. No CLI/API fallback was used. Both images are original decorative artwork for the homepage scroll passage; they are not observations, simulations, or quantitative scientific figures.

- Background master: `assets/images/parallax/cosmic-depth-background-v2-4k.webp`, refined from the first version with the built-in imagegen tool, then exported at 3840 × 2160 in WebP quality 94.
- Foreground master: `assets/images/parallax/cosmic-depth-foreground-v2-4k.webp`, refined with genuine transparency, then exported at 3840 × 2160 in WebP quality 92 and alpha quality 100.
- The first 1672 × 941 WebP versions remain alongside the new files for provenance. The homepage uses the 4K v2 masters.
- The built-in tool's native 1672 × 941 results were enlarged with Lanczos resampling and restrained sharpening before WebP delivery. This provides enough source pixels for the scene's 1.78× background and 2.35× foreground transforms on a wide display; it does not claim new scientific information.

## Exact background prompt

```text
Use case: stylized-concept
Asset type: wide 16:9 background plate for a premium academic astronomy website's scroll-driven depth scene
Primary request: create a richly layered cosmic dawn vista through which the viewer can visually travel during scroll. A very dark nearly black universe, sparse tiny sharp stars, long wispy crimson cosmic-web filaments sweeping inward from the left and right margins, a distant small blue-white luminous galactic nucleus slightly right of center, and subtle deep indigo gas surrounding it. This is an atmospheric artistic visualization of high-redshift black hole and early-galaxy research, not a data figure.
Composition: ultra-wide cinematic landscape, strong near-to-far spatial perspective and ample truly dark negative space at center-left for real HTML copy; luminous destination occupies no more than 12% of frame; filament structures remain distinct and textured at all scales so a CSS zoom feels like moving deeper into the scene.
Style: high-end astrophotographic concept art, refined rather than flashy, physically suggestive gas wisps, no planets or spaceships.
Palette: near-black #08090a, controlled deep blood red #bd342c and cool cyan #a6c7ce; avoid orange/yellow and bright saturated blue.
Constraints: no text, no letters, no logos, no interface, no watermarks, no giant central black hole, no heavy white fog, no galaxy disk dominating the frame.
```

## Exact v2 background refinement prompt

```text
Use case: style-transfer
Asset type: ultra-high-detail 16:9 background plate for a full-screen, scroll-zoomed academic astronomy website scene
Input image: Image 1 is the exact background to refine. Preserve its composition, framing, empty center-left copy space, luminous blue-white nucleus at right, crimson cosmic-web structure, palette, and overall brightness.
Primary request: re-render the same scene with much finer native detail so it remains crisp during a 1.8x browser zoom on high-density 4K displays. Resolve the gas into many delicate branching filaments at multiple spatial scales, add fine sharp stellar points and subtle textured indigo wisps, and eliminate any soft low-resolution or painterly appearance.
Style: refined high-end astrophotographic concept art, physically suggestive volumetric gas, sharp microcontrast with clean dark areas.
Composition: unchanged from Image 1; keep the nucleus position and size, the dark negative space, and the edge structures.
Palette: unchanged near-black, deep blood red, restrained cool cyan and indigo; no orange/yellow.
Output intent: maximum practical landscape resolution and detail, suitable for a 3840 × 2160 web master.
Constraints: no text, logos, watermarks, planets, spaceships, new dominant objects, giant accretion disk, or clipped nucleus. Do not brighten the dark copy area.
```

## Exact v2 transparent foreground refinement prompt

```text
Use case: style-transfer
Asset type: ultra-high-detail transparent 16:9 foreground layer for a full-screen scroll-zoomed academic astronomy website
Input image: Image 1 is the exact transparent foreground to refine. Preserve its transparent center, asymmetric gas placement along the side and lower edges, red/cyan palette, and overall silhouette.
Primary request: re-render the same isolated near-field gas with much finer crisp filament detail so it remains sharp when enlarged to 2.35x on a high-density 4K display. Resolve every broad gas edge into delicate branching wisps, turbulent curls, translucent sheets and tiny light knots while retaining clean, feathered alpha edges.
Composition: unchanged from Image 1; keep most of the center and upper middle genuinely transparent. Do not turn it into a closed ring or cover the copy area.
Palette: deep blood red with restrained cool-cyan highlights; no orange/yellow.
Background: genuine transparent alpha, with no black matte and no checkerboard.
Output intent: maximum practical landscape resolution and detail, suitable for a 3840 × 2160 transparent web master.
Constraints: no text, background starscape, galaxy disk, planets, people, logos or watermarks. Preserve transparency and avoid noisy cutout halos.
```

## Exact transparent foreground prompt

```text
Use case: stylized-concept
Asset type: transparent 16:9 foreground layer for a premium academic astronomy website's parallax scroll scene
Primary request: create only irregular, fine, wispy near-field cosmic gas filaments and a few tiny luminous dust sparks that sweep in from the bottom corners and side edges and curl around a large empty central opening. This transparent foreground will be layered above a separately rendered deep-space starfield and moved faster during scroll to create strong depth.
Style: photorealistic astrophotographic concept art, detailed semi-translucent gas strands, delicate volumetric edges, understated and sophisticated.
Composition: edges and corners carry the gas, most of the center and upper half genuinely empty/transparent; no enclosed ring, no horizontal bar, no obvious symmetry. Strong perspective with a few larger strands close to camera and much finer structures farther back.
Palette: dark blood-red #bd342c with subtle cool-cyan highlights, mostly dark and restrained; no orange or yellow.
Background: genuinely transparent alpha channel, not a black or checkerboard fill.
Constraints: no text, no starscape background, no galaxy disk, no planets, no people, no watermarks, no flat vector look.
```
