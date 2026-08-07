import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Fingerprint, Loader2, LogIn, LogOut, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const nowHM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const R = 6371e3;
const distanceMeters = (lat1, lng1, lat2, lng2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const getPosition = (t) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error(t.noGeo));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
      () => reject(new Error(t.noAccess)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

export default function EmployeeClock({ employee, org, onChanged }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    noGeo: "الجهاز لا يدعم تحديد الموقع", noAccess: "تعذر الوصول إلى موقعك — فعّل صلاحية الموقع",
    noWorkplace: "لم يحدد المقر الرسمي — تواصل مع الموارد البشرية",
    outRange: (d, r) => `أنت خارج نطاق العمل (المسافة ${Math.round(d)} متر). يُسمح بالبصمة ضمن ${r} متر فقط.`,
    alreadyIn: "تم تسجيل الحضور مسبقاً اليوم", doneIn: "تم تسجيل الحضور بنجاح",
    needIn: "يجب تسجيل الحضور أولاً", alreadyOut: "تم تسجيل الانصراف مسبقاً", doneOut: "تم تسجيل الانصراف بنجاح",
    fail: "تعذر التسجيل",
    title: "البصمة اليومية", sub: (r, d) => `يُسمح بالبصمة فقط من مقر العمل ضمن ${r} متر — بتاريخ ${d}`,
    in: "الحضور", out: "الانصراف", btnIn: "تسجيل الحضور", btnOut: "تسجيل الانصراف",
    complete: (h) => `اكتمل تسجيل اليوم (${h} ساعة)`, noWorkplace2: "لم يحدد المقر الرسمي بعد.",
  } : {
    noGeo: "Device does not support geolocation", noAccess: "Could not access your location — enable location permission",
    noWorkplace: "Workplace not set — contact HR",
    outRange: (d, r) => `You're outside the work area (distance ${Math.round(d)} m). Check‑in is allowed within ${r} m only.`,
    alreadyIn: "Check‑in already recorded today", doneIn: "Check‑in recorded successfully",
    needIn: "Please check in first", alreadyOut: "Check‑out already recorded", doneOut: "Check‑out recorded successfully",
    fail: "Could not record",
    title: "Daily check‑in", sub: (r, d) => `Check‑in is allowed only from the workplace within ${r} m — on ${d}`,
    in: "Check in", out: "Check out", btnIn: "Check in", btnOut: "Check out",
    complete: (h) => `Today completed (${h} hours)`, noWorkplace2: "Workplace not set yet.",
  };

  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const loadToday = async () => {
    setLoading(true);
    try {
      const recs = await base44.entities.Attendance.filter({ employee_id: employee.id, date: localToday() }, "-created_date", 5);
      setToday(recs[0] || null);
    } catch {
      setToday(null);
    }
    setLoading(false);
  };
  useEffect(() => { if (employee?.id) loadToday(); }, [employee?.id]);

  const radius = Number(org?.workplace_radius) || 50;
  const hasWorkplace = org && org.workplace_lat != null && org.workplace_lat !== "" && org.workplace_lng != null && org.workplace_lng !== "";

  const run = async (kind) => {
    setMsg({ type: "", text: "" });
    if (!hasWorkplace) { setMsg({ type: "err", text: t.noWorkplace }); return; }
    setBusy(true);
    try {
      const pos = await getPosition(t);
      const dist = distanceMeters(pos.lat, pos.lng, Number(org.workplace_lat), Number(org.workplace_lng));
      if (dist > radius) { setMsg({ type: "err", text: t.outRange(dist, radius) }); setBusy(false); return; }
      if (kind === "in") {
        if (today && today.check_in) { setMsg({ type: "err", text: t.alreadyIn }); setBusy(false); return; }
        const name = `${employee.employee_number} - ${employee.position}`;
        if (today) {
          await base44.entities.Attendance.update(today.id, { check_in: nowHM(), status: "present", source: "portal", employee_user_id: employee.user_id });
        } else {
          await base44.entities.Attendance.create({ employee_id: employee.id, employee_user_id: employee.user_id, employee_name: name, date: localToday(), check_in: nowHM(), status: "present", source: "portal", work_hours: 0 });
        }
        setMsg({ type: "ok", text: t.doneIn });
      } else {
        if (!today || !today.check_in) { setMsg({ type: "err", text: t.needIn }); setBusy(false); return; }
        if (today.check_out) { setMsg({ type: "err", text: t.alreadyOut }); setBusy(false); return; }
        const [h, m] = today.check_in.split(":").map(Number);
        const d = new Date();
        const mins = d.getHours() * 60 + d.getMinutes() - (h * 60 + m);
        const wh = Math.max(0, Math.round((mins / 60) * 100) / 100);
        await base44.entities.Attendance.update(today.id, { check_out: nowHM(), work_hours: wh, source: "portal" });
        setMsg({ type: "ok", text: t.doneOut });
      }
      await loadToday(); onChanged?.();
    } catch (e) {
      setMsg({ type: "err", text: e?.message || t.fail });
    } finally {
      setBusy(false);
    }
  };

  const checkedIn = !!today?.check_in;
  const checkedOut = !!today?.check_out;
  const isArLang = isAr;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 mb-6" dir={isArLang ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <Fingerprint size={22} className="text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{t.title}</h3>
          <p className="text-xs text-muted-foreground">{t.sub(radius, localToday())}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3">
          <div className="text-xs text-muted-foreground">{t.in}</div>
          <div className="text-lg font-bold tabular-nums">{today?.check_in || "—"}</div>
        </div>
        <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3">
          <div className="text-xs text-muted-foreground">{t.out}</div>
          <div className="text-lg font-bold tabular-nums">{today?.check_out || "—"}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!checkedOut ? (
          <>
            <Button onClick={() => run("in")} disabled={busy || loading || checkedIn} className="gap-2">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} {t.btnIn}
            </Button>
            <Button onClick={() => run("out")} disabled={busy || loading || !checkedIn} variant="outline" className="gap-2">
              <LogOut size={16} /> {t.btnOut}
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={18} /> {t.complete(today?.work_hours || 0)}
          </div>
        )}
      </div>

      {!hasWorkplace && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <MapPin size={14} /> {t.noWorkplace2}
        </div>
      )}
      {msg.text && (
        <div className={cn("mt-3 text-sm rounded-lg p-3", msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
          {msg.text}
        </div>
      )}
    </div>
  );
}