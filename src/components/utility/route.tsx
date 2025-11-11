import { ComponentType } from 'react';
import { lazy } from 'react';

interface RouteConfig {
  path: string;
  component: ComponentType;
  protected?: boolean;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: lazy(() =>
      import('@/pages/DashboardPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/dashboard',
    component: lazy(() =>
      import('@/pages/DashboardPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/contract',
    component: lazy(() =>
      import('@/pages/workflow-masters/ContractPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/contractType',
    component: lazy(() =>
      import('@/pages/workflow-masters/ContractTypePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/contractStatus',
    component: lazy(() =>
      import('@/pages/workflow-masters/ContractStatusPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/contractInstance',
    component: lazy(() =>
      import('@/pages/workflow-masters/ContractInstancePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/actor',
    component: lazy(() =>
      import('@/pages/workflow-masters/ActorPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/workflow',
    component: lazy(() =>
      import('@/pages/workflow-masters/WorkflowPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/workflowType',
    component: lazy(() =>
      import('@/pages/workflow-masters/WorkflowTypePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  // Add more workflow routes as needed
  {
    path: '/workflow/actor-group',
    component: lazy(() =>
      import('@/pages/workflow-masters/ActorGroupPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/cases',
    component: lazy(() =>
      import('@/pages/workflow-masters/Cases').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/case-instance',
    component: lazy(() =>
      import('@/pages/workflow-masters/CaseInstancePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/case-process-workflow',
    component: lazy(() =>
      import('@/pages/workflow-masters/CaseProcessWorkflowPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/caseType',
    component: lazy(() =>
      import('@/pages/workflow-masters/CasesTypePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/dataAccessMode',
    component: lazy(() =>
      import('@/pages/workflow-masters/DataAccessModePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  
  {
    path: '/workflow/process',
    component: lazy(() =>
      import('@/pages/workflow-masters/ProcessPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/processType',
    component: lazy(() =>
      import('@/pages/workflow-masters/ProcessTypePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/task',
    component: lazy(() =>
      import('@/pages/workflow-masters/TaskPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/taskType',
    component: lazy(() =>
      import('@/pages/workflow-masters/TaskTypePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/taskMutualGroup',
    component: lazy(() =>
      import('@/pages/workflow-masters/TaskMutualGroupPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/sla',
    component: lazy(() =>
      import('@/pages/workflow-masters/SlaPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/stage',
    component: lazy(() =>
      import('@/pages/workflow-masters/StagePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/stageType',
    component: lazy(() =>
      import('@/pages/workflow-masters/StageTypePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/event',
    component: lazy(() =>
      import('@/pages/workflow-masters/EventPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/eventType',
    component: lazy(() =>
      import('@/pages/workflow-masters/EventTypePage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/workflow/builder',
    component: lazy(() =>
      import('@/pages/workflow-builder/WorkflowBuilderPage').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/login',
    component: lazy(() =>
      import('@/pages/LoginPage').then((module) => ({ default: module.default })),
    ),
    protected: false,
  },
]