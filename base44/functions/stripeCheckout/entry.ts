import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { tierForCount } from '../../shared/pricing.ts';
import { verifyProof } from '../../shared/contractProof.ts';
import { createRateLimiter } from '../../shared/turnstile.ts';
import { EMAIL_FOOTER } from '../../shared/emailFooter.ts';
import { escapeHtml } from '../../shared/escapeHtml.ts';

// بوابة دفع Stripe (Payment Intents v3): إعداد علني + إنشاء PaymentIntent + تأكيد الدفع وتفعيل الاشتراك.
// كل البطاقات (مدى/فيزا/ماستركارد) وأبل باي تعمل مباشرةً على الصفحة دون أي إعادة توجيه لتسجيل دخول PayPal.
// المبلغ يُحسب خادمياً من شريحة عدد الموظفين بالريال السعودي (SAR) — Stripe يدعم SAR للحسابات السعودية.

const RL = createRateLimiter(10 * 60 * 1000, 30);
const STRIPE_API = 'https://api.stripe.com';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');

    if (RL.rateLimited(RL.clientIp(req)))
      return Response.json({ error: 'rate_limited' }, { status: 429 });

    const sk = secrets.get('STRIPE_SECRET_KEY');
    if (!sk) return Response.json({ error: 'stripe_not_configured' }, { status: 500 });

    // إعداد علني للواجهة (Publishable Key ليس سرّاً — يُستخدم لتحميل Stripe.js)
    if (action === 'config') {
      const pk = secrets.get('STRIPE_PUBLISHABLE_KEY');
      return Response.json({ publishable_key: pk || '', currency: 'SAR' });
    }

    // —— إنشاء PaymentIntent — المبلغ يُحسب خادمياً من شريحة عدد الموظفين
    if (action === 'create') {
      const employeeCount = Number(body.employee_count);
      if (!Number.isFinite(employeeCount) || employeeCount <= 0)
        return Response.json({ error: 'employee_count_required' }, { status: 400 });

      let discount_percent = 0;
      let discount_code = '';
      const rawCode = String(body.discount_code || '').trim();
      if (rawCode) {
        const found = await base44.asServiceRole.entities.DiscountCode.filter({ code: rawCode.toLowerCase(), status: 'active' });
        const code = found && found[0];
        if (code) {
          discount_percent = Number(code.discount_percent) || 0;
          if (discount_percent < 0 || discount_percent > 100) discount_percent = 0;
          discount_code = code.code;
        }
      }

      const tier = tierForCount(employeeCount);
      if (!tier) return Response.json({ error: 'invalid_tier' }, { status: 400 });
      const amountSar = Math.round(tier.yearly * (1 - discount_percent / 100));
      if (amountSar <= 0) return Response.json({ error: 'invalid_amount' }, { status: 400 });
      const amountHalala = Math.round(amountSar * 100); // SAR → halalas (أصغر وحدة)

      const tenant_id = String(body.tenant_id || '').trim();
      const params = new URLSearchParams();
      params.set('amount', String(amountHalala));
      params.set('currency', 'sar');
      params.set('automatic_payment_methods[enabled]', 'true');
      params.set('description', `Jadara annual subscription — ${tier.tier}`);
      params.set('metadata[tenant_id]', tenant_id);
      params.set('metadata[employee_count]', String(employeeCount));
      params.set('metadata[tier]', tier.tier);

      const piRes = await fetch(`${STRIPE_API}/v1/payment_intents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sk}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const pi = await piRes.json();
      if (!piRes.ok)
        return Response.json({ error: pi?.error?.message || 'stripe_create_failed', details: pi?.error }, { status: 502 });

      return Response.json({
        ok: true,
        client_secret: pi.client_secret,
        payment_intent_id: pi.id,
        amount: amountSar,
        currency: 'SAR',
        tier: tier.tier,
        discount_percent, discount_code,
      });
    }

    // —— تأكيد الدفع وتفعيل الاشتراك (يُستدعى بعد Confirm من Stripe.js على الواجهة)
    if (action === 'confirm') {
      const payment_intent_id = String(body.payment_intent_id || '').trim();
      const tenant_id = String(body.tenant_id || '').trim();
      const contract_proof = String(body.contract_proof || '').trim();
      if (!payment_intent_id || !tenant_id || !contract_proof)
        return Response.json({ error: 'missing' }, { status: 400 });

      if (!(await verifyProof(tenant_id, contract_proof)))
        return Response.json({ error: 'forbidden' }, { status: 403 });

      const tenant = await base44.asServiceRole.entities.Tenant.get(tenant_id);
      if (!tenant) return Response.json({ error: 'tenant_not_found' }, { status: 404 });

      const employee_count = Number(tenant.employee_count) || 0;
      const tier = tierForCount(employee_count);
      const tierLabel = tier ? tier.tier : (tenant.pricing_tier || '');
      const expected_sar = Number(tenant.quoted_amount) > 0 ? Number(tenant.quoted_amount) : (tier ? tier.yearly : 0);
      if (expected_sar <= 0) return Response.json({ error: 'invalid_amount' }, { status: 400 });
      const expectedHalala = Math.round(expected_sar * 100);

      const piRes = await fetch(`${STRIPE_API}/v1/payment_intents/${encodeURIComponent(payment_intent_id)}`, {
        headers: { Authorization: `Bearer ${sk}` },
      });
      const pi = await piRes.json();
      if (!piRes.ok) return Response.json({ error: pi?.error?.message || 'stripe_retrieve_failed' }, { status: 502 });
      if (pi.status !== 'succeeded')
        return Response.json({ error: 'payment_not_completed', status: pi.status }, { status: 402 });

      const paidHalala = Number(pi.amount_received || pi.amount || 0);
      if (Math.abs(paidHalala - expectedHalala) > 1)
        return Response.json({ error: 'amount_mismatch' }, { status: 400 });

      const paid = expected_sar;
      const pi_id = String(pi.id || payment_intent_id);

      // منع التكرار: إن وُجد اشتراك بنفس معرّف عملية Stripe، لا نعيد الفعّل
      const existing = await base44.asServiceRole.entities.Subscription.filter({ notes: pi_id });
      if (existing && existing.length)
        return Response.json({ ok: true, tenant_id, already: true, capture_id: pi_id, paid });

      const today = new Date();
      const subEnd = new Date(today);
      subEnd.setFullYear(subEnd.getFullYear() + 1);
      const todayStr = today.toISOString().slice(0, 10);
      const subEndStr = subEnd.toISOString().slice(0, 10);
      const name = tenant.name || '';

      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        status: 'active',
        plan: 'annual',
        contract_confirmed: true,
        suspended_from: null,
        quoted_amount: paid,
        pricing_tier: tierLabel,
        employee_count,
        subscription_end: subEndStr,
      });

      await base44.asServiceRole.entities.Subscription.create({
        tenant_id,
        tenant_name: name,
        plan: 'annual',
        amount: paid,
        period_start: todayStr,
        period_end: subEndStr,
        payment_method: 'stripe_card',
        status: 'paid',
        paid_date: todayStr,
        notes: pi_id,
      });

      const clientEmail = String(tenant?.contact_email || '').trim();
      const ownerEmail = secrets.get('OWNER_EMAIL');
      try {
        if (ownerEmail) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: ownerEmail,
            subject: 'اشتراك سنوي مدفوع عبر بطاقة (Stripe) — ' + name,
            body:
              'تم تفعيل اشتراك عميل جديد ودفع ' + paid.toLocaleString() + ' ر.س عبر بطاقة (Stripe):\n\n' +
              'المنشأة: ' + escapeHtml(name) + '\n' +
              'الشريحة: ' + escapeHtml(tierLabel) + '\n' +
              'عدد الموظفين: ' + employee_count + '\n' +
              'البريد: ' + escapeHtml(clientEmail) + '\n' +
              'تاريخ الدفع: ' + todayStr + '\n' +
              'ينتهي الاشتراك في: ' + subEndStr + '\n' +
              'رقم عملية Stripe: ' + escapeHtml(pi_id) + EMAIL_FOOTER,
          });
        }
      } catch (_e) {}

      try {
        if (clientEmail) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: clientEmail,
            from_name: 'جدارة',
            subject: 'تم تفعيل اشتراككم السنوي في منصة جدارة',
            body:
              'السلام عليكم ورحمة الله وبركاته،\n\n' +
              'تم بنجاح تفعيل اشتراككم السنوي في منصة «جدارة» وإطلاق حساب منشأتكم.\n\n' +
              'المنشأة: ' + escapeHtml(name) + '\n' +
              'تاريخ الدفع: ' + todayStr + '\n' +
              'المبلغ المدفوع: ' + paid.toLocaleString() + ' ر.س (عبر بطاقة)\n' +
              'ينتهي الاشتراك في: ' + subEndStr + '\n\n' +
              'للدخول إلى بوابة الشركات، سجّلوا الدخول بالبريد والرقم الموحّد للمنشآت.\n\n' +
              'فريق دعم جدارة' + EMAIL_FOOTER,
          });
        }
      } catch (_e) {}

      try {
        await base44.asServiceRole.entities.Notification.create({
          title: 'اشتراك سنوي مدفوع — ' + escapeHtml(name),
          body: 'تم الدفع ' + paid + ' ر.س عبر بطاقة (Stripe). ينتهي الاشتراك في ' + subEndStr,
          type: 'stripe_payment', link: '', is_read: false,
        });
      } catch (_e) {}

      return Response.json({ ok: true, tenant_id, capture_id: pi_id, paid, tier: tierLabel, method: 'stripe_card' });
    }

    return Response.json({ error: 'unknown_action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}