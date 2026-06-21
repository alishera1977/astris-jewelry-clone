#!/usr/bin/env python3
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]

BASE_BLOCK = """    <base href="https://www.astrisjewelry.ru/" />
"""

for path in ROOT.rglob("*.html"):
    text = path.read_text(encoding="utf-8")
    if BASE_BLOCK not in text:
        continue
    text = text.replace(BASE_BLOCK, "")
    path.write_text(text, encoding="utf-8")
    print(path.relative_to(ROOT))
