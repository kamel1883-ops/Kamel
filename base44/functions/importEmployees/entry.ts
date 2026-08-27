import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const pad = (n) => String(n).padStart(2, '0');

function parseDate(s) {
  if (s == null) return '';
  s = String(s).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`; // dd/mm/yyyy
  m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  return '';
}

function num(v) {
  if (v == null || v === '') return 0;
  const n = Number(String(v).replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function boolSaudi(v) {
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return ['نعم', 'yes', 'true', '1', 'سعودي', 'saudi'].includes(s);
}

const lower = (s) => String(s ?? '').trim().toLowerCase();
const GENDER = { 'ذكر':'male','male':'male','m':'male','أنثى':'female','انثى':'female','female':'female','f':'female' };
const CONTRACT = { 'دوام كامل':'full_time','full_time':'full_time','full':'full_time','كامل':'full_time','جزئي':'part_time','part_time':'part_time','part':'part_time','عقد':'contract','contract':'contract' };
// طريقة صرف الراتب: مدد (حماية الأجور) أو كاش (صرف نقدي)
const PAYMENT = { 'مدد':'mudad','mudad':'mudad','كاش':'cash','cash':'cash','نقدي':'cash' };
// استحقاق التذكرة: سنوي / كل سنتين / لا ينطبق
// استحقاق التذكرة: سنوي / كل سنتين / لا ينطبق
const TICKET = { 'سنوي':'yearly','yearly':'yearly','كل سنتين':'biennial','biennial':'biennial','سنتين':'biennial','لا':'none','none':'none','لا ينطبق':'none' };
// لا يُسمح بتعيين "owner" عبر الاستيراد — المالك ليس موظف ويُدار ببوابة مستقلة
const ROLE = { 'executive':'executive','تنفيذي':'executive','manager':'manager','مدير':'manager','supervisor':'supervisor','مشرف':'supervisor','employee':'employee','موظف':'employee','worker':'worker','عامل':'worker' };

function monthDiff(fromISO, toISO) {
  if (!fromISO) return 0;
  const a = new Date(fromISO); const b = new Date(toISO);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}
function computeEntitlement(hireDate, annualDays) {
  const days = Number(annualDays) || 21;
  if (!hireDate) return 0;
  const months = monthDiff(hireDate, new Date().toISOString());
  if (months <= 0) return 0;
  return Math.round((months / 12) * days * 10) / 10;
}

function normalizeRecord(r) {
  const g = lower(r.gender);
  const c = lower(r.contract_type);
  const rl = lower(r.role_level);
  const pm = lower(r.salary_payment_method);
  const tk = lower(r.ticket_entitlement);
  const ann = num(r.annual_leave_entitlement);
  return {
    full_name: String(r.full_name ?? '').trim(),
    employee_number: String(r.employee_number ?? '').trim(),
    national_id: String(r.national_id ?? '').trim(),
    email: String(r.email ?? '').trim(),
    is_saudi: boolSaudi(r.is_saudi),
    gender: GENDER[g] || '',
    birth_date: parseDate(r.birth_date),
    phone: String(r.phone ?? '').trim(),
    department: String(r.department ?? '').trim(),
    branch_name: String(r.branch_name ?? '').trim(),
    position: String(r.position ?? '').trim(),
    job_grade: String(r.job_grade ?? '').trim(),
    role_level: ROLE[rl] || 'employee',
    hire_date: parseDate(r.hire_date),
    contract_type: CONTRACT[c] || 'full_time',
    contract_start_date: parseDate(r.contract_start_date),
    contract_end_date: parseDate(r.contract_end_date),
    base_salary: num(r.base_salary),
    housing_allowance: num(r.housing_allowance),
    transport_allowance: num(r.transport_allowance),
    other_allowances: num(r.other_allowances),
    iqama_expiry: parseDate(r.iqama_expiry),
    passport_number: String(r.passport_number ?? '').trim(),
    passport_expiry: parseDate(r.passport_expiry),
    health_insurance_number: String(r.health_insurance_number ?? '').trim(),
    health_insurance_expiry: parseDate(r.health_insurance_expiry),
    bank_account: String(r.bank_account ?? '').trim(),
    salary_payment_method: PAYMENT[pm] || 'mudad',
    nationality: String(r.nationality ?? '').trim(),
    address: String(r.address ?? '').trim(),
    emergency_contact: String(r.emergency_contact ?? '').trim(),
    annual_leave_entitlement: (ann === 30) ? 30 : 21,
    ticket_entitlement: TICKET[tk] || 'yearly',
    ticket_value: num(r.ticket_value),
    prior_used_leave: num(r.prior_used_leave),
    leave_total_entitled: num(r.leave_total_entitled),
    leave_used: num(r.leave_used),
    leave_remaining: num(r.leave_remaining),
    manager_employee_number: String(r.manager_employee_number ?? '').trim(),
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // اجلب الرقم الموحد للمنشأة الحالية (ربط دائم للموظفين بالعميل) — عبر بريد المستخدم
    const meEmail = String(user.email || '').trim().toLowerCase();
    const myTenants = await base44.asServiceRole.entities.Tenant.filter({}, undefined, 100);
    const myTenant = (myTenants || []).find(
      (tt) => String(tt.admin_email || '').trim().toLowerCase() === meEmail
        || String(tt.contact_email || '').trim().toLowerCase() === meEmail
    );
    const myUnified = String(myTenant?.unified_number || '').trim();

    const body = await req.json().catch(() => ({}));
    const fileUrl = String(body.file_url || '').trim();
    if (!fileUrl) return Response.json({ error: 'ملف مطلوب' }, { status: 400 });

    const schema = {
      type: 'object',
      properties: {
        records: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              full_name: { type: 'string', title: 'الاسم الكامل' },
              employee_number: { type: 'string', title: 'الرقم الوظيفي' },
              national_id: { type: 'string', title: 'الهوية الوطنية / رقم الإقامة' },
              email: { type: 'string', title: 'البريد الإلكتروني' },
              is_saudi: { type: 'string', title: 'سعودي (نعم/لا)' },
              gender: { type: 'string', title: 'الجنس (ذكر/أنثى)' },
              birth_date: { type: 'string', title: 'تاريخ الميلاد' },
              phone: { type: 'string', title: 'رقم الجوال' },
              department: { type: 'string', title: 'الإدارة / القسم' },
              branch_name: { type: 'string', title: 'الفرع' },
              position: { type: 'string', title: 'المسمى الوظيفي' },
              job_grade: { type: 'string', title: 'الدرجة الوظيفية' },
              role_level: { type: 'string', title: 'المستوى الوظيفي' },
              hire_date: { type: 'string', title: 'تاريخ المباشرة' },
              contract_type: { type: 'string', title: 'نوع العقد' },
              contract_start_date: { type: 'string', title: 'تاريخ بدء العقد' },
              contract_end_date: { type: 'string', title: 'تاريخ نهاية العقد' },
              base_salary: { type: 'number', title: 'الراتب الأساسي' },
              housing_allowance: { type: 'number', title: 'بدل السكن' },
              transport_allowance: { type: 'number', title: 'بدل المواصلات' },
              other_allowances: { type: 'number', title: 'بدلات أخرى' },
              iqama_expiry: { type: 'string', title: 'تاريخ انتهاء الإقامة' },
              passport_number: { type: 'string', title: 'رقم الجواز' },
              passport_expiry: { type: 'string', title: 'تاريخ انتهاء الجواز' },
              health_insurance_number: { type: 'string', title: 'رقم التأمين الطبي' },
              health_insurance_expiry: { type: 'string', title: 'تاريخ انتهاء التأمين الطبي' },
              bank_account: { type: 'string', title: 'الحساب البنكي' },
              salary_payment_method: { type: 'string', title: 'طريقة صرف الراتب (مدد/كاش)' },
              nationality: { type: 'string', title: 'الجنسية' },
              address: { type: 'string', title: 'العنوان' },
              emergency_contact: { type: 'string', title: 'جهة الاتصال الطارئ' },
              annual_leave_entitlement: { type: 'number', title: 'الرصيد السنوي للإجازات (21/30)' },
              ticket_entitlement: { type: 'string', title: 'استحقاق التذكرة (سنوي/كل سنتين/لا)' },
              ticket_value: { type: 'number', title: 'قيمة التذكرة (ريال)' },
              prior_used_leave: { type: 'number', title: 'أيام الإجازات المستخدمة سابقاً' },
              leave_total_entitled: { type: 'number', title: 'إجمالي رصيد الإجازات المستحق' },
              leave_used: { type: 'number', title: 'رصيد الإجازات المستخدم' },
              leave_remaining: { type: 'number', title: 'رصيد الإجازات المتبقي (تلقائي)' },
              manager_employee_number: { type: 'string', title: 'الرقم الوظيفي للمدير المباشر' },
            },
          },
        },
      },
    };

    const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: schema,
    });

    let raw = [];
    if (Array.isArray(result)) raw = result;
    else if (Array.isArray(result?.output)) raw = result.output;
    else if (result?.output?.records) raw = result.output.records;
    else if (result?.records) raw = result.records;

    // === تجهيز الفروع: الفرع الرئيسي افتراضياً، وإنشاء أي فرع جديد مذكور ===
    const branches = await base44.asServiceRole.entities.Branch.list('-created_date', 500);
    let mainBranch = branches.find((b) => b.is_main) || branches[0];
    if (!mainBranch) {
      mainBranch = await base44.asServiceRole.entities.Branch.create({ name: 'الفرع الرئيسي', is_main: true });
    }
    const branchMap = new Map();
    for (const b of branches) branchMap.set(lower(b.name), b);
    branchMap.set(lower(mainBranch.name), mainBranch);

    async function resolveBranch(name) {
      const n = String(name ?? '').trim();
      if (!n) return mainBranch;
      const key = lower(n);
      if (branchMap.has(key)) return branchMap.get(key);
      const nb = await base44.asServiceRole.entities.Branch.create({ name: n, is_main: false });
      branchMap.set(key, nb);
      return nb;
    }

    const orgs = await base44.asServiceRole.entities.Organization.list("-created_date", 1);
    const annualDays = Number(orgs[0]?.annual_leave_days) || 21;

    const existing = await base44.asServiceRole.entities.Employee.list('-created_date', 5000);
    const byNumber = new Set();
    for (const e of existing) if (e.employee_number) byNumber.add(String(e.employee_number).trim());

    const toCreate = [];
    let duplicate = 0, failed = 0;
    const errors = [];
    for (const rawRow of raw) {
      const r = normalizeRecord(rawRow);
      // تخطٍّ صامت للصفوف الفارغة (صفوف الصيغة الجاهزة في القالب بلا بيانات تعريفية)
      if (!r.employee_number && !r.full_name && !r.national_id) continue;
      if (!r.employee_number || !r.department || !r.position || !r.hire_date || !r.base_salary) {
        failed++;
        errors.push(`صف ناقص حقول إلزامية: ${r.employee_number || r.full_name || '—'}`);
        continue;
      }
      const key = String(r.employee_number).trim();
      if (byNumber.has(key)) { duplicate++; continue; }
      byNumber.add(key);
      // إن لم يُحدد تاريخ بداية العقد، نأخذه من تاريخ المباشرة
      if (!r.contract_start_date) r.contract_start_date = r.hire_date;
      // إن لم يُحدد تاريخ نهاية العقد، نُحدد سنة واحدة من بدايته
      if (!r.contract_end_date && r.contract_start_date) {
        const d = new Date(r.contract_start_date);
        d.setFullYear(d.getFullYear() + 1);
        r.contract_end_date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      }
      const br = await resolveBranch(r.branch_name);
      r.branch_id = br.id;
      r.branch_name = br.name;
      // رصيد الإجازات: إن قدّم العميل «إجمالي الرصيد المستحق» نعتمده، وإلا نحسبه من تاريخ المباشرة
      r.prior_used_leave = r.leave_used || r.prior_used_leave || 0;
      const ent = (r.leave_total_entitled && r.leave_total_entitled > 0)
        ? r.leave_total_entitled
        : computeEntitlement(r.hire_date, annualDays);
      r.leave_balance = Math.max(0, Math.round((ent - r.prior_used_leave) * 10) / 10);
      // ربط دائم بالرقم الموحد للمنشأة — يبقى الموظفون وطلباتهم مربوطين بالعميل حتى لو حُذف الحساب
      r.unified_number = myUnified;
      toCreate.push(r);
    }

    if (toCreate.length) {
      await base44.asServiceRole.entities.Employee.bulkCreate(toCreate);
    }

    // === ربط المدير المباشر: نُنشئ الكل أولاً ثم نربط كل موظف بمديره عبر الرقم الوظيفي ===
    let managersLinked = 0, managersUnresolved = 0;
    const needLink = toCreate.filter((r) => r.manager_employee_number);
    if (needLink.length) {
      const allEmps = await base44.asServiceRole.entities.Employee.list('-created_date', 5000);
      const numToId = new Map();
      for (const e of allEmps) if (e.employee_number) numToId.set(String(e.employee_number).trim(), e.id);
      const updates = [];
      for (const r of needLink) {
        const mid = numToId.get(String(r.manager_employee_number).trim());
        const myId = numToId.get(String(r.employee_number).trim());
        if (!mid) { managersUnresolved++; errors.push(`مدير مباشر غير معروف: ${r.manager_employee_number} (للموظف ${r.employee_number})`); continue; }
        if (mid === myId) continue;
        updates.push({ id: myId, manager_id: mid });
      }
      if (updates.length) {
        await base44.asServiceRole.entities.Employee.bulkUpdate(updates);
        managersLinked = updates.length;
      }
    }

    return Response.json({
      total: raw.length,
      created: toCreate.length,
      duplicate,
      failed,
      managers_linked: managersLinked,
      managers_unresolved: managersUnresolved,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}