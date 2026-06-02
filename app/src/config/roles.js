import { Icons } from '../components/Icons.jsx';

// Branch directory. Names are proper nouns; counts drive the subtitle.
export const BRANCHES = [
  { id: 'all', name: '__ALL__', students: 1842, branches: 4 },
  { id: 'yun', name: 'Yunusobod', students: 512 },
  { id: 'chl', name: 'Chilonzor', students: 486 },
  { id: 'mir', name: 'Mirobod', students: 478 },
  { id: 'seb', name: 'Sebzor', students: 366 },
];

// A navigation entry. `labelKey`/`grpKey` resolve through i18n at render time,
// so switching language re-labels the whole shell without rebuilding config.
const nav = (id, icon, grpKey, extra = {}) => ({ id, icon, grpKey, labelKey: `nav.${id}`, ...extra });

const COMMS = [
  nav('messages', Icons.chat, 'comms', { n: 5 }),
  nav('chats', Icons.shield, 'comms'),
  nav('ai', Icons.ai, 'comms'),
];
const SYSTEM = [
  nav('permissions', Icons.shield, 'system'),
  nav('settings', Icons.settings, 'system'),
];

export const ROLE_CFG = {
  ceo: {
    role: 'ceo',
    labelKey: 'roles.ceoLabel',
    consoleKey: 'roles.ceoConsole',
    whoRoleKey: 'roles.ceoWhoRole',
    scopeKey: 'roles.ceoScope',
    who: 'Sardor Rashidov',
    accent: 'var(--sf-primary)',
    defaultBranch: 'all',
    nav: [
      nav('dash', Icons.home, 'main'),
      nav('branches', Icons.globe, 'main'),
      nav('students', Icons.cohort, 'people', { n: 1842 }),
      nav('groups', Icons.brand, 'people', { n: 96 }),
      nav('teachers', Icons.user, 'people', { n: 54 }),
      nav('parents', Icons.chat, 'people'),
      nav('departments', Icons.folder, 'org'),
      nav('hr', Icons.user, 'org'),
      nav('meetings', Icons.cal, 'org', { n: 3 }),
      nav('payments', Icons.trend, 'finance', { accent: 'var(--sf-success)' }),
      nav('payroll', Icons.doc, 'finance'),
      ...COMMS,
      ...SYSTEM,
    ],
  },
  manager: {
    role: 'manager',
    labelKey: 'roles.managerLabel',
    consoleKey: 'roles.managerConsole',
    whoRoleKey: 'roles.managerWhoRole',
    scopeKey: 'roles.managerScope',
    who: 'Dilnoza Yo‘ldosheva',
    accent: 'var(--sf-primary)',
    defaultBranch: 'yun',
    nav: [
      nav('dash', Icons.home, 'main'),
      nav('students', Icons.cohort, 'people', { n: 512 }),
      nav('groups', Icons.brand, 'people', { n: 28 }),
      { ...nav('teachers', Icons.user, 'people', { n: 16 }), labelKey: 'nav.staff' },
      nav('parents', Icons.chat, 'people'),
      nav('leads', Icons.flag, 'people', { n: 34, accent: 'var(--sf-accent)' }),
      nav('departments', Icons.folder, 'org'),
      nav('hr', Icons.user, 'org'),
      nav('meetings', Icons.cal, 'org', { n: 2 }),
      nav('payments', Icons.trend, 'finance', { accent: 'var(--sf-success)' }),
      nav('payroll', Icons.doc, 'finance'),
      nav('approvals', Icons.check, 'ops', { n: 7, accent: 'var(--sf-warn)' }),
      nav('schedule', Icons.cal, 'ops'),
      ...COMMS,
      ...SYSTEM,
    ],
  },
};

// Group a role's flat nav into ordered sections for the sidebar.
export function groupNav(navItems) {
  const groups = [];
  navItems.forEach((item) => {
    let g = groups.find((x) => x.grpKey === item.grpKey);
    if (!g) {
      g = { grpKey: item.grpKey, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  });
  return groups;
}
