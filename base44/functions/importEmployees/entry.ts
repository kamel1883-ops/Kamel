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
const ROLE = { 'owner':'owner','مالك':'owner','executive':'executive','تنفيذي':'executive','manager':'manager','مدير':'manager','supervisor':'supervisor','مشرف':'supervisor','employee':'employee','موظف':'employee','worker':'worker','عامل':'worker' };

function normalizeRecord(r) {
  const g = lower(r.gender);
  const c = lower(r.contract_type);
  const rl = lower(r.role_level);
  return {
    full_name: String(r.full_name ?? '').trim(),
    employee_number: String(r.employee_number ?? '').trim(),
    national_id: String(r.national_id ?? '').trim(),
    email: String(r.email ?? '').trim(),
    nationality: String(r.nationality ?? '').trim(),
    is_saudi: boolSaudi(r.is_saudi),
    gender: GENDER[g] || '',
    birth_date: parseDate(r.birth_date),
    phone: String(r.phone ?? '').trim(),
    address: String(r.address ?? '').trim(),
    emergency_contact: String(r.emergency_contact ?? '').trim(),
    department: String(r.department ?? '').trim(),
    position: String(r.position ?? '').trim(),
    job_grade: String(r.job_grade ?? '').trim(),
    role_level: ROLE[rl] || 'employee',
    hire_date: parseDate(r.hire_date),
    contract_type: CONTRACT[c] || 'full_time',
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
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

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
              nationality: { type: 'string', title: 'الجنسية' },
              is_saudi: { type: 'string', title: 'سعودي (نعم/لا)' },
              gender: { type: 'string', title: 'الجنس (ذكر/أنثى)' },
              birth_date: { type: 'string', title: 'تاريخ الميلاد' },
              phone: { type: 'string', title: 'رقم الجوال' },
              address: { type: 'string', title: 'العنوان' },
              emergency_contact: { type: 'string', title: 'جهة اتصال طوارئ' },
              department: { type: 'string', title: 'الإدارة / القسم' },
              position: { type: 'string', title: 'المسمى الوظيفي' },
              job_grade: { type: 'string', title: 'الدرجة الوظيفية' },
              role_level: { type: 'string', title: 'المستوى الوظيفي' },
              hire_date: { type: 'string', title: 'تاريخ التعيين' },
              contract_type: { type: 'string', title: 'نوع العقد' },
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

    const existing = await base44.asServiceRole.entities.Employee.list('-created_date', 5000);
    const byNumber = new Set();
    for (const e of existing) if (e.employee_number) byNumber.add(String(e.employee_number).trim());

    const toCreate = [];
    let duplicate = 0, failed = 0;
    const errors = [];
    for (const rawRow of raw) {
      const r = normalizeRecord(rawRow);
      if (!r.employee_number || !r.department || !r.position || !r.hire_date || !r.base_salary) {
        failed++;
        errors.push(`${isArErr(r)}`);
        continue;
      }
      const key = String(r.employee_number).trim();
      if (byNumber.has(key)) { duplicate++; continue; }
      byNumber.add(key);
      toCreate.push(r);
    }

    function isArErr(r) {
      return `صف ناقص حقول إلزامية: ${r.employee_number || r.full_name || '—'}`;
    }

    if (toCreate.length) {
      await base44.asServiceRole.entities.Employee.bulkCreate(toCreate);
    }

    return Response.json({
      total: raw.length,
      created: toCreate.length,
      duplicate,
      failed,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}