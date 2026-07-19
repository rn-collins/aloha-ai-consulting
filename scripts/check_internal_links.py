#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

SKIP = {'http','https','mailto','tel','data','javascript'}

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=set()
    def handle_starttag(self, tag, attrs):
        values=dict(attrs)
        if values.get('id'): self.ids.add(values['id'])
        for key in ('href','src'):
            if values.get(key): self.links.append(values[key].strip())

def read(path):
    p=Parser(); p.feed(path.read_text(encoding='utf-8')); return p

def resolve(source, raw):
    decoded=unquote(raw)
    base=Path(decoded.lstrip('/')) if decoded.startswith('/') else source.parent/decoded
    if decoded.endswith('/'): return base/'index.html'
    if base.suffix: return base
    if base.exists(): return base
    html=base.with_suffix('.html')
    return html if html.exists() else base

RUNTIME_PREFIXES = ('/_vercel/',)

def main():
    files=[p for p in Path('.').rglob('*.html') if '.git' not in p.parts]
    parsed={p:read(p) for p in files}; failures=[]
    for source, doc in parsed.items():
        for raw in doc.links:
            split=urlsplit(raw)
            if split.scheme.lower() in SKIP or raw.startswith('//'): continue
            if any(raw.startswith(p) for p in RUNTIME_PREFIXES): continue
            if not split.path and split.fragment:
                if split.fragment not in doc.ids: failures.append(f'{source}: missing fragment #{split.fragment}')
                continue
            if not split.path: continue
            target=resolve(source, split.path)
            if not target.exists(): failures.append(f'{source}: {raw!r} -> missing {target}'); continue
            if split.fragment and target.suffix.lower()=='.html':
                target_doc=parsed.get(target) or read(target)
                if split.fragment not in target_doc.ids: failures.append(f'{source}: {raw!r} -> missing #{split.fragment} in {target}')
    if failures:
        print('Internal-link validation failed:')
        for item in failures: print('-',item)
        return 1
    print(f'Validated internal links across {len(files)} HTML files.')
    return 0

if __name__=='__main__': raise SystemExit(main())
