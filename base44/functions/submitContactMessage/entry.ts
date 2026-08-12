import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const name = (body?.name || '').toString().trim();
    const email = (body?.email || '').toString().trim();
    const message = (body?.message || '').toString().trim();

    if (!name || !email || !message) {
      return Response.json({ error: 'الحقول مطلوبة' }, { status: 400 });
    }
    if (message.length > 5000 || name.length > 200 || email.length > 200) {
      return Response.json({ error: 'محتوى طويل جداً' }, { status: 400 });
    }

    const ownerEmail = secrets.get('OWNER_EMAIL');
    if (!ownerEmail) {
      return Response.json({ error: 'لم يتم ضبط بريد الاستلام' }, { status: 500 });
    }

    const isAr = true;
    const subject = `رسالة جديدة من ${name} عبر موقع جدارة`;
    const mailBody = `لقد تلقيت رسالة جديدة عبر نموذج التواصل في موقع جدارة:

الاسم: ${name}
البريد الإلكتروني: ${email}

الرسالة:
${message}

— تم إرسال هذه الرسالة تلقائياً من نموذج صفحة «تواصل معنا».`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ownerEmail,
      subject,
      body: mailBody,
      from_name: 'بوابة جدارة',
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message || 'فشل الإرسال' }, { status: 500 });
  }
}