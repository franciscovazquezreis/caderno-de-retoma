import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Play, AlertTriangle, ShieldCheck, Clock, Brain } from 'lucide-react';
import { db } from '../../db/db';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Snapshot } from '../../types';

export default function ResumeTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const task = useLiveQuery(() => db.tasks.get(id as string), [id]);
  
  const recentSnapshots = useLiveQuery(
    () => db.snapshots
      .where('taskId').equals(id as string)
      .filter(s => s.type === 'pause')
      .reverse()
      .sortBy('createdAt'),
    [id]
  );

  useEffect(() => {
    if (task === null) navigate('/');
  }, [task, navigate]);

  const handleStartWorking = async () => {
    if (!task) return;
    
    await db.snapshots.add({
      id: crypto.randomUUID(),
      taskId: task.id!,
      type: 'resume',
      whereIStopped: 'Retomado', 
      nextExactStep: recentSnapshots?.[0]?.nextExactStep || 'Início dos trabalhos',
      createdAt: Date.now()
    });
    
    await db.tasks.update(task.id!, { updatedAt: Date.now() });
    navigate('/');
  };

  // Se recentSnapshots for undefined é porque o Dexie ainda está a carregar
  if (!task || recentSnapshots === undefined) return null;
  
  if (task.status === 'completed') {
    return (
      <div className="flex flex-col h-full p-6 text-center justify-center items-center animate-in fade-in bg-zinc-50 dark:bg-zinc-950">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm border border-emerald-100 dark:border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Tarefa Concluída</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-[280px] leading-relaxed text-balance">
          O contexto desta tarefa já foi fechado e não deve ser modificado. Para voltares a trabalhar nela, reativa-a a partir do painel principal.
        </p>
        <Button variant="outline" size="lg" className="w-full max-w-[260px] shadow-sm" asChild>
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  const recentSnapshot = recentSnapshots[0];

  if (!recentSnapshot) {
    return (
      <div className="flex flex-col h-full p-6 text-center justify-center items-center animate-in fade-in bg-zinc-50 dark:bg-zinc-950">
        <div className="w-16 h-16 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-full flex items-center justify-center mb-6">
          <Brain className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Contexto Limpo</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-[280px] leading-relaxed">
          Esta tarefa não tem nenhuma pausa registada. A tua memória sobre ela deverá estar fresca.
        </p>
        <Button size="lg" className="w-full max-w-[260px] shadow-xl" onClick={handleStartWorking}>
          Iniciar Trabalho <Play className="w-4 h-4 ml-2 fill-current" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-left-8 duration-500 fade-in bg-white dark:bg-zinc-950 relative">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="w-10 px-0 -ml-2 rounded-full">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">Recuperar Foco</h1>
        </div>
      </header>

      <div className="p-6 flex-1 overflow-y-auto pb-40 flex flex-col gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2.5 py-1 rounded-md mb-3 inline-block">
            {task.project || 'Geral'}
          </span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            {task.title}
          </h2>
          <div className="flex items-center gap-4 mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Arranque: {recentSnapshot.resumeEffortEstimate}</div>
            <div className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5"/> Carga Mental: {recentSnapshot.mentalState}</div>
          </div>
        </div>

        <Card className="p-5 border-l-4 border-l-zinc-900 dark:border-l-zinc-100 shadow-sm">
          <h3 className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider mb-3">{t('snapshot.whereIStopped')}</h3>
          <p className="text-[15px] text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
            {recentSnapshot.whereIStopped}
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-indigo-500 shadow-md bg-indigo-50/50 dark:bg-indigo-900/10">
          <h3 className="text-[11px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider mb-2">{t('snapshot.nextExactStep')}</h3>
          <p className="text-lg text-indigo-950 dark:text-indigo-200 font-bold leading-relaxed">
            {recentSnapshot.nextExactStep}
          </p>
        </Card>

        {(recentSnapshot.currentBlocker || recentSnapshot.mistakeToAvoid) && (
          <div className="grid grid-cols-1 gap-4 mt-2">
            {recentSnapshot.currentBlocker && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 text-sm font-medium">
                <div className="flex items-center gap-1.5 font-bold mb-1.5 uppercase text-[10px] tracking-wider text-rose-600 dark:text-rose-400"><AlertTriangle className="w-3 h-3"/> Bloqueador Ativo</div>
                {recentSnapshot.currentBlocker}
              </div>
            )}
            
            {recentSnapshot.mistakeToAvoid && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-sm font-medium">
                <div className="flex items-center gap-1.5 font-bold mb-1.5 uppercase text-[10px] tracking-wider text-amber-600 dark:text-amber-400"><ShieldCheck className="w-3 h-3"/> Erro a Evitar</div>
                {recentSnapshot.mistakeToAvoid}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 pt-16 z-20">
        <Button size="lg" className="w-full text-[15px] font-bold shadow-xl shadow-zinc-200 dark:shadow-none" onClick={handleStartWorking}>
          {t('snapshot.startNow')} <Play className="w-4 h-4 ml-2 fill-current" />
        </Button>
      </div>
    </div>
  );
}
