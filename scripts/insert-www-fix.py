#!/usr/bin/env python3
import glob
import pathlib

SNIPPET = """    <base href="https://www.astrisjewelry.ru/" />
    <script>
      if (location.hostname === "astrisjewelry.ru") {
        location.replace(
          "https://www.astrisjewelry.ru" +
            location.pathname +
            location.search +
            location.hash
        );
      }
    </script>
"""

MARKER = 'base href="https://www.astrisjewelry.ru/"'
ROOT = pathlib.Path(__file__).resolve().parents[1]

for path in ROOT.rglob("*.html"):
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        continue
    needle = '<meta charset="UTF-8" />'
    if needle not in text:
        continue
    text = text.replace(needle, needle + "\n" + SNIPPET, 1)
    path.write_text(text, encoding="utf-8")
    print(path.relative_to(ROOT))
