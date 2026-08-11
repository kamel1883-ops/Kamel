import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, CheckCheck } from "lucide-react";

// حوار اختيار الموظفين المشمولين في خطة تدريب — بحث + خانات صح + تحديد الكل
export default function EmployeePickerDialog({ open, onClose, employees, initial, onConfirm }) {
  const [selected, setSelected] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(Array.isArray(initial) ? [...initial] : []);
      setQ("");
    }
  }, [open, JSON.stringify(initial || [])]);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const ql = q.trim().toLowerCase();
  const list = (employees || []).filter((e) =>
    (e.full_name || "").toLowerCase().includes(ql) || (e.employee_number || "").toLowerCase().includes(ql)
  );

  const allSelected = list.length > 0 && list.every((e) => selected.includes(e.id));
  const toggleAll = () =>
    setSelected(allSelected
      ? selected.filter((id) => !list.find((e) => e.id === id))
      : Array.from(new Set([...selected, ...list.map((e) => e.id)]))
    );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader><DialogTitle>اختيار الموظفين المشمولين ({selected.length})</DialogTitle></DialogHeader>

        <div className="relative mb-2">
          <Search size={15} className="absolute right-3 top-2.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو الرقم الوظيفي" className="pr-9" />
        </div>

        <div className="flex items-center justify-between mb-2">
          <Button size="sm" variant="outline" onClick={toggleAll} className="gap-1"><CheckCheck size={14} /> {allSelected ? "إلغاء الكل المعروض" : "تحديد الكل المعروض"}</Button>
          <span className="text-xs text-muted-foreground">{selected.length} مُحدد</span>
        </div>

        <div className="border rounded-xl divide-y max-h-[50vh] overflow-y-auto">
          {list.map((e) => (
            <label key={e.id} className="flex items-center gap-3 p-2.5 hover:bg-muted/40 cursor-pointer">
              <Checkbox checked={selected.includes(e.id)} onCheckedChange={() => toggle(e.id)} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{e.full_name}</div>
                <div className="text-xs text-muted-foreground">{e.employee_number} · {e.department || "—"} {e.position ? `· ${e.position}` : ""}</div>
              </div>
            </label>
          ))}
          {list.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">لا يوجد موظفون مطابقون.</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>إلغاء</Button>
          <Button onClick={() => { onConfirm(selected); onClose(false); }}>تأكيد ({selected.length})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}