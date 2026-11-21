/* Sunder site behaviour: sticky nav, nav underline, scroll reveals, parallax,
   background spiral, project galleries + lightbox, contact form.
   No dependencies. Every effect is skipped when the visitor prefers reduced motion. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.remove('no-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Nav: compact on scroll + sliding underline ---------- */
  var nav = $('.nav');
  var links = $('.nav-links');
  var ul = $('.nav-ul');
  function moveUnderline(a) {
    if (!ul || !a) return;
    ul.style.left = a.offsetLeft + 'px';
    ul.style.width = a.offsetWidth + 'px';
    ul.style.opacity = '1';
  }
  function underlineHome() { moveUnderline($('.nav-links a[aria-current="page"]')); }
  if (links) {
    $$('a', links).forEach(function (a) {
      a.addEventListener('mouseenter', function () { moveUnderline(a); });
      a.addEventListener('focus', function () { moveUnderline(a); });
    });
    links.addEventListener('mouseleave', underlineHome);
    links.addEventListener('focusout', function (e) { if (!links.contains(e.relatedTarget)) underlineHome(); });
    // Wait for web fonts so link widths are final
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(underlineHome);
    window.addEventListener('resize', underlineHome);
  }

  /* ---------- Background spiral: on from load, or after the first green section ---------- */
  var bg = $('.bg-mark');
  var trigger = bg && bg.dataset.after ? $(bg.dataset.after) : null;

  function onScroll() {
    var y = window.scrollY || doc.scrollTop || 0;
    if (nav) nav.classList.toggle('is-compact', y > 16);
    if (bg) bg.classList.toggle('is-on', trigger ? trigger.getBoundingClientRect().bottom < window.innerHeight : true);
    if (!reduce) parallax();
  }

  /* ---------- Parallax on photo placeholders ---------- */
  var pars = $$('.par');
  function parallax() {
    var h = window.innerHeight;
    pars.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) return;
      el.style.transform = 'translateY(' + ((r.top + r.height / 2 - h / 2) * -0.08).toFixed(1) + 'px)';
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$('[data-reveal] > *, .svc, .project');
  if (!reduce && 'IntersectionObserver' in window) {
    revealEls.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = [].indexOf.call(en.target.parentNode.children, en.target);
        en.target.style.transitionDelay = (Math.min(i, 6) * 80) + 'ms';
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Galleries + lightbox ---------- */
  var ICON_PREV = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
  var ICON_NEXT = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
  var ICON_EXPAND = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>';

  var lb = $('#lightbox');
  var lbState = null; // { gallery, index }

  function setupGallery(g) {
    var title = g.dataset.title || 'Project';
    var frame = $('.gallery-frame', g);
    var slides = $$('.gallery-slide', g);
    var n = slides.length;
    if (!frame || !n) return;
    g._index = 0;

    var expand = document.createElement('button');
    expand.type = 'button';
    expand.className = 'expand';
    expand.title = 'View full size';
    expand.setAttribute('aria-label', 'View ' + title + ' photos full size');
    expand.innerHTML = ICON_EXPAND;
    frame.appendChild(expand);

    var controls = document.createElement('div');
    controls.className = 'gallery-controls';
    controls.innerHTML = '<button type="button" class="arrow" aria-label="Previous photo">' + ICON_PREV + '</button>' +
      '<div class="gallery-dots" role="group" aria-label="' + title + ' photos"></div>' +
      '<button type="button" class="arrow" aria-label="Next photo">' + ICON_NEXT + '</button>';
    g.appendChild(controls);
    var dotsWrap = $('.gallery-dots', controls);
    var dots = slides.map(function (_, k) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot';
      d.setAttribute('aria-label', 'Show photo ' + (k + 1) + ' of ' + n);
      d.addEventListener('click', function () { show(k); });
      dotsWrap.appendChild(d);
      return d;
    });

    function show(k) {
      g._index = (k + n) % n;
      slides.forEach(function (s, i) { s.hidden = i !== g._index; });
      dots.forEach(function (d, i) { d.setAttribute('aria-pressed', i === g._index ? 'true' : 'false'); });
    }
    g._show = show;
    var arrows = $$('.arrow', controls);
    arrows[0].addEventListener('click', function () { show(g._index - 1); });
    arrows[1].addEventListener('click', function () { show(g._index + 1); });
    expand.addEventListener('click', function () { openLightbox(g); });
    show(0);
  }

  function renderLightbox() {
    var g = lbState.gallery, slides = $$('.gallery-slide', g), n = slides.length, k = lbState.index;
    $('.lb-title', lb).textContent = g.dataset.title || 'Project';
    $('.lb-counter', lb).textContent = 'Photo ' + (k + 1) + ' of ' + n;
    var photo = $('.lb-photo', lb);
    photo.style.aspectRatio = g.classList.contains('gallery-wide') ? '21 / 9' : '3 / 2';
    var slide = slides[k];
    var img = $('img', slide);
    if (img) {
      photo.innerHTML = '';
      var big = img.cloneNode();
      if (img.dataset.full) big.src = img.dataset.full;
      big.style.objectFit = 'contain';
      photo.appendChild(big);
    } else {
      var label = $('.photo-label', slide);
      photo.innerHTML = '<span class="photo-label">Full-size ' + (label ? label.textContent.toLowerCase() : 'photo') + '</span>';
    }
  }
  function openLightbox(g) {
    if (!lb) return;
    lbState = { gallery: g, index: g._index, opener: document.activeElement };
    renderLightbox();
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    $('.lb-close', lb).focus();
  }
  function stepLightbox(d) {
    var n = $$('.gallery-slide', lbState.gallery).length;
    lbState.index = (lbState.index + d + n) % n;
    lbState.gallery._show(lbState.index);
    renderLightbox();
  }
  function closeLightbox() {
    if (lb.close) lb.close(); else lb.removeAttribute('open');
  }
  if (lb) {
    $('.lb-close', lb).addEventListener('click', closeLightbox);
    $('.lb-prev', lb).addEventListener('click', function () { stepLightbox(-1); });
    $('.lb-next', lb).addEventListener('click', function () { stepLightbox(1); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });
    lb.addEventListener('close', function () {
      if (lbState && lbState.opener) lbState.opener.focus();
      lbState = null;
    });
  }
  $$('.gallery').forEach(setupGallery);

  /* ---------- Contact form ---------- */
  var form = $('#estimate-form');
  if (form) {
    var endpoint = form.getAttribute('action');
    var checks = {
      name: function (v) { return v ? '' : 'Enter your name.'; },
      email: function (v) { return v && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? '' : 'Enter an email address like name@example.com.'; },
      message: function (v) { return v ? '' : 'Tell us a little about the project.'; }
    };
    function setError(name, msg) {
      var field = form.elements[name].closest('.field');
      var err = $('.field-error', field);
      var input = form.elements[name];
      field.classList.toggle('has-error', !!msg);
      err.hidden = !msg;
      err.textContent = msg;
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(checks).forEach(function (name) {
        var msg = checks[name](form.elements[name].value.trim());
        setError(name, msg);
        if (msg && !firstBad) firstBad = form.elements[name];
      });
      if (firstBad) { firstBad.focus(); return; }

      var btn = $('button[type="submit"]', form);
      var alert = $('.form-alert', form);
      alert.hidden = true;
      btn.disabled = true;
      btn.textContent = 'Sending…';

      // No endpoint configured yet: show the thank-you state so the flow can be reviewed.
      var send = endpoint && endpoint !== '#'
        ? fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error(r.status); })
        : Promise.resolve();

      send.then(function () {
        var done = $('#form-done');
        form.hidden = true;
        done.hidden = false;
        done.focus();
      }).catch(function () {
        alert.hidden = false;
        btn.disabled = false;
        btn.textContent = 'Send';
      });
    });
  }
})();
