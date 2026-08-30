import React from "react";
import { Crown } from "lucide-react";
import StampSeal from "@/components/docs/StampSeal";
import { PROVIDER } from "@/lib/providerIdentity";
import { computeBreakdown } from "@/lib/pricingBreakdown";

// عقد اشتراك سنوي رسمي بين جدارة (الطرف الأول — موقّع ومختوم) والعميل (الطرف الثاني — خانات توقيع وختم فارغة)
// يُولّد من بيانات عرض السعر، ويُطبع/يُصدّر PDF. RTL، عربي، ابتدائي.
// هيكل صفحتين: الصفحة 1 = الترويسة + الأطراف + المواد 1-5. الصفحة 2 = المواد 6-12 + الإثبات والتوقيعات.
export default function SubscriptionContractDoc({ company = {}, owner = { full_name: "كامل إسماعيل", national_id: "" }, quoteNo = "", date = "", tier = null, quotedAmount = 0, discountPercent = 0, discountCode = "", isRenewal = false }) {
  const cDate = date || new Date().toISOString().slice(0, 10);
  const bd = computeBreakdown({ tier, quotedAmount: quotedAmount || company?.quoted_amount || 0, discountPercent: discountPercent || company?.discount_percent || 0, discountCode: discountCode || company?.discount_code || "", excludeSetup: isRenewal });
  // بنود خاصة بعميل محدّد — تظهر في عقده فقط دون بقية المنشآت
  const isAlMoied = String(company?.unified_number || "") === "7001838478" && String(company?.name || "").includes("معيض");
  const fmt = (d) => {
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d || "—";
      return dt.toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });
    } catch { return d || "—"; }
  };

  return (
    <div dir="rtl" style={{ width: 794, background: "#fff", color: "#0b1120", fontFamily: "var(--font-display), Tajawal, IBM Plex Sans Arabic, sans-serif", padding: "36px 44px", boxSizing: "border-box", fontSize: 12.5, lineHeight: 1.75 }}>
      {/* ===== الصفحة الأولى ===== */}
      <div style={{ minHeight: 1087 }}>
        {/* رأس العقد */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "2px solid #0b1120", paddingBottom: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#0b0f19,#2e2448)", boxShadow: "0 0 0 1px rgba(252,211,77,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Crown size={26} strokeWidth={1.8} style={{ color: "#fbbf24" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)" }}>جدارة</div>
              <div style={{ fontSize: 11, color: "#666" }}>لإدارة الموارد البشرية</div>
              <div style={{ fontWeight: 700, fontSize: 11.5, color: "#0b1120", marginTop: 3 }}>{PROVIDER.institutionName}</div>
              <div style={{ fontSize: 10, color: "#666" }}>الرقم الموحّد: <span style={{ fontFamily: "ui-monospace, monospace" }}>{PROVIDER.unifiedNumber}</span></div>
            </div>
          </div>
          <div style={{ textAlign: "left", fontSize: 12, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0b1120" }}>عقد اشتراك سنوي</div>
            <div style={{ color: "#666" }}>منصة جدارة لإدارة الموارد البشرية</div>
            <div style={{ marginTop: 6 }}>رقم العقد: <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{quoteNo ? quoteNo.replace(/^JQ/, "JC") : "—"}</span></div>
            <div>التاريخ: {fmt(cDate)}</div>
          </div>
        </div>

        {/* عنوان */}
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, margin: "2px 0 12px", fontFamily: "var(--font-display)" }}>
          عقد اشتراك سنوي في منصة «جدارة» لإدارة الموارد البشرية
        </h2>

        {/* التمهيد */}
        <p style={{ margin: "0 0 10px" }}>
          إنه في يوم <b>{fmt(cDate)}</b> الموافق، اتفق الطرفان المذكوران أدناه على إبرام هذا العقد وفقاً للشروط التالية:
        </p>

        {/* الأطراف */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ marginBottom: 10 }}>
            <b>الطرف الأول:</b> {PROVIDER.institutionName} - جدارة لإدارة الموارد البشرية، الرقم الموحّد للمنشآت: <b style={{ fontFamily: "ui-monospace, monospace" }}>{PROVIDER.unifiedNumber}</b>، ويمثلها الأستاذ/ة <b>{PROVIDER.signerName}</b>، بصفته {PROVIDER.signerLabel} لـ{PROVIDER.institutionName}، ممثلاً لمنصة جدارة لإدارة الموارد البشرية. ويُشار إليه فيما يلي بـ«الطرف الأول» أو «الشركة-جدارة».
          </div>
          <div>
            <b>الطرف الثاني:</b> منشأة <b>{company?.name || "—"}</b>
            {company?.contact_name ? <span>، يمثلها الأستاذ/ة <b>{company.contact_name}</b></span> : null}
            {company?.unified_number ? <span>، الرقم الوطني الموحد للمنشآت: <b style={{ fontFamily: "ui-monospace, monospace" }}>{company.unified_number}</b></span> : null}
            {company?.commercial_register ? <span>، السجل التجاري: <b style={{ fontFamily: "ui-monospace, monospace" }}>{company.commercial_register}</b></span> : null}
            {company?.contact_phone ? <span>، هاتف: <b dir="ltr">{company.contact_phone}</b></span> : null}
            {company?.contact_email ? <span>، بريد إلكتروني: <b dir="ltr">{company.contact_email}</b></span> : null}. ويُشار إليه فيما يلي بـ«الطرف الثاني» أو «العميل».
          </div>
        </div>

        {/* ملخّص قيمة العقد — سطور نصية مدمجة لتقليل المساحة */}
        {tier && (() => {
          const num = (n) => Number(n || 0).toLocaleString();
          return (
            <p style={{ margin: "0 0 12px", padding: "8px 12px", background: "#f4f5fd", border: "1px solid #d0d2e8", borderRadius: 8, fontSize: 12, lineHeight: 1.65 }}>
              <b style={{ color: "#2e2a8c" }}>ملخص قيمة العقد: </b>
              الباقة <b>{tier.tier} — {tier.range}</b>
              {company?.employee_count ? <>، عدد الموظفين <b>{company.employee_count} موظفاً</b></> : null}
              ، الاشتراك السنوي <b>{num(bd.baseAnnual)} ر.س</b>
              {bd.hasDiscount ? <>، الخصم{bd.discountCode ? ` — ${bd.discountCode}` : ""}{bd.discountPercent ? ` ${bd.discountPercent}%` : ""} (<b style={{ color: "#dc2626" }}>- {num(bd.discountAmount)} ر.س</b>)</> : null}
              ، صافي الاشتراك السنوي <b>{num(bd.finalAnnual)} ر.س</b>، {isRenewal ? "رسوم التجديد السنوي" : "إجمالي السنة الأولى"} <b style={{ color: "#2e2a8c" }}>{num(bd.totalYear1)} ر.س</b>.
            </p>
          );
        })()}

        {/* البنود */}
        <Clause n="1" title="موضوع العقد ومدته">
          يلتزم الطرف الأول بتقديم اشتراك سنوي في منصة «جدارة» لإدارة الموارد البشرية للطرف الثاني، يشمل تفعيل النظام وتسجيل المنشأة فيه وتوفير كافة ميزات المنصة وفق الباقة السنوية المعتمدة، لقاء رسم الاشتراك السنوي المتفق عليه بين الطرفين. وتكون مدة هذا العقد سنة كاملة 12 شهراً تبدأ من تاريخ تعاقد الطرفين وإبرام هذا العقد وتوقيعه، وتنتهي بانقضاء هذه المدة ما لم يُجدَّد وفقاً للأحكام المنصوص عليها في هذا العقد.
        </Clause>

        <Clause n="2" title="تطوير الخدمات ومراجعة الرسوم السنوية">
          تتطوّر منصة «جدارة» باستمرار بإضافة ميزات جديدة وتحسين الخدمات ورفع فئات الباقات، ونظراً لزيادة القيمة الفعلية للخدمة المُقدَّمة، يحق للطرف الأول مراجعة قيمة الاشتراك السنوي بما يتناسب مع حجم التطور المُضاف، على ألّا تُطبَّق أي زيادة على المدة الجارية من العقد الحالي، وإنما تُحتسب عند التجديد السنوي وفق أحكامه.
        </Clause>

        <Clause n="3" title="تسليم النظام وتفعيله وتدريب المستخدم">
          عند إبرام هذا العقد ودفع رسوم الاشتراك، يلتزم الطرف الأول بتسليم النظام للطرف الثاني، وإتمام تسجيل المنشأة في المنصة، وتفعيل الاشتراك، وتقديم التدريب والتوجيه للشخص المخوّل لدى الطرف الثاني لاستلام النظام وتشغيله، ويقدّم الطرف الأول الدعم المرن عبر الاتصال المرئي Zoom أو بما يتناسب ويُتفق عليه بين الطرفين.
        </Clause>

        <Clause n="4" title="نقل بيانات المنشأة داخل النظام">
          إذا تطلّب نقل بيانات المنشأة كاملة داخل النظام من قِبَل الطرف الأول، فذلك برسوم إضافية يُحدّد باتفاق الطرفين. وإن تولّى الطرف الثاني الترحيل بنفسه، فلا يستحقّ سوى رسوم الاشتراك السنوي دون أي رسوم إضافية.
        </Clause>

        <Clause n="5" title="فترة التجربة والاسترداد">
          يحق للطرف الثاني استخدام النظام لمدة شهر 30 يوماً من تاريخ التفعيل. فإن لم يناسبه النظام خلال هذه المدة جاز له المطالبة برد الرسوم المدفوعة. وبمضي شهر التجربة يُصبح الاشتراك سارياً ونافذاً وفعّالاً، ولا يحق بعدها الاسترداد، ويُلزم الطرف الثاني بالخضوع وتقديم الإمتثال لجميع الجهات النظامية المختصة.
        </Clause>
      </div>

      {/* ===== الصفحة الثانية ===== */}
      <div style={{ minHeight: 1081 }}>
        <Clause n="6" title="التجديد السنوي وإلغاء الاشتراك">
          يتجدد العقد سنوياً بنفس الشروط، وتُحتسب رسوم التجديد وفق القيمة المُعتمدة وقت التجديد كما في المادة 2. ولإلغاء الاشتراك، على الطرف الثاني إشعار الطرف الأول كتابياً قبل انتهاء العقد بستين (60) يوماً على الأقل؛ وإلا تجدد تلقائياً لنفس المدة وبنفس الشروط.
        </Clause>

        <Clause n="7" title="الالتزام بعدد الموظفين وترقية الباقة">
          يلتزم الطرف الثاني بعدد الموظفين المتفق عليه وقدره <b>{company?.employee_count ? `${company.employee_count} موظفاً` : "……… موظفاً"}</b>، ويُسمح بزيادة لا تتجاوز عشرة (10) موظفين. فإن تجاوز العدد الفعلي نطاق باقة أعلى، يحق لجدارة إيقاف الاشتراك وترقية الطرف الثاني إليها مع سداد الفرق، فيُعاد تفعيل المنشأة عند سداده.
        </Clause>

        <Clause n="8" title="الدعم الفني والصيانة">
          في حال مواجهة الطرف الثاني لأي مشاكل تقنية أو خلل في النظام، يلتزم الطرف الأول بتقديم الدعم الفني اللازم لمعالجة الأعطال وإصلاح النظام وضمان استمرارية العمل وفق ما تقتضيه طبيعة المنصة، وتُوجَّه كافة طلبات الدعم الفني عبر البريد الإلكتروني: <b dir="ltr">{PROVIDER.supportEmail}</b>.
        </Clause>

        <Clause n="9" title="إطلاع العميل على المميزات وإقراره بها">
          يُقرّ الطرف الثاني بأنه اطّلع استعراضاً كاملاً على كافة المميزات والوحدات المتوفّرة في منصة «جدارة» قبل إبرام هذا العقد، واقتنع بأنها تلبّي احتياجات منشأته. وبناءً على ذلك لا يحق له الاحتجاج لاحقاً بنقص ميزة أو وظيفة لم تُذكر صراحةً في ملحق بهذا العقد، ويُعدّ توقيعه إقراراً قاطعاً بقبول النظام كما هو وقت التعاقد، وبراءة ذمة الطرف الأول من أي مطالبة تستند إلى نقص مزعوم في المميزات.
        </Clause>

        <Clause n="10" title="نطاق الدعم الفني والطلبات الإضافية">
          يلتزم الطرف الأول بمعالجة أي عطل في النظام ضمن رسوم الاشتراك السنوي. وأي طلبات أو تكاملات إضافية تتجاوز المميزات المعتمدة - كالتكامل مع «مدد» أو «مقيم» أو «Qiwa» - فلا تُعدّ جزءاً منها، وتُحدّد رسومها باتفاق خطي مستقل، ولا يحق للطرف الثاني الامتناع عن سداد الاشتراك بسببها.
        </Clause>

        <Clause n="11" title="الترخيص باستخدام شعار المنشأة لأغراض التحسين التعريفي">
          يوافق الطرف الثاني على أن يحق للطرف الأول (منصة «جدارة») إدراج اسم منشأته وشعارها ضمن قائمة عملائها وفي ملفها التعريفي والمحتوى التسويقي الخاص بها، وذلك لأغراض التحسين من الملف التعريفي لمنصة «جدارة» فقط لا غير. ويُقرّ الطرف الثاني بأن هذا الإدراج لا يُنشئ أي التزام أو مسؤولية أو أثراً قانونياً على منصة «جدارة» من قِبَله، ولا يُعدّ شراكة قانونية أو توكيلاً، وعلى ألّا يشكّل ذلك أي خلل أو التزام أو تعدي قانوني على «جدارة» من قِبَل الطرف الثاني.
        </Clause>

        {isAlMoied && (
          <>
            <Clause n="12" title="الدعم الفني المخصّص للطرف الثاني">
              التزاماً بما ورد في المادتين 8 و10 من هذا العقد، يلتزم الطرف الأول بتقديم الدعم الفني اللازم لمنشأة <b>{company?.name}</b> بكافة ما تتطلّبه تشغيل المنصة لديها ومواكبة احتياجاتها التقنية والفنية، وذلك ضمن نطاق رسوم الاشتراك السنوي المبرم بين الطرفين دون رسوم إضافية على هذا الدعم.
            </Clause>

            <Clause n="13" title="تثبيت قيمة التجديد لسنة">
              يلتزم الطرف الأول بتجديد هذا العقد للطرف الثاني بنفس قيمة الاشتراك السنوي المُتفق عليها في هذا العقد دون أي زيادة، وذلك لمدة سنة من تاريخ انتهاء العقد الحالي. ويشترط لسريان هذا التثبيت ألّا يتجاوز الطرف الثاني عدد الموظفين المخصّص له ضمن الباقة المُشتراة حالياً، فإن تجاوزه سُطبّقت أحكام الترقية وسداد الفرق في رسوم الاشتراك بين الباقتين المنصوص عليها في المادة 7 من هذا العقد.
            </Clause>
          </>
        )}

        <Clause n={isAlMoied ? 14 : 12} title="حل النزاعات">
          أي نزاع ينشأ حول تفسير أو تنفيذ هذا العقد، وتعذّر حله ودياً بين الطرفين، يُحال إلى الجهات النظامية المختصة في المملكة العربية السعودية لفضّه وفقاً للأنظمة المعمول بها.
        </Clause>

        {/* الإثبات */}
        <p style={{ margin: "6px 0 2px", fontSize: 11, color: "#475569" }}>
          إثباتاً لما تقدّم، حُرّر هذا العقد من نسختين أصليتين، وقد وقّع الطرفان أدناه على جميع بنوده وشروطه.
        </p>

        {/* التوقيعات */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginTop: 8 }}>
          {/* الطرف الأول — موقّع ومختوم */}
          <div style={{ flex: 1, maxWidth: 340 }}>
            <div style={{ fontWeight: 800, marginBottom: 6, borderBottom: "1.5px solid #0b1120", paddingBottom: 3, fontSize: 12.5 }}>الطرف الأول - {PROVIDER.institutionName} - جدارة</div>
            <div style={{ position: "relative", height: 58, marginBottom: 4 }}>
              <div style={{ height: 50, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8" }}>مساحة التوقيع</div>
              <div style={{ position: "absolute", top: 0, left: 0, opacity: 0.85, transform: "rotate(-7deg)", transformOrigin: "top left" }}>
                <StampSeal size={86} rotate={0} opacity={1} />
              </div>
            </div>
            <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 4, fontSize: 11.5, lineHeight: 1.5 }}>
              <div><b>الاسم:</b> {PROVIDER.signerName}</div>
              <div><b>{PROVIDER.signerLabel} - {PROVIDER.institutionName}</b></div>
              <div><b>الرقم الموحّد:</b> <span style={{ fontFamily: "ui-monospace, monospace" }}>{PROVIDER.unifiedNumber}</span></div>
              <div><b>التاريخ:</b> {fmt(cDate)}</div>
            </div>
          </div>

          {/* الطرف الثاني — خانات فارغة */}
          <div style={{ flex: 1, maxWidth: 340 }}>
            <div style={{ fontWeight: 800, marginBottom: 6, borderBottom: "1.5px solid #0b1120", paddingBottom: 3, fontSize: 12.5 }}>الطرف الثاني - العميل</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, height: 58, marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>التوقيع</div>
                <div style={{ height: 46, border: "1.5px dashed #94a3b8", borderRadius: 8, background: "#f8fafc" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>الختم</div>
                <div style={{ height: 46, border: "1.5px dashed #94a3b8", borderRadius: 8, background: "#f8fafc" }} />
              </div>
            </div>
            <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 4, fontSize: 11.5, lineHeight: 1.5 }}>
              <div><b>المنشأة:</b> {company?.name || "—"}</div>
              {company?.contact_name ? <div><b>الممثّل:</b> {company.contact_name}</div> : null}
              {company?.unified_number ? <div><b>الرقم الوحّد:</b> <span style={{ fontFamily: "ui-monospace, monospace" }}>{company.unified_number}</span></div> : null}
              <div><b>التاريخ:</b> ....... - ....... - .......... هـ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clause({ n, title, children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontWeight: 800, fontSize: 12.5, marginBottom: 2 }}>
        المادة {n} - {title}:
      </div>
      <p style={{ margin: 0, color: "#1e293b", lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}