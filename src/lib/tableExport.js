// Generic CSV / Excel / PDF table generation, parameterized by a `columns`
// array of `{ key, label, width }`. Extracted from the enquiry export
// feature so admin export features (enquiries, coupons, …) share one
// implementation instead of re-deriving the same CSV-escaping/XLSX/PDF-table
// drawing logic per feature.
// Copied verbatim from hardvanta/src/lib/tableExport.js.

function csvEscape(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows, columns) {
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => csvEscape(row[c.key])).join(","));
  // UTF-8 BOM so Excel opens special characters (₹, accented names, etc.) correctly.
  return "﻿" + [header, ...lines].join("\r\n");
}

export async function toXlsxBuffer(rows, columns, sheetName = "Export") {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: c.width }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  return workbook.xlsx.writeBuffer();
}

export async function toPdfBuffer(rows, columns, title = "Export") {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_WIDTH = 841.89; // A4 landscape
  const PAGE_HEIGHT = 595.28;
  const MARGIN = 30;
  const ROW_HEIGHT = 16;
  const FONT_SIZE = 8;
  const TITLE_SIZE = 14;

  // Scale column widths (defined in "chars") down to fit the printable width.
  const totalWidthUnits = columns.reduce((sum, c) => sum + c.width, 0);
  const printableWidth = PAGE_WIDTH - MARGIN * 2;
  const columnWidths = columns.map((c) => (c.width / totalWidthUnits) * printableWidth);

  function truncate(text, maxChars) {
    const s = text == null ? "" : String(text);
    return s.length > maxChars ? s.slice(0, maxChars - 1) + "…" : s;
  }

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function drawHeader() {
    page.drawText(title, { x: MARGIN, y, size: TITLE_SIZE, font: boldFont, color: rgb(0.04, 0.12, 0.27) });
    y -= TITLE_SIZE + 4;
    page.drawText(`Generated ${new Date().toLocaleString("en-IN")}`, {
      x: MARGIN,
      y,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 20;
    drawRow(columns.map((c) => c.label), boldFont);
  }

  function drawRow(cells, useFont) {
    let x = MARGIN;
    cells.forEach((cell, i) => {
      const maxChars = Math.floor(columnWidths[i] / (FONT_SIZE * 0.55));
      page.drawText(truncate(cell, maxChars), {
        x,
        y,
        size: FONT_SIZE,
        font: useFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      x += columnWidths[i];
    });
    y -= ROW_HEIGHT;
  }

  drawHeader();

  for (const row of rows) {
    if (y < MARGIN + ROW_HEIGHT) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      drawHeader();
    }
    drawRow(
      columns.map((c) => row[c.key]),
      font
    );
  }

  if (rows.length === 0) {
    page.drawText("No data found.", { x: MARGIN, y, size: FONT_SIZE + 2, font, color: rgb(0.4, 0.4, 0.4) });
  }

  return doc.save();
}
