import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Printer } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");
const todayISO = () => new Date().toISOString().slice(0, 10);
const genInvNum = () => {
  const d = new Date();
  return `INV-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
};

function Stamp() {
  return (
    <svg viewBox="0 0 140 140" width="128" height="128" style={{ transform: "rotate(-8deg)" }}>
      <defs>
        <path id="stampArc" d="M 70,70 m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0" />
      </defs>
      <circle cx="70" cy="70" r="62" fill="none" stroke="#1d3a5f" strokeWidth="3" />
      <circle cx="70" cy="70" r="50" fill="none" stroke="#1d3a5f" strokeWidth="1.5" />
      <text fontSize="7" fill="#1d3a5f" letterSpacing="1.5">
        <textPath href="#stampArc" startOffset="3%">JADARA · HR PLATFORM · SAUDI ARABIA · </textPath>
      </text>
      <text x="70" y="62" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1d3a5f" fontFamily="var(--font-display)">جدارة</text>
      <text x="70" y="78" textAnchor="middle" fontSize="8" fill="#1d3a5f">نظام الموارد البشرية</text>
      <path d="M30 90 H 110" stroke="#1d3a5f" strokeWidth="0.8" />
      <text x="70" y="103" textAnchor="middle" fontSize="7" fill="#1d3a5f">وثيقة رسمية</text>
    </svg>
  );
}

export default function InvoiceDialog({ open, onClose, tenant, subs, isAr }) {
  const sub = useMemo(() => {
    if (!tenant || !subs) return null;
    const list = subs
      .filter((s) => s.tenant_id === tenant.id)
      .sort((a, b) => String(b.created_date || "").localeCompare(String(a.created_date || "")));
    return list[0] || null;
  }, [tenant, subs]);

  const [f, setF] = useState(null);
  const [invNum] = useState(genInvNum);

  useEffect(() => {
    if (!tenant) return;
    setF({
      name: tenant.name || "",
      commercial_register: tenant.commercial_register || "",
      vat_number: tenant.vat_number || "",
      contact_name: tenant.contact_name || "",
      contact_phone: tenant.contact_phone || "",
      contact_email: tenant.contact_email || "",
      city: tenant.city || "",
      plan: sub?.plan === "monthly" ? (isAr ? "اشتراك شهري" : "Monthly subscription") : (isAr ? "اشتراك سنوي" : "Annual subscription"),
      period_start: sub?.period_start || todayISO(),
      period_end: sub?.period_end || "",
      amount: sub?.amount || 2500,
    });
  }, [tenant, sub, isAr]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const today = todayISO();
  const sar = isAr ? "ر.س" : "SAR";
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(invNum)}&scale=2&height=8&alttext=${encodeURIComponent(invNum)}`;

  const F = isAr ? {
    title: "إنشاء فاتورة", pul: "تُجلب بيانات العميل تلقائياً — راجعها وعدّلها ثم اطبع",
    name: "اسم المنشأة", cr: "السجل التجاري", vat: "الرقم الضريبي", contact: "جهة الاتصال",
    phone: "الهاتف", email: "البريد", city: "المدينة", plan: "الباقة", pstart: "بداية الفترة",
    pend: "نهاية الفترة", amount: "المبلغ (ر.س)", print: "طباعة / حفظ PDF", close: "إغلاق",
    taxTitle: "فاتورة ضريبية", billedTo: "فاتورة إلى", desc: "الوصف", period: "الفترة",
    amt: "المبلغ", total: "الإجمالي", vatNote: "السعر شامل ضريبة القيمة المضافة. لا توجد رسوم إضافية.",
    contactFoot: "للاستفسار", subLine: "باقة جدارة السنوية للمنصة",
  } : {
    title: "Create invoice", pul: "Client data is pulled automatically — review, edit, then print",
    name: "Company name", cr: "Commercial Register", vat: "VAT number", contact: "Contact",
    phone: "Phone", email: "Email", city: "City", plan: "Plan", pstart: "Period start",
    pend: "Period end", amount: "Amount (SAR)", print: "Print / Save PDF", close: "Close",
    taxTitle: "TAX INVOICE", billedTo: "Billed to", desc: "Description", period: "Period",
    amt: "Amount", total: "Total", vatNote: "Price is VAT-inclusive. No additional charges.",
    contactFoot: "Inquiries", subLine: "Jadara annual platform plan",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{F.title}</DialogTitle></DialogHeader>

        {tenant && f ? (
          <div className="space-y-4">
            <div className="no-print text-xs text-muted-foreground bg-slate-50 border border-border rounded-lg p-2.5">{F.pul}</div>

            {/* تأكيد/تعديل بيانات العميل */}
            <div className="no-print grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <Inp label={F.name} value={f.name} onChange={(v) => set("name", v)} />
              <Inp label={F.cr} value={f.commercial_register} onChange={(v) => set("commercial_register", v)} />
              <Inp label={F.vat} value={f.vat_number} onChange={(v) => set("vat_number", v)} />
              <Inp label={F.contact} value={f.contact_name} onChange={(v) => set("contact_name", v)} />
              <Inp label={F.phone} value={f.contact_phone} onChange={(v) => set("contact_phone", v)} />
              <Inp label={F.email} value={f.contact_email} onChange={(v) => set("contact_email", v)} />
              <Inp label={F.city} value={f.city} onChange={(v) => set("city", v)} />
              <Inp label={F.plan} value={f.plan} onChange={(v) => set("plan", v)} />
              <Inp label={F.amount} value={f.amount} onChange={(v) => set("amount", Number(v) || 0)} type="number" />
              <Inp label={F.pstart} value={f.period_start} onChange={(v) => set("period_start", v)} type="date" />
              <Inp label={F.pend} value={f.period_end} onChange={(v) => set("period_end", v)} type="date" />
            </div>

            <div className="no-print flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>{F.close}</Button>
              <Button onClick={() => window.print()} className="gap-1.5"><Printer size={16} /> {F.print}</Button>
            </div>

            {/* الفاتورة القابلة للطباعة */}
            <div className="print-invoice bg-white text-slate-900 rounded-xl border border-slate-200 p-6" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-start justify-between border-b-2 border-slate-300 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#1d3a5f] text-white flex items-center justify-center font-extrabold text-lg">ج</div>
                  <div>
                    <div className="text-lg font-extrabold text-[#1d3a5f]">جدارة</div>
                    <div className="text-[10px] text-slate-500">{isAr ? "منصة الموارد البشرية" : "HR Platform"} · jadara-hr.com</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xl font-extrabold tracking-tight">{F.taxTitle}</div>
                  <div className="text-xs text-slate-600 mt-1">{isAr ? "رقم الفاتورة" : "Invoice No."}: <b className="text-slate-900">{invNum}</b></div>
                  <div className="text-xs text-slate-600">{isAr ? "التاريخ" : "Date"}: <b className="text-slate-900"> {today}</b></div>
                </div>
              </div>

              <div className="flex justify-center my-4">
                <img src={barcodeUrl} alt={invNum} className="h-12" />
                <div className="w-full text-center text-[10px] text-slate-500 -mt-1">{invNum}</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                <div className="text-xs font-semibold text-slate-500 mb-1.5">{F.billedTo}</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div className="font-bold">{f.name}</div>
                  <div className="text-slate-600">{F.cr}: {f.commercial_register || "—"}</div>
                  <div className="text-slate-600">{F.vat}: {f.vat_number || "—"}</div>
                  <div className="text-slate-600">{f.contact_name}</div>
                  <div className="text-slate-600" dir="ltr">{f.contact_phone}</div>
                  <div className="text-slate-600" dir="ltr">{f.contact_email}</div>
                  <div className="text-slate-600">{f.city}</div>
                </div>
              </div>

              <table className="w-full text-sm border border-slate-300 mb-4">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="text-right p-2 border-b border-slate-300">{F.desc}</th>
                    <th className="text-right p-2 border-b border-slate-300">{F.period}</th>
                    <th className="text-right p-2 border-b border-slate-300">{F.amt}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b border-slate-200">{f.plan} — {F.subLine}</td>
                    <td className="p-2 border-b border-slate-200">{f.period_start} → {f.period_end || "—"}</td>
                    <td className="p-2 border-b border-slate-200 font-semibold">{Number(f.amount).toLocaleString()} {sar}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-2 text-left font-bold text-slate-800">{F.total}</td>
                    <td className="p-2 font-extrabold text-base text-[#1d3a5f]">{Number(f.amount).toLocaleString()} {sar}</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-xs text-slate-500 mb-5">{F.vatNote}</div>

              <div className="flex items-end justify-between">
                <div className="text-xs text-slate-500 leading-relaxed">
                  <div className="font-semibold text-slate-700">{F.contactFoot}</div>
                  <div dir="ltr">WhatsApp: +966 594700782</div>
                  <div dir="ltr">info@jadara-hr.com</div>
                </div>
                <div className="flex flex-col items-center">
                  <Stamp />
                  <div className="text-[10px] text-slate-400 mt-1">jadara-hr.com</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>{F.close}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Inp({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}