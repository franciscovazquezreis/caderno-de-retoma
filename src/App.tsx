/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { NewTaskPage } from './pages/NewTaskPage';
import { PauseContextPage } from './pages/PauseContextPage';
import { ResumeContextPage } from './pages/ResumeContextPage';
import { TaskHistoryPage } from './pages/TaskHistoryPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { useEffect } from 'react';
import { db } from './db/db';
import { AuthProvider } from './components/AuthProvider';
import './i18n';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Apply theme and language on load
    const applySettings = async () => {
      const settings = await db.settings.get('default');
      
      // Theme
      const theme = settings?.theme || 'system';
      const root = window.document.documentElement;
      
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }

      // Language
      if (settings?.language && settings.language !== i18n.language) {
        i18n.changeLanguage(settings.language);
      }
    };
    applySettings();
  }, [i18n]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/task/new" element={<NewTaskPage />} />
            <Route path="/task/:id/pause" element={<PauseContextPage />} />
            <Route path="/task/:id/resume" element={<ResumeContextPage />} />
            <Route path="/task/:id/history" element={<TaskHistoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
