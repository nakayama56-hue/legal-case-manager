#!/usr/bin/env python3
"""
このスクリプトを実行するとSWのキャッシュバージョンを自動更新してZIPを作成します。
使い方: python3 pack.py
"""
import datetime, re, zipfile, os

# タイムスタンプ生成
ts = datetime.datetime.now().strftime('%Y%m%d%H%M')
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
