import React from "react";
import { Crown } from "lucide-react";

const SIGNATURE_URL = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/b430cd7cf_image.png";

// عقد اشتراك سنوي رسمي بين جدارة (الطرف الأول — موقّع ومختوم) والعميل (الطرف الثاني — خانات توقيع وختم فارغة)
// يُولّد من بيانات عرض السعر، ويُطبع/يُصدّر PDF. RTL، عربي، ابتدائي.
export default function SubscriptionContractDoc({ company = {}, owner = { full_name: "كامل إسماعيل", national_id: "" }, quoteNo = "", date = "" }) {
  const cDate = date || new Date().toISOString().slice(0, 10);
  const fmt = (d) => {
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d || "—";
      return dt.toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });
    } catch { return d || "—"; }
  };

  return (
    <div dir="rtl" style={{ width: 794, minHeight: 1123, background: "#fff", color: "#0b1120", fontFamily: "var(--font-display), Tajawal, IBM Plex Sans Arabic, sans-serif", padding: "40px 44px", boxSizing: "border-box", fontSize: 13, lineHeight: 1.85 }}>
      {/* رأس العقد */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "2px solid #0b1120", paddingBottom: 14, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#0b0f19,#2e2448)", boxShadow: "0 0 0 1px rgba(252,211,77,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Crown size={26} strokeWidth={1.8} style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)" }}>جدارة</div>
            <div style={{ fontSize: 11, color: "#666" }}>لإدارة الموارد البشرية</div>
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
      <h2 style={{ textAlign: "center", fontSize: 19, fontWeight: 800, margin: "4px 0 18px", fontFamily: "var(--font-display)" }}>
        عقد اشتراك سنوي في منصة «جدارة» لإدارة الموارد البشرية
      </h2>

      {/* التمهليد */}
      <p style={{ margin: "0 0 16px" }}>
        إنه في يوم <b>{fmt(cDate)}</b> الموافق، اتفق الطرفان المذكوران أدناه على إبرام هذا العقد وفقاً للشروط التالية:
      </p>

      {/* الأطراف */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ marginBottom: 10 }}>
          <b>الطرف الأول:</b> مؤسسة «جدارة» لإدارة الموارد البشرية، ويمثلها الأستاذ/ة <b>{owner?.full_name || "—"}</b>
          {owner?.national_id ? <span>، يحمل هوية وطنية رقم <b style={{ fontFamily: "ui-monospace, monospace" }}>{owner.national_id}</b></span> : null}. ويُشار إليه فيما يلي بـ«الطرف الأول» أو «جدارة».
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

      {/* البنود */}
      <Clause n="1" title="موضوع العقد">
        يلتزم الطرف الأول بتقديم اشتراك سنوي في منصة «جدارة» لإدارة الموارد البشرية للطرف الثاني، يشمل تفعيل النظام وتسجيل المنشأة فيه وتوفير كافة ميزات المنصة وفق الباقة السنوية المعتمدة، لقاء رسم الاشتراك السنوي المتفق عليه بين الطرفين.
      </Clause>

      <Clause n="2" title="تسليم النظام وتفعيله وتدريب المستخدم">
        عند إبرام هذا العقد ودفع رسوم الاشتراك، يلتزم الطرف الأول بتسليم النظام للطرف الثاني، وإتمام تسجيل المنشأة في المنصة، وتفعيل الاشتراك، وتقديم التدريب والتوجيه للشخص المخوّل لدى الطرف الثاني لاستلام النظام وتشغيله، ويقدّم الطرف الأول الدعم المرن عبر الاتصال المرئي (Zoom) أو بما يتناسب ويُتفق عليه بين الطرفين.
      </Clause>

      <Clause n="3" title="نقل بيانات المنشأة داخل النظام">
        إذا تطلّب الأمر نقل بيانات المنشأة كاملة (الموظفين وغيرها) داخل النظام من قِبَل الطرف الأول، فيكون ذلك برسوم إضافية يُحدّد قيمتها باتفاق الطرفين. أما إذا تولّى الطرف الثاني بنفسه نقل وترحيل بيانات الموظفين والمنشأة داخل النظام، فلا يستحقّ سوى رسوم الاشتراك السنوي المحددة في هذا العقد دون أي رسوم إضافية.
      </Clause>

      <Clause n="4" title="فترة التجربة والاسترداد">
        يحق للطرف الثاني استخدام النظام لمدة شهر (30 يوماً) من تاريخ التفعيل. فإن لم يناسبه النظام خلال هذه المدة جاز له المطالبة برد الرسوم المدفوعة. وبمضي شهر التجربة يُصبح الاشتراك سارياً ونافذاً وفعّالاً، ولا يحق بعدها الاسترداد، ويُلزم الطرف الثاني بالخضوع وتقديم الإمتثال لجميع الجهات النظامية المختصة.
      </Clause>

      <Clause n="5" title="التجديد السنوي وإلغاء الاشتراك">
        يتجدد هذا العقد سنوياً بنفس الشروط والرسوم ولمدة مماثلة. وإذا رغب الطرف الثاني في عدم مواصلة الاشتراك، وجب عليه إشعار الطرف الأول كتابياً قبل انتهاء العقد بستين (60) يوماً على الأقل. وفي حال تبقّي على انتهاء العقد أقل من ستين يوماً دون ورود إشعار الإلغاء، يُعتبر العقد متجدداً تلقائياً لنفس المدة الزمنية وبنفس الشروط.
      </Clause>

      <Clause n="6" title="الدعم الفني والصيانة">
        في حال مواجهة الطرف الثاني لأي مشاكل تقنية أو خلل في النظام، يلتزم الطرف الأول بتقديم الدعم الفني اللازم لمعالجة الأعطال وإصلاح النظام وضمان استمرارية العمل وفق ما تقتضيه طبيعة المنصة.
      </Clause>

      <Clause n="7" title="حل النزاعات">
        أي نزاع ينشأ حول تفسير أو تنفيذ هذا العقد، وتعذّر حله ودياً بين الطرفين، يُحال إلى الجهات النظامية المختصة في المملكة العربية السعودية لفضّه وفقاً للأنظمة المعمول بها.
      </Clause>

      {/* الإثبات */}
      <p style={{ margin: "20px 0 6px", fontSize: 12, color: "#475569" }}>
        إثباتاً لما تقدّم، حُرّر هذا العقد من نسختين أصليتين، وقد وقّع الطرفان أدناه على جميع بنوده وشروطه.
      </p>

      {/* التوقيعات */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 26 }}>
        {/* الطرف الأول — موقّع ومختوم */}
        <div style={{ flex: 1, maxWidth: 340 }}>
          <div style={{ fontWeight: 800, marginBottom: 10, borderBottom: "1.5px solid #0b1120", paddingBottom: 4 }}>الطرف الأول — جدارة</div>
          <div style={{ position: "relative", height: 96, marginBottom: 6 }}>
            <img src={SIGNATURE_URL} crossOrigin="anonymous" alt="توقيع" style={{ height: 86, objectFit: "contain", display: "block", marginTop: 4 }} />
            <div style={{ position: "absolute", top: 0, left: 0, opacity: 0.85, transform: "rotate(-7deg)", transformOrigin: "top left" }}>
              <Stamp label="جدارة لإدارة الموارد البشرية" />
            </div>
          </div>
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 12, lineHeight: 1.9 }}>
            <div><b>الاسم:</b> {owner?.full_name || "—"}</div>
            {owner?.national_id ? <div><b>الهوية الوطنية:</b> <span style={{ fontFamily: "ui-monospace, monospace" }}>{owner.national_id}</span></div> : null}
            <div><b>الممثّل النظامي لمؤسسة جدارة</b></div>
            <div><b>التاريخ:</b> {fmt(cDate)}</div>
          </div>
        </div>

        {/* الطرف الثاني — خانات فارغة */}
        <div style={{ flex: 1, maxWidth: 340 }}>
          <div style={{ fontWeight: 800, marginBottom: 10, borderBottom: "1.5px solid #0b1120", paddingBottom: 4 }}>الطرف الثاني — العميل</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, height: 96, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>التوقيع</div>
              <div style={{ height: 78, border: "1.5px dashed #94a3b8", borderRadius: 10, background: "#f8fafc" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>الختم</div>
              <div style={{ height: 78, border: "1.5px dashed #94a3b8", borderRadius: 10, background: "#f8fafc" }} />
            </div>
          </div>
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 12, lineHeight: 1.9 }}>
            <div><b>المنشأة:</b> {company?.name || "—"}</div>
            {company?.contact_name ? <div><b>الممثّل:</b> {company.contact_name}</div> : null}
            {company?.unified_number ? <div><b>الرقم الموحد:</b> <span style={{ fontFamily: "ui-monospace, monospace" }}>{company.unified_number}</span></div> : null}
            <div><b>التاريخ:</b> ......./......./.......... هـ</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clause({ n, title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 4 }}>
        المادة ({n}) — {title}:
      </div>
      <p style={{ margin: 0, color: "#1e293b" }}>{children}</p>
    </div>
  );
}

function Stamp({ label }) {
  return (
    <svg viewBox="0 0 200 200" width={104} height={104} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="ctrTop" d="M 100,100 m -74,0 a 74,74 0 1,1 148,0" fill="none" />
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke="#1A237E" strokeWidth="3" />
      <circle cx="100" cy="100" r="84" fill="none" stroke="#1A237E" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="46" fill="none" stroke="#1A237E" strokeWidth="1.6" />
      <text fill="#1A237E" fontSize="15" fontWeight="700" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">
        <textPath href="#ctrTop" startOffset="50%" textAnchor="middle">{label}</textPath>
      </text>
      <text x="100" y="98" textAnchor="middle" fill="#1A237E" fontSize="22" fontWeight="800" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">جدارة</text>
      <text x="100" y="118" textAnchor="middle" fill="#1A237E" fontSize="9" fontWeight="600" fontFamily="sans-serif">JADARA HR</text>
      <text x="100" y="132" textAnchor="middle" fill="#1A237E" fontSize="14">✦</text>
    </svg>
  );
}