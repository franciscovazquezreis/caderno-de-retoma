import { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search as SearchIcon, Clock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  const tasks = useLiveQuery(() => db.tasks.toArray());
  const snapshots = useLiveQuery(() => db.snapshots.toArray());

  const filteredTasks = tasks?.filter(task => {
    if (!query.trim()) return true;
    
    const lowerQuery = query.toLowerCase();
    const matchTitle = task.title.toLowerCase().includes(lowerQuery);
    const matchProject = task.project?.toLowerCase().includes(lowerQuery);
    const matchDescription = task.description?.toLowerCase().includes(lowerQuery);
    
    const taskSnaps = snapshots?.filter(s => s.taskId === task.id) || [];
    const matchSnapshots = taskSnaps.some(s => 
      s.whereIStopped.toLowerCase().includes(lowerQuery) ||
      s.nextExactStep.toLowerCase().includes(lowerQuery) ||
      s.currentBlocker?.toLowerCase().includes(lowerQuery) ||
      s.mistakeToAvoid?.toLowerCase().includes(lowerQuery)
    );

    return matchTitle || matchProject || matchDescription || matchSnapshots;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('search.title')}</h1>
        <p className="text-sm text-zinc-500">{t('search.subtitle')}</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder={t('search.placeholder')} 
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-4">
        {filteredTasks?.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>{t('search.noResults')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks?.map((task) => (
              <Link key={task.id} to={`/task/${task.id}/resume`}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-500" />
                          )}
                          {task.title}
                        </CardTitle>
                        {task.project && (
                          <CardDescription className="text-xs">{task.project}</CardDescription>
                        )}
                      </div>
                      <Badge variant={task.status === 'completed' ? 'secondary' : 'default'}>
                        {task.status === 'completed' ? t('dashboard.completed') : t('dashboard.active')}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
