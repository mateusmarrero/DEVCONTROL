export type Role = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'AUDITOR' | 'VIEWER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'AUDITING' | 'READY_FOR_PRODUCTION' | 'PUBLISHED' | 'ARCHIVED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type PhaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type VulnerabilitySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type VulnerabilityStatus = 'OPEN' | 'IN_PROGRESS' | 'MITIGATED' | 'ACCEPTED_RISK';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectUptime {
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN';
  statusCode?: number;
  responseTimeMs?: number;
  sslValid: boolean;
  sslDaysRemaining?: number;
  lastCheckedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  siteUrl?: string;
  domain?: string;
  technologies?: string;
  priority: Priority;
  deadline?: string;
  status: ProjectStatus;
  progress: number;
  isPrivate: boolean;
  createdById: string;
  createdBy?: { id: string; name: string; email: string; avatar?: string };
  members?: Array<{ id: string; role: Role; user: User }>;
  uptimeCheck?: ProjectUptime;
  _count?: {
    tasks: number;
    vulnerabilities: number;
    securityAudits: number;
    deployments: number;
    docs?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  phaseId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  deadline?: string;
  estimatedHours?: number;
  actualHours?: number;
  order: number;
  createdById: string;
  assigneeId?: string;
  assignee?: { id: string; name: string; email: string; avatar?: string };
  phase?: { id: string; phaseNumber: number; name: string };
  subtasks?: Subtask[];
  comments?: TaskComment[];
  dependencies?: Array<{ id: string; dependsOnTask: { id: string; title: string; status: TaskStatus } }>;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTask {
  id: string;
  phaseId: string;
  title: string;
  description?: string;
  criteria?: string;
  evidenceRequired: boolean;
  evidenceUrl?: string;
  evidenceNotes?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedById?: string;
  order: number;
}

export interface ChecklistPhase {
  id: string;
  projectId: string;
  phaseNumber: number;
  name: string;
  description?: string;
  status: PhaseStatus;
  completedAt?: string;
  approvedById?: string;
  approvalNotes?: string;
  order: number;
  checklistTasks?: ChecklistTask[];
  tasks?: Array<{ id: string; title: string; status: TaskStatus; priority: Priority }>;
}

export interface Vulnerability {
  id: string;
  auditId?: string;
  projectId: string;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  category: string;
  status: VulnerabilityStatus;
  evidence?: string;
  mitigationPlan?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SecurityAudit {
  id: string;
  projectId: string;
  title: string;
  auditorId: string;
  auditor: { name: string; email: string };
  status: string;
  overallScore: number;
  owaspCategory?: string;
  reportNotes?: string;
  completedAt?: string;
  createdAt: string;
  vulnerabilities?: Vulnerability[];
}

export interface QualityGateRule {
  id: string;
  projectId: string;
  ruleKey: string;
  ruleName: string;
  isMandatory: boolean;
  isPassed: boolean;
  details?: string;
  checkedAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  version: string;
  commitHash?: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
  resultLog?: string;
  backupCreated: boolean;
  rollbackAvailable: boolean;
  createdAt: string;
  triggeredBy?: { name: string; avatar?: string };
}

export interface DocumentationDoc {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  createdById: string;
  createdBy?: { name: string; avatar?: string };
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  projectId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; avatar?: string };
  project?: { name: string };
}
