import Dexie, { Table } from 'dexie';
import { Task, Tag, TaskTag, Snapshot, AppSettings } from '../types';

export class ContextDB extends Dexie {
  tasks!: Table<Task, string>;
  tags!: Table<Tag, string>;
  taskTags!: Table<TaskTag, string>;
  snapshots!: Table<Snapshot, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('ContextDB');
    this.version(1).stores({
      tasks: 'id, title, status, priority, createdAt, updatedAt',
      tags: 'id, name',
      taskTags: 'id, taskId, tagId',
      snapshots: 'id, taskId, type, createdAt',
      settings: 'id',
    });
  }
}

export const db = new ContextDB();

// Initialize default settings if they don't exist
db.on('populate', () => {
  const browserLang = navigator.language;
  const defaultLang = browserLang.startsWith('pt') ? 'pt-PT' : 'en-US';

  db.settings.add({
    id: 'default',
    requirePin: false,
    autoLockMinutes: 5,
    theme: 'system',
    language: defaultLang,
  });
});
