from __future__ import annotations

import json
import re
import shutil
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
IS_PACKAGED_PROJECT = SCRIPT_DIR.name in {"scripts", "tools"}
PROJECT_ROOT = SCRIPT_DIR.parent if IS_PACKAGED_PROJECT else SCRIPT_DIR.parent.parent
WORK_ROOT = PROJECT_ROOT / "work" / "extracted" if IS_PACKAGED_PROJECT else SCRIPT_DIR
SOURCE_ROOT = PROJECT_ROOT / "source"
ZH_ROOT = WORK_ROOT / "zh"
EN_ROOT = WORK_ROOT / "en"
ZH_TEXT = ZH_ROOT / "OEBPS" / "Text"
EN_TEXT = EN_ROOT / "OEBPS"

MAPPING = [
    (1, "part0006.xhtml", "c01.xhtml"),
    (2, "part0007.xhtml", "c02.xhtml"),
    (3, "part0008.xhtml", "c03.xhtml"),
    (4, "part0009.xhtml", "c04.xhtml"),
    (5, "part0010.xhtml", "c05.xhtml"),
    (6, "part0011.xhtml", "c06.xhtml"),
    (7, "part0012.xhtml", "c07.xhtml"),
    (8, "part0013.xhtml", "c08.xhtml"),
    (9, "part0014.xhtml", "c09.xhtml"),
    (10, "part0018.xhtml", "c10.xhtml"),
    (11, "part0022.xhtml", "c11.xhtml"),
    (12, "part0023.xhtml", "c12.xhtml"),
    (13, "part0024.xhtml", "c13.xhtml"),
    (14, "part0025.xhtml", "c14.xhtml"),
    (15, "part0026.xhtml", "c15.xhtml"),
    (16, "part0027.xhtml", "c16.xhtml"),
    (17, "part0028.xhtml", "c17.xhtml"),
    (18, "part0029.xhtml", "c18.xhtml"),
    (19, "part0030.xhtml", "c19.xhtml"),
    (20, "part0031.xhtml", "c20.xhtml"),
]

UNTRANSLATED = [
    "part0015.xhtml",
    "part0016.xhtml",
    "part0017.xhtml",
    "part0019.xhtml",
    "part0020.xhtml",
    "part0021.xhtml",
]


def safe_extract(epub_path: Path, destination: Path) -> None:
    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir(parents=True, exist_ok=True)
    root = destination.resolve()
    with zipfile.ZipFile(epub_path) as archive:
        for member in archive.infolist():
            target = (destination / member.filename).resolve()
            if root not in target.parents and target != root:
                raise ValueError(f"Unsafe archive member: {member.filename}")
        archive.extractall(destination)


def ensure_sources_extracted() -> None:
    if ZH_TEXT.exists() and EN_TEXT.exists():
        return
    if not IS_PACKAGED_PROJECT:
        raise FileNotFoundError("Expected extracted EPUB directories zh/ and en/.")

    zh_epub = SOURCE_ROOT / "文化苦旅.epub"
    en_candidates = sorted(SOURCE_ROOT.glob("A Bittersweet Journey Through Culture*.epub"))
    if not zh_epub.exists() or not en_candidates:
        raise FileNotFoundError("Missing source EPUB files in source/.")
    safe_extract(zh_epub, ZH_ROOT)
    safe_extract(en_candidates[0], EN_ROOT)


def normalize(text: str | None) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def read_chapter(path: Path) -> dict:
    root = ET.parse(path).getroot()
    headings = []
    paragraphs = []
    for node in root.iter():
        name = local_name(node.tag)
        text = normalize("".join(node.itertext()))
        if not text:
            continue
        if name in {"h1", "h2", "h3"}:
            headings.append({"level": int(name[1]), "text": text})
        elif name == "p":
            paragraphs.append(text)

    primary_title = next(
        (
            item["text"]
            for item in headings
            if item["level"] == 1 and not item["text"].upper().startswith("CHAPTER ")
        ),
        headings[0]["text"] if headings else "",
    )
    return {
        "title": primary_title,
        "section_count": sum(1 for item in headings if item["level"] == 2),
        "paragraph_count": len(paragraphs),
        "character_count": sum(len(item) for item in paragraphs),
        "opening": paragraphs[0][:180] if paragraphs else "",
        "closing": paragraphs[-1][-180:] if paragraphs else "",
    }


def read_sectioned_chapter(path: Path) -> dict:
    root = ET.parse(path).getroot()
    title = ""
    intro = []
    sections = []
    current_section = None

    for node in root.iter():
        name = local_name(node.tag)
        text = normalize("".join(node.itertext()))
        if not text:
            continue
        if name == "h1" and not text.upper().startswith("CHAPTER "):
            title = title or text
        elif name == "h2":
            current_section = {"label": text, "paragraphs": []}
            sections.append(current_section)
        elif name == "p":
            if current_section is None:
                intro.append(text)
            else:
                current_section["paragraphs"].append(text)

    if not sections:
        sections = [{"label": "main", "paragraphs": intro}]
        intro = []

    return {"title": title, "intro": intro, "sections": sections}


def main() -> None:
    ensure_sources_extracted()
    chapters = []
    for number, zh_file, en_file in MAPPING:
        zh = read_chapter(ZH_TEXT / zh_file)
        en = read_chapter(EN_TEXT / en_file)
        chapters.append(
            {
                "number": number,
                "zh_file": zh_file,
                "en_file": en_file,
                "zh": zh,
                "en": en,
                "section_count_matches": zh["section_count"] == en["section_count"],
            }
        )

    untranslated = []
    for zh_file in UNTRANSLATED:
        untranslated.append({"zh_file": zh_file, "zh": read_chapter(ZH_TEXT / zh_file)})

    result = {
        "source_summary": {
            "zh_edition": "《文化苦旅》新版，长江文艺出版社，2014",
            "en_edition": "A Bittersweet Journey Through Culture, CN Times Books, 2015",
            "zh_chapter_count": 26,
            "en_chapter_count": 20,
            "paired_chapter_count": len(chapters),
            "untranslated_chapter_count": len(untranslated),
        },
        "paired_chapters": chapters,
        "untranslated_chapters": untranslated,
    }
    content_dir = PROJECT_ROOT / "content" if IS_PACKAGED_PROJECT else SCRIPT_DIR
    content_dir.mkdir(parents=True, exist_ok=True)
    output_path = content_dir / "chapter-alignment.json"
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    corpus = {
        "project": "文化苦旅双语交互地图",
        "alignment_level": "chapter_and_section",
        "alignment_note": (
            "中英文段落数量略有差异，当前仅保证篇章与分节对应；"
            "不要把同索引段落视为可靠的一一翻译对齐。"
        ),
        "sources": result["source_summary"],
        "chapters": [],
    }
    for number, zh_file, en_file in MAPPING:
        corpus["chapters"].append(
            {
                "id": f"chapter-{number:02d}",
                "number": number,
                "zh_source_file": zh_file,
                "en_source_file": en_file,
                "zh": read_sectioned_chapter(ZH_TEXT / zh_file),
                "en": read_sectioned_chapter(EN_TEXT / en_file),
            }
        )

    outputs = PROJECT_ROOT / "content" if IS_PACKAGED_PROJECT else PROJECT_ROOT / "outputs"
    outputs.mkdir(parents=True, exist_ok=True)
    corpus_path = outputs / "bilingual-corpus.json"
    corpus_path.write_text(json.dumps(corpus, ensure_ascii=False, indent=2), encoding="utf-8")

    print("No.  中文篇名               English title                         Sections  Paragraphs zh/en")
    print("-" * 100)
    for item in chapters:
        print(
            f'{item["number"]:>2}   {item["zh"]["title"]:<20} '
            f'{item["en"]["title"]:<37} '
            f'{item["zh"]["section_count"]:>2}/{item["en"]["section_count"]:<2}     '
            f'{item["zh"]["paragraph_count"]:>3}/{item["en"]["paragraph_count"]:<3}'
        )
    print("\nUntranslated:")
    for item in untranslated:
        print(f'- {item["zh"]["title"]} ({item["zh_file"]})')


if __name__ == "__main__":
    main()
