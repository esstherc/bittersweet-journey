#!/usr/bin/env python3
"""Extract chapter 6, 莫高窟 / Mogao Caves, for the browser reader.

The four numbered sections are the essay's own. The English follows an older edition (longer
sections one and four); both are kept as written. The English heading in the corpus reads
"Mogai Caves", a slip in the translation's heading, so the title is set to "Mogao Caves".
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

LABELS = {"zh": ["一", "二", "三", "四"], "en": ["I", "II", "III", "IV"]}
TITLES = {"zh": "莫高窟", "en": "Mogao Caves"}


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_mogao_chapter.py INPUT_JSON OUTPUT_JS")
    corpus = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    chapter = next(item for item in corpus["chapters"] if item["number"] == 6)
    payload: dict[str, object] = {"number": chapter["number"]}
    for language in ("zh", "en"):
        original = chapter[language]
        labels = [section["label"] for section in original["sections"]]
        if labels != LABELS[language]:
            raise SystemExit(f"{language}: unexpected section labels {labels}")
        if original["intro"]:
            raise SystemExit(f"{language}: unexpected intro")
        payload[language] = {
            "title": TITLES[language],
            "sections": [{"label": s["label"], "paragraphs": s["paragraphs"]} for s in original["sections"]],
        }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination = Path(sys.argv[2])
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        "/* Generated from the supplied bilingual EPUB corpus by tools/build_mogao_chapter.py. */\n"
        "/* Four sections are the essay's own numbered sections. */\n"
        f"window.CHAPTER_DATA = {encoded};\n",
        encoding="utf-8",
    )
    print(f"wrote {destination}")


if __name__ == "__main__":
    main()
