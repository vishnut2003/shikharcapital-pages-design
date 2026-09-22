"""Site-wide checks for the v1 mock-ups.

Serves v1/ over http and, for every page, fails on: console/page errors, 404s,
horizontal overflow, broken internal links or #fragments, invalid JSON-LD,
FAQ schema that does not match the DOM, duplicate ids, missing ARIA targets,
a stray overlay header, or any "17 week" wording (a client rule).

    python scripts/verify_pages.py            # all pages
    python scripts/verify_pages.py index.html # one page

Requires: pip install playwright && playwright install chromium
"""
import functools
import http.server
import json
import pathlib
import re
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = pathlib.Path(__file__).resolve().parent.parent / "v1"
PORT = 8123
WIDTHS = (375, 768, 1440)
# Pages that are deliberately not in the nav, so no aria-current is expected
UNLINKED = {"thank-you.html"}
# Linked from the footer only — also no nav item to mark
FOOTER_ONLY = {"privacy.html", "terms.html", "disclaimer.html"}
BANNED = re.compile(r"17[\s-]?weeks?|\b\d+\s*[-–]\s*\d+\s*weeks?\b", re.I)

failures = []
notes = []


def fail(page, msg):
    failures.append(f"{page}: {msg}")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):        # keep the report readable
        pass


def serve():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def page_ids(path):
    """Ids declared in a page, for cross-page #fragment checks."""
    html = path.read_text(encoding="utf-8")
    return set(re.findall(r'\sid="([^"]+)"', html))


def check(pg, name, all_ids):
    url = f"http://127.0.0.1:{PORT}/{name}"
    errs, bad_requests = [], []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("response", lambda r: bad_requests.append(f"{r.status} {r.url}")
          if r.status >= 400 and str(PORT) in r.url else None)

    pg.set_viewport_size({"width": WIDTHS[-1], "height": 900})
    pg.goto(url, wait_until="load")
    pg.wait_for_timeout(600)

    # scroll through so lazy images and reveal observers fire
    height = pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0, height, 600):
        pg.evaluate(f"window.scrollTo(0, {y})")
        pg.wait_for_timeout(40)
    pg.evaluate("window.scrollTo(0, 0)")
    pg.wait_for_timeout(400)

    data = pg.evaluate(
        """() => {
      const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
      const aria = [];
      ['aria-controls','aria-labelledby','aria-describedby'].forEach(attr => {
        document.querySelectorAll('[' + attr + ']').forEach(el => {
          el.getAttribute(attr).split(/\\s+/).filter(Boolean).forEach(id => {
            if (!document.getElementById(id)) aria.push(attr + '="' + id + '"');
          });
        });
      });
      return {
        title: document.title,
        h1: document.querySelectorAll('h1').length,
        dupIds: ids.filter((id, i) => ids.indexOf(id) !== i),
        aria,
        overlay: !!document.querySelector('.site-header--overlay'),
        current: document.querySelectorAll('.site-nav__list a[aria-current="page"]').length,
        canonical: (document.querySelector('link[rel=canonical]') || {}).href || '',
        robots: (document.querySelector('meta[name=robots]') || {}).content || '',
        og: (document.querySelector('meta[property="og:image"]') || {}).content || '',
        links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent),
        faq: [...document.querySelectorAll('.faq__item')].map(item => ({
          q: item.querySelector('.faq__q').textContent.trim().replace(/\\s+/g, ' '),
          a: [...item.querySelectorAll('.faq__a p')].map(p => p.textContent.trim().replace(/\\s+/g, ' ')).join(' ')
        })),
        text: document.body.innerText
      };
    }"""
    )

    if errs:
        fail(name, f"console errors: {errs[:3]}")
    if bad_requests:
        fail(name, f"failed requests: {sorted(set(bad_requests))[:3]}")
    if data["h1"] != 1:
        fail(name, f"expected 1 <h1>, found {data['h1']}")
    if data["dupIds"]:
        fail(name, f"duplicate ids: {sorted(set(data['dupIds']))}")
    if data["aria"]:
        fail(name, f"aria targets missing: {sorted(set(data['aria']))}")
    if name != "index.html" and data["overlay"]:
        fail(name, "inner page still has .site-header--overlay")
    if not data["title"]:
        fail(name, "empty <title>")
    if name in UNLINKED:
        if "noindex" not in data["robots"]:
            fail(name, "expected noindex")
        if data["canonical"]:
            fail(name, "unlinked page should have no canonical")
    elif not data["canonical"]:
        fail(name, "missing canonical")
    if not data["og"]:
        fail(name, "missing og:image")

    banned = BANNED.findall(data["text"])
    if banned:
        fail(name, f"banned timeline wording: {banned[:3]}")

    # internal links + fragments
    for href in data["links"]:
        if not href or href.startswith(("http", "mailto:", "tel:", "#")):
            continue
        target, _, frag = href.partition("#")
        tpath = ROOT / target
        if not tpath.exists():
            fail(name, f"link to missing file: {href}")
        elif frag and frag not in all_ids.get(target, set()):
            fail(name, f"link to missing fragment: {href}")

    # JSON-LD
    faq_schema = None
    crumbs_schema = None
    for raw in data["ld"]:
        try:
            doc = json.loads(raw)
        except json.JSONDecodeError as e:
            fail(name, f"invalid JSON-LD: {e}")
            continue
        if doc.get("@type") == "FAQPage":
            faq_schema = doc
        if doc.get("@type") == "BreadcrumbList":
            crumbs_schema = doc

    if data["faq"] and not faq_schema:
        fail(name, "page has an FAQ but no FAQPage schema")
    if faq_schema and not data["faq"]:
        fail(name, "FAQPage schema without a visible FAQ")
    if faq_schema and data["faq"]:
        schema_qa = [(q["name"], q["acceptedAnswer"]["text"]) for q in faq_schema["mainEntity"]]
        dom_qa = [(e["q"], e["a"]) for e in data["faq"]]
        if schema_qa != dom_qa:
            fail(name, "FAQ schema does not match the DOM verbatim")

    if crumbs_schema:
        crumb_names = [i["name"] for i in crumbs_schema["itemListElement"]]
        dom_crumbs = pg.evaluate(
            "() => [...document.querySelectorAll('.crumbs li')].map(li => li.textContent.trim())"
        )
        if crumb_names != dom_crumbs:
            fail(name, f"breadcrumb schema {crumb_names} != DOM {dom_crumbs}")

    # overflow at each width (plus with the mobile menu open)
    for w in WIDTHS:
        pg.set_viewport_size({"width": w, "height": 900})
        pg.wait_for_timeout(250)
        if pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"):
            fail(name, f"horizontal overflow at {w}px")
    pg.set_viewport_size({"width": 375, "height": 812})
    pg.wait_for_timeout(200)
    pg.evaluate("document.querySelector('.nav-toggle').click()")   # JS click: the header's
    pg.wait_for_timeout(500)                                        # shrink transition breaks
                                                                    # Playwright's stability check
    if pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"):
        fail(name, "horizontal overflow at 375px with the menu open")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(200)

    # booking dialog opens from the header and closes on Escape
    pg.set_viewport_size({"width": 1440, "height": 900})
    pg.wait_for_timeout(200)
    pg.evaluate("document.querySelector('.site-header__cta').click()")
    pg.wait_for_timeout(500)
    if not pg.evaluate("document.getElementById('book').open"):
        fail(name, "booking dialog did not open from the header")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(300)
    if pg.evaluate("document.getElementById('book').open"):
        fail(name, "booking dialog did not close on Escape")

    if name not in UNLINKED and name not in FOOTER_ONLY and name != "index.html" and data["current"] != 1:
        notes.append(f"{name}: aria-current on {data['current']} nav links")

    return data


def main():
    pages = sys.argv[1:] or sorted(p.name for p in ROOT.glob("*.html"))
    all_ids = {p.name: page_ids(p) for p in ROOT.glob("*.html")}
    httpd = serve()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for name in pages:
                ctx = browser.new_context()
                pg = ctx.new_page()
                before = len(failures)
                check(pg, name, all_ids)
                status = "PASS" if len(failures) == before else "FAIL"
                print(f"  {status}  {name}")
                ctx.close()
            browser.close()
    finally:
        httpd.shutdown()

    print()
    for n in notes:
        print("  note:", n)
    if failures:
        print(f"\n{len(failures)} FAILURE(S):")
        for f in failures:
            print("  -", f)
        return 1
    print(f"All {len(pages)} page(s) passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
