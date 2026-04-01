import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Clock, Play, Pause } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const activeTasks = useLiveQuery(() => 
    db.tasks.where('status').equals('active').reverse().sortBy('updatedAt')
  );

  const snapshots = useLiveQuery(() => db.snapshots.toArray());

  if (!activeTasks) return <div className="p-4 text-center text-zinc-500">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-zinc-500">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {activeTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800 mb-4">
            <Clock className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium">{t('dashboard.noActiveTasks')}</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">
            {t('dashboard.noActiveTasksDesc')}
          </p>
          <Link to="/task/new" className="mt-6">
            <Button>{t('dashboard.newTaskBtn')}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{t('dashboard.readyToResume')}</h2>
          <div className="grid gap-4">
            {activeTasks.map((task) => {
              const taskSnapshots = snapshots?.filter(s => s.taskId === task.id).sort((a, b) => b.createdAt - a.createdAt) || [];
              const latestSnapshot = taskSnapshots[0];
              const isPaused = latestSnapshot?.type === 'pause';

              return (
                <Card key={task.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        {task.project && (
                          <CardDescription className="text-xs">{task.project}</CardDescription>
                        )}
                      </div>
                      <Badge variant={
                        task.priority === 'high' ? 'destructive' : 
                        task.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {task.priority === 'high' ? t('dashboard.priorityHigh') : task.priority === 'medium' ? t('dashboard.priorityMedium') : t('dashboard.priorityLow')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {latestSnapshot ? (
                      <div className="mt-2 space-y-2 rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                          <span>{t('dashboard.lastPaused')}: {formatDistanceToNow(latestSnapshot.createdAt, { addSuffix: true, locale: i18n.language === 'pt-PT' ? pt : enUS })}</span>
                        </div>
                        <p className="line-clamp-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">{t('dashboard.whereStopped')}:</span> {latestSnapshot.whereIStopped}</p>
                        <p className="line-clamp-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">{t('dashboard.nextStep')}:</span> {latestSnapshot.nextExactStep}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 italic mt-2">{t('dashboard.noContext')}</p>
                    )}
                    
                    <div className="mt-4 flex gap-2">
                      {isPaused ? (
                        <Link to={`/task/${task.id}/resume`} className="flex-1">
                          <Button className="w-full gap-2" variant="default">
                            <Play className="h-4 w-4" /> {t('dashboard.resumeBtn')}
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/task/${task.id}/pause`} className="flex-1">
                          <Button className="w-full gap-2" variant="outline">
                            <Pause className="h-4 w-4" /> {t('dashboard.pauseBtn')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
