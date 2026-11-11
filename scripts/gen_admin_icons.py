from PIL import Image
import os

BASE = r"d:\Umeed-Foundation Project\admin-web\android\app\src\main\res"
LOGO = r"d:\Umeed-Foundation Project\admin-web\src\assets\umeed-logo.png"

img = Image.open(LOGO).convert("RGB")
W, H = img.size
px = img.load()

# Find bounding box of the green icon (green = g notably higher than r and b)
minx, miny, maxx, maxy = W, H, 0, 0
for y in range(H):
    for x in range(W):
        r, g, b = px[x, y]
        if g > 90 and g > r + 30 and g > b + 30:
            if x < minx: minx = x
            if x > maxx: maxx = x
            if y < miny: miny = y
            if y > maxy: maxy = y

print("green box:", minx, miny, maxx, maxy, "img:", W, H)
icon = img.crop((minx, miny, maxx + 1, maxy + 1)).convert("RGBA")

# Detect the green rounded-square icon via alpha/background boundaries:
# The icon is the region where pixels are green (solid green block).
# From the real logo, icon spans roughly x 40..480, y 40..485 — but detect:
# scan columns: green pixel ratio high = icon columns
col_green = []
for x in range(W):
    cnt = 0
    for y in range(0, H, 4):
        r, g, b = px[x, y]
        if g > 90 and g > r + 30 and g > b + 30:
            cnt += 1
    col_green.append(cnt)
# find contiguous run of columns with >30% green
thresh = (H // 4) * 0.3
runs = []
start = None
for x, c in enumerate(col_green):
    if c > thresh and start is None:
        start = x
    elif c <= thresh and start is not None:
        runs.append((start, x - 1))
        start = None
if start is not None:
    runs.append((start, W - 1))
best = max(runs, key=lambda r: r[1] - r[0])
minx, maxx = best
print("icon columns:", minx, maxx)
# vertical extent within that block
miny, maxy = H, 0
for y in range(H):
    for x in range(minx, maxx + 1, 2):
        r, g, b = px[x, y]
        if g > 90 and g > r + 30 and g > b + 30:
            miny = min(miny, y)
            maxy = max(maxy, y)
            break
print("icon rows:", miny, maxy)
icon = img.crop((minx, miny, maxx + 1, maxy + 1)).convert("RGBA")
w, h = icon.size
print("cropped raw:", w, h)
side = max(w, h)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(icon, ((side - w) // 2, (side - h) // 2), icon)
icon = sq.resize((1024, 1024), Image.LANCZOS)
icon.save(r"d:\Umeed-Foundation Project\admin-web\src\assets\icon-only.png")
print("cropped icon saved:", icon.size)

def resize_to(im, size):
    return im.resize((size, size), Image.LANCZOS)

sizes = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
fg_sizes = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}

for dpi, s in sizes.items():
    d = os.path.join(BASE, f"mipmap-{dpi}")
    # Legacy icons: the icon art itself, full bleed
    ic = resize_to(icon, s)
    ic.save(os.path.join(d, "ic_launcher.png"))
    ic.save(os.path.join(d, "ic_launcher_round.png"))
    # Adaptive: background = solid green from icon corner, foreground = icon at 66%
    bgc = icon.getpixel((10, 10))[:3]
    bg = Image.new("RGBA", (fg_sizes[dpi], fg_sizes[dpi]), bgc + (255,))
    bg.save(os.path.join(d, "ic_launcher_background.png"))
    fg_canvas = Image.new("RGBA", (fg_sizes[dpi], fg_sizes[dpi]), (0, 0, 0, 0))
    fgi = icon.resize((int(fg_sizes[dpi] * 0.66), int(fg_sizes[dpi] * 0.66)), Image.LANCZOS)
    off = (fg_sizes[dpi] - fgi.width) // 2
    fg_canvas.paste(fgi, (off, off), fgi)
    # monochrome: same shape (simple approach: reuse foreground alpha)
    fg_canvas.save(os.path.join(d, "ic_launcher_foreground.png"))
    fg_canvas.save(os.path.join(d, "ic_launcher_monochrome.png"))

print("done")
