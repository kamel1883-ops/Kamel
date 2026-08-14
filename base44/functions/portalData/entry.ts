import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyToken } from "../../shared/portalToken.ts";

// وصلة بيانات بوابة المالك/الموظف: تتحقق من رمز الجلسة الموقّع ثم ترد/تنشئ
// بيانات الموظف (طلباته، حضوره، إنذاراته) وإنشاء طلبات إجازة/سلفة/انتداب وبصمة الحضور،
// وكذلك إدارة كودات الخصم للمالك.
// كل العمليات تتم عبر خدمة-الدور لتفادي قيود RLS (لا يوجد مستخدم Base44 مسجّل).

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

    // المالك — جلسة مستقلة عن جدول الموظفين (employee_id = "owner")،
    // فلا يحتاج المالك سجل موظف ولا يظهر للعملاء في قوائم الموظفين.
    const isOwnerSession = employeeId === "owner";
    const emp = isOwnerSession
      ? { id: "owner", full_name: Deno.env.get("OWNER_FULL_NAME") || "مالك النظام", employee_number: "", position: "المالك", department: "الإدارة", role_level: "owner", user_id: null }
      : await base44.asServiceRole.entities.Employee.get(employeeId);
    const empLabel = isOwnerSession ? "مالك النظام" : `${emp.employee_number} - ${emp.position}`;
    // سلطة المالك مرتبطة بجلسة المالك فقط (employeeId === "owner"، Via verifyOwnerLogin) —
    // لا تُشتق من Employee.role_level القابل للتعديل لمنع التصعيد.
    const isOwner = isOwnerSession;

    if (action === "fetch") {
      const [orgs, leaves, loans, attendance, trips, warnings, performances, allPlans, settlements] = await Promise.all([
        base44.asServiceRole.entities.Organization.list("-created_date", 1),
        base44.asServiceRole.entities.LeaveRequest.filter({ employee_id: employeeId }, "-created_date", 200),
        base44.asServiceRole.entities.LoanRequest.filter({ employee_id: employeeId }, "-created_date", 200),
        base44.asServiceRole.entities.Attendance.filter({ employee_id: employeeId }, "-date", 10),
        base44.asServiceRole.entities.BusinessTrip.filter({ employee_id: employeeId }, "-created_date", 200),
        base44.asServiceRole.entities.Warning.filter({ employee_id: employeeId }, "-created_date", 100),
        base44.asServiceRole.entities.Performance.filter({ employee_id: employeeId }, "-created_date", 100),
        base44.asServiceRole.entities.TrainingPlan.list("-created_date", 500),
        base44.asServiceRole.entities.Settlement.filter({ employee_id: employeeId }, "-created_date", 200),
      ]);
      // يظهر للموظف فقط التقييمات التي اعتمدتها الموارد البشرية (مكتملة أو معتمدة)
      const reviews = (performances || []).filter((p) => p?.status === "completed" || p?.status === "acknowledged");
      // خطط التدريب المشمولة للموظف: ضمن employee_ids (JSON) أو employee_id القديم،
      // أو خطة على مستوى قسمه. تُستثنى المسودات والملغيات.
      const sid = String(employeeId);
      const trainings = (allPlans || []).filter((p: any) => {
        if (p?.status === "draft" || p?.status === "cancelled") return false;
        let ids: any[] = [];
        try { ids = JSON.parse(p.employee_ids || "[]"); if (!Array.isArray(ids)) ids = []; } catch { ids = []; }
        if (ids.includes(sid)) return true;
        if (p.employee_id === sid) return true;
        if (p?.scope === "department" && p.department && emp?.department && p.department === emp.department) return true;
        return false;
      });
      // مخالصات نهاية الخدمة المكتملة/المصروفة فقط (لإطلاع الموظف على مستحقاته المحفوظة)
      const paidSettlements = (settlements || []).filter((s: any) => s?.status === "completed");
      let branch: any = null;
      if (!isOwnerSession && emp?.branch_id) {
        try { branch = await base44.asServiceRole.entities.Branch.get(emp.branch_id); } catch { branch = null; }
      }
      return Response.json({
        ok: true,
        employee: emp,
        org: orgs?.[0] || null,
        branch,
        leaves, loans, attendance, trips, warnings,
        reviews, trainings,
        settlements: paidSettlements,
      });
    }

    // ====== إدارة العملاء — بوابة المالك ======
    if (action === "owner_list") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenants = await base44.asServiceRole.entities.Tenant.list("-created_date", 500);
      const stats = { total: 0, trials: 0, quotes: 0, paid: 0, suspended: 0, cancelled: 0, revenue: 0 };
      for (const x of tenants || []) {
        if (/\(المالك\)|\(owner\)/i.test(x?.name || "")) continue;
        stats.total++;
        if (x.status === "trial") stats.trials++;
        if (x.lead_source === "quote") stats.quotes++;
        if (x.status === "active") { stats.paid++; stats.revenue += Number(x.quoted_amount) || 0; }
        if (x.status === "expired") stats.suspended++;
        if (x.status === "cancelled") stats.cancelled++;
      }
      return Response.json({ ok: true, tenants: tenants || [], stats });
    }

    if (action === "owner_extend_trial") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenant_id = String(body.tenant_id || "");
      const days = Number(body.days) || 0;
      if (!tenant_id || days <= 0) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const t = await base44.asServiceRole.entities.Tenant.get(tenant_id);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const base = t.trial_end ? new Date(t.trial_end) : new Date(today);
      const start = base < today ? new Date(today) : base;
      start.setDate(start.getDate() + days);
      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        trial_end: start.toISOString().slice(0, 10),
        status: "trial",
        suspended_from: null,
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_suspend") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenant_id = String(body.tenant_id || "");
      if (!tenant_id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const t = await base44.asServiceRole.entities.Tenant.get(tenant_id);
      if (t.status !== "trial" && t.status !== "active") return Response.json({ ok: false, error: "invalid_status" }, { status: 400 });
      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        status: "expired",
        suspended_from: t.status,
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_activate_trial") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenant_id = String(body.tenant_id || "");
      if (!tenant_id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const todayStr = new Date().toISOString().slice(0, 10);
      const end = new Date(); end.setHours(0, 0, 0, 0); end.setDate(end.getDate() + 30);
      // تفعيل تجربة فقط: يبقى الحساب «تجربة» لمدة 30 يوماً من اليوم دون اشتراك سنوي ولا إيراد.
      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        status: "trial",
        plan: "trial",
        trial_start: todayStr,
        trial_end: end.toISOString().slice(0, 10),
        suspended_from: null,
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_activate") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenant_id = String(body.tenant_id || "");
      if (!tenant_id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const amount = Number(body.amount) || 0;
      const next = new Date(); next.setHours(0, 0, 0, 0); next.setFullYear(next.getFullYear() + 1);
      const subscription_end = String(body.subscription_end || next.toISOString().slice(0, 10));
      const t = await base44.asServiceRole.entities.Tenant.get(tenant_id);
      const todayStr = new Date().toISOString().slice(0, 10);
      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        status: "active",
        plan: "annual",
        subscription_end,
        contract_confirmed: true,
        suspended_from: null,
        quoted_amount: amount || Number(t.quoted_amount) || 0,
      });
      await base44.asServiceRole.entities.Subscription.create({
        tenant_id, tenant_name: t.name, plan: "annual",
        amount: amount || Number(t.quoted_amount) || 0,
        period_start: todayStr, period_end: subscription_end,
        payment_method: "direct", status: "paid", paid_date: todayStr,
        notes: "تفعيل اشتراك وتأكيد تعاقد — يدوي من بوابة المالك",
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_cancel") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenant_id = String(body.tenant_id || "");
      if (!tenant_id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const t = await base44.asServiceRole.entities.Tenant.get(tenant_id);
      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        status: "cancelled",
        suspended_from: t.status === "trial" || t.status === "active" ? t.status : "active",
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_restore") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenant_id = String(body.tenant_id || "");
      if (!tenant_id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const t = await base44.asServiceRole.entities.Tenant.get(tenant_id);
      const prev = t.suspended_from === "trial" ? "trial" : "active";
      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        status: prev,
        suspended_from: null,
      });
      return Response.json({ ok: true });
    }

    if (action === "owner_approve_admin") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const tenant_id = String(body.tenant_id || "");
      const approve = body.approve !== false;
      if (!tenant_id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const t = await base44.asServiceRole.entities.Tenant.get(tenant_id);
      const uid = String(t?.admin_user_id || "");
      if (approve) {
        if (!uid) return Response.json({ ok: false, error: "no_pending" }, { status: 400 });
        await base44.asServiceRole.entities.User.update(uid, { role: "admin" });
        await base44.asServiceRole.entities.Tenant.update(tenant_id, { admin_status: "approved" });
      } else {
        await base44.asServiceRole.entities.Tenant.update(tenant_id, { admin_status: "rejected", admin_user_id: "", admin_email: "" });
      }
      return Response.json({ ok: true });
    }

    // ====== استبيانات تجربة العميل — إدارة كاملة من بوابة المالك ======
    if (action === "owner_survey_list") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const surveys = await base44.asServiceRole.entities.CustomerSurvey.list("-created_date", 200);
      const respAll = await base44.asServiceRole.entities.CustomerSurveyResponse.list("-created_date", 1000);
      const counts: any = {};
      for (const r of respAll || []) counts[r.survey_id] = (counts[r.survey_id] || 0) + 1;
      return Response.json({ ok: true, surveys: surveys || [], responses_count: counts, responses: respAll || [] });
    }
    if (action === "owner_survey_save") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const id = String(body.id || "");
      const payload: any = {
        title: String(body.title || "").trim(),
        description: String(body.description || "").trim(),
        questions: String(body.questions || "[]"),
        status: String(body.status || "active"),
        notes: String(body.notes || ""),
      };
      if (!payload.title) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      if (id) await base44.asServiceRole.entities.CustomerSurvey.update(id, payload);
      else await base44.asServiceRole.entities.CustomerSurvey.create(payload);
      return Response.json({ ok: true });
    }
    if (action === "owner_survey_delete") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const id = String(body.id || "");
      if (!id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      await base44.asServiceRole.entities.CustomerSurvey.delete(id);
      return Response.json({ ok: true });
    }
    if (action === "owner_survey_responses") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const survey_id = String(body.survey_id || "");
      if (!survey_id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      const responses = await base44.asServiceRole.entities.CustomerSurveyResponse.filter({ survey_id }, "-created_date", 1000);
      return Response.json({ ok: true, responses: responses || [] });
    }

    // ====== كودات الخصم — إدارة كاملة من بوابة المالك ======
    if (action === "discount_list") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const codes = await base44.asServiceRole.entities.DiscountCode.list("-created_date", 200);
      return Response.json({ ok: true, codes: codes || [] });
    }
    if (action === "discount_save") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const id = String(body.id || "");
      const payload: any = {
        code: String(body.code || "").trim(),
        discount_percent: Number(body.discount_percent || 0),
        label: String(body.label || ""),
        max_uses: Number(body.max_uses || 0),
        status: String(body.status || "active"),
        notes: String(body.notes || ""),
      };
      if (!payload.code) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      if (id) await base44.asServiceRole.entities.DiscountCode.update(id, payload);
      else await base44.asServiceRole.entities.DiscountCode.create(payload);
      return Response.json({ ok: true });
    }
    if (action === "discount_delete") {
      if (!isOwner) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
      const id = String(body.id || "");
      if (!id) return Response.json({ ok: false, error: "missing" }, { status: 400 });
      await base44.asServiceRole.entities.DiscountCode.delete(id);
      return Response.json({ ok: true });
    }

    // ====== الحضور والبصمة — بوابة الموظف ======
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
      // ربط سجل الحضور بفرع الموظف (للتمييز في تقارير الحضور حسب الفرع)
      let branchId: any = null, branchName = "";
      if (!isOwnerSession && emp?.branch_id) {
        try { const br = await base44.asServiceRole.entities.Branch.get(emp.branch_id); branchId = br?.id || emp.branch_id; branchName = br?.name || emp.branch_name || ""; }
        catch { branchId = emp.branch_id; branchName = emp.branch_name || ""; }
      } else if (!isOwnerSession) { branchId = emp?.branch_id || null; branchName = emp?.branch_name || ""; }
      const today = recs[0] || null;
      if (today) {
        const updated = await base44.asServiceRole.entities.Attendance.update(today.id, {
          check_in: checkIn, status: "present", source: "portal", employee_user_id: emp.user_id || null,
          branch_id: branchId, branch_name: branchName,
        });
        return Response.json({ ok: true, today: updated });
      }
      const created = await base44.asServiceRole.entities.Attendance.create({
        employee_id: employeeId, employee_user_id: emp.user_id || null, employee_name: empLabel,
        date, check_in: checkIn, status: "present", source: "portal", work_hours: 0,
        branch_id: branchId, branch_name: branchName,
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

    // ====== إنشاء الطلبات — بوابة الموظف ======
    // يحلّ المدير المباشر للموظف (المعرّف بـ manager_id على نفس المنشأة) لربط الطلب به.
    const resolveManager = async () => {
      if (!emp?.manager_id) return { manager_id: null, manager_name: "" };
      try {
        const mgr = await base44.asServiceRole.entities.Employee.get(emp.manager_id);
        return { manager_id: mgr?.id || emp.manager_id, manager_name: mgr?.full_name || "" };
      } catch {
        return { manager_id: emp.manager_id, manager_name: "" };
      }
    };

    const pick = (obj: any, keys: string[]) => {
      const out: Record<string, any> = {};
      for (const k of keys) if (obj && obj[k] !== undefined) out[k] = obj[k];
      return out;
    };

    // يقبل روابط http/https فقط لحقول الملفات المرفوعة — يرفض javascript:/data: لمنع XSS المخزّن في وجه الإدارة
    const safeUrl = (u: any): string => {
      const s = String(u || "").trim();
      return /^https?:\/\//i.test(s) ? s : "";
    };

    if (action === "create_leave") {
      const p = pick(body.payload || {}, [
        "leave_type", "start_date", "end_date", "days_count", "reason",
        "medical_report_url", "is_full_clearance", "description",
      ]);
      p.medical_report_url = safeUrl(p.medical_report_url);
      const { manager_id, manager_name } = await resolveManager();
      const created = await base44.asServiceRole.entities.LeaveRequest.create({
        ...p,
        employee_id: employeeId,
        employee_user_id: emp.user_id || null,
        employee_name: empLabel,
        status: "pending_manager",
        manager_status: "pending", hr_status: "pending", finance_status: "pending",
        manager_id, manager_name,
      });
      return Response.json({ ok: true, leave: created });
    }

    if (action === "create_loan") {
      const p = pick(body.payload || {}, ["amount", "reason", "installment_count", "description"]);
      // السلف لا تمرّ على المدير المباشر — تتجه مباشرة لمعتمد الموارد البشرية ثم المالية.
      const loan: any = await base44.asServiceRole.entities.LoanRequest.create({
        ...p,
        employee_id: employeeId,
        employee_user_id: emp.user_id || null,
        employee_name: empLabel,
        status: "pending", manager_status: "pending", hr_status: "pending", finance_status: "pending",
        paid_amount: 0,
      });
      return Response.json({ ok: true, loan });
    }

    if (action === "create_trip") {
      const p = pick(body.payload || {}, [
        "trip_type", "destination", "purpose", "start_date", "end_date", "days_count",
        "transport_mode", "employee_note", "employee_document_url", "description",
      ]);
      p.employee_document_url = safeUrl(p.employee_document_url);
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