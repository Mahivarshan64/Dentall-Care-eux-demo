/* ─── NAV SCROLL ─── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── MOUSE FOLLOWER ─── */
const follower = document.querySelector('.mouse-follower');
if (follower) {
  let mx = 0, my = 0, fx = 0, fy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function raf() {
    fx += (mx - fx) * 0.14;
    fy += (my - fy) * 0.14;
    follower.style.transform = `translate(${fx}px,${fy}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  })();
  document.querySelectorAll('a,button,.treatment-pill,.case-nav-btn,.deck-btn').forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('large'));
    el.addEventListener('mouseleave', () => follower.classList.remove('large'));
  });
}

/* ─── HAMBURGER / MOBILE MENU ─── */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu-overlay');
const mobileClose = document.querySelector('.mobile-menu-close');
if (hamburger && mobileMenu) {
  function openMenu()  { mobileMenu.classList.add('open');    hamburger.classList.add('open'); }
  function closeMenu() { mobileMenu.classList.remove('open'); hamburger.classList.remove('open'); }

  hamburger.addEventListener('click', () =>
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu()
  );
  mobileClose?.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

/* ─── SCROLL REVEALS ─── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-in-up, .clip-up').forEach(el => revealObserver.observe(el));

/* ─── COUNT-UP ─── */
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function countUp(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const dur = 1800;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const val = target * easeOutExpo(p);
    el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-target]').forEach(countUp);
      countObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.about-stats,.hero-bottom,.doctor-full-stats').forEach(el => countObserver.observe(el));

/* ─── MARQUEE CLONE ─── */
document.querySelectorAll('.marquee-inner').forEach(inner => {
  inner.innerHTML += inner.innerHTML;
});

/* ─── TESTIMONIAL DECK ─── */
(function initTestimonialDeck() {
  const deck      = document.querySelector('.testimonial-deck');
  if (!deck) return;

  const cards     = Array.from(deck.querySelectorAll('.testimonial-card'));
  const dotsWrap  = document.querySelector('.deck-dots');
  const prevBtn   = document.querySelector('.deck-prev');
  const nextBtn   = document.querySelector('.deck-next');
  const counterEl = document.querySelector('.deck-counter-current');
  const total     = cards.length;
  let current     = 0;
  let animating   = false;

  /* build dot indicators */
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'deck-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Review ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap?.appendChild(d);
  });

  function render() {
    cards.forEach((card, i) => {
      const pos = (i - current + total) % total;
      card.dataset.deckPos = String(pos);
    });
    dotsWrap?.querySelectorAll('.deck-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
    if (counterEl) counterEl.textContent = current + 1;
  }

  function next() {
    if (animating) return;
    animating = true;
    const topCard = cards[current];
    topCard.classList.add('deck-exit-left');
    setTimeout(() => {
      topCard.classList.remove('deck-exit-left');
      current = (current + 1) % total;
      render();
      animating = false;
    }, 430);
  }

  function prev() {
    if (animating) return;
    animating = true;
    current = (current - 1 + total) % total;
    const inCard = cards[current];

    /* snap incoming card off-screen right without transition */
    inCard.classList.add('deck-enter-right');
    cards.forEach((c, i) => {
      if (c !== inCard) c.dataset.deckPos = String((i - current + total) % total);
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inCard.classList.remove('deck-enter-right');
        inCard.dataset.deckPos = '0';
        dotsWrap?.querySelectorAll('.deck-dot').forEach((d, i) =>
          d.classList.toggle('active', i === current)
        );
        if (counterEl) counterEl.textContent = current + 1;
        setTimeout(() => { animating = false; }, 520);
      });
    });
  }

  function goTo(i) {
    if (i === current || animating) return;
    const steps = (i - current + total) % total;
    /* always go forward (wrap around), it's the cleaner motion */
    let s = steps;
    (function step() { if (s-- > 0) { next(); setTimeout(step, 90); } })();
  }

  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  /* drag / swipe */
  let startX = 0, dragging = false;
  deck.addEventListener('mousedown',  e => { startX = e.clientX; dragging = true; });
  deck.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
  window.addEventListener('mouseup',  e => {
    if (!dragging) return; dragging = false;
    if (Math.abs(e.clientX - startX) > 48) (e.clientX < startX ? next : prev)();
  });
  window.addEventListener('touchend', e => {
    if (!dragging) return; dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 48) (dx < 0 ? next : prev)();
  });

  render();
})();


/* ─── TREATMENT ESTIMATOR ─── */
(function initEstimator() {
  const defaultData = {
    braces:     { min: 18000, max: 45000,  time: '18–24 months', c: 55, name: 'Orthodontic Braces' },
    invisalign: { min: 50000, max: 120000, time: '12–18 months', c: 75, name: 'Clear Aligners' },
    implants:   { min: 20000, max: 80000,  time: '3–6 months',   c: 85, name: 'Dental Implants' },
    whitening:  { min: 3000,  max: 8000,   time: '1–2 sessions', c: 20, name: 'Teeth Whitening' },
    rct:        { min: 3500,  max: 8000,   time: '1–2 visits',   c: 30, name: 'Root Canal Treatment' },
    dentures:   { min: 15000, max: 60000,  time: '3–6 weeks',    c: 50, name: 'Dentures / Prosthetics' }
  };
  const data = Object.assign({}, defaultData, window.ESTIMATOR_DATA || {});
  const priceEl  = document.querySelector('.estimator-price-range');
  const nameEl   = document.querySelector('.estimator-result-name');
  const timeEl   = document.querySelector('.estimator-time-val');
  const barFill  = document.querySelector('.complexity-bar-fill');
  const pills    = document.querySelectorAll('.treatment-pill');
  if (!priceEl || !pills.length) return;

  const fmt = n => '₹' + n.toLocaleString('en-IN');
  function update(key) {
    const d = data[key];
    priceEl.textContent = fmt(d.min) + ' – ' + fmt(d.max);
    if (nameEl)  nameEl.textContent  = d.name;
    if (timeEl)  timeEl.textContent  = d.time;
    if (barFill) barFill.style.width = d.c + '%';
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      update(pill.dataset.treatment);
    });
  });
  pills[0]?.classList.add('active');
  if (pills[0]) update(pills[0].dataset.treatment);
})();

/* ─── BEFORE / AFTER SLIDER ─── */
(function initSlider() {
  const s      = document.querySelector('.ba-slider');
  const before = document.querySelector('.ba-before');
  const handle = document.querySelector('.ba-handle');
  if (!s || !before || !handle) return;

  let dragging = false;
  const move = x => {
    const r = s.getBoundingClientRect();
    const p = Math.min(Math.max((x - r.left) / r.width * 100, 5), 95);
    handle.style.left = p + '%';
    before.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
  };
  s.addEventListener('mousedown',  e => { dragging = true; move(e.clientX); });
  s.addEventListener('touchstart', e => { dragging = true; move(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mousemove',  e => { if (dragging) move(e.clientX); });
  window.addEventListener('touchmove',  e => { if (dragging) move(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mouseup',  () => { dragging = false; });
  window.addEventListener('touchend', () => { dragging = false; });
})();

/* ─── CASE NAVIGATION ─── */
(function initCaseNav() {
  const cases = [
    { title: 'Complete Smile Transformation',   treatment: 'Veneers + Whitening' },
    { title: 'Orthodontic Correction',          treatment: 'Ceramic Braces' },
    { title: 'Full Arch Implant Restoration',   treatment: 'Dental Implants' },
    { title: 'Root Canal & Crown Placement',    treatment: 'RCT + Zirconia Crown' }
  ];
  let current = 0;
  const titleEl = document.querySelector('.case-title');
  const tagEl   = document.querySelector('.case-treatment-tag');
  const prevBtn = document.querySelector('.case-nav-btn.prev');
  const nextBtn = document.querySelector('.case-nav-btn.next');
  if (!titleEl) return;

  function show(i) {
    current = (i + cases.length) % cases.length;
    titleEl.textContent = cases[current].title;
    if (tagEl) tagEl.textContent = cases[current].treatment;
  }
  prevBtn?.addEventListener('click', () => show(current - 1));
  nextBtn?.addEventListener('click', () => show(current + 1));
  show(0);
})();

/* ─── FORM ─── */
const form = document.querySelector('#appointment-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Request Sent!';
      btn.style.background = 'var(--forest-light)';
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; }, 3000);
    }, 1200);
  });
}
