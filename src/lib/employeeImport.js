import ExcelJS from "exceljs";

// خريطة عناوين القالب العربية → مفاتيح الحقول
const HEADER_TO_KEY = {
  "الاسم الكامل": "full_name",
  "الرقم الوظيفي": "employee_number",
  "الهوية الوطنية / رقم الإقامة": "national_id",
  "البريد الإلكتروني": "email",
  "سعودي (نعم/لا)": "is_saudi",
  "الجنس (ذكر/أنثى)": "gender",
  "تاريخ الميلاد": "birth_date",
  "رقم الجوال": "phone",
  "الإدارة / القسم": "department",
  "الفرع": "branch_name",
  "المسمى الوظيفي": "position",
  "الدرجة الوظيفية": "job_grade",
  "المستوى الوظيفي (owner/executive/manager/supervisor/employee/worker)": "role_level",
  "تاريخ المباشرة": "hire_date",
  "إجمالي رصيد الإجازات المستحق": "leave_total_entitled",
  "رصيد الإجازات المستخدم": "leave_used",
  "رصيد الإجازات المتبقي (تلقائي)": "leave_remaining",
  "نوع العقد (دوام كامل/جزئي/عقد)": "contract_type",
  "تاريخ بدء العقد": "contract_start_date",
  "تاريخ نهاية العقد": "contract_end_date",
  "الراتب الأساسي": "base_salary",
  "بدل السكن": "housing_allowance",
  "بدل المواصلات": "transport_allowance",
  "بدلات أخرى": "other_allowances",
  "تاريخ انتهاء الإقامة": "iqama_expiry",
  "رقم الجواز": "passport_number",
  "تاريخ انتهاء الجواز": "passport_expiry",
  "رقم التأمين الطبي": "health_insurance_number",
  "تاريخ انتهاء التأمين الطبي": "health_insurance_expiry",
  "الحساب البنكي": "bank_account",
  "طريقة صرف الراتب (مدد/كاش)": "salary_payment_method",
  "الجنسية": "nationality",
  "العنوان": "address",
  "جهة الاتصال الطارئ": "emergency_contact",
  "الرصيد السنوي للإجازات (21/30)": "annual_leave_entitlement",
  "استحقاق التذكرة (سنوي/كل سنتين/لا)": "ticket_entitlement",
  "قيمة التذكرة (ريال)": "ticket_value",
  "الرقم الوظيفي للمدير المباشر": "manager_employee_number",
  // === عناوين القالب الإنجليزية ===
  "Full Name": "full_name",
  "Employee ID": "employee_number",
  "National ID / Iqama Number": "national_id",
  "Email": "email",
  "Saudi (Yes/No)": "is_saudi",
  "Gender (Male/Female)": "gender",
  "Date of Birth": "birth_date",
  "Mobile Number": "phone",
  "Department / Section": "department",
  "Branch": "branch_name",
  "Job Title": "position",
  "Job Grade": "job_grade",
  "Job Level (owner/executive/manager/supervisor/employee/worker)": "role_level",
  "Start Date": "hire_date",
  "Total Accrued Leave Balance": "leave_total_entitled",
  "Used Leave Balance": "leave_used",
  "Remaining Leave Balance (Auto)": "leave_remaining",
  "Contract Type (Full-time/Part-time/Contract)": "contract_type",
  "Contract Start Date": "contract_start_date",
  "Contract End Date": "contract_end_date",
  "Basic Salary": "base_salary",
  "Housing Allowance": "housing_allowance",
  "Transportation Allowance": "transport_allowance",
  "Other Allowances": "other_allowances",
  "Iqama Expiry Date": "iqama_expiry",
  "Passport Number": "passport_number",
  "Passport Expiry Date": "passport_expiry",
  "Medical Insurance Number": "health_insurance_number",
  "Medical Insurance Expiry Date": "health_insurance_expiry",
  "Bank Account": "bank_account",
  "Salary Payment Method (Madad/Cash)": "salary_payment_method",
  "Nationality": "nationality",
  "Address": "address",
  "Emergency Contact": "emergency_contact",
  "Annual Leave Balance (21/30)": "annual_leave_entitlement",
  "Ticket Entitlement (Annual/Every 2 Years/No)": "ticket_entitlement",
  "Ticket Value (SAR)": "ticket_value",
  "Direct Manager Employee ID": "manager_employee_number",
};

// محلّل CSV بسيط يدعم الأقواس والفواصل و BOM
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function cellToString(v) {
  if (v == null) return "";
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "object") {
    // خلية صيغة في exceljs: { formula, result }
    if (v.result != null) return String(v.result);
    return "";
  }
  return String(v).trim();
}

// يحلّل ملف CSV أو Xilinx في المتصفح ويعيد مصفوفة كائنات بمفاتيح الحقول
export async function parseEmployeeFile(file) {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  let rawRows = [];

  if (ext === "csv") {
    const text = await file.text();
    rawRows = parseCSV(text);
  } else {
    const buf = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    const ws = wb.worksheets[0];
    if (!ws) return [];
    ws.eachRow({ includeEmpty: false }, (row) => {
      const vals = row.values; // مفهرس من 1
      const arr = [];
      for (let i = 1; i < vals.length; i++) arr.push(vals[i]);
      rawRows.push(arr);
    });
  }

  if (!rawRows.length) return [];
  const headers = rawRows[0].map((h) => String(h ?? "").trim());
  const colKeys = headers.map((h) => HEADER_TO_KEY[h] || null);
  const records = [];
  for (let i = 1; i < rawRows.length; i++) {
    const vals = rawRows[i];
    const obj = {};
    colKeys.forEach((key, j) => {
      if (!key) return;
      obj[key] = cellToString(vals[j]);
    });
    records.push(obj);
  }
  return records;
}