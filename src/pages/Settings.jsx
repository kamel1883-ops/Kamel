import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Loader2, Building2, Save, Crosshair, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const empty = {
  name: "", industry: "", contact_name: "", contact_phone: "", unified_number: "", contact_email: "",
  vat_number: "", city: "", country: "المملكة العربية السعودية",
  logo_url: "",
  annual_leave_days: 21, ticket_policy: "yearly",
  eos_basis: "gross",
  gosi_saudi_employee_rate: 9.75, gosi_saudi_employer_rate: 9.75, gosi_expat_employer_rate: 2,
  work_week_hours: 48, work_week_days: 6, late_grace_minutes: 15,
  work_start_time: "08:00", work_end_time: "17:00", work_hours_per_day: 9,
  absence_deduction_type: "monthly_divided",
  workplace_lat: "", workplace_lng: "", workplace_radius: 50,
};

export default function SettingsPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "إعدادات المنشأة", subtitle: "بيانات المنشأة والسياسات المواردية", loading: "جارٍ التحميل...",
    secOrg: "بيانات المنشأة", secOrgNote: "مجلوبة من طلب عرض السعر / التفعيل — يمكنك تعديلها وستُحفظ لمنشأتك.",
    secSub: "بيانات الاشتراك", subCount: "عدد الموظفين", subTier: "الشريحة", subPrice: "السعر السنوي للباقة (ر.س)", subStatus: "الحالة",
    name: "اسم المنشأة", industry: "القطاع / النشاط", responsible: "اسم الشخص المسؤول",
    phone: "الهاتف", unified: "الرقم الموحد (يبدأ بـ7)", email: "البريد الإلكتروني",
    vat: "الرقم الضريبي", city: "المدينة",
    secLeave: "سياسات الإجازات والتذاكر", annualDays: "أيام الإجازة السنوية", ticketPolicy: "سياسة التذاكر",
    yearly: "سنوية", biennial: "كل سنتين", none: "بدون",
    secEos: "إعدادات نهاية الخدمة والتأمينات", eosBasis: "أساس حساب نهاية الخدمة",
    gross: "الراتب الإجمالي (أساسي + بدلات)", baseOnly: "الراتب الأساسي فقط",
    gosiEmp: "نسبة تأمين الموظف السعودي %", gosiErSa: "نسبة تأمين صاحب العمل (سعودي) %", gosiErEx: "نسبة تأمين صاحب العمل (مقيم) %",
    secAtt: "إعدادات الحضور والدوام", weekHours: "ساعات العمل الأسبوعية", weekDays: "أيام العمل الأسبوعية", grace: "سماح التأخير (دقيقة)",
    dayStart: "بداية الدوام", dayEnd: "نهاية الدوام", dayHours: "ساعات العمل اليومية المطلوبة (تتخللها فترة راحة)",
    absType: "طريقة خصم الغياب", monthlyDiv: "الراتب الشهري ÷ 30 لليوم", dailyWage: "الأجر اليومي",
    secLoc: "موقع مقر العمل (للبصمة)", lat: "خط العرض", lng: "خط الطول", radius: "نطاق البصمة (متر)", capture: "تحديد موقعي الحالي",
    locNote: (r) => `سيُسمح للموظف بالبصمة فقط ضمن ${r || 50} متر من هذا الموقع.`,
    save: "حفظ الإعدادات",
    noGeo: "الجهاز لا يدعم تحديد الموقع", noAccess: "تعذر الوصول إلى موقعك",
    delSec: "منطقة الخطر", delTitle: "حذف الحساب", delDesc: "طلب حذف حساب المنشأة وبياناتها. سيتم مراجعة الطلب والتواصل معك لإتمام الحذف.",
    delBtn: "طلب حذف الحساب", delConfirm: "تأكيد طلب الحذف", delCancel: "إلغاء", delWarn: "لا يمكن التراجع عن هذه العملية.",
    delSuccess: "تم استلام طلب حذف الحساب بنجاح، سيتواصل معك فريق الدعم.",
  } : {
    title: "Organization settings", subtitle: "Organization data and HR policies", loading: "Loading...",
    secOrg: "Organization data", secOrgNote: "Pulled from your quote / activation request — edit to save them to your organization.",
    secSub: "Subscription data", subCount: "Employees count", subTier: "Tier", subPrice: "Annual package price (SAR)", subStatus: "Status",
    name: "Organization name", industry: "Sector / Activity", responsible: "Responsible person",
    phone: "Phone", unified: "Unified number (starts with 7)", email: "Email",
    vat: "VAT number", city: "City",
    secLeave: "Leave & ticket policies", annualDays: "Annual leave days", ticketPolicy: "Ticket policy",
    yearly: "Yearly", biennial: "Biennial", none: "None",
    secEos: "EOS & GOSI settings", eosBasis: "EOS calculation basis",
    gross: "Gross salary (base + allowances)", baseOnly: "Base salary only",
    gosiEmp: "Saudi employee GOSI rate %", gosiErSa: "Employer GOSI (Saudi) %", gosiErEx: "Employer GOSI (Expat) %",
    secAtt: "Attendance & working time", weekHours: "Weekly working hours", weekDays: "Weekly working days", grace: "Late grace (minutes)",
    dayStart: "Daily start time", dayEnd: "Daily end time", dayHours: "Required daily work hours (including a break period)",
    absType: "Absence deduction method", monthlyDiv: "Monthly salary ÷ 30 per day", dailyWage: "Daily wage",
    secLoc: "Workplace location (for check‑in)", lat: "Latitude", lng: "Longitude", radius: "Check‑in radius (m)", capture: "Set my current location",
    locNote: (r) => `Employees may check in only within ${r || 50} m of this location.`,
    save: "Save settings",
    noGeo: "Device does not support geolocation", noAccess: "Could not access your location",
    delSec: "Danger zone", delTitle: "Account deletion", delDesc: "Request deletion of your account and its data. The request will be reviewed and support will contact you to complete it.",
    delBtn: "Request account deletion", delConfirm: "Confirm deletion request", delCancel: "Cancel", delWarn: "This action cannot be undone.",
    delSuccess: "Account deletion request received — our support team will contact you.",
  };

  const [org, setOrg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subInfo, setSubInfo] = useState(null);

  useEffect(() => {
    (async () => {
      let orgData = empty;
      try {
        const list = await base44.entities.Organization.list("-created_date", 1);
        if (list && list[0]) orgData = { ...empty, ...list[0] };
      } catch (_) {}
      // بيانات الاشتراك تُجلب دائماً من المنشأة (Tenant) — تُعرض للعميل للقراءة فقط
      try {
        const res = await base44.functions.invoke("getMyTenant");
        const tt = res?.data?.tenant;
        if (tt) {
          setSubInfo({
            employee_count: tt.employee_count || 0,
            pricing_tier: tt.pricing_tier || '',
            quoted_amount: tt.quoted_amount || 0,
            status: tt.status || '',
          });
          // تعبئة قبلية ببيانات المنشأة فقط إن لم تُحفظ بعد
          if (!orgData.name) {
            orgData = {
              ...orgData,
              name: tt.name || orgData.name,
              industry: tt.industry || orgData.industry,
              contact_name: tt.contact_name || orgData.contact_name,
              contact_phone: tt.contact_phone || orgData.contact_phone,
              unified_number: tt.unified_number || orgData.unified_number,
              contact_email: tt.contact_email || orgData.contact_email,
              vat_number: tt.vat_number || orgData.vat_number,
              city: tt.city || orgData.city,
              country: tt.country || orgData.country,
            };
          }
        }
      } catch (_) {}
      setOrg(orgData);
      setLoading(false);
    })();
  }, []);

  const set = (k, v) => setOrg((o) => ({ ...o, [k]: v }));

  const captureLocation = () => {
    if (!navigator.geolocation) { alert(t.noGeo); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { set("workplace_lat", Number(pos.coords.latitude.toFixed(6))); set("workplace_lng", Number(pos.coords.longitude.toFixed(6))); },
      () => alert(t.noAccess),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...org };
      payload.workplace_lat = payload.workplace_lat === "" || payload.workplace_lat === null ? null : Number(payload.workplace_lat);
      payload.workplace_lng = payload.workplace_lng === "" || payload.workplace_lng === null ? null : Number(payload.workplace_lng);
      if (org.id) { await base44.entities.Organization.update(org.id, payload); }
      else { const created = await base44.entities.Organization.create(payload); setOrg({ ...org, ...created }); }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">{t.loading}</div>;

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <div className="max-w-3xl space-y-6">
        {subInfo && (subInfo.employee_count > 0 || subInfo.quoted_amount > 0) && (
          <Section title={t.secSub} icon={Wallet}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label={t.subCount}><div className="text-sm font-semibold px-3 py-2 rounded-md bg-muted">{subInfo.employee_count || "—"}</div></Field>
              <Field label={t.subTier}><div className="text-sm font-semibold px-3 py-2 rounded-md bg-muted truncate" title={subInfo.pricing_tier}>{subInfo.pricing_tier || "—"}</div></Field>
              <Field label={t.subPrice}><div className="text-sm font-semibold px-3 py-2 rounded-md bg-muted">{subInfo.quoted_amount ? subInfo.quoted_amount.toLocaleString() : "—"}</div></Field>
              <Field label={t.subStatus}><div className="text-sm font-semibold px-3 py-2 rounded-md bg-muted">{subInfo.status || "—"}</div></Field>
            </div>
          </Section>
        )}
        <Section title={t.secOrg} icon={Building2}>
          <p className="text-xs text-muted-foreground -mt-1">{t.secOrgNote}</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.name}><Input value={org.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label={t.industry}><Input value={org.industry} onChange={(e) => set("industry", e.target.value)} /></Field>
            <Field label={t.city}><Input value={org.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label={t.responsible}><Input value={org.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></Field>
            <Field label={t.phone}><Input value={org.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} dir="ltr" /></Field>
            <Field label={t.unified}><Input value={org.unified_number} onChange={(e) => set("unified_number", e.target.value.replace(/\D/g, ""))} dir="ltr" /></Field>
            <Field label={t.email}><Input type="email" value={org.contact_email} onChange={(e) => set("contact_email", e.target.value)} dir="ltr" /></Field>
            <Field label={t.vat}><Input value={org.vat_number} onChange={(e) => set("vat_number", e.target.value)} dir="ltr" /></Field>
          </div>
        </Section>

        <Card>
          <SectionTitle title={t.secLeave} />
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.annualDays}><Input type="number" value={org.annual_leave_days} onChange={(e) => set("annual_leave_days", Number(e.target.value))} /></Field>
            <Field label={t.ticketPolicy}>
              <Select value={org.ticket_policy} onValueChange={(v) => set("ticket_policy", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">{t.yearly}</SelectItem>
                  <SelectItem value="biennial">{t.biennial}</SelectItem>
                  <SelectItem value="none">{t.none}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <SectionTitle title={t.secEos} />
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.eosBasis}>
              <Select value={org.eos_basis} onValueChange={(v) => set("eos_basis", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross">{t.gross}</SelectItem>
                  <SelectItem value="base_only">{t.baseOnly}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t.gosiEmp}><Input type="number" step="0.01" value={org.gosi_saudi_employee_rate} onChange={(e) => set("gosi_saudi_employee_rate", Number(e.target.value))} /></Field>
            <Field label={t.gosiErSa}><Input type="number" step="0.01" value={org.gosi_saudi_employer_rate} onChange={(e) => set("gosi_saudi_employer_rate", Number(e.target.value))} /></Field>
            <Field label={t.gosiErEx}><Input type="number" step="0.01" value={org.gosi_expat_employer_rate} onChange={(e) => set("gosi_expat_employer_rate", Number(e.target.value))} /></Field>
          </div>
        </Card>

        <Card>
          <SectionTitle title={t.secAtt} />
          <div className="grid grid-cols-3 gap-4">
            <Field label={t.weekHours}><Input type="number" value={org.work_week_hours} onChange={(e) => set("work_week_hours", Number(e.target.value))} /></Field>
            <Field label={t.weekDays}><Input type="number" value={org.work_week_days} onChange={(e) => set("work_week_days", Number(e.target.value))} /></Field>
            <Field label={t.grace}><Input type="number" value={org.late_grace_minutes} onChange={(e) => set("late_grace_minutes", Number(e.target.value))} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Field label={t.dayStart}><Input type="time" value={org.work_start_time || ""} onChange={(e) => set("work_start_time", e.target.value)} /></Field>
            <Field label={t.dayEnd}><Input type="time" value={org.work_end_time || ""} onChange={(e) => set("work_end_time", e.target.value)} /></Field>
            <Field label={t.dayHours}><Input type="number" step="0.1" value={org.work_hours_per_day} onChange={(e) => set("work_hours_per_day", Number(e.target.value))} /></Field>
          </div>
          <div className="grid grid-cols-1 mt-4">
            <Field label={t.absType}>
              <Select value={org.absence_deduction_type} onValueChange={(v) => set("absence_deduction_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly_divided">{t.monthlyDiv}</SelectItem>
                  <SelectItem value="daily_wage">{t.dailyWage}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <SectionTitle title={t.secLoc} />
          <div className="grid grid-cols-3 gap-4">
            <Field label={t.lat}><Input type="number" step="any" value={org.workplace_lat} onChange={(e) => set("workplace_lat", e.target.value === "" ? "" : Number(e.target.value))} /></Field>
            <Field label={t.lng}><Input type="number" step="any" value={org.workplace_lng} onChange={(e) => set("workplace_lng", e.target.value === "" ? "" : Number(e.target.value))} /></Field>
            <Field label={t.radius}><Input type="number" value={org.workplace_radius} onChange={(e) => set("workplace_radius", Number(e.target.value))} /></Field>
          </div>
          <Button type="button" variant="outline" onClick={captureLocation} className="gap-2"><Crosshair size={16} /> {t.capture}</Button>
          <p className="text-xs text-muted-foreground">{t.locNote(org.workplace_radius)}</p>
        </Card>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Card({ children }) { return <div className="bg-white rounded-2xl border border-border p-5 space-y-4">{children}</div>; }
function SectionTitle({ title }) { return <h3 className="font-semibold text-foreground">{title}</h3>; }
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-[#2e2448]/10 flex items-center justify-center text-[#2e2448]">{Icon && <Icon size={18} />}</span><h3 className="font-semibold text-foreground">{title}</h3></div>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (<div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>);
}