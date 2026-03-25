import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Brain, Clock, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { EffortEstimate, MentalState } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function PauseTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const task = useLiveQuery(() => db.tasks.get(id as string), [id]);

  const [whereIStopped, setWhereIStopped] = useState('');
  const [nextExactStep, setNextExactStep] = useState('');
  const [currentBlocker, setCurrentBlocker] = useState('');
  const [mistakeToAvoid, setMistakeToAvoid] = useState('');
  const [mentalState, setMentalState] = useState<MentalState>('clear');
  const [resumeEffort, setResumeEffort] = useState<EffortEstimate>('15m');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task === undefined) return;
    if (task === null) navigate('/'); // Task not found
  }, [task, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whereIStopped.trim() || !nextExactStep.trim() || !task?.id) return;
    
    setIsSubmitting(true);
    try {
      await db.snapshots.add({
        id: crypto.randomUUID(),
        taskId: task.id,
        type: 'pause',
        whereIStopped: whereIStopped.trim(),
        nextExactStep: nextExactStep.trim(),
        currentBlocker: currentBlocker.trim() || undefined,
        mistakeToAvoid: mistakeToAvoid.trim() || undefined,
        mentalState,
        resumeEffortEstimate: resumeEffort,
        createdAt: Date.now()
      });
      
      // Update task timestamp exactly to current Date.now()
      await db.tasks.update(task.id, { updatedAt: Date.now() });
      
      navigate('/');
    } catch(err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

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
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Pausar Contexto</p>
          </div>
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={!whereIStopped.trim() || !nextExactStep.trim() || isSubmitting}>
          {isSubmitting ? 'A guardar...' : t('common.save')}
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8 flex-1 overflow-y-auto pb-32">
        <div className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-base font-semibold text-zinc-800 dark:text-zinc-200">{t('snapshot.whereIStopped')}</label>
            <textarea 
              autoFocus 
              value={whereIStopped} 
              onChange={e => setWhereIStopped(e.target.value)} 
              placeholder="Ex: Acabei de escrever a função de validação de emails..." 
              className="flex min-h-[100px] w-full rounded-xl border border-transparent shadow-sm bg-white dark:bg-zinc-900 px-4 py-3 text-sm placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-400 dark:hover:border-zinc-700 dark:focus:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-zinc-300/10 transition-all duration-200 resize-none font-medium"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-base font-semibold text-zinc-800 dark:text-zinc-200">{t('snapshot.nextExactStep')}</label>
            <textarea 
              value={nextExactStep} 
              onChange={e => setNextExactStep(e.target.value)} 
              placeholder="Ex: Falta criar o teste unitário para RejestEmail..." 
              className="flex min-h-[100px] w-full rounded-xl border border-transparent shadow-sm bg-white dark:bg-zinc-900 px-4 py-3 text-sm placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-400 dark:hover:border-zinc-700 dark:focus:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-zinc-300/10 transition-all duration-200 resize-none font-semibold text-indigo-700 dark:text-indigo-400"
            />
          </div>
        </div>

        <hr className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />

        <div className="space-y-2 group">
          <label className="text-sm font-medium flex items-center gap-2 text-rose-600 dark:text-rose-400"><ShieldAlert className="w-4 h-4"/> Obstáculos ou Bloqueios? <span className="text-zinc-400 font-normal">(Opcional)</span></label>
          <Input 
            value={currentBlocker} 
            onChange={e => setCurrentBlocker(e.target.value)} 
            placeholder="A API de pagamentos está em baixo..." 
            className="bg-white dark:bg-zinc-900 border-rose-100 dark:border-rose-900/30 focus:border-rose-300 dark:focus:border-rose-500/50"
          />
        </div>

        <div className="space-y-2 group">
          <label className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400"><Brain className="w-4 h-4"/> Erros a evitar na retoma <span className="text-zinc-400 font-normal">(Opcional)</span></label>
          <Input 
            value={mistakeToAvoid} 
            onChange={e => setMistakeToAvoid(e.target.value)} 
            placeholder="Não esqueças de atualizar o token..." 
            className="bg-white dark:bg-zinc-900 border-amber-100 dark:border-amber-900/30 focus:border-amber-300 dark:focus:border-amber-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><Clock className="w-4 h-4"/> Tempo de Arranque</label>
            <div className="flex flex-col gap-2">
              {(['5m', '15m', '30m+'] as EffortEstimate[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setResumeEffort(p)}
                  className={`py-2 text-xs font-medium rounded-xl transition-all duration-200 border ${
                    resumeEffort === p 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300 shadow-sm' 
                    : 'border-transparent bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 hover:border-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p === '5m' ? '5 minutos (Rápido)' : p === '15m' ? '15 minutos (Médio)' : '30+ min (Grosso)'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><Brain className="w-4 h-4"/> Carga Mental</label>
            <div className="flex flex-col gap-2">
              {(['clear', 'tired', 'confused', 'blocked'] as MentalState[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setMentalState(s)}
                  className={`py-2 px-1 text-xs font-medium rounded-xl transition-all duration-200 border ${
                    mentalState === s 
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' 
                    : 'border-transparent bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 hover:border-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {s === 'clear' && 'Lúcido'}
                  {s === 'tired' && 'Cansado'}
                  {s === 'confused' && 'Confuso'}
                  {s === 'blocked' && 'Bloqueado'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
