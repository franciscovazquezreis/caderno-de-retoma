import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Priority, TaskStatus } from '../types';
import { useTranslation } from 'react-i18next';

export function NewTaskPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = Date.now();
    const taskId = uuidv4();

    await db.tasks.add({
      id: taskId,
      title: title.trim(),
      project: project.trim() || undefined,
      description: description.trim() || undefined,
      priority,
      status: 'active' as TaskStatus,
      createdAt: now,
      updatedAt: now,
    });

    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('newTask.title')}</h1>
        <p className="text-sm text-zinc-500">{t('newTask.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('newTask.taskTitle')}</Label>
          <Input 
            id="title" 
            placeholder={t('newTask.taskTitlePlaceholder')} 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">{t('newTask.project')}</Label>
          <Input 
            id="project" 
            placeholder={t('newTask.projectPlaceholder')} 
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('newTask.description')}</Label>
          <Textarea 
            id="description" 
            placeholder={t('newTask.descriptionPlaceholder')} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('newTask.priority')}</Label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  priority === p 
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 border-transparent' 
                    : 'bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {p === 'low' ? t('newTask.priorityLow') : p === 'medium' ? t('newTask.priorityMedium') : t('newTask.priorityHigh')}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            {t('newTask.cancelBtn')}
          </Button>
          <Button type="submit" className="flex-1" disabled={!title.trim()}>
            {t('newTask.createBtn')}
          </Button>
        </div>
      </form>
    </div>
  );
}
