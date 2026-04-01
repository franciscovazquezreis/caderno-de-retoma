import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Plus, Search, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Layout() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('nav.home'), path: '/' },
    { icon: Search, label: t('nav.search'), path: '/search' },
    { icon: Plus, label: t('nav.new'), path: '/task/new' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex justify-between items-center p-4 max-w-md mx-auto w-full">
        <h1 className="font-bold text-lg tracking-tight">{t('app.name')}</h1>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto w-full p-4 pt-0">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 pb-safe z-50">
        <div className="max-w-md mx-auto w-full flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors',
                  isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                )}
              >
                <item.icon className={cn('w-6 h-6', isActive ? 'stroke-[2.5px]' : 'stroke-2')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
