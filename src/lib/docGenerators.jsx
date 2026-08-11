import React from "react";
import { base44 } from "@/api/base44Client";
import { renderToPdfBlob, uploadPdfBlob } from "@/lib/pdfDocs";
import { computeEntitlement, sumUsedDays, getEmployeeAnnualDays } from "@/lib/leaveBalance";
import LeaveClearanceDoc from "@/components/docs/LeaveClearanceDoc";
import LoanStatementDoc from "@/components/docs/LoanStatementDoc";
import BusinessTripApprovalDoc from "@/components/docs/BusinessTripApprovalDoc";

// مخالصة تصفية إجازة — تُولّد PDF، تُرفع، وتُخزّن على الطلب + تُرجع الرابط
export async function generateLeaveSettlement(leave, emp, org, allLeavesForEmp) {
  const annualDays = getEmployeeAnnualDays(emp, org);
  const usedBefore = Number(emp?.prior_used_leave) || 0;
  const bBefore = Math.max(0, Math.round((annualDays - usedBefore) * 10) / 10);
  const granted = Number(leave?.balance_deducted) || 0;
  const bAfter = Math.max(0, Math.round((bBefore - granted) * 10) / 10);
  const mw = (Number(emp?.base_salary) || 0) + (Number(emp?.housing_allowance) || 0) + (Number(emp?.transport_allowance) || 0) + (Number(emp?.other_allowances) || 0);
  const dailyWage = mw / 30;
  const daysCash = (leave?.leave_type === "annual" || leave?.is_full_clearance) ? Math.round(granted * dailyWage * 100) / 100 : 0;

  const blob = await renderToPdfBlob(
    <LeaveClearanceDoc employee={emp} leave={leave} org={org} balanceBefore={bBefore} balanceAfter={bAfter} daysCash={daysCash} dailyWage={dailyWage} />
  );
  const url = await uploadPdfBlob(blob, `leave-settlement-${leave.id}.pdf`);
  await base44.entities.LeaveRequest.update(leave.id, {
    settlement_pdf_url: url,
    balance_before: bBefore,
    balance_after: bAfter,
  });
  return url;
}

// كشف سلفة — تُولّد PDF محدّث بالمدفوع/المتبقي وتُخزّن على الطلب
export async function generateLoanStatement(loan, emp, org) {
  const blob = await renderToPdfBlob(<LoanStatementDoc employee={emp} loan={loan} org={org} />);
  const url = await uploadPdfBlob(blob, `loan-statement-${loan.id}.pdf`);
  await base44.entities.LoanRequest.update(loan.id, { statement_pdf_url: url });
  return url;
}

// مستند موافقة الانتداب — يُولّد PDF بتفاصيل الرحلة والملاحظات ويُخزّن على الطلب، ويُرجع الرابط
export async function generateBusinessTripApproval(trip, emp, org) {
  const blob = await renderToPdfBlob(<BusinessTripApprovalDoc employee={emp} trip={trip} org={org} />);
  const url = await uploadPdfBlob(blob, `trip-approval-${trip.id}.pdf`);
  await base44.entities.BusinessTrip.update(trip.id, { approval_pdf_url: url });
  return url;
}