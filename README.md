# Sir Frank Worrell Hall — Elections 2025–2026

Official election website for the Sir Frank Worrell Hall Student Council at the University of the West Indies. Hosted on GitHub Pages with Google Sheets as a live CMS for candidate data.

---

## Quick Links (once deployed)

- **Live site:** `https://<your-github-username>.github.io/<repo-name>/`
- **Candidates page:** `…/candidates.html`
- **Council 101:** `…/council-101.html`
- **Constitution:** `…/constitution.html`

---

## Part 1 — GitHub Pages Deployment

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in.
2. Click **New repository**.
3. Name it something like `fwh-elections` (this becomes part of the URL).
4. Set visibility to **Public** (required for free GitHub Pages).
5. Click **Create repository**.

### Step 2: Upload the Files

**Option A — GitHub Desktop (recommended for non-developers)**
1. Download [GitHub Desktop](https://desktop.github.com/).
2. Clone your new repository to your computer.
3. Copy all files from this `FWHElection` folder into the cloned repository folder.
4. In GitHub Desktop, write a commit message (e.g., "Initial site upload") and click **Commit to main**.
5. Click **Push origin**.

**Option B — Git command line**
```bash
git init
git add .
git commit -m "Initial site upload"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repository on GitHub, go to **Settings** → **Pages**.
2. Under **Source**, select **Deploy from a branch**.
3. Choose branch: **main**, folder: **/ (root)**.
4. Click **Save**.
5. Wait 1–2 minutes, then your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

### Step 4: Update the Site (future changes)

Any time you need to update files (e.g., change a date in `index.html`):
1. Edit the file locally.
2. Commit and push via GitHub Desktop or command line.
3. GitHub Pages will automatically redeploy within ~1 minute.

---

## Part 2 — Google Sheets Setup (Candidate Data)

The website pulls candidate information, important dates, FAQ, and Council 101 episode data live from a Google Spreadsheet. No code changes are needed to add/edit candidates — just update the spreadsheet.

### Step 1: Create the Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Name it something like **FWH Elections 2025–2026 Data**.
3. Create **4 tabs** (sheets) at the bottom with these exact names:
   - `Candidates`
   - `Council101`
   - `ImportantDates`
   - `FAQ`

### Step 2: Set Up Each Tab

#### Tab 1 — `Candidates`

Add these column headers in **Row 1** exactly as written:

| Position | LastName | FirstName | PhotoURL | ManifestoURL | VideoURL | KeyPoint1 | KeyPoint2 | KeyPoint3 | SocialLink |
|----------|----------|-----------|----------|--------------|----------|-----------|-----------|-----------|------------|

**Notes:**
- `Position` — Must match one of the 9 positions exactly (see list below).
- `PhotoURL` — Direct image URL, or a Google Drive shareable link to the photo (see tip below).
- `ManifestoURL` — Google Drive shareable link to the candidate's PDF manifesto.
- `VideoURL` — YouTube watch URL (e.g. `https://www.youtube.com/watch?v=XXXXXXXXXXX`) or short URL (`https://youtu.be/XXXXXXXXXXX`).
- `KeyPoint1/2/3` — Short bullet points (1 sentence each) summarising the candidate's platform.
- `SocialLink` — Optional. Separate multiple links with a `|` character. E.g.: `https://instagram.com/name|https://twitter.com/name`

**Valid Position values (copy exactly):**
```
Deputy Hall Chairperson
Treasurer
Secretary
Public Relation Officer
Welfare Officer
Cultural and Entertainment Activities Chairperson (CEAC)
Maintenance Representation
Constitutional Chairperson
Sports and Games Chairperson
```

**Google Drive photo tip:**
1. Upload the candidate's photo to Google Drive.
2. Right-click → **Share** → set to "Anyone with the link can view" → copy link.
3. Paste the link into the `PhotoURL` column. The site converts it automatically.

#### Tab 2 — `Council101`

| Title | Description | VideoEmbedURL | Bullet1 | Bullet2 | Bullet3 |
|-------|-------------|---------------|---------|---------|---------|

- `VideoEmbedURL` — YouTube URL (watch or short URL, same format as candidates).
- `Bullet1/2/3` — Optional key takeaway points per episode.

#### Tab 3 — `ImportantDates`

| Event | Date | Description |
|-------|------|-------------|

Example rows:
```
Nomination Period | March 10 – March 17, 2026 | Submit nominations at the Hall Office.
Campaign Period   | March 18 – March 24, 2026 | Candidates may distribute materials.
Debate Night      | March 25, 2026             | Moderated debate open to all residents.
Election Day      | March 27, 2026             | Residents cast their votes.
```

#### Tab 4 — `FAQ`

| Question | Answer |
|----------|--------|

### Step 3: Publish Each Tab as CSV

Do this for **each of the 4 tabs**:

1. Click **File** → **Share** → **Publish to web**.
2. In the first dropdown, select the **tab name** (e.g., "Candidates").
3. In the second dropdown, select **Comma-separated values (.csv)**.
4. Click **Publish** → confirm.
5. Copy the URL that appears. It will look like:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/pub?gid=SHEET_GID&single=true&output=csv
   ```

### Step 4: Add the URLs to the Website

1. Open `assets/js/sheets.js` in a text editor.
2. Find the `SHEET_URLS` object near the top:
   ```javascript
   const SHEET_URLS = {
     candidates:     'PASTE_CANDIDATES_CSV_URL_HERE',
     council101:     'PASTE_COUNCIL101_CSV_URL_HERE',
     importantDates: 'PASTE_IMPORTANTDATES_CSV_URL_HERE',
     faq:            'PASTE_FAQ_CSV_URL_HERE',
   };
   ```
3. Replace each placeholder with the corresponding published CSV URL from Step 3.
4. Save the file, commit and push to GitHub.

### Step 5: Verify

Open the live site and check that:
- Candidate cards appear on `candidates.html`.
- Dates appear on the home page timeline.
- FAQ answers load in the accordion on the home page.
- Council 101 episodes appear on `council-101.html`.

---

## Part 3 — Google Forms Feedback Box (Optional)

1. Go to [Google Forms](https://forms.google.com) and create a new form.
2. Add fields such as: *Your suggestion / feedback* (paragraph), *Category* (dropdown), and optionally *Your room number* (short answer — reassure respondents it's optional).
3. Click **Send** → the embed icon (`< >`) → copy the **src URL** from the `<iframe>` code shown.
4. Open `index.html` and find the feedback section. Uncomment the `<iframe>` block and replace `YOUR_GOOGLE_FORM_EMBED_URL_HERE` with your copied URL.
5. Delete the placeholder `<div class="feedback-placeholder">` block above it.
6. Commit and push.

---

## Part 4 — Adding/Updating Candidates

Once the spreadsheet is connected, you **never need to touch the code again** to manage candidates:

| Task | What to do |
|------|-----------|
| Add a new candidate | Add a new row to the `Candidates` tab |
| Remove a candidate | Delete their row |
| Update a manifesto | Replace the `ManifestoURL` with the new Drive link |
| Add a campaign video | Paste the YouTube URL into `VideoURL` |
| Change key points | Edit `KeyPoint1`, `KeyPoint2`, `KeyPoint3` |
| Publish a new Council 101 episode | Add a row to the `Council101` tab |
| Update election dates | Edit rows in `ImportantDates` tab |

Changes appear on the live site within seconds of saving the spreadsheet (no re-deployment needed).

---

## File Structure

```
FWHElection/
├── index.html           Home page
├── candidates.html      All candidates by position
├── council-101.html     Council 101 video series
├── constitution.html    PDF viewer + section summaries
├── assets/
│   ├── css/styles.css   All styles (Black/Maroon/Gold theme)
│   ├── js/
│   │   ├── sheets.js    Google Sheets integration + demo data
│   │   ├── candidates.js Candidate card rendering
│   │   └── main.js      Navbar, FAQ accordion, timeline
│   ├── images/
│   │   ├── fwhLogo.jpg
│   │   └── councilPhoto.jpeg
│   └── docs/
│       └── constitution.pdf
└── README.md            This file
```

---

## Troubleshooting

**Candidates not loading / showing demo data**
- Check that the CSV URLs in `sheets.js` are correct and not placeholder text.
- Make sure the spreadsheet is published to web (File → Share → Publish to web).
- Make sure the spreadsheet sharing is set to "Anyone with the link can view".
- Open browser DevTools (F12) → Console tab to see any error messages.

**Photos not showing**
- Make sure Google Drive photos are shared as "Anyone with the link can view".
- Use the full shareable Drive URL, not the direct download link.

**PDF not displaying**
- The PDF viewer requires the browser to support inline PDFs. On mobile, users can tap "Open in New Tab" to view it.
- If hosted on GitHub Pages, ensure the file path is exactly `assets/docs/constitution.pdf`.

**Site not updating after changes**
- GitHub Pages can take 1–2 minutes to rebuild after a push.
- Hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R) to clear cache.

---

*Maintained by the Sir Frank Worrell Hall Electoral Commission.*
