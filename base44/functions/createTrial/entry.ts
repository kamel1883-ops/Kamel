import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const name = String(body.name || '').trim();
    const email = String(body.contact_email || '').trim();
    if (!name) return Response.json({ error: 'اسم المنشأة مطلوب' }, { status: 400 });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return Response.json({ error: 'بريد جهة اتصال صحيح مطلوب' }, { status: 400 });

    const today = new Date();
    const trialEnd = new Date(today);
    trialEnd.setDate(today.getDate() + 30);

    const tenant = await base44.asServiceRole.entities.Tenant.create({
      name,
      commercial_register: String(body.commercial_register || '').trim(),
      vat_number: String(body.vat_number || '').trim(),
      industry: String(body.industry || '').trim(),
      contact_name: String(body.contact_name || '').trim(),
      contact_email: email,
      contact_phone: String(body.contact_phone || '').trim(),
      city: String(body.city || '').trim(),
      country: String(body.country || 'السعودية').trim(),
      plan: 'trial',
      status: 'trial',
      trial_start: today.toISOString().slice(0, 10),
      trial_end: trialEnd.toISOString().slice(0, 10),
      notes: String(body.notes || '').trim(),
    });

    const ownerEmail = secrets.get('OWNER_EMAIL');
    if (ownerEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: 'اشتراك تجريبي جديد — ' + name,
          body:
            'عميل جديد سجّل الفترة التجريبية عبر الموقع:\n\n' +
            'المنشأة: ' + name + '\n' +
            'السجل التجاري: ' + (body.commercial_register || '-') + '\n' +
            'القطاع: ' + (body.industry || '-') + '\n' +
            'جهة الاتصال: ' + (body.contact_name || '-') + '\n' +
            'البريد: ' + email + '\n' +
            'الهاتف: ' + (body.contact_phone || '-') + '\n' +
            'المدينة: ' + (body.city || '-') + '\n\n' +
            'تنتهي التجربة في: ' + trialEnd.toISOString().slice(0, 10) + '\n' +
            'يرجى التواصل مع العميل خلال فترة التجربة لإتمام التحويل للاشتراك السنوي.',
        });
      } catch (_e) {
        // رسالة تسجيل الإنشاء لا يجب أن تفشل كل العملية إذا تعطل البريد
      }
    }

    return Response.json({ ok: true, tenant_id: tenant.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}