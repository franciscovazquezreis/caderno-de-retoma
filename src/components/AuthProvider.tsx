import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  isUnlocked: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const settings = useLiveQuery(() => db.settings.get('default'));
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (settings && !settings.requirePin) {
      setIsUnlocked(true);
    } else if (settings && settings.requirePin) {
      // If requirePin is true, we need to check session storage to see if already unlocked in this session
      const sessionUnlocked = sessionStorage.getItem('retoma_unlocked');
      if (sessionUnlocked === 'true') {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    }
  }, [settings]);

  // Auto lock after inactivity
  useEffect(() => {
    if (!settings?.requirePin || !isUnlocked) return;

    let timeoutId: number;
    
    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsUnlocked(false);
        sessionStorage.removeItem('retoma_unlocked');
      }, (settings.autoLockMinutes || 5) * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer));
    
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [settings?.requirePin, settings?.autoLockMinutes, isUnlocked]);

  const unlock = (pin: string) => {
    // Simple hash check (in a real app, use a proper KDF)
    // For MVP, we just compare the base64 encoded string if we used btoa, or just plain text if we stored it plain
    // Let's assume pinHash is just the plain PIN for this simple MVP, or btoa(pin)
    const hashedPin = btoa(pin);
    if (settings?.pinHash === hashedPin) {
      setIsUnlocked(true);
      sessionStorage.setItem('retoma_unlocked', 'true');
      setError(false);
      setPinInput('');
      return true;
    }
    setError(true);
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('retoma_unlocked');
  };

  if (!settings) return null;

  if (settings.requirePin && !isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="w-full max-w-xs space-y-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <Lock className="h-8 w-8 text-zinc-900 dark:text-zinc-50" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t('auth.lockedTitle')}</h1>
            <p className="text-sm text-zinc-500">{t('auth.lockedSubtitle')}</p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); unlock(pinInput); }} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setError(false);
                }}
                className={`w-full rounded-md border bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-zinc-50 ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-200 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-300'
                }`}
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{t('auth.incorrectPin')}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={pinInput.length < 4}>
              {t('auth.unlockBtn')}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};;
