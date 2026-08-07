// مساعدات حساب تحليلات الموارد البشرية ومعدلات الدوران

export const CHART_PALETTE = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#ec4899", "#64748b", "#14b8a6", "#f97316"];

export function headcountByDept(employees) {
  const map = {};
  for (const e of employees) {
    const d = e.department || "غير محدد";
    map[d] = (map[d] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function saudizationStats(employees) {
  let saudi = 0, expat = 0;
  for (const e of employees) {
    if (e.is_saudi) saudi++;
    else expat++;
  }
  const total = saudi + expat;
  const rate = total ? Math.round((saudi / total) * 100) : 0;
  return { saudi, expat, total, rate };
}

export function genderSplit(employees) {
  let male = 0, female = 0, unknown = 0;
  for (const e of employees) {
    if (e.gender === "male") male++;
    else if (e.gender === "female") female++;
    else unknown++;
  }
  const out = [{ name: "ذكور", value: male }];
  if (female) out.push({ name: "إناث", value: female });
  if (unknown) out.push({ name: "غير محدد", value: unknown });
  return out;
}

export function statusSplit(employees) {
  const map = { active: 0, on_leave: 0, terminated: 0, resigned: 0 };
  for (const e of employees) {
    map[e.status] = (map[e.status] || 0) + 1;
  }
  return [
    { name: "على رأس العمل", value: map.active },
    { name: "في إجازة", value: map.on_leave },
    { name: "منهي", value: map.terminated },
    { name: "مستقيل", value: map.resigned },
  ].filter((x) => x.value > 0);
}

// معدل الدوران: (المغادرين خلال السنة / متوسط عدد الموظفين) * 100
export function turnoverStats(employees, year) {
  let hires = 0, exits = 0;
  for (const e of employees) {
    if (e.hire_date && new Date(e.hire_date).getFullYear() === year) hires++;
    if ((e.status === "terminated" || e.status === "resigned") && e.termination_date && new Date(e.termination_date).getFullYear() === year) exits++;
  }
  const activeNow = employees.filter((e) => e.status === "active" || e.status === "on_leave").length;
  const avgHeadcount = activeNow + exits;
  const turnoverRate = avgHeadcount ? (exits / avgHeadcount) * 100 : 0;
  return { hires, exits, activeNow, turnoverRate: Math.round(turnoverRate * 10) / 10 };
}

export function tenureDistribution(employees) {
  const buckets = [
    { name: "أقل من سنة", value: 0, min: 0, max: 1 },
    { name: "1-3 سنوات", value: 0, min: 1, max: 3 },
    { name: "3-5 سنوات", value: 0, min: 3, max: 5 },
    { name: "5-10 سنوات", value: 0, min: 5, max: 10 },
    { name: "أكثر من 10", value: 0, min: 10, max: 999 },
  ];
  const now = new Date();
  for (const e of employees) {
    if (!e.hire_date) continue;
    const yrs = (now - new Date(e.hire_date)) / (1000 * 60 * 60 * 24 * 365.25);
    for (const b of buckets) {
      if (yrs >= b.min && yrs < b.max) { b.value++; break; }
    }
  }
  return buckets.map(({ name, value }) => ({ name, value }));
}

export function avgSalaryByDept(employees) {
  const map = {};
  for (const e of employees) {
    if (e.status !== "active" && e.status !== "on_leave") continue;
    const d = e.department || "غير محدد";
    if (!map[d]) map[d] = { sum: 0, count: 0 };
    map[d].sum += (Number(e.base_salary) || 0) + (Number(e.housing_allowance) || 0) + (Number(e.transport_allowance) || 0) + (Number(e.other_allowances) || 0);
    map[d].count++;
  }
  return Object.entries(map).map(([name, v]) => ({ name, value: Math.round(v.sum / v.count) })).sort((a, b) => b.value - a.value);
}

export function attendanceRate(attendance) {
  if (!attendance || attendance.length === 0) return 0;
  const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  return Math.round((present / attendance.length) * 100);
}

export function avgPerformanceByDept(reviews) {
  const map = {};
  for (const r of reviews) {
    if (!r.overall_rating) continue;
    const d = r.department || "غير محدد";
    if (!map[d]) map[d] = { sum: 0, count: 0 };
    map[d].sum += Number(r.overall_rating);
    map[d].count++;
  }
  return Object.entries(map).map(([name, v]) => ({ name, value: Math.round((v.sum / v.count) * 100) / 100 })).sort((a, b) => b.value - a.value);
}

// معدل الدوران حسب فترة (شهور): exits خلال النافذة / متوسط القوى العاملة
export function turnoverWindow(employees, monthsBack) {
  const now = new Date();
  const threshold = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
  let hires = 0, exits = 0;
  const exitDepts = {};
  for (const e of employees) {
    if (e.hire_date && new Date(e.hire_date) >= threshold) hires++;
    if ((e.status === "terminated" || e.status === "resigned") && e.termination_date && new Date(e.termination_date) >= threshold) {
      exits++;
      const d = e.department || "غير محدد";
      exitDepts[d] = (exitDepts[d] || 0) + 1;
    }
  }
  const activeNow = employees.filter((e) => e.status === "active" || e.status === "on_leave").length;
  const avgHeadcount = activeNow + exits;
  const turnoverRate = avgHeadcount ? (exits / avgHeadcount) * 100 : 0;
  return {
    hires, exits, activeNow, avgHeadcount,
    turnoverRate: Math.round(turnoverRate * 10) / 10,
    retentionRate: avgHeadcount ? Math.round(((avgHeadcount - exits) / avgHeadcount) * 1000) / 10 : 100,
    byDept: Object.entries(exitDepts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
  };
}

// أسباب المغادرة من بيانات الموظف + مقابلات المغادرة
export function exitReasonsBreakdown(employees, exitInterviews) {
  const map = {};
  const inc = (k) => { map[k] = (map[k] || 0) + 1; };
  for (const e of employees) {
    if (e.status !== "terminated" && e.status !== "resigned") continue;
    if (e.termination_reason && e.termination_reason !== "none") inc(e.termination_reason);
  }
  for (const x of (exitInterviews || [])) {
    if (x.primary_reason) inc(x.primary_reason);
  }
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

// متوسط مدة الخدمة عند المغادرة (بالأيام)
export function avgTenureAtExit(employees) {
  const list = employees.filter((e) => (e.status === "terminated" || e.status === "resigned") && e.hire_date && e.termination_date);
  if (!list.length) return 0;
  const total = list.reduce((s, e) => s + (new Date(e.termination_date) - new Date(e.hire_date)), 0);
  return Math.round(total / list.length / (1000 * 60 * 60 * 24));
}

// متوسط رضا الموظف المغادر من مقابلات المغادرة
export function exitSatisfaction(exitInterviews) {
  const list = (exitInterviews || []).filter((x) => x.satisfaction_salary || x.satisfaction_benefits || x.satisfaction_environment || x.satisfaction_management);
  if (!list.length) return { salary: 0, benefits: 0, environment: 0, management: 0, overall: 0, recommend: 0 };
  const avg = (key) => {
    const arr = list.filter((x) => x[key]).map((x) => Number(x[key]));
    return arr.length ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100 : 0;
  };
  const salary = avg("satisfaction_salary");
  const benefits = avg("satisfaction_benefits");
  const environment = avg("satisfaction_environment");
  const management = avg("satisfaction_management");
  const recommend = avg("would_recommend");
  const overall = Math.round(((salary + benefits + environment + management) / 4) * 100) / 100;
  return { salary, benefits, environment, management, overall, recommend };
}

// أسباب الدوران حسب الإدارة (للإدارة الأكثر خطراً)
export function highRiskDepartments(employees, monthsBack = 12) {
  const now = new Date();
  const threshold = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
  const depts = {};
  for (const e of employees) {
    const d = e.department || "غير محدد";
    if (!depts[d]) depts[d] = { headcount: 0, exits: 0 };
    if (e.status === "active" || e.status === "on_leave") depts[d].headcount++;
    if ((e.status === "terminated" || e.status === "resigned") && e.termination_date && new Date(e.termination_date) >= threshold) depts[d].exits++;
  }
  return Object.entries(depts)
    .map(([name, v]) => ({ name, ...v, rate: v.headcount + v.exits ? Math.round((v.exits / (v.headcount + v.exits)) * 1000) / 10 : 0 }))
    .filter((d) => d.exits > 0)
    .sort((a, b) => b.rate - a.rate);
}