import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { verifyProof } from '../../shared/contractProof.ts';
import { createRateLimiter } from '../../shared/turnstile.ts';
import { escapeHtml } from '../../shared/escapeHtml.ts';
import { EMAIL_FOOTER } from '../../shared/emailFooter.ts';

const RL = createRateLimiter(10 * 60 * 1000, 20);
const ALLOWED_HOSTS = ['media.base44.com', 'static.wixstatic.com'];

// يؤكّد رفع العميل لإثبات التحويل البنكي لطلب الاشتراك السنوي:
// - يتحقق من إثبات HMAC (contract_proof) لضمان أن الطلب يخص نفس المنشأة.
// - ينقل حالة المنشأة من pending_payment إلى تجربة (30 يوماً) بانتظار تحقّق المالك
//   من التحويل وتأكيد الاشتراك السنوي عبر owner_activate. لا يُنشئ سجل اشتراك نهائي
//   حتى تأكيد المالك — كي يبقى التحقق المالي بيد المالك.
// - المنشأة قبل هذه الخطوة تكون مخفية عن بوابة المالك وممنوعة من إنشاء الحساب.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    if (RL.rateLimited(RL.clientIp(req)))
      return Response.json({ error: 'rate_limited' }, { status: 429 });
    const body = await req.json().catch(() => ({}));
    const tenant_id = String(body.tenant_id || '').trim();
    const contract_proof = String(body.contract_proof || '').trim();
    const proof_url = String(body.proof_url || '').trim();
    if (!tenant_id || !contract_proof)
      return Response.json({ error: 'missing' }, { status: 400 });
    if (!(await verifyProof(tenant_id, contract_proof)))
      return Response.json({ error: 'forbidden' }, { status: 403 });

    // قبول روابط تخزين التطبيق فقط كإثبات تحويل (منع حقن روابط خارجية/spoof).
    let host = '';
    try { host = new URL(proof_url).hostname; } catch {}
    if (proof_url && !ALLOWED_HOSTS.includes(host))
      return Response.json({ error: 'invalid_file' }, { status: 400 });

    const tenant = await base44.asServiceRole.entities.Tenant.get(tenant_id);
    if (!tenant) return Response.json({ error: 'tenant_not_found' }, { status: 404 });

    // متاحة للمنشآت في حالة pending_payment فقط — كسر إضافي يمنع إعادة تفعيل منشأة قائمة.
    if (tenant.status !== 'pending_payment')
      return Response.json({ ok: true, tenant_id, status: tenant.status, already: true });

    const today = new Date();
    const trialEnd = new Date(today);
    trialEnd.setDate(today.getDate() + 30);
    const todayStr = today.toISOString().slice(0, 10);
    const trialEndStr = trialEnd.toISOString().slice(0, 10);

    await base44.asServiceRole.entities.Tenant.update(tenant_id, {
      status: 'trial',
      plan: 'trial',
      suspended_from: null,
      trial_start: todayStr,
      trial_end: trialEndStr,
      notes: (tenant.notes ? tenant.notes + '\n' : '') + 'إثبات تحويل بنكي مرفوع: ' + proof_url,
    });

    const clientEmail = String(tenant.contact_email || '').trim();
    const ownerEmail = secrets.get('OWNER_EMAIL');
    const name = tenant.name || '';

    try {
      if (ownerEmail) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: 'إثبات تحويل بنكي بانتظار التحقق — ' + name,
          body:
            'رفع عميل إثبات تحويل بنكي لطلب اشتراك سنوي، يرجى التحقق وتأكيد تفعيل الاشتراك السنوي:\n\n' +
            'المنشأة: ' + escapeHtml(name) + '\n' +
            'الرقم الموحد: ' + escapeHtml(tenant.unified_number || '') + '\n' +
            'البريد: ' + escapeHtml(clientEmail) + '\n' +
            'الهاتف: ' + escapeHtml(tenant.contact_phone || '') + '\n' +
            'إثبات التحويل: ' + escapeHtml(proof_url) + '\n' +
            'بدأت فترة تجربة 30 يوماً بانتظار تأكيد التحويل وتفعيل السنة.' + EMAIL_FOOTER,
        });
      }
    } catch (_) {}

    try {
      if (clientEmail) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: clientEmail,
          from_name: 'جدارة',
          subject: 'استلمنا إثبات تحويلكم — جاري التحقق وتفعيل الحساب',
          body:
            'السلام عليكم ورحمة الله وبركاته،\n\n' +
            'شكراً لكم. استلمنا إثبات تحويلكم البنكي للاشتراك السنوي في منصة «جدارة».\n\n' +
            'بدأت فترة تجربة 30 يوماً بانتظار تحقّق فريق المالك من التحويل وتفعيل اشتراككم السنوي. يمكنك الآن إنشاء حسابك في بوابة الشركات بنفس البريد والرقم الموحّد المُسجَّلَين.\n\n' +
            'فريق دعم جدارة' + EMAIL_FOOTER,
        });
      }
    } catch (_) {}

    return Response.json({ ok: true, tenant_id, status: 'trial' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}