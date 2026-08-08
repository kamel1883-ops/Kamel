import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CRON_SECRET } from '../../shared/renewal.ts';

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DAY = 1000 * 60 * 60 * 24;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // دعم الاستدعاء اليدوي (يتطلب صلاحية المالك) واستدعاء الجدولة التلقائية (عبر سر مشترك)
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    const body = await req.json().catch(() => ({}));
    const isCron = String(body?.cron_secret || '') === CRON_SECRET;
    const isAdmin = !!user && user.role === 'admin';
    if (!isAdmin && !isCron) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employees = await base44.asServiceRole.entities.Employee.list('-created_date', 5000);
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    const horizonMs = 10 * DAY;

    const renewed = [];
    for (const e of employees) {
      // لا يجدد للمفصول/المستقيل — فقط لمن على رأس العمل أو في إجازة
      if (e.status !== 'active' && e.status !== 'on_leave') continue;
      if (!e.contract_end_date) continue;
      const end = new Date(e.contract_end_date);
      if (isNaN(end.getTime())) continue;

      // يجدد إذا كانت نهاية العقد خلال 10 أيام قادمة أو انتهت فعلاً ولم يُفصل
      const diff = end.getTime() - todayMid.getTime();
      if (diff > horizonMs) continue;

      // استنتاج المدة من العقد الحالي؛ فإن لم تتوفر تُجدد سنة واحدة
      let durDays = 365;
      if (e.contract_start_date) {
        const start = new Date(e.contract_start_date);
        if (!isNaN(start.getTime())) durDays = Math.max(30, Math.round((end - start) / DAY));
      }

      const newStart = new Date(end.getTime() + DAY); // اليوم التالي لنهاية العقد الحالي
      const newEnd = new Date(newStart.getTime() + durDays * DAY);

      await base44.asServiceRole.entities.Employee.update(e.id, {
        contract_start_date: iso(newStart),
        contract_end_date: iso(newEnd),
      });

      renewed.push({ id: e.id, number: e.employee_number, new_start: iso(newStart), new_end: iso(newEnd) });
    }

    return Response.json({ renewed: renewed.length, details: renewed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}