import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const report_type = body?.report_type;
    const summary = body?.summary || {};
    if (!report_type) return Response.json({ error: 'report_type required' }, { status: 400 });
    const prompt = buildPrompt(report_type, summary);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "automatic",
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } }
        },
        required: ["summary", "recommendations"]
      }
    });
    return Response.json({ ok: true, insights: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildPrompt(report_type, summary) {
  const data = JSON.stringify(summary, null, 2);
  if (report_type === "exit") {
    return "أنت مستشار موارد بشرية خبير. إليك ملخصاً لمقابلات المغادرة من جداول متغيرات (أسباب المغادرة ومتوسطات الرضا): " + data +
      ". حلّل الأرقام والمتوسطات واستخرج: 1) خلاصة موجزة (summary) تصف الوضع. 2) قائمة توصيات عملية مبنية على البيانات (recommendations) لخفض معدل الدوران وتحسين تجربة الموظف. اكتب بالعربية الفصحى الواضحة، توصيات محددة وقابلة للتنفيذ (3 إلى 6 عناصر). أعد النتيجة حصراً بصيغة JSON وفقاً للمخطط المعطى.";
  }
  if (report_type === "survey") {
    return "أنت مستشار موارد بشرية خبير. إليك خلاصة نتائج الاستبيانات (توزيع الانطباعات ومتوسطات التقييم لكل استبيان): " + data +
      ". حلّل الانطباعات والمتوسطات واستخرج: 1) خلاصة موجزة (summary) للوضع. 2) توصيات عملية لتحسين بيئة العمل ورفع المشاركة والرضا (recommendations، 3 إلى 6 عناصر). اكتب بالعربية الفصحى. أعد النتيجة حصراً بصيغة JSON وفقاً للمخطط المعطى.";
  }
  return "أنت مستشار موارد بشرية خبير. إليك بيانات: " + data + ". استخرج خلاصة (summary) وقائمة توصيات عملية (recommendations) بالعربية الفصحى ضمن JSON وفقاً للمخطط.";
}