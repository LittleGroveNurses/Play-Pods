/* Play Pods — Take-Home PDF export
 * Builds a real, downloadable, fillable PDF (name/week text fields + tickable
 * focus-area checkboxes) from the take-home page's own content, using pdf-lib
 * (vendored locally at assets/vendor/pdf-lib.min.js — no external CDN call).
 * Requires window.TAKEHOME_DATA to be set on the page before this runs.
 */

async function generateTakeHomePDF(data) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const pdfDoc = await PDFDocument.create();
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_W = 595.28, PAGE_H = 841.89; // A4 in points
  const MARGIN = 42;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  function addPage() {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  }

  function ensureSpace(need) {
    if (y - need < MARGIN) addPage();
  }

  function wrapText(text, fontObj, size, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (fontObj.widthOfTextAtSize(test, size) > maxWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // ── Header band ──────────────────────────────────────────
  const headerH = 62;
  page.drawRectangle({ x: 0, y: y - headerH, width: PAGE_W, height: headerH, color: rgb(0.106, 0.161, 0.294) });
  page.drawText(data.title, { x: MARGIN, y: y - 26, size: 19, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText(data.subtitle, { x: MARGIN, y: y - 44, size: 9.5, font, color: rgb(0.8, 0.85, 0.95) });
  y -= headerH + 18;

  // ── Name / Week fields (fillable) ────────────────────────
  page.drawText("Child's name:", { x: MARGIN, y, size: 11, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
  const nameField = form.createTextField('child_name');
  nameField.setText('');
  nameField.addToPage(page, { x: MARGIN + 82, y: y - 5, width: 190, height: 16, borderWidth: 0.75 });

  page.drawText('Week of:', { x: MARGIN + 300, y, size: 11, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
  const weekField = form.createTextField('week_of');
  weekField.setText('');
  weekField.addToPage(page, { x: MARGIN + 356, y: y - 5, width: 150, height: 16, borderWidth: 0.75 });
  y -= 34;

  // ── Focus checkboxes (fillable) ──────────────────────────
  page.drawText('This week, focus on:', { x: MARGIN, y, size: 12, font: fontBold, color: rgb(0.106, 0.161, 0.294) });
  y -= 13;
  page.drawText('Facilitator: tick 1\u20132 areas for this family to prioritise at home this week.',
    { x: MARGIN, y, size: 8.5, font: fontItalic, color: rgb(0.45, 0.45, 0.45) });
  y -= 20;

  const DOMAINS = [
    { key: 'motor', label: 'Motor', color: rgb(0.086, 0.541, 0.541) },
    { key: 'comm', label: 'Communication', color: rgb(0.106, 0.161, 0.294) },
    { key: 'cog', label: 'Cognitive', color: rgb(0.102, 0.373, 0.659) },
    { key: 'se', label: 'Social-Emotional', color: rgb(0.545, 0.298, 0.451) },
    { key: 'sh', label: 'Self-Help', color: rgb(0.235, 0.549, 0.294) },
  ];
  let cx = MARGIN;
  const boxSize = 12;
  for (const d of DOMAINS) {
    ensureSpace(24);
    const cb = form.createCheckBox('focus_' + d.key);
    cb.addToPage(page, {
      x: cx, y: y - boxSize + 2, width: boxSize, height: boxSize,
      borderColor: d.color, borderWidth: 1.25, backgroundColor: rgb(1, 1, 1),
    });
    const labelX = cx + boxSize + 5;
    page.drawText(d.label, { x: labelX, y: y - boxSize + 4, size: 10, font: fontBold, color: d.color });
    cx = labelX + fontBold.widthOfTextAtSize(d.label, 10) + 20;
  }
  y -= boxSize + 20;

  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.75, color: rgb(0.88, 0.88, 0.88) });
  y -= 22;

  // ── Activity cards ────────────────────────────────────────
  const CARD_META = {
    motor: { label: 'Movement', color: rgb(0.086, 0.541, 0.541) },
    comm: { label: 'Language', color: rgb(0.106, 0.161, 0.294) },
    cog: { label: 'Thinking & Play', color: rgb(0.102, 0.373, 0.659) },
    se: { label: 'Feelings & Friends', color: rgb(0.545, 0.298, 0.451) },
    sh: { label: 'Independence', color: rgb(0.235, 0.549, 0.294) },
    book: { label: "This Week's Book", color: rgb(0.741, 0.541, 0.020) },
  };

  const TEXT_X = MARGIN + 14;
  const TEXT_W = CONTENT_W - 14;

  for (const key of ['motor', 'comm', 'cog', 'se', 'sh', 'book']) {
    const card = data.cards && data.cards[key];
    if (!card) continue;
    const meta = CARD_META[key];

    const titleLines = wrapText(card.title, fontBold, 12, TEXT_W);
    const bodyLines = wrapText(card.body, font, 9.5, TEXT_W);
    const blockHeight = 16 + titleLines.length * 14 + 5 + bodyLines.length * 12.5 + 14;

    ensureSpace(blockHeight);

    const top = y;
    page.drawRectangle({ x: MARGIN, y: top - blockHeight, width: 3.5, height: blockHeight, color: meta.color });

    let yy = top - 12;
    page.drawText(meta.label.toUpperCase(), { x: TEXT_X, y: yy, size: 7.5, font: fontBold, color: meta.color });
    yy -= 14;
    for (const line of titleLines) {
      page.drawText(line, { x: TEXT_X, y: yy, size: 12, font: fontBold, color: rgb(0.12, 0.12, 0.12) });
      yy -= 14;
    }
    yy -= 5;
    for (const line of bodyLines) {
      page.drawText(line, { x: TEXT_X, y: yy, size: 9.5, font, color: rgb(0.3, 0.3, 0.3) });
      yy -= 12.5;
    }

    y = top - blockHeight - 12;
  }

  // ── Footer ────────────────────────────────────────────────
  ensureSpace(18);
  page.drawText(data.footer || 'Little Grove \u2014 Play Pods.', { x: MARGIN, y: MARGIN - 10, size: 8, font: fontItalic, color: rgb(0.55, 0.55, 0.55) });

  form.updateFieldAppearances(font);
  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = data.filename || 'take-home.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function wireTakeHomePdfButton() {
  const btn = document.getElementById('pdf-btn');
  if (!btn || !window.TAKEHOME_DATA) return;
  btn.addEventListener('click', async () => {
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Preparing PDF\u2026';
    try {
      await generateTakeHomePDF(window.TAKEHOME_DATA);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Sorry, the PDF could not be generated. Please try again or use the Print button instead.');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

document.addEventListener('DOMContentLoaded', wireTakeHomePdfButton);
