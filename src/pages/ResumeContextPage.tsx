import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { db } from '../db/db';
import { Button } from '../components/ui/button';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatDistanceToNow } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';
import { CheckCircle2, AlertCircle, Play, Edit3, History, ArrowLeft, FileText, Lightbulb, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ResumeContextPage() {
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

  const latestSnapshot = snapshots[0];

  if (!latestSnapshot) {
    return (
      <div className="p-4 text-center text-zinc-500">
        <p>{t('resume.noContext')}</p>
        <Button onClick={() => navigate('/')} className="mt-4">{t('resume.backBtn')}</Button>
      </div>
    );
  }

  const handleStartNow = async () => {
    // Optional: record a 'resume' snapshot
    await db.snapshots.add({
      id: crypto.randomUUID(),
      taskId: task.id,
      type: 'resume',
      whereIStopped: 'Retomado',
      nextExactStep: 'A trabalhar...',
      createdAt: Date.now(),
    });
    navigate('/');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('resume.title')}</h1>
          <p className="text-sm text-zinc-500 line-clamp-1">{task.title}</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex justify-between items-center">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('resume.lastPaused')}</span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {formatDistanceToNow(latestSnapshot.createdAt, { addSuffix: true, locale: i18n.language === 'pt-PT' ? pt : enUS })}
          </span>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {t('resume.whereStopped')}
            </h3>
            <p className="text-base font-medium leading-relaxed text-zinc-900 dark:text-zinc-50">
              {latestSnapshot.whereIStopped}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
              <Play className="h-4 w-4" /> {t('resume.nextStep')}
            </h3>
            <div className="rounded-lg bg-zinc-900 text-zinc-50 p-4 dark:bg-zinc-50 dark:text-zinc-900">
              <p className="text-lg font-semibold leading-tight">
                {latestSnapshot.nextExactStep}
              </p>
            </div>
          </div>

          {latestSnapshot.currentBlocker && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {t('resume.blocker')}
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-100 dark:border-red-900/50">
                {latestSnapshot.currentBlocker}
              </p>
            </div>
          )}

          {latestSnapshot.mistakeToAvoid && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-orange-500 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> {t('resume.mistake')}
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-orange-50 dark:bg-orange-950/30 p-3 rounded-md border border-orange-100 dark:border-orange-900/50">
                {latestSnapshot.mistakeToAvoid}
              </p>
            </div>
          )}

          {latestSnapshot.rejectedOptions && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> {t('resume.rejected')}
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {latestSnapshot.rejectedOptions}
              </p>
            </div>
          )}

          {latestSnapshot.noteToFutureSelf && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-blue-500 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> {t('resume.note')}
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-100 dark:border-blue-900/50">
                {latestSnapshot.noteToFutureSelf}
              </p>
            </div>
          )}

          {latestSnapshot.usefulReferences && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
                <FileText className="h-4 w-4" /> {t('resume.references')}
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 font-mono text-xs bg-zinc-100 dark:bg-zinc-900 p-2 rounded">
                {latestSnapshot.usefulReferences}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button size="lg" className="w-full h-14 text-lg font-bold shadow-md" onClick={handleStartNow}>
          <Play className="mr-2 h-5 w-5" /> {t('resume.startNowBtn')}
        </Button>
        
        <div className="flex gap-3">
          <Link to={`/task/${task.id}/pause`} className="flex-1">
            <Button variant="outline" className="w-full h-12">
              <Edit3 className="mr-2 h-4 w-4" /> {t('resume.updateContextBtn')}
            </Button>
          </Link>
          <Link to={`/task/${task.id}/history`} className="flex-1">
            <Button variant="outline" className="w-full h-12">
              <History className="mr-2 h-4 w-4" /> {t('resume.viewHistoryBtn')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
