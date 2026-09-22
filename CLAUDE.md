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
  index.html                        HOME page
  sme-ipo-eligibility.html          5-step eligibility checker (the lead magnet)
  sme-ipo-cost-timeline.html        cost table by intermediary + the 10-step roadmap in detail
  services.html                     Pre-IPO · Execution · Post-listing (#pre-ipo/#execution/#post-listing)
  nse-emerge-vs-bse-sme.html        platform comparison + "which is right for you"
  about.html                        Why us: founder, proof strip, one-vs-eight orbit, network, mandates
  resources.html                    guides — "coming soon" preview + notify form
  privacy.html terms.html disclaimer.html   legal (SAMPLE placeholder copy for counsel)
  thank-you.html                    conversion-tracking page: noindex, not linked from nav/footer
  assets/style.css                  single stylesheet — design tokens + all components
  assets/main.js                    single script — all interactive behaviour
  images/                           logo mark, line-art, and image PLACEHOLDERS (see images/README.md)
scripts/make_placeholders.py        regenerates the placeholder images (Pillow); edit SLOTS to add a slot
scripts/verify_pages.py             site-wide checks for every page (Playwright) — see Verification
CLAUDE.md                           this file
```

Convention: one flat `.html` per page in `v1/`, shared CSS/JS in `v1/assets/`, all images in
`v1/images/`. Page filenames follow the brief's sitemap slugs:
`sme-ipo-eligibility.html`, `sme-ipo-cost-timeline.html`, `services.html`,
`nse-emerge-vs-bse-sme.html`, `about.html`, `resources.html`,
`privacy.html`, `terms.html`, `disclaimer.html` — **all built**. City pages
(`sme-ipo-consultant-<city>.html`) are Phase 2 per the brief and not built.
**There is no `book.html`:** every "Book a call" control is `<a href="#book" data-book>` and opens
the shared split-screen dialog (see *Always-on widgets*).

## Stack

Plain HTML + custom CSS (`:root` tokens) + vanilla JS. **No build step, no Tailwind, no
frameworks.** Only external request is Google Fonts (Poppins + Inter).

## Content rules (client decisions — apply to every page)

1. **Do not mention "17 weeks" / "17-week" anywhere.** The brief's original positioning used a
   17-week timeline; the client asked for it to be removed from the whole site. Do not state a
   listing duration in headlines, stats, roadmap step labels (no week ranges), FAQ answers, meta
   tags or JSON-LD. The roadmap is a *sequence* of 10 steps grouped into phases
   (Prepare · Document · Approve · Launch · List), not a schedule.
2. Images are **placeholders**; the client will supply real files with the same filenames
   (see *Image slots*). Do not fetch stock photos. Brief rule: no stock "handshake" photos —
   use skyline/exchange imagery, the founder's real photo, and the roadmap graphic.
3. **Sample data, not visible placeholders.** The client asked for realistic numbers/names in
   place of `[X]` markers and no placeholder styling ("I will update it later"). Every sample
   value is wrapped in an invisible `<span data-placeholder>…</span>` (no CSS, no tooltip) and
   the nearby HTML comment says `SAMPLE DATA`. To list what still needs real values:
   `grep -rn "data-placeholder\|SAMPLE DATA\|TODO" v1/*.html`. Current sample values:
   40+ mandates · ₹620 Cr raised · 15+ years · 25+ partners · cost band 7–10% · merchant-banker
   fees ₹30–60 L · founder "Vikram Mehta, 18 years" + bio · three promoter quotes (Deshmukh
   Polymers, Coastal Agro Foods, Agarwal Precision Tools) · five client-logo names · phone
   +91 98200 12345 / WhatsApp 919820012345 · hello@shikharcapital.com · office at Peninsula
   Business Park, Lower Parel, Mumbai 400013 (also in the JSON-LD). Inner pages add: the
   cost-table ranges per intermediary, NSE vs BSE fees and market observations, three mandate
   cards, partner-logo roles, the founder's long bio, and all three legal documents. Never
   present any of these to the client as verified facts.
4. Eligibility checker is **link-only** on the home page; the 5-step tool lives on its own page
   (`sme-ipo-eligibility.html`, built — see *Eligibility checker*).

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
| `--ink-900 / 700 / 500` | `#0B1F3A / #2E3D55 / #5B6B82` | Text on light |
| `--fg-dark / --fg-dark-muted` | `#F4F6FA / #A9B4C6` | Text on navy |
| `--paper`, `--line` | `#F6F7F9`, `#E3E7EE` | Alt section bg, borders |

`--accent-text` resolves to `--accent-700` (olive) on light sections and to `--accent-500`
(lime) on `.section--navy`. Use it for coloured text/icons instead of the raw accent.

Accent buttons use **navy text on lime** (14:1). Focus ring is two-tone (navy outline + lime
halo) so it is visible on both white and navy; form inputs focus with a navy border + lime halo.
Theme switching is per section: `.section--navy` / `.section--paper` override `--bg --fg
--fg-heading --fg-muted --card --border --accent-text`, so every component works on both.
**Gotcha:** a white card placed *inside* a navy section (e.g. the hero lead form) inherits the
navy slots — lime `.link` text on white is unreadable. Re-declare the light slots on the card
(see `.lead-form`) rather than overriding colours element by element.

**Type** — **Poppins** 500/600/700 for headings, stats and quotes (`--font-display`) +
**Inter** 400/500/600 for body and UI (`--font-sans`). Client decision: "Poppins for headings,
Inter for other text." Fluid scale via `--fs-display`, `--fs-h2`, `--fs-stat` (clamp); H1
letter-spacing -.025em, H2 -.02em. Keep wrapping rupee signs inside headings in
`<span class="rupee">₹</span>` — a no-op with Poppins (it has the glyph) but it protects
against a future display font that lacks it.

**Layout** — `--container: 1200px`, `--container-narrow: 820px`, `--section-y: clamp(4rem, 8vw, 7rem)`.
Breakpoints (mobile-first, min-width): 640 · **768** (mobile bottom bar hides) ·
**1024** (desktop nav, hero 2-col, horizontal roadmap) · 1280.

**Stylesheet order** — 01 Tokens · 02 Reset/base · 03 Typography · 04 Layout · 05 Components
(`.btn`, `.card`, `.card--media`, `.icon-tile`, `.chip`, `.stat`, `.trust-list`, `.compare`,
`.faq`, `.quote`, `.logo-row`, `.field/.input`, `.brand`) · 06 Site chrome (header, nav,
footer, mobile bar) · 07 Sections · 08 Utilities · 09 Motion/MQ.
BEM-lite naming; mobile-first media queries grouped per component; colours only via tokens.

## Home page — section order (v1/index.html)

Matches brief §3 exactly:

1. **Hero** — full first fold (`min-height: 100dvh`, starts at the top of the page under the
   transparent overlay header; nothing overlaps it). Single text column (`.hero__content`,
   max 660px, vertically centred) on the left: H1 "List your company on NSE Emerge / BSE SME
   with *one advisor*" (lime text + hand-drawn SVG underline that draws itself in), lead, two
   icon CTAs, trust line — all with a staggered entrance animation. Background: the client's
   skyline photo (`hero-bg.webp`, source PNG in `images/user-uploads/`) with a slow 18 s zoom-out,
   a left-heavy navy gradient, a soft lime glow behind the headline and a faint dotted grid on the
   text side. A "Scroll" mouse cue sits at the bottom centre (desktop only). A `max-height: 860px`
   media query compresses type and spacing so the fold still fits on 13" laptops.
   **Removed by the client:** the roadmap card, the eyebrow badge, and the in-hero stats bar.
   **Added by the client (2026-09-22): a two-step lead form on the right** (`.hero__form >
   .lead-form`, white card, max 440px, 7/5 grid ≥1024, stacked under the CTAs below that).
   Step 1 = name + mobile/WhatsApp → "Continue"; step 2 = company + annual-revenue band
   (select: <₹70 Cr · ₹70–150 · ₹150–250 · >₹250) → "Request my readiness call", with Back link,
   "Step N of 2" indicator and a two-segment progress bar. `initLeadForm()` validates per step
   (Indian mobile `/^[6-9]\d{9}$/`), Enter on step 1 advances, success state replaces the card
   body; submission is mocked (`// TODO` CRM webhook). The `max-height: 860px` query also
   compresses the card (hides the sub-line, 40px inputs) so the fold still holds at 1366×768.
2. **Proof strip** — its own `#proof` section directly under the hero: `navy-950` band with soft
   lime/navy glows, header row (eyebrow "Track record" + H2 + credibility note with a lime dot),
   then 4 frosted cards (`.proof__card`) each with a lime icon tile, the number, label and a
   one-line descriptor; lime top rule and hover lift. **Numbers count up from 0** when the cards
   scroll into view (`data-count` attribute, see JS). Values are sample data.
3. **Who it's for** (`#qualify`) — white section with a soft lime glow + fading dot grid. Three
   **signal cards** (`.signal`): ghost index "01/02/03", icon tile + tag, H3 built from a big
   figure + label (`.signal__value` "₹70–250 Cr" / "2 of 3" / "3+ yrs" + `.signal__label`),
   description, and a lime-check footer line. Lime top rule grows and the icon tile inverts on
   hover. Below: the **readiness panel** (`.qualify__cta`, navy) — "Meet two of three?" copy, a
   3-segment meter whose lime bars fill when revealed (`.is-visible`, shown filled without JS),
   and the lime "See if you qualify" CTA.
4. **Roadmap** — 10 steps on a navy band. Desktop (≥1024): an **"ascent" chart** — an SVG
   rising curve (IPO-gains motif) with a lime area fill and faint grid; the ten steps are
   `<button>`s absolutely positioned on the curve via inline `--x/--y` percentages (the same
   numbers generate the SVG path — keep them in sync if you move a node); the lime stroke fills
   up to the active node (`pathLength="100"` + `stroke-dashoffset: calc(100 - var(--progress))`,
   `--progress` is unitless 0–100); a "Listing day" flag sits on node 10; a phase axis
   (Prepare 3 · Document 2 · Approve 2 · Launch 2 · List 1) runs underneath. Header row has a
   phase legend. The detail panel shows phase chip, title, intermediaries, deliverable, a faint
   big step number, "Step N of 10" and prev/next arrows. **Autoplay** advances every 3.6 s while
   the chart is ≥40 % visible and stops permanently on any hover/click/scroll/keyboard interaction
   (never under reduced-motion). Tablet: horizontal scroll-snap cards. Mobile: vertical timeline
   with details inline. Step content is written once inside each `<li>`; JS mirrors it into
   `#roadmap-detail` on desktop.
5. **Services** — left-aligned header + stage legend (01 Before · 02 Listing · 03 After; a
   3-column row on phones with the short labels via `.hide-sm-down/.hide-sm-up`), then
   three **stage cards** (`.svc`): 4:3 client photo with a navy fade and a "Stage 01 · Before
   listing" chip top-left, a navy icon tile overlapping the photo edge, title, one-liner,
   lime-check deliverables list and an arrow "Learn more" link → `services.html#…`. Photo zooms
   and the tile inverts on hover. Footer line links to `services.html`.
6. **Why us** — the comparison table is a **"showdown"** (`.compare-wrap > .compare`): muted DIY
   column with grey ✕ marks, **navy "With Shikhar Capital" column** with lime ✓ marks, a lime
   rule on its header and a "Bottom line" `<tfoot>` row. Each cell's text is wrapped in
   `.compare__cell` (the icon is its `::before`; the `td::before` is reserved for the stacked
   mobile `data-label`). **<768 it stacks into per-aspect cards** — title, then a
   "Yourself ✕" line and a navy "Shikhar ✓" line (labels come from CSS `content`, not the
   `data-label`); the desktop column widths are reset with `!important` there because
   `.compare .compare__them { width: 36% }` outranks the block reset. Then the **"Your advisor"** block (`.advisor`):
   photo slot with a frosted caption badge, name/role, a compact **inline stat row**
   (`.advisor__stats`: 18 yrs · 40+ listings · 12 yrs — one row at every width, labels stack under
   numbers <480), a lime-ruled pull-quote (`.advisor__quote`), bio, trust list, two buttons.
7. **Cost teaser** — navy split: copy column (H2, lead, two lime-ruled headline figures
   `.cost__facts` with count-up, trust points, lime CTA) + the **consolidated-estimate card**
   (`.estimate`, frosted): total band, a stacked share bar whose segments grow into view
   (`--w` per segment must equal the % shown in the list, `--i` steps the lime opacity), an
   itemised list of the six cost heads with sample shares, and a footnote. Shares are SAMPLE DATA.
8. **Testimonials** — featured layout (`.quotes`): one large **navy quote** (`.quote--featured`)
   with a result figure (`.quote__result`) + two light cards stacked beside it (7/5 split ≥1024,
   2-up at 768, stacked <768). Each card: big lime quotation mark, ringed avatar, name/company,
   exchange-year chip (`.quote__tag`). **Client-logo row removed by the client** (`.logo-row`
   CSS kept for inner pages).
9. **FAQ** — two-column (`.faq-layout`, 5/7 ≥1024): **sticky intro column** (eyebrow, H2, lead,
   note + navy "Still have a question?" card with WhatsApp / Book a call; fills the viewport
   height with the card pinned to the bottom) and the accordion as **numbered cards**
   (`.faq__q::before` CSS counter, open item gets a lime left rule via `:has()` and a navy ×
   button). The section uses `overflow: clip`, not `hidden` — `hidden` breaks the sticky column.
   8 questions, accessible accordion, `FAQPage` JSON-LD mirrors the visible text verbatim.
10. **Final CTA** — Check eligibility · WhatsApp us. Background is the client's night-skyline
    image `cta-bg.webp` (source `user-uploads/cta-section-bg-image.png`, 1920×800, anchored
    bottom) at 75 % opacity under a navy gradient that is darkest behind the headline.

Footer: brand, pages, legal, contact, disclaimer (placeholder wording for legal review).
Always-on widgets: header with "Book a Call" — on the home page it is the **overlay variant**
(`.site-header.site-header--overlay`: fixed, transparent with white text over the hero, turns
solid white with navy text once scrolled or when the mobile menu opens). Inner pages use the
plain `.site-header` (sticky, white) so their first section is not hidden under a fixed bar.
Once `.is-scrolled`, the bar **shrinks** (row 72/64 → 56px, logo 36 → 30px, CTA pill 44 → 38px,
all transitioned); `--header-h` is deliberately not changed because the hero offset,
`scroll-padding-top` and the mobile menu panel are measured from it.
Mobile bottom bar (<768): **transparent** (no fill, no blur — client decision after trying a
navy dock, a blur-only bar and a blur+shade gradient) holding two **equal rounded lime-gradient
buttons**: "Call us" · "WhatsApp" (the eligibility button was dropped from the bar). The bar
itself is `pointer-events: none` so the gap between buttons doesn't block taps. And the
**"Book a call" dialog** (`<dialog class="book" id="book">`,
native `<dialog>`): split screen — left `.book__aside` is navy over `cta-bg.webp` with the call's
promise, three bullets, an advisor mini-card (SAMPLE DATA name) and a trust line; right
`.book__main` holds `.book-form` (three 2-col rows: name | company · mobile | optional email ·
revenue band | preferred time window) with a success state; the client asked for it to stay
short (~460px, no scrolling at 1366×768), so don't add fields without removing one. `initBookModal()` opens it from any
`[data-book]` element, locks body scroll (`body.book-open`), closes on Esc / backdrop click /
`[data-book-close]`, returns focus to the opener, validates, and mocks submission (`// TODO`
CRM/calendar). **On phones (<768) it is a bottom-sheet drawer**: full width, anchored to the
bottom, slides up, drag handle, swipe-down on the navy header dismisses (pointer events;
`user-select: none` on the header so a selection drag can't cancel the gesture). The client wants
it to **fit in one view with no scrolling**: the form head is hidden, labels are visually hidden
(placeholders / first `<option>` carry the label text), gaps tightened — ~600px total, verified
at 375×667 upward. The dialog re-declares the light theme tokens; the aside re-declares the dark ones.
**Removed by the client (2026-09-22):** the floating WhatsApp button
and the "Get a call in 15 min" callback widget — HTML, CSS and `initCallback()` all deleted; do
not re-add them. Not built (paid-traffic only per brief): exit-intent popup.

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
automatically. The mobile menu (<1024) is a **navy full-screen panel**: each link is a tile with
a lime icon, label + one-line `.site-nav__desc`, chevron, staggered entrance; `.site-nav__foot`
holds the Book CTA, Call / WhatsApp buttons and a contact line (SAMPLE DATA email). Desktop hides
`.site-nav__icon/.site-nav__desc/.site-nav__foot` and shows plain text links. Descriptions are
dropped under 700px viewport height so the footer still fits. One exception: **remove the `site-header--overlay` class** from the header on
inner pages (it is only for the full-height hero on the home page).

Gotcha: never give `.site-header` a `backdrop-filter` while the mobile menu is open — it makes
the header the containing block for the `position: fixed` nav panel and clips it. The CSS
already disables the blur under `body.nav-open`. Every `init*()` in `main.js` null-checks its root element, so the same script
loads on pages that have no hero timeline, roadmap, FAQ, etc.

## Inner pages — shared patterns

Every inner page is the same shell: the `<head>` boilerplate (fonts, `assets/style.css`,
`assets/main.js`, the Organization + ProfessionalService `@graph`) with its own title /
description / canonical / `og:*` / JSON-LD, then the three SHARED blocks copied verbatim —
**minus the `site-header--overlay` class**, which is home-only.

`.page-hero` is the one inner-page hero (never `.hero`, which is 100dvh and assumes the fixed
overlay header): navy band over `cta-bg.webp` with a lime glow, it re-declares the navy theme
slots like `.section--navy`, and carries `.crumbs` + eyebrow + H1 + lead. Add `--split` for a
7/5 grid with a `.page-hero__aside` (used by the checker and the estimate card).

New components, and what they are for:

| Component | Used by | Notes |
|---|---|---|
| `.page-hero` (+ `--split`, `__bg`, `__inner`, `__content`, `__aside`) | every inner page | see above |
| `.crumbs` | every inner page | must match that page's BreadcrumbList JSON-LD exactly |
| `.media-frame` (+ `--portrait`) | services, about | rounded photo frame inside a `.split` |
| `.table-wrap > .table` (+ `.table--stack`) | cost, NSE vs BSE | below 768 it stacks into cards; the label comes from each `td`'s `data-label` |
| `.steps` (+ `__num/__body/__meta/__group-title`) | cost roadmap, about, thank-you | numbers are **written in the markup**, not CSS counters, so phase groups can restart at 04 |
| `.orbit` (+ `__core/__nodes/__node`) | about | nodes are positioned with inline `--x/--y` percentages (like the roadmap chart). A percentage `translate` would resolve against the node's own size, not the ring |
| `.checker`, `.choice`/`.choice-grid`, `.result` | eligibility | see the next section |
| `.notify-form` | resources | email-only, mocked success |
| `.prose` | privacy, terms, disclaimer | long-form rhythm inside `.container--narrow` |

Reused as-is from the home page: `.section--navy/--paper`, `.section__head(--left)`, `.split`,
`.grid--2/--3`, `.card`/`.card__list`, `.icon-tile`, `.chip(-row)`, `.trust-list`, `.logo-row`,
`.faq`/`.faq-section`/`.faq-layout`/`.faq-intro`/`.faq-ask`, `.signal(-grid)`, `.estimate`,
`.proof`, `.qualify__cta`, `.final-cta`, `.btn*`, `.field`/`.input`, and the `[data-reveal]` /
`[data-count]` behaviours.

**Head metadata rules:** canonical and `og:url` use the extensionless slug on the (still TODO)
production domain; every page has its own `og-*.jpg`; **FAQPage JSON-LD only where a visible
`.faq` exists** (eligibility, cost, NSE vs BSE) and its text must equal the DOM verbatim — write
the HTML first, then copy it into the schema (`scripts/verify_pages.py` enforces this).
`about.html` adds AboutPage + Person. `thank-you.html` is `noindex, nofollow`, has no canonical
and is linked from nowhere: it exists so the production build has a URL to fire the Google Ads /
Meta conversion on.

## Eligibility checker (v1/sme-ipo-eligibility.html)

Five screens, one question each, contact details last (brief §4). DOM contract:
`[data-checker]` wraps `.checker__head` (count + `--progress` bar), a `<form>` of five
`<fieldset class="checker__screen" data-screen="n">`, `[data-checker-back/next/submit]`, a
`.result` region, and three `<template data-result="ready|nearly|not-yet">`. Screens 1–4 are
radio groups of `.choice` tiles (`role="radiogroup"`, one `#<name>-error` per group); screen 5
uses the standard `.field`/`.input` pattern (`#ck-name/company/city/mobile/email`).

Scoring — four criteria, `4 met = ready · 3 = nearly · else not yet`:

| key | radio `name` | met when | gap phrase used on "nearly" |
|---|---|---|---|
| revenue | `revenue` | `70-150`, `150-250`, `over-250` | cross the ₹70 Cr revenue mark |
| profit | `profit` | value ≥ 2 | post a second profitable year |
| networth | `networth` | `positive` | restore positive net worth |
| years | `years` | `3-plus` | complete three years of operations |

`motive` (screen 4) is captured for the CRM but not scored. The result screen shows the state
badge, a 4-bar meter, the four criteria ticked/crossed, three next steps and per-state CTAs —
"not yet" sends people to the guides rather than a sales call, per the brief.

Behaviour (`initChecker`): a **pointer** pick auto-advances after ~220 ms, **keyboard** selection
never does (arrow keys move between options; Enter advances), focus moves to the question legend
on each screen and to `.result` on submit, and Back keeps previous answers. Without JS every
screen is visible and a `<noscript>` note points to WhatsApp. Submission is **mocked** — nothing
leaves the browser; see the `// TODO` for the CRM webhook, GA4 step events and the Ads/Meta
conversion (which should fire on "ready" only). One open question is flagged in the code as
`// TODO (client)`: whether "Below ₹25 Cr" should force "not yet" even when the other three
criteria are met — the brief's literal rule is what is implemented.

## JavaScript behaviours (v1/assets/main.js)

Single IIFE, no globals, `prefers-reduced-motion` respected. `initHeader` (adds `.is-scrolled`
past 8px — drives the overlay header's transparent→white switch), `initMobileNav` (toggle, Esc,
focus return, closes ≥1024), `initActiveNav`, `initRoadmap` (ascent chart: hover,
focus, Arrow/Home/End keys, `aria-current="step"`), `initAccordion` (single-open, Arrow keys,
CSS grid height animation), `initLeadForm` (hero two-step form: per-step validation, Continue /
Back, Enter advances step 1, mocked success state), `initBookModal` (the `#book` dialog: opened by a **delegated**
`[data-book]` click listener — so controls rendered later, like the checker result, work too —
scroll lock, Esc/backdrop/close buttons, focus return, validation incl. optional email, mocked
success), `initChecker` (the eligibility checker, see above), `initNotifyForm` (resources page:
email validation + mocked success), `initReveal` (IntersectionObserver; content is never hidden
without JS), `initCounters` (any `[data-count="N"]` element counts from 0 to N with ease-out
over 1.6 s — optional `data-count-duration` — the first time 60 % of it is visible; under
reduced-motion or without IntersectionObserver the final value is simply shown; `.stat__value`
uses `tabular-nums` so widths don't jitter), `initYear`.

## Image slots (v1/images)

All `*.webp` / `og-home.jpg` files are **generated placeholders** showing their own filename and
size — except `hero-bg.webp` and the three `service-*.webp` card images, which are the client's
real photos (source PNGs kept in `images/user-uploads/`). Replace each placeholder with a real image of the same name (WebP,
roughly the same ratio); no HTML changes needed. Client uploads go in `images/user-uploads/`;
convert to WebP into `images/` (Pillow: `Image.open(src).convert('RGB').save(dst, 'WEBP', quality=82)`). Full table in `v1/images/README.md`. Keep `logo-mark.svg` (placeholder logo
until the client supplies one) and `skyline-lineart.svg` (decorative line-art).

## Verification

```powershell
python scripts/verify_pages.py         # all pages (Playwright, headless Chromium)
python scripts/verify_pages.py index.html
cd v1; python -m http.server 8080      # or just look at it: http://localhost:8080/
```

`verify_pages.py` serves `v1/` and fails on: console / page errors and 404s, horizontal overflow
at 375 / 768 / 1440 (and at 375 with the mobile menu open), internal links or `#fragments` that
do not resolve, invalid JSON-LD, FAQ schema that does not match the DOM verbatim, breadcrumb
schema that does not match `.crumbs`, duplicate ids, missing ARIA targets, more or fewer than one
`<h1>`, a stray `site-header--overlay` on an inner page, a missing canonical / `og:image`, and
**any "17 week" or week-range wording** (the client rule).

Still worth doing by hand:
- Keyboard: Tab through nav → FAQ (Enter/Space, Arrow keys) → roadmap (Arrow keys) → checker
  (arrows move between options, Enter advances) → booking dialog (Esc).
- Validate JSON-LD in Google's Rich Results Test before launch.
- Lighthouse mobile targets: Performance ≥ 90, Accessibility 100, SEO 100.
- Sample values still to be replaced: `grep -rn "data-placeholder\|SAMPLE DATA\|TODO" v1/*.html`.

Last verified (all 11 pages, 2026-09-22): `scripts/verify_pages.py` passes, and the eligibility
checker passes 27 interaction assertions in headless Chromium (three result states, the gap
phrase per missing criterion, empty-screen validation, Back, pointer auto-advance, keyboard not
auto-advancing, contact validation, Book from the result, restart).

## Outstanding inputs from the client

Brand logo · founder photo + 4–5 line bio · mandate / capital-raised / partner numbers ·
phone, WhatsApp number, email, office address · production domain · cost band % and
merchant-banker fee range + share of each cost head · promoter testimonials (logo row dropped) ·
founder figures (years, listings) + a real quote · confirmation of roadmap
step sequence · legal review of the footer disclaimer **and of privacy / terms / disclaimer**
(all placeholder text) · real images for every slot · cost-table ranges per intermediary ·
NSE vs BSE fee figures and the market observations · mandate card details · intermediary partner
logos · whether "Below ₹25 Cr" revenue should force a "not yet" checker result.

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
- **2026-09-21 (hero polish)** — Hero made "more attractive" per client: animated lime
  underline on *one advisor*, staggered entrance, icon buttons with glow, slow background
  zoom, lime glow + dotted grid, scroll cue; wider vertical spacing in the text column.
  Client then asked to **remove the eyebrow badge** and to **move the stats out of the hero**
  into a separate section (`#proof`, navy-950 band). Hero verified to end exactly at the fold
  at 375×812, 768×1024, 1366×768, 1440×900 and 1920×910.
- **2026-09-21 (fonts)** — Headings switched from Playfair Display to **Poppins**; Inter kept for
  body/UI (token renamed `--font-serif` → `--font-display`).
- **2026-09-21 (sample data + proof strip)** — All `[X]`/bracket placeholders replaced with
  realistic **sample data** and the dashed placeholder styling removed (client will supply real
  values later). Added **count-up animation** for numbers (`data-count`). Proof strip redesigned
  as four frosted stat cards with icons, descriptors and a header row.
- **2026-09-21 (roadmap)** — Roadmap section redesigned as the **ascent chart** (dark band,
  rising SVG curve with nodes, phase legend + axis, richer detail panel with prev/next and
  autoplay). Client had called the previous horizontal track "very basic".
- **2026-09-21 (service images)** — Client supplied the three service-card photos
  (`user-uploads/service-*.png` → `service-*.webp`, 1600×1000).
- **2026-09-22 (section redesigns)** — Client called each of these "very basic"; redesigned in
  turn: **Who it's for** (signal cards + readiness meter panel), **Services** (stage cards with
  photo chips, legend), **Why us** (navy "showdown" comparison column + advisor block with badge,
  inline stat row and pull-quote), **Cost** (consolidated-estimate card with share bar),
  **Testimonials** (featured navy quote + two cards; **client-logo row removed**), **FAQ**
  (sticky intro column with "Still have a question?" card + numbered accordion cards). New sample
  data added on the way (all wrapped in `data-placeholder`): three signal footers, cost-head
  shares (40/20/12/10/10/8 %), advisor figures (18 yrs · 40+ listings · 12 yrs in merchant banks),
  advisor pull-quote, "<5 months" result on the first testimonial. Verified at 375/768/1024/1440:
  no overflow, JSON-LD parses, FAQ parity, no console errors.
- **2026-09-22 (later)** — Client supplied the final-CTA background
  (`user-uploads/cta-section-bg-image.png` → `cta-bg.webp` 1920×800); overlay retuned (75 %
  image, radial + linear navy gradient), skyline line-art removed from that section. Client
  asked to **remove the floating WhatsApp button and the callback widget** entirely (HTML, CSS,
  `initCallback()` deleted; the mobile bottom bar stays).
- **2026-09-22 (hero form)** — Client asked for a **lead form in the right half of the hero**
  (reversing the earlier "keep the right side clear" decision). Built as a two-step card
  (name + mobile → company + revenue band) after the client rejected a 2-fields-per-row layout
  for being too tall; H1 cap relaxed 17ch → 20ch so it still breaks on three lines beside the
  card. Hero fold verified at 1366×768 / 1440×900; both CTAs above the fold at 375.
- **2026-09-22 (book dialog)** — Client asked for a **split-screen booking popup on every "Book"
  button, replacing the `book.html` page**. Built as a native `<dialog id="book">` in the shared
  widgets block; all seven booking links now `href="#book" data-book`. `book.html` dropped from
  the sitemap. Hero polish the same day: CTAs shortened to "Check eligibility" / "Book a call"
  (standard size, not `btn--lg`); lead forced onto two lines with a `<br>`; H1 capped at 3.5rem
  beside the form; trust line kept on one row on phones (≥360px); desktop header CTA restyled
  as a lime pill with a navy phone-icon disc, sliding arrow and hover sheen. Mobile bottom bar
  reworked in several rounds → final: transparent bar, two equal rounded lime buttons (Call us ·
  WhatsApp).
  Verified: opens from header (desktop + mobile menu), hero, advisor, FAQ card, final
  CTA and footer; Esc, backdrop and Done close it and return focus; validation and success state
  pass; no console errors at 375/768/1440. Client then asked for it to be **shorter** (fields in
  2-col rows, note field dropped → ~460px on desktop) and, on phones, a **bottom-sheet drawer
  that fits in one view** (no scrolling; swipe-down to close).
- **2026-09-22 (inner pages)** — Built the **ten remaining pages** from the brief §2/§5 so the
  mock-up is clickable end to end: eligibility checker, cost & timeline, services, NSE vs BSE,
  about, resources ("coming soon" per the client), privacy, terms, disclaimer and an unlinked
  noindex thank-you page. New shared components (`.page-hero`, `.crumbs`, `.media-frame`,
  `.table/--stack`, `.steps`, `.orbit`, `.checker/.choice/.result`, `.notify-form`, `.prose`);
  everything else reuses the home page's components. `main.js` gained `initChecker` and
  `initNotifyForm`, and `[data-book]` became a delegated listener so the checker result's Book
  button works. `make_placeholders.py` gained the per-page OG and partner-logo slots plus a
  `REAL` guard so it can never overwrite a client photo. Added `scripts/verify_pages.py`
  (site-wide checks; all 11 pages pass) and 27 checker interaction assertions.
