import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { verifyTurnstile } from "../../shared/turnstile.ts";
import { tierForCount } from "../../shared/pricing.ts";
import { EMAIL_FOOTER } from "../../shared/emailFooter.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const name = String(body.name || '').trim();
    const email = String(body.contact_email || '').trim();
    const phone = String(body.contact_phone || '').trim();
    const unified = String(body.unified_number || '').trim();
    const employeeCount = Number(body.employee_count);
    if (!name) return Response.json({ error: 'اسم المنشأة مطلوب' }, { status: 400 });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return Response.json({ error: 'بريد جهة اتصال صحيح مطلوب' }, { status: 400 });
    if (!phone) return Response.json({ error: 'رقم الهاتف مطلوب' }, { status: 400 });
    if (!unified || !/^7\d{7,11}$/.test(unified))
      return Response.json({ error: 'الرقم الوطني الموحد للمنشآت مطلوب (10 خانات تبدأ بـ7)' }, { status: 400 });
    if (!Number.isFinite(employeeCount) || employeeCount <= 0)
      return Response.json({ error: 'عدد الموظفين المتوقع مطلوب' }, { status: 400 });

    // التحقق البشري (Cloudflare Turnstile) — يمنع الإساءة الآلية لبوابة التسجيل العامة
    const captchaToken = String(body.captcha_token || '');
    if (!captchaToken) return Response.json({ error: 'التحقق البشري مطلوب' }, { status: 400 });
    if (!(await verifyTurnstile(captchaToken))) return Response.json({ error: 'فشل التحقق البشري' }, { status: 403 });

    // —— كود الخصم (اختياري)
    let discount_percent = 0;
    let discount_code = '';
    const rawCode = String(body.discount_code || '').trim();
    if (rawCode) {
      const normalized = rawCode.toLowerCase();
      const found = await base44.asServiceRole.entities.DiscountCode.filter({ code: normalized, status: 'active' });
      const code = found && found[0];
      if (!code) return Response.json({ error: 'كود الخصم غير صالح' }, { status: 400 });
      if (code.max_uses && (Number(code.used_count) || 0) >= code.max_uses)
        return Response.json({ error: 'كود الخصم مستهلك بالكامل' }, { status: 400 });
      discount_percent = Number(code.discount_percent) || 0;
      if (discount_percent < 0 || discount_percent > 100) discount_percent = 0;
      discount_code = code.code;
      await base44.asServiceRole.entities.DiscountCode.update(code.id, {
        used_count: (Number(code.used_count) || 0) + 1,
      });
    }

    // —— السعر يُحتسب تلقائياً حسب شريحة عدد الموظفين
    const tier = tierForCount(employeeCount);
    const basePrice = tier ? tier.yearly : 0;
    const pricingTier = tier ? tier.tier : '';
    const quoted_amount = Math.round(basePrice * (1 - discount_percent / 100));

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
      contact_phone: phone,
      unified_number: unified,
      city: String(body.city || '').trim(),
      country: String(body.country || 'السعودية').trim(),
      plan: 'trial',
      status: 'trial',
      trial_start: today.toISOString().slice(0, 10),
      trial_end: trialEnd.toISOString().slice(0, 10),
      discount_code,
      discount_percent,
      quoted_amount,
      employee_count: employeeCount,
      pricing_tier: pricingTier,
      notes: String(body.notes || '').trim(),
    });

    const ownerEmail = secrets.get('OWNER_EMAIL');
    if (ownerEmail) {
      try {
        let emailBody =
          'عميل جديد سجّل الفترة التجريبية عبر الموقع:\n\n' +
          'المنشأة: ' + name + '\n' +
          'القطاع: ' + (body.industry || '-') + '\n' +
          'جهة الاتصال: ' + (body.contact_name || '-') + '\n' +
          'البريد: ' + email + '\n' +
          'الهاتف: ' + phone + '\n' +
          'الرقم الوطني الموحّد للمنشآت: ' + unified + '\n' +
          'المدينة: ' + (body.city || '-') + '\n' +
          'عدد الموظفين: ' + employeeCount + '\n' +
          'الشريحة: ' + pricingTier + '\n' +
          'السعر السنوي للباقة: ' + basePrice + ' ر.س\n\n' +
          'تنتهي التجربة في: ' + trialEnd.toISOString().slice(0, 10) + '\n';
        if (discount_percent > 0) {
          emailBody +=
            'كود الخصم: ' + discount_code + ' — نسبة الخصم: ' + discount_percent + '%\n' +
            'المبلغ المعروض بعد الخصم: ' + quoted_amount + ' ر.س (بدلاً من ' + basePrice + ' ر.س)\n';
        }
        emailBody += '\nيرجى التواصل مع العميل خلال فترة التجربة لإتمام التحويل للاشتراك السنوي.';
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: 'اشتراك تجريبي جديد — ' + name,
          body: emailBody + EMAIL_FOOTER,
        });
      } catch (_e) {
        // رسالة تسجيل الإنشاء لا يجب أن تفشل كل العملية إذا تعطل البريد
      }
    }

    return Response.json({ ok: true, tenant_id: tenant.id, discount_percent, quoted_amount, pricing_tier: pricingTier, employee_count: employeeCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}