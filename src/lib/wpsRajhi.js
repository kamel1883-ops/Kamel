// ============================================================================
// مولّد قالب بنك الراجحي (WPS) — مخصص لشركة آل معيض المحدودة فقط
// ============================================================================

export const AL_MOIED_WPS = {
  cic: "12099484",
  debitIban: "SA8580000461608010865352",
  molId: "11-184347",
  paymentPurpose: "Payroll",
  companyRemarks: "Payroll",
  typeOfPayroll: "WPS",
  bankName: "Al Rajhi Bank",
};

export const RAJHI_BANKS = [
  "--Select Bank Name--", "Al Rajhi Bank", "AlBank AlSaudi AlFransi", "Alinma Bank",
  "Arab National Bank", "Bank Albilad", "National Bank of Bahrain", "Bank AlJazira",
  "Bank Muscat", "BNP Paribas", "Deutsche Bank", "Emirates Bank Intl",
  "Gulf International Bank", "National Bank of Kuwait", "National Commercial Bank",
  "Riyad Bank", "SAMBA Financial Group", "Saudi Holland Bank", "Saudi Investment Bank",
  "State Bank of India", "T.C. Ziraat Bankasi", "The Saudi British Bank",
];

export function isWpsRajhiTenant(org) {
  if (!org) return false;
  if (org.unified_number === "7001838478") return true;
  return /معيض|moied|muaid/i.test(org.name || "");
}

// تحقق صحة آيبان الموظفين (SA IBAN = 24 خانة) + تحقق mod-97
export function validateWpsRajhiIbans(paidPayrolls, employees) {
  const empMap = {};
  for (const e of employees) empMap[e.id] = e;
  const ok = [];
  const fail = [];
  for (const p of paidPayrolls) {
    const e = empMap[p.employee_id] || {};
    const iban = (e.bank_account || "").replace(/\s+/g, "").toUpperCase();
    const name = e.full_name || p.employee_name || p.employee_id;
    let isValid = /^SA\d{22}$/.test(iban);
    if (isValid) {
      const sNum = "28" + "10";
      const iso = iban.slice(4) + sNum + iban.slice(2, 4);
      let rem = 0;
      for (const ch of iso) rem = (rem * 10 + Number(ch)) % 97;
      if (rem !== 1) isValid = false;
    }
    (isValid ? ok : fail).push({ id: p.id, name, iban });
  }
  return { ok, fail };
}

// === مولّد SpreadsheetML 2003 ===
// نُكوّن كيانات XML بدمج نصوص لتفادي أي تفكيك تلقائي للكيانات.
const AMP = "&" + "amp;";
const LT = "&" + "lt;";
const GT = "&" + "gt;";
const QUOT = "&" + "quot;";
const BORDERS =
  "<Borders><Border ss:Position=\"Top\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\"/>" +
  "<Border ss:Position=\"Bottom\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\"/>" +
  "<Border ss:Position=\"Left\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\"/>" +
  "<Border ss:Position=\"Right\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\"/></Borders>";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT)
    .replace(/"/g, QUOT);
}
function cell(style, val, type, idx) {
  const i = idx ? ` ss:Index="${idx}"` : "";
  return `<Cell${i} ss:StyleID="${style}"><Data ss:Type="${type}">${esc(val)}</Data></Cell>`;
}
function cellEmpty(style, idx) {
  const i = idx ? ` ss:Index="${idx}"` : "";
  return `<Cell${i} ss:StyleID="${style}"/>`;
}
function row(cells) { return `<Row>${cells.join("")}</Row>`; }
const num2 = (v) => Number(Number(v || 0).toFixed(2));

function stylesXml() {
  return `<Styles>
<Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="Arial" ss:Size="11" ss:Color="#1f2937"/></Style>
<Style ss:ID="Title"><Font ss:FontName="Arial" ss:Size="13" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0B2545" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/>${BORDERS}</Style>
<Style ss:ID="Label"><Font ss:FontName="Arial" ss:Size="11" ss:Bold="1" ss:Color="#0B2545"/><Interior ss:Color="#F6ECC8" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/>${BORDERS}</Style>
<Style ss:ID="Val"><Font ss:FontName="Arial" ss:Size="11" ss:Bold="1" ss:Color="#9A741E"/><Alignment ss:Horizontal="Left" ss:Vertical="Center"/>${BORDERS}</Style>
<Style ss:ID="Note"><Font ss:FontName="Arial" ss:Size="10" ss:Italic="1" ss:Color="#4b5563"/><Alignment ss:WrapText="1" ss:Vertical="Top"/>${BORDERS}</Style>
<Style ss:ID="Header"><Font ss:FontName="Arial" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0B2545" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/>${BORDERS}</Style>
<Style ss:ID="Cell"><Font ss:FontName="Arial" ss:Size="11" ss:Color="#1f2937"/>${BORDERS}</Style>
<Style ss:ID="CellR"><Font ss:FontName="Arial" ss:Size="11" ss:Color="#1f2937"/><Alignment ss:Horizontal="Right"/>${BORDERS}</Style>
<Style ss:ID="Amt"><Font ss:FontName="Arial" ss:Size="11" ss:Color="#1f2937"/><NumberFormat ss:Format="0.00"/><Alignment ss:Horizontal="Right"/>${BORDERS}</Style>
<Style ss:ID="BankList"><Font ss:FontName="Arial" ss:Size="9" ss:Color="#9ca3af"/>${BORDERS}</Style>
</Styles>`;
}

const COLS_WPS = [
  { w: 130 }, { w: 210 }, { w: 170 }, { w: 120 }, { w: 150 }, { w: 110 }, { w: 110 },
  { w: 120 }, { w: 120 }, { w: 110 }, { w: 90 }, { w: 130 }, { w: 160 }, { w: 140 },
];
const BANK_LIST_COLS = RAJHI_BANKS.map(() => ({ w: 60 }));

function buildWpsSheet({ paidPayrolls, employees }) {
  const empMap = {};
  for (const e of employees) empMap[e.id] = e;
  const colDefs = [...COLS_WPS, ...BANK_LIST_COLS]
    .map((c) => `<Column ss:Width="${c.w}"/>`).join("");

  const banksCells = RAJHI_BANKS
    .map((b, i) => cell("BankList", b, "String", 15 + i))
    .join("");
  const r1 = row([
    cell("Label", "CIC - رقم العميل", "String"),
    cell("Val", AL_MOIED_WPS.cic, "String"),
    cell("Title", "Alrajhi Bank WPS Payroll Payments Upload File", "String"),
    cellEmpty("Val", 4), cellEmpty("Val", 5), cellEmpty("Val", 6), cellEmpty("Val", 7),
    cell("Label", "Type of Payroll", "String", 8),
    cell("Val", AL_MOIED_WPS.typeOfPayroll, "String", 9),
    banksCells,
  ]);
  const r2 = row([
    cell("Label", "Debit Account:", "String"),
    cell("Val", AL_MOIED_WPS.debitIban, "String"),
    cell("Note", "Notes: Template used for upload of WPS Payroll data", "String"),
  ]);
  const r3 = row([
    cell("Label", "MOL ID", "String"),
    cell("Val", AL_MOIED_WPS.molId, "String"),
    cell("Note", "ملاحظة مهمة : الرجاء عدم تغيير عرض الخلايا نهائيا أو أي تغيير في القائمة مع الكتابة فقط باللغة الانجليزية وبدون استخدام أي من الفواصل او النقط او الاقواس", "String"),
  ]);
  const r4 = row([
    cell("Label", "Payment Purpose", "String"),
    cell("Val", AL_MOIED_WPS.paymentPurpose, "String"),
  ]);
  const r5 = row([
    cell("Label", "Company Remarks", "String"),
    cell("Val", AL_MOIED_WPS.companyRemarks, "String"),
  ]);

  const headers = ["Bank Name", "Account Number(34N)", "Employee Name", "Employee Number",
    "National ID Number", "Salary (15N)", "Basic Salary", "Housing Allowance", "Other Earnings",
    "Deductions", "Branch Code", "Branch Name", "Employee Remarks", "Employee Department"];
  const r6 = row(headers.map((h) => cell("Header", h, "String")));

  const dataRows = paidPayrolls.map((p) => {
    const e = empMap[p.employee_id] || {};
    const otherEarnings = num2((p.transport_allowance || 0) + (p.other_allowances || 0) + (p.bonus || 0) + (p.overtime_amount || 0));
    const deductions = num2((p.deductions || 0) + (p.loan_installment || 0));
    return row([
      cell("CellR", AL_MOIED_WPS.bankName, "String"),
      cell("CellR", e.bank_account || "", "String"),
      cell("CellR", e.full_name || p.employee_name || "", "String"),
      cell("CellR", e.employee_number || "", "String"),
      cell("CellR", e.national_id || p.national_id || "", "String"),
      cell("Amt", num2(p.net_salary), "Number"),
      cell("Amt", num2(p.base_salary), "Number"),
      cell("Amt", num2(p.housing_allowance), "Number"),
      cell("Amt", otherEarnings, "Number"),
      cell("Amt", deductions, "Number"),
      cell("CellR", "", "String"),
      cell("CellR", e.branch_name || "", "String"),
      cell("CellR", p.notes || "", "String"),
      cell("CellR", e.department || "", "String"),
    ]);
  }).join("");

  return `<Worksheet ss:Name="WPS"><Table>${colDefs}${r1}${r2}${r3}${r4}${r5}${r6}${dataRows}</Table></Worksheet>`;
}

function buildInstructionsSheet() {
  const main =
    "بعد الانتهاء من قائمة الموظفين ورواتبهم يتم الضغط على زر Validate Account للتأكد من صحة طول الحسابات، " +
    "والضغط على الزر Creat File لاستخراج ملف تكست يتم رفعه في المباشر لتنفيذ الرواتب .. ويتم رفعه في المسار التالي: " +
    "رواتب -- مدفوعات الرواتب -- تحميل رواتب من الملف المرفوع -- استيراد ملف حسابات جديد";
  const enhancements = [
    "Will not export an amount that is 0 although it is present on the sheet",
    "Allow 0 to be entered and not being processed",
    "Check Value date and Friday not to be processed",
    "Sorted the Bank order",
    "Put range back to first line after running code",
    "Added msgbox when vista is selected",
  ];
  const rows = [
    row([cell("Title", "تعليمات استخدام ملف WPS — بنك الراجحي", "String")]),
    row([cell("Note", main, "String")]),
    row([cell("Label", "2010 Enhancements", "String")]),
    ...enhancements.map((e) => row([cell("Cell", "• " + e, "String")])),
  ].join("");
  return `<Worksheet ss:Name="تعليمات استخدام الملف"><Table><Column ss:Width="700"/>${rows}</Table></Worksheet>`;
}

function buildVersionSheet() {
  const rows = [
    row([cell("Label", "V3", "String")]),
    row([cell("Label", "Al Rajhi WPS Upload File — Generated by جدارة", "String")]),
    row([cell("Cell", "Enhancements 2010", "String")]),
    row([cell("Cell", "Allow 0 to be entered and not being processed — 2010-01-01", "String")]),
    row([cell("Cell", "Check Value date and Friday not to be processed — 2010-02-15", "String")]),
    row([cell("Cell", "Sorted the Bank order — 2010-02-20", "String")]),
    row([cell("Cell", "Put range back to first line after running code — 2010-02-20", "String")]),
    row([cell("Cell", "Added msgbox when vista is selected — 2010-02-20", "String")]),
  ].join("");
  return `<Worksheet ss:Name="version"><Table><Column ss:Width="500"/>${rows}</Table></Worksheet>`;
}

export function buildWpsRajhiXml({ paidPayrolls, employees }) {
  return `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${stylesXml()}
${buildWpsSheet({ paidPayrolls, employees })}
${buildInstructionsSheet()}
${buildVersionSheet()}
</Workbook>`;
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadWpsRajhiExcel({ paidPayrolls, employees, month, year }) {
  const xml = buildWpsRajhiXml({ paidPayrolls, employees });
  const mm = String(month).padStart(2, "0");
  const blob = new Blob(["\uFEFF" + xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  download(blob, `WPS_Rajhi_AlMoied_${year}-${mm}.xls`);
}

export function buildWpsRajhiTxt({ paidPayrolls, employees, month, year }) {
  const empMap = {};
  for (const e of employees) empMap[e.id] = e;
  const mm = String(month).padStart(2, "0");
  const num2s = (v) => Number(v || 0).toFixed(2);
  const head = [
    "CIC:" + AL_MOIED_WPS.cic,
    "Debit Account:" + AL_MOIED_WPS.debitIban,
    "MOL ID:" + AL_MOIED_WPS.molId,
    "Bank Name:" + AL_MOIED_WPS.bankName,
    "Type of Payroll:" + AL_MOIED_WPS.typeOfPayroll,
    "Payment Purpose:" + AL_MOIED_WPS.paymentPurpose,
    "Period:" + `${year}-${mm}`,
  ].join(" | ");
  const cols = [
    "Bank Name", "Account Number(34N)", "Employee Name", "Employee Number",
    "National ID Number", "Salary (15N)", "Basic Salary", "Housing Allowance",
    "Other Earnings", "Deductions", "Branch Code", "Branch Name",
    "Employee Remarks", "Employee Department",
  ];
  const lines = [head, cols.join("|")];
  for (const p of paidPayrolls) {
    const e = empMap[p.employee_id] || {};
    const otherEarnings = num2s((p.transport_allowance || 0) + (p.other_allowances || 0) + (p.bonus || 0) + (p.overtime_amount || 0));
    const deductions = num2s((p.deductions || 0) + (p.loan_installment || 0));
    lines.push([
      AL_MOIED_WPS.bankName, e.bank_account || "", e.full_name || p.employee_name || "",
      e.employee_number || "", e.national_id || p.national_id || "", num2s(p.net_salary),
      num2s(p.base_salary), num2s(p.housing_allowance), otherEarnings, deductions,
      "", e.branch_name || "", p.notes || "", e.department || "",
    ].join("|"));
  }
  return lines.join("\n");
}

export function downloadWpsRajhiTxt({ paidPayrolls, employees, month, year }) {
  const txt = buildWpsRajhiTxt({ paidPayrolls, employees, month, year });
  const mm = String(month).padStart(2, "0");
  const blob = new Blob(["\uFEFF" + txt], { type: "text/plain;charset=utf-8;" });
  download(blob, `WPS_Rajhi_AlMoied_${year}-${mm}.txt`);
}