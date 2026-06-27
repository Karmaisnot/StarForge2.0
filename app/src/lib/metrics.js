// Pure aggregate helpers. Pages pass in the (already branch-scoped) collection
// and get back the figures they used to hard-code, so every KPI, chip count and
// table footer is derived from live data and updates the moment a row is added
// or removed. No React, no i18n — just numbers.

const sum = (list, sel) => list.reduce((a, x) => a + (sel(x) || 0), 0);
const avg = (list, sel) => (list.length ? Math.round(sum(list, sel) / list.length) : 0);
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

export function studentMetrics(list) {
  const debtors = list.filter((s) => s.debt > 0);
  return {
    total: list.length,
    active: list.filter((s) => !s.risk).length,
    debtors: debtors.length,
    debtSum: sum(debtors, (s) => s.debt),
    risk: list.filter((s) => s.risk).length,
    paid: list.filter((s) => s.pay === 'paid').length,
    partial: list.filter((s) => s.pay === 'partial').length,
    avgAtt: avg(list, (s) => s.att),
  };
}

export function teacherMetrics(list) {
  return {
    total: list.length,
    teaching: list.filter((t) => /o['‘]?qit/i.test(t.role)).length,
    assistants: list.filter((t) => /assistent/i.test(t.role)).length,
    active: list.filter((t) => t.st2 === 'active').length,
    review: list.filter((t) => t.st2 === 'review').length,
    fund: sum(list, (t) => t.sal),
    avgRating: list.length ? Math.round((sum(list, (t) => t.r) / list.length) * 10) / 10 : 0,
    students: sum(list, (t) => t.st),
  };
}

export function paymentMetrics(list) {
  const collectedRows = list.filter((x) => x.st2 !== 'debt');
  const income = sum(collectedRows, (x) => x.amt);
  const debt = sum(list.filter((x) => x.st2 === 'debt'), (x) => x.amt);
  return {
    count: list.length,
    income,
    debt,
    toCollect: income + debt,
    paid: list.filter((x) => x.st2 === 'ok').length,
    partial: list.filter((x) => x.st2 === 'partial').length,
    debtCount: list.filter((x) => x.st2 === 'debt').length,
    payRate: pct(collectedRows.length, list.length),
    avgCheck: collectedRows.length ? Math.round(income / collectedRows.length) : 0,
  };
}

export function parentMetrics(list) {
  return {
    total: list.length,
    telegram: list.filter((p) => p.tel).length,
    telegramPct: pct(list.filter((p) => p.tel).length, list.length),
    escalations: list.filter((p) => p.esc).length,
    debtors: list.filter((p) => p.debt > 0).length,
    noTelegram: list.filter((p) => !p.tel).length,
  };
}

export function branchMetrics(list) {
  const real = list.filter((b) => b.status !== 'opening');
  return {
    active: list.filter((b) => b.status === 'active').length,
    opening: list.filter((b) => b.status === 'opening'),
    review: list.filter((b) => b.status === 'review'),
    paused: list.filter((b) => b.status === 'paused').length,
    revenue: sum(real, (b) => b.rev),
    students: sum(list, (b) => b.st),
    staff: sum(list, (b) => b.t),
    avgAtt: real.length ? Math.round(sum(real, (b) => b.att) / real.length) : 0,
  };
}

export function groupMetrics(list) {
  return {
    total: list.length,
    active: list.filter((g) => g.st > 0).length,
    full: list.filter((g) => g.st >= g.cap * 0.9).length,
    freeSeats: list.filter((g) => g.st < g.cap).length,
    seatsLeft: sum(list, (g) => Math.max(0, g.cap - g.st)),
  };
}

export function hrMetrics(list) {
  const years = new Date().getFullYear();
  return {
    total: list.length,
    onLeave: list.filter((e) => e.st === 'leave').length,
    fund: sum(list, (e) => e.sal),
    full: list.filter((e) => e.type === 'full').length,
    avgTenure: list.length ? Math.round((sum(list, (e) => years - Number(e.since)) / list.length) * 10) / 10 : 0,
  };
}

export function leadMetrics(list) {
  const byStage = {};
  list.forEach((l) => { byStage[l.stage] = (byStage[l.stage] || 0) + 1; });
  const won = byStage.won || 0;
  return {
    total: list.length,
    active: list.filter((l) => l.stage !== 'won').length,
    won,
    byStage,
    conversion: pct(won, list.length),
  };
}

export function deptMetrics(list) {
  const TEACHING = ['Matematika', 'Ingliz tili', 'Tabiiy fanlar'];
  return {
    total: list.length,
    staff: sum(list, (d) => d.cnt),
    teaching: list.filter((d) => TEACHING.includes(d.n)).length,
    admin: list.filter((d) => !TEACHING.includes(d.n)).length,
  };
}

export function payrollMetrics(rows) {
  return {
    fund: sum(rows, (r) => r.base + r.cards + r.att + r.ret),
    base: sum(rows, (r) => r.base),
    bonus: sum(rows, (r) => r.cards + r.att + r.ret),
    staff: rows.length,
  };
}

// A 12-point monthly series that ramps up to `current`, so revenue/debt charts
// stay consistent with the live KPI instead of contradicting it. `shape` lets a
// caller invert it (debt trends down toward target).
export function trendSeries(current, points = 12, shape = 'up') {
  const out = [];
  for (let i = 0; i < points; i++) {
    const f = (i + 1) / points; // 0…1
    const ramp = shape === 'down' ? 1.6 - 0.6 * f : 0.62 + 0.38 * f;
    const wobble = 1 + 0.03 * Math.sin(i * 1.7);
    out.push(Math.round(current * ramp * wobble));
  }
  return out;
}
