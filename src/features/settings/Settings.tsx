import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Trash2, Database } from 'lucide-react';
import { db } from '../../db/db';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function Settings() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const tasks = await db.tasks.toArray();
      const snapshots = await db.snapshots.toArray();
      const settings = await db.settings.toArray();
      const tags = await db.tags.toArray();
      
      const data = { tasks, snapshots, settings, tags, version: 1 };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `caderno-retoma-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) {
      alert("Erro ao exportar backup.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tasks && json.snapshots) {
          if (confirm('Atenção: A importação vai SOBRESCREVER localmente todos os dados atuais. Queres mesmo continuar?')) {
            await db.transaction('rw', db.tasks, db.snapshots, db.settings, db.tags, async () => {
              await db.tasks.clear();
              await db.snapshots.clear();
              await db.tasks.bulkAdd(json.tasks);
              await db.snapshots.bulkAdd(json.snapshots);
              if (json.settings?.length) {
                await db.settings.clear();
                await db.settings.bulkAdd(json.settings);
              }
            });
            alert('A importação do Contexto foi concluída com sucesso!');
          }
        } else {
          alert('Este ficheiro JSON não é um backup válido do Caderno de Retoma.');
        }
      } catch (err) {
        alert('Erro ao interpretar o ficheiro de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleClear = async () => {
    if (confirm('ATENÇÃO: Vais apagar todos os teus dados locais. Esta ação é completamente IRREVERSÍVEL sem um backup. Confirmas?')) {
      await db.tasks.clear();
      await db.snapshots.clear();
      alert('Todos os dados foram eliminados permanentemente.');
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-8 duration-500 fade-in bg-zinc-50 dark:bg-zinc-950">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="w-10 px-0 -ml-2 rounded-full">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Definições</h1>
        </div>
      </header>
      
      <div className="p-6 flex flex-col gap-8 flex-1 overflow-y-auto">
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Database className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Gestão de Dados Locais</h2>
          </div>
          
          <Card className="flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-white dark:bg-zinc-900">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Exportar Backup JSON</p>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 max-w-[150px]">Guarda todo o teu contexto offfline de forma segura.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={handleExport} disabled={isExporting}>
                <Download className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
            
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-white dark:bg-zinc-900">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Importar Backup JSON</p>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 max-w-[150px]">Restaura o ambiente a partir de um ficheiro prévio.</p>
              </div>
              <div className="relative">
                <Button size="sm" variant="secondary" className="ring-1 ring-zinc-200 dark:ring-zinc-700">
                  <Upload className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Procurar</span>
                </Button>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
              <div>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Eliminar Base de Dados</p>
                <p className="text-xs font-medium text-rose-600/70 dark:text-rose-400/70 mt-1">Apaga permanentemente os dados.</p>
              </div>
              <Button size="sm" variant="danger" onClick={handleClear} className="w-10 px-0 rounded-full">
                <Trash2 className="w-4 h-4 shrink-0" />
              </Button>
            </div>
          </Card>
        </section>
        
        <p className="text-xs font-medium text-center mt-12 text-zinc-400">Caderno de Retoma de Contexto (V1.0 MVP)<br/>Offline First Architecture</p>
      </div>
    </div>
  );
}
