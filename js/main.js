// ── NAV scroll effect + scroll progress bar
const nav = document.querySelector('.site-nav') || document.querySelector('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');
const progressBar = document.getElementById('scroll-progress');

const scrollTasks = [];
const onScroll = () => {
  nav?.classList.toggle('scrolled', window.scrollY > 50);

  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id');
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href.startsWith('#')) return;
    link.classList.toggle('active', href === `#${current}`);
  });

  if (progressBar) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docHeight > 0 ? (window.scrollY / docHeight * 100) + '%' : '0%';
  }
  scrollTasks.forEach(fn => fn());
};
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
}, { passive: true });

// ── Mobile hamburger
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-menu') || document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  const isOpen = navLinksContainer.classList.toggle('open');
  hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

navLinksContainer?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  });
});

// ── Scroll reveal with stagger
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = el.parentElement
      ? [...el.parentElement.children].filter(c => c.classList.contains('reveal') && !c.classList.contains('visible'))
      : [];
    const idx = siblings.indexOf(el);
    el.style.transitionDelay = idx >= 0 && idx < 4 ? `${idx * 80}ms` : '';
    el.classList.add('visible');
    revealObserver.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .timeline-item').forEach(el => revealObserver.observe(el));

// ── Gallery thumbnails
document.querySelectorAll('.project-gallery').forEach(gallery => {
  const mainImg = gallery.querySelector('img.main-img');
  const thumbs = gallery.querySelectorAll('.thumb');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      if (!mainImg) return;
      mainImg.src = thumb.src;
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  if (thumbs.length > 0) thumbs[0].classList.add('active');
});

// ── Lightbox with focus trap
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

document.querySelectorAll('.lightbox-trigger').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || 'Enlarged project image';
    lightbox.classList.add('open');
    lightboxClose?.focus();
  });
});

lightboxClose?.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') lightbox?.classList.remove('open');
});

// ── YouTube facade: click to load iframe
document.querySelectorAll('.yt-facade').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap = btn.closest('[data-video-id]');
    if (!wrap) return;
    const id = wrap.dataset.videoId;
    const title = wrap.dataset.videoTitle || 'Video';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`;
    iframe.title = title;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;border:0;';
    wrap.style.position = 'relative';
    wrap.appendChild(iframe);
    btn.remove();
  });
});

// ── Stat counters (count up on scroll into view)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + suffix;
        if (current >= target) clearInterval(timer);
      }, 35);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
}

// ── Before → after metrics: the bar drains and the number counts to its result
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const fmtCount = (el, n) => {
    if (el.dataset.kind === 'dur') {
      return n >= 90 ? `${Math.round(n / 60)} hr` : `~${Math.round(n)} min`;
    }
    return (el.dataset.prefix || '') + Math.round(n) + (el.dataset.suffix || '');
  };
  const runMetric = (metric) => {
    const el = metric.querySelector('.metric-count');
    metric.classList.add('metric--run');
    if (!el) return;
    const from = parseFloat(el.dataset.from);
    const to = parseFloat(el.dataset.to);
    const finalText = el.dataset.final;
    const dur = 1500;
    let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const t = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      // ratios (30% → 2%, 40 hr → 20 min) read better on a log scale; counts from zero stay linear
      const n = from > 0 && to > 0 ? from * Math.pow(to / from, e) : from + (to - from) * e;
      if (t < 1) { el.textContent = fmtCount(el, n); requestAnimationFrame(tick); }
      else el.textContent = finalText;
    };
    requestAnimationFrame(tick);
  };
  const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      metricObserver.unobserve(entry.target);
      const idx = [...entry.target.parentElement.children].indexOf(entry.target);
      setTimeout(() => runMetric(entry.target), idx * 140);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.metric').forEach(metric => {
    if (!metric.querySelector('.metric-bar')) return;
    const el = metric.querySelector('.metric-count');
    if (el) {
      el.dataset.final = el.textContent;
      el.textContent = fmtCount(el, parseFloat(el.dataset.from));
    }
    metric.classList.add('metric--armed');
    metricObserver.observe(metric);
  });
}

// ── Fault trace: pick a symptom, watch the possible causes light up across disciplines
const trace = document.getElementById('trace');
if (trace) {
  const tabs = [...trace.querySelectorAll('.trace-tab')];
  const panels = [...trace.querySelectorAll('.trace-panel')];
  const play = (panel) => {
    panel.classList.remove('is-tracing');
    void panel.offsetWidth; // restart the CSS sweep
    panel.classList.add('is-tracing');
  };
  const select = (i, focus) => {
    tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(j === i));
      tab.tabIndex = j === i ? 0 : -1;
    });
    panels.forEach((panel, j) => { panel.hidden = j !== i; });
    if (focus) tabs[i].focus();
    play(panels[i]);
  };
  trace.querySelectorAll('.trace-tabs, .trace-prompt').forEach(el => { el.hidden = false; });
  trace.querySelectorAll('.trace-title').forEach(el => { el.hidden = true; });
  panels.forEach((panel, j) => { panel.hidden = j !== 0; });
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', e => {
      const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!move) return;
      e.preventDefault();
      select((i + move + tabs.length) % tabs.length, true);
    });
  });
  if ('IntersectionObserver' in window) {
    const traceObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      traceObserver.disconnect();
      play(panels.find(panel => !panel.hidden) || panels[0]);
    }, { threshold: 0.35 });
    traceObserver.observe(trace);
  }
}

// ── Method: pinned on desktop, scroll steps through Diagnose → Redesign → Prove
const methodPin = document.querySelector('.method-pin');
if (methodPin) {
  const steps = [...methodPin.querySelectorAll('.method-step')];
  const pinQuery = window.matchMedia('(min-width: 1025px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
  const updatePin = () => {
    if (!methodPin.classList.contains('is-pinned')) return;
    const navH = nav ? nav.offsetHeight : 0;
    const rect = methodPin.getBoundingClientRect();
    const travel = rect.height - (window.innerHeight - navH);
    const p = travel > 0 ? Math.min(Math.max((navH - rect.top) / travel, 0), 1) : 0;
    const active = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === active);
      const fill = Math.min(Math.max(p * steps.length - i, 0), 1);
      step.style.setProperty('--fill', (fill * 100).toFixed(1) + '%');
    });
  };
  const applyPin = () => {
    methodPin.classList.toggle('is-pinned', pinQuery.matches);
    if (!pinQuery.matches) {
      steps.forEach(step => { step.classList.remove('is-active'); step.style.removeProperty('--fill'); });
    }
    updatePin();
  };
  pinQuery.addEventListener('change', applyPin);
  window.addEventListener('resize', updatePin, { passive: true });
  scrollTasks.push(updatePin);
  applyPin();
}

// ── Hero clip: don't decode video nobody is looking at
const heroVideo = document.querySelector('.hero-clip-video');
if (heroVideo && 'IntersectionObserver' in window) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) heroVideo.play().catch(() => {});
    else heroVideo.pause();
  }, { threshold: 0.05 }).observe(heroVideo);
}

// ── Timeline draw-on-scroll
const timeline = document.querySelector('.timeline');
if (timeline) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      timeline.classList.add('line-visible');
    }
  }, { threshold: 0.05 }).observe(timeline);
}

// ── Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Form client-side validation
const contactForm = document.querySelector('.contact-form-wrap form');
if (contactForm) {
  let errorEl = contactForm.querySelector('.form-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.style.display = 'none';
    contactForm.prepend(errorEl);
  }

  contactForm.addEventListener('submit', e => {
    const name = contactForm.querySelector('[name="name"]');
    const email = contactForm.querySelector('[name="email"]');
    const message = contactForm.querySelector('[name="message"]');
    errorEl.style.display = 'none';

    if (!name?.value.trim()) {
      e.preventDefault();
      errorEl.textContent = 'Please enter your name.';
      errorEl.style.display = 'block';
      name?.focus();
      return;
    }
    if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      e.preventDefault();
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.style.display = 'block';
      email?.focus();
      return;
    }
    if (!message?.value.trim()) {
      e.preventDefault();
      errorEl.textContent = 'Please include a message.';
      errorEl.style.display = 'block';
      message?.focus();
    }
  });
}

// ── Copy email to clipboard
document.querySelectorAll('.copy-email').forEach(btn => {
  btn.addEventListener('click', async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = email; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    btn.textContent = 'Copied ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('Engineer by Choice — loaded.');
});
