#!/usr/bin/env python3
"""Extract the Dujiangyan chapter into a browser-friendly JavaScript file."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_dujiangyan_chapter.py INPUT_JSON OUTPUT_JS")

    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    corpus = json.loads(source.read_text(encoding="utf-8"))
    chapter = next(item for item in corpus["chapters"] if item["number"] == 4)
    payload = {
        "number": chapter["number"],
        "zh": chapter["zh"],
        "en": chapter["en"],
    }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination.write_text(
        "/* Generated from the supplied bilingual EPUB corpus. */\n"
        f"window.CHAPTER_DATA = {encoded};\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
