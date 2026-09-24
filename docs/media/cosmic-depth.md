# Homepage cosmic depth artwork

Created 2026-09-24 with the built-in imagegen tool. No CLI/API fallback was used. Both images are original decorative artwork for the homepage scroll passage; they are not observations, simulations, or quantitative scientific figures.

- Background: `assets/images/parallax/cosmic-depth-background.webp`, generated as a 1672 × 941 PNG and exported to WebP quality 88.
- Foreground: `assets/images/parallax/cosmic-depth-foreground.webp`, generated as a 1672 × 941 transparent PNG and exported to WebP quality 86 with alpha quality 100.
- The published WebP images are the final project assets. The foreground alpha channel is retained.

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
