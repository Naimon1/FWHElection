/**
 * candidates.js — Renders position sections and candidate cards
 * driven by Google Sheets (or demo data).
 */

import {
  fetchSheet, groupBy, sortCandidates,
  toYouTubeEmbed, toDriveImage, toDrivePDF,
  DEMO_CANDIDATES,
} from './sheets.js';

/* Canonical position order as specified in the outline */
const POSITION_ORDER = [
  'Deputy Hall Chairperson',
  'Treasurer',
  'Secretary',
  'Public Relation Officer',
  'Welfare Officer',
  'Cultural and Entertainment Activities Chairperson (CEAC)',
  'Maintenance Representation',
  'Constitutional Chairperson',
  'Sports and Games Chairperson',
];

const POSITION_ICONS = {
  'Deputy Hall Chairperson': '🏛️',
  'Treasurer': '💰',
  'Secretary': '📋',
  'Public Relation Officer': '📢',
  'Welfare Officer': '🤝',
  'Cultural and Entertainment Activities Chairperson (CEAC)': '🎭',
  'Maintenance Representation': '🔧',
  'Constitutional Chairperson': '⚖️',
  'Sports and Games Chairperson': '🏆',
};

function getPositionIcon(pos) {
  for (const key of Object.keys(POSITION_ICONS)) {
    if (pos.toLowerCase().includes(key.toLowerCase().substring(0, 8))) return POSITION_ICONS[key];
  }
  return POSITION_ICONS[pos] || '🏷️';
}

/* =============================================
   MAIN INIT
   ============================================= */
async function initCandidatesPage() {
  const mainEl    = document.getElementById('candidates-main');
  const sidebarEl = document.getElementById('positions-sidebar-nav');
  if (!mainEl) return;

  // Show loading spinner
  mainEl.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading candidates…</p>
    </div>`;

  let rows = await fetchSheet('candidates');
  const isDemo = !rows;
  if (isDemo) rows = DEMO_CANDIDATES;

  if (!rows || !rows.length) {
    mainEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No candidate information has been published yet. Please check back closer to the election.</p>
      </div>`;
    return;
  }

  if (isDemo) {
    mainEl.insertAdjacentHTML('beforebegin', `
      <div class="container" style="margin-bottom:1.5rem">
        <div class="alert alert-gold">
          <span class="alert-icon">ℹ️</span>
          <span><strong>Demo mode:</strong> The Google Sheets URL has not been configured yet. 
          The cards below are placeholder examples. See the <a href="README.md" style="color:inherit;text-decoration:underline;">setup guide</a> to connect your spreadsheet.</span>
        </div>
      </div>`);
  }

  // Build a map keyed by position
  const grouped = groupBy(rows, 'Position');

  // Sort positions by canonical order, then alphabetically for any extras
  const positionKeys = [...new Set([
    ...POSITION_ORDER.filter(p => grouped.has(p)),
    ...[...grouped.keys()].filter(p => !POSITION_ORDER.includes(p)).sort(),
  ])];

  // Build sidebar nav
  if (sidebarEl) {
    sidebarEl.innerHTML = positionKeys.map(pos => {
      const slug = positionToSlug(pos);
      const icon = getPositionIcon(pos);
      const count = grouped.get(pos)?.length || 0;
      return `<li>
        <a href="#${slug}" title="${escHtml(pos)}">
          <span style="margin-right:0.4rem">${icon}</span>${escHtml(abbreviate(pos, 28))}
          <span style="margin-left:auto;font-size:0.72rem;color:var(--text-muted)">${count}</span>
        </a>
      </li>`;
    }).join('');
  }

  // Build position sections
  mainEl.innerHTML = positionKeys.map(pos => {
    const candidates = sortCandidates(grouped.get(pos) || []);
    const slug  = positionToSlug(pos);
    const icon  = getPositionIcon(pos);
    const count = candidates.length;

    return `
    <section class="position-section" id="${slug}" data-reveal>
      <div class="position-header">
        <span class="position-icon" aria-hidden="true">${icon}</span>
        <h2>${escHtml(pos)}</h2>
        <span class="candidate-count">${count} candidate${count !== 1 ? 's' : ''}</span>
      </div>
      <div class="candidates-grid">
        ${candidates.map(c => buildCandidateCard(c, pos)).join('')}
      </div>
    </section>`;
  }).join('');

  // Highlight active sidebar link on scroll
  initSidebarScroll(positionKeys);
}

/* =============================================
   CANDIDATE CARD HTML
   ============================================= */
function buildCandidateCard(c, pos) {
  const fullName = `${c.FirstName || ''} ${c.LastName || ''}`.trim() || 'Candidate';
  const photoUrl = toDriveImage(c.PhotoURL);
  const pdfUrl   = toDrivePDF(c.ManifestoURL);
  const videoUrl = toYouTubeEmbed(c.VideoURL);

  const keyPoints = [c.KeyPoint1, c.KeyPoint2, c.KeyPoint3].filter(Boolean);

  const socialLinks = (c.SocialLink || '').split('|').map(s => s.trim()).filter(Boolean);

  return `
  <div class="candidate-card">
    <div class="candidate-photo-wrap">
      ${photoUrl
        ? `<img src="${escHtml(photoUrl)}" alt="Photo of ${escHtml(fullName)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=candidate-photo-placeholder>👤</div>'">`
        : '<div class="candidate-photo-placeholder">👤</div>'
      }
    </div>
    <div class="candidate-info">
      <div class="candidate-name">${escHtml(fullName)}</div>
      <div class="candidate-position-badge">${escHtml(pos)}</div>

      ${keyPoints.length ? `
      <ul class="candidate-keypoints" aria-label="Key platform points">
        ${keyPoints.map(kp => `<li>${escHtml(kp)}</li>`).join('')}
      </ul>` : ''}

      <div class="candidate-actions">
        ${pdfUrl ? `
          <a href="${escHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer"
             class="btn btn-maroon btn-sm">
            📄 View Manifesto
          </a>` : ''}
      </div>
    </div>

    ${videoUrl ? `
    <iframe class="candidate-video"
      src="${escHtml(videoUrl)}"
      title="Campaign video for ${escHtml(fullName)}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen loading="lazy"></iframe>` : ''}

    ${socialLinks.length ? `
    <div class="candidate-social" aria-label="Social links">
      ${socialLinks.map(link => `
        <a href="${escHtml(link.includes('http') ? link : '#')}"
           target="_blank" rel="noopener noreferrer">
          ${escHtml(formatSocialLabel(link))}
        </a>`).join('')}
    </div>` : ''}
  </div>`;
}

/* =============================================
   SIDEBAR SCROLL HIGHLIGHT
   ============================================= */
function initSidebarScroll(positionKeys) {
  const links = document.querySelectorAll('#positions-sidebar-nav a');
  if (!links.length) return;

  const sections = positionKeys.map(p => document.getElementById(positionToSlug(p))).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* =============================================
   HELPERS
   ============================================= */
function positionToSlug(pos) {
  return pos.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function abbreviate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function formatSocialLabel(link) {
  if (link.includes('instagram')) return '📷 Instagram';
  if (link.includes('twitter') || link.includes('x.com')) return '🐦 Twitter/X';
  if (link.includes('facebook')) return '👍 Facebook';
  if (link.includes('linkedin')) return '💼 LinkedIn';
  if (link.includes('mailto:')) return '✉️ Email';
  if (link.startsWith('http')) return '🔗 Link';
  return escHtml(link);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', initCandidatesPage);
