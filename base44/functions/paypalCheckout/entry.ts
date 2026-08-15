import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { tierForCount } from '../../shared/pricing.ts';
import { verifyProof } from '../../shared/contractProof.ts';
import { createRateLimiter } from '../../shared/turnstile.ts';
import { EMAIL_FOOTER } from '../../shared/emailFooter.ts';

// بوابة دفع PayPal (REST v2): إعداد علني للواجهة + إنشاء طلب دفع + التقاط الدفع وتأكيد الاشتراك.
// المبلغ يُحسب تلقائياً من شريحة عدد الموظفين (المرجع المشترك shared/pricing.ts)؟
// بعد نجاح الالتقاط: يُفعّل سجل المنشأة سنوياً، ويُسجَّل الاشتراك، وتُرسل رسائل لِلمالك والعميل.

const RL = createRateLimiter(10 * 60 * 1000, 30);

function baseApi() {
  const mode = String(secrets.get('PAYPAL_MODE') || 'live').toLowerCase();
  // أي قيمة غير 'live' تُعدّ بيئة Sandbox (sandbox / sb- / test ...)
  const isLive = mode === 'live' || mode === 'production';
  return isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function accessToken() {
  const cid = secrets.get('PAYPAL_CLIENT_ID');
  const csec = secrets.get('PAYPAL_CLIENT_SECRET');
  if (!cid || !csec) throw new Error('paypal_not_configured');
  const auth = btoa(`${cid}:${csec}`);
  const res = await fetch(`${baseApi()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || 'paypal_auth_failed');
  return data.access_token;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');

    if (RL.rateLimited(RL.clientIp(req)))
      return Response.json({ error: 'rate_limited' }, { status: 429 });

    // إعداد علني للواجهة (Client ID ليس سرّاً ؛ يُستخدم لتحميل PayPal SDK)
    if (action === 'config') {
      const cid = secrets.get('PAYPAL_CLIENT_ID');
      return Response.json({
        client_id: cid || '',
        // تعرض الواجهة نمط البيئة الفعلي بعد التطبيع (livE/sandbox)
        mode: baseApi().includes('sandbox') ? 'sandbox' : 'live',
        // نحصّل بالدولار (حساب PayPal لا يدعم SAR) ونعرض للعميل بالريال في صفحة السعر.
        currency: 'USD',
        display_currency: 'SAR',
      });
    }

    // سعر التحويل الثابت: 1 دولار = 3.75 ريال. نعرض السعر للعميل بالريال ونحصّل بالدولار.
    const SAR_PER_USD = 3.75;

    // —— إنشاء طلب دفع — المبلغ يُحسب خادمياً من شريحة عدد الموظفين
    if (action === 'create') {
      const employeeCount = Number(body.employee_count);
      if (!Number.isFinite(employeeCount) || employeeCount <= 0)
        return Response.json({ error: 'employee_count_required' }, { status: 400 });

      let discount_percent = 0;
      let discount_code = '';
      const rawCode = String(body.discount_code || '').trim();
      if (rawCode) {
        const found = await base44.asServiceRole.entities.DiscountCode.filter({
          code: rawCode.toLowerCase(), status: 'active',
        });
        const code = found && found[0];
        if (code) {
          discount_percent = Number(code.discount_percent) || 0;
          if (discount_percent < 0 || discount_percent > 100) discount_percent = 0;
          discount_code = code.code;
        }
      }

      const tier = tierForCount(employeeCount);
      if (!tier) return Response.json({ error: 'invalid_tier' }, { status: 400 });
      // amount = المبلغ بالريال (ما يراه العميل في عرض السعر)
      const amount = Math.round(tier.yearly * (1 - discount_percent / 100));
      if (amount <= 0) return Response.json({ error: 'invalid_amount' }, { status: 400 });
      // نحوّل إلى دولار لإرساله لـ PayPal (حساب Live لا يدعم SAR)
      const amountUsd = amount / SAR_PER_USD;

      const token = await accessToken();
      const orderRes = await fetch(`${baseApi()}/v2/checkout/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
            description: `Jadara annual subscription — ${tier.tier}`,
          }],
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok)
        return Response.json({ error: order?.message || 'paypal_create_failed', details: order?.details, debug_id: order?.debug_id }, { status: 502 });

      return Response.json({
        ok: true, id: order.id,
        amount, currency: 'SAR',            // المعروض للعميل (ريال)
        amount_usd: amountUsd, charge_currency: 'USD', // المُحصّل فعلياً (دولار)
        tier: tier.tier, discount_percent, discount_code,
      });
    }

    // —— التقاط الدفع وتأكيد الاشتراك
    if (action === 'capture') {
      const order_id = String(body.order_id || '').trim();
      const tenant_id = String(body.tenant_id || '').trim();
      const contract_proof = String(body.contract_proof || '').trim();
      const employee_count = Number(body.employee_count) || 0;
      const expected_amount = Number(body.amount) || 0;
      if (!order_id || !tenant_id || !contract_proof)
        return Response.json({ error: 'missing' }, { status: 400 });

      // إثبات HMAC يربط الالتقاط بنفس سجل المنشأة الذي نشأ في createTrial (منع IDOR)
      if (!(await verifyProof(tenant_id, contract_proof)))
        return Response.json({ error: 'forbidden' }, { status: 403 });

      const token = await accessToken();
      const capRes = await fetch(`${baseApi()}/v2/checkout/orders/${encodeURIComponent(order_id)}/capture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const cap = await capRes.json();
      if (!capRes.ok)
        return Response.json({ error: cap?.message || 'paypal_capture_failed' }, { status: 502 });

      const capture = cap?.purchase_units?.[0]?.payments?.captures?.[0];
      if (!capture || capture.status !== 'COMPLETED')
        return Response.json({ error: 'payment_not_completed' }, { status: 402 });

      // paid = المُحصّل بالدولار. expected_amount (من الواجهة) بالريال — نحوّله للمقارنة.
      const paidUsd = Number(capture.amount?.value) || 0;
      const expectedUsd = expected_amount > 0 ? expected_amount / SAR_PER_USD : 0;
      if (expectedUsd > 0 && Math.abs(paidUsd - expectedUsd) > 0.05)
        return Response.json({ error: 'amount_mismatch' }, { status: 400 });
      // المبلغ بالريال للتخزين/العرض للعميل والإشعارات
      const paid = expected_amount > 0 ? expected_amount : Math.round(paidUsd * SAR_PER_USD);

      const captureId = String(capture.id || order_id);

      // منع التكرار: إن وُجد اشتراك بنفس معرّف عملية PayPal، لا نعيد الفعّل
      const existing = await base44.asServiceRole.entities.Subscription.filter({ notes: captureId });
      if (existing && existing.length)
        return Response.json({ ok: true, tenant_id, already: true, capture_id: captureId, paid });

      const today = new Date();
      const subEnd = new Date(today);
      subEnd.setFullYear(subEnd.getFullYear() + 1);
      const todayStr = today.toISOString().slice(0, 10);
      const subEndStr = subEnd.toISOString().slice(0, 10);

      const tenant = await base44.asServiceRole.entities.Tenant.get(tenant_id);
      const tier = tierForCount(employee_count);
      const tierLabel = tier ? tier.tier : (tenant?.pricing_tier || '');
      const name = tenant?.name || '';

      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        status: 'active',
        plan: 'annual',
        contract_confirmed: true,
        suspended_from: null,
        quoted_amount: paid,
        pricing_tier: tierLabel,
        employee_count: employee_count || tenant?.employee_count || 0,
        subscription_end: subEndStr,
      });

      await base44.asServiceRole.entities.Subscription.create({
        tenant_id,
        tenant_name: name,
        plan: 'annual',
        amount: paid,
        period_start: todayStr,
        period_end: subEndStr,
        payment_method: 'online',
        status: 'paid',
        paid_date: todayStr,
        notes: captureId,
      });

      const clientEmail = String(tenant?.contact_email || '').trim();
      const ownerEmail = secrets.get('OWNER_EMAIL');

      try {
        if (ownerEmail) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: ownerEmail,
            subject: 'اشتراك سنوي مدفوع عبر PayPal — ' + name,
            body:
              'تم تفعيل اشتراك عميل جديد ودفع ' + paid.toLocaleString() + ' ر.س عبر PayPal:\n\n' +
              'المنشأة: ' + name + '\n' +
              'الشريحة: ' + tierLabel + '\n' +
              'عدد الموظفين: ' + employee_count + '\n' +
              'البريد: ' + clientEmail + '\n' +
              'تاريخ الدفع: ' + todayStr + '\n' +
              'ينتهي الاشتراك في: ' + subEndStr + '\n' +
              'رقم عملية PayPal: ' + captureId + EMAIL_FOOTER,
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
              'المنشأة: ' + name + '\n' +
              'تاريخ الدفع: ' + todayStr + '\n' +
              'المبلغ المدفوع: ' + paid.toLocaleString() + ' ر.س (عبر PayPal)\n' +
              'ينتهي الاشتراك في: ' + subEndStr + '\n\n' +
              'للدخول إلى بوابة الشركات، سجّلوا الدخول بالبريد والرقم الموحّد للمنشآت.\n\n' +
              'فريق دعم جدارة' + EMAIL_FOOTER,
          });
        }
      } catch (_e) {}

      try {
        await base44.asServiceRole.entities.Notification.create({
          title: 'اشتراك سنوي مدفوع — ' + name,
          body: 'تم الدفع ' + paid + ' ر.س عبر PayPal. ينتهي الاشتراك في ' + subEndStr,
          type: 'paypal_payment', link: '', is_read: false,
        });
      } catch (_e) {}

      return Response.json({ ok: true, tenant_id, capture_id: captureId, paid, tier: tierLabel });
    }

    return Response.json({ error: 'unknown_action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}