import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // تأكيد الدفع وإنشاء حساب العميل عملية حساسة — تقتصر على المالك
    let user;
    try { user = await base44.auth.me(); } catch (e) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const tapId = String(body.tap_id || body.charge_id || body.session_id || '').trim();
    if (!tapId) return Response.json({ error: 'رقم العملية مطلوب' }, { status: 400 });

    // Dedupe by Tap charge id stored in Subscription notes
    const existing = await base44.asServiceRole.entities.Subscription.filter({ notes: tapId });
    if (existing && existing.length) {
      return Response.json({ ok: true, already: true, tenant_id: existing[0].tenant_id });
    }

    const key = secrets.get('TAP_SECRET_KEY');
    const res = await fetch('https://api.tap.company/v2/charges/' + encodeURIComponent(tapId), {
      headers: { 'Authorization': 'Bearer ' + key },
    });
    const charge = await res.json();
    if (!res.ok) return Response.json({ error: charge?.errors?.[0]?.description || 'تعذّر التحقق من العملية' }, { status: 502 });

    if (charge.status !== 'CAPTURED') {
      return Response.json({ error: 'لم يكتمل الدفع بعد' }, { status: 402 });
    }
    // تحقق إضافي من مطابقة المبلغ المتوقع لمنع إنشاء حساب من عملية بقيمة مختلفة
    if (Number(charge.amount) !== 2500) {
      return Response.json({ error: 'مبلغ العملية لا يطابق رسوم الاشتراك' }, { status: 400 });
    }

    const meta = charge.metadata || {};
    const name = meta.name || '—';
    const email = meta.contact_email || '';
    const phone = meta.contact_phone || '';
    const cr = meta.commercial_register || '';
    const industry = meta.industry || '';
    const city = meta.city || '';
    const contactName = meta.contact_name || '';

    const today = new Date();
    const subEnd = addYears(today, 1);
    const todayStr = today.toISOString().slice(0, 10);

    const tenant = await base44.asServiceRole.entities.Tenant.create({
      name,
      commercial_register: cr,
      industry,
      contact_name: contactName,
      contact_email: email,
      contact_phone: phone,
      city,
      country: 'السعودية',
      plan: 'annual',
      status: 'active',
      trial_start: null,
      trial_end: null,
      subscription_end: subEnd.toISOString().slice(0, 10),
      notes: 'اشتراك سنوي مدفوع عبر Tap — رقم العملية: ' + tapId,
    });

    await base44.asServiceRole.entities.Subscription.create({
      tenant_id: tenant.id,
      tenant_name: name,
      plan: 'annual',
      amount: 2500,
      period_start: todayStr,
      period_end: subEnd.toISOString().slice(0, 10),
      payment_method: 'online',
      status: 'paid',
      paid_date: todayStr,
      notes: tapId,
    });

    const ownerEmail = secrets.get('OWNER_EMAIL');
    if (ownerEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: 'اشتراك سنوي جديد مدفوع — ' + name,
          body:
            'تم اشتراك عميل جديد في الباقة السنوية ودفع 2,500 ريال عبر Tap (مدى/Visa/Apple Pay):\n\n' +
            'المنشأة: ' + name + '\n' +
            'السجل التجاري: ' + (cr || '-') + '\n' +
            'القطاع: ' + (industry || '-') + '\n' +
            'جهة الاتصال: ' + (contactName || '-') + '\n' +
            'البريد: ' + (email || '-') + '\n' +
            'الهاتف: ' + (phone || '-') + '\n' +
            'المدينة: ' + (city || '-') + '\n' +
            'تاريخ الاشتراك: ' + todayStr + '\n' +
            'تنتهي السنة الأولى في: ' + subEnd.toISOString().slice(0, 10) + '\n' +
            'تُجدد تلقائياً (تذكير) بـ 700 ريال سنوياً من العام الثاني.\n\n' +
            'رقم عملية Tap: ' + tapId,
        });
      } catch (_e) {
        // لا تعطّل العملية إن تعطل البريد
      }
    }

    // — تأكيد تفعيل الاشتراك للعميل (عربي) —
    const clientEmail = String(tenant.contact_email || email || '').trim();
    if (clientEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: clientEmail,
          subject: 'تم تفعيل اشتراككم السنوي في منصة جدارة',
          body:
            'السلام عليكم ورحمة الله وبركاته،\n\n' +
            'أهلاً بكم في منصة «جدارة لإدارة الموارد البشرية». تم بنجاح تفعيل اشتراككم السنوي وإطلاق حساب منشأتكم.\n\n' +
            'بيانات الاشتراك:\n' +
            'المنشأة: ' + name + '\n' +
            'نوع الباقة: سنوي\n' +
            'تاريخ بدء الاشتراك: ' + todayStr + '\n' +
            'ينتهي الاشتراك في: ' + subEnd.toISOString().slice(0, 10) + '\n\n' +
            'خطوات الدخول لمنشأتكم:\n' +
            '1) ادخلوا بوابة الشركات في منصة جدارة.\n' +
            '2) سجّلوا الدخول بالبريد المرتبط بحسابكم + الرقم الموحد (الذي يبدأ بـ7).\n\n' +
            'للدعم والاستفسار — البريد: info@jadara-hr.com\n\n' +
            'مع خالص التقدير،\nفريق دعم جدارة',
          from_name: 'جدارة',
        });
      } catch (_e) {
        // لا تعطّل العملية إن تعطل البريد
      }
    }

    return Response.json({ ok: true, tenant_id: tenant.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}