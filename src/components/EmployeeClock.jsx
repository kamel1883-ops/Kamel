import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Fingerprint, Loader2, LogIn, LogOut, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalI18n, usePortalT, portalDir } from "@/lib/portalI18n";

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

// يحدد نطاق البصمة من فرع الموظف إن وُجد، ويعود للمقر الرئيسي للمنشأة كبدیل.
function resolveWorkplace(org, branch) {
  const has = (x) => x && x.lat != null && x.lat !== "" && x.lng != null && x.lng !== "";
  if (has(branch)) {
    return { lat: Number(branch.lat), lng: Number(branch.lng), radius: Number(branch.radius) || Number(org?.workplace_radius) || 50, name: branch.name, isBranch: true };
  }
  if (has(org)) {
    return { lat: Number(org.workplace_lat), lng: Number(org.workplace_lng), radius: Number(org.workplace_radius) || 50, name: org?.name || "", isBranch: false };
  }
  return null;
}

export default function EmployeeClock({ employee, org, branch, onChanged, clockApi, initialToday }) {
  const { lang } = usePortalI18n();
  const t = usePortalT("clock");

  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const loadToday = async () => {
    if (initialToday != null) { setToday(initialToday); setLoading(false); return; }
    setLoading(true);
    try {
      if (clockApi?.today) {
        const tt = await clockApi.today();
        setToday(tt || null);
      } else {
        const recs = await base44.entities.Attendance.filter({ employee_id: employee.id, date: localToday() }, "-created_date", 5);
        setToday(recs[0] || null);
      }
    } catch {
      setToday(null);
    }
    setLoading(false);
  };
  useEffect(() => { if (employee?.id) loadToday(); }, [employee?.id, clockApi, initialToday]);

  const wp = resolveWorkplace(org, branch);
  const radius = wp?.radius || 50;

  const run = async (kind) => {
    setMsg({ type: "", text: "" });
    if (!wp) { setMsg({ type: "err", text: t.noWorkplace }); return; }
    setBusy(true);
    try {
      const pos = await getPosition(t);
      const dist = distanceMeters(pos.lat, pos.lng, wp.lat, wp.lng);
      if (dist > radius) { setMsg({ type: "err", text: t.outRange(dist, radius) }); setBusy(false); return; }
      if (kind === "in") {
        if (today && today.check_in) { setMsg({ type: "err", text: t.alreadyIn }); setBusy(false); return; }
        if (clockApi?.clockIn) {
          await clockApi.clockIn();
        } else {
          const name = `${employee.employee_number} - ${employee.position}`;
          const bId = branch?.id || employee.branch_id || null;
          const bName = branch?.name || employee.branch_name || "";
          if (today) {
            await base44.entities.Attendance.update(today.id, { check_in: nowHM(), status: "present", source: "portal", employee_user_id: employee.user_id, branch_id: bId, branch_name: bName });
          } else {
            await base44.entities.Attendance.create({ employee_id: employee.id, employee_user_id: employee.user_id, employee_name: name, date: localToday(), check_in: nowHM(), status: "present", source: "portal", work_hours: 0, branch_id: bId, branch_name: bName });
          }
        }
        setMsg({ type: "ok", text: t.doneIn });
      } else {
        if (!today || !today.check_in) { setMsg({ type: "err", text: t.needIn }); setBusy(false); return; }
        if (today.check_out) { setMsg({ type: "err", text: t.alreadyOut }); setBusy(false); return; }
        const [h, m] = today.check_in.split(":").map(Number);
        const d = new Date();
        const mins = d.getHours() * 60 + d.getMinutes() - (h * 60 + m);
        const wh = Math.max(0, Math.round((mins / 60) * 100) / 100);
        if (clockApi?.clockOut) {
          await clockApi.clockOut(wh);
        } else {
          await base44.entities.Attendance.update(today.id, { check_out: nowHM(), work_hours: wh, source: "portal" });
        }
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
  const isRtl = portalDir(lang) === "rtl";

  return (
    <div className="bg-white rounded-2xl border border-border p-5 mb-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <Fingerprint size={22} className="text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{t.title}</h3>
          <p className="text-xs text-muted-foreground">
            {wp?.isBranch && t.subBranch ? t.subBranch(radius, localToday(), wp.name) : t.sub(radius, localToday())}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 rounded-xl bg-muted/60 border border-border px-3 py-2">
        <div className="text-xs">
          <span className="text-muted-foreground">{t.nowLabel}: </span>
          <span className="font-semibold tabular-nums">
            {now.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")} · {String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}:{String(now.getSeconds()).padStart(2,"0")}
          </span>
        </div>
        {org?.work_start_time && org?.work_end_time && (
          <div className="text-xs text-muted-foreground">{t.schedLabel(org.work_start_time, org.work_end_time)}</div>
        )}
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

      {!wp && (
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