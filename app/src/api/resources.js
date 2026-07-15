// The resource registry — the single contract shared by the mock server, the
// real HTTP client and the store. For every collection it declares:
//   • the REST path segment (the key itself, e.g. "students" → /students)
//   • idKey: the field that identifies a row (used for PATCH/DELETE/:id)
//   • seed: the mock server's starting data
//
// Adding a collection is one entry here; nothing else needs to learn about it.

import * as ds from '../data/dataset.js';
import { MESSAGE_THREADS, MEETINGS_SEED, SCHEDULE_LESSONS } from './mock/seeds.js';
import { API_CONFIG } from './config.js';

export const RESOURCES = {
  students: { idKey: 'id', path: '/api/v1/students/', seed: () => ds.STUDENTS },
  teachers: { idKey: 'id', mockIdKey: 'n', path: '/api/v1/teachers/', seed: () => ds.TEACHERS },
  groups: { idKey: 'id', mockIdKey: 'n', path: '/api/v1/cohorts/', seed: () => ds.GROUPS },
  parents: { idKey: 'id', mockIdKey: 'n', path: '/api/v1/parents/', seed: () => ds.PARENTS },
  payments: { idKey: 'id', path: '/api/v1/payments/', seed: () => ds.PAYMENTS },
  leads: { idKey: 'id', seed: () => ds.LEADS },
  hr: { idKey: 'id', mockIdKey: 'n', path: '/api/v1/org/staff/', seed: () => ds.HR_EMPLOYEES },
  departments: { idKey: 'id', mockIdKey: 'n', path: '/api/v1/org/departments/', seed: () => ds.DEPARTMENTS },
  branches: { idKey: 'id', mockIdKey: 'n', path: '/api/v1/org/branches/', seed: () => ds.BRANCHES },
  approvals: { idKey: 'id', path: '/api/v1/approvals/requests/', seed: () => ds.APPROVALS },
  payroll: { idKey: 'id', mockIdKey: 'n', seed: () => ds.PAYROLL_ROWS },
  meetings: { idKey: 'id', path: '/api/v1/meetings/', seed: () => MEETINGS_SEED },
  messages: { idKey: 'id', mockIdKey: 'n', path: '/api/v1/messaging/threads/', seed: () => MESSAGE_THREADS },
  schedule: { idKey: 'id', mockIdKey: 'key', path: '/api/v1/schedule/lessons/', seed: () => SCHEDULE_LESSONS },
  approvalHistory: { idKey: 'id', path: '/api/v1/approvals/ledger/', seed: () => [] },
};

export const RESOURCE_NAMES = Object.keys(RESOURCES);

// idKey for a collection, defaulting to 'id' for any ad-hoc name the store may
// ask about that isn't formally registered.
export function idKeyOf(name) {
  const resource = RESOURCES[name];
  return (API_CONFIG.useMock ? resource?.mockIdKey : resource?.idKey) || 'id';
}
