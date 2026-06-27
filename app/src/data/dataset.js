// Single source of truth for the whole console's seed data.
//
// Everything is generated from one deterministic, seeded pass so the numbers
// reconcile: branches → teachers → groups → students, with parents / payments /
// HR / departments / payroll derived from those. Because the PRNG is seeded the
// output is byte-stable across reloads, which keeps the persisted store and the
// tests reproducible. Proper nouns (people, branches, methods) are real-looking
// Uzbek names and stay untranslated, exactly like the original hand-written
// seeds. KPIs are never hard-coded in the pages — they are computed from these
// collections (see lib/metrics.js), so adding or removing a row updates every
// total that depends on it.

// --- deterministic PRNG (mulberry32) -------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260601);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const rint = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const chance = (p) => rnd() < p;
const round = (n, step = 1000) => Math.round(n / step) * step;

// --- name pools ----------------------------------------------------------
const FIRST_M = ['Akmal', 'Sherzod', 'Otabek', 'Diyor', 'Jasur', 'Rustam', 'Sardor', 'Bekzod', 'Aziz', 'Bobur', 'Temur', 'Jahongir', 'Sanjar', 'Ulug‘bek', 'Doston', 'Farrux', 'Shoxrux', 'Islom', 'Kamol', 'Davron', 'Nodir', 'Olim', 'Anvar', 'Bahrom', 'Eldor'];
const FIRST_F = ['Madina', 'Sevinch', 'Zilola', 'Dilnoza', 'Nilufar', 'Gulnora', 'Sevara', 'Malika', 'Nargiza', 'Dilfuza', 'Kamola', 'Shahnoza', 'Zarnigor', 'Maftuna', 'Oysha', 'Munira', 'Feruza', 'Laylo', 'Robiya', 'Sabina', 'Aziza', 'Nozima', 'Husnida', 'Charos', 'Mohira'];
// Surnames in agreeing male / female forms so a family stays consistent.
const SUR = [
  ['Akbarov', 'Akbarova'], ['Azizov', 'Azizova'], ['Bakirov', 'Bakirova'], ['Davronov', 'Davronova'],
  ['Eshmatov', 'Eshmatova'], ['Fayzullayev', 'Fayzullayeva'], ['G‘aniyev', 'G‘aniyeva'], ['Halimov', 'Halimova'],
  ['Ibragimov', 'Ibragimova'], ['Karimov', 'Karimova'], ['Olimov', 'Olimova'], ['Yusupov', 'Yusupova'],
  ['Rashidov', 'Rashidova'], ['Tursunov', 'Tursunova'], ['Saidov', 'Saidova'], ['Yo‘ldoshev', 'Yo‘ldosheva'],
  ['Aliyev', 'Aliyeva'], ['Rahimov', 'Rahimova'], ['Nazarov', 'Nazarova'], ['Toshev', 'Tosheva'],
  ['Sobirov', 'Sobirova'], ['Norov', 'Norova'], ['Mirzayev', 'Mirzayeva'], ['Qodirov', 'Qodirova'], ['Sultonov', 'Sultonova'],
];

const used = new Set();
function makeName(order /* 'sur-first' | 'first-sur' */) {
  for (let i = 0; i < 40; i++) {
    const male = chance(0.5);
    const sIdx = rint(0, SUR.length - 1);
    const sur = SUR[sIdx][male ? 0 : 1];
    const first = pick(male ? FIRST_M : FIRST_F);
    const name = order === 'first-sur' ? `${first} ${sur}` : `${sur} ${first}`;
    if (!used.has(name)) {
      used.add(name);
      return { name, male, surIdx: sIdx };
    }
  }
  // Fallback that is still unique even after exhausting easy combos.
  const tag = used.size;
  return { name: `${SUR[tag % SUR.length][0]} ${FIRST_M[tag % FIRST_M.length]}-${tag}`, male: true, surIdx: tag % SUR.length };
}

// --- branches ------------------------------------------------------------
// Target student head-count per branch drives how many students we generate.
const BRANCH_BASE = [
  { id: 'yun', name: 'Yunusobod', mgr: 'Dilnoza Yo‘ldosheva', target: 38, tone: 'var(--sf-success)', status: 'active', churn: 2.8 },
  { id: 'chl', name: 'Chilonzor', mgr: 'Rustam Olimov', target: 34, tone: 'var(--sf-success)', status: 'active', churn: 3.1 },
  { id: 'mir', name: 'Mirobod', mgr: 'Gulnora Saidova', target: 30, tone: 'var(--sf-warn)', status: 'active', churn: 3.4 },
  { id: 'seb', name: 'Sebzor', mgr: 'Akmal Yusupov', target: 22, tone: 'var(--sf-danger)', status: 'review', churn: 6.2 },
  { id: 'olm', name: 'Olmazor', mgr: '—', target: 0, tone: 'var(--sf-muted)', status: 'opening', churn: 0 },
];
const ACTIVE_BRANCHES = BRANCH_BASE.filter((b) => b.target > 0);
export const BRANCH_NAMES = ACTIVE_BRANCHES.map((b) => b.name);
const branchNameById = Object.fromEntries(BRANCH_BASE.map((b) => [b.id, b.name]));

// --- subjects / departments ---------------------------------------------
const SUBJECTS = [
  { sub: 'Matematika', dept: 'Matematika', fee: 600000, dtm: 'Matematika · DTM', tone: 'var(--sf-primary)' },
  { sub: 'Geometriya', dept: 'Matematika', fee: 650000, dtm: 'Geometriya', tone: 'var(--sf-accent)' },
  { sub: 'Ingliz tili', dept: 'Ingliz tili', fee: 850000, dtm: 'Ingliz B2 · Intensiv', tone: 'var(--sf-success)' },
  { sub: 'Fizika', dept: 'Tabiiy fanlar', fee: 700000, dtm: 'Fizika · DTM', tone: 'var(--sf-ink-2)' },
  { sub: 'Kimyo', dept: 'Tabiiy fanlar', fee: 700000, dtm: 'Kimyo · DTM', tone: 'var(--sf-warn)' },
];
const SCHEDULES = ['Du/Se/Pa · 09:00', 'Cho/Pa · 14:00', 'Du/Pa · 11:30', 'Har kuni · 16:00', 'Se/Pa/Sh · 10:00', 'Du/Cho/Ju · 15:30'];
const GRADES = ['7-A', '8-B', '9-B', '9-A', '10-V', '11-A'];

// --- teachers ------------------------------------------------------------
// ~2 teachers per subject per active branch, biased to bigger branches.
const TEACHER_ROLES = ['Katta o‘qituvchi', 'O‘qituvchi', 'O‘qituvchi', 'Assistent'];
const teachers = [];
ACTIVE_BRANCHES.forEach((b) => {
  const count = Math.max(4, Math.round(b.target / 5));
  for (let i = 0; i < count; i++) {
    const { name } = makeName('first-sur');
    const s = SUBJECTS[(teachers.length + i) % SUBJECTS.length];
    const role = pick(TEACHER_ROLES);
    const att = rint(82, 98);
    const review = att < 86 || chance(0.08);
    const assistant = role === 'Assistent';
    teachers.push({
      n: name,
      role,
      b: b.name,
      sub: s.sub,
      g: assistant ? rint(1, 2) : rint(2, 5),
      st: 0, // filled after students are assigned
      att,
      up: rint(4, 24),
      down: rint(0, 8),
      r: Math.round((review ? rint(38, 44) : rint(44, 50)) ) / 10,
      sal: round(assistant ? rint(3800000, 4600000) : role === 'Katta o‘qituvchi' ? rint(7800000, 9200000) : rint(6600000, 8000000)),
      st2: review ? 'review' : 'active',
    });
  }
});

// --- groups --------------------------------------------------------------
// Each active branch gets a spread of groups, each owned by a same-branch
// teacher of the matching subject.
const groups = [];
ACTIVE_BRANCHES.forEach((b) => {
  const branchTeachers = teachers.filter((tc) => tc.b === b.name);
  const count = Math.max(4, Math.round(b.target / 6));
  for (let i = 0; i < count; i++) {
    const s = SUBJECTS[(groups.length + i) % SUBJECTS.length];
    const owner = branchTeachers.filter((tc) => tc.sub === s.sub)[0] || pick(branchTeachers);
    const label = chance(0.5) ? `${pick(GRADES)} ${s.sub.split(' ')[0]}` : s.dtm;
    if (groups.some((g) => g.n === label && g.b === b.name)) continue;
    groups.push({
      n: label,
      t: owner ? owner.n : '—',
      b: b.name,
      st: 0,
      cap: rint(18, 26),
      att: rint(84, 98),
      sch: pick(SCHEDULES),
      fee: s.fee,
      tone: s.tone,
    });
  }
});

// --- students ------------------------------------------------------------
const PAY_STATES = ['paid', 'paid', 'paid', 'paid', 'partial', 'debt'];
const students = [];
const parents = [];
let studentSeq = 41;
ACTIVE_BRANCHES.forEach((b) => {
  const branchGroups = groups.filter((g) => g.b === b.name);
  for (let i = 0; i < b.target; i++) {
    const person = makeName('sur-first');
    const grp = pick(branchGroups);
    const pay = pick(PAY_STATES);
    const att = pay === 'debt' ? rint(60, 88) : rint(82, 99);
    const debt = pay === 'paid' ? 0 : pay === 'partial' ? round(rint(2, 5) * 100000) : round(rint(6, 14) * 100000);
    const risk = (pay === 'debt' && att < 78) || (att < 70);
    const id = String(studentSeq++).padStart(5, '0');
    students.push({
      n: person.name,
      id,
      g: grp ? grp.n : '—',
      b: b.name,
      att,
      up: rint(0, 14),
      down: pay === 'debt' ? rint(1, 5) : rint(0, 2),
      pay,
      debt,
      par: '', // filled below once the parent exists
      risk: risk || undefined,
    });

    // One guardian per student, sharing the family surname.
    const motherIsParent = chance(0.6);
    const parentSur = SUR[person.surIdx][motherIsParent ? 1 : 0];
    const parentName = `${parentSur} ${pick(motherIsParent ? FIRST_F : FIRST_M)}`;
    students[students.length - 1].par = parentName;
    parents.push({
      n: parentName,
      ch: person.name,
      rel: motherIsParent ? 'Ona' : 'Ota',
      ph: `+998 ${pick(['90', '91', '93', '94', '95', '97', '99'])} ${rint(100, 999)} ${rint(10, 99)} ${rint(10, 99)}`,
      b: b.name,
      tel: chance(0.82),
      debt,
      msgs: rint(0, 16),
      esc: (risk && debt > 0) || undefined,
    });
  }
});

// Fold student counts back into groups / teachers / branches.
groups.forEach((g) => {
  g.st = Math.min(g.cap, students.filter((s) => s.b === g.b && s.g === g.n).length);
});
teachers.forEach((tc) => {
  const owned = groups.filter((g) => g.t === tc.n);
  tc.g = owned.length || tc.g;
  tc.st = students.filter((s) => s.b === tc.b && owned.some((g) => g.n === s.g)).length;
});

// --- branch aggregates ---------------------------------------------------
export const BRANCHES = BRANCH_BASE.map((b) => {
  const bStudents = students.filter((s) => s.b === b.name);
  const bTeachers = teachers.filter((tc) => tc.b === b.name);
  const rev = bStudents.reduce((sum, s) => {
    const g = groups.find((gr) => gr.b === s.b && gr.n === s.g);
    return sum + (s.pay === 'debt' ? 0 : g ? g.fee : 0);
  }, 0);
  const att = bStudents.length ? Math.round(bStudents.reduce((a, s) => a + s.att, 0) / bStudents.length) : 0;
  return {
    n: b.name,
    mgr: b.mgr,
    st: bStudents.length,
    t: bTeachers.length,
    rev,
    att,
    churn: b.churn,
    tone: b.tone,
    status: b.status,
  };
});

// Sidebar branch switcher: id-keyed with live student counts + an "all" entry.
export const BRANCH_SWITCHER = [
  { id: 'all', name: '__ALL__', students: students.length, branches: ACTIVE_BRANCHES.length },
  ...BRANCH_BASE.filter((b) => b.target > 0).map((b) => ({
    id: b.id,
    name: b.name,
    students: students.filter((s) => s.b === b.name).length,
  })),
];
export const BRANCH_ID_TO_NAME = branchNameById;

// --- payments ------------------------------------------------------------
const METHODS = ['Click', 'Payme', 'Uzcard', 'Naqd'];
const pad2 = (x) => String(x).padStart(2, '0');
export const PAYMENTS = students.map((s, i) => {
  const g = groups.find((gr) => gr.b === s.b && gr.n === s.g);
  const fee = g ? g.fee : 600000;
  const st2 = s.pay === 'paid' ? 'ok' : s.pay; // 'ok' | 'partial' | 'debt'
  const day = 19 - (i % 12);
  return {
    id: `tx-seed-${i}`,
    st: s.n,
    g: s.g,
    b: s.b,
    amt: st2 === 'partial' ? fee - s.debt : st2 === 'debt' ? fee : fee,
    m: st2 === 'debt' ? '—' : pick(METHODS),
    d: st2 === 'debt' ? `Muddat ${pad2(Math.max(1, day))}.05` : `${pad2(Math.max(1, day))}.05 ${pad2(rint(8, 18))}:${pad2(rint(0, 59))}`,
    st2,
  };
});

// --- leads ---------------------------------------------------------------
const LEAD_SOURCES = ['Instagram', 'Telegram', 'Tavsiya', 'Sayt', 'Telefon'];
const LEAD_INTEREST = ['Matematika', 'Ingliz B2', 'Fizika', 'Kimyo', 'Geometriya'];
const LEAD_STAGES = ['new', 'new', 'new', 'contact', 'contact', 'trial', 'won'];
const LEAD_TIMES = ['2 soat', '5 soat', 'Kecha', '2 kun', 'Bugun', '24 May', '23 May'];
export const LEADS = Array.from({ length: 34 }, (_, i) => {
  const person = makeName('sur-first');
  return {
    id: `lead-seed-${i}`,
    n: person.name,
    src: pick(LEAD_SOURCES),
    int: pick(LEAD_INTEREST),
    tm: pick(LEAD_TIMES),
    stage: LEAD_STAGES[i % LEAD_STAGES.length],
    b: 'Yunusobod',
  };
});

// --- HR employees --------------------------------------------------------
// Teachers double as employees; admin departments add the rest of the org.
const POS_BY_ROLE = { 'Katta o‘qituvchi': 'Katta o‘qituvchi', 'O‘qituvchi': 'O‘qituvchi', Assistent: 'Assistent' };
const CONTRACT = ['full', 'full', 'full', 'half', 'hourly'];
const teacherEmployees = teachers.map((tc) => ({
  n: tc.n,
  pos: POS_BY_ROLE[tc.role] || 'O‘qituvchi',
  dept: SUBJECTS.find((s) => s.sub === tc.sub)?.dept || 'Matematika',
  b: tc.b,
  type: tc.role === 'Assistent' ? 'half' : 'full',
  sal: tc.sal,
  since: String(rint(2020, 2025)),
  st: tc.st2 === 'review' ? 'active' : chance(0.06) ? 'leave' : 'active',
}));
const ADMIN_DEPTS = [
  { dept: 'Qabul · Reception', positions: ['Reception boshlig‘i', 'Reception', 'Reception'], n: 6 },
  { dept: 'Sotuv · Marketing', positions: ['SMM menejer', 'Sotuv menejer', 'Marketolog'], n: 5 },
  { dept: 'Moliya · Buxgalteriya', positions: ['Bosh buxgalter', 'Buxgalter', 'Kassir'], n: 3 },
];
const adminEmployees = [];
ADMIN_DEPTS.forEach((d) => {
  for (let i = 0; i < d.n; i++) {
    const { name } = makeName('first-sur');
    adminEmployees.push({
      n: name,
      pos: d.positions[i % d.positions.length],
      dept: d.dept,
      b: pick(BRANCH_NAMES),
      type: pick(CONTRACT),
      sal: round(rint(3600000, 6400000)),
      since: String(rint(2021, 2025)),
      st: chance(0.05) ? 'leave' : 'active',
    });
  }
});
export const HR_EMPLOYEES = [...teacherEmployees, ...adminEmployees];

// --- departments ---------------------------------------------------------
const DEPT_COLORS = {
  Matematika: 'var(--sf-primary)',
  'Ingliz tili': 'var(--sf-success)',
  'Tabiiy fanlar': 'var(--sf-accent)',
  'Qabul · Reception': 'var(--sf-ink-2)',
  'Sotuv · Marketing': 'var(--sf-warn)',
  'Moliya · Buxgalteriya': 'var(--sf-success)',
};
const DEPT_ORDER = ['Matematika', 'Ingliz tili', 'Tabiiy fanlar', 'Qabul · Reception', 'Sotuv · Marketing', 'Moliya · Buxgalteriya'];
const SUBJECT_DEPTS = ['Matematika', 'Ingliz tili', 'Tabiiy fanlar'];
export const DEPARTMENTS = DEPT_ORDER.map((dept) => {
  const members = HR_EMPLOYEES.filter((e) => e.dept === dept).map((e) => e.n);
  const head = members[0] || '—';
  const groupCount = SUBJECT_DEPTS.includes(dept)
    ? groups.filter((g) => SUBJECTS.find((s) => s.sub === teachers.find((tc) => tc.n === g.t)?.sub)?.dept === dept).length
    : 0;
  return { n: dept, head, cnt: members.length, groups: groupCount, color: DEPT_COLORS[dept] || 'var(--sf-primary)', members };
});

// --- payroll -------------------------------------------------------------
// Derived from every employee's salary, split into base + the three bonus
// columns so the totals row reconciles with the HR fund.
export const PAYROLL_ROWS = HR_EMPLOYEES.map((e) => {
  const base = round(e.sal * 0.7);
  const cards = e.dept === 'Qabul · Reception' || e.dept === 'Moliya · Buxgalteriya' ? 0 : round(e.sal * (0.08 + rnd() * 0.08));
  const att = round(e.sal * 0.07);
  const ret = chance(0.6) ? round(e.sal * (0.05 + rnd() * 0.08)) : 0;
  return { n: e.n, dept: e.dept, base, cards, att, ret };
});

// --- approvals (manager ops queue) --------------------------------------
export const APPROVALS = [
  { id: 'ap1', t: 'To‘lov qaytarish', who: students[4]?.n || 'Akbarov Akmal', sub: 'Ortiqcha to‘lov · iyun', amt: 600000, by: teachers[0]?.n || 'Nigora Karimova', kind: 'refund', tone: 'var(--sf-success)' },
  { id: 'ap2', t: 'Ta‘til so‘rovi', who: teachers[2]?.n || 'Yusupova Nargiza', sub: '24–26 May · 3 kun · oilaviy', by: 'O‘zi', kind: 'leave', tone: 'var(--sf-primary)' },
  { id: 'ap3', t: 'Yangi guruh ochish', who: 'Ingliz B2 · Intensiv', sub: `${teachers[1]?.n || 'Aziz Tursunov'} · 18 o‘rin`, by: teachers[1]?.n || 'Aziz Tursunov', kind: 'group', tone: 'var(--sf-accent)' },
  { id: 'ap4', t: 'Guruhdan chiqarish', who: students.find((s) => s.risk)?.n || 'Eshmatov Otabek', sub: '3+ oy qarz · 9-B', amt: 1200000, by: teachers[0]?.n || 'Nigora Karimova', kind: 'remove', tone: 'var(--sf-danger)' },
  { id: 'ap5', t: 'Maosh oshirish', who: teachers[4]?.n || 'Sevara Olimova', sub: 'Assistent → O‘qituvchi', amt: 7200000, by: 'HR', kind: 'salary', tone: 'var(--sf-warn)' },
  { id: 'ap6', t: 'Chegirma', who: students[7]?.n || 'Halimova Zilola', sub: 'Aka-uka · 15% · doimiy', by: teachers[0]?.n || 'Nigora Karimova', kind: 'discount', tone: 'var(--sf-primary)' },
  { id: 'ap7', t: 'Material xarid', who: 'Printer kartrij ×4', sub: 'Yunusobod · ofis', amt: 1800000, by: 'Ofis', kind: 'buy', tone: 'var(--sf-ink-2)' },
];

// --- exports the pages read ---------------------------------------------
export const STUDENTS = students;
export const TEACHERS = teachers;
export const GROUPS = groups;
export const PARENTS = parents;
