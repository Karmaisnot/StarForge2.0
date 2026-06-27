// Back-compat surface. The real, volume-realistic seed data now lives in
// dataset.js (one deterministic, branch-consistent source). This file simply
// re-exports it so existing imports keep working.
export {
  GROUPS,
  BRANCHES,
  APPROVALS,
  STUDENTS,
  TEACHERS,
  PARENTS,
  PAYMENTS,
  LEADS,
  HR_EMPLOYEES,
  DEPARTMENTS,
  PAYROLL_ROWS,
  BRANCH_NAMES,
} from './dataset.js';
