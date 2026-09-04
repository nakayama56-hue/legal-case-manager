#!/usr/bin/env python3
"""
このスクリプトを実行するとSWのキャッシュバージョンを自動更新してZIPを作成します。
使い方: python3 pack.py
"""
import re, zipfile, os

# 本体HTMLのバージョン表記から採る（例: ver. 8.2.7 → 8-2-7）
with open('legal-case-manager.html', 'r', encoding='utf-8') as f:
    m = re.search(r'ver\. (\d+\.\d+\.\d+)', f.read())
if not m:
    raise SystemExit('legal-case-manager.html からバージョン表記が見つかりません')
ts = m.group(1).replace('.', '-')
print(f'Cache version: legal-case-manager-{ts}')

# sw.jsのキャッシュ名を更新
with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()
sw = re.sub(
    r"const CACHE_NAME = 'legal-case-manager-.*?';",
    f"const CACHE_NAME = 'legal-case-manager-{ts}';",
    sw
)
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)
print('sw.js updated')

# ZIPを作成
files = ['legal-case-manager.html', 'manifest.json', 'sw.js', 'icon-192.png', 'icon-512.png']
with zipfile.ZipFile('legal-case-manager-pwa.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for fn in files:
        if os.path.exists(fn):
            z.write(fn)
            print(f'Added: {fn}')
        else:
            print(f'WARNING: {fn} not found')

print(f'\n✓ legal-case-manager-pwa.zip を作成しました')
print('Netlifyの点線枠にドロップしてください')
