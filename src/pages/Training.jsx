import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, GraduationCap, Search, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TrainingPlanFormDialog from "@/components/training/TrainingPlanFormDialog";
import TrainingPlanDetailsDialog from "@/components/training/TrainingPlanDetailsDialog";

const parseIds = (s) => {
  try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
};

const statusMap = {
  draft: { ar: "مسودة", cls: "bg-slate-100 text-slate-700" },
  in_progress: { ar: "قيد التنفيذ", cls: "bg-amber-100 text-amber-800" },
  completed: { ar: "مكتملة", cls: "bg-emerald-100 text-emerald-800" },
  cancelled: { ar: "ملغاة", cls: "bg-red-100 text-red-700" },
};

export default function Training() {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [pl, emps] = await Promise.all([
        base44.entities.TrainingPlan.list("-created_date", 500),
        base44.entities.Employee.list("-created_date", 500).catch(() => []),
      ]);
      setPlans(pl || []);
      setEmployees(emps || []);
    } catch (e) { toast({ title: "تعذر التحميل", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setDialogOpen(true); };
  const del = async (p) => {
    if (!confirm("حذف هذه الخطة؟")) return;
    try { await base44.entities.TrainingPlan.delete(p.id); toast({ title: "تم الحذف" }); load(); }
    catch (e) { toast({ title: "تعذر الحذف", description: e.message, variant: "destructive" }); }
  };

  // البحث: اسم الخطة أو أسماء المشمولين أو أن الموظف المطابق للبحث ضمن employee_ids
  const ql = q.trim().toLowerCase();
  const matchedEmpIds = useMemo(() => {
    const s = new Set();
    if (!ql) return s;
    (employees || []).forEach((e) => {
      if ((e.full_name || "").toLowerCase().includes(ql) || (e.employee_number || "").toLowerCase().includes(ql)) s.add(e.id);
    });
    return s;
  }, [employees, ql]);

  const filtered = (plans || []).filter((p) => {
    if (!ql) return true;
    if ((p.title || "").toLowerCase().includes(ql)) return true;
    const names = p.employee_names || p.employee_name || "";
    if (names.toLowerCase().includes(ql)) return true;
    const ids = parseIds(p.employee_ids);
    for (const id of ids) { if (matchedEmpIds.has(id)) return true; }
    if (matchedEmpIds.has(p.employee_id)) return true;
    return false;
  });

  return (
    <div>
      <PageHeader title="التدريب والتطوير" subtitle="إدارة الخطط التدريبية للموظفين والإدارات وتتبع أهدافها وتكلفتها" action={
        <Button onClick={openNew}><Plus size={16} /> خطة تدريبية جديدة</Button>
      } />

      <div className="bg-white rounded-2xl border border-border p-3 mb-4 flex items-center gap-2">
        <Search size={16} className="text-muted-foreground shrink-0" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الخطة أو اسم الموظف أو رقمه — تظهر كل خطط الموظف المشمول" className="border-0 shadow-none focus-visible:ring-0 h-9" />
      </div>

      {loading ? (
        <div className="py-24 text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border bg-card">
          <GraduationCap className="text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground mb-4">{q ? "لا توجد خطط مطابقة لبحثك." : "لا توجد خطط تدريبية بعد — ابدأ بإنشاء أول خطة."}</p>
          {!q && <Button onClick={openNew}><Plus size={16} /> خطة تدريبية جديدة</Button>}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const st = statusMap[p.status] || statusMap.draft;
            const names = p.employee_names || p.employee_name || "";
            const ids = parseIds(p.employee_ids);
            const count = ids.length || (names ? names.split("،").length : 0);
            return (
              <Card key={p.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <Badge className={st.cls + " border-0"}>{st.ar}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.scope === "department" ? <span>جهة/قسم: {p.department || "—"}</span> : <span>نطاق فردي</span>}
                  {count > 0 && <span className="mx-2">· {count} مشمول</span>}
                </div>
                {(() => {
                  const ids = parseIds(p.employee_ids);
                  const list = ids.length ? ids : (p.employee_id ? [p.employee_id] : []);
                  const rows = list.map((id) => employees.find((e) => e.id === id)).filter(Boolean);
                  if (rows.length === 0 && !names) return null;
                  return (
                    <div className="text-xs text-slate-700 bg-muted/40 rounded-lg p-2 max-h-24 overflow-y-auto" dir="rtl">
                      <div className="font-medium text-muted-foreground mb-1">المشمولون:</div>
                      {rows.length > 0 ? rows.map((e) => (
                        <div key={e.id} className="py-0.5">
                          <div>{e.full_name}</div>
                          <div className="text-muted-foreground tabular-nums" dir="ltr">{e.national_id || "—"}</div>
                        </div>
                      )) : <div>{names}</div>}
                    </div>
                  );
                })()}
                {p.goal && <div className="text-sm text-muted-foreground line-clamp-2">الهدف: {p.goal}</div>}
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">{p.cost ? `${p.cost} ريال` : ""} {p.start_date ? `· ${p.start_date}` : ""}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setViewing(p)} title="استعلام/التفاصيل"><Eye size={15} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil size={15} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p)}><Trash2 size={15} /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <TrainingPlanFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} plan={editing} employees={employees} />
      <TrainingPlanDetailsDialog open={!!viewing} onClose={() => setViewing(null)} plan={viewing} />
    </div>
  );
}