import { DashboardPage } from './Dashboard.jsx';
import { BranchesPage } from './Branches.jsx';
import { StudentsPage } from './Students.jsx';
import { GroupsPage } from './Groups.jsx';
import { TeachersPage } from './Teachers.jsx';
import { ParentsPage } from './Parents.jsx';
import { LeadsPage } from './Leads.jsx';
import { DepartmentsPage } from './Departments.jsx';
import { HRPage } from './HR.jsx';
import { MeetingsPage } from './Meetings.jsx';
import { PaymentsPage } from './Payments.jsx';
import { PayrollPage } from './Payroll.jsx';
import { ApprovalsPage } from './Approvals.jsx';
import { SchedulePage } from './Schedule.jsx';
import { MessagesPage } from './Messages.jsx';
import { ChatsPage } from './Chats.jsx';
import { AiPage } from './Ai.jsx';
import { PermissionsPage } from './Permissions.jsx';
import { SettingsPage } from './Settings.jsx';

// Route id → page component. Each role exposes a subset of these via its nav;
// the router only ever asks for ids present in the active role's config.
export const PAGES = {
  dash: DashboardPage,
  branches: BranchesPage,
  students: StudentsPage,
  groups: GroupsPage,
  teachers: TeachersPage,
  parents: ParentsPage,
  leads: LeadsPage,
  departments: DepartmentsPage,
  hr: HRPage,
  meetings: MeetingsPage,
  payments: PaymentsPage,
  payroll: PayrollPage,
  approvals: ApprovalsPage,
  schedule: SchedulePage,
  messages: MessagesPage,
  chats: ChatsPage,
  ai: AiPage,
  permissions: PermissionsPage,
  settings: SettingsPage,
};
