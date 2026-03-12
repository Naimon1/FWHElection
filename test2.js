const fs = require('fs');

const csv = `Position,LastName,FirstName,PhotoURL,ManifestoURL,VideoURL,KeyPoint1,KeyPoint2,KeyPoint3,ManifestoText
Secretary,Telesford,Jada,url1,url2,,,,,"Sir Frank Worrell Hall, it's time for leadership that works for YOU!

I'm Jada Telesford, and I'm running for Secretary for the 2026-2027 academic year.

C - Communication
O - Organization

Being Secretary is more than taking minutes-it's about keeping the hall informed, organized, and accountable."
Secretary,Young,Brittany,url3,,,,,,,`;

function parseCSV(csv) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++;
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const parsedRows = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length === 1 && rows[i][0].trim() === '') continue;
    
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = (rows[i][idx] || '').trim();
    });
    parsedRows.push(rowObj);
  }

  return parsedRows;
}

const parsed = parseCSV(csv);
console.log(JSON.stringify(parsed, null, 2));
