# Shikhar Capital — page design mock-ups

Static HTML/CSS/JS page designs for **Shikhar Capital**, an Indian SME IPO advisory firm
(helps ₹70–250 Cr revenue companies list on NSE Emerge / BSE SME). These pages exist to
**show the client the design for confirmation** before the production build
(WordPress or Next.js, per the brief). They are not the production site.

Source of truth for content and structure: `project-details/website-development-details.pdf`
(WebSpider Solutions blueprint, 21 Sep 2026).

## Folder structure

```
project-details/
  website-development-details.pdf   the client brief (sitemap, section order, copy direction)
v1/
  index.html                        HOME page (built)
  assets/style.css                  single stylesheet — design tokens + all components
  assets/main.js                    single script — all interactive behaviour
  images/                           logo mark, line-art, and image PLACEHOLDERS (see images/README.md)
scripts/make_placeholders.py        regenerates the placeholder images (Pillow); edit SLOTS to add a slot
CLAUDE.md                           this file
```

Convention: one flat `.html` per page in `v1/`, shared CSS/JS in `v1/assets/`, all images in
`v1/images/`. Page filenames follow the brief's sitemap slugs:
`sme-ipo-eligibility.html`, `sme-ipo-cost-timeline.html`, `services.html`,
`nse-emerge-vs-bse-sme.html`, `about.html`, `resources.html`, `book.html`,
`privacy.html`, `terms.html`, `disclaimer.html`. The home page already links to all of them.

## Stack

Plain HTML + custom CSS (`:root` tokens) + vanilla JS. **No build step, no Tailwind, no
frameworks.** Only external request is Google Fonts (Inter + Playfair Display).

## Content rules (client decisions — apply to every page)

1. **Do not mention "17 weeks" / "17-week" anywhere.** The brief's original positioning used a
   17-week timeline; the client asked for it to be removed from the whole site. Do not state a
   listing duration in headlines, stats, roadmap step labels (no week ranges), FAQ answers, meta
   tags or JSON-LD. The roadmap is a *sequence* of 10 steps grouped into phases
   (Prepare · Document · Approve · Launch · List), not a schedule.
2. Images are **placeholders**; the client will supply real files with the same filenames
   (see *Image slots*). Do not fetch stock photos. Brief rule: no stock "handshake" photos —
   use skyline/exchange imagery, the founder's real photo, and the roadmap graphic.
3. Unconfirmed facts are marked `<span data-placeholder title="Client to confirm">[X]</span>`
   (dashed underline in the mock) plus an HTML comment `<!-- PLACEHOLDER: ... -->`.
   Keep this convention so the outstanding-inputs list can be produced by grepping
   `[X]`, `XXXXXXXXXX`, `PLACEHOLDER`, `TODO`.
4. Eligibility checker is **link-only** on the home page (`sme-ipo-eligibility.html`);
   the 5-step tool is a separate page (not built yet).

## Design system (v1/assets/style.css, section 01 TOKENS)

**Palette — client-specified**

| Token | Hex | Use |
|---|---|---|
| `--navy-900` | `#0B1F3A` | **Primary.** Header brand, headings, primary buttons (`.btn--navy`), dark sections |
| `--navy-950 / 800 / 700 / 600` | `#061428 / #122B4D / #1B3A63 / #254B7C` | Footer bg, dark cards, hovers |
| `--accent-500` | `#D4FF1F` | **Accent (Lime).** CTAs (`.btn--accent`), active roadmap nodes, highlights, nav underline |
| `--accent-400` | `#E0FF57` | Hover on dark backgrounds |
| `--accent-700` | `#587500` | Accent **text on white** (olive, 5.3:1 AA). Never use `#D4FF1F` as text on white (1.2:1) |
| `--accent-600` | `#B9E600` | Deeper lime for progress-bar gradients |
| `--accent-100` | `#F6FFD1` | Pale-lime tint (icon tiles, chips, "With Shikhar Capital" table column) |

`--accent-text` resolves to `--accent-700` (olive) on light sections and to `--accent-500`
(lime) on `.section--navy`. Use it for coloured text/icons instead of the raw accent.
| `--ink-900 / 700 / 500` | `#0B1F3A / #2E3D55 / #5B6B82` | Text on light |
| `--fg-dark / --fg-dark-muted` | `#F4F6FA / #A9B4C6` | Text on navy |
| `--paper`, `--line` | `#F6F7F9`, `#E3E7EE` | Alt section bg, borders |

Accent buttons use **navy text on lime** (14:1). Focus ring is two-tone (navy outline + lime
halo) so it is visible on both white and navy; form inputs focus with a navy border + lime halo.
Theme switching is per section: `.section--navy` / `.section--paper` override `--bg --fg
--fg-heading --fg-muted --card --border --accent-text`, so every component works on both.

**Type** — Playfair Display 600/700 (headings, stats, quotes) + Inter 400/500/600 (body/UI).
Fluid scale via `--fs-display`, `--fs-h2`, `--fs-stat` (clamp). Playfair has no ₹ glyph:
wrap rupee signs inside serif text in `<span class="rupee">₹</span>`.

**Layout** — `--container: 1200px`, `--container-narrow: 820px`, `--section-y: clamp(4rem, 8vw, 7rem)`.
Breakpoints (mobile-first, min-width): 640 · **768** (mobile bottom bar hides) ·
**1024** (desktop nav, hero 2-col, horizontal roadmap) · 1280.

**Stylesheet order** — 01 Tokens · 02 Reset/base · 03 Typography · 04 Layout · 05 Components
(`.btn`, `.card`, `.card--media`, `.icon-tile`, `.chip`, `.stat`, `.trust-list`, `.compare`,
`.faq`, `.quote`, `.logo-row`, `.field/.input`, `.brand`) · 06 Site chrome (header, nav,
footer, mobile bar, WhatsApp float, callback widget) · 07 Sections · 08 Utilities · 09 Motion/MQ.
BEM-lite naming; mobile-first media queries grouped per component; colours only via tokens.

## Home page — section order (v1/index.html)

Matches brief §3 exactly:

1. **Hero** — full first fold (`min-height: 100dvh`, starts at the top of the page under the
   transparent overlay header). Single text column (`.hero__content`, max 640px) on the left:
   H1 "List your company on NSE Emerge / BSE SME with *one advisor*", two CTAs, trust line.
   The right half is left clear for the skyline photo (`hero-bg.webp`, client-supplied, source
   PNG in `images/user-uploads/`). Navy gradient overlay is heavy on the left / light on the right;
   on phones it is uniform. **No right-column card** — the client removed the roadmap card from the hero.
2. **Proof strip** — 4 stats, overlapping the hero. All values are `[X]` placeholders.
3. **Who it's for** — 3 qualifying-criteria cards → "See if you qualify".
4. **Roadmap** — 10 steps. Desktop: horizontal track + hover/keyboard detail panel.
   Tablet: horizontal scroll-snap cards. Mobile: vertical list with details inline.
   Step content is written once inside each `<li>`; JS mirrors it into `#roadmap-detail` on desktop.
5. **Services** — 3 image cards (Pre-IPO · Execution · Post-listing) → `services.html#…`.
6. **Why us** — "Single advisor vs juggling 8 intermediaries" comparison table (stacks to cards <768)
   + **"Your advisor"** block with founder photo slot and bio placeholder.
7. **Cost teaser** — cost heads as chips + 3 stat tiles → `sme-ipo-cost-timeline.html`.
8. **Testimonials** — 3 placeholder quotes with headshot slots + 5 client-logo slots.
9. **FAQ** — 8 questions, accessible accordion, `FAQPage` JSON-LD mirrors the visible text verbatim.
10. **Final CTA** — Check eligibility · WhatsApp us, `cta-bg.webp` under overlay + skyline line-art.

Footer: brand, pages, legal, contact, disclaimer (placeholder wording for legal review).
Always-on widgets: header with "Book a Call" — on the home page it is the **overlay variant**
(`.site-header.site-header--overlay`: fixed, transparent with white text over the hero, turns
solid white with navy text once scrolled or when the mobile menu opens). Inner pages use the
plain `.site-header` (sticky, white) so their first section is not hidden under a fixed bar.
Mobile bottom bar (Call · WhatsApp ·
Check Eligibility, <768); WhatsApp float with pre-filled message; callback widget
("Get a call in 15 min" → name + mobile form, client-side validation, `// TODO` CRM webhook).
Not built (paid-traffic only per brief): exit-intent popup.

SEO: `Organization` + `ProfessionalService` JSON-LD, `FAQPage` JSON-LD, canonical/OG/Twitter
meta (domain `shikharcapital.com` is a TODO), semantic landmarks, one H1, question-style FAQ headings.

## Shared blocks — how to build the next pages

`index.html` contains three blocks wrapped in comment markers. **Copy them verbatim** into every
new page, together with the same `<head>` boilerplate (fonts, `assets/style.css`, `assets/main.js`,
the Organization JSON-LD):

```
<!-- ==== SHARED: SITE HEADER ==== -->      … <!-- /SHARED: SITE HEADER -->
<!-- ==== SHARED: SITE FOOTER ==== -->      … <!-- /SHARED: SITE FOOTER -->
<!-- ==== SHARED: ALWAYS-ON WIDGETS ==== --> … <!-- /SHARED: ALWAYS-ON WIDGETS -->
```

Do not edit them per page — `main.js` sets `aria-current="page"` on the matching nav link
automatically. One exception: **remove the `site-header--overlay` class** from the header on
inner pages (it is only for the full-height hero on the home page).

Gotcha: never give `.site-header` a `backdrop-filter` while the mobile menu is open — it makes
the header the containing block for the `position: fixed` nav panel and clips it. The CSS
already disables the blur under `body.nav-open`. Every `init*()` in `main.js` null-checks its root element, so the same script
loads on pages that have no hero timeline, roadmap, FAQ, etc.

## JavaScript behaviours (v1/assets/main.js)

Single IIFE, no globals, `prefers-reduced-motion` respected. `initHeader` (adds `.is-scrolled`
past 8px — drives the overlay header's transparent→white switch), `initMobileNav` (toggle, Esc,
focus return, closes ≥1024), `initActiveNav`, `initRoadmap` (hover,
focus, Arrow/Home/End keys, `aria-current="step"`), `initAccordion` (single-open, Arrow keys,
CSS grid height animation), `initCallback` (dialog open/close, Indian-mobile validation
`/^[6-9]\d{9}$/`, success state), `initReveal` (IntersectionObserver; content is never hidden
without JS), `initYear`.

## Image slots (v1/images)

All `*.webp` / `og-home.jpg` files are **generated placeholders** showing their own filename and
size — except `hero-bg.webp`, which is now the client's real Mumbai-skyline photo (source PNG kept
in `images/user-uploads/`). Replace each placeholder with a real image of the same name (WebP,
roughly the same ratio); no HTML changes needed. Client uploads go in `images/user-uploads/`;
convert to WebP into `images/` (Pillow: `Image.open(src).convert('RGB').save(dst, 'WEBP', quality=82)`). Full table in `v1/images/README.md`. Keep `logo-mark.svg` (placeholder logo
until the client supplies one) and `skyline-lineart.svg` (decorative line-art).

## Verification

```powershell
cd v1; python -m http.server 8080      # open http://localhost:8080/
```
- Check 375 / 768 / 1024 / 1440 widths — no horizontal scroll; both hero CTAs above the fold at 375.
- Validate JSON-LD (e.g. Google Rich Results Test); FAQ text in schema must equal the DOM text.
- Keyboard: Tab through nav → FAQ (Enter/Space, Arrow keys) → roadmap (Arrow keys) → callback (Esc).
- Lighthouse mobile targets: Performance ≥ 90, Accessibility 100, SEO 100.
- Placeholders still outstanding: `grep -n "\[X\]\|XXXXXXXXXX\|PLACEHOLDER\|TODO" v1/index.html`.

Last verified (home page): JSON-LD parses, FAQ parity OK, unique ids, all `aria-controls`
targets exist, no console errors, no horizontal overflow at 375/768/1440, 30 interaction checks
pass in headless Chromium (nav, hero timeline, roadmap keys, accordion, callback validation,
reduced-motion, no-JS fallback).

## Outstanding inputs from the client

Brand logo · founder photo + 4–5 line bio · mandate / capital-raised / partner numbers ·
phone, WhatsApp number, email, office address · production domain · cost band % and
merchant-banker fee range · promoter testimonials + client logos · confirmation of roadmap
step sequence · legal review of the footer disclaimer · real images for every slot.

## Change log

- **2026-09-21** — Home page built from the brief (v1/index.html, style.css, main.js, SVG assets).
  Placeholder images generated for every slot (client to supply real ones).
  Client decisions applied the same day: (a) **removed every "17 weeks" claim** and the week
  ranges on roadmap steps; (b) palette changed from navy + gold to
  **Deep Navy `#0B1F3A` + Emerald `#16A34A`** (tokens renamed `--gold-*` → `--accent-*`,
  classes `btn--gold` → `btn--accent`, `text-gold` → `text-accent`); (c) accent then changed
  again from Emerald to **Lime `#D4FF1F`** (current). Olive `#587500` derived for accent text
  on white; logo mark, placeholder images and focus styles updated to match.
- **2026-09-21 (later)** — Hero reworked per client: real skyline photo supplied
  (`images/user-uploads/hero-bg.png` → `hero-bg.webp`); **roadmap card removed from the hero**
  (its CSS/JS deleted; the accessible roadmap remains in section 4); hero made **100dvh** and the
  header turned into a **transparent overlay** (`site-header--overlay`) that goes white on scroll.
  Fixed a mobile-menu clipping bug caused by the header's `backdrop-filter`.
