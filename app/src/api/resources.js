// The resource registry — the single contract shared by the mock server, the
// real HTTP client and the store. For every collection it declares:
//   • the REST path segment (the key itself, e.g. "students" → /students)
//   • idKey: the field that identifies a row (used for PATCH/DELETE/:id)
//   • seed: the mock server's starting data
//
// Adding a collection is one entry here; nothing else needs to learn about it.

import * as ds from '../data/dataset.js';
import { MESSAGE_THREADS, MEETINGS_SEED, SCHEDULE_LESSONS } from './mock/seeds.js';

export const RESOURCES = {
  students: { idKey: 'id', seed: () => ds.STUDENTS },
  teachers: { idKey: 'n', seed: () => ds.TEACHERS },
  groups: { idKey: 'n', seed: () => ds.GROUPS },
  parents: { idKey: 'n', seed: () => ds.PARENTS },
  payments: { idKey: 'id', seed: () => ds.PAYMENTS },
  leads: { idKey: 'id', seed: () => ds.LEADS },
  hr: { idKey: 'n', seed: () => ds.HR_EMPLOYEES },
  departments: { idKey: 'n', seed: () => ds.DEPARTMENTS },
  branches: { idKey: 'n', seed: () => ds.BRANCHES },
  approvals: { idKey: 'id', seed: () => ds.APPROVALS },
  payroll: { idKey: 'n', seed: () => ds.PAYROLL_ROWS },
  meetings: { idKey: 'id', seed: () => MEETINGS_SEED },
  messages: { idKey: 'n', seed: () => MESSAGE_THREADS },
  schedule: { idKey: 'key', seed: () => SCHEDULE_LESSONS },
  approvalHistory: { idKey: 'id', seed: () => [] },
};

export const RESOURCE_NAMES = Object.keys(RESOURCES);

// idKey for a collection, defaulting to 'id' for any ad-hoc name the store may
// ask about that isn't formally registered.
export function idKeyOf(name) {
  return RESOURCES[name]?.idKey || 'id';
}
