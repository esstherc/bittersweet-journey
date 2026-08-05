#!/usr/bin/env python3
"""Extract chapter 10 without changing its original five-section structure."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_mountain_resort_chapter.py INPUT_JSON OUTPUT_JS")

    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    corpus = json.loads(source.read_text(encoding="utf-8"))
    chapter = next(item for item in corpus["chapters"] if item["number"] == 10)

    payload = {
        "number": chapter["number"],
        "zh": {
            "title": chapter["zh"]["title"],
            "intro": chapter["zh"]["intro"],
            "sections": chapter["zh"]["sections"],
        },
        "en": {
            "title": chapter["en"]["title"],
            "intro": chapter["en"]["intro"],
            "sections": chapter["en"]["sections"],
        },
    }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        "/* Generated from the supplied bilingual EPUB corpus. */\n"
        "/* The five reading movements preserve the original numbered sections. */\n"
        f"window.CHAPTER_DATA = {encoded};\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
