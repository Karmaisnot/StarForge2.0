// Shared seed data for collections that more than one screen reads or mutates.
// Keeping a single definition here means the Dashboard widgets and the full
// pages stay in sync and there is no per-page seeding race in the store.

export const GROUPS = [
  { n: '9-B Algebra', t: 'Nigora Karimova', b: 'Yunusobod', st: 24, cap: 26, att: 94, sch: 'Du/Se/Pa · 09:00', fee: 600000, tone: 'var(--sf-primary)' },
  { n: 'Algebra Mid', t: 'Nigora Karimova', b: 'Yunusobod', st: 21, cap: 24, att: 96, sch: 'Cho/Pa · 14:00', fee: 600000, tone: 'var(--sf-primary)' },
  { n: '10-V Geometriya', t: 'Bobur Aliyev', b: 'Chilonzor', st: 19, cap: 22, att: 88, sch: 'Du/Pa · 11:30', fee: 650000, tone: 'var(--sf-accent)' },
  { n: 'Ingliz B2 · Intensiv', t: 'Aziz Tursunov', b: 'Mirobod', st: 16, cap: 18, att: 92, sch: 'Har kuni · 16:00', fee: 850000, tone: 'var(--sf-success)' },
  { n: 'Fizika · DTM', t: 'Malika Yusupova', b: 'Sebzor', st: 14, cap: 20, att: 85, sch: 'Se/Pa/Sh · 10:00', fee: 700000, tone: 'var(--sf-ink-2)' },
];

export const BRANCHES = [
  { n: 'Yunusobod', mgr: 'Dilnoza Yo‘ldosheva', st: 512, t: 16, rev: 342000000, att: 94, churn: 2.8, tone: 'var(--sf-success)', status: 'active' },
  { n: 'Chilonzor', mgr: 'Rustam Olimov', st: 486, t: 15, rev: 318000000, att: 92, churn: 3.1, tone: 'var(--sf-success)', status: 'active' },
  { n: 'Mirobod', mgr: 'Gulnora Saidova', st: 478, t: 14, rev: 308000000, att: 90, churn: 3.4, tone: 'var(--sf-warn)', status: 'active' },
  { n: 'Sebzor', mgr: 'Akmal Yusupov', st: 366, t: 9, rev: 216000000, att: 87, churn: 6.2, tone: 'var(--sf-danger)', status: 'review' },
  { n: 'Olmazor', mgr: '—', st: 0, t: 0, rev: 0, att: 0, churn: 0, tone: 'var(--sf-muted)', status: 'opening' },
];

export const APPROVALS = [
  { id: 'ap1', t: 'To‘lov qaytarish', who: 'Akbarov Akmal', sub: 'Ortiqcha to‘lov · iyun', amt: 600000, by: 'Nigora Karimova', kind: 'refund', tone: 'var(--sf-success)' },
  { id: 'ap2', t: 'Ta‘til so‘rovi', who: 'Yusupova Nargiza', sub: '24–26 May · 3 kun · oilaviy', by: 'O‘zi', kind: 'leave', tone: 'var(--sf-primary)' },
  { id: 'ap3', t: 'Yangi guruh ochish', who: 'Ingliz B2 · Intensiv', sub: 'Aziz Tursunov · 18 o‘rin', by: 'Aziz Tursunov', kind: 'group', tone: 'var(--sf-accent)' },
  { id: 'ap4', t: 'Guruhdan chiqarish', who: 'Eshmatov Otabek', sub: '3+ oy qarz · 9-B', amt: 1200000, by: 'Nigora Karimova', kind: 'remove', tone: 'var(--sf-danger)' },
  { id: 'ap5', t: 'Maosh oshirish', who: 'Sevara Olimova', sub: 'Assistent → O‘qituvchi', amt: 7200000, by: 'HR', kind: 'salary', tone: 'var(--sf-warn)' },
  { id: 'ap6', t: 'Chegirma', who: 'Halimova Zilola', sub: 'Aka-uka · 15% · doimiy', by: 'Nigora Karimova', kind: 'discount', tone: 'var(--sf-primary)' },
  { id: 'ap7', t: 'Material xarid', who: 'Printer kartrij ×4', sub: 'Yunusobod · ofis', amt: 1800000, by: 'Ofis', kind: 'buy', tone: 'var(--sf-ink-2)' },
];
