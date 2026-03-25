import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Play, Pause, Search, Settings as SettingsIcon, CheckCircle2, Trash2, Edit2, RotateCcw } from 'lucide-react';
import { db } from '../../db/db';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function Dashboard() {
  const [view, setView] = useState<'active' | 'completed'>('active');
  const tasks = useLiveQuery(() => db.tasks.orderBy('updatedAt').reverse().toArray());

  const filteredTasks = tasks?.filter(t => t.status === view) || [];

  const handleComplete = async (taskId: string) => {
    await db.tasks.update(taskId, { status: 'completed', completedAt: Date.now(), updatedAt: Date.now() });
    await db.snapshots.add({
      id: crypto.randomUUID(),
      taskId: taskId,
      type: 'complete',
      whereIStopped: 'Tarefa Concluída',
      nextExactStep: '-',
      createdAt: Date.now()
    });
  };

  const handleReactivate = async (taskId: string) => {
    await db.tasks.update(taskId, { status: 'active', updatedAt: Date.now() });
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Tens a certeza que queres eliminar esta tarefa e todo o seu histórico permanentemente?')) {
      await db.tasks.delete(taskId);
      await db.snapshots.where('taskId').equals(taskId).delete();
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-zinc-50 dark:bg-zinc-950">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 border-b border-zinc-200 dark:border-zinc-800/50">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 line-clamp-1">Caderno de Retoma de Contexto</h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">O teu contexto, sem atrito.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="w-10 px-0 rounded-full">
            <Link to="/search"><Search className="w-4 h-4" /></Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="w-10 px-0 rounded-full">
            <Link to="/settings"><SettingsIcon className="w-4 h-4" /></Link>
          </Button>
        </div>
      </header>

      <div className="p-6 flex-1 overflow-y-auto pb-24">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <button onClick={() => setView('active')} className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${view === 'active' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400'}`}>
              Ativas
            </button>
            <button onClick={() => setView('completed')} className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${view === 'completed' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400'}`}>
              Concluídas
            </button>
          </div>
          {view === 'active' && (
            <Button size="sm" className="rounded-full px-4 shadow-sm" asChild>
              <Link to="/task/new"><Plus className="w-4 h-4 mr-1.5" />Nova</Link>
            </Button>
          )}
        </div>

        {!tasks ? (
          <div className="animate-pulse flex flex-col gap-4 mt-6">
            <div className="h-28 bg-white dark:bg-zinc-900 rounded-2xl w-full border border-zinc-100 dark:border-zinc-800"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {view === 'active' ? <Play className="w-6 h-6 text-zinc-400" /> : <CheckCircle2 className="w-6 h-6 text-zinc-400" />}
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">{view === 'active' ? 'Nada em foco' : 'Sem tarefas concluídas'}</h3>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-balance mb-6">
              {view === 'active' ? 'Começa por criar a tua primeira tarefa e guarda o contexto quando fores interrompido.' : 'Ainda não concluíste nenhuma tarefa. Voltar ao trabalho!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            {filteredTasks.map(task => (
              <Card key={task.id} className="p-5 hover:shadow-md transition-all group cursor-default bg-white dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {task.project && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2 py-0.5 rounded-md block w-fit">
                          {task.project}
                        </span>
                      )}
                      <span className={`w-2 h-2 rounded-full shadow-sm ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'low' ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-amber-500'}`} title={`Prioridade: ${task.priority}`} />
                    </div>
                    <Link to={`/task/${task.id}/resume`}>
                      <h3 className={`font-bold text-base truncate transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${view === 'completed' ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-50'}`}>{task.title}</h3>
                    </Link>
                    {task.description && (
                      <p className={`text-sm font-medium line-clamp-1 mt-1.5 ${view === 'completed' ? 'text-zinc-400/50' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {task.description}
                      </p>
                    )}
                    
                    {/* Action Bar (Edit, Complete, Delete) */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 transition-all sm:opacity-0 group-hover:opacity-100">
                      {view === 'active' ? (
                        <>
                          <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-semibold text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400" onClick={() => handleComplete(task.id!)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Terminar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-semibold text-zinc-500" asChild>
                            <Link to={`/task/${task.id}/edit`}><Edit2 className="w-3.5 h-3.5 mr-1.5" /> Editar</Link>
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-semibold text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 dark:hover:text-amber-400" onClick={() => handleReactivate(task.id!)}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reativar
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400" onClick={() => handleDelete(task.id!)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Primary Context Flow Actions (Pause / Resume) */}
                  {view === 'active' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button size="sm" variant="primary" className="w-10 h-10 px-0 rounded-full shadow-md hover:scale-110 transition-transform" asChild>
                        <Link to={`/task/${task.id}/resume`}><Play className="w-4 h-4 ml-0.5" /></Link>
                      </Button>
                      <Button size="sm" variant="secondary" className="w-10 h-10 px-0 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm hover:scale-110 transition-transform" asChild>
                        <Link to={`/task/${task.id}/pause`}><Pause className="w-4 h-4" /></Link>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
