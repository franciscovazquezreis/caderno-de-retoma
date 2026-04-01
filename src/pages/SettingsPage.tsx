import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Download, Upload, Trash2, Moon, Sun, Monitor, Lock, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get('default'));
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const { t } = useTranslation();

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (settings) {
      await db.settings.update('default', { theme });
      applyTheme(theme);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  const handleSavePin = async () => {
    if (pinInput.length < 4) {
      alert(t('settings.pinMinLength'));
      return;
    }
    await db.settings.update('default', {
      requirePin: true,
      pinHash: btoa(pinInput), // Simple base64 for MVP
    });
    setPinInput('');
    setShowPinSetup(false);
    alert(t('settings.pinSuccess'));
  };

  const handleRemovePin = async () => {
    if (window.confirm(t('settings.pinRemoveConfirm'))) {
      await db.settings.update('default', {
        requirePin: false,
        pinHash: undefined,
      });
      alert(t('settings.pinRemoved'));
    }
  };

  const handleExport = async () => {
    try {
      const tasks = await db.tasks.toArray();
      const snapshots = await db.snapshots.toArray();
      const tags = await db.tags.toArray();
      const taskTags = await db.taskTags.toArray();
      const settings = await db.settings.toArray();

      const data = { tasks, snapshots, tags, taskTags, settings };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `retoma-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
      alert(t('settings.exportError'));
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(t('settings.importConfirm'))) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        await db.transaction('rw', [db.tasks, db.snapshots, db.tags, db.taskTags, db.settings], async () => {
          await db.tasks.clear();
          await db.snapshots.clear();
          await db.tags.clear();
          await db.taskTags.clear();
          await db.settings.clear();

          if (data.tasks) await db.tasks.bulkAdd(data.tasks);
          if (data.snapshots) await db.snapshots.bulkAdd(data.snapshots);
          if (data.tags) await db.tags.bulkAdd(data.tags);
          if (data.taskTags) await db.taskTags.bulkAdd(data.taskTags);
          if (data.settings) await db.settings.bulkAdd(data.settings);
        });

        alert(t('settings.importSuccess'));
        window.location.reload();
      } catch (error) {
        console.error('Import failed', error);
        alert(t('settings.importError'));
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(t('settings.deleteAllConfirm'))) return;
    
    try {
      await db.transaction('rw', [db.tasks, db.snapshots, db.tags, db.taskTags], async () => {
        await db.tasks.clear();
        await db.snapshots.clear();
        await db.tags.clear();
        await db.taskTags.clear();
      });
      alert(t('settings.deleteAllSuccess'));
      window.location.reload();
    } catch (error) {
      console.error('Delete failed', error);
      alert(t('settings.deleteError'));
    }
  };

  if (!settings) return <div className="p-4 text-center text-zinc-500">{t('common.loading')}</div>;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-zinc-500">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appearance')}</CardTitle>
            <CardDescription>{t('settings.themeDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((tTheme) => (
                <button
                  key={tTheme}
                  onClick={() => handleThemeChange(tTheme)}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-md border p-4 transition-colors ${
                    settings.theme === tTheme 
                      ? 'bg-zinc-100 border-zinc-900 dark:bg-zinc-800 dark:border-zinc-50' 
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:border-zinc-800'
                  }`}
                >
                  {tTheme === 'light' ? <Sun className="h-5 w-5" /> : tTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                  <span className="text-sm font-medium">
                    {tTheme === 'light' ? t('settings.themeLight') : tTheme === 'dark' ? t('settings.themeDark') : t('settings.themeSystem')}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.security')}</CardTitle>
            <CardDescription>{t('settings.pinDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.requirePin ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                  <Lock className="h-5 w-5" />
                  <span className="text-sm font-medium">{t('settings.pinActive')}</span>
                </div>
                <Button variant="outline" className="w-full" onClick={handleRemovePin}>
                  {t('settings.removePinBtn')}
                </Button>
              </div>
            ) : showPinSetup ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">{t('settings.newPinLabel')}</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    className="text-center tracking-widest text-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowPinSetup(false); setPinInput(''); }}>
                    {t('common.cancel')}
                  </Button>
                  <Button className="flex-1" onClick={handleSavePin} disabled={pinInput.length < 4}>
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setShowPinSetup(true)}>
                <Unlock className="mr-2 h-4 w-4" /> {t('settings.setupPinBtn')}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.localData')}</CardTitle>
            <CardDescription>{t('settings.dataDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.exportBackup')}</Label>
              <Button variant="outline" className="w-full justify-start" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> {t('settings.saveJsonBtn')}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.importBackup')}</Label>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full justify-start pointer-events-none">
                  <Upload className="mr-2 h-4 w-4" /> {t('settings.loadJsonBtn')}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <Label className="text-red-500">{t('settings.dangerZone')}</Label>
              <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteAll}>
                <Trash2 className="mr-2 h-4 w-4" /> {t('settings.deleteAllBtn')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-zinc-500 pt-4">
          <p>{t('app.name')} v1.0.0</p>
          <p>{t('settings.footerDesc')}</p>
        </div>
      </div>
    </div>
  );
}
