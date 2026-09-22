# -*- coding: utf-8 -*-
"""Ingest portfolio frames: site JPGs + watermarked Pinterest copies + pins.jsonl."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(r"C:\Users\Анжелика\.cursor\projects\d-lav-site-lavinteriors-pro") / "assets"
IMAGES = ROOT / "images"
OUT = ROOT / "pinterest" / "out"
LOGO_DST = ROOT / "pinterest" / "logo-lav.png"
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
        "id": "p101",
        "src_glob": "*Single_image_00001_mfdxs*",
        "file": "port-v2-bedroom-doors.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "modern-neoclassic"],
        "title": {"en": "Quiet Luxury Bedroom", "ru": "Спальня Quiet Luxury"},
        "pin_title": "Quiet Luxury Bedroom | Modern Neoclassical Interior",
        "pin_desc": (
            "Quiet luxury bedroom framed by classic doors — walnut feature wall, soft neutrals, "
            "statement glass chandelier. Designed by LAV Interiors.\n\n"
            "#QuietLuxury #ModernNeoclassical #BedroomDesign #InteriorDesign #LAVInteriors #OldMoneyAesthetic"
        ),
    },
    {
        "id": "p102",
        "src_glob": "*Single_image_00004_tvssn*",
        "file": "port-v2-dining-travertine.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "modern-neoclassic"],
        "title": {"en": "Travertine Dining", "ru": "Столовая с травертином"},
        "pin_title": "Travertine Dining Room | Quiet Luxury Interiors",
        "pin_desc": (
            "Oval travertine table, bouclé chairs, herringbone floors and wall moldings — "
            "calm editorial dining by LAV Interiors.\n\n"
            "#QuietLuxury #ModernNeoclassical #DiningRoom #Travertine #InteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p103",
        "src_glob": "*Single_image_00003_atdka*",
        "file": "port-v2-living-red-marble.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "old-money"],
        "title": {"en": "Living with Red Marble", "ru": "Гостиная с красным мрамором"},
        "pin_title": "Quiet Luxury Living Room | Red Marble & Moldings",
        "pin_desc": (
            "Modern classic living room with boiserie, herringbone oak and a bold red marble coffee table. "
            "LAV Interiors.\n\n"
            "#QuietLuxury #OldMoney #LivingRoom #Marble #InteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p104",
        "src_glob": "*Single_image_00004_zblxy*",
        "file": "port-v2-living-marble-portal.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "old-money"],
        "title": {"en": "Marble Portal Living", "ru": "Гостиная с мраморным порталом"},
        "pin_title": "Old Money Living Room | Marble Fireplace Arch",
        "pin_desc": (
            "Moody charcoal walls, Calacatta marble fireplace arch, bouclé seating and brass accents. "
            "Quiet luxury by LAV Interiors.\n\n"
            "#QuietLuxury #OldMoney #MarbleFireplace #LuxuryLivingRoom #InteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p105",
        "src_glob": "*Single_image_00001_riyhb*",
        "file": "port-v2-villa-travertine.jpg",
        "cat": "architecture",
        "styles": ["contemporary-arch", "new-mediterranean"],
        "title": {"en": "Travertine Villa Entrance", "ru": "Вход виллы из травертина"},
        "pin_title": "Contemporary Villa Entrance | Travertine Architecture",
        "pin_desc": (
            "Travertine volumes, bronze accents and layered Mediterranean landscaping — "
            "private house architecture by LAV Interiors.\n\n"
            "#ContemporaryArchitecture #NewMediterranean #LuxuryVilla #ExteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p106",
        "src_glob": "*Single_image_00002_zkybs*",
        "file": "port-v2-bath-marble-arch.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "modern-neoclassic"],
        "title": {"en": "Marble Arch Bathroom", "ru": "Ванна с мраморной аркой"},
        "pin_title": "Quiet Luxury Bathroom | Marble Arch & Brass",
        "pin_desc": (
            "Freestanding tub, marble arched niche, teal textured walls and warm brass — "
            "spa-like bathroom by LAV Interiors.\n\n"
            "#QuietLuxury #ModernNeoclassical #BathroomDesign #Marble #InteriorDesign #LAVInteriors"
        ),
    },
    # ----- batch 2 -----
    {
        "id": "p107",
        "src_glob": "*Single_image_00001_dpffc*",
        "file": "port-v2-vanity-scallop.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "modern-neoclassic"],
        "title": {"en": "Scalloped Vanity", "ru": "Тумба с фестонами"},
        "pin_title": "Quiet Luxury Bathroom Vanity | Brass & Travertine",
        "pin_desc": (
            "Walnut scalloped vanity, travertine top, wavy mirrors and brushed brass — "
            "romantic quiet luxury by LAV Interiors.\n\n"
            "#QuietLuxury #ModernNeoclassical #BathroomVanity #BrassHardware #InteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p108",
        "src_glob": "*Single_image_00001_ptjyp*",
        "file": "port-v2-bath-glass-blocks.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "organic-modern"],
        "title": {"en": "Glass Block Bathroom", "ru": "Ванна со стеклоблоками"},
        "pin_title": "Organic Modern Bathroom | Marble Tub & Glass Blocks",
        "pin_desc": (
            "Corner marble bathtub, frosted glass-block wall, oak vanity and soft brass — "
            "light-filled bathroom by LAV Interiors.\n\n"
            "#QuietLuxury #OrganicModern #BathroomDesign #Marble #GlassBlocks #LAVInteriors"
        ),
    },
    {
        "id": "p109",
        "src_glob": "*Single_image_00003_zorus*",
        "file": "port-v2-bath-backlit-marble.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "modern-minimal"],
        "title": {"en": "Backlit Marble Bath", "ru": "Ванна с подсвеченным мрамором"},
        "pin_title": "Quiet Luxury Spa Bath | Backlit Marble Wall",
        "pin_desc": (
            "Freestanding tub against a glowing marble slab, walnut panels and floor-mounted brass tap — "
            "spa calm by LAV Interiors.\n\n"
            "#QuietLuxury #ContemporaryMinimal #BathroomDesign #Marble #SpaBathroom #LAVInteriors"
        ),
    },
    {
        "id": "p110",
        "src_glob": "*Single_image_00004_lqvtb*",
        "file": "port-v2-kitchen-marble-island.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "modern-neoclassic"],
        "title": {"en": "Marble Island Kitchen", "ru": "Кухня с мраморным островом"},
        "pin_title": "Quiet Luxury Kitchen | Dramatic Marble Island",
        "pin_desc": (
            "Sculptural marble island, walnut cabinetry, neoclassical moldings and a slim brass pendant — "
            "kitchen by LAV Interiors.\n\n"
            "#QuietLuxury #ModernNeoclassical #LuxuryKitchen #MarbleIsland #InteriorDesign #LAVInteriors"
        ),
    },
    {
        "id": "p111",
        "src_glob": "*Single_image_00001_ltpxr*",
        "file": "port-v2-living-blue-rug.jpg",
        "cat": "interiors",
        "styles": ["quiet-luxury", "modern-neoclassic", "old-money"],
        "title": {"en": "Neoclassical Living Lounge", "ru": "Неоклассическая гостиная"},
        "pin_title": "Modern Neoclassical Living | Marble Fireplace & Blue Rug",
        "pin_desc": (
            "Boiserie walls, carved marble fireplace, bouclé chairs and a royal blue rug — "
            "editorial living room by LAV Interiors.\n\n"
            "#QuietLuxury #ModernNeoclassical #OldMoney #LivingRoom #InteriorDesign #LAVInteriors"
        ),
    },
]


def find_src(glob_pat: str) -> Path:
    matches = list(ASSETS.glob(glob_pat))
    if not matches:
        raise FileNotFoundError(glob_pat)
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
                # keep light logo marks as white with soft alpha
                lum = (r + g + b) // 3
                px[x, y] = (255, 255, 255, max(a, min(255, lum + 40)))
    return im


def save_site_jpg(src: Path, dst: Path, max_edge: int = 1800, quality: int = 88) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    scale = min(1.0, max_edge / max(w, h))
    if scale < 1:
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)


def watermark(src: Path, dst: Path, logo: Image.Image, max_edge: int = 1600) -> None:
    base = Image.open(src).convert("RGBA")
    w, h = base.size
    scale = min(1.0, max_edge / max(w, h))
    if scale < 1:
        base = base.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
        w, h = base.size

    # logo ~18% of width, bottom-right with margin
    target_w = max(90, int(w * 0.18))
    lw, lh = logo.size
    ratio = target_w / lw
    mark = logo.resize((target_w, max(1, int(lh * ratio))), Image.Resampling.LANCZOS)
    # soften
    mark = mark.copy()
    a = mark.split()[-1].point(lambda v: int(v * 0.72))
    mark.putalpha(a)

    margin = max(16, int(w * 0.035))
    x = w - mark.size[0] - margin
    y = h - mark.size[1] - margin
    # dark scrim under logo for contrast on light floors
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


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    logo_src = next(ASSETS.glob("*4-1437*"))
    shutil.copy2(logo_src, LOGO_DST)
    logo = logo_rgba(logo_src)

    pins = []
    boards = set()
    for item in BATCH:
        src = find_src(item["src_glob"])
        site_path = IMAGES / item["file"]
        pin_path = OUT / item["file"].replace(".jpg", "-pin.jpg")
        save_site_jpg(src, site_path)
        watermark(src, pin_path, logo)
        item_boards = [board_name(s, item["cat"]) for s in item["styles"]]
        for b in item_boards:
            boards.add(b)
        pins.append(
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

    (ROOT / "pinterest" / "pins.jsonl").write_text(
        "\n".join(json.dumps(p, ensure_ascii=False) for p in pins) + "\n",
        encoding="utf-8",
    )
    (ROOT / "pinterest" / "boards.json").write_text(
        json.dumps(sorted(boards), ensure_ascii=False, indent=2),
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
    for b in sorted(boards):
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

    catalog = [
        {
            "id": p["id"],
            "imgKey": None,
            "img": p["site_file"],
            "cat": p["cat"],
            "styles": p["styles"],
            "title": next(i["title"] for i in BATCH if i["id"] == p["id"]),
        }
        for p in pins
    ]
    (ROOT / "pinterest" / "portfolio_items.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("OK", len(pins), "pins,", len(boards), "boards")
    for b in sorted(boards):
        print(" board:", b)


if __name__ == "__main__":
    main()
