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

    const params = new URLSearchParams();
    params.append('amount', String(ANNUAL_AMOUNT));
    params.append('currency', 'sar');
    params.append('automatic_payment_methods[enabled]', 'true');
    params.append('description', 'اشتراك سنوي جدارة — السنة الأولى (2,500 ريال)');
    params.append('metadata[name]', name);
    params.append('metadata[commercial_register]', String(body.commercial_register || '').trim());
    params.append('metadata[industry]', String(body.industry || '').trim());
    params.append('metadata[contact_name]', String(body.contact_name || '').trim());
    params.append('metadata[contact_email]', email);
    params.append('metadata[contact_phone]', String(body.contact_phone || '').trim());
    params.append('metadata[city]', String(body.city || '').trim());

    const key = secrets.get('STRIPE_SECRET_KEY');
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const data = await res.json();
    if (!res.ok || !data.client_secret) {
      return Response.json({ error: data?.error?.message || 'تعذّر إنشاء نية الدفع' }, { status: 502 });
    }
    const publishableKey = secrets.get('STRIPE_PUBLISHABLE_KEY');
    return Response.json({
      client_secret: data.client_secret,
      payment_intent_id: data.id,
      publishable_key: publishableKey,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}