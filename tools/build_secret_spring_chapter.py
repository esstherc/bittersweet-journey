#!/usr/bin/env python3
"""Extract and editorially pace chapter 7 for the browser reader."""

from __future__ import annotations

import json
import sys
from pathlib import Path


BEATS = {
    "zh": (
        ("脚印", 0, 15),
        ("山脊", 15, 20),
        ("下坡", 20, 32),
        ("隐泉", 32, 41),
    ),
    "en": (
        ("FOOTPRINTS", 0, 14),
        ("THE RIDGE", 14, 19),
        ("DESCENT", 19, 31),
        ("THE SPRING", 31, 39),
    ),
}


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_secret_spring_chapter.py INPUT_JSON OUTPUT_JS")

    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    corpus = json.loads(source.read_text(encoding="utf-8"))
    chapter = next(item for item in corpus["chapters"] if item["number"] == 7)

    payload: dict[str, object] = {"number": chapter["number"]}
    for language in ("zh", "en"):
        original = chapter[language]
        paragraphs = [
            paragraph
            for section in original["sections"]
            for paragraph in section["paragraphs"]
        ]
        sections = [
            {
                "label": label,
                "paragraphs": paragraphs[start:end],
            }
            for label, start, end in BEATS[language]
        ]
        payload[language] = {
            "title": original["title"],
            "intro": original["intro"],
            "sections": sections,
        }

    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination.write_text(
        "/* Generated from the supplied bilingual EPUB corpus. */\n"
        "/* Four reading beats are editorial pacing markers, not original numbered sections. */\n"
        f"window.CHAPTER_DATA = {encoded};\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
