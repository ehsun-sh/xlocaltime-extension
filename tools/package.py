"""Build the Chrome Web Store upload package.

Usage:  python tools/package.py

Writes dist/xlocaltime-<version>.zip containing only the files the browser
actually loads - no tests, tooling, git data or repository documentation.
"""
import json
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')

# Everything the extension needs at runtime, and nothing else.
INCLUDE_FILES = [
    'manifest.json',
    'src/tz.js',
    'src/i18n.js',
    'src/cities.js',
    'src/content.js',
    'src/content.css',
    'options/options.html',
    'options/options.css',
    'options/options.js',
    'popup/popup.html',
    'popup/popup.css',
    'popup/popup.js',
    'fonts/vazirmatn.css',
    'fonts/Vazirmatn-Regular.woff2',
    'fonts/Vazirmatn-Bold.woff2',
    'fonts/OFL.txt',
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'icons/icon128.png',
    '_locales/en/messages.json',
    '_locales/fa/messages.json',
]


def main():
    manifest_path = os.path.join(ROOT, 'manifest.json')
    with open(manifest_path, encoding='utf-8') as fh:
        version = json.load(fh)['version']

    missing = [f for f in INCLUDE_FILES
               if not os.path.isfile(os.path.join(ROOT, f))]
    if missing:
        raise SystemExit('missing files: %s' % ', '.join(missing))

    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, 'x-localtime-%s.zip' % version)
    if os.path.exists(out):
        os.remove(out)

    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
        for name in INCLUDE_FILES:
            zf.write(os.path.join(ROOT, name), name)

    size = os.path.getsize(out)
    print('%s  (%d files, %.1f KB)' % (out, len(INCLUDE_FILES), size / 1024.0))


if __name__ == '__main__':
    main()
