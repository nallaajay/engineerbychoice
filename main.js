// ── NAV scroll effect
const nav = document.querySelector('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);

  // Active nav link
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

// ── Mobile hamburger
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  navLinksContainer.classList.toggle('open');
  hamburger.classList.toggle('open');
});

navLinksContainer?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
    hamburger?.classList.remove('open');
  });
});

// ── Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .timeline-item').forEach(el => {
  revealObserver.observe(el);
});

// ── Gallery thumbnails (image switcher)
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

  // Set first thumb active
  if (thumbs.length > 0) thumbs[0].classList.add('active');
});

// ── Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.lightbox-trigger').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('open');
  });
});

document.querySelector('.lightbox-close')?.addEventListener('click', () => {
  lightbox.classList.remove('open');
});

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('open');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') lightbox?.classList.remove('open');
});

// ── Video autoplay on scroll into view (src-swap method — most reliable)
const videoAutoplay = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const iframe = entry.target.querySelector('iframe');
    if (!iframe) return;
    if (entry.isIntersecting) {
      // Add autoplay+mute to src if not already there
      if (!iframe.src.includes('autoplay=1')) {
        const sep = iframe.src.includes('?') ? '&' : '?';
        iframe.src = iframe.src + sep + 'autoplay=1&mute=1';
      }
    } else {
      // Remove autoplay params to pause — strip and reload
      iframe.src = iframe.src
        .replace('&autoplay=1&mute=1', '')
        .replace('?autoplay=1&mute=1', '')
        .replace('autoplay=1&mute=1&', '')
        .replace('autoplay=1&mute=1', '');
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.video-only').forEach(el => videoAutoplay.observe(el));

// ── Smooth cursor trail (subtle)
document.addEventListener('DOMContentLoaded', () => {
  console.log('Engineer by Choice — Portfolio loaded.');
});

function handleFormSubmit(e) {
  e.preventDefault();
  var success = document.getElementById('form-success');
  if (success) { success.style.display = 'block'; }
  e.target.reset();
}
