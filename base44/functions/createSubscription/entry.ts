import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const ANNUAL_AMOUNT = 2500; // SAR (Tap expects whole currency units)

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    const email = String(body.contact_email || '').trim();
    if (!name) return Response.json({ error: 'اسم المنشأة مطلوب' }, { status: 400 });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return Response.json({ error: 'بريد جهة اتصال صحيح مطلوب' }, { status: 400 });

    const origin = String(body.return_url || '').trim().replace(/\/$/, '') || 'https://jadara-hr.sa';

    const contactName = String(body.contact_name || '').trim() || name;
    const firstSpace = contactName.indexOf(' ');
    const firstName = firstSpace > 0 ? contactName.slice(0, firstSpace) : contactName.slice(0, 40);
    const lastName = firstSpace > 0 ? contactName.slice(firstSpace + 1).trim() : name.slice(0, 40) || '—';

    const metadata = {
      name,
      commercial_register: String(body.commercial_register || '').trim(),
      industry: String(body.industry || '').trim(),
      contact_name: contactName,
      contact_email: email,
      contact_phone: String(body.contact_phone || '').trim(),
      city: String(body.city || '').trim(),
    };

    const key = secrets.get('TAP_SECRET_KEY');
    const res = await fetch('https://api.tap.company/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'lang_code': 'ar',
      },
      body: JSON.stringify({
        amount: ANNUAL_AMOUNT,
        currency: 'SAR',
        threeDSecure: true,
        save_card: false,
        description: 'اشتراك سنوي جدارة — السنة الأولى (2,500 ريال)',
        statement_descriptor: 'JADARA',
        metadata,
        customer: { first_name: firstName, last_name: lastName, email },
        // src_all = Tap hosted checkout (shows Mada, Visa, Mastercard, Apple Pay automatically)
        source: { id: 'src_all' },
        post: { url: origin },
        redirect: { url: origin },
      }),
    });

    const data = await res.json();
    const redirectTarget = data?.transaction?.url || data?.redirect_url || data?.redirect?.url;
    if (!res.ok || !redirectTarget) {
      return Response.json({ error: data?.errors?.[0]?.description || data?.error?.message || 'تعذّر إنشاء عملية الدفع' }, { status: 502 });
    }

    return Response.json({
      redirect_url: redirectTarget,
      charge_id: data.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}