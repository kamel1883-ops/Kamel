import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { verifyTurnstile, createRateLimiter } from '../../shared/turnstile.ts';
import { escapeHtml } from '../../shared/escapeHtml.ts';

const limiter = createRateLimiter(10 * 60 * 1000, 5); // 5 رسائل / 10 دقائق لكل IP

export default async function(req) {
  try {
    const ip = limiter.clientIp(req);
    if (limiter.rateLimited(ip)) {
      return Response.json({ error: 'محاولات كثيرة، حاول لاحقاً' }, { status: 429 });
    }

    const body = await req.json();
    const name = (body?.name || '').toString().trim();
    const email = (body?.email || '').toString().trim();
    const message = (body?.message || '').toString().trim();
    const captcha = (body?.captcha_token || '').toString();

    if (!name || !email || !message) {
      return Response.json({ error: 'الحقول مطلوبة' }, { status: 400 });
    }
    if (message.length > 5000 || name.length > 200 || email.length > 200) {
      return Response.json({ error: 'محتوى طويل جداً' }, { status: 400 });
    }
    const ok = await verifyTurnstile(captcha);
    if (!ok) {
      return Response.json({ error: 'فشل التحقق البشري' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const officialEmail = 'info@jadara-hr.com';

    const eName = escapeHtml(name);
    const eEmail = escapeHtml(email);
    const eMsg = escapeHtml(message);
    const subject = `رسالة جديدة من ${eName} عبر موقع جدارة`;
    const mailBody = `لقد تلقيت رسالة جديدة عبر نموذج التواصل في موقع جدارة:

الاسم: ${eName}
البريد الإلكتروني: ${eEmail}

الرسالة:
${eMsg}

— تم إرسال هذه الرسالة تلقائياً من نموذج صفحة «تواصل معنا».`;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: officialEmail,
        subject,
        body: mailBody,
        from_name: 'بوابة جدارة',
      });
    } catch (mailErr) {
      // البريد الرسمي قد لا يكون مستخدماً مسجّلاً — نعيد الخطأ للواجهة كي يُعالَج
      return Response.json({ error: 'تعذّر تسليم الرسالة للبريد الرسمي' }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message || 'فشل الإرسال' }, { status: 500 });
  }
}