// استبيانات تجربة العميل — يقرأ استبياناً نشطاً بشكل عام (قبل تسجيل الدخول).
// يُرجع الحقول العامة فقط (العنوان، الوصف، الأسئلة) دون كشف أي بيانات حساسة.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    let body = {};
    try { body = await req.json(); } catch {}
    const id = String(body.survey_id || '').trim();
    if (!id) return Response.json({ ok: false });

    const base44 = createClientFromRequest(req);
    const s = await base44.asServiceRole.entities.CustomerSurvey.get(id).catch(() => null);
    if (!s) return Response.json({ ok: false, not_found: true });
    if (s.status !== 'active') return Response.json({ ok: false, closed: true });

    let questions = [];
    try { questions = JSON.parse(s.questions || '[]'); } catch {}
    return Response.json({
      ok: true,
      survey: {
        id: s.id,
        title: s.title,
        description: s.description || '',
        questions: Array.isArray(questions) ? questions : [],
        responses_count: s.responses_count || 0,
      },
    });
  } catch {
    return Response.json({ ok: false });
  }
}