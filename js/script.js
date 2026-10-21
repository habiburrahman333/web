/* ==========================================================================
   Personal Engineering Portfolio — script.js
   --------------------------------------------------------------------------
   Vanilla JavaScript, no dependencies. Everything is progressive enhancement:
   the page stays readable if this file fails to load.

   >>> EDIT THE SITE_CONFIG BLOCK BELOW with your real details. <<<
   Any value left as a [PLACEHOLDER] is treated as "not provided yet":
   - name / email show as placeholders
   - LinkedIn and GitHub rows stay hidden
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIGURATION — replace the placeholders with your real information
     ------------------------------------------------------------------------ */
  var SITE_CONFIG = {
    name: 'Habiburrahman Ahmad Fauzan',
    email: 'habiburrahmanfauzan@gmail.com',
    linkedin: 'https://bit.ly/4sffvFT',   // e.g. 'https://www.linkedin.com/in/your-profile'
    github: 'https://github.com/habiburrahman333'        // e.g. 'https://github.com/your-username'
  };

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function prefersReducedMotion() { return reducedMotionQuery.matches; }

  function isProvided(value) {
    return typeof value === 'string' && value.trim() !== '' && !/^\[.*\]$/.test(value.trim());
  }

  function validEmail(value) {
    return isProvided(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  // Only allow http(s) URLs so a mistyped config can never produce a javascript: link.
  function validUrl(value) {
    if (!isProvided(value)) { return null; }
    try {
      var url = new URL(value.trim());
      return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : null;
    } catch (e) {
      return null;
    }
  }

  function prettyUrl(href) {
    return href.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  }

  function listen(mq, handler) {
    if (mq.addEventListener) { mq.addEventListener('change', handler); }
    else if (mq.addListener) { mq.addListener(handler); }
  }

  // One shared, rAF-throttled scroll/resize pipeline
  var scrollTasks = [];
  var resizeTasks = [];
  var scrollQueued = false;

  function onScrollFrame(fn) { scrollTasks.push(fn); }
  function onResizeFrame(fn) { resizeTasks.push(fn); }

  function runScrollTasks() {
    scrollQueued = false;
    scrollTasks.forEach(function (fn) { fn(); });
  }
  function queueScroll() {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(runScrollTasks);
    }
  }

  /* ------------------------------------------------------------------------
     Site configuration → page
     ------------------------------------------------------------------------ */
  var resolvedEmail = null;

  function initConfig() {
    var nameProvided = isProvided(SITE_CONFIG.name);
    var name = nameProvided ? SITE_CONFIG.name.trim() : '[YOUR NAME]';

    $$('[data-site-name]').forEach(function (el) { el.textContent = name; });

    var initials = 'YN';
    if (nameProvided) {
      initials = name.split(/\s+/).slice(0, 2).map(function (word) {
        return word.charAt(0);
      }).join('').toUpperCase();
    }
    $$('[data-site-initials]').forEach(function (el) { el.textContent = initials; });

    if (nameProvided) {
      document.title = name + ' | Electrical Engineering Technology Portfolio';
    }

    // Email text
    if (validEmail(SITE_CONFIG.email)) {
      resolvedEmail = SITE_CONFIG.email.trim();
    }
    $$('[data-email-text]').forEach(function (el) {
      el.textContent = resolvedEmail || '[YOUR EMAIL]';
    });

    // Optional social links: shown only when a real URL is provided
    $$('[data-social]').forEach(function (row) {
      var key = row.getAttribute('data-social');
      var href = validUrl(SITE_CONFIG[key]);
      var link = $('[data-social-link]', row);
      if (href && link) {
        link.setAttribute('href', href);
        link.textContent = prettyUrl(href);
        row.hidden = false;
      } else {
        row.hidden = true;
      }
    });
  }

  /* ------------------------------------------------------------------------
     Navigation: mobile menu, active section, morphing indicator
     ------------------------------------------------------------------------ */
  function initNavigation() {
    var header = $('.site-header');
    var toggle = $('#nav-toggle');
    var nav = $('#site-nav');
    if (!header || !nav) { return; }

    var links = $$('.nav-link', nav);
    var indicator = $('.nav-indicator', nav);
    var desktopQuery = window.matchMedia('(min-width: 960px)');

    var sections = links.map(function (link) {
      var href = link.getAttribute('href') || '';
      return href.charAt(0) === '#' && href.length > 1 ? document.getElementById(href.slice(1)) : null;
    });

    var activeLink = null;
    var locked = false;
    var lockTimer = 0;
    var unlockTimer = 0;

    /* --- mobile menu --- */
    function setMenu(open) {
      if (!toggle) { return; }
      toggle.setAttribute('aria-expanded', String(open));
      header.classList.toggle('menu-open', open);
    }
    function menuIsOpen() {
      return toggle && toggle.getAttribute('aria-expanded') === 'true';
    }

    if (toggle) {
      toggle.addEventListener('click', function () { setMenu(!menuIsOpen()); });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menuIsOpen()) {
          setMenu(false);
          toggle.focus();
        }
      });

      document.addEventListener('click', function (event) {
        if (menuIsOpen() && !header.contains(event.target)) { setMenu(false); }
      });
    }

    /* --- morphing indicator (desktop) --- */
    function moveIndicator() {
      if (!indicator || !activeLink || !desktopQuery.matches) { return; }
      var navRect = nav.getBoundingClientRect();
      var linkRect = activeLink.getBoundingClientRect();
      var x = linkRect.left - navRect.left;
      var y = linkRect.top - navRect.top;
      indicator.style.width = linkRect.width + 'px';
      indicator.style.height = linkRect.height + 'px';
      indicator.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

      if (!indicator.classList.contains('is-ready')) {
        // First placement happens without a transition, then the indicator fades in.
        window.requestAnimationFrame(function () { indicator.classList.add('is-ready'); });
      }
    }

    function setActive(link) {
      if (!link || link === activeLink) { return; }
      links.forEach(function (item) { item.removeAttribute('aria-current'); });
      link.setAttribute('aria-current', 'location');
      activeLink = link;
      moveIndicator();
    }

    function updateActive() {
      if (locked) { return; }
      var line = window.innerHeight * 0.4;
      var index = 0;
      sections.forEach(function (section, i) {
        if (section && section.getBoundingClientRect().top <= line) { index = i; }
      });
      var atBottom = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2;
      if (atBottom) { index = sections.length - 1; }
      setActive(links[index]);
    }

    function updateHeader() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    // While a nav click is smooth-scrolling, keep the clicked link active instead
    // of flickering through every section on the way.
    function lockActive() {
      locked = true;
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(function () { locked = false; updateActive(); }, 1600);
    }
    onScrollFrame(function () {
      if (locked) {
        window.clearTimeout(unlockTimer);
        unlockTimer = window.setTimeout(function () {
          locked = false;
          window.clearTimeout(lockTimer);
          updateActive();
        }, 140);
      }
    });

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        setActive(link);
        lockActive();
        setMenu(false);
      });
    });

    onScrollFrame(updateHeader);
    onScrollFrame(updateActive);
    onResizeFrame(moveIndicator);

    listen(desktopQuery, function () {
      if (desktopQuery.matches) { setMenu(false); }
      moveIndicator();
    });

    updateHeader();
    updateActive();
    window.addEventListener('load', moveIndicator);
  }

  /* ------------------------------------------------------------------------
     Scroll-triggered reveal animations
     ------------------------------------------------------------------------ */
  function initReveal() {
    var items = $$('.reveal');

    $$('[data-stagger]').forEach(function (group) {
      $$(':scope > .reveal', group).forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', (i * 90) + 'ms');
      });
    });

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Pause decorative loops that are off-screen
     ------------------------------------------------------------------------ */
  function initAnimationScopes() {
    if (!('IntersectionObserver' in window)) { return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-paused', !entry.isIntersecting);
      });
    }, { rootMargin: '80px 0px' });
    $$('[data-anim-scope]').forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Project cards: expand / collapse details
     ------------------------------------------------------------------------ */
  function initProjects() {
    $$('.project-toggle').forEach(function (button) {
      var card = button.closest('.project-card');
      var label = $('.toggle-label', button);
      if (!card) { return; }

      button.addEventListener('click', function () {
        var open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        card.classList.toggle('is-open', open);
        if (label) { label.textContent = open ? 'Hide details' : 'Show details'; }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Hero: signal morph (sine → triangle → square)
     An analog waveform becoming a digital one echoes the comparator project.
     ------------------------------------------------------------------------ */
  function initSignalMorph() {
    var path = $('#wave-path');
    var button = $('#wave-toggle');
    var nameEl = $('#wave-name');
    var kindEl = $('#wave-kind');
    if (!path || !button) { return; }

    var X0 = 96, X1 = 384, MID = 240, AMP = 50;
    var STEPS = 120, CYCLES = 2, DURATION = 700;
    var TWO_PI = Math.PI * 2;

    var shapes = [
      { name: 'Sine wave', kind: 'analog', fn: function (p) { return Math.sin(p); } },
      { name: 'Triangle wave', kind: 'analog ramp', fn: function (p) { return (2 / Math.PI) * Math.asin(Math.sin(p)); } },
      { name: 'Square wave', kind: 'digital', fn: function (p) { return Math.sin(p + 1e-6) >= 0 ? 1 : -1; } }
    ];

    function sample(shape) {
      var values = [];
      for (var i = 0; i <= STEPS; i++) {
        values.push(shape.fn(TWO_PI * CYCLES * i / STEPS));
      }
      return values;
    }

    function toPath(values) {
      return values.map(function (v, i) {
        var x = X0 + (X1 - X0) * i / STEPS;
        var y = MID - v * AMP;
        return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
    }

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    var current = 0;
    var currentValues = sample(shapes[0]);
    var frame = 0;
    path.setAttribute('d', toPath(currentValues));

    button.hidden = false;
    button.addEventListener('click', function () {
      current = (current + 1) % shapes.length;
      var shape = shapes[current];
      var target = sample(shape);

      if (nameEl) { nameEl.textContent = shape.name; }
      if (kindEl) { kindEl.textContent = shape.kind; }

      window.cancelAnimationFrame(frame);

      if (prefersReducedMotion()) {
        currentValues = target;
        path.setAttribute('d', toPath(currentValues));
        return;
      }

      var start = currentValues.slice();
      var t0 = performance.now();

      function step(now) {
        var t = Math.min(1, (now - t0) / DURATION);
        var e = ease(t);
        currentValues = start.map(function (s, i) { return s + (target[i] - s) * e; });
        path.setAttribute('d', toPath(currentValues));
        if (t < 1) { frame = window.requestAnimationFrame(step); }
      }
      frame = window.requestAnimationFrame(step);
    });
  }

  /* ------------------------------------------------------------------------
     Scroll-linked background shapes
     ------------------------------------------------------------------------ */
  function initDecor() {
    var decor = $('.bg-decor');
    if (!decor || prefersReducedMotion()) { return; }

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      decor.style.setProperty('--p', progress.toFixed(4));
    }
    onScrollFrame(update);
    onResizeFrame(update);
    update();
  }

  /* ------------------------------------------------------------------------
     Contact: mailto link + copy email
     ------------------------------------------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '0';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, area.value.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  function initContact() {
    var mailLink = $('#email-link');
    var copyButton = $('#copy-email');
    var copyLabel = $('#copy-label');
    var status = $('#copy-status');
    if (!mailLink || !copyButton) { return; }

    var statusTimer = 0;
    var labelTimer = 0;
    var notSetMessage = 'Email not set yet. Add your address to SITE_CONFIG in js/script.js.';

    function say(message) {
      if (!status) { return; }
      status.textContent = message;
      window.clearTimeout(statusTimer);
      statusTimer = window.setTimeout(function () { status.textContent = ''; }, 6000);
    }

    mailLink.hidden = false;
    copyButton.hidden = false;

    if (resolvedEmail) {
      mailLink.setAttribute('href', 'mailto:' + resolvedEmail);
    } else {
      mailLink.setAttribute('aria-disabled', 'true');
      mailLink.addEventListener('click', function (event) {
        event.preventDefault();
        say(notSetMessage);
      });
    }

    copyButton.addEventListener('click', function () {
      if (!resolvedEmail) {
        say(notSetMessage);
        return;
      }
      copyText(resolvedEmail).then(function (ok) {
        window.clearTimeout(labelTimer);
        if (ok) {
          say('Email address copied to your clipboard.');
          copyButton.classList.add('is-success');
          if (copyLabel) { copyLabel.textContent = 'Copied!'; }
          labelTimer = window.setTimeout(function () {
            copyButton.classList.remove('is-success');
            if (copyLabel) { copyLabel.textContent = 'Copy email'; }
          }, 2200);
        } else {
          say('Could not copy automatically. Please copy it manually: ' + resolvedEmail);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Footer: year + back to top
     ------------------------------------------------------------------------ */
  function initFooter() {
    var year = $('#year');
    if (year) { year.textContent = String(new Date().getFullYear()); }

    var backToTop = $('#back-to-top');
    if (!backToTop) { return; }

    backToTop.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      var logo = $('.logo');
      if (logo) { logo.focus({ preventScroll: true }); }
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function init() {
    initConfig();
    initNavigation();
    initReveal();
    initAnimationScopes();
    initProjects();
    initSignalMorph();
    initDecor();
    initContact();
    initFooter();

    window.addEventListener('scroll', queueScroll, { passive: true });
    window.addEventListener('resize', function () {
      resizeTasks.forEach(function (fn) { fn(); });
      queueScroll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
