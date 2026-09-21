"""Generate branded placeholder images for the v1 home page.
Each file is named exactly as the HTML references it; the client/designer
replaces the file with a real image of the same name and (roughly) same ratio."""
import os, sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
OUT = r'D:\web-spider-solutions\CLIENTS_PROJECTS\shikhar-capital-ipo\shikharcapital-pages-design\v1\images'
NAVY, NAVY_800, ACCENT, ACCENT_400, MUTED = '#0B1F3A', '#122B4D', '#D4FF1F', '#E0FF57', '#A9B4C6'

SLOTS = [
    # filename, width, height, suggested content
    ('hero-bg.webp',            1920, 1080, 'Mumbai skyline / exchange building, dusk (used at ~25% opacity)'),
    ('service-pre-ipo.webp',     800,  500, 'Financial review: documents, charts, boardroom (no handshakes)'),
    ('service-execution.webp',   800,  500, 'Exchange floor / bell ceremony / DRHP paperwork'),
    ('service-post-listing.webp',800,  500, 'Ticker board / investor meeting / growth chart'),
    ('founder.webp',             800, 1000, "Founder's real photo, portrait, plain background"),
    ('testimonial-1.webp',       200,  200, 'Promoter headshot (square)'),
    ('testimonial-2.webp',       200,  200, 'Promoter headshot (square)'),
    ('testimonial-3.webp',       200,  200, 'Promoter headshot (square)'),
    ('client-logo-1.webp',       240,   80, 'Client / listed-company logo, transparent or white bg'),
    ('client-logo-2.webp',       240,   80, 'Client / listed-company logo'),
    ('client-logo-3.webp',       240,   80, 'Client / listed-company logo'),
    ('client-logo-4.webp',       240,   80, 'Client / listed-company logo'),
    ('client-logo-5.webp',       240,   80, 'Client / listed-company logo'),
    ('cta-bg.webp',             1920,  800, 'City skyline at night / exchange facade (used at ~20% opacity)'),
    ('og-home.jpg',             1200,  630, 'Social share image: logo + headline on navy'),
]

def font(size, bold=False):
    for name in (['arialbd.ttf', 'arial.ttf'] if bold else ['arial.ttf']):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()

def draw_grid(d, w, h, step=48):
    for x in range(0, w, step):
        d.line([(x, 0), (x, h)], fill='#14294A')
    for y in range(0, h, step):
        d.line([(0, y), (w, y)], fill='#14294A')

def make(name, w, h, hint):
    small = w < 300 or h < 120
    img = Image.new('RGBA', (w, h), NAVY_800 if small else NAVY)
    d = ImageDraw.Draw(img, 'RGBA')
    if not small:
        draw_grid(d, w, h)
    # dashed accent border
    m = 6 if small else 16
    dash = 12
    for x in range(m, w - m, dash * 2):
        d.line([(x, m), (min(x + dash, w - m), m)], fill=ACCENT, width=2)
        d.line([(x, h - m), (min(x + dash, w - m), h - m)], fill=ACCENT, width=2)
    for y in range(m, h - m, dash * 2):
        d.line([(m, y), (m, min(y + dash, h - m))], fill=ACCENT, width=2)
        d.line([(w - m, y), (w - m, min(y + dash, h - m))], fill=ACCENT, width=2)

    base = max(12, min(w, h) // (10 if small else 14))
    if small:
        lines = [(name, base, ACCENT_400, True), (f'{w}×{h}', int(base * .8), MUTED, False)]
    else:
        lines = [
            ('IMAGE PLACEHOLDER', int(base * .55), ACCENT, True),
            (name, int(base * 1.1), '#F4F6FA', True),
            (f'{w} × {h} px', int(base * .7), MUTED, False),
            (hint, int(base * .55), MUTED, False),
        ]
    total = sum(font(s).getbbox('Ag')[3] + 8 for _, s, _, _ in lines)
    y = (h - total) // 2
    for text, size, color, bold in lines:
        f = font(size, bold)
        # wrap hint if too wide
        words, out, cur = text.split(), [], ''
        for wd in words:
            t = (cur + ' ' + wd).strip()
            if d.textlength(t, font=f) > w - 2 * m - 40 and cur:
                out.append(cur); cur = wd
            else:
                cur = t
        out.append(cur)
        for ln in out:
            tw = d.textlength(ln, font=f)
            d.text(((w - tw) / 2, y), ln, font=f, fill=color)
            y += f.getbbox('Ag')[3] + 8

    path = os.path.join(OUT, name)
    if name.endswith('.jpg'):
        img.convert('RGB').save(path, 'JPEG', quality=82)
    else:
        img.convert('RGB').save(path, 'WEBP', quality=80)
    print(f'{name:28} {w}×{h}  {os.path.getsize(path)/1024:.1f} KB')

for slot in SLOTS:
    make(*slot)
