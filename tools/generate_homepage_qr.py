#!/usr/bin/env python3
"""Generate the homepage QR assets using macOS Core Image and Pillow.

Requires macOS with Swift and Python with Pillow. No network access is used.
"""

import json
import math
from pathlib import Path
import subprocess
import tempfile

from PIL import Image, ImageDraw


URL = "https://zihaowang-kiaa.github.io/personal-homepage/"
QUIET_ZONE = 4
MINIMUM_SIZE = 1200
OUTPUT = Path(__file__).resolve().parents[1] / "assets/images/sharing"

SWIFT_ENCODER = r'''
import CoreImage
import Foundation

let filter = CIFilter(name: "CIQRCodeGenerator")!
filter.setValue(Data(CommandLine.arguments[1].utf8), forKey: "inputMessage")
filter.setValue("H", forKey: "inputCorrectionLevel")
let image = filter.outputImage!
let width = Int(image.extent.width)
let height = Int(image.extent.height)
var pixels = [UInt8](repeating: 0, count: width * height * 4)
let context = CIContext(options: [.useSoftwareRenderer: true])
pixels.withUnsafeMutableBytes { buffer in
    context.render(image, toBitmap: buffer.baseAddress!, rowBytes: width * 4,
                   bounds: image.extent, format: .RGBA8,
                   colorSpace: CGColorSpaceCreateDeviceRGB())
}
let rows = (0..<height).map { y in
    (0..<width).map { x in pixels[(y * width + x) * 4] < 128 ? 1 : 0 }
}
let result = try JSONSerialization.data(withJSONObject: rows)
print(String(data: result, encoding: .utf8)!)
'''


def main():
    with tempfile.TemporaryDirectory(prefix="homepage-qr-") as temp:
        encoder = Path(temp) / "encoder.swift"
        encoder.write_text(SWIFT_ENCODER)
        result = subprocess.run(
            ["/usr/bin/swift", "-module-cache-path", str(Path(temp) / "cache"),
             str(encoder), URL],
            check=True, capture_output=True, text=True,
        )
    raw = json.loads(result.stdout)
    # Core Image includes its own margin; normalize to exactly four modules.
    black = [(x, y) for y, row in enumerate(raw) for x, value in enumerate(row) if value]
    left, right = min(x for x, _ in black), max(x for x, _ in black)
    top, bottom = min(y for _, y in black), max(y for _, y in black)
    matrix = [row[left:right + 1] for row in raw[top:bottom + 1]]
    modules = len(matrix)
    assert all(len(row) == modules for row in matrix)
    assert (modules - 21) % 4 == 0
    total = modules + 2 * QUIET_ZONE
    scale = math.ceil(MINIMUM_SIZE / total)
    image = Image.new("1", (total * scale, total * scale), 1)
    draw = ImageDraw.Draw(image)
    rectangles = []
    for y, row in enumerate(matrix):
        for x, value in enumerate(row):
            if value:
                px, py = (x + QUIET_ZONE) * scale, (y + QUIET_ZONE) * scale
                draw.rectangle((px, py, px + scale - 1, py + scale - 1), fill=0)
                rectangles.append(f'<rect x="{x + QUIET_ZONE}" y="{y + QUIET_ZONE}" width="1" height="1"/>')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT / "homepage-qr.png", dpi=(300, 300))
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{total * scale}" '
        f'height="{total * scale}" viewBox="0 0 {total} {total}" shape-rendering="crispEdges">\n'
        f'<rect width="{total}" height="{total}" fill="#fff"/>\n'
        '<g fill="#000">\n' + '\n'.join(rectangles) + '\n</g>\n</svg>\n'
    )
    (OUTPUT / "homepage-qr.svg").write_text(svg)
    print(json.dumps({"url": URL, "error_correction": "H", "modules": modules,
                      "quiet_zone_modules": QUIET_ZONE, "pixels_per_module": scale,
                      "image_pixels": total * scale, "output": str(OUTPUT)}, indent=2))


if __name__ == "__main__":
    main()
