import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Play, Pause, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { db } from '../../db/db';
import { Button } from '../../components/ui/Button';

export default function TaskHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = useLiveQuery(() => db.tasks.get(id as string), [id]);
  const snapshots = useLiveQuery(
    () => db.snapshots.where('taskId').equals(id as string).reverse().sortBy('createdAt'),
    [id]
  );

  useEffect(() => {
    if (task === null) navigate('/');
  }, [task, navigate]);

  if (!task || !snapshots) return null;

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500 fade-in bg-zinc-50 dark:bg-zinc-950">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="w-10 px-0 -ml-2 rounded-full">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{task.title}</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Histórico de Sessões</p>
          </div>
        </div>
      </header>
      
      <div className="p-6 flex-1 overflow-y-auto">
        {snapshots.length === 0 ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400 mt-10 text-sm">Nenhum evento registado.</div>
        ) : (
          <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-8 pb-10 mt-4">
            {snapshots.map((snap) => (
              <div key={snap.id} className="relative pl-6">
                <div className={`absolute -left-[13px] top-1 rounded-full p-1.5 ring-4 ring-zinc-50 dark:ring-zinc-950 shadow-sm ${
                  snap.type === 'pause' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 
                  snap.type === 'complete' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' :
                  'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                }`}>
                  {snap.type === 'pause' ? <Pause className="w-3 h-3" /> : 
                   snap.type === 'complete' ? <CheckCircle2 className="w-3 h-3" /> : 
                   <Play className="w-3 h-3" />}
                </div>
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-3 h-3"/>
                  {format(snap.createdAt, "d 'de' MMM, HH:mm", { locale: pt })}
                </div>
                {snap.type === 'pause' ? (
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800/50 mt-3">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-1">Pausa</p>
                    <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-medium">{snap.whereIStopped}</p>
                  </div>
                ) : snap.type === 'complete' ? (
                  <div className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Tarefa Concluída
                  </div>
                ) : (
                  <div className="mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    Sessão Iniciada
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
