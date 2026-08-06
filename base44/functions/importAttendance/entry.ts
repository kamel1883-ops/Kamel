import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const pad = (n) => String(n).padStart(2, '0');

function parseDate(s) {
  if (!s) return '';
  s = String(s).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`; // dd/mm/yyyy
  m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  return '';
}

function parseTime(s) {
  if (!s) return '';
  const t = String(s).trim().match(/(\d{1,2}):(\d{2})/);
  return t ? `${pad(t[1])}:${t[2]}` : '';
}

function timeToMin(t) {
  const m = t && t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function normalizeRecord(r) {
  return {
    employee_number: String(r.employee_number ?? r.رقم_الموظف ?? r.الرقم_الوظيفي ?? '').trim(),
    employee_name: String(r.employee_name ?? r.اسم_الموظف ?? r.الاسم ?? '').trim(),
    date: parseDate(r.date ?? r.التاريخ ?? r.date),
    check_in: parseTime(r.check_in ?? r.الحضور ?? r.وقت_الدخول ?? ''),
    check_out: parseTime(r.check_out ?? r.الانصراف ?? r.وقت_الخروج ?? ''),
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
              employee_number: { type: 'string' },
              employee_name: { type: 'string' },
              date: { type: 'string' },
              check_in: { type: 'string' },
              check_out: { type: 'string' },
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

    const records = raw.map(normalizeRecord).filter((r) => r.date);

    const employees = await base44.asServiceRole.entities.Employee.list('-created_date', 1000);
    const byNumber = {};
    const byNational = {};
    for (const e of employees) {
      if (e.employee_number) byNumber[String(e.employee_number).trim()] = e;
      if (e.national_id) byNational[String(e.national_id).trim()] = e;
    }

    const matchEmployee = (r) => {
      if (r.employee_number) {
        if (byNumber[r.employee_number]) return byNumber[r.employee_number];
        if (byNational[r.employee_number]) return byNational[r.employee_number];
      }
      const fn = r.employee_name.trim();
      if (fn) {
        const found = employees.find((e) => {
          const full = `${e.employee_number} ${e.position || ''} ${e.department || ''}`.trim();
          return full.includes(fn) || fn.includes(e.position || '') && e.position;
        });
        if (found) return found;
      }
      return null;
    };

    // نطاق التواريخ لجلب الحضور الموجود وتفادي التكرار
    const dates = records.map((r) => r.date).sort();
    let existing = [];
    if (dates.length) {
      try {
        existing = await base44.asServiceRole.entities.Attendance.filter(
          { date: { $gte: dates[0], $lte: dates[dates.length - 1] } },
          '-created_date', 5000
        );
      } catch (_e) {
        existing = [];
      }
    }
    const keyOf = (id, d) => `${id}|${d}`;
    const existingMap = {};
    for (const a of existing) existingMap[keyOf(a.employee_id, a.date)] = a;

    let created = 0, updated = 0;
    const unmatched = [];

    for (const r of records) {
      const emp = matchEmployee(r);
      if (!emp) { unmatched.push(r); continue; }
      const workMin = (timeToMin(r.check_out) && timeToMin(r.check_in))
        ? (timeToMin(r.check_out) - timeToMin(r.check_in)) / 60 : null;
      const payload = {
        employee_id: emp.id,
        employee_name: `${emp.employee_number} - ${emp.position || ''}`.trim(),
        date: r.date,
        check_in: r.check_in || '',
        check_out: r.check_out || '',
        work_hours: workMin != null ? Math.round(workMin * 100) / 100 : undefined,
        status: 'present',
      };
      const prev = existingMap[keyOf(emp.id, r.date)];
      if (prev) {
        await base44.asServiceRole.entities.Attendance.update(prev.id, payload);
        updated++;
      } else {
        await base44.asServiceRole.entities.Attendance.create(payload);
        created++;
      }
    }

    return Response.json({
      total: records.length,
      created,
      updated,
      unmatchedCount: unmatched.length,
      unmatched: unmatched.slice(0, 100),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}