import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen w-full font-sans antialiased text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-950">
      <main className="max-w-md mx-auto min-h-screen bg-white dark:bg-zinc-900 shadow-xl border-x border-zinc-200 dark:border-zinc-800 relative">
        <Outlet />
      </main>
    </div>
  );
}
