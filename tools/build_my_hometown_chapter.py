#!/usr/bin/env python3
"""Extract the original five sections of My Hometown for the browser."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_my_hometown_chapter.py INPUT_JSON OUTPUT_JS")
    corpus = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    chapter = next(item for item in corpus["chapters"] if item["number"] == 3)
    payload = {
        "number": 3,
        "zh": chapter["zh"],
        "en": chapter["en"],
    }
    destination = Path(sys.argv[2])
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        "/* Generated from the supplied bilingual EPUB corpus. */\n"
        "/* The original five numbered sections are preserved. */\n"
        f"window.CHAPTER_DATA = {json.dumps(payload, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
