"""从 Images/Logo.png 生成 MSIX 各尺寸图标（透明背景、图标居中放大）。"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "PetitPlanetTool.Package" / "Images" / "Logo.png"
OUT_DIR = SRC.parent

# 目标尺寸（文件名, 边长或 (宽, 高)）
SQUARE_SIZES = {
    "StoreLogo.png": 50,
    "Square44x44Logo.png": 44,
    "Square44x44Logo.scale-200.png": 88,
    "Square44x44Logo.targetsize-24_altform-unplated.png": 24,
    "Square150x150Logo.png": 150,
    "Square150x150Logo.scale-200.png": 300,
    "LockScreenLogo.scale-200.png": 48,
}

WIDE_SIZES = {
    "Wide310x150Logo.png": (310, 150),
    "Wide310x150Logo.scale-200.png": (620, 300),
    "SplashScreen.png": (620, 300),
    "SplashScreen.scale-200.png": (1240, 600),
}


def remove_dark_background(img: Image.Image, threshold: int = 40) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= threshold and g <= threshold and b <= threshold:
                pixels[x, y] = (r, g, b, 0)
    return img


def crop_to_content(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    return img.crop(bbox)


def fit_square(img: Image.Image, size: int, fill_ratio: float = 0.88) -> Image.Image:
    side = max(img.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    target = max(1, int(size * fill_ratio))
    canvas = canvas.resize((target, target), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = (size - target) // 2
    out.paste(canvas, (offset, offset), canvas)
    return out


def fit_wide(img: Image.Image, width: int, height: int, fill_ratio: float = 0.82) -> Image.Image:
    target_w = max(1, int(width * fill_ratio))
    target_h = max(1, int(height * fill_ratio))
    ratio = min(target_w / img.width, target_h / img.height)
    new_size = (max(1, int(img.width * ratio)), max(1, int(img.height * ratio)))
    resized = img.resize(new_size, Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    out.paste(resized, ((width - new_size[0]) // 2, (height - new_size[1]) // 2), resized)
    return out


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Source logo not found: {SRC}")

    base = remove_dark_background(Image.open(SRC))
    base = crop_to_content(base)

    for name, size in SQUARE_SIZES.items():
        ratio = 0.90 if size >= 150 else 0.88
        out = fit_square(base, size, fill_ratio=ratio)
        path = OUT_DIR / name
        out.save(path, format="PNG")
        print(f"  {name} ({size}x{size})")

    for name, (w, h) in WIDE_SIZES.items():
        out = fit_wide(base, w, h)
        path = OUT_DIR / name
        out.save(path, format="PNG")
        print(f"  {name} ({w}x{h})")


if __name__ == "__main__":
    print(">>> Generating package icons from Logo.png")
    main()
    print(">>> Done")
