#!/usr/bin/env python3
"""Prune obsolete visual artifacts and convert retained raster assets to WebP."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
FULL_SYSTEM = ROOT / "docs" / "full-system"


def referenced_full_system_screenshots() -> set[str]:
    pattern = re.compile(r"screenshots/([A-Za-z0-9._/-]+\.(?:png|webp|jpe?g))", re.I)
    result: set[str] = set()
    for document in FULL_SYSTEM.glob("*.md"):
        result.update(Path(match).name for match in pattern.findall(document.read_text(encoding="utf-8")))
    return result


def prune() -> tuple[int, int]:
    removed = 0
    removed_bytes = 0

    keep = referenced_full_system_screenshots()
    screenshot_dir = FULL_SYSTEM / "screenshots"
    for path in screenshot_dir.iterdir():
        if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"} and path.name not in keep:
            removed_bytes += path.stat().st_size
            path.unlink()
            removed += 1

    for directory in (
        ROOT / "docs" / "reports" / "screenshots" / "milestone-2",
        ROOT / "docs" / "reports" / "screenshots" / "mobile-audit",
    ):
        if directory.exists():
            for path in directory.rglob("*"):
                if path.is_file():
                    removed_bytes += path.stat().st_size
                    removed += 1
            shutil.rmtree(directory)

    for path in (
        ROOT / "first.png",
        ROOT / "logo2.png",
        ROOT / "mara-stage-debug.png",
        ROOT / "shared-ui-debug.png",
        ROOT / "docs" / "reports" / "reports.zip",
        ROOT / "prototype" / "assets" / "images" / "favicon-16.png",
        ROOT / "prototype" / "assets" / "images" / "favicon-32.png",
        ROOT / "prototype" / "assets" / "images" / "favicon-192.png",
        ROOT / "prototype" / "assets" / "images" / "favicon-master.png",
        ROOT / "prototype" / "assets" / "images" / "apple-touch-icon.png",
    ):
        if path.exists():
            removed_bytes += path.stat().st_size
            path.unlink()
            removed += 1

    return removed, removed_bytes


def settings_for(path: Path, image: Image.Image) -> dict:
    relative = path.relative_to(ROOT).as_posix()
    if "/screenshots/" in relative:
        return {"quality": 82, "method": 6}
    if image.mode in {"RGBA", "LA"}:
        return {"quality": 88, "method": 6, "exact": True}
    if path.name == "logo2.png":
        return {"quality": 92, "method": 6}
    return {"quality": 84, "method": 6}


def convert_images() -> tuple[int, int, int]:
    converted = 0
    source_bytes = 0
    output_bytes = 0
    candidates = sorted(
        path
        for path in ROOT.rglob("*")
        if ".git" not in path.parts and path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg"}
    )
    for source in candidates:
        target = source.with_suffix(".webp")
        temporary = target.with_name(f".{target.name}.tmp")
        before = source.stat().st_size
        with Image.open(source) as image:
            image.load()
            size = image.size
            image.save(temporary, format="WEBP", **settings_for(source, image))
        with Image.open(temporary) as check:
            check.load()
            if check.size != size or check.format != "WEBP":
                raise RuntimeError(f"Conversion validation failed: {source}")
        temporary.replace(target)
        source.unlink()
        converted += 1
        source_bytes += before
        output_bytes += target.stat().st_size
    return converted, source_bytes, output_bytes


def main() -> None:
    removed, removed_bytes = prune()
    converted, source_bytes, output_bytes = convert_images()
    print(f"Pruned {removed} obsolete/duplicate files ({removed_bytes / 1024 / 1024:.1f} MiB).")
    print(f"Converted {converted} raster files: {source_bytes / 1024 / 1024:.1f} MiB -> {output_bytes / 1024 / 1024:.1f} MiB.")


if __name__ == "__main__":
    main()
