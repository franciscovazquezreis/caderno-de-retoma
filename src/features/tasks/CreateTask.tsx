import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { db } from '../../db/db';
import type { Priority } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function CreateTask() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await db.tasks.add({
        id: crypto.randomUUID(),
        title: title.trim(),
        project: project.trim() || undefined,
        description: description.trim() || undefined,
        priority,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      navigate('/');
    } catch(err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500 fade-in bg-white dark:bg-zinc-900">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="w-10 px-0 -ml-2 rounded-full">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-medium">Nova Tarefa</h1>
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={!title.trim() || isSubmitting}>
          {isSubmitting ? 'A guardar...' : <>Guardar <Save className="w-4 h-4 ml-2" /></>}
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto pb-24">
        <div className="space-y-2 group">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-50">O que precisas de fazer?</label>
          <Input 
            autoFocus 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Ex: Rever pull request do modelo de faturação" 
            className="h-12 text-base transition-all bg-zinc-50 dark:bg-zinc-950 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:bg-white focus:border-zinc-300 dark:focus:bg-zinc-900 dark:focus:border-zinc-600 shadow-sm" 
          />
        </div>

        <div className="space-y-2 group">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-50">Projeto / Categoria <span className="text-zinc-400 font-normal ml-1">(Opcional)</span></label>
          <Input 
            value={project} 
            onChange={e => setProject(e.target.value)} 
            placeholder="Ex: Frontend Core" 
            className="bg-zinc-50 dark:bg-zinc-950 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:bg-white focus:border-zinc-300 dark:focus:bg-zinc-900 dark:focus:border-zinc-600 shadow-sm"
          />
        </div>

        <div className="space-y-2 group flex-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-50">Notas Rápidas <span className="text-zinc-400 font-normal ml-1">(Opcional)</span></label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Deixa contexto útil aqui..." 
            className="flex h-32 w-full rounded-xl border border-transparent shadow-sm bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm placeholder:text-zinc-500/70 hover:border-zinc-200 focus:border-zinc-300 dark:hover:border-zinc-700 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-zinc-300/10 transition-all duration-200 resize-none"
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nível de Prioridade</label>
          <div className="flex gap-2 bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                  priority === p 
                  ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50'
                }`}
              >
                {p === 'low' && 'Baixa'}
                {p === 'medium' && 'Média'}
                {p === 'high' && 'Alta'}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
