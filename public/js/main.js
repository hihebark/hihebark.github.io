'use strict';

// ── Dot reveal on mouse move ─────────────────────────
const dotReveal = document.createElement('div');
dotReveal.className = 'dot-reveal';
document.body.insertBefore(dotReveal, document.body.firstChild);

let rafPending = false;
document.addEventListener('mousemove', e => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    dotReveal.style.setProperty('--mx', e.clientX + 'px');
    dotReveal.style.setProperty('--my', e.clientY + 'px');
    rafPending = false;
  });
}, { passive: true });

//── Copy email ───────────────────────────────────────
document.querySelectorAll('.copy-email').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.email).then(() => {
      const orig = btn.textContent;
      btn.textContent = '[copied]';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => {
      const orig = btn.textContent;
      btn.textContent = '[failed]';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  });
});

// ── Scroll reveal (progressive enhancement) ──────────
// JS adds pre-reveal; CSS only hides when that class is present
// so content is always visible without JS
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = e.target.dataset.delay || '0s';
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.classList.add('pre-reveal');
  el.dataset.delay = (i * 0.06) + 's';
  revealObs.observe(el);
});

// ── Page transition out ──────────────────────────────
document.querySelectorAll('.hero-nav a').forEach(link => {
  link.addEventListener('click', e => {
    if (link.href === window.location.href) return;
    e.preventDefault();
    const href = link.href;
    document.querySelector('main').style.cssText = 'opacity:0;transform:translateY(-4px);transition:opacity 0.18s ease,transform 0.18s ease';
    setTimeout(() => { window.location.href = href; }, 200);
  });
});
