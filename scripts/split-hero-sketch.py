"""
public/hero-sketch.png-г хөдөлгөөнтэй болгохын тулд давхарга болгон салгана.

Эскизийн дэвсгэр нь alpha учир ачаа зөөж яваа хүн бүр onгоцноос тусдаа
"холбоост муж" (connected component) болж хэвтэж байгаа. Тэднийг тус тусад
нь тайрч аваад, суурь зурагнаас нь арилгана. Ингэснээр хүн бүрийг CSS-ээр
дангаар нь хөдөлгөх боломжтой болно.

Ажиллуулах:  python scripts/split-hero-sketch.py
Гаралт:      public/sketch/hero/plane.png, person-1..7.png + байрлалын JSON
"""

import json
import os
from collections import deque

from PIL import Image

SRC = "public/hero-sketch.png"
OUT_DIR = "public/sketch/hero"
ALPHA_MIN = 24
# Хүн бүр ~500-1000 пиксель; онгоц 27000, цонх/жижиг хэлтэрхий 200-аас бага.
MIN_PIXELS = 400
MAX_PIXELS = 5000


def components(image):
    width, height = image.size
    alpha = image.getchannel("A").load()
    seen = [[False] * height for _ in range(width)]

    for x in range(width):
        for y in range(height):
            if seen[x][y] or alpha[x, y] < ALPHA_MIN:
                continue
            queue = deque([(x, y)])
            seen[x][y] = True
            pixels = []
            while queue:
                cx, cy = queue.popleft()
                pixels.append((cx, cy))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if not seen[nx][ny] and alpha[nx, ny] >= ALPHA_MIN:
                                seen[nx][ny] = True
                                queue.append((nx, ny))
            yield pixels


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    source = Image.open(SRC).convert("RGBA")
    width, height = source.size

    people = [p for p in components(source) if MIN_PIXELS <= len(p) <= MAX_PIXELS]
    # Зүүнээс баруун тийш — дугаарлалт зураг дээрхтэй тохирч байхын тулд.
    people.sort(key=lambda pixels: min(x for x, _ in pixels))

    plane = source.copy()
    plane_px = plane.load()
    geometry = []

    for index, pixels in enumerate(people, start=1):
        x0 = min(x for x, _ in pixels)
        y0 = min(y for _, y in pixels)
        x1 = max(x for x, _ in pixels)
        y1 = max(y for _, y in pixels)

        sprite = Image.new("RGBA", (x1 - x0 + 1, y1 - y0 + 1), (0, 0, 0, 0))
        sprite_px = sprite.load()
        for x, y in pixels:
            sprite_px[x - x0, y - y0] = source.getpixel((x, y))
            plane_px[x, y] = (0, 0, 0, 0)

        name = f"person-{index}.png"
        sprite.save(os.path.join(OUT_DIR, name))
        geometry.append(
            {
                "src": f"/sketch/hero/{name}",
                "width": sprite.width,
                "height": sprite.height,
                # Хувиар — эх зураг responsive тул пиксель болохгүй.
                "left": round(x0 / width * 100, 3),
                "top": round(y0 / height * 100, 3),
                "widthPct": round(sprite.width / width * 100, 3),
            }
        )

    plane.save(os.path.join(OUT_DIR, "plane.png"))
    print(json.dumps(geometry, indent=2))


if __name__ == "__main__":
    main()
