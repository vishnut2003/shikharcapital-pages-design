Add all the images file in this folder

## Image slots used by index.html

Every `.webp` / `.jpg` below is a **generated placeholder** (navy card showing its own filename
and size). Replace it with the real image using the **same filename** — no HTML changes needed.
Keep roughly the same aspect ratio; WebP preferred (brief: fast load, WebP, no heavy sliders).

| File | Size (px) | Where it appears | What to supply |
|---|---|---|---|
| `hero-bg.webp` | 1672×941 | Hero background, full opacity under a left-heavy navy gradient | **Supplied** — Mumbai skyline at dusk (source: `user-uploads/hero-bg.png`) |
| `service-pre-ipo.webp` | 800×500 | Services card 1 | Financial review: documents, charts, boardroom. No handshakes. |
| `service-execution.webp` | 800×500 | Services card 2 | Exchange floor / listing bell / DRHP paperwork |
| `service-post-listing.webp` | 800×500 | Services card 3 | Ticker board / investor meeting / growth chart |
| `founder.webp` | 800×1000 | "Your advisor" block (Why us) | Founder's real portrait, plain background, top-aligned |
| `testimonial-1.webp` … `-3.webp` | 200×200 | Testimonial headshots (shown as 48px circles) | Promoter headshots, square crop |
| `client-logo-1.webp` … `-5.webp` | 240×80 | Logo row under testimonials (shown greyscale, colour on hover) | Client / listed-company logos on transparent or white |
| `cta-bg.webp` | 1920×800 | Final CTA background (20% opacity) | City skyline at night / exchange facade |
| `og-home.jpg` | 1200×630 | Social share preview (`og:image`) | Logo + headline on navy |

Keep as-is:

- `logo-mark.svg` — placeholder "summit" logo mark (navy + lime); also the favicon. Replace when the client supplies a logo.
- `skyline-lineart.svg` — decorative exchange/skyline line-art used in the footer and final CTA.

Regenerate the placeholders (if sizes change) with `python scripts/make_placeholders.py`
from the project root (needs Pillow) — only the filenames matter.
