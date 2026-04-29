/**
 * generatePDF.js — Monthly HR Report PDF generator
 * Uses jspdf + jspdf-autotable
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmtUZS = (n) => Number(n).toLocaleString('uz-UZ') + ' UZS';
const fmtMonth = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun',
                  'Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
  return `${months[Number(m) - 1]} ${y}`;
};

/**
 * @param {Object} params
 * @param {Array}  params.employees     - AppContext employees
 * @param {Array}  params.attendance    - AppContext attendance
 * @param {Array}  params.tasks         - AppContext tasks
 * @param {Array}  params.salaries      - AppContext salaries
 * @param {Array}  params.penalties     - PenaltyContext penalties
 * @param {Object} params.config        - PenaltyContext config { pointValue }
 * @param {string} params.month         - 'YYYY-MM'
 * @param {string} params.hrName        - HR Manager name
 * @param {string} params.companyName   - Company name
 */
export function generateMonthlyReport({
  employees, attendance, tasks, salaries, penalties,
  config, month, hrName = 'HR Manager', companyName = 'StaffFlow Inc.',
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const monthLabel = fmtMonth(month);

  employees.forEach((emp, idx) => {
    if (idx > 0) doc.addPage();

    let y = 15;

    // ── Header ────────────────────────────────────────────────────────────────
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Oylik Xodim Hisoboti', 14, 20);
    doc.text(monthLabel, pageW - 14, 20, { align: 'right' });

    y = 36;

    // ── Employee info ─────────────────────────────────────────────────────────
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(emp.name, 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Lavozim: ${emp.role || '—'}   |   Bo'lim: ${emp.department || '—'}   |   Email: ${emp.email || '—'}`, 14, y);
    y += 10;

    // ── Attendance summary ────────────────────────────────────────────────────
    const empAtt = attendance.filter(a => a.employeeId === emp.id);
    const presentDays = empAtt.filter(a => a.status === 'Present').length;
    const absentDays  = empAtt.filter(a => a.status === 'Absent').length;
    const lateDays    = empAtt.filter(a => a.late).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('DAVOMAT', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Kelgan kunlar', 'Kelmagan kunlar', 'Kech kelgan kunlar']],
      body: [[presentDays, absentDays, lateDays]],
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' } },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── Tasks summary ─────────────────────────────────────────────────────────
    const empTasks = tasks.filter(t => t.assigneeId === emp.id);
    const doneTasks    = empTasks.filter(t => t.status === 'Done').length;
    const pendingTasks = empTasks.filter(t => t.status === 'Pending').length;
    const overdueTasks = empTasks.filter(t =>
      t.status !== 'Done' && t.due && new Date(t.due) < new Date()
    ).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('VAZIFALAR', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Jami', 'Bajarildi', 'Kutilmoqda', 'Muddati o\'tgan']],
      body: [[empTasks.length, doneTasks, pendingTasks, overdueTasks]],
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── Penalties ─────────────────────────────────────────────────────────────
    const empPenalties = penalties.filter(p => p.employeeId === emp.id && p.month === month);
    const totalPoints  = empPenalties.reduce((s, p) => s + p.points, 0);
    const deduction    = Math.abs(totalPoints) * (config?.pointValue ?? 50000);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('JARIMA TARIXI', 14, y);
    y += 2;

    if (empPenalties.length === 0) {
      autoTable(doc, {
        startY: y,
        body: [['Bu oyda jarima yo\'q']],
        theme: 'grid',
        bodyStyles: { fontSize: 9, textColor: [100, 116, 139], halign: 'center' },
        margin: { left: 14, right: 14 },
      });
    } else {
      autoTable(doc, {
        startY: y,
        head: [['Sana', 'Tur', 'Sabab', 'Ball', 'Jarima (UZS)']],
        body: empPenalties.map(p => [
          p.date,
          p.reason,
          p.type,
          p.points,
          fmtUZS(Math.abs(p.points) * (config?.pointValue ?? 50000)),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [254, 242, 242], textColor: [185, 28, 28], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        columnStyles: { 3: { halign: 'center', textColor: [220, 38, 38] }, 4: { halign: 'right' } },
        margin: { left: 14, right: 14 },
      });
    }
    y = doc.lastAutoTable.finalY + 8;

    // ── Salary summary ────────────────────────────────────────────────────────
    const sal = salaries.find(s => s.employeeId === emp.id);
    const base    = sal?.base    ?? emp.salary ?? 0;
    const bonus   = sal?.bonus   ?? 0;
    const netPay  = Math.max(0, base + bonus - deduction);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('MAOSH HISOBI', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Asosiy maosh', 'Bonus', 'Jarima summasi', 'SOF MAOSH']],
      body: [[
        fmtUZS(base),
        fmtUZS(bonus),
        deduction > 0 ? `-${fmtUZS(deduction)}` : '—',
        fmtUZS(netPay),
      ]],
      theme: 'grid',
      headStyles: { fillColor: [240, 253, 244], textColor: [22, 101, 52], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 9, fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'right' },
        1: { halign: 'right', textColor: [22, 163, 74] },
        2: { halign: 'right', textColor: [220, 38, 38] },
        3: { halign: 'right', textColor: [22, 101, 52], fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 14;

    // ── Signature ─────────────────────────────────────────────────────────────
    const sigY = Math.max(y, pageH - 35);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, sigY, 80, sigY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`HR Manager: ${hrName}`, 14, sigY + 5);
    doc.text(`Sana: ${new Date().toLocaleDateString('uz-UZ')}`, 14, sigY + 10);

    // Page number
    doc.setFontSize(7);
    doc.text(`${idx + 1} / ${employees.length}`, pageW - 14, pageH - 8, { align: 'right' });
  });

  doc.save(`StaffFlow_Hisobot_${month}.pdf`);
}
