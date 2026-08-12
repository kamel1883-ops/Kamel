import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyToken } from "../../shared/portalToken.ts";

// مساعد بوابة الموظف الذاتية — مرشد إرشادي فقط.
// يتحقق من جلسة الموظف، ثم يوجّهه كيف يستخدم البوابة بنفسه (أين يطلب، أي زر، كيف يملأ،
// كيف يتابع، كيف يطبع). لا ينفذ أي إجراء ولا يجلب بيانات — إرشاد صرف.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.token || "");
    const employeeId = String(body.employee_id || "");
    const message = String(body.message || "").trim();
    const history: any[] = Array.isArray(body.history) ? body.history.slice(-10) : [];
    const lang = String(body.lang || "ar").slice(0, 5);
    const LANG_NAME: Record<string, string> = { ar: "العربية الفصحى", en: "English", hi: "हिन्दी", ne: "नेपाली", bn: "বांलা", fil: "Filipino", ur: "اردو" };
    const langName = LANG_NAME[lang] || "العربية الفصحى";
    if (!token || !employeeId || !message)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });

    const session = await verifyToken(token);
    if (!session.ok || session.employeeId !== employeeId)
      return Response.json({ ok: false, error: "invalid_session" }, { status: 401 });

    const sys =
      "أنت «مساعد جدارة» للموظف داخل البوابة الذاتية. مهمتك الإرشاد والتوجيه فقط — تشرح للموظف كيف ينجز خدمته بنفسه عبر أزرار وصفحات البوابة. لست مفوّضاً بتنفيذ أي إجراء (لا إنشاء طلب، لا تعديل، لا اعتماد، لا حذف، لا جلب بيانات) نيابة عنه.\n\nقواعد صارمة:\n- لا تخترع بيانات أو أرقاماً. لا تدّعِ معرفة رصيده أو حالة طلباته؛ بدلاً من ذلك أرشده إلى مكانها في البوابة ليراها بنفسه.\n- حين يطلب إنشاء إجازة/سلفة/انتداب أو تعديل بياناته، اشرح له الخطوات ليفعلها بنفسه (أي زر، أي خانات، ما يحدث بعدها). لا تتنفّذ عنه.\n- حين يسأل عن رصيده أو حالة طلباته، أرشده إلى البطاقة/القائمة المعنية في البوابة (مثلاً: «رصيد إجازاتك يظهر في بطاقة الرصيد أعلى الصفحة» — دون ذكر رقم).\n- لا تطلب معلومات حساسة (كلمة مرور، رموز تحقق، حساب بنكي).\n- كن مختصراً وودوداً، بالعربية الفصحى البسيطة.\n\nخريطة بوابة الموظف الذاتية التي تُرشد إليها:\n- الدخول: بالهوية الوطنية + تاريخ الميلاد.\n- أعلى الصفحة: بطاقات رصيد الإجازات وملخّص الحالة.\n- تسجيل الحضور: زر «تسجيل الدخول/الخروج» (بصمة الموقع) — يظهر آخر تسجيل.\n- طلب جديد: زر «طلب جديد» في كل قسم (إجازة/سلفة/انتداب) —— يفتح نموذجاً تملأه (النوع، التواريخ، السبب، المرفقات إن لزم) ثم ترسله.\n- متابعة الطلبات: قائمة الطلبات في كل قسم تعرض الحالة (بانتظار المدير/الموارد/المالية/مكتمل/مرفوض).\n- الأداء: قسم «تقييمات الأداء» لعرض آخر تقييم.\n- التدريب: قسم «خطط التدريب» لمتابعة الخطة المخصصة.\n- المستندات: قسم «المستندات» لعرض المخالصات ومستندات نهاية الخدمة بعد اعتمادها.\n- الخروج: زر «تسجيل الخروج» للخروج من البوابة.\n\nمهم جداً: أجب دائماً بلغة " + langName + " فقط، مهما كانت لغة رسالة المستخدم — أي رد يجب أن يكون بهذه اللغة.";

    const msgs = [
      { role: "system", content: sys },
      ...history.map((h) => ({ role: h.role === "user" ? "user" : "assistant", content: String(h.content) })),
      { role: "user", content: message },
    ];

    const { baseURL, token: gtoken } = base44.asServiceRole.aiGateway.connection();
    const r = await fetch(baseURL + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + gtoken },
      body: JSON.stringify({ model: "automatic", messages: msgs, temperature: 0.3, max_tokens: 700 }),
    });
    if (!r.ok) return Response.json({ ok: false, error: "llm_failed" }, { status: 502 });
    const j = await r.json();
    const reply = (j?.choices?.[0]?.message?.content || "").trim() || "عذراً، لم أتمكن من صياغة الرد الآن. حاول مرة أخرى.";

    return Response.json({ ok: true, reply });
  } catch (e) {
    return Response.json({ ok: false, error: String((e as any)?.message || e) }, { status: 500 });
  }
}