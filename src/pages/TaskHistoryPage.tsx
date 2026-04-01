import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { db } from '../db/db';
import { Button } from '../components/ui/button';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';
import { ArrowLeft, PauseCircle, PlayCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TaskHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const task = useLiveQuery(() => db.tasks.get(id || ''));
  const snapshots = useLiveQuery(() => 
    db.snapshots.where('taskId').equals(id || '').reverse().sortBy('createdAt')
  );

  useEffect(() => {
    if (!id) navigate('/');
  }, [id, navigate]);

  if (!task || !snapshots) return <div className="p-4 text-center text-zinc-500">{t('common.loading')}</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('history.title')}</h1>
          <p className="text-sm text-zinc-500 line-clamp-1">{task.title}</p>
        </div>
      </div>

      <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-8">
        {snapshots.map((snapshot, index) => {
          const isPause = snapshot.type === 'pause';
          const isResume = snapshot.type === 'resume';
          const isComplete = snapshot.type === 'complete';

          return (
            <div key={snapshot.id} className="relative pl-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-8 ring-white dark:bg-zinc-950 dark:ring-zinc-950">
                {isPause && <PauseCircle className="h-5 w-5 text-orange-500" />}
                {isResume && <PlayCircle className="h-5 w-5 text-blue-500" />}
                {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </span>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {isPause ? t('history.typePause') : isResume ? t('history.typeResume') : t('history.typeComplete')}
                  </h3>
                  <time className="text-xs text-zinc-500">
                    {format(snapshot.createdAt, "d MMM, HH:mm", { locale: i18n.language === 'pt-PT' ? pt : enUS })}
                  </time>
                </div>
                
                {isPause && (
                  <div className="mt-2 rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <p className="line-clamp-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">{t('history.whereStoppedLabel')}</span> {snapshot.whereIStopped}</p>
                    <p className="line-clamp-2 mt-1"><span className="font-medium text-zinc-900 dark:text-zinc-100">{t('history.nextStepLabel')}</span> {snapshot.nextExactStep}</p>
                    
                    {snapshot.mentalState && (
                      <div className="mt-2 flex">
                        <span className="inline-flex items-center rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          {snapshot.mentalState === 'clear' ? t('pause.stateClear') : 
                           snapshot.mentalState === 'tired' ? t('pause.stateTired') : 
                           snapshot.mentalState === 'confused' ? t('pause.stateConfused') : t('pause.stateBlocked')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {isResume && (
                  <p className="text-sm text-zinc-500 italic">{t('history.workResumed')}</p>
                )}
                
                {isComplete && (
                  <p className="text-sm text-zinc-500 italic">{t('history.taskCompleted')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {snapshots.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p>{t('history.noHistory')}</p>
        </div>
      )}
    </div>
  );
}
