import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const ANNUAL_AMOUNT = 250000; // 2,500 SAR (halalas)

function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.session_id || '').trim();
    if (!sessionId) return Response.json({ error: 'رقم الجلسة مطلوب' }, { status: 400 });

    // Dedupe by session id stored in Subscription notes
    const existing = await base44.asServiceRole.entities.Subscription.filter({ notes: sessionId });
    if (existing && existing.length) {
      return Response.json({ ok: true, already: true, tenant_id: existing[0].tenant_id });
    }

    const key = secrets.get('STRIPE_SECRET_KEY');
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
      headers: { 'Authorization': 'Bearer ' + key },
    });
    const session = await res.json();
    if (!res.ok) return Response.json({ error: session?.error?.message || 'تعذّر التحقق من الجلسة' }, { status: 502 });

    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'لم يكتمل الدفع بعد' }, { status: 402 });
    }

    const meta = session.metadata || {};
    const name = meta.name || session.customer_details?.name || '—';
    const email = meta.contact_email || session.customer_details?.email || '';
    const phone = meta.contact_phone || session.customer_details?.phone || '';
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
      notes: 'اشتراك سنوي مدفوع عبر Stripe — رقم الجلسة: ' + sessionId,
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
      notes: sessionId,
    });

    const ownerEmail = secrets.get('OWNER_EMAIL');
    if (ownerEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: 'اشتراك سنوي جديد مدفوع — ' + name,
          body:
            'تم اشتراك عميل جديد في الباقة السنوية ودفع 2,500 ريال عبر Stripe:\n\n' +
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
            'رقم جلسة Stripe: ' + sessionId,
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