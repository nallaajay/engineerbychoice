// ── NAV scroll effect + scroll progress bar
const nav = document.querySelector('.site-nav') || document.querySelector('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');
const progressBar = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
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
