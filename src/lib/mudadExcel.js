import ExcelJS from "exceljs";

// مولّد ملف مسير الرواتب لبوابة «مدد» — مطابق للنموذج الرسمي (xlsx)
// شعار مدد أعلى الملف + لوحة الألوان الرسمية + أعمدة محمية مقفولة (A–F).

const BLUE = "FF0070C0";
const LIGHT_GRAY = "FFE6E6E6";
const BORDER_GRAY = "FFD9D9D9";

const BORDER = {
  top: { style: "thin", color: { argb: BORDER_GRAY } },
  bottom: { style: "thin", color: { argb: BORDER_GRAY } },
  left: { style: "thin", color: { argb: BORDER_GRAY } },
  right: { style: "thin", color: { argb: BORDER_GRAY } },
};
const BLUE_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
const GRAY_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GRAY } };

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

function idValue(raw) {
  const s = String(raw ?? "").trim();
  return /^[0-9]+$/.test(s) ? Number(s) : s;
}

// يرسم شعار «مدد» كصورة PNG عبر canvas (نص عربي صحيح بدون اعتماد على صور خارجية)
function buildMudadLogoBase64() {
  const canvas = document.createElement("canvas");
  const scale = 3;
  const W = 260, H = 100;
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, W, H);
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  // كلمة «مدد» بخط عربي ثقيل باللون الأزرق الرسمي
  ctx.fillStyle = "#0070c0";
  ctx.font = '600 56px "Tajawal","IBM Plex Sans Arabic","Segoe UI","Arial",sans-serif';
  ctx.fillText("مدد", W - 6, 58);
  // كلمة MUDAD اللاتينية الصغيرة تحته
  ctx.fillStyle = "#5599cc";
  ctx.font = '700 17px Arial,sans-serif';
  ctx.fillText("MUDAD", W - 6, 84);
  const url = canvas.toDataURL("image/png");
  return url.substring(url.indexOf(",") + 1);
}

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
      { width: 26 }, { width: 20 }, { width: 15 }, { width: 13 }, { width: 13 }, { width: 15 },
      { width: 17 }, { width: 19 }, { width: 20 }, { width: 13 }, { width: 21 },
    ],
  });

  // الصفان 1–2: شعار مدد (يمين) + عنوان «ملف مسير الرواتب» (وسط)
  ws.mergeCells("A1:B2");
  ws.mergeCells("C1:K2");
  const titleCell = ws.getCell("C1");
  titleCell.value = "ملف مسير الرواتب";
  titleCell.font = { bold: true, size: 18, color: { argb: BLUE } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 22;
  ws.getRow(2).height = 20;

  // تضمين صورة شعار مدد أعلى الملف
  try {
    const logoId = wb.addImage({ base64: buildMudadLogoBase64(), extension: "png" });
    ws.addImage(logoId, { tl: { col: 0.1, row: 0.2 }, ext: { width: 104, height: 40 } });
  } catch (_) { /* تجاهل لو تعذّر رسم اللوغو */ }

  // الصف 3 — لافتات الأقسام (أزرق) + لافتة العمود المحمي
  ws.mergeCells("A3:F3");
  ws.getCell("A3").value = "(لا يتم تعديل هذا العمود)";
  ws.mergeCells("G3:H3");
  ws.getCell("G3").value = "الاستحقاقات";
  ws.mergeCells("I3:K3");
  ws.getCell("I3").value = "الاستقطاعات";
  for (const ref of ["A3", "G3", "I3"]) {
    const c = ws.getCell(ref);
    c.border = BORDER;
    c.alignment = { horizontal: "center", vertical: "middle" };
    if (ref === "A3") {
      c.fill = GRAY_FILL;
      c.font = { bold: true, color: { argb: "FF000000" } };
    } else {
      c.fill = BLUE_FILL;
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    }
  }
  // أكمل حدود باقي خلايا الصف 3 (المدمجة)
  for (let col = 1; col <= 11; col++) {
    const c = ws.getRow(3).getCell(col);
    if (!c.border || !c.border.top) {
      c.border = BORDER;
      if (!c.fill || !c.fill.fgColor) {
        c.fill = col <= 6 ? GRAY_FILL : BLUE_FILL;
        if (!c.font || !c.font.color) c.font = { bold: true, color: col <= 6 ? { argb: "FF000000" } : { argb: "FFFFFFFF" } };
      }
    }
  }
  ws.getRow(3).height = 22;

  // الصف 4 — عناوين الأعمدة (رمادي فاتح) + فلتر
  const headerRow = ws.getRow(4);
  HEADERS.forEach((h, i) => {
    const c = headerRow.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 11, color: { argb: "FF000000" } };
    c.fill = GRAY_FILL;
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    c.border = BORDER;
    c.protection = { locked: true };
  });
  headerRow.height = 38;
  ws.autoFilter = { from: "A4", to: "K4" };

  // الصفوف 5+ — بيانات المسير
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
      c.alignment = { vertical: "middle", horizontal: col === 1 ? "right" : "center" };
      c.protection = { locked: col <= 6 };
      if (col === 2 && typeof c.value === "number") c.numFmt = "0";
      if (col >= 3 && col <= 8) c.numFmt = "#,##0.00";
      if (col === 9) c.numFmt = "0.00";
    });
    count++;
  }

  // تفعيل حماية الورقة (بدون كلمة مرور) بحيث لا يمكن تحرير الأعمدة المحمية A–F
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
    sort: true,
    autoFilter: true,
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