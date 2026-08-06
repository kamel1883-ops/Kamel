import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import LicenseForm from "@/components/LicenseForm";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, ShieldCheck, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { LICENSE_TYPES, typeMeta, expiryStatus, statusBadge } from "@/lib/licenses";

export default function Licenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fixedType, setFixedType] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.License.list("-created_date", 300);
    setLicenses(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const recOf = (type) => licenses.find((l) => l.license_type === type);

  const openNew = (type) => { setEditing(null); setFixedType(type); setFormOpen(true); };
  const openEdit = (rec) => { setEditing(rec); setFixedType(rec.license_type === "other" ? null : rec.license_type); setFormOpen(true); };

  const stats = {
    active: 0, expiring_soon: 0, expired: 0, not_applicable: 0, filled: 0,
  };
  LICENSE_TYPES.forEach((t) => {
    const rec = recOf(t.key);
    if (!rec) return;
    if (rec.not_applicable) { stats.not_applicable++; return; }
    stats.filled++;
    const s = expiryStatus(rec.expiry_date, rec.not_applicable);
    if (stats[s] !== undefined) stats[s]++;
  });

  return (
    <div>
      <PageHeader
        title="تراخيص المنشأة"
        subtitle="متابعة تراخيص الجهات الحكومية وعقود الصيانة وتواريخ انتهائها"
        action={<Button onClick={() => { setEditing(null); setFixedType(null); setFormOpen(true); }} className="gap-2"><Plus size={18} /> إضافة ترخيص</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <Stat label="تراخيص سارية" value={stats.active} cls="text-emerald-600" />
        <Stat label="قاربت الانتهاء" value={stats.expiring_soon} cls="text-amber-600" />
        <Stat label="منتهية" value={stats.expired} cls="text-rose-600" />
        <Stat label="لا ينطبق" value={stats.not_applicable} cls="text-slate-500" />
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {LICENSE_TYPES.map((t) => {
            const rec = recOf(t.key);
            return <Slot key={t.key} type={t} rec={rec} onAdd={() => openNew(t.key)} onEdit={() => openEdit(rec)} />;
          })}
        </div>
      )}

      <LicenseForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} editing={editing} fixedType={fixedType} />
    </div>
  );
}

function Slot({ type, rec, onAdd, onEdit }) {
  const na = rec?.not_applicable;
  const status = rec ? expiryStatus(rec.expiry_date, na) : "unknown";
  const meta = typeMeta(type.key);
  const cardLabel = type.key === "other" && rec?.custom_label ? rec.custom_label : meta.label;

  return (
    <div className={cn(
      "bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-shadow",
      status === "expired" ? "border-rose-200 shadow-rose-50"
      : status === "expiring_soon" ? "border-amber-200 shadow-amber-50"
      : status === "active" ? "border-emerald-100"
      : "border-border"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",
            na ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white")}>
            <ShieldCheck size={18} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-sm">{cardLabel}</div>
            <div className="text-[11px] text-muted-foreground">{meta.authority}</div>
          </div>
        </div>
        {rec && <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium", statusBadge[status].cls)}>{statusBadge[status].label}</span>}
      </div>

      {!rec ? (
        <div className="flex flex-col gap-2 mt-1">
          <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5"><Plus size={15} /> تعبئة بيانات الترخيص</Button>
          <Button size="sm" variant="ghost" onClick={onAdd} className="gap-1.5 text-muted-foreground hover:bg-slate-100"><Ban size={14} /> لا ينطبق على المنشأة</Button>
        </div>
      ) : na ? (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">هذا الترخيص لا ينطبق على المنشأة</span>
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5"><Pencil size={14} /> تعديل</Button>
        </div>
      ) : (
        <div className="mt-1 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Info label="رقم الترخيص" value={rec.license_number} />
            <Info label="المدة" value={rec.duration_months ? `${rec.duration_months} شهر` : "—"} />
            <Info label="الإصدار" value={rec.issue_date || "—"} />
            <Info label="الانتهاء" value={rec.expiry_date || "—"} highlight={status} />
          </div>
          {rec.notes && <div className="text-[11px] text-muted-foreground bg-slate-50 rounded-lg p-2">{rec.notes}</div>}
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5"><Pencil size={14} /> تعديل</Button>
            {rec.document_url && (
              <a href={rec.document_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline self-center">عرض النسخة</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div className={cn(
      "rounded-lg p-2 bg-slate-50",
      highlight === "expired" && "bg-rose-50",
      highlight === "expiring_soon" && "bg-amber-50"
    )}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Stat({ label, value, cls }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-2xl font-bold mt-1", cls)}>{value}</div>
    </div>
  );
}