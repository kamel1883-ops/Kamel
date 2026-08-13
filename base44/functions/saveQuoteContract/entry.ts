import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// يحفظ نسخة من عقد الاشتراك المُولّد لدى طلب عرض السعر، عند بيانات العميل في
// بوابة المالك، دون تدخل المالك — فتُصبح النسخة قابلة للتحميل PDF مباشرة من قائمة
// العملاء. يُستدعى من صفحة عرض السعر (Quote) العامة بعد توليد العقد ورفعه.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const file_url = String(body.file_url || '').trim();
    const quoteNo = String(body.quoteNo || '').trim();
    const date = String(body.date || '').trim();
    if (!file_url || !quoteNo) return Response.json({ error: 'missing' }, { status: 400 });

    // تحديد سجل المنشأة المستهدف: عبر tenant_id إن وُجد، وإلا بالمطابقة بالرقم الموحد والبريد.
    let tenant_id = String(body.tenant_id || '').trim();
    if (!tenant_id) {
      const unified = String(body.unified_number || '').trim();
      const email = String(body.contact_email || '').trim();
      if (!unified || !email) return Response.json({ error: 'missing' }, { status: 400 });
      const found = await base44.asServiceRole.entities.Tenant.filter({ unified_number: unified, contact_email: email });
      if (!found || !found.length) return Response.json({ error: 'no_tenant' }, { status: 404 });
      tenant_id = found[0].id;
    }

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