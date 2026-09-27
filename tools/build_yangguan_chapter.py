#!/usr/bin/env python3
"""Extract and editorially pace chapter 8, 阳关雪 / Snow on the Southern Pass.

The essay has no numbered sections. Five parts pace the map; each cut falls on the same
sentence in both editions. The English edition merges Chinese paragraphs 4 and 5, so the
English indices after that point are one lower.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


BEATS = {
    "zh": (
        ("诗与远方", 0, 6),
        ("雪漠孤行", 6, 12),
        ("荒原坟冢", 12, 17),
        ("阳关古址", 17, 22),
        ("西出阳关", 22, 31),
    ),
    "en": (
        ("POEMS AND DISTANT PLACES", 0, 5),
        ("ALONE IN THE SNOW", 5, 11),
        ("MOUNDS ON THE WASTELAND", 11, 16),
        ("THE RUINS OF YANGGUAN", 16, 21),
        ("WEST OF YANGGUAN", 21, 30),
    ),
}

# The first sentence of each part, used to fail loudly if the corpus ever shifts.
ANCHORS = {
    "zh": ("在中国古代", "今天，我冲着王维", "地上有一些奇怪的凹凸", "远处已有树影", "王维的笔触实在是温厚"),
    "en": ("IN ANCIENT CHINA", "On this day", "There were a series of odd bumps", "There were the silhouettes of trees", "Wang Wei’s brushstrokes"),
}


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_yangguan_chapter.py INPUT_JSON OUTPUT_JS")

    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    corpus = json.loads(source.read_text(encoding="utf-8"))
    chapter = next(item for item in corpus["chapters"] if item["number"] == 8)

    payload: dict[str, object] = {"number": chapter["number"]}
    for language in ("zh", "en"):
        original = chapter[language]
        paragraphs = [
            paragraph
            for section in original["sections"]
            for paragraph in section["paragraphs"]
        ]
        beats = BEATS[language]
        if beats[-1][2] != len(paragraphs):
            raise SystemExit(f"{language}: expected {beats[-1][2]} paragraphs, found {len(paragraphs)}")
        for (label, start, _end), anchor in zip(beats, ANCHORS[language]):
            if not paragraphs[start].startswith(anchor):
                raise SystemExit(f"{language}: part '{label}' does not start with '{anchor}'")
        payload[language] = {
            "title": original["title"],
            "intro": original["intro"],
            "sections": [
                {"label": label, "paragraphs": paragraphs[start:end]}
                for label, start, end in beats
            ],
        }

    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        "/* Generated from the supplied bilingual EPUB corpus by tools/build_yangguan_chapter.py. */\n"
        "/* Five reading parts are editorial pacing markers, not original numbered sections. */\n"
        f"window.CHAPTER_DATA = {encoded};\n",
        encoding="utf-8",
    )
    print(f"wrote {destination}")


if __name__ == "__main__":
    main()
