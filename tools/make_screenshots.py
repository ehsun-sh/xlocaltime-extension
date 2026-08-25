"""Compose Chrome Web Store screenshots.

Usage:  python tools/make_screenshots.py

Takes the raw captures in Screenshot/ and lays each one out on a 1280x800
canvas - the size the store requires - beside a short caption panel.
Output goes to store/screenshots/.
"""
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'Screenshot')
OUT = os.path.join(ROOT, 'store', 'screenshots')

W, H = 1280, 800
BG_TOP = (18, 26, 22)
BG_BOTTOM = (9, 13, 11)
ACCENT = (63, 189, 122)
TEXT = (240, 244, 241)
MUTED = (152, 165, 157)
RULE = (44, 55, 48)

F_BOLD = 'C:/Windows/Fonts/segoeuib.ttf'
F_REG = 'C:/Windows/Fonts/segoeui.ttf'
F_UNI = 'C:/Windows/Fonts/tahoma.ttf'  # has Persian digits

SHOTS = [
    {
        'file': 'Varzesh3.png',
        'out': '01-persian-schedule.png',
        'title': 'Read an Iranian schedule\nin Toronto time',
        'bullets': [
            'Times written in Tehran time are rewritten in place',
            'Persian digits stay Persian digits',
            'Works as you scroll, including content loaded later',
        ],
        'example': ('\u06f2\u06f1:\u06f3\u06f0  Tehran', '\u06f1\u06f4:\u06f0\u06f0  Toronto'),
    },
    {
        'file': 'Primeare Leage.png',
        'out': '02-premier-league.png',
        'title': 'Premier League fixtures\nin your own timezone',
        'bullets': [
            'Any site you add to the list, in any digit style',
            'Optional day marker when a match falls on the next day',
            'One setting: the site\u2019s city, and yours',
        ],
        'example': ('15:00  London', '10:00  Toronto'),
    },
    {
        'file': 'NBA.png',
        'out': '03-nba-schedule.png',
        'title': 'Tip-off times without\nthe mental arithmetic',
        'bullets': [
            'Sports schedules, TV guides, event and ticket pages',
            'The converted time keeps its place in the layout',
            'Highlight it, or let it blend into the page',
        ],
        'example': ('19:30  New York', '16:30  Los Angeles'),
    },
]


def gradient():
    strip = Image.new('RGB', (1, H))
    for y in range(H):
        f = y / float(H - 1)
        strip.putpixel((0, y), tuple(
            int(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * f) for i in range(3)))
    return strip.resize((W, H), Image.BICUBIC).convert('RGBA')


def card(shot, radius=14):
    """The capture with rounded corners and a soft drop shadow."""
    w, h = shot.size
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius, fill=255)

    pad = 36
    layer = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    shadow = Image.new('RGBA', layer.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [pad, pad + 8, pad + w, pad + h + 8], radius + 4, fill=(0, 0, 0, 165))
    layer.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18)))

    body = shot.convert('RGBA')
    body.putalpha(mask)
    layer.alpha_composite(body, (pad, pad))
    return layer


def build(spec):
    shot = Image.open(os.path.join(SRC, spec['file'])).convert('RGB')

    canvas = gradient()
    draw = ImageDraw.Draw(canvas)

    f_title = ImageFont.truetype(F_BOLD, 44)
    f_bullet = ImageFont.truetype(F_REG, 23)
    f_tag = ImageFont.truetype(F_BOLD, 21)
    f_ex = ImageFont.truetype(F_UNI, 26)
    f_ex_small = ImageFont.truetype(F_REG, 17)

    # --- capture on the right ---
    max_h, max_w = 620, 470
    scale = min(max_h / float(shot.height), max_w / float(shot.width), 2.2)
    shot = shot.resize((max(1, int(shot.width * scale)),
                        max(1, int(shot.height * scale))), Image.LANCZOS)
    art = card(shot)
    art_x = W - art.width - 40
    canvas.alpha_composite(art, (art_x, (H - art.height) // 2))

    # --- text panel on the left ---
    x = 76
    draw.multiline_text((x, 96), spec['title'], font=f_title, fill=TEXT, spacing=10)

    y = 96 + 2 * 52 + 46
    for line in spec['bullets']:
        draw.ellipse([x + 2, y + 9, x + 10, y + 17], fill=ACCENT)
        draw.text((x + 26, y), line, font=f_bullet, fill=MUTED)
        y += 42

    # --- before / after strip ---
    y += 26
    before, after = spec['example']
    draw.text((x, y), 'ON THE PAGE', font=f_ex_small, fill=(110, 122, 114))
    draw.text((x + 260, y), 'YOU READ', font=f_ex_small, fill=(110, 122, 114))
    y += 26
    draw.text((x, y), before, font=f_ex, fill=(190, 199, 193))
    draw.text((x + 218, y - 2), '\u2192', font=f_ex, fill=ACCENT)
    box = draw.textbbox((x + 260, y), after, font=f_ex)
    draw.rounded_rectangle([box[0] - 10, box[1] - 7, box[2] + 10, box[3] + 7],
                           8, fill=(30, 74, 52))
    draw.text((x + 260, y), after, font=f_ex, fill=(150, 235, 190))

    # --- footer ---
    draw.line([(x, 712), (W - 40, 712)], fill=RULE, width=1)
    draw.text((x, 730), 'X Localtime', font=f_tag, fill=ACCENT)
    draw.text((x + 150, 733), 'free \u00b7 open source \u00b7 no data collected',
              font=f_ex_small, fill=(110, 122, 114))

    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, spec['out'])
    canvas.convert('RGB').save(path, 'PNG', optimize=True)
    print('%s  %dx%d  %.0f KB' % (spec['out'], W, H, os.path.getsize(path) / 1024.0))


if __name__ == '__main__':
    for item in SHOTS:
        build(item)
