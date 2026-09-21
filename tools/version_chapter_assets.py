#!/usr/bin/env python3
"""Refresh local CSS/JS content hashes after chapter UI changes."""
from pathlib import Path
import hashlib
import re
root = Path(__file__).resolve().parents[1]
for page in [root/'site/index.html', *(root/'site/chapters').glob('*/index.html')]:
    def version(match):
        path = (page.parent/match[2]).resolve()
        if not path.is_file():
            return match[0]
        digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
        return match[1] + match[2] + '?v=' + digest + '"'
    markup = re.sub(r'((?:src|href)=")((?:\./|\.\./)[^"?]+\.(?:js|css))(?:\?[^" ]*)?"', version, page.read_text())
    page.write_text(markup)
    print('Versioned', page.relative_to(root))
