// Compatibility mappers between the production API and the established console
// view models. Keeping this boundary here lets pages retain their design-focused
// fields while the transport layer speaks the backend's explicit v1 contract.

const blank = (value, fallback = '—') => (value === undefined || value === null || value === '' ? fallback : value);
const number = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const statusToPayment = (status) => {
  if (['completed', 'paid', 'allocated'].includes(status)) return 'paid';
  if (['pending', 'processing', 'partial'].includes(status)) return 'partial';
  return 'debt';
};

const asArray = (value) => (Array.isArray(value) ? value : []);

export const fromApi = {
  students: (student) => ({
    id: student.id,
    n: blank(student.full_name),
    g: student.current_cohort ? `#${student.current_cohort}` : '—',
    b: student.branch ? `#${student.branch}` : '—',
    att: 0,
    up: 0,
    down: 0,
    pay: student.is_blocked ? 'debt' : 'paid',
    debt: 0,
    par: '—',
    risk: Boolean(student.is_blocked),
    _branchId: student.branch,
    _cohortId: student.current_cohort,
  }),
  teachers: (teacher) => ({
    id: teacher.id,
    n: blank(teacher.full_name),
    role: teacher.is_substitute ? 'Substitute teacher' : 'Teacher',
    b: blank(teacher.branch_name, teacher.branch ? `#${teacher.branch}` : '—'),
    sub: asArray(teacher.subjects).join(', ') || '—',
    g: 0,
    st: 0,
    att: 0,
    up: 0,
    down: 0,
    r: 0,
    sal: number(teacher.rate),
    st2: teacher.is_active ? 'active' : 'review',
    _branchId: teacher.branch,
  }),
  groups: (cohort) => ({
    id: cohort.id,
    n: blank(cohort.name),
    t: blank(cohort.primary_teacher_name),
    b: blank(cohort.branch_name, cohort.branch ? `#${cohort.branch}` : '—'),
    st: 0,
    cap: number(cohort.capacity),
    att: 0,
    sch: '—',
    fee: 0,
    tone: 'var(--sf-primary)',
    _branchId: cohort.branch,
  }),
  parents: (parent) => ({
    id: parent.id,
    n: blank(parent.full_name),
    ch: '—',
    rel: '—',
    ph: blank(parent.phone),
    b: '—',
    tel: Boolean(parent.phone),
    debt: 0,
    msgs: 0,
  }),
  payments: (payment) => ({
    id: payment.id,
    st: blank(payment.account_ref, payment.payer ? `#${payment.payer}` : '—'),
    g: '—',
    b: '—',
    amt: number(payment.amount_uzs),
    m: blank(payment.provider),
    d: blank(payment.paid_at || payment.created_at),
    st2: statusToPayment(payment.status),
  }),
  hr: (staff) => ({
    id: staff.id,
    n: blank(staff.full_name),
    role: asArray(staff.role_memberships).map((membership) => membership.role).join(', ') || 'Staff',
    b: '—',
    st: staff.is_active ? 'active' : 'inactive',
  }),
  departments: (department) => ({
    id: department.id,
    n: blank(department.name),
    b: blank(department.branch_name, department.branch ? `#${department.branch}` : '—'),
    lead: blank(department.head_name),
    staff: 0,
    budget: number(department.budget),
    st: department.is_active ? 'active' : 'review',
    _branchId: department.branch,
  }),
  branches: (branch) => ({
    id: branch.id,
    n: blank(branch.name),
    mgr: '—',
    st: 0,
    t: 0,
    rev: 0,
    att: 0,
    churn: 0,
    tone: branch.is_active ? 'var(--sf-success)' : 'var(--sf-muted)',
    status: branch.is_active ? 'active' : 'review',
  }),
  approvals: (approval) => ({
    id: approval.id,
    title: blank(approval.title),
    desc: blank(approval.description),
    cat: blank(approval.kind),
    by: approval.requested_by ? `#${approval.requested_by}` : '—',
    amt: number(approval.amount_uzs),
    st: blank(approval.status),
    d: blank(approval.created_at),
    _branchId: approval.branch,
  }),
  approvalHistory: (entry) => ({
    id: entry.id,
    title: blank(entry.note, entry.entry_type),
    amt: number(entry.amount_uzs),
    d: blank(entry.created_at),
    st: blank(entry.direction),
    _branchId: entry.branch,
  }),
  meetings: (meeting) => ({
    id: meeting.id,
    title: blank(meeting.title),
    desc: blank(meeting.agenda),
    d: blank(meeting.starts_at),
    tm: blank(meeting.starts_at),
    place: blank(meeting.location),
    aud: asArray(meeting.attendees).length,
    st: blank(meeting.status),
    _branchId: meeting.branch,
  }),
  messages: (thread) => ({
    id: thread.id,
    n: blank(thread.subject),
    g: thread.branch ? `#${thread.branch}` : '—',
    last: '',
    tm: blank(thread.last_message_at),
    un: number(thread.unread_count),
    cat: 'staff',
    on: false,
    _branchId: thread.branch,
  }),
  schedule: (lesson) => ({
    id: lesson.id,
    key: `${blank(lesson.room_name, lesson.room || '—')}-${String(lesson.starts_at || '').slice(11, 16) || '—'}`,
    n: blank(lesson.title, lesson.cohort_name),
    t: blank(lesson.teacher_name),
    c: lesson.status === 'cancelled' ? 'var(--sf-muted)' : 'var(--sf-primary)',
    _branchId: undefined,
  }),
};

function enrich(item, nameByBranch, nameByCohort) {
  if (!item || typeof item !== 'object') return item;
  const branchName = item._branchId != null ? nameByBranch.get(String(item._branchId)) : null;
  const cohortName = item._cohortId != null ? nameByCohort.get(String(item._cohortId)) : null;
  if (!branchName && !cohortName) return item;
  return {
    ...item,
    ...(branchName ? { b: branchName } : {}),
    ...(cohortName ? { g: cohortName } : {}),
  };
}

// Related names arrive through separate list endpoints. Reapply the tiny display
// enrichment after any collection loads, so request order never leaks into UI.
export function enrichCollections(collections) {
  const nameByBranch = new Map(asArray(collections.branches).map((branch) => [String(branch.id), branch.n]));
  const nameByCohort = new Map(asArray(collections.groups).map((group) => [String(group.id), group.n]));

  return Object.fromEntries(
    Object.entries(collections).map(([name, items]) => [
      name,
      Array.isArray(items) ? items.map((item) => enrich(item, nameByBranch, nameByCohort)) : items,
    ]),
  );
}

export function mapFromApi(name, payload) {
  const mapper = fromApi[name];
  if (!mapper) return payload;
  if (Array.isArray(payload)) return payload.map(mapper);
  return payload && typeof payload === 'object' ? mapper(payload) : payload;
}
