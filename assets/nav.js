/* ═══════════════════════════════════════════════════════════
   PLAY PODS — nav.js
   Shared JS: pod accordions, domain filter, print, nav
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── Pod accordions ──────────────────────────────────── */
  function initPods() {
    document.querySelectorAll('.pod-header').forEach(header => {
      header.addEventListener('click', () => {
        const pod = header.closest('.pod');
        const isOpen = pod.classList.contains('open');
        // Close all others if shift not held
        if (!event.shiftKey) {
          document.querySelectorAll('.pod.open').forEach(p => {
            if (p !== pod) p.classList.remove('open');
          });
        }
        pod.classList.toggle('open', !isOpen);
        header.setAttribute('aria-expanded', !isOpen);
      });
    });

    // Open first pod by default
    const first = document.querySelector('.pod');
    if (first) {
      first.classList.add('open');
      const h = first.querySelector('.pod-header');
      if (h) h.setAttribute('aria-expanded', 'true');
    }
  }

  /* ── Domain filter ───────────────────────────────────── */
  function initDomainFilter() {
    const btns = document.querySelectorAll('.domain-btn');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const domain = btn.dataset.domain;

        if (btn.classList.contains('active') && domain !== 'all') {
          // Deselect — show all
          btns.forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.pod').forEach(p => p.style.display = '');
          return;
        }

        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (domain === 'all') {
          document.querySelectorAll('.pod').forEach(p => {
            p.style.display = '';
          });
        } else {
          document.querySelectorAll('.pod').forEach(p => {
            const show = p.dataset.domain === domain;
            p.style.display = show ? '' : 'none';
            // Auto-open the shown pod
            if (show) {
              p.classList.add('open');
              const h = p.querySelector('.pod-header');
              if (h) h.setAttribute('aria-expanded', 'true');
            }
          });
        }
      });
    });
  }

  /* ── Print handler ───────────────────────────────────── */
  function initPrint() {
    const btn = document.getElementById('print-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Open all pods before printing
      document.querySelectorAll('.pod').forEach(p => p.classList.add('open'));
      window.print();
    });
  }

  /* ── Keyboard navigation ─────────────────────────────── */
  function initKeyNav() {
    document.addEventListener('keydown', e => {
      // Left/right arrow keys to navigate weeks
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        const prev = document.querySelector('.week-nav-link--prev');
        if (prev) prev.click();
      }
      if (e.key === 'ArrowRight') {
        const next = document.querySelector('.week-nav-link--next');
        if (next) next.click();
      }
    });
  }

  /* ── Active sidebar link ─────────────────────────────── */
  function initSidebar() {
    const current = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.split('/').pop() === current) {
        link.classList.add('active');
        // Scroll into view
        link.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  /* ── Smooth reveal on scroll ─────────────────────────── */
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.pod, .week-tile, .age-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'opacity .3s ease, transform .3s ease';
      obs.observe(el);
    });
  }

  /* ── Init all ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initPods();
    initDomainFilter();
    initPrint();
    initKeyNav();
    initSidebar();
    initReveal();
  });

})();
