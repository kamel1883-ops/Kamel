import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { verifyProof } from '../../shared/contractProof.ts';

// يحفظ نسخة من عقد الاشتراك المُولّد لدى بيانات العميل في بوابة المالك — قابلة للتحميل PDF.
// مساران مقبولان:
//  1) المالك الموثّق (base44.auth.me + role admin) — حفظ يدوي من بوابة المالك لأي عميل.
//  2) جلسة عرض سعر مجهولة مع إثبات موقّع (HMAC) يربط الحفظ بنفس سجل المنشأة الذي أنشئ في createTrial
//     لمنع الكتابة على سجل عميل آخر (IDOR). ويُقبل فقط روابط تخزين التطبيق.

const ALLOWED_HOSTS = ['media.base44.com', 'static.wixstatic.com'];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const file_url = String(body.file_url || '').trim();
    const quoteNo = String(body.quoteNo || '').trim();
    const date = String(body.date || '').trim();
    const tenant_id = String(body.tenant_id || '').trim();
    if (!file_url || !quoteNo || !tenant_id)
      return Response.json({ error: 'missing' }, { status: 400 });

    // التحقق من هوية المستدعي: مالك موثّق تجاوز الإثبات، وإلا فإثبات HMAC إلزامي.
    let authedAdmin = false;
    try {
      const u = await base44.auth.me();
      if (u && u.role === 'admin') authedAdmin = true;
    } catch {}
    if (!authedAdmin) {
      const proof = String(body.proof || '').trim();
      if (!proof) return Response.json({ error: 'missing' }, { status: 400 });
      if (!(await verifyProof(tenant_id, proof)))
        return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    // قبول روابط تخزين التطبيق فقط (لاحقن روابط خارجية كعقد موثوق)
    let host = '';
    try { host = new URL(file_url).hostname; } catch {}
    if (!ALLOWED_HOSTS.includes(host))
      return Response.json({ error: 'invalid_file' }, { status: 400 });

    await base44.asServiceRole.entities.Tenant.update(tenant_id, {
      contract_pdf_url: file_url,
      contract_quote_no: quoteNo,
      contract_generated_date: date || new Date().toISOString().slice(0, 10),
    });

    return Response.json({ ok: true, tenant_id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}