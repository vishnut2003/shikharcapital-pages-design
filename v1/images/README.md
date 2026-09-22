Add all the images file in this folder

## Image slots used by the v1 pages

Every `.webp` / `.jpg` below is a **generated placeholder** (navy card showing its own filename
and size). Replace it with the real image using the **same filename** — no HTML changes needed.
Keep roughly the same aspect ratio; WebP preferred (brief: fast load, WebP, no heavy sliders).

| File | Size (px) | Where it appears | What to supply |
|---|---|---|---|
| `hero-bg.webp` | 1672×941 | Hero background, full opacity under a left-heavy navy gradient | **Supplied** — Mumbai skyline at dusk (source: `user-uploads/hero-bg.png`) |
| `service-pre-ipo.webp` | 1600×1000 | Services card 1 | **Supplied** — readiness review on a boardroom table (source: `user-uploads/service-pre-ipo.png`) |
| `service-execution.webp` | 1600×1000 | Services card 2 | **Supplied** — listing bell + prospectus (source: `user-uploads/service-execution.png`) |
| `service-post-listing.webp` | 1600×1000 | Services card 3 | **Supplied** — share-price screen in a meeting room (source: `user-uploads/service-post-listing.png`) |
| `founder.webp` | 800×1000 | "Your advisor" block (Why us) | Founder's real portrait, plain background, top-aligned |
| `testimonial-1.webp` … `-3.webp` | 200×200 | Testimonial headshots (shown as 48px circles) | Promoter headshots, square crop |
| `client-logo-1.webp` … `-5.webp` | 240×80 | Logo row under testimonials (shown greyscale, colour on hover) | Client / listed-company logos on transparent or white |
| `cta-bg.webp` | 1920×800 | Final CTA background, the `.page-hero` on every inner page, and the booking dialog | **Supplied** — night skyline (source: `user-uploads/cta-section-bg-image.png`) |
| `og-home.jpg` | 1200×630 | Social share preview for the home page and the legal / thank-you pages | Logo + headline on navy |
| `og-eligibility.jpg`, `og-cost-timeline.jpg`, `og-services.jpg`, `og-nse-vs-bse.jpg`, `og-about.jpg`, `og-resources.jpg` | 1200×630 | Social share preview, one per inner page | Page headline on navy |
| `partner-logo-1.webp` … `-6.webp` | 240×80 | Intermediary network row on `about.html` (greyscale, colour on hover) | Partner logos: merchant banker, legal counsel, auditor, RTA, market maker, depository |

Keep as-is:

- `logo-mark.svg` — placeholder "summit" logo mark (navy + lime); also the favicon. Replace when the client supplies a logo.
- `skyline-lineart.svg` — decorative exchange/skyline line-art used in the footer and final CTA.

Regenerate the placeholders (if sizes change) with `python scripts/make_placeholders.py`
from the project root (needs Pillow) — only the filenames matter. The script **skips the
client-supplied photos** listed in its `REAL` set (`hero-bg`, `cta-bg`, `service-*`), so running
it can never overwrite a real image. Add a new slot by appending to `SLOTS`.
