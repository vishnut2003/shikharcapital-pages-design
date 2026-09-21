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
    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
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
     6. Callback widget ("Leave your number, we call in 15 minutes")
     --------------------------------------------------------------------- */
  function initCallback() {
    var root = $('.callback');
    if (!root) return;
    var trigger = $('.callback__trigger', root);
    var panel = $('#callback-panel');
    var closeBtn = $('.callback__close', root);
    var form = $('.callback__form', root);
    var success = $('.callback__success', root);
    if (!trigger || !panel) return;

    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      var first = $('input', panel);
      if (first) first.focus();
    }
    function close() {
      if (panel.hidden) return;
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      (lastFocus || trigger).focus();
    }

    trigger.addEventListener('click', function () { panel.hidden ? open() : close(); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) { if (!panel.hidden && !root.contains(e.target)) close(); });
    $$('[data-open-callback]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });

    if (form) {
      var pageField = $('input[name="page"]', form);
      if (pageField) pageField.value = window.location.href;

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('input[name="name"]', form);
        var mobile = $('input[name="mobile"]', form);
        var valid = true;

        function flag(input, msg) {
          var err = $('#' + input.id + '-error');
          input.setAttribute('aria-invalid', msg ? 'true' : 'false');
          if (err) err.textContent = msg || '';
          if (msg) valid = false;
        }

        flag(name, name.value.trim() ? '' : 'Please enter your name.');
        flag(mobile, /^[6-9]\d{9}$/.test(mobile.value.replace(/\s+/g, '')) ? '' : 'Enter a valid 10-digit Indian mobile number.');
        if (!valid) { (name.getAttribute('aria-invalid') === 'true' ? name : mobile).focus(); return; }

        // TODO: POST to CRM webhook (Zoho / HubSpot) — see brief §7. Mock only for now.
        form.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
      });
    }
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
    initCallback();
    initReveal();
    initCounters();
    initYear();
  });
})();
