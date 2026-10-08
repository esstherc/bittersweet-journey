"""Normalize site Chinese with Windows' Simplified Chinese locale mapping.

Run with --check to audit without writing. Keep UTF-8 and existing line endings.
"""
import ctypes
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "site"
CHECK = "--check" in sys.argv
mapping = ctypes.windll.kernel32.LCMapStringEx
mapping.argtypes = [ctypes.c_wchar_p, ctypes.c_uint, ctypes.c_wchar_p,
                    ctypes.c_int, ctypes.c_wchar_p, ctypes.c_int,
                    ctypes.c_void_p, ctypes.c_void_p, ctypes.c_ssize_t]
mapping.restype = ctypes.c_int

def simplified(text):
    size = mapping("zh-CN", 0x02000000, text, len(text), None, 0, None, None, 0)
    if not size:
        raise ctypes.WinError()
    result = ctypes.create_unicode_buffer(size)
    if not mapping("zh-CN", 0x02000000, text, len(text), result, size, None, None, 0):
        raise ctypes.WinError()
    return result[:size]

changed = []
for file in sorted(ROOT.rglob("*")):
    if file.suffix not in {".html", ".js", ".css", ".json", ".svg", ".webmanifest"}:
        continue
    raw = file.read_bytes()
    text = raw.decode("utf-8")
    # Map only Chinese runs: Win32 lengths are UTF-16, so avoid astral emoji.
    converted = re.sub(r"[\u3400-\u9fff]+", lambda match: simplified(match[0]), text)
    if text != converted:
        changed.append(str(file.relative_to(ROOT)))
        if not CHECK:
            file.write_bytes(converted.encode("utf-8"))
print("Chinese conversion candidates:" if CHECK else "Simplified Chinese updated:", len(changed))
print("\n".join(changed))
if CHECK and changed:
    sys.exit(1)
