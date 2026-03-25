export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed' | 'archived';
export type SnapshotType = 'pause' | 'resume' | 'complete';
export type EffortEstimate = '5m' | '15m' | '30m+';
export type MentalState = 'clear' | 'tired' | 'confused' | 'blocked';
export type Language = 'pt-PT' | 'en-US';
export type Theme = 'light' | 'dark' | 'system';

export interface Task {
  id?: string;
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
  id?: string;
  name: string;
}

export interface TaskTag {
  id?: string;
  taskId: string;
  tagId: string;
}

export interface Snapshot {
  id?: string;
  taskId: string;
  type: SnapshotType;
  whereIStopped: string;
  nextExactStep: string;
  currentBlocker?: string;
  rejectedOptions?: string[];
  mistakeToAvoid?: string;
  noteToFutureSelf?: string;
  usefulReferences?: string[];
  resumeEffortEstimate?: EffortEstimate;
  mentalState?: MentalState;
  createdAt: number;
}

export interface Settings {
  id: 1;
  language: Language;
  theme: Theme;
  requirePin: boolean;
  pinHash?: string;
  autoLockMinutes: number;
  lastBackupAt?: number; // Track JSON export time
}
