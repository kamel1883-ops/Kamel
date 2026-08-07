import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Loader2, Building2, Save, Crosshair } from "lucide-react";

const empty = {
  name: "", commercial_register: "", vat_number: "", city: "", country: "المملكة العربية السعودية",
  logo_url: "",
  annual_leave_days: 21, ticket_policy: "yearly", ticket_value: 0,
  eos_basis: "gross",
  gosi_saudi_employee_rate: 9.75, gosi_saudi_employer_rate: 9.75, gosi_expat_employer_rate: 2,
  work_week_hours: 48, work_week_days: 6, late_grace_minutes: 15,
  absence_deduction_type: "monthly_divided",
  workplace_lat: "", workplace_lng: "", workplace_radius: 50,
};

export default function SettingsPage() {
  const [org, setOrg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Organization.list("-created_date", 1).then((list) => {
      setOrg(list[0] ? { ...empty, ...list[0] } : empty);
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setOrg((o) => ({ ...o, [k]: v }));

  const captureLocation = () => {
    if (!navigator.geolocation) { alert("الجهاز لا يدعم تحديد الموقع"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("workplace_lat", Number(pos.coords.latitude.toFixed(6)));
        set("workplace_lng", Number(pos.coords.longitude.toFixed(6)));
      },
      () => alert("تعذر الوصول إلى موقعك"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      if (org.id) {
        await base44.entities.Organization.update(org.id, org);
      } else {
        const created = await base44.entities.Organization.create(org);
        setOrg({ ...org, ...created });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div>
      <PageHeader title="إعدادات المنشأة" subtitle="بيانات المنشأة والسياسات المواردية" />

      <div className="max-w-3xl space-y-6">
        <Section title="بيانات المنشأة" icon={Building2}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="اسم المنشأة"><Input value={org.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="السجل التجاري"><Input value={org.commercial_register} onChange={(e) => set("commercial_register", e.target.value)} /></Field>
            <Field label="الرقم الضريبي"><Input value={org.vat_number} onChange={(e) => set("vat_number", e.target.value)} /></Field>
            <Field label="المدينة"><Input value={org.city} onChange={(e) => set("city", e.target.value)} /></Field>
          </div>
        </Section>

        <Card>
          <SectionTitle title="سياسات الإجازات والتذاكر" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="أيام الإجازة السنوية"><Input type="number" value={org.annual_leave_days} onChange={(e) => set("annual_leave_days", Number(e.target.value))} /></Field>
            <Field label="سياسة التذاكر">
              <Select value={org.ticket_policy} onValueChange={(v) => set("ticket_policy", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">سنوية</SelectItem>
                  <SelectItem value="biennial">كل سنتين</SelectItem>
                  <SelectItem value="none">بدون</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="قيمة التذكرة (ريال)"><Input type="number" value={org.ticket_value} onChange={(e) => set("ticket_value", Number(e.target.value))} /></Field>
          </div>
        </Card>

        <Card>
          <SectionTitle title="إعدادات نهاية الخدمة والتأمينات" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="أساس حساب نهاية الخدمة">
              <Select value={org.eos_basis} onValueChange={(v) => set("eos_basis", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross">الراتب الإجمالي (أساسي + بدلات)</SelectItem>
                  <SelectItem value="base_only">الراتب الأساسي فقط</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="نسبة تأمين الموظف السعودي %"><Input type="number" step="0.01" value={org.gosi_saudi_employee_rate} onChange={(e) => set("gosi_saudi_employee_rate", Number(e.target.value))} /></Field>
            <Field label="نسبة تأمين صاحب العمل (سعودي) %"><Input type="number" step="0.01" value={org.gosi_saudi_employer_rate} onChange={(e) => set("gosi_saudi_employer_rate", Number(e.target.value))} /></Field>
            <Field label="نسبة تأمين صاحب العمل (مقيم) %"><Input type="number" step="0.01" value={org.gosi_expat_employer_rate} onChange={(e) => set("gosi_expat_employer_rate", Number(e.target.value))} /></Field>
          </div>
        </Card>

        <Card>
          <SectionTitle title="إعدادات الحضور والدوام" />
          <div className="grid grid-cols-3 gap-4">
            <Field label="ساعات العمل الأسبوعية"><Input type="number" value={org.work_week_hours} onChange={(e) => set("work_week_hours", Number(e.target.value))} /></Field>
            <Field label="أيام العمل الأسبوعية"><Input type="number" value={org.work_week_days} onChange={(e) => set("work_week_days", Number(e.target.value))} /></Field>
            <Field label="سماح التأخير (دقيقة)"><Input type="number" value={org.late_grace_minutes} onChange={(e) => set("late_grace_minutes", Number(e.target.value))} /></Field>
          </div>
          <div className="grid grid-cols-1 mt-4">
            <Field label="طريقة خصم الغياب">
              <Select value={org.absence_deduction_type} onValueChange={(v) => set("absence_deduction_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly_divided">الراتب الشهري ÷ 30 لليوم</SelectItem>
                  <SelectItem value="daily_wage">الأجر اليومي</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <SectionTitle title="موقع مقر العمل (للبصمة)" />
          <div className="grid grid-cols-3 gap-4">
            <Field label="خط العرض"><Input type="number" step="any" value={org.workplace_lat} onChange={(e) => set("workplace_lat", e.target.value === "" ? "" : Number(e.target.value))} /></Field>
            <Field label="خط الطول"><Input type="number" step="any" value={org.workplace_lng} onChange={(e) => set("workplace_lng", e.target.value === "" ? "" : Number(e.target.value))} /></Field>
            <Field label="نطاق البصمة (متر)"><Input type="number" value={org.workplace_radius} onChange={(e) => set("workplace_radius", Number(e.target.value))} /></Field>
          </div>
          <Button type="button" variant="outline" onClick={captureLocation} className="gap-2"><Crosshair size={16} /> تحديد موقعي الحالي</Button>
          <p className="text-xs text-muted-foreground">سيُسمح للموظف بالبصمة فقط ضمن {org.workplace_radius || 50} متر من هذا الموقع.</p>
        </Card>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            حفظ الإعدادات
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
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}