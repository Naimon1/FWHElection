/**
 * sheets.js — Google Sheets CSV Integration
 *
 * HOW TO SET UP:
 * 1. Create a Google Spreadsheet with the tabs listed below.
 * 2. For each tab, go to File → Share → Publish to web.
 *    Select the tab name, choose "Comma-separated values (.csv)", click Publish.
 * 3. Copy the published URL and paste it into the SHEET_URLS object below.
 * 4. Make sure the spreadsheet sharing is set to "Anyone with the link can view".
 */

const SHEET_URLS = {
  // Replace each value below with the published CSV URL for that tab.
  // Example URL format:
  // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/pub?gid=SHEET_GID&single=true&output=csv

  candidates:     'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXTJCyPwCElhmx2UwIJ95XcOAhyZUOqJmRQJJAcVvWPcPEWD20q1l7yUufuUs3OIGusJyXszEZgn_k/pub?gid=0&single=true&output=csv',
  council101:     'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXTJCyPwCElhmx2UwIJ95XcOAhyZUOqJmRQJJAcVvWPcPEWD20q1l7yUufuUs3OIGusJyXszEZgn_k/pub?gid=1547803465&single=true&output=csv',
  importantDates: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXTJCyPwCElhmx2UwIJ95XcOAhyZUOqJmRQJJAcVvWPcPEWD20q1l7yUufuUs3OIGusJyXszEZgn_k/pub?gid=1294964201&single=true&output=csv',
  faq:            'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXTJCyPwCElhmx2UwIJ95XcOAhyZUOqJmRQJJAcVvWPcPEWD20q1l7yUufuUs3OIGusJyXszEZgn_k/pub?gid=1090520654&single=true&output=csv',
};

/**
 * Fetches a published Google Sheets CSV and returns an array of row objects.
 * Each row is a plain object keyed by the header row values (first row).
 */
async function fetchSheet(sheetKey) {
  const url = SHEET_URLS[sheetKey];
  if (!url || url.startsWith('PASTE_')) {
    console.warn(`[Sheets] URL for "${sheetKey}" not configured. Using demo data.`);
    return null;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csv = await res.text();
    return parseCSV(csv);
  } catch (err) {
    console.error(`[Sheets] Failed to fetch "${sheetKey}":`, err);
    return null;
  }
}

/**
 * Parses a CSV string into an array of objects.
 * Handles quoted fields (including those containing commas or newlines).
 */
function parseCSV(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

/** Splits a single CSV line respecting quoted fields. */
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Groups an array of row objects by a field value.
 * Returns a Map preserving insertion order.
 */
function groupBy(rows, field) {
  const map = new Map();
  rows.forEach(row => {
    const key = row[field] || 'Unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  });
  return map;
}

/** Sorts an array of candidate rows alphabetically by LastName, then FirstName. */
function sortCandidates(candidates) {
  return [...candidates].sort((a, b) => {
    const la = (a.LastName || '').toLowerCase();
    const lb = (b.LastName || '').toLowerCase();
    if (la !== lb) return la < lb ? -1 : 1;
    return (a.FirstName || '').toLowerCase() < (b.FirstName || '').toLowerCase() ? -1 : 1;
  });
}

/**
 * Converts a YouTube watch URL or short URL to its embed URL.
 * Passes through URLs that are already embed URLs.
 * Returns empty string for invalid input.
 */
function toYouTubeEmbed(url) {
  if (!url) return '';
  url = url.trim();
  if (url.includes('youtube.com/embed/')) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  if (url.startsWith('http')) return url;
  return '';
}

/** Builds a Google Drive direct image URL from a shareable Drive link, or passes through normal URLs. */
function toDriveImage(url) {
  if (!url) return '';
  url = url.trim();
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w400`;
  if (url.startsWith('http')) return url;
  return '';
}

/** Builds a Google Drive direct PDF URL from a shareable Drive link. */
function toDrivePDF(url) {
  if (!url) return '';
  url = url.trim();
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  if (url.startsWith('http')) return url;
  return '';
}

/* =============================================
   DEMO / SAMPLE DATA
   (Used when sheet URLs are not yet configured)
   ============================================= */
const DEMO_CANDIDATES = [
  { Position:'Deputy Hall Chairperson', LastName:'Adams', FirstName:'Jordan', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Advocate for student welfare', KeyPoint2:'Improve hall communication', KeyPoint3:'Host monthly town halls', SocialLink:'' },
  { Position:'Deputy Hall Chairperson', LastName:'Williams', FirstName:'Taylor', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Bridge gap between council & residents', KeyPoint2:'Transparent decision making', KeyPoint3:'Monthly newsletter', SocialLink:'' },
  { Position:'Treasurer', LastName:'Brown', FirstName:'Alex', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Responsible budget management', KeyPoint2:'Monthly financial reports', KeyPoint3:'Student activity fund expansion', SocialLink:'' },
  { Position:'Secretary', LastName:'Clarke', FirstName:'Morgan', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Accurate minute taking', KeyPoint2:'Timely communication', KeyPoint3:'Digital records system', SocialLink:'' },
  { Position:'Public Relation Officer', LastName:'Davis', FirstName:'Riley', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Vibrant social media presence', KeyPoint2:'Community engagement events', KeyPoint3:'Hall brand identity refresh', SocialLink:'' },
  { Position:'Welfare Officer', LastName:'Edwards', FirstName:'Sam', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Mental health support resources', KeyPoint2:'Peer support network', KeyPoint3:'Wellness workshops', SocialLink:'' },
  { Position:'Cultural and Entertainment Activities Chairperson (CEAC)', LastName:'Francis', FirstName:'Jamie', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Diverse cultural programming', KeyPoint2:'Annual cultural showcase', KeyPoint3:'Budget for student events', SocialLink:'' },
  { Position:'Maintenance Representation', LastName:'Garcia', FirstName:'Drew', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Faster maintenance response times', KeyPoint2:'Monthly maintenance audits', KeyPoint3:'Student feedback system', SocialLink:'' },
  { Position:'Constitutional Chairperson', LastName:'Hughes', FirstName:'Avery', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Uphold hall constitution', KeyPoint2:'Election integrity oversight', KeyPoint3:'Constitutional literacy workshops', SocialLink:'' },
  { Position:'Sports and Games Chairperson', LastName:'Isaac', FirstName:'Blaine', PhotoURL:'', ManifestoURL:'', VideoURL:'', KeyPoint1:'Expand inter-hall sport fixtures', KeyPoint2:'Fitness facilities improvement', KeyPoint3:'Intramural tournament series', SocialLink:'' },
];

const DEMO_COUNCIL101 = [
  { Title:'Role of the Deputy Hall Chairperson', Description:'Understand the duties and responsibilities of the Deputy Hall Chairperson, and how they support the Hall Chairperson in leading the student council.', VideoEmbedURL:'', Bullet1:'Acts as Hall Chair in their absence', Bullet2:'Coordinates council sub-committees', Bullet3:'Liaises with Hall administration' },
  { Title:'Role of the Treasurer', Description:'Learn how the Treasurer manages the hall\'s finances, including budgeting, expenditure tracking and financial reporting to the council.', VideoEmbedURL:'', Bullet1:'Oversees all financial transactions', Bullet2:'Prepares budget proposals', Bullet3:'Presents financial reports at meetings' },
  { Title:'Role of the Welfare Officer', Description:'Discover how the Welfare Officer supports residents\' physical, emotional and academic well-being throughout the academic year.', VideoEmbedURL:'', Bullet1:'Connects students to support services', Bullet2:'Organises wellness events', Bullet3:'Serves as first point of contact for welfare issues' },
];

const DEMO_DATES = [
  { Event:'Nomination Period', Date:'March 10 – March 17, 2026', Description:'Submit nominations for all council positions at the Hall Office.' },
  { Event:'Campaign Period', Date:'March 18 – March 24, 2026', Description:'Candidates may distribute materials and campaign within hall guidelines.' },
  { Event:'Debate Night', Date:'March 25, 2026', Description:'All candidates present their platforms in a moderated debate open to all residents.' },
  { Event:'Election Day', Date:'March 27, 2026', Description:'Residents cast their votes. Results announced the same evening.' },
];

const DEMO_FAQ = [
  { Question:'Who can vote?', Answer:'All registered residents of Sir Frank Worrell Hall who are current UWI students in good standing are eligible to vote.' },
  { Question:'How do I vote?', Answer:'Voting takes place electronically via the link distributed by the Electoral Committee on Election Day. You will need your student ID to authenticate.' },
  { Question:'What are the eligibility requirements for candidates?', Answer:'Candidates must be registered residents of the Hall, must be in good academic standing, and must submit a completed nomination form during the nomination period.' },
  { Question:'What happens in the event of a tie?', Answer:'In the event of a tie, the Electoral Committee will conduct a run-off vote between the tied candidates within three business days.' },
  { Question:'Can I campaign for a candidate?', Answer:'Yes. Residents may support candidates, but all campaigning must comply with the guidelines set by the Electoral Committee and the Hall Constitution.' },
];

export {
  fetchSheet, groupBy, sortCandidates,
  toYouTubeEmbed, toDriveImage, toDrivePDF,
  DEMO_CANDIDATES, DEMO_COUNCIL101, DEMO_DATES, DEMO_FAQ,
  SHEET_URLS,
};
