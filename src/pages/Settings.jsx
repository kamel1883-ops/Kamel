import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Loader2, Building2, Save, Crosshair, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/lib/i18n";

const empty = {
  name: "", commercial_register: "", vat_number: "", city: "", country: "المملكة العربية السعودية",
  logo_url: "",
  annual_leave_days: 21, ticket_policy: "yearly", ticket_value: 0,
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
    secOrg: "بيانات المنشأة", name: "اسم المنشأة", cr: "السجل التجاري", vat: "الرقم الضريبي", city: "المدينة",
    secLeave: "سياسات الإجازات والتذاكر", annualDays: "أيام الإجازة السنوية", ticketPolicy: "سياسة التذاكر",
    ticketValue: "قيمة التذكرة (ريال)", yearly: "سنوية", biennial: "كل سنتين", none: "بدون",
    secEos: "إعدادات نهاية الخدمة والتأمينات", eosBasis: "أساس حساب نهاية الخدمة",
    gross: "الراتب الإجمالي (أساسي + بدلات)", baseOnly: "الراتب الأساسي فقط",
    gosiEmp: "نسبة تأمين الموظف السعودي %", gosiErSa: "نسبة تأمين صاحب العمل (سعودي) %", gosiErEx: "نسبة تأمين صاحب العمل (مقيم) %",
    secAtt: "إعدادات الحضور والدوام", weekHours: "ساعات العمل الأسبوعية", weekDays: "أيام العمل الأسبوعية", grace: "سماح التأخير (دقيقة)",
    dayStart: "بداية الدوام", dayEnd: "نهاية الدوام", dayHours: "ساعات العمل اليومية المطلوبة",
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
    secOrg: "Organization data", name: "Organization name", cr: "Commercial register", vat: "VAT number", city: "City",
    secLeave: "Leave & ticket policies", annualDays: "Annual leave days", ticketPolicy: "Ticket policy",
    ticketValue: "Ticket value (SAR)", yearly: "Yearly", biennial: "Biennial", none: "None",
    secEos: "EOS & GOSI settings", eosBasis: "EOS calculation basis",
    gross: "Gross salary (base + allowances)", baseOnly: "Base salary only",
    gosiEmp: "Saudi employee GOSI rate %", gosiErSa: "Employer GOSI (Saudi) %", gosiErEx: "Employer GOSI (Expat) %",
    secAtt: "Attendance & working time", weekHours: "Weekly working hours", weekDays: "Weekly working days", grace: "Late grace (minutes)",
    dayStart: "Daily start time", dayEnd: "Daily end time", dayHours: "Required daily work hours",
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
  const [delOpen, setDelOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.Organization.list("-created_date", 1).then((list) => {
      setOrg(list[0] ? { ...empty, ...list[0] } : empty);
      setLoading(false);
    });
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
      if (org.id) { await base44.entities.Organization.update(org.id, org); }
      else { const created = await base44.entities.Organization.create(org); setOrg({ ...org, ...created }); }
    } finally { setSaving(false); }
  };

  const requestDeletion = () => {
    setDelOpen(false);
    toast({ title: t.delSuccess });
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">{t.loading}</div>;

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <div className="max-w-3xl space-y-6">
        <Section title={t.secOrg} icon={Building2}>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.name}><Input value={org.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label={t.cr}><Input value={org.commercial_register} onChange={(e) => set("commercial_register", e.target.value)} /></Field>
            <Field label={t.vat}><Input value={org.vat_number} onChange={(e) => set("vat_number", e.target.value)} /></Field>
            <Field label={t.city}><Input value={org.city} onChange={(e) => set("city", e.target.value)} /></Field>
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
            <Field label={t.ticketValue}><Input type="number" value={org.ticket_value} onChange={(e) => set("ticket_value", Number(e.target.value))} /></Field>
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

        <Card>
          <SectionTitle title={t.delSec} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
            <div>
              <div className="font-medium text-rose-700">{t.delTitle}</div>
              <p className="text-sm text-muted-foreground mt-1">{t.delDesc}</p>
            </div>
            <Button variant="outline" className="gap-2 border-rose-300 text-rose-600 hover:bg-rose-50 shrink-0" onClick={() => setDelOpen(true)}>
              <Trash2 size={16} /> {t.delBtn}
            </Button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t.save}
          </Button>
        </div>
      </div>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle size={16} className="text-rose-600" /> {t.delTitle}</DialogTitle></DialogHeader>
          <p className="text-sm font-medium text-rose-600">{t.delWarn}</p>
          <p className="text-sm text-muted-foreground">{t.delDesc}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>{t.delCancel}</Button>
            <Button variant="destructive" className="gap-2" onClick={requestDeletion}><Trash2 size={16} /> {t.delConfirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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