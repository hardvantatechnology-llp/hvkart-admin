// Copied verbatim from hardvanta/src/lib/invoice.js.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatDate } from "@/utils/formatDateTime";

export async function generateInvoicePDF(order) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const draw = (text, x, size, f = font, color = rgb(0, 0, 0)) =>
    page.drawText(String(text), { x, y, size, font: f, color });

  draw("HARDVANTA", 50, 22, bold);
  y -= 15;
  draw("Tax Invoice", 50, 10, font, rgb(0.4, 0.4, 0.4));

  y -= 35;
  draw(`Invoice No: ${order.invoiceNumber || "N/A"}`, 50, 10);
  draw(`Date: ${formatDate(order.createdAt)}`, 350, 10);
  y -= 15;
  draw(`Payment ID: ${order.paymentId || "N/A"}`, 50, 10);
  y -= 15;
  draw(`Order ID: ${order.id}`, 50, 10);

  y -= 35;
  const addr = order.address || {};
  draw("Ship To:", 50, 11, bold);
  y -= 15;
  draw(`${addr.fullName || ""}`, 50, 10);
  y -= 13;
  draw(`${addr.line1 || ""} ${addr.line2 || ""}`.trim(), 50, 10);
  y -= 13;
  draw(`${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`.trim(), 50, 10);
  y -= 13;
  draw(`Phone: ${addr.phone || ""}`, 50, 10);

  y -= 30;
  draw("Item", 50, 10, bold);
  draw("Qty", 320, 10, bold);
  draw("Price", 390, 10, bold);
  draw("Total", 480, 10, bold);
  y -= 8;
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1 });
  y -= 18;

  (order.items || []).forEach((item) => {
    draw(item.name?.substring(0, 40) || "Item", 50, 9);
    draw(item.quantity, 320, 9);
    draw(`Rs.${item.price}`, 390, 9);
    draw(`Rs.${item.price * item.quantity}`, 480, 9);
    y -= 16;
  });

  y -= 10;
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1 });
  y -= 22;
  draw(`Grand Total: Rs.${order.total}`, 390, 13, bold);

  y -= 40;
  draw("Thank you for shopping with Hardvanta!", 50, 9, font, rgb(0.4, 0.4, 0.4));

  return pdfDoc.save();
}
