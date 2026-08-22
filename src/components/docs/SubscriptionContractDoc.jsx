import React from "react";
import { Crown } from "lucide-react";
import StampSeal from "@/components/docs/StampSeal";
import { PROVIDER } from "@/lib/providerIdentity";
import { computeBreakdown } from "@/lib/pricingBreakdown";

// عقد اشتراك سنوي رسمي بين جدارة (الطرف الأول — موقّع ومختوم) والعميل (الطرف الثاني — خانات توقيع وختم فارغة)
// يُولّد من بيانات عرض السعر، ويُطبع/يُصدّر PDF. RTL، عربي، ابتدائي.
// هيكل صفحتين: الصفحة 1 = الترويسة + الأطراف + المواد 1-5. الصفحة 2 = المواد 6-11 + الإثبات والتوقيعات.
export default function SubscriptionContractDoc({ company = {}, owner = { full_name: "كامل إسماعيل", national_id: "" }, quoteNo = "", date = "", tier = null, quotedAmount = 0, discountPercent = 0, discountCode = "", isRenewal = false }) {
  const cDate = date || new Date().toISOString().slice(0, 10);
  const bd = computeBreakdown({ tier, quotedAmount: quotedAmount || company?.quoted_amount || 0, discountPercent: discountPercent || company?.discount_percent || 0, discountCode: discountCode || company?.discount_code || "", excludeSetup: isRenewal });
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

        {/* ملخّص قيمة العقد */}
        {tier && (() => {
          const num = (n) => Number(n || 0).toLocaleString();
          const Row = ({ k, v, color }) => (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ color: "#64748b" }}>{k}</span>
              <span style={{ fontWeight: 700, color: color || "#0b1120" }}>{v}</span>
            </div>
          );
          return (
            <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#3730a3", marginBottom: 8 }}>ملخّص قيمة العقد</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 24px", fontSize: 12, lineHeight: 1.7 }}>
                <Row k="الباقة" v={`${tier.tier} — ${tier.range}`} />
                <Row k="عدد الموظفين" v={company?.employee_count ? `${company.employee_count} موظفاً` : "—"} />
                <Row k="الاشتراك السنوي" v={`${num(bd.baseAnnual)} ر.س`} />
                {bd.hasDiscount ? <Row k={`الخصم${bd.discountCode ? ` — ${bd.discountCode}` : ""}${bd.discountPercent ? ` ${bd.discountPercent}%` : ""}`} v={`- ${num(bd.discountAmount)} ر.س`} color="#dc2626" /> : <span />}
                <Row k="صافي الاشتراك السنوي" v={`${num(bd.finalAnnual)} ر.س`} />
                <div style={{ gridColumn: "1 / -1", borderTop: "1px dashed #c7d2fe", marginTop: 4, paddingTop: 6, display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#1A237E", fontSize: 13 }}>
                  <span>{isRenewal ? "رسوم التجديد السنوي" : "إجمالي السنة الأولى"}</span>
                  <span>{num(bd.totalYear1)} ر.س</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* البنود */}
        <Clause n="1" title="موضوع العقد ومدته">
          يلتزم الطرف الأول بتقديم اشتراك سنوي في منصة «جدارة» لإدارة الموارد البشرية للطرف الثاني، يشمل تفعيل النظام وتسجيل المنشأة فيه وتوفير كافة ميزات المنصة وفق الباقة السنوية المعتمدة، لقاء رسم الاشتراك السنوي المتفق عليه بين الطرفين. وتكون مدة هذا العقد سنة كاملة 12 شهراً تبدأ من تاريخ تعاقد الطرفين وإبرام هذا العقد وتوقيعه، وتنتهي بانقضاء هذه المدة ما لم يُجدَّد وفقاً للأحكام المنصوص عليها في هذا العقد.
        </Clause>

        <Clause n="2" title="تطوير الخدمات ومراجعة الرسوم السنوية">
          تخضع منصة «جدارة» لتطورات وتحسينات مستمرة في برمجياتها وخدماتها واشتراكاتها، قد يشمل ذلك إضافة ميزات جديدة داخل البرنامج، ورفع فئات وشرائح الباقات، وتوسيع نطاق الخدمات المقدّمة وتحسينها. ونظراً لما يترتب على ذلك من زيادة في القيمة الفعلية للخدمة المُقدَّمة، فإن قيمة الاشتراك السنوي لا تُعدّ رسماً ثابتاً لا يتغير، ولا تقتصر مراجعتها على تغيرات طفيفة في الأسعار فقط، بل يحق للطرف الأول مراجعة قيمة الاشتراك السنوي بما يتناسب مع حجم التطور والتحسينات المُضافة، على ألّا تُطبَّق أي زيادة على المدة الجارية من العقد الحالي، وإنما تُحتسب عند التجديد السنوي وفق أحكام التجديد المبيَّنة في هذا العقد.
        </Clause>

        <Clause n="3" title="تسليم النظام وتفعيله وتدريب المستخدم">
          عند إبرام هذا العقد ودفع رسوم الاشتراك، يلتزم الطرف الأول بتسليم النظام للطرف الثاني، وإتمام تسجيل المنشأة في المنصة، وتفعيل الاشتراك، وتقديم التدريب والتوجيه للشخص المخوّل لدى الطرف الثاني لاستلام النظام وتشغيله، ويقدّم الطرف الأول الدعم المرن عبر الاتصال المرئي Zoom أو بما يتناسب ويُتفق عليه بين الطرفين.
        </Clause>

        <Clause n="4" title="نقل بيانات المنشأة داخل النظام">
          إذا تطلّب الأمر نقل بيانات المنشأة كاملة - الموظفين وغيرها - داخل النظام من قِبَل الطرف الأول، فيكون ذلك برسوم إضافية يُحدّد قيمتها باتفاق الطرفين. أما إذا تولّى الطرف الثاني بنفسه نقل وترحيل بيانات الموظفين والمنشأة داخل النظام، فلا يستحقّ سوى رسوم الاشتراك السنوي المحددة في هذا العقد دون أي رسوم إضافية.
        </Clause>

        <Clause n="5" title="فترة التجربة والاسترداد">
          يحق للطرف الثاني استخدام النظام لمدة شهر 30 يوماً من تاريخ التفعيل. فإن لم يناسبه النظام خلال هذه المدة جاز له المطالبة برد الرسوم المدفوعة. وبمضي شهر التجربة يُصبح الاشتراك سارياً ونافذاً وفعّالاً، ولا يحق بعدها الاسترداد، ويُلزم الطرف الثاني بالخضوع وتقديم الإمتثال لجميع الجهات النظامية المختصة.
        </Clause>
      </div>

      {/* ===== الصفحة الثانية ===== */}
      <div style={{ minHeight: 1081 }}>
        <Clause n="6" title="التجديد السنوي وإلغاء الاشتراك">
          يتجدد هذا العقد سنوياً بنفس الشروط ولمدة مماثلة، وتُحتسب رسوم التجديد وفق القيمة السنوية المُعتمدة وقت التجديد كما هو مبيَّن في المادة 2 من هذا العقد - تطوير الخدمات ومراجعة الرسوم السنوية. وإذا رغب الطرف الثاني في عدم مواصلة الاشتراك، وجب عليه إشعار الطرف الأول كتابياً قبل انتهاء العقد بستين 60 يوماً على الأقل. وفي حال تبقّي على انتهاء العقد أقل من ستين يوماً دون ورود إشعار الإلغاء، يُعتبر العقد متجدداً تلقائياً لنفس المدة الزمنية وبنفس الشروط.
        </Clause>

        <Clause n="7" title="الالتزام بعدد الموظفين وترقية الباقة">
          يلتزم الطرف الثاني بعدد الموظفين المُتفق عليه في عرض السعر وقدره <b>{company?.employee_count ? `${company.employee_count} موظفاً` : "……… موظفاً"}</b>. ويُسمح للطرف الثاني بزيادة لا تتجاوز عشرة 10 موظفين إضافيين عن العدد المُتفق عليه دون أي ترتيب أثَر. أمّا إذا تجاوزت الزيادة هذا الحد بأن وقع عدد موظفي المنشأة فعلياً ضمن نطاق باقة أعلى من الباقة المُتفق عليها، فيحق لمنصة «جدارة» إيقاف الاشتراك مؤقتاً، وترقية الطرف الثاني إلى الباقة الفعلية التي يقع ضمن نطاقها عدد موظفي المنشأة، وعلى الطرف الثاني سداد الفرق في رسوم الاشتراك بين الباقتين، وعند سداد الفرق يُعاد تفعيل المنشأة في النظام مرّة أخرى.
        </Clause>

        <Clause n="8" title="الدعم الفني والصيانة">
          في حال مواجهة الطرف الثاني لأي مشاكل تقنية أو خلل في النظام، يلتزم الطرف الأول بتقديم الدعم الفني اللازم لمعالجة الأعطال وإصلاح النظام وضمان استمرارية العمل وفق ما تقتضيه طبيعة المنصة.
        </Clause>

        <Clause n="9" title="إطلاع العميل على المميزات وإقراره بها">
          يُقرّ الطرف الثاني بأنه على عِلمٍ واضحٍ وتامٍّ بكافة المميزات والأبواب والوحدات المتوفّرة في منصة «جدارة» لإدارة الموارد البشرية، وأنه قد اطّلع عليها استعراضاً كاملاً، وفصّلها واطّلع على مميزاتها ووظائفها بالتفصيل قبل إبرام هذا العقد، واقتنع بأنها تلبّي احتياجات منشأته وتمثّل القيمة المتفق عليها لقاء رسم الاشتراك السنوي. وبناءً على ذلك، لا يحق للطرف الثاني الاحتجاج لاحقاً - بعد توقيعه على هذا العقد وبدء تفعيل الاشتراك - بأن النظام ناقص ميزة محددة، أو لا يحتوي على القدرة الفلانية، أو يفتقر إلى وظيفة بعينها، أو لا توجد فيه الميزة الفلانية، طالما أن تلك المميزات لم تكن مدرجة صراحةً في ملحق أو اتفاق إضافي ملحق بهذا العقد. ويعدّ توقيع الطرف الثاني على هذا العقد إقراراً قاطعاً بقبوله للنظام بكامل وحداته ومميزاته على ما هي عليه وقت التعاقد، وبراءة ذمة الطرف الأول من أي مطالبة لاحقة تستند إلى نقص مزعوم في المميزات.
        </Clause>

        <Clause n="10" title="نطاق الدعم الفني والطلبات الإضافية">
          يلتزم الطرف الأول بتقديم الدعم الفني لمعالجة أي عطل أو خلل في النظام، بما في ذلك بوابة المنشأة وبوابة الموظفين، وذلك ضمن نطاق رسوم الاشتراك السنوي. وأي طلبات أو تكاملات أو تخصيصات إضافية تتجاوز المميزات المعتمدة في الباقة - كالتكامل مع «مدد» أو «مقيم» أو «Qiwa» أو غيرها - فلا تُعدّ جزءاً من رسوم الاشتراك السنوي، وتُحدّد رسومها وطريقة احتسابها باتفاق خطي مستقل بين الطرفين، ولا يحق للطرف الثاني الامتناع عن سداد رسم الاشتراك السنوي بحجة عدم تنفيذ طلب إضافي من هذا القبيل.
        </Clause>

        <Clause n="11" title="حل النزاعات">
          أي نزاع ينشأ حول تفسير أو تنفيذ هذا العقد، وتعذّر حله ودياً بين الطرفين، يُحال إلى الجهات النظامية المختصة في المملكة العربية السعودية لفضّه وفقاً للأنظمة المعمول بها.
        </Clause>

        {/* الإثبات */}
        <p style={{ margin: "10px 0 4px", fontSize: 11.5, color: "#475569" }}>
          إثباتاً لما تقدّم، حُرّر هذا العقد من نسختين أصليتين، وقد وقّع الطرفان أدناه على جميع بنوده وشروطه.
        </p>

        {/* التوقيعات */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 14 }}>
          {/* الطرف الأول — موقّع ومختوم */}
          <div style={{ flex: 1, maxWidth: 340 }}>
            <div style={{ fontWeight: 800, marginBottom: 10, borderBottom: "1.5px solid #0b1120", paddingBottom: 4 }}>الطرف الأول - {PROVIDER.institutionName} - جدارة</div>
            <div style={{ position: "relative", height: 80, marginBottom: 6 }}>
              <div style={{ height: 70, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#94a3b8" }}>مساحة التوقيع</div>
              <div style={{ position: "absolute", top: 0, left: 0, opacity: 0.85, transform: "rotate(-7deg)", transformOrigin: "top left" }}>
                <StampSeal size={104} rotate={0} opacity={1} />
              </div>
            </div>
            <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 12, lineHeight: 1.9 }}>
              <div><b>الاسم:</b> {PROVIDER.signerName}</div>
              <div><b>{PROVIDER.signerLabel} - {PROVIDER.institutionName}</b></div>
              <div><b>الرقم الموحّد:</b> <span style={{ fontFamily: "ui-monospace, monospace" }}>{PROVIDER.unifiedNumber}</span></div>
              <div><b>التاريخ:</b> {fmt(cDate)}</div>
            </div>
          </div>

          {/* الطرف الثاني — خانات فارغة */}
          <div style={{ flex: 1, maxWidth: 340 }}>
            <div style={{ fontWeight: 800, marginBottom: 10, borderBottom: "1.5px solid #0b1120", paddingBottom: 4 }}>الطرف الثاني - العميل</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, height: 80, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>التوقيع</div>
                <div style={{ height: 64, border: "1.5px dashed #94a3b8", borderRadius: 10, background: "#f8fafc" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>الختم</div>
                <div style={{ height: 64, border: "1.5px dashed #94a3b8", borderRadius: 10, background: "#f8fafc" }} />
              </div>
            </div>
            <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 12, lineHeight: 1.9 }}>
              <div><b>المنشأة:</b> {company?.name || "—"}</div>
              {company?.contact_name ? <div><b>الممثّل:</b> {company.contact_name}</div> : null}
              {company?.unified_number ? <div><b>الرقم الموحد:</b> <span style={{ fontFamily: "ui-monospace, monospace" }}>{company.unified_number}</span></div> : null}
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
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 3 }}>
        المادة {n} - {title}:
      </div>
      <p style={{ margin: 0, color: "#1e293b" }}>{children}</p>
    </div>
  );
}