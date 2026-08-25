"""Compose the Chrome Web Store promo tiles.

Usage:  python tools/make_promo.py

Writes store/promo/small-tile-440x280.png and marquee-1400x560.png as
24-bit PNGs without an alpha channel, which is what the store accepts.

The artwork is drawn from scratch rather than built from screenshots, so no
third-party logo or brand ends up in promotional material.
"""
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'store', 'promo')

BG_TOP = (20, 30, 25)
BG_BOTTOM = (9, 13, 11)
ACCENT = (63, 189, 122)
TEXT = (240, 244, 241)
MUTED = (150, 164, 156)
DIM = (120, 133, 125)
CHIP_BG = (28, 74, 51)
CHIP_TEXT = (150, 235, 190)
CARD_BG = (247, 249, 248)
CARD_LINE = (226, 231, 228)
CARD_TEXT = (58, 68, 62)

F_BOLD = 'C:/Windows/Fonts/segoeuib.ttf'
F_REG = 'C:/Windows/Fonts/segoeui.ttf'
F_UNI = 'C:/Windows/Fonts/tahoma.ttf'
F_UNI_B = 'C:/Windows/Fonts/tahomabd.ttf'

FA_2130 = '\u06f2\u06f1:\u06f3\u06f0'
FA_1400 = '\u06f1\u06f4:\u06f0\u06f0'


def gradient(size):
    strip = Image.new('RGB', (1, size[1]))
    for y in range(size[1]):
        f = y / float(size[1] - 1)
        strip.putpixel((0, y), tuple(
            int(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * f) for i in range(3)))
    return strip.resize(size, Image.BICUBIC).convert('RGB')


def glow(img, center, radius, colour=(63, 189, 122), strength=46):
    """A soft accent glow behind the artwork."""
    layer = Image.new('RGB', img.size, (0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([center[0] - radius, center[1] - radius,
               center[0] + radius, center[1] + radius],
              fill=tuple(int(c * strength / 100.0) for c in colour))
    layer = layer.filter(ImageFilter.GaussianBlur(radius // 2))
    return Image.blend(img, Image.blend(img, layer, 0.9), 0.35)


def chip(draw, xy, text, font, pad=(12, 7), radius=9):
    box = draw.textbbox(xy, text, font=font)
    draw.rounded_rectangle(
        [box[0] - pad[0], box[1] - pad[1], box[2] + pad[0], box[3] + pad[1]],
        radius, fill=CHIP_BG)
    draw.text(xy, text, font=font, fill=CHIP_TEXT)
    return box[2] + pad[0]


def small_tile():
    W, H = 440, 280
    img = glow(gradient((W, H)), (W - 40, H + 30), 190)
    d = ImageDraw.Draw(img)

    f_name = ImageFont.truetype(F_BOLD, 38)
    f_tag = ImageFont.truetype(F_REG, 17)
    f_time = ImageFont.truetype(F_UNI_B, 25)

    icon = Image.open(os.path.join(ROOT, 'icons', 'icon128.png')).convert('RGBA')
    icon = icon.resize((46, 46), Image.LANCZOS)
    img.paste(icon, (32, 34), icon)

    d.text((90, 38), 'X Localtime', font=f_name, fill=TEXT)
    d.text((34, 100), 'Site times, shown in your own time', font=f_tag, fill=MUTED)

    y = 158
    d.text((34, y), FA_2130, font=f_time, fill=DIM)
    d.text((122, y - 1), '\u2192', font=f_time, fill=ACCENT)
    chip(d, (166, y), FA_1400, f_time)

    d.text((34, 226), 'Tehran time \u00b7 read in Toronto',
           font=ImageFont.truetype(F_REG, 15), fill=(104, 116, 108))

    save(img, 'small-tile-440x280.png')


def schedule_card(size):
    """A mock schedule, so no real site's branding appears in the artwork."""
    w, h = size
    card = Image.new('RGB', (w, h), CARD_BG)
    d = ImageDraw.Draw(card)

    f_row = ImageFont.truetype(F_REG, 19)
    f_time = ImageFont.truetype(F_UNI_B, 20)
    f_head = ImageFont.truetype(F_BOLD, 17)

    d.rectangle([0, 0, w, 44], fill=(238, 242, 240))
    d.text((22, 13), 'Today', font=f_head, fill=(96, 108, 101))

    rows = [
        ('Match day', '21:30', '14:00', False),
        ('Live show', FA_2130, FA_1400, True),
        ('Webinar', '08:45', '01:15', False),
        ('Tip-off', '22:00', '15:00', False),
    ]
    y = 44
    row_h = (h - 44) // len(rows)
    for label, before, after, unicode_row in rows:
        d.line([(0, y), (w, y)], fill=CARD_LINE, width=1)
        cy = y + row_h // 2 - 12
        d.text((22, cy), label, font=f_row, fill=CARD_TEXT)
        font = f_time if not unicode_row else ImageFont.truetype(F_UNI_B, 20)
        d.text((w - 250, cy), before, font=font, fill=(168, 178, 172))
        d.text((w - 168, cy - 1), '\u2192', font=f_row, fill=(120, 190, 155))
        box = d.textbbox((w - 118, cy), after, font=font)
        d.rounded_rectangle([box[0] - 10, box[1] - 6, box[2] + 10, box[3] + 6],
                            7, fill=(214, 242, 227))
        d.text((w - 118, cy), after, font=font, fill=(23, 108, 68))
        y += row_h
    return card


def marquee():
    W, H = 1400, 560
    img = glow(gradient((W, H)), (980, 300), 330)

    # Card and its shadow go down first, so neither dims the headline.
    card = schedule_card((520, 340))
    cx, cy = 800, 110

    shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [cx, cy + 14, cx + card.width, cy + card.height + 14], 20, fill=(0, 0, 0, 190))
    shadow = shadow.filter(ImageFilter.GaussianBlur(26))
    base = img.convert('RGBA')
    base.alpha_composite(shadow)
    img = base.convert('RGB')

    mask = Image.new('L', card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, card.width - 1, card.height - 1], 16, fill=255)
    img.paste(card, (cx, cy), mask)

    d = ImageDraw.Draw(img)
    f_name = ImageFont.truetype(F_BOLD, 76)
    f_tag = ImageFont.truetype(F_REG, 31)
    f_small = ImageFont.truetype(F_REG, 21)

    icon = Image.open(os.path.join(ROOT, 'icons', 'icon128.png')).convert('RGBA')
    icon = icon.resize((84, 84), Image.LANCZOS)
    img.paste(icon, (86, 96), icon)

    d.text((190, 100), 'X Localtime', font=f_name, fill=TEXT)
    d.text((88, 224), 'Every time on the page,\nshown in your own timezone',
           font=f_tag, fill=MUTED, spacing=12)
    d.text((88, 372), 'Pick the city the site writes its times in, pick yours.',
           font=f_small, fill=(126, 139, 131))
    d.text((88, 404), 'No network requests \u00b7 no accounts \u00b7 open source',
           font=f_small, fill=(126, 139, 131))

    save(img, 'marquee-1400x560.png')


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    img.convert('RGB').save(path, 'PNG', optimize=True)
    print('%s  %dx%d  mode=%s  %.0f KB' % (
        name, img.width, img.height, img.convert('RGB').mode,
        os.path.getsize(path) / 1024.0))


if __name__ == '__main__':
    small_tile()
    marquee()
