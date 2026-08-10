import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyToken } from "../../shared/portalToken.ts";

// وصلة بيانات بوابة الموظف: تتحقق من رمز الجلسة الموقّع ثم ترد/تنشئ
// بيانات الموظف (طلباته، حضوره، إنذاراته) وإنشاء طلبات إجازة/سلفة/انتداب وبصمة الحضور.
// كل العمليات تتم عبر خدمة-الدور لتفادي قيود RLS (لا يوجد مستخدم Base44 مسجّل).
// (مراجعة 2026-08: لوحة المالك — owner_list خفيف، owner_extras منفصل)

const todayISO = () => new Date().toISOString().slice(0, 10);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.token || "");
    const employeeId = String(body.employee_id || "");
    const action = String(body.action || "");
    if (!token || !employeeId || !action)
      return Response.json({ ok: false, error: "missing" }, { status: 400 });

    const session = await verifyToken(token);
    if (!session.ok || session.employeeId !== employeeId)
      return Response.json({ ok: false, error: "invalid_session" }, { status: 401 });

    const emp = await base44.asServiceRole.entities.Employee.get(employeeId);
    const empLabel = `${emp.employee_number} - ${emp.position}`;

    if (action === "fetch") {
      const [orgs, leaves, loans, attendance, trips, warnings] = await Promise.all([
        base44.asServiceRole.entities.Organization.list("-created_date", 1),
        base44.asServiceRole.entities.LeaveRequest.filter({ employee_id: employeeId }, "-created_date", 200),
        base44.asServiceRole.entities.LoanRequest.filter({ employee_id: employeeId }, "-created_date", 200),
        base44.asServiceRole.entities.Attendance.filter({ employee_id: employeeId }, "-date", 10),
        base44.asServiceRole.entities.BusinessTrip.filter({ employee_id: employeeId }, "-created_date", 200),
        base44.asServiceRole.entities.Warning.filter({ employee_id: employeeId }, "-created_date", 100),
      ]);
      return Response.json({
        ok: true,
        employee: emp,
        org: orgs?.[0] || null,
        leaves, loans, attendance, trips, warnings,
      });
    }

    // بوابة المالك — مؤشرات حيّة عن المنشآت المشتركة، للمالك فقط (role_level = "owner")
    if (action === "owner_stats") {
      if ((emp.role_level || "employee") !== "owner")
        return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenants = await base44.asServiceRole.entities.Tenant.list("-created_date", 500);
      const now = new Date();
      const in30 = new Date(); in30.setDate(in30.getDate() + 30);
      let trials = 0, paid = 0, expired = 0, expiring = 0, revenue = 0;
      for (const tx of tenants || []) {
        if (tx.status === "trial" || tx.plan === "trial") trials++;
        if (tx.status === "active") { paid++; revenue += Number(tx.quoted_amount || 0); }
        if (tx.status === "expired" || tx.status === "cancelled") expired++;
        const end = tx.subscription_end || tx.trial_end;
        if (end) {
          const d = new Date(end);
          if (!isNaN(d.getTime()) && d >= now && d <= in30) expiring++;
        }
      }
      return Response.json({
        ok: true,
        stats: { total: (tenants || []).length, trials, paid, expired, expiring, revenue },
      });
    }

    // ====== لوحة المالك الكاملة — قائمة العملاء والعمليات الإدارية ======
    if (action === "owner_list") {
      if ((emp.role_level || "employee") !== "owner")
        return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      // البيانات الأساسية فقط — سريعة ومُجرّبة (Tenant.list كما في owner_stats).
      const tenants = await base44.asServiceRole.entities.Tenant.list("-created_date", 500);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      let trials = 0, paid = 0, suspended = 0, expiring = 0, revenue = 0, newThisMonth = 0;
      const expiringList = [];
      for (const tx of tenants || []) {
        if (tx.status === "trial" || (tx.plan === "trial" && tx.status !== "expired")) trials++;
        if (tx.status === "active") { paid++; revenue += Number(tx.quoted_amount || 0); }
        if (tx.status === "expired") suspended++;
        if (tx.created_date && new Date(tx.created_date) >= monthStart) newThisMonth++;
        const endField = tx.status === "active" ? tx.subscription_end : tx.status === "trial" ? tx.trial_end : (tx.subscription_end || tx.trial_end);
        if (endField) {
          const d = new Date(endField);
          if (!isNaN(d.getTime())) {
            const dl = Math.round((d.getTime() - now.getTime()) / 86400000);
            if (dl <= 30) {
              expiring++;
              expiringList.push({ id: tx.id, name: tx.name, end: endField, days: dl, status: tx.status, contact_email: tx.contact_email, contact_phone: tx.contact_phone, plan: tx.plan });
            }
          }
        }
      }
      return Response.json({
        ok: true,
        tenants: tenants || [],
        expiring: expiringList,
        stats: { total: (tenants || []).length, trials, paid, suspended, expiring, revenue, newThisMonth },
      });
    }

    // البيانات الثانوية (مدفوعات معلّقة + استبيانات) — مستدعاة منفصلة حتى لا تعطّل اللوحة إن تأخرت/فشلت.
    if (action === "owner_extras") {
      if ((emp.role_level || "employee") !== "owner")
        return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      let pendings: any[] = [];
      let surveyStats = { responses: 0, avg: 0 };
      try {
        pendings = await base44.asServiceRole.entities.Subscription.filter({ status: "pending" }, "-created_date", 200);
      } catch (_e) { /* لا تعطّل اللوحة */ }
      try {
        const resps = await base44.asServiceRole.entities.CustomerSurveyResponse.list("-created_date", 50);
        surveyStats = {
          responses: (resps || []).length,
          avg: resps && resps.length ? Math.round((resps.reduce((s, r) => s + (Number(r.avg_rating) || 0), 0) / resps.length) * 10) / 10 : 0,
        };
      } catch (_e) { /* لا تعطّل اللوحة */ }
      return Response.json({ ok: true, pendings: pendings || [], surveyStats });
    }

    if (action === "owner_suspend") {
      if ((emp.role_level || "employee") !== "owner") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tid = String(body.tenant_id || "");
      if (!tid) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const tx = await base44.asServiceRole.entities.Tenant.get(tid);
      if (!tx) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
      await base44.asServiceRole.entities.Tenant.update(tid, { status: "expired", suspended_from: tx.status || "trial" });
      return Response.json({ ok: true });
    }

    if (action === "owner_resume") {
      if ((emp.role_level || "employee") !== "owner") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tid = String(body.tenant_id || "");
      if (!tid) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const tx = await base44.asServiceRole.entities.Tenant.get(tid);
      if (!tx) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
      const restore = tx.suspended_from || "trial";
      const updates: any = { status: restore, suspended_from: null };
      if (restore === "active" && !tx.subscription_end) {
        const end = new Date(); end.setDate(end.getDate() + 30);
        updates.subscription_end = end.toISOString().slice(0, 10);
      }
      await base44.asServiceRole.entities.Tenant.update(tid, updates);
      return Response.json({ ok: true });
    }

    if (action === "owner_activate") {
      if ((emp.role_level || "employee") !== "owner") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tid = String(body.tenant_id || "");
      if (!tid) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const end = new Date(); end.setDate(end.getDate() + 365);
      await base44.asServiceRole.entities.Tenant.update(tid, {
        status: "active", plan: "annual", subscription_end: end.toISOString().slice(0, 10), suspended_from: null,
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_register_sub") {
      if ((emp.role_level || "employee") !== "owner") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tid = String(body.tenant_id || "");
      const plan = String(body.plan || "annual");
      const amount = Number(body.amount || 0);
      const method = String(body.method || "direct");
      const proofUrl = String(body.proof_url || "");
      if (!tid || !amount) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const tx = await base44.asServiceRole.entities.Tenant.get(tid);
      const today = new Date().toISOString().slice(0, 10);
      const end = new Date(); end.setDate(end.getDate() + (plan === "annual" ? 365 : 30));
      await base44.asServiceRole.entities.Subscription.create({
        tenant_id: tid, tenant_name: tx?.name || "", plan, amount, period_start: today,
        period_end: end.toISOString().slice(0, 10), payment_method: method, status: "paid",
        paid_date: today, proof_url: proofUrl,
      });
      await base44.asServiceRole.entities.Tenant.update(tid, {
        status: "active", plan, subscription_end: end.toISOString().slice(0, 10), suspended_from: null,
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_confirm_renew") {
      if ((emp.role_level || "employee") !== "owner") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tid = String(body.tenant_id || "");
      const subId = String(body.sub_id || "");
      const proofUrl = String(body.proof_url || "");
      if (!tid || !subId) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const sub = await base44.asServiceRole.entities.Subscription.get(subId);
      if (!sub || sub.tenant_id !== tid) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
      const today = new Date().toISOString().slice(0, 10);
      await base44.asServiceRole.entities.Subscription.update(subId, { status: "paid", paid_date: today, proof_url: proofUrl });
      await base44.asServiceRole.entities.Tenant.update(tid, {
        status: "active", plan: "annual", subscription_end: sub.period_end, suspended_from: null,
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_read_notif") {
      if ((emp.role_level || "employee") !== "owner") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const nid = String(body.notification_id || "");
      if (!nid) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      await base44.asServiceRole.entities.Notification.update(nid, { is_read: true });
      return Response.json({ ok: true });
    }

    if (action === "owner_cancel") {
      if ((emp.role_level || "employee") !== "owner") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tid = String(body.tenant_id || "");
      if (!tid) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const tx = await base44.asServiceRole.entities.Tenant.get(tid);
      if (!tx) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
      // إلغاء نهائي: يُنقل العميل لقائمة الملغيات ويُخفى من القائمة الرئيسية، مع حفظ حالته السابقة للاسترجاع.
      await base44.asServiceRole.entities.Tenant.update(tid, { status: "cancelled", suspended_from: tx.status || "trial" });
      return Response.json({ ok: true });
    }

    // owner_resume يُعيد التفعيل من حالة «موقوف (expired)» أو «ملغي (cancelled)» باستعادة suspended_from.
    if (action === "today_attendance") {
      const recs = await base44.asServiceRole.entities.Attendance.filter(
        { employee_id: employeeId, date: todayISO() }, "-created_date", 5
      );
      return Response.json({ ok: true, today: recs[0] || null });
    }

    if (action === "clock_in") {
      const date = todayISO();
      const checkIn = String(body.check_in || "").trim();
      const recs = await base44.asServiceRole.entities.Attendance.filter(
        { employee_id: employeeId, date }, "-created_date", 5
      );
      const today = recs[0] || null;
      if (today) {
        const updated = await base44.asServiceRole.entities.Attendance.update(today.id, {
          check_in: checkIn, status: "present", source: "portal", employee_user_id: emp.user_id || null,
        });
        return Response.json({ ok: true, today: updated });
      }
      const created = await base44.asServiceRole.entities.Attendance.create({
        employee_id: employeeId, employee_user_id: emp.user_id || null, employee_name: empLabel,
        date, check_in: checkIn, status: "present", source: "portal", work_hours: 0,
      });
      return Response.json({ ok: true, today: created });
    }

    if (action === "clock_out") {
      const checkOut = String(body.check_out || "").trim();
      const workHours = Number(body.work_hours) || 0;
      const recs = await base44.asServiceRole.entities.Attendance.filter(
        { employee_id: employeeId, date: todayISO() }, "-created_date", 5
      );
      const today = recs[0] || null;
      if (!today) return Response.json({ ok: false, error: "no_check_in" }, { status: 400 });
      const updated = await base44.asServiceRole.entities.Attendance.update(today.id, {
        check_out: checkOut, work_hours: workHours, source: "portal",
      });
      return Response.json({ ok: true, today: updated });
    }

    if (action === "create_leave") {
      const p = body.payload || {};
      const created = await base44.asServiceRole.entities.LeaveRequest.create({
        ...p,
        employee_id: employeeId,
        employee_user_id: emp.user_id || null,
        employee_name: empLabel,
        status: "pending_manager",
        manager_status: "pending", hr_status: "pending", finance_status: "pending",
      });
      return Response.json({ ok: true, leave: created });
    }

    if (action === "create_loan") {
      const p = body.payload || {};
      const created = await base44.asServiceRole.entities.LoanRequest.create({
        ...p,
        employee_id: employeeId,
        employee_user_id: emp.user_id || null,
        employee_name: empLabel,
        status: "manager_approved", manager_status: "pending", hr_status: "pending", finance_status: "pending",
      });
      return Response.json({ ok: true, loan: created });
    }

    if (action === "create_trip") {
      const p = body.payload || {};
      const created = await base44.asServiceRole.entities.BusinessTrip.create({
        ...p,
        employee_id: employeeId,
        employee_user_id: emp.user_id || null,
        employee_name: empLabel,
        status: "pending",
      });
      return Response.json({ ok: true, trip: created });
    }

    return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}