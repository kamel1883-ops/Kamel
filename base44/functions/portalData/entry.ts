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

    const emp = await base44.asServiceRole.entities.Employee.get(employeeId);
    const empLabel = `${emp.employee_number} - ${emp.position}`;
    const isOwner = (emp.role_level || "employee") === "owner";

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

    // ====== إنشاء الطلبات — بوابة الموظف ======
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
      const list: any = await base44.asServiceRole.entities.LoanRequest.create({
        ...p,
        employee_id: employeeId,
        employee_user_id: emp.user_id || null,
        employee_name: empLabel,
        status: "manager_approved", manager_status: "pending", hr_status: "pending", finance_status: "pending",
      });
      return Response.json({ ok: true, loan: list });
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