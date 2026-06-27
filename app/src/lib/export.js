// Real client-side file export. No backend: we build the file in memory and
// trigger a browser download. `columns` is `[{ key, label }]`; `rows` is the
// array of records. Keeping serialisation here (not in pages) means every
// screen exports identically and a new format is a one-place change.

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the navigation has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const cellText = (row, col) => {
  const raw = typeof col.value === 'function' ? col.value(row) : row[col.key];
  return raw == null ? '' : String(raw);
};

const escapeCsv = (s) => (/[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export function buildCsv(columns, rows) {
  const head = columns.map((c) => escapeCsv(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => escapeCsv(cellText(r, c))).join(',')).join('\n');
  // BOM so Excel opens UTF-8 (Cyrillic / Uzbek) correctly.
  return '﻿' + head + '\n' + body;
}

// Excel reads an HTML table saved with an .xls extension — a dependency-free way
// to hand users a real spreadsheet rather than a CSV.
export function buildXls(columns, rows, title = 'StarForge') {
  const head = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('');
  const body = rows
    .map((r) => '<tr>' + columns.map((c) => `<td>${escapeHtml(cellText(r, c))}</td>`).join('') + '</tr>')
    .join('');
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

const slug = (s) => (s || 'export').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Single entry point used by the action layer. `format` is 'CSV' | 'XLSX' |
// 'JSON'. Returns the filename it wrote so callers can surface it in a toast.
export function exportRows({ format = 'CSV', name = 'export', columns = [], rows = [] }) {
  const base = `starforge-${slug(name)}`;
  if (format === 'JSON') {
    const data = rows.map((r) => Object.fromEntries(columns.map((c) => [c.key || c.label, cellText(r, c)])));
    triggerDownload(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `${base}.json`);
    return `${base}.json`;
  }
  if (format === 'XLSX') {
    triggerDownload(new Blob([buildXls(columns, rows, name)], { type: 'application/vnd.ms-excel' }), `${base}.xls`);
    return `${base}.xls`;
  }
  triggerDownload(new Blob([buildCsv(columns, rows)], { type: 'text/csv;charset=utf-8' }), `${base}.csv`);
  return `${base}.csv`;
}

// Standalone, self-contained HTML report — opens/prints in any browser. Each
// section is `{ heading, rows: [[label, value]] }`; an optional table renders a
// full dataset below the summary.
export function downloadReport({ title = 'Report', subtitle = '', sections = [], table }) {
  const sectionHtml = sections
    .map(
      (s) =>
        `<section><h2>${escapeHtml(s.heading || '')}</h2><dl>` +
        (s.rows || []).map(([k, v]) => `<div><dt>${escapeHtml(String(k))}</dt><dd>${escapeHtml(String(v))}</dd></div>`).join('') +
        '</dl></section>',
    )
    .join('');
  const tableHtml = table
    ? `<h2>${escapeHtml(table.heading || '')}</h2><table><thead><tr>${table.columns
        .map((c) => `<th>${escapeHtml(c.label)}</th>`)
        .join('')}</tr></thead><tbody>${table.rows
        .map((r) => '<tr>' + table.columns.map((c) => `<td>${escapeHtml(cellText(r, c))}</td>`).join('') + '</tr>')
        .join('')}</tbody></table>`
    : '';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    body{font-family:system-ui,Segoe UI,Roboto,sans-serif;color:#1c1a17;max-width:900px;margin:40px auto;padding:0 24px;}
    h1{font-size:24px;margin:0 0 4px;} .sub{color:#7a756c;margin:0 0 28px;}
    section{margin:0 0 22px;} h2{font-size:15px;text-transform:uppercase;letter-spacing:.05em;color:#7a756c;border-bottom:1px solid #e7e0d4;padding-bottom:6px;}
    dl{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin:12px 0;} dl div{display:flex;justify-content:space-between;border-bottom:1px dotted #e7e0d4;padding:4px 0;}
    dt{color:#7a756c;} dd{margin:0;font-weight:700;}
    table{width:100%;border-collapse:collapse;font-size:13px;} th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e7e0d4;} th{color:#7a756c;text-transform:uppercase;font-size:11px;}
    footer{margin-top:32px;color:#a8a195;font-size:11px;}
  </style></head><body><h1>${escapeHtml(title)}</h1><p class="sub">${escapeHtml(subtitle)}</p>${sectionHtml}${tableHtml}<footer>StarForge EDU · ${escapeHtml(subtitle || title)}</footer></body></html>`;
  triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), `starforge-${slug(title)}.html`);
  return `starforge-${slug(title)}.html`;
}
