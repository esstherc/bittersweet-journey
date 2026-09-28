#!/usr/bin/env python3
"""Extract chapter 11, 鱼尾山屋 / Fish Tail Lodge, for the browser reader.

The six numbered sections are the essay's own. The author's note ("说明") before section one
is kept as `preface`; the Chinese note opens with the heading line "说明：", which becomes
the preface title instead of a paragraph.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

LABELS = {"zh": ["一", "二", "三", "四", "五", "六"], "en": ["I", "II", "III", "IV", "V", "VI"]}


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_fish_tail_lodge_chapter.py INPUT_JSON OUTPUT_JS")
    corpus = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    chapter = next(item for item in corpus["chapters"] if item["number"] == 11)
    payload: dict[str, object] = {"number": chapter["number"]}
    for language in ("zh", "en"):
        original = chapter[language]
        labels = [section["label"] for section in original["sections"]]
        if labels != LABELS[language]:
            raise SystemExit(f"{language}: unexpected section labels {labels}")
        preface = list(original["intro"])
        if language == "zh":
            if preface[0].strip() != "说明：":
                raise SystemExit("zh: the author's note should open with 说明：")
            preface = preface[1:]
        payload[language] = {
            "title": original["title"],
            "preface": preface,
            "sections": [{"label": s["label"], "paragraphs": s["paragraphs"]} for s in original["sections"]],
        }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination = Path(sys.argv[2])
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        "/* Generated from the supplied bilingual EPUB corpus by tools/build_fish_tail_lodge_chapter.py. */\n"
        "/* Six sections are the essay's own numbered sections; `preface` is the author's note. */\n"
        f"window.CHAPTER_DATA = {encoded};\n",
        encoding="utf-8",
    )
    print(f"wrote {destination}")


if __name__ == "__main__":
    main()
