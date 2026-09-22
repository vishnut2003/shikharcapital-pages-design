/* ==========================================================================
   Shikhar Capital — site script (v1)
   Single IIFE, no globals. Every init null-checks its root so this file can
   be loaded on every page without changes.
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DESKTOP = window.matchMedia('(min-width: 1024px)');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------------
     1. Sticky header shadow
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;
    // Take the inner-page header out of flow (see .header-fixed in style.css) so the shrink
    // below cannot shift the page. The home page's overlay header is already fixed.
    if (!header.classList.contains('site-header--overlay')) document.body.classList.add('header-fixed');
    var ticking = false;
    // Two thresholds, not one. The scrolled header is ~16px shorter, and on inner pages it sits
    // in flow, so toggling the class shifts the content — which scroll anchoring compensates for
    // by nudging scrollY. With a single threshold that nudge re-crosses it and the header flickers.
    // The gap between ON and OFF is wider than the height change, so the loop cannot close.
    var ON = 56, OFF = 24;
    function update() {
      var y = window.scrollY;
      if (y > ON) header.classList.add('is-scrolled');
      else if (y < OFF) header.classList.remove('is-scrolled');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------
     2. Mobile navigation
     --------------------------------------------------------------------- */
  function initMobileNav() {
    var toggle = $('.nav-toggle');
    var nav = $('#site-nav');
    if (!toggle || !nav) return;

    function isOpen() { return document.body.classList.contains('nav-open'); }

    function open() {
      document.body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
    function close(returnFocus) {
      if (!isOpen()) return;
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () { isOpen() ? close(true) : open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(true); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { close(false); }); });
    DESKTOP.addEventListener('change', function (e) { if (e.matches) close(false); });
  }

  /* ---------------------------------------------------------------------
     3. Mark current page in nav (header is copied verbatim across pages)
     --------------------------------------------------------------------- */
  function initActiveNav() {
    var links = $$('.site-nav__list a');
    if (!links.length) return;
    var current = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(function (a) {
      var file = a.getAttribute('href').split('#')[0].split('/').pop();
      if (file === current) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------------------------------------------------------------------
     4. Roadmap — "ascent" chart: hover / keyboard / prev-next driven detail panel,
        gentle autoplay until the visitor interacts (desktop only)
     --------------------------------------------------------------------- */
  function initRoadmap() {
    var root = $('.roadmap');
    var panel = $('#roadmap-detail');
    if (!root || !panel) return;
    var steps = $$('.roadmap__step', root);
    var buttons = $$('.roadmap__btn', root);
    if (!buttons.length) return;
    var panelWrap = $('.roadmap__panel', root);
    var counter = $('[data-roadmap-index]', root);
    var prev = $('[data-roadmap-prev]', root);
    var next = $('[data-roadmap-next]', root);
    var chart = $('.roadmap__chart', root) || root;
    var current = 0;
    var timer = null;

    function activate(i) {
      current = i;
      steps.forEach(function (el, n) {
        el.classList.toggle('is-active', n === i);
        el.classList.toggle('is-done', n < i);
      });
      buttons.forEach(function (b, n) {
        if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      root.style.setProperty('--progress', String(Math.round((i / (steps.length - 1)) * 100)));
      var detail = $('.roadmap__step-detail', steps[i]);
      if (detail) panel.innerHTML = detail.innerHTML;
      if (counter) counter.textContent = String(i + 1);
      if (panelWrap) panelWrap.setAttribute('data-step', (i + 1 < 10 ? '0' : '') + (i + 1));
    }

    function stopAutoplay() { if (timer) { clearInterval(timer); timer = null; } }
    function startAutoplay() {
      if (timer || REDUCED || !DESKTOP.matches) return;
      timer = setInterval(function () {
        if (document.hidden) return;
        activate((current + 1) % steps.length);
      }, 3600);
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('mouseenter', function () { if (DESKTOP.matches) { stopAutoplay(); activate(i); } });
      btn.addEventListener('focus', function () { if (DESKTOP.matches) { stopAutoplay(); activate(i); } });
      btn.addEventListener('click', function () { stopAutoplay(); activate(i); });
      btn.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % buttons.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = buttons.length - 1;
        if (n !== null) { e.preventDefault(); stopAutoplay(); buttons[n].focus(); activate(n); }
      });
    });
    if (prev) prev.addEventListener('click', function () { stopAutoplay(); activate((current - 1 + steps.length) % steps.length); });
    if (next) next.addEventListener('click', function () { stopAutoplay(); activate((current + 1) % steps.length); });

    // Autoplay only while the chart is on screen; any interaction ends it for good.
    var interacted = false;
    ['pointerdown', 'wheel', 'touchstart'].forEach(function (evt) {
      chart.addEventListener(evt, function () { interacted = true; stopAutoplay(); }, { passive: true });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !interacted) startAutoplay(); else stopAutoplay();
      }, { threshold: 0.4 }).observe(chart);
    }

    activate(0);
  }

  /* ---------------------------------------------------------------------
     5. FAQ accordion
     --------------------------------------------------------------------- */
  function initAccordion() {
    var lists = $$('.faq');
    if (!lists.length) return;

    lists.forEach(function (list) {
      var single = list.getAttribute('data-accordion') === 'single';
      var buttons = $$('.faq__q', list);

      function setState(btn, expanded) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (expanded) {
          panel.hidden = false;
          // Next frame so the grid transition runs from 0fr.
          window.requestAnimationFrame(function () { panel.classList.add('is-open'); });
        } else {
          panel.classList.remove('is-open');
          var done = function () { if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true; };
          if (REDUCED) done(); else panel.addEventListener('transitionend', done, { once: true });
        }
      }

      buttons.forEach(function (btn, i) {
        // Sync initial state from markup.
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel && btn.getAttribute('aria-expanded') === 'true') { panel.hidden = false; panel.classList.add('is-open'); }

        btn.addEventListener('click', function () {
          var expanded = btn.getAttribute('aria-expanded') === 'true';
          if (single && !expanded) {
            buttons.forEach(function (b) { if (b !== btn && b.getAttribute('aria-expanded') === 'true') setState(b, false); });
          }
          setState(btn, !expanded);
        });

        btn.addEventListener('keydown', function (e) {
          var next = null;
          if (e.key === 'ArrowDown') next = (i + 1) % buttons.length;
          else if (e.key === 'ArrowUp') next = (i - 1 + buttons.length) % buttons.length;
          else if (e.key === 'Home') next = 0;
          else if (e.key === 'End') next = buttons.length - 1;
          if (next !== null) { e.preventDefault(); buttons[next].focus(); }
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     6. Hero lead form (name · company · mobile · revenue band)
        Client-side validation + mocked success state. Replaces the old
        callback widget the client removed (2026-09-22).
     --------------------------------------------------------------------- */
  function initLeadForm() {
    var form = $('.lead-form');
    if (!form) return;
    var steps = $$('.lead-form__step', form);
    var success = $('.lead-form__success', form);
    var head = $('.lead-form__head', form);
    var note = $('.lead-form__note', form);
    var current = $('[data-step-current]', form);
    var stepper = $('.stepper', form);
    var nodes = $$('[data-step-node]', form);
    var pageField = $('input[name="page"]', form);
    if (pageField) pageField.value = window.location.href;

    function flag(input, msg) {
      var err = $('#' + input.id + '-error');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
      return !msg;
    }

    // Validate every field inside one step; returns the first invalid input (or null)
    function validateStep(step) {
      var firstBad = null;
      function check(input, ok, msg) {
        if (input && !flag(input, ok ? '' : msg) && !firstBad) firstBad = input;
      }
      var name = $('#lf-name', step), mobile = $('#lf-mobile', step);
      var company = $('#lf-company', step), revenue = $('#lf-revenue', step);
      if (name) check(name, name.value.trim().length > 1, 'Please enter your name.');
      if (mobile) check(mobile, /^[6-9]\d{9}$/.test(mobile.value.replace(/[\s-]/g, '')), 'Enter a valid 10-digit Indian mobile number.');
      if (company) check(company, company.value.trim().length > 1, 'Please enter your company name.');
      if (revenue) check(revenue, !!revenue.value, 'Please select your revenue band.');
      return firstBad;
    }

    function showStep(n, focusFirst) {
      steps.forEach(function (s, i) {
        s.hidden = i !== n - 1;
        s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; // replay the entrance
      });
      if (current) current.textContent = String(n);
      nodes.forEach(function (node, i) {
        node.classList.toggle('is-done', i < n - 1);
        node.classList.toggle('is-active', i === n - 1);
      });
      if (stepper) stepper.style.setProperty('--progress', n > 1 ? '100' : '0');
      if (focusFirst) { var first = $('.input', steps[n - 1]); if (first) first.focus(); }
    }

    // Clear an error as soon as the user edits that field
    $$('.input', form).forEach(function (input) {
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') flag(input, ''); });
    });

    var next = $('[data-step-next]', form);
    if (next) next.addEventListener('click', function () {
      var bad = validateStep(steps[0]);
      if (bad) { bad.focus(); return; }
      showStep(2, true);
    });
    var back = $('[data-step-back]', form);
    if (back) back.addEventListener('click', function () { showStep(1, true); });

    // Enter on a step-1 field advances instead of submitting
    steps[0] && steps[0].addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); if (next) next.click(); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validateStep(steps[0]);
      if (bad) { showStep(1, false); bad.focus(); return; }
      bad = validateStep(steps[1]);
      if (bad) { bad.focus(); return; }

      // TODO: POST to CRM webhook (Zoho / HubSpot) — see brief §7. Mock only for now.
      steps.forEach(function (s) { s.hidden = true; });
      if (head) head.hidden = true;
      if (note) note.hidden = true;
      if (success) { success.hidden = false; success.focus(); }
    });

    showStep(1, false);
  }

  /* ---------------------------------------------------------------------
     6b. "Book a call" split-screen dialog — opened by any [data-book] link
         (replaces the former book.html page). Native <dialog> gives us the
         focus trap, Esc and the backdrop; we add scroll-lock, backdrop-click
         to close, focus return, validation and a mocked success state.
     --------------------------------------------------------------------- */
  function initBookModal() {
    var dialog = $('#book');
    if (!dialog) return;
    var form = $('.book-form', dialog);
    var fields = $('.book-form__fields', form);
    var head = $('.book-form__head', form);
    var success = $('.book-form__success', form);
    var opener = null;
    var supportsDialog = typeof dialog.showModal === 'function';

    function open(from) {
      opener = from || document.activeElement;
      if (supportsDialog) { if (!dialog.open) dialog.showModal(); }
      else dialog.setAttribute('open', '');
      document.body.classList.add('book-open');
      var pageField = $('input[name="page"]', form);
      if (pageField) pageField.value = window.location.href;
      var main = $('.book__main', dialog);
      if (main) main.scrollTop = 0;
      // Desktop: focus the first field. Phones: leave focus on the close button (showModal's default)
      // so the sheet opens at the top and the keyboard doesn't pop up uninvited.
      if (!PHONE.matches) { var first = $('.input', fields.hidden ? dialog : fields); if (first) first.focus(); }
    }
    function close() {
      if (supportsDialog) { if (dialog.open) dialog.close(); }
      else dialog.removeAttribute('open');
    }

    // Delegated so controls added later (e.g. the eligibility result screen) work too
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest ? e.target.closest('[data-book]') : null;
      if (!trigger) return;
      e.preventDefault();
      open(trigger);
    });
    $$('[data-book-close]', dialog).forEach(function (btn) { btn.addEventListener('click', close); });

    // Click on the backdrop (outside the panel) closes
    dialog.addEventListener('click', function (e) {
      var r = $('.book__panel', dialog).getBoundingClientRect();
      var outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (outside) close();
    });
    // Covers Esc, close() and the polyfill path alike
    dialog.addEventListener('close', function () {
      document.body.classList.remove('book-open');
      if (opener && typeof opener.focus === 'function') opener.focus();
    });
    if (!supportsDialog) {
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dialog.hasAttribute('open')) { close(); dialog.dispatchEvent(new Event('close')); } });
    }

    // Phones: the dialog is a bottom sheet — dragging the navy header down dismisses it
    var aside = $('.book__aside', dialog);
    var PHONE = window.matchMedia('(max-width: 767px)');
    if (aside && 'PointerEvent' in window) {
      var startY = 0, dy = 0, dragging = false;
      aside.addEventListener('pointerdown', function (e) {
        if (!PHONE.matches || e.target.closest('button')) return;
        e.preventDefault();               // no text selection / native image drag → no pointercancel mid-swipe
        dragging = true; startY = e.clientY; dy = 0;
        dialog.classList.add('is-dragging');
        aside.setPointerCapture(e.pointerId);
      });
      aside.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        dy = Math.max(0, e.clientY - startY);
        dialog.style.transform = 'translateY(' + dy + 'px)';
      });
      function endDrag() {
        if (!dragging) return;
        dragging = false;
        dialog.classList.remove('is-dragging');
        if (dy > 90) {
          close();
          dialog.style.transform = '';
        } else {
          dialog.classList.add('is-settling');
          dialog.style.transform = '';
          setTimeout(function () { dialog.classList.remove('is-settling'); }, 280);
        }
      }
      aside.addEventListener('pointerup', endDrag);
      aside.addEventListener('pointercancel', endDrag);
    }

    function flag(input, msg) {
      var err = $('#' + input.id + '-error');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
      return !msg;
    }
    $$('.input', form).forEach(function (input) {
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') flag(input, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      function check(input, ok, msg) { if (!flag(input, ok ? '' : msg) && !firstBad) firstBad = input; }
      var name = $('#bk-name', form), company = $('#bk-company', form), mobile = $('#bk-mobile', form),
          email = $('#bk-email', form), revenue = $('#bk-revenue', form), slot = $('#bk-slot', form);
      check(name, name.value.trim().length > 1, 'Please enter your name.');
      check(company, company.value.trim().length > 1, 'Please enter your company name.');
      check(mobile, /^[6-9]\d{9}$/.test(mobile.value.replace(/[\s-]/g, '')), 'Enter a valid 10-digit Indian mobile number.');
      check(email, !email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'That email address does not look right.');
      check(revenue, !!revenue.value, 'Please select your revenue band.');
      check(slot, !!slot.value, 'Please pick a time window.');
      if (firstBad) { firstBad.focus(); return; }

      // TODO: POST to CRM webhook / calendar (Zoho / HubSpot / Calendly) — see brief §7. Mock only for now.
      fields.hidden = true;
      if (head) head.hidden = true;
      success.hidden = false;
      success.focus();
    });
  }

  /* ---------------------------------------------------------------------
     6c. Notify form (resources page) — email only, mocked success
     --------------------------------------------------------------------- */
  function initNotifyForm() {
    var form = $('#notify-form');
    if (!form) return;
    var email = $('#nf-email', form);
    var errEl = $('#nf-email-error');
    var success = $('.notify-form__success');
    var pageField = $('input[name="page"]', form);
    if (pageField) pageField.value = window.location.href;

    function flag(msg) {
      email.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (errEl) errEl.textContent = msg || '';
      return !msg;
    }
    email.addEventListener('input', function () {
      if (email.getAttribute('aria-invalid') === 'true') flag('');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = email.value.trim();
      if (!flag(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.')) {
        email.focus();
        return;
      }
      // TODO: POST to the CRM / newsletter list — see brief §7. Mock only for now.
      form.hidden = true;
      if (success) { success.hidden = false; success.focus(); }
    });
  }

  /* ---------------------------------------------------------------------
     6d. Eligibility checker (sme-ipo-eligibility.html)
         Five screens, one question each; contact details last. Scoring follows
         the brief: four criteria, 4 met = ready, 3 = nearly, otherwise not yet.
         See CLAUDE.md for the DOM contract.
     --------------------------------------------------------------------- */
  function initChecker() {
    var root = $('[data-checker]');
    if (!root) return;
    var form = $('.checker__form', root);
    var screens = $$('.checker__screen', root);
    var result = $('.result', root);
    var head = $('.checker__head', root);
    var counter = $('[data-checker-current]', root);
    var live = $('[data-checker-live]', root);
    var backBtn = $('[data-checker-back]', root);
    var nextBtn = $('[data-checker-next]', root);
    var submitBtn = $('[data-checker-submit]', root);
    var note = $('.checker__note', root);
    if (!form || !screens.length || !result) return;

    var TOTAL = screens.length;
    var current = 1;

    // Scoring. The brief's rule is literal: each criterion is independent.
    // TODO (client): confirm whether "Below ₹25 Cr" should force "not yet" even when
    // the other three criteria are met.
    var CRITERIA = [
      { key: 'revenue',  met: function (v) { return v === '70-150' || v === '150-250' || v === 'over-250'; },
        gap: 'cross the ₹70 Cr revenue mark' },
      { key: 'profit',   met: function (v) { return Number(v) >= 2; },
        gap: 'post a second profitable year' },
      { key: 'networth', met: function (v) { return v === 'positive'; },
        gap: 'restore positive net worth' },
      { key: 'years',    met: function (v) { return v === '3-plus'; },
        gap: 'complete three years of operations' }
    ];

    function answer(name) {
      var el = $('input[name="' + name + '"]:checked', form);
      return el ? el.value : '';
    }

    function flag(input, msg) {
      var err = $('#' + input.id + '-error');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
      return !msg;
    }

    function groupError(screen, name, msg) {
      var err = $('#' + name + '-error', screen);
      if (err) err.textContent = msg || '';
    }

    // Returns the element to focus when the screen is incomplete, else null
    function validateScreen(n) {
      var screen = screens[n - 1];
      var firstBad = null;

      // Radio screens: every radiogroup in the screen needs a checked option
      var names = [];
      $$('input[type="radio"]', screen).forEach(function (r) {
        if (names.indexOf(r.name) === -1) names.push(r.name);
      });
      names.forEach(function (name) {
        var checked = $('input[name="' + name + '"]:checked', screen);
        groupError(screen, name, checked ? '' : 'Please pick one option.');
        if (!checked && !firstBad) firstBad = $('input[name="' + name + '"]', screen);
      });

      // Contact screen
      if (n === TOTAL) {
        var name = $('#ck-name', screen);
        var company = $('#ck-company', screen);
        var city = $('#ck-city', screen);
        var mobile = $('#ck-mobile', screen);
        var email = $('#ck-email', screen);
        function check(input, ok, msg) {
          if (input && !flag(input, ok ? '' : msg) && !firstBad) firstBad = input;
        }
        check(name, name.value.trim().length > 1, 'Please enter your name.');
        check(company, company.value.trim().length > 1, 'Please enter your company name.');
        check(city, city.value.trim().length > 1, 'Please enter your city.');
        check(mobile, /^[6-9]\d{9}$/.test(mobile.value.replace(/[\s-]/g, '')), 'Enter a valid 10-digit Indian mobile number.');
        check(email, !email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'That email address does not look right.');
      }
      return firstBad;
    }

    function show(n, focus) {
      current = n;
      screens.forEach(function (s, i) {
        s.hidden = i !== n - 1;
        s.style.animation = 'none'; void s.offsetWidth; s.style.animation = '';
      });
      if (counter) counter.textContent = String(n);
      if (live) live.textContent = 'Question ' + n + ' of ' + TOTAL;
      root.style.setProperty('--progress', String(Math.round((n / TOTAL) * 100)));
      if (backBtn) backBtn.hidden = n === 1;
      if (nextBtn) nextBtn.hidden = n === TOTAL;
      if (submitBtn) submitBtn.hidden = n !== TOTAL;
      if (focus) {
        var legend = $('.checker__q', screens[n - 1]);
        if (legend) legend.focus();
      }
    }

    // Clear a field error as soon as it is edited
    $$('.input', form).forEach(function (input) {
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') flag(input, ''); });
    });

    // Pointer selection auto-advances; keyboard (arrow keys) never does, so that
    // moving through the options does not skip the screen.
    var pointerPick = false;
    root.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.choice')) {
        pointerPick = true;
        window.setTimeout(function () { pointerPick = false; }, 500);
      }
    });
    form.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      groupError(screens[current - 1], e.target.name, '');
      if (!pointerPick || current >= TOTAL) return;
      if (validateScreen(current)) return;          // screen not complete yet (Q3 has two groups)
      window.setTimeout(function () { show(current + 1, true); }, REDUCED ? 0 : 220);
    });

    // Enter on a radio advances instead of submitting
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.type === 'radio') {
        e.preventDefault();
        if (nextBtn && !nextBtn.hidden) nextBtn.click();
      }
    });

    if (nextBtn) nextBtn.addEventListener('click', function () {
      var bad = validateScreen(current);
      if (bad) { bad.focus(); return; }
      show(Math.min(current + 1, TOTAL), true);
    });
    if (backBtn) backBtn.addEventListener('click', function () { show(Math.max(current - 1, 1), true); });

    function render(state, met, values) {
      var tpl = $('template[data-result="' + state + '"]', root);
      if (!tpl) return;
      result.innerHTML = '';
      result.appendChild(tpl.content.cloneNode(true));
      result.setAttribute('data-state', state);

      var score = met.length;
      var scoreEl = $('[data-result-score]', result);
      if (scoreEl) scoreEl.textContent = score + ' / ' + CRITERIA.length;

      $$('[data-criterion]', result).forEach(function (li) {
        li.classList.toggle('is-met', met.indexOf(li.getAttribute('data-criterion')) !== -1);
      });
      $$('.result__meter-bars i', result).forEach(function (bar, i) {
        bar.style.setProperty('--i', String(i));
        bar.classList.toggle('is-on', i < score);
      });

      var gapEl = $('[data-gap]', result);
      if (gapEl) {
        var missing = CRITERIA.filter(function (c) { return met.indexOf(c.key) === -1; });
        gapEl.textContent = missing.length ? missing[0].gap : 'the remaining criterion';
      }

      var over = $('[data-note-over-250]', result);
      if (over) over.hidden = values.revenue !== 'over-250';

      var waBase = root.getAttribute('data-wa') || 'https://wa.me/?text=';
      var company = ($('#ck-company', form) || {}).value || '';
      $$('[data-result-wa]', result).forEach(function (a) {
        a.setAttribute('href', waBase + encodeURIComponent(
          'Hi Shikhar Capital, I completed the eligibility check' +
          (company.trim() ? ' for ' + company.trim() : '') +
          ' — result: ' + (($('.result__title', result) || {}).textContent || '') + '.'
        ));
      });

      form.hidden = true;
      if (head) head.hidden = true;
      if (note) note.hidden = true;
      result.hidden = false;
      window.requestAnimationFrame(function () { result.classList.add('is-visible'); });
      result.focus();

      $$('[data-checker-restart]', result).forEach(function (btn) {
        btn.addEventListener('click', function () {
          form.reset();
          $$('.field__error', form).forEach(function (el) { el.textContent = ''; });
          $$('[aria-invalid]', form).forEach(function (el) { el.setAttribute('aria-invalid', 'false'); });
          result.hidden = true;
          result.classList.remove('is-visible');
          result.removeAttribute('data-state');
          form.hidden = false;
          if (head) head.hidden = false;
          if (note) note.hidden = false;
          show(1, true);
        });
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Any earlier screen left incomplete sends the visitor back to it
      for (var n = 1; n <= TOTAL; n++) {
        var bad = validateScreen(n);
        if (bad) { show(n, false); bad.focus(); return; }
      }

      var values = {};
      ['revenue', 'profit', 'networth', 'years', 'motive'].forEach(function (k) { values[k] = answer(k); });
      var met = CRITERIA.filter(function (c) { return c.met(values[c.key]); }).map(function (c) { return c.key; });
      var state = met.length === CRITERIA.length ? 'ready' : (met.length === CRITERIA.length - 1 ? 'nearly' : 'not-yet');

      var scoreField = $('input[name="score"]', form);
      var stateField = $('input[name="state"]', form);
      var pageField = $('input[name="page"]', form);
      if (scoreField) scoreField.value = String(met.length);
      if (stateField) stateField.value = state;
      if (pageField) pageField.value = window.location.href;

      // TODO: POST to CRM webhook (Zoho / HubSpot) with the revenue band, score and state;
      // fire GA4 step events, and the Google Ads / Meta conversion on "ready" only — brief §4/§7.
      // Mock only for now; nothing leaves the browser.
      render(state, met, values);
    });

    show(1, false);
  }

  /* ---------------------------------------------------------------------
     7. Scroll reveal
     --------------------------------------------------------------------- */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     8. Count-up numbers ([data-count="40"]) — animate from 0 when scrolled into view
     --------------------------------------------------------------------- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) return; // leave the final value in place

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var duration = parseInt(el.getAttribute('data-count-duration'), 10) || 1600;
      var decimals = (String(target).split('.')[1] || '').length;
      var start = null;
      function frame(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) window.requestAnimationFrame(frame); else el.textContent = String(target);
      }
      window.requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });

    els.forEach(function (el) { el.textContent = '0'; io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     9. Footer year
     --------------------------------------------------------------------- */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileNav();
    initActiveNav();
    initRoadmap();
    initAccordion();
    initReveal();
    initCounters();
    initLeadForm();
    initBookModal();
    initNotifyForm();
    initChecker();
    initYear();
  });
})();
