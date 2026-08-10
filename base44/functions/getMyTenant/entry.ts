import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// إرجاع بيانات المنشأة (الكيان Tenant) للشركة المسجلة حالياً عبر مطابقة البريد.
// يستخدم صلاحية الخدمة (service role) لتجاوز RLS، ويعمل لأي دور مسجّل.
// يُستخدم لتعبئة قسم "بيانات المنشأة" في صفحة الإعدادات من بيانات طلب عرض السعر/التجربة/الشراء.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try { user = await base44.auth.me(); } catch (e) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const email = String(user.email || '').trim().toLowerCase();
    if (!email) return Response.json({ error: 'no email' }, { status: 400 });

    const tenants = await base44.asServiceRole.entities.Tenant.filter({});
    const t = (tenants || []).find(
      (x) => String(x.contact_email || '').toLowerCase() === email
    );
    if (!t) return Response.json({ ok: true, found: false });

    return Response.json({
      ok: true,
      found: true,
      tenant: {
        name: t.name || '',
        industry: t.industry || '',
        city: t.city || '',
        contact_name: t.contact_name || '',
        contact_phone: t.contact_phone || '',
        unified_number: t.unified_number || '',
        contact_email: t.contact_email || '',
        vat_number: t.vat_number || '',
        country: t.country || '',
        status: t.status || '',
        employee_count: t.employee_count || 0,
        pricing_tier: t.pricing_tier || '',
        quoted_amount: t.quoted_amount || 0,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}