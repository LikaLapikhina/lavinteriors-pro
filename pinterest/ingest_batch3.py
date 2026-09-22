# -*- coding: utf-8 -*-
"""Append batch 3 portfolio frames (site JPG + pin watermark + catalog merge)."""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(r"C:\Users\Анжелика\.cursor\projects\d-lav-site-lavinteriors-pro") / "assets"
IMAGES = ROOT / "images"
OUT = ROOT / "pinterest" / "out"
LOGO = ROOT / "pinterest" / "logo-lav.png"
SITE = "https://lavinteriors.pro"

CAT_BOARD = {
    "interiors": "Interiors",
    "architecture": "Architecture & Houses",
    "landscape": "Landscape",
    "public": "Public / Boutique",
    "details": "Lighting / Details",
}

STYLE_BOARD = {
    "quiet-luxury": "Quiet Luxury",
    "warm-minimal": "Warm Minimalism",
    "modern-minimal": "Contemporary Minimal",
    "organic-modern": "Organic Modern",
    "modern-neoclassic": "Modern Neoclassical",
    "american-classic": "American Classic",
    "new-mediterranean": "New Mediterranean",
    "japandi": "Japandi",
    "wabi-sabi": "Wabi-Sabi",
    "contemporary-arch": "Contemporary",
    "old-money": "Old Money",
    "barnhouse": "Barnhouse",
    "boutique": "Boutique",
}

BATCH = [
    {
        "id": "p112",
        "src_substr": "Generated_Image_July_10__2026_-_2_20PM",
        "file": "port-v2-living-burgundy-chairs.jpg",
        "cat": "interiors",
        "styles": ["japandi", "warm-minimal", "organic-modern"],
        "title": {"en": "Japandi Living Lounge", "ru": "Гостиная Japandi"},
        "pin_title": "Japandi Living Room | Oak Shelf & Burgundy Chairs",
        "pin_desc": (
            "Warm oak shelving, low beige sofa and burgundy mid-century chairs on herringbone oak — "
            "calm Japandi living by LAV Interiors.\n\n"
            "#Japandi #WarmMinimalism #OrganicModern #LivingRoom #InteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p113",
        "src_substr": "Bathroom_suite_with_marble_tub",
        "file": "port-v2-bath-hex-mosaic.jpg",
        "cat": "interiors",
        "styles": ["organic-modern", "japandi", "quiet-luxury"],
        "title": {"en": "Marble Tub & Hex Mosaic", "ru": "Ванна с мрамором и мозаикой"},
        "pin_title": "Organic Modern Bathroom | Marble Tub & Glass Blocks",
        "pin_desc": (
            "Built-in marble tub, frosted glass blocks, oak vanity and brushed brass — "
            "spa bathroom by LAV Interiors.\n\n"
            "#OrganicModern #Japandi #QuietLuxury #BathroomDesign #Marble #LAVInteriors"
        ),
    },
    {
        "id": "p114",
        "src_substr": "Dining_table_in_museum_space",
        "file": "port-v2-dining-stone-sculptures.jpg",
        "cat": "interiors",
        "styles": ["japandi", "organic-modern", "modern-minimal"],
        "title": {"en": "Stone Dining Gallery", "ru": "Столовая-галерея"},
        "pin_title": "Organic Modern Dining | Travertine Table & Sculptures",
        "pin_desc": (
            "Oval stone pedestal table, oak chairs, abstract art and sculptural pedestals — "
            "gallery dining by LAV Interiors.\n\n"
            "#Japandi #OrganicModern #ContemporaryMinimal #DiningRoom #InteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p115",
        "src_substr": "Kitchen_island_with_stools",
        "file": "port-v2-kitchen-fluted-quartzite.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "modern-minimal", "organic-modern"],
        "title": {"en": "Fluted Kitchen & Quartzite", "ru": "Кухня с флейтами и кварцитом"},
        "pin_title": "Quiet Luxury Kitchen | Fluted Wood & Dramatic Stone",
        "pin_desc": (
            "Dark fluted cabinetry, dramatic blue-rust quartzite island and mustard stools — "
            "moody kitchen by LAV Interiors.\n\n"
            "#QuietLuxury #ContemporaryMinimal #OrganicModern #LuxuryKitchen #InteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p116",
        "src_substr": "Fountain_in_country_estate_court",
        "file": "port-v2-courtyard-fountain.jpg",
        "cat": "landscape",
        "styles": ["american-classic", "new-mediterranean"],
        "title": {"en": "Estate Courtyard Fountain", "ru": "Фонтан во дворе усадьбы"},
        "pin_title": "Classic Estate Courtyard | Fountain & Formal Garden",
        "pin_desc": (
            "Three-tier stone fountain, boxwood topiary and white manor facade — "
            "formal landscape by LAV Interiors.\n\n"
            "#AmericanClassic #NewMediterranean #LandscapeDesign #FormalGarden #EstateGarden #LAVInteriors"
        ),
    },
]


def find_src(substr: str) -> Path:
    matches = [p for p in ASSETS.iterdir() if p.is_file() and substr in p.name]
    if not matches:
        raise FileNotFoundError(substr)
    return matches[0]


def logo_rgba(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r < 40 and g < 40 and b < 40:
                px[x, y] = (255, 255, 255, 0)
            else:
                lum = (r + g + b) // 3
                px[x, y] = (255, 255, 255, max(a, min(255, lum + 40)))
    return im


def crop_to_ratio(im: Image.Image, ratio_w: float = 3, ratio_h: float = 4) -> Image.Image:
    w, h = im.size
    target = ratio_w / ratio_h
    current = w / h
    if abs(current - target) < 0.02:
        return im
    if current > target:
        new_w = int(h * target)
        left = (w - new_w) // 2
        return im.crop((left, 0, left + new_w, h))
    new_h = int(w / target)
    top = (h - new_h) // 2
    return im.crop((0, top, w, top + new_h))


def save_site_jpg(src: Path, dst: Path, max_edge: int = 1800, quality: int = 88) -> None:
    im = Image.open(src).convert("RGB")
    im = crop_to_ratio(im, 3, 4)
    w, h = im.size
    scale = min(1.0, max_edge / max(w, h))
    if scale < 1:
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)


def watermark(src: Path, dst: Path, logo: Image.Image, max_edge: int = 1600) -> None:
    base = Image.open(src).convert("RGBA")
    base = crop_to_ratio(base.convert("RGB"), 3, 4).convert("RGBA")
    w, h = base.size
    scale = min(1.0, max_edge / max(w, h))
    if scale < 1:
        base = base.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
        w, h = base.size

    target_w = max(90, int(w * 0.18))
    lw, lh = logo.size
    ratio = target_w / lw
    mark = logo.resize((target_w, max(1, int(lh * ratio))), Image.Resampling.LANCZOS)
    a = mark.split()[-1].point(lambda v: int(v * 0.72))
    mark.putalpha(a)

    margin = max(16, int(w * 0.035))
    x = w - mark.size[0] - margin
    y = h - mark.size[1] - margin
    scrim = Image.new("RGBA", (mark.size[0] + 16, mark.size[1] + 12), (20, 20, 20, 90))
    composed = base.copy()
    composed.alpha_composite(scrim, (x - 8, y - 6))
    composed.alpha_composite(mark, (x, y))
    dst.parent.mkdir(parents=True, exist_ok=True)
    composed.convert("RGB").save(dst, "JPEG", quality=90, optimize=True, progressive=True)


def board_name(style_id: str, cat_id: str) -> str:
    return f"{STYLE_BOARD[style_id]} {CAT_BOARD[cat_id]}"


def pin_link(item: dict) -> str:
    primary = item["styles"][0]
    return f"{SITE}/?pin={item['id']}&style={primary}&cat={item['cat']}#portfolio"


def merge_pins(new_pins: list[dict]) -> list[dict]:
    path = ROOT / "pinterest" / "pins.jsonl"
    existing = []
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                existing.append(json.loads(line))
    by_id = {p["id"]: p for p in existing}
    for p in new_pins:
        by_id[p["id"]] = p
    return [by_id[k] for k in sorted(by_id.keys(), key=lambda x: int(re.sub(r"\D", "", x) or 0))]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    logo = logo_rgba(LOGO)

    new_pins = []
    for item in BATCH:
        src = find_src(item["src_substr"])
        site_path = IMAGES / item["file"]
        pin_path = OUT / item["file"].replace(".jpg", "-pin.jpg")
        save_site_jpg(src, site_path)
        watermark(src, pin_path, logo)
        item_boards = [board_name(s, item["cat"]) for s in item["styles"]]
        new_pins.append(
            {
                "id": item["id"],
                "site_file": f"images/{item['file']}",
                "pin_file": str(pin_path.relative_to(ROOT)).replace("\\", "/"),
                "cat": item["cat"],
                "styles": item["styles"],
                "boards": item_boards,
                "title": item["title"],
                "pin_title": item["pin_title"],
                "pin_description": item["pin_desc"],
                "link": pin_link(item),
                "status": "ready",
            }
        )
        print("OK", item["id"], "<-", src.name)

    pins = merge_pins(new_pins)
    boards = sorted({b for p in pins for b in p["boards"]})

    (ROOT / "pinterest" / "pins.jsonl").write_text(
        "\n".join(json.dumps(p, ensure_ascii=False) for p in pins) + "\n",
        encoding="utf-8",
    )
    (ROOT / "pinterest" / "boards.json").write_text(
        json.dumps(boards, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    catalog = [
        {
            "id": p["id"],
            "imgKey": None,
            "img": p["site_file"],
            "cat": p["cat"],
            "styles": p["styles"],
            "title": p["title"],
        }
        for p in pins
    ]
    (ROOT / "pinterest" / "portfolio_items.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    lines = [
        "# Pinterest publish checklist — all ready pins",
        "",
        "Account: @LAV_DESIGN · site: lavinteriors.pro",
        "",
        "## Create these boards (if missing)",
        "",
    ]
    for b in boards:
        lines.append(f"- {b}")
    lines += ["", "## Pins (upload watermarked file → paste title/desc/link → add to ALL listed boards)", ""]
    for p in pins:
        lines += [
            f"### {p['id']} — {p['pin_title']}",
            f"- File: `{p['pin_file']}`",
            f"- Boards: {', '.join(p['boards'])}",
            f"- Link: {p['link']}",
            f"- Title: {p['pin_title']}",
            f"- Description:",
            "```",
            p["pin_description"],
            "```",
            "",
        ]
    (ROOT / "pinterest" / "PUBLISH.md").write_text("\n".join(lines), encoding="utf-8")

    # Sync into index HTML catalogs
    js_items = ",\n        ".join(
        "{{id:'{id}', img:'{img}', cat:'{cat}', styles:{styles}, title:{{en:'{en}', ru:'{ru}'}}}}".format(
            id=c["id"],
            img=c["img"],
            cat=c["cat"],
            styles=json.dumps(c["styles"]),
            en=c["title"]["en"].replace("'", "\\'"),
            ru=c["title"]["ru"].replace("'", "\\'"),
        )
        for c in catalog
    )
    block = (
        "      // Flexible catalog: any count per style/category is fine\n"
        "      // Batch 1–3 — vertical 3:4 frames (Pinterest-linked)\n"
        "      window.PORTFOLIO_ITEMS = [\n"
        f"        {js_items}\n"
        "      ];"
    )
    for name in ("index_updated.html", "index.html"):
        path = ROOT / name
        text = path.read_text(encoding="utf-8")
        updated, n = re.subn(
            r"      // Flexible catalog:[\s\S]*?window\.PORTFOLIO_ITEMS = \[[\s\S]*?\];",
            block,
            text,
            count=1,
        )
        if n != 1:
            raise RuntimeError(f"PORTFOLIO_ITEMS block not found in {name}")
        path.write_text(updated, encoding="utf-8")
        print("updated", name)

    print("TOTAL", len(pins), "pins,", len(boards), "boards")


if __name__ == "__main__":
    main()
