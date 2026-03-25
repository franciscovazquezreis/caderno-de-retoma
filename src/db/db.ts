import Dexie, { type EntityTable } from 'dexie';
import type { Task, Tag, TaskTag, Snapshot, Settings } from '../types';

export class CadernoDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
  tags!: EntityTable<Tag, 'id'>;
  taskTags!: EntityTable<TaskTag, 'id'>;
  snapshots!: EntityTable<Snapshot, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor() {
    super('CadernoRetomaDB');
    
    // Schema definition for Indexed properties
    // Bumping to version 2 to apply the new index for 'updatedAt'
    this.version(2).stores({
      tasks: 'id, title, project, status, priority, createdAt, updatedAt',
      tags: 'id, name',
      taskTags: 'id, taskId, tagId',
      snapshots: 'id, taskId, type, createdAt',
      settings: 'id'
    });
  }
}

export const db = new CadernoDatabase();
