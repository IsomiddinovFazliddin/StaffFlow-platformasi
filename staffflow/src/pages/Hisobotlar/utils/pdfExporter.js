/**
 * PDF Exporter for StaffFlow Reports
 * Uses jspdf + jspdf-autotable
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const fmtDate = (d = new Date()) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmtMonth = () => { const d = new Date(); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

export async function generateReportPDF({ reportId, report, rows, cols, summary }) {
  const doc = new jsPDF({ orientation: cols.length > 5 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── PAGE 1: Cover ──────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, W, H, 'F');

  // Gradient overlay
  doc.setFillColor(99, 102, 241, 0.3);
  doc.rect(0, 0, W, 40, 'F');

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('StaffFlow', W / 2, 30, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('HR Boshqaruv Tizimi', W / 2, 40, { align: 'center' });

  // Divider
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(W * 0.2, 55, W * 0.8, 55);

  // Report title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(report?.title || 'Hisobot', W / 2, 75, { align: 'center' });

  // Period
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Davr: ${fmtMonth()}`, W / 2, 90, { align: 'center' });
  doc.text(`Yaratilgan: ${fmtDate()}`, W / 2, 100, { align: 'center' });

  // Summary boxes
  const boxW = (W - 40) / Math.min(summary.length, 4);
  summary.slice(0, 4).forEach((s, i) => {
    const x = 20 + i * boxW;
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x, 120, boxW - 4, 30, 3, 3, 'F');
    doc.setTextColor(99, 102, 241);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(String(s.value), x + (boxW - 4) / 2, 133, { align: 'center' });
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(s.label, x + (boxW - 4) / 2, 143, { align: 'center' });
  });

  // Footer cover
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.text('Maxfiy hujjat — faqat ichki foydalanish uchun', W / 2, H - 10, { align: 'center' });

  // ── PAGE 2+: Data table ────────────────────────────────────────────────────
  doc.addPage();

  // Page header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, W, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`StaffFlow — ${report?.title}`, 10, 8);
  doc.text(fmtDate(), W - 10, 8, { align: 'right' });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(report?.title || 'Hisobot', 10, 24);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Jami yozuvlar: ${rows.length} | Yaratilgan: ${fmtDate()}`, 10, 31);

  // Table
  autoTable(doc, {
    startY: 36,
    head: [cols],
    body: rows.map(r => cols.map(c => r[c] ?? '—')),
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: cols.reduce((acc, _, i) => {
      acc[i] = { cellWidth: 'auto' };
      return acc;
    }, {}),
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `StaffFlow | ${fmtDate()} | Sahifa ${data.pageNumber} / ${pageCount}`,
        W / 2, H - 5, { align: 'center' }
      );
    },
  });

  // ── Last page: Signature ───────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, W, H, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Hisobot tasdiqlandi', W / 2, 40, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  const sigX = 20;
  const sigY = 80;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Direktor imzosi:', sigX, sigY);
  doc.line(sigX, sigY + 15, sigX + 70, sigY + 15);
  doc.text('Sana: ___________', sigX, sigY + 25);

  // Seal circle
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.setLineDash([2, 2]);
  doc.circle(W - 50, sigY + 10, 20);
  doc.setLineDash([]);
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text('MUHR', W - 50, sigY + 12, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('StaffFlow HR Tizimi', W / 2, H - 10, { align: 'center' });

  // Save
  const ts = Math.floor(Date.now() / 1000);
  const month = new Date().toISOString().slice(0, 7);
  doc.save(`StaffFlow_${reportId}_${month}_${ts}.pdf`);
}
