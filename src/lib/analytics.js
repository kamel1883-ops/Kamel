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