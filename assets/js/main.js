/**
 * main.js — Shared site-wide behaviour:
 *   - Navbar scroll effect & active page highlighting
 *   - Mobile hamburger menu toggle
 *   - Dropdown menus (keyboard + click)
 *   - FAQ accordion
 *   - Scroll-reveal animation
 *   - Important Dates timeline (rendered from Sheets / demo data)
 *   - Smooth back-to-top
 */

import {
  fetchSheet, toYouTubeEmbed,
  DEMO_DATES, DEMO_FAQ,
} from './sheets.js';

/* =============================================
   NAVBAR
   ============================================= */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const dropdowns = document.querySelectorAll('.has-dropdown');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile hamburger
  toggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  // Dropdown toggles (click)
  dropdowns.forEach(li => {
    const btn = li.querySelector('.nav-btn');
    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = li.classList.toggle('open');
      // Close other dropdowns
      dropdowns.forEach(other => {
        if (other !== li) other.classList.remove('open');
      });
      btn.setAttribute('aria-expanded', isOpen);
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    dropdowns.forEach(li => {
      li.classList.remove('open');
      li.querySelector('.nav-btn')?.setAttribute('aria-expanded', 'false');
    });
  });

  // Keyboard accessibility for dropdowns
  dropdowns.forEach(li => {
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        li.classList.remove('open');
        li.querySelector('.nav-btn')?.focus();
      }
    });
  });

  // Active page highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#navLinks a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      // Also mark parent dropdown button active
      const parentLi = link.closest('.has-dropdown');
      parentLi?.querySelector('.nav-btn')?.classList.add('active');
    }
  });
})();


/* =============================================
   FAQ ACCORDION
   ============================================= */
async function initFAQ(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let rows = await fetchSheet('faq');
  if (!rows) rows = DEMO_FAQ;

  if (!rows.length) {
    container.innerHTML = '<p class="empty-state">No FAQs available yet.</p>';
    return;
  }

  container.innerHTML = rows.map((row, i) => `
    <div class="accordion-item">
      <button class="accordion-header" aria-expanded="false" aria-controls="faq-body-${i}" id="faq-hdr-${i}">
        ${escHtml(row.Question || row.question || '')}
        <span class="accordion-icon" aria-hidden="true">+</span>
      </button>
      <div class="accordion-body" id="faq-body-${i}" role="region" aria-labelledby="faq-hdr-${i}">
        <div class="accordion-body-inner">${escHtml(row.Answer || row.answer || '')}</div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const isActive = header.classList.contains('active');
      // Close all
      container.querySelectorAll('.accordion-header').forEach(h => {
        h.classList.remove('active');
        h.setAttribute('aria-expanded', 'false');
        document.getElementById(h.getAttribute('aria-controls'))?.classList.remove('open');
      });
      // Open clicked if it was closed
      if (!isActive) {
        header.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        document.getElementById(header.getAttribute('aria-controls'))?.classList.add('open');
      }
    });
  });
}


/* =============================================
   IMPORTANT DATES TIMELINE
   ============================================= */
async function initTimeline(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let rows = await fetchSheet('importantDates');
  if (!rows) rows = DEMO_DATES;

  if (!rows.length) {
    container.innerHTML = '<p class="timeline-empty">No dates have been published yet. Check back soon.</p>';
    return;
  }

  container.innerHTML = rows.map(row => `
    <div class="timeline-item">
      <div class="timeline-date">${escHtml(row.Date || row.date || '')}</div>
      <div class="timeline-event">${escHtml(row.Event || row.event || '')}</div>
      <div class="timeline-desc">${escHtml(row.Description || row.description || '')}</div>
    </div>
  `).join('');
}


/* =============================================
   SCROLL REVEAL
   ============================================= */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(el => observer.observe(el));
}


/* =============================================
   BACK TO TOP
   ============================================= */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 500 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


/* =============================================
   HELPERS
   ============================================= */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/* =============================================
   INIT ON DOM READY
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initBackToTop();
  initFAQ('#faq-accordion');
  initTimeline('#dates-timeline');
});

export { escHtml, initFAQ, initTimeline };
