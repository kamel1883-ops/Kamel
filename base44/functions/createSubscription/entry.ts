import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const ANNUAL_AMOUNT = 250000; // 2,500 SAR (in halalas)

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    const email = String(body.contact_email || '').trim();
    if (!name) return Response.json({ error: 'اسم المنشأة مطلوب' }, { status: 400 });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return Response.json({ error: 'بريد جهة اتصال صحيح مطلوب' }, { status: 400 });

    const origin = String(body.origin || '').trim() || 'https://jadara.sa';
    const successUrl = origin + (origin.includes('?') ? '&' : '?') + 'paid=1&session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl = origin + (origin.includes('?') ? '&' : '?') + 'cancelled=1';

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('customer_email', email);
    params.append('locale', String(body.locale) === 'ar' ? 'auto' : 'en');
    params.append('line_items[0][quantity]', '1');
    params.append('line_items[0][price_data][currency]', 'sar');
    params.append('line_items[0][price_data][unit_amount]', String(ANNUAL_AMOUNT));
    params.append('line_items[0][price_data][product_data][name]', 'اشتراك سنوي جدارة — السنة الأولى');
    params.append('line_items[0][price_data][product_data][description]',
      'اشتراك سنوي بـ 2,500 ريال للسنة الأولى (تشمل سنة مجانية)، ثم 700 ريال سنوياً من العام الثاني.');
    params.append('metadata[name]', name);
    params.append('metadata[commercial_register]', String(body.commercial_register || '').trim());
    params.append('metadata[industry]', String(body.industry || '').trim());
    params.append('metadata[contact_name]', String(body.contact_name || '').trim());
    params.append('metadata[contact_email]', email);
    params.append('metadata[contact_phone]', String(body.contact_phone || '').trim());
    params.append('metadata[city]', String(body.city || '').trim());

    const key = secrets.get('STRIPE_SECRET_KEY');
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      return Response.json({ error: data?.error?.message || 'تعذّر إنشاء جلسة الدفع' }, { status: 502 });
    }
    return Response.json({ url: data.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}