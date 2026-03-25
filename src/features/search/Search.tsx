import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { db } from '../../db/db';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export default function Search() {
  const [query, setQuery] = useState('');
  
  const results = useLiveQuery(async () => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    
    // Naive local search over offline Dexie instance
    const tasks = await db.tasks.toArray();
    return tasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.project?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full animate-in fade-in bg-zinc-50 dark:bg-zinc-950">
      <header className="px-6 py-4 flex items-center gap-3 sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 border-b border-zinc-200 dark:border-zinc-800/50">
        <Button variant="ghost" size="sm" asChild className="w-10 px-0 -ml-2 rounded-full shrink-0">
          <Link to="/">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Procurar tarefas..."
            className="pl-9 bg-white shadow-sm dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-950 rounded-full h-10 transition-all font-medium"
          />
        </div>
      </header>

      <div className="p-6 overflow-y-auto flex-1">
        {query.trim().length > 0 && results?.length === 0 && (
          <div className="text-center mt-20">
            <SearchIcon className="w-8 h-8 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 font-medium">Nenhum resultado para "{query}"</p>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {results?.map(task => (
            <Card key={task.id} className="p-4 bg-white hover:border-zinc-300 dark:bg-zinc-900 dark:hover:border-zinc-600 transition-colors" asChild>
              <Link to={`/task/${task.id}/resume`} className="block group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1.5 block">{task.project || 'Geral'}</span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors">{task.title}</h3>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
