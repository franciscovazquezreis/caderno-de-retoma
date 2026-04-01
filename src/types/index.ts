export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed' | 'archived';

export interface Task {
  id: string;
  title: string;
  project?: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  archivedAt?: number;
}

export interface Tag {
  id: string;
  name: string;
  colorSeed?: string;
}

export interface TaskTag {
  id: string;
  taskId: string;
  tagId: string;
}

export type SnapshotType = 'pause' | 'resume' | 'complete';
export type ResumeEffortEstimate = '5m' | '15m' | '30m+';
export type MentalState = 'clear' | 'tired' | 'confused' | 'blocked';

export interface Snapshot {
  id: string;
  taskId: string;
  type: SnapshotType;
  whereIStopped: string;
  nextExactStep: string;
  currentBlocker?: string;
  rejectedOptions?: string;
  mistakeToAvoid?: string;
  noteToFutureSelf?: string;
  usefulReferences?: string;
  resumeEffortEstimate?: ResumeEffortEstimate;
  mentalState?: MentalState;
  createdAt: number;
}

export interface AppSettings {
  id: string;
  requirePin: boolean;
  pinHash?: string;
  autoLockMinutes: number;
  theme: 'light' | 'dark' | 'system';
  language: string;
}
