"""Create responsive WebP assets and update local image references.

Desktop variants are capped at 1600 px wide; mobile variants at 720 px.
Original source files are deliberately preserved as a recoverable archive.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "images"
RASTER_SUFFIXES = {".jpg", ".jpeg", ".png"}
DESKTOP_WIDTH = 1600
MOBILE_WIDTH = 720

NEW_PROJECTS = {
    "portfolio-hire/exterior-01": Path(r"D:\Портфолио 2026\мини-проекты\2\collage-variant-03-split-story-4x3.png"),
    "portfolio-hire/exterior-02": Path(r"D:\Портфолио 2026\мини-проекты\1 (8)\Портфолио\exec-c1a87f67-53fe-4b16-8979-34285dfa0af1.png"),
    "portfolio-hire/commercial-01": Path(r"E:\Restaurant_chamber_hall_interior…_20260929141309.jpg"),
    "portfolio-hire/commercial-02": Path(r"D:\Портфолио 2026\мини-проекты\2 (2)\Office_kitchen_tasting_area_inte…_202607301252.jpeg"),
    "portfolio-hire/commercial-03": Path(r"D:\Портфолио 2026\мини-проекты\2 (2)\Smart_meeting_room_interior_design_202607301309.jpeg"),
    "portfolio-hire/commercial-04": Path(r"D:\Портфолио 2026\мини-проекты\2 (2)\Professionals_in_meeting_room_202607301227 (1).jpeg"),
}


def webp_copy(source: Path, destination: Path, max_width: int, quality: int) -> tuple[int, int]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        width, height = image.size
        if width > max_width:
            new_height = round(height * max_width / width)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.save(destination, "WEBP", quality=quality, method=6)
        return image.size


def add_asset(source: Path, base: Path, manifest: dict[str, dict[str, int | str]]) -> None:
    desktop = base.with_suffix(".webp")
    mobile = base.with_name(base.name + "-mobile").with_suffix(".webp")
    desktop_size = webp_copy(source, desktop, DESKTOP_WIDTH, 82)
    mobile_size = webp_copy(source, mobile, MOBILE_WIDTH, 80)
    url = "/" + desktop.relative_to(ROOT).as_posix()
    manifest[url] = {
        "mobile": "/" + mobile.relative_to(ROOT).as_posix(),
        "mobileWidth": mobile_size[0],
        "width": desktop_size[0],
    }


def rewrite_references(mapping: dict[str, str]) -> None:
    text_files = [
        path
        for extension in ("*.html", "*.css", "*.js")
        for path in ROOT.rglob(extension)
        if ".git" not in path.parts and path.name != "lav-image-manifest.js"
    ]
    for path in text_files:
        content = path.read_text(encoding="utf-8")
        updated = content
        for old, new in mapping.items():
            updated = updated.replace(old, new)
        if path.suffix == ".html" and "lav-analytics.js" in updated and "lav-image-manifest.js" not in updated:
            updated = re.sub(
                r'(<script\s+defer\s+src="/js/lav-analytics\.js[^>]*></script>)',
                '<script defer src="/js/lav-image-manifest.js?v=20260929a"></script>\n  \\1',
                updated,
                count=1,
            )
        if updated != content:
            path.write_text(updated, encoding="utf-8", newline="\n")


def main() -> None:
    manifest: dict[str, dict[str, int | str]] = {}
    mapping: dict[str, str] = {}

    originals = sorted(
        path for path in IMAGE_ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in RASTER_SUFFIXES
    )
    for source in originals:
        relative = source.relative_to(ROOT).as_posix()
        base = source.with_suffix("")
        add_asset(source, base, manifest)
        mapping[relative] = base.with_suffix(".webp").relative_to(ROOT).as_posix()

    for relative_base, source in NEW_PROJECTS.items():
        if not source.is_file():
            raise FileNotFoundError(f"Missing project source: {source}")
        add_asset(source, IMAGE_ROOT / relative_base, manifest)

    rewrite_references(mapping)
    manifest_path = ROOT / "js" / "lav-image-manifest.js"
    payload = json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
    manifest_path.write_text("window.LAV_IMAGE_VARIANTS=" + payload + ";\n", encoding="utf-8", newline="\n")

    original_bytes = sum(path.stat().st_size for path in originals)
    webp_bytes = sum(path.stat().st_size for path in IMAGE_ROOT.rglob("*.webp"))
    print(f"Optimized {len(originals)} existing images and {len(NEW_PROJECTS)} new project images.")
    print(f"Original raster size: {original_bytes / 1024 / 1024:.2f} MB")
    print(f"Responsive WebP size (desktop + mobile): {webp_bytes / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
