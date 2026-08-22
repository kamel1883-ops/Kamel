import ExcelJS from "exceljs";

// مولّد ملف مسير الرواتب لبوابة «مدد» — مطابق للنموذج الرسمي (xlsx)
// الأعمدة المحمية (A–F): اسم، هوية، أساسي، سكن، نقل، إجمالي — لا يقبل التحرير بعد تفعيل حماية الورقة.

const BORDER = {
  top: { style: "thin", color: { argb: "FFB7B7C9" } },
  bottom: { style: "thin", color: { argb: "FFB7B7C9" } },
  left: { style: "thin", color: { argb: "FFB7B7C9" } },
  right: { style: "thin", color: { argb: "FFB7B7C9" } },
};
const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFF7" } };
const BANNER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE4E4F4" } };

const HEADERS = [
  "اسم الموظف",
  "رقم هوية الموظف",
  "الراتب الأساسي",
  "بدل السكن",
  "بدل نقل",
  "إجمالي الراتب",
  "خارج دوام (الكمية)",
  "مستحقات أخرى (الكمية)",
  "خصم التأمينات الاجتماعية (نسبة)",
  "غياب (الكمية)",
  "إستقطاعات أخرى (الكمية)",
];

const INSTRUCTIONS = [
  "تعليمات عامة",
  "1. عدم إجراء التعديلات على هذه الحقول: \n\n• اسم الموظف \n• رقم هوية الموظف \n• الراتب الأساسي \n• بدل السكن \n• بدل النقل \n• إجمالي الراتب",
  "2. إضافة/حذف الموظفين: \n\n• إضافة موظفين: \n• لا يمكن إضافة الموظفين مباشرة في هذا الملف \n• قم بإضافة الموظفين من خلال منصة مدد و التأمينات الاجتماعية, ثم قم بتحميل ملف الرواتب المحدث من صفحة الرواتب الشهرية \n• حذف موظفين: \n• إذا قمت بحذف صف الموظف، فسيعتبر النظام الموظف غير محدد في مسير الرواتب",
  "التحقق من المدخلات",
  "3. لا تدخل القيم التالية في حقول الاتسحقاقات والاستقطاعات: \n\n• قيم أو أعداد بالسالب \n• الرموز (مثل: @، #، %) \n• لأحرف (مثل: أ، ب، ج)",
];
const INSTRUCTION_HEIGHTS = [22, 130, 170, 22, 120];

// تحويل قيمة الهوية إلى رقم صحيح إن صالحة، وإلا تركها نصية
function idValue(raw) {
  const s = String(raw ?? "").trim();
  return /^[0-9]+$/.test(s) ? Number(s) : s;
}

/**
 * يُنشئ ويُنزّل ملف مسير رواتب بصيغة xlsx مقبول على بوابة مدد «الرواتب الشهرية ← رفع ملف الرواتب».
 * @param {object} args
 * @param {Array} args.payrolls  سجلات Payroll لهذا الشهر
 * @param {Array} args.employees سجلات الموظفين (لجلب الأساسي/السكن/النقل من ملف الموظف)
 * @param {object} args.org      إعدادات المنشأة (نسب GOSI)
 * @param {number} args.month
 * @param {number} args.year
 * @returns {Promise<number>} عدد الصفوف المُصدّرة
 */
export async function downloadMudadExcel({ payrolls = [], employees = [], org = null, month, year }) {
  const included = payrolls.filter((p) => p.include_in_payroll !== false);
  const rows = included.filter((p) => p.status === "approved" || p.status === "paid");
  if (rows.length === 0) return 0;

  const empMap = {};
  for (const e of employees) empMap[e.id] = e;
  const saudiEmpRate = Number(org?.gosi_saudi_employee_rate) || 9.75;

  const wb = new ExcelJS.Workbook();
  wb.creator = "جدارة — Jadara HR";
  wb.created = new Date();

  const ws = wb.addWorksheet("ملف مسير الرواتب", {
    views: [{ rightToLeft: true }],
    columns: [
      { width: 28 }, { width: 22 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 16 },
      { width: 18 }, { width: 20 }, { width: 20 }, { width: 14 }, { width: 22 },
    ],
  });

  // الصف 1 — لافتات الأقسام
  ws.mergeCells("A1:F1");
  ws.getCell("A1").value = "(لا يتم تعديل هذا العمود)";
  ws.mergeCells("G1:H1");
  ws.getCell("G1").value = "الاستحقاقات";
  ws.mergeCells("I1:K1");
  ws.getCell("I1").value = "الاستقطاعات";
  for (const ref of ["A1", "G1", "I1"]) {
    const c = ws.getCell(ref);
    c.font = { bold: true, size: 11 };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.fill = BANNER_FILL;
    c.border = BORDER;
  }

  // الصف 2 — عناوين الأعمدة
  const headerRow = ws.getRow(2);
  HEADERS.forEach((h, i) => {
    const c = headerRow.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 11 };
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    c.fill = HEADER_FILL;
    c.border = BORDER;
    c.protection = { locked: true };
  });
  headerRow.height = 36;
  ws.getRow(1).height = 22;

  // الصفوف 3+ — بيانات المسير
  let count = 0;
  for (const p of rows) {
    const emp = empMap[p.employee_id] || { national_id: p.national_id, full_name: p.employee_name };
    const base = Number(p.base_salary) || 0;
    const housing = Number(p.housing_allowance) || 0;
    const transport = Number(p.transport_allowance) || 0;
    const gross = Number((base + housing + transport).toFixed(2));
    const overtime = Number(p.overtime_amount) || 0;
    const otherEarnings = Number(((p.bonus || 0) + (p.other_allowances || 0)).toFixed(2));
    const gosiPct = emp?.is_saudi ? saudiEmpRate : 0;
    const absent = Number(p.absent_days) || 0;
    const otherDeductions = Number(((p.deductions || 0) + (p.loan_installment || 0)).toFixed(2));

    const row = ws.addRow([
      emp?.full_name || p.employee_name || "",
      idValue(emp?.national_id ?? p.national_id),
      base, housing, transport, gross,
      overtime, otherEarnings, gosiPct, absent, otherDeductions,
    ]);

    row.eachCell({ includeEmpty: true }, (c, col) => {
      c.border = BORDER;
      c.alignment = {
        vertical: "middle",
        horizontal: col === 1 ? "right" : "center",
      };
      // الأعمدة A–F (1..6) محمية؛ الأعمدة G–K (7..11) قابلة للتحرير
      c.protection = { locked: col <= 6 };
      if (col === 2 && typeof c.value === "number") c.numFmt = "0";
      if (col >= 3 && col <= 8) c.numFmt = "#,##0.00";
      if (col === 9) c.numFmt = "0.00";
    });
    count++;
  }

  // تفعيل حماية الورقة (بدون كلمة مرور) بحيث لا يمكن تحرير الأعمدة المحمية
  await ws.protect("", {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertRows: false,
    insertColumns: false,
    deleteRows: false,
    deleteColumns: false,
    sort: false,
    autoFilter: false,
  });

  // الورقة الثانية — دليل التعليمات
  const ws2 = wb.addWorksheet("دليل التعليمات", { views: [{ rightToLeft: true }] });
  ws2.columns = [{ width: 90 }];
  INSTRUCTIONS.forEach((text, i) => {
    const r = ws2.getRow(i + 1);
    const c = r.getCell(1);
    c.value = text;
    c.alignment = { vertical: "top", wrapText: true, horizontal: "right" };
    c.font = { bold: i === 0 || i === 3, size: 12 };
    r.height = INSTRUCTION_HEIGHTS[i] || 22;
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const mm = String(month).padStart(2, "0");
  a.download = `Mudad_Payroll_${org?.unified_number || org?.name || "EST"}_${year}-${mm}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return count;
}