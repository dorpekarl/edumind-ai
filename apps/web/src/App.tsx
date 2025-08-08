import { Link, NavLink, useLocation } from 'react-router-dom';
import { AppRoutes } from './routes';
import { useEffect } from 'react';
import { ThemeToggle } from '@edumind/shared/src/components/ThemeToggle';
import AuthGate from './components/AuthGate';

export default function App() {
  const location = useLocation();
  useEffect(() => {
    document.title = `EduMind AI – ${location.pathname.replace('/', '') || 'Dashboard'}`;
  }, [location.pathname]);

  const navItem = (
    path: string,
    label: string,
  ) => (
    <NavLink to={path} className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="font-bold text-lg">EduMind <span className="text-primary">AI</span></Link>
          <nav className="hidden md:flex gap-2 ml-4">
            {navItem('/', 'Dashboard')}
            {navItem('/chat', 'AI Chat')}
            {navItem('/flashcards', 'Flashcards')}
            {navItem('/analytics', 'Analytics')}
            {navItem('/subscription', 'Subscription')}
            {navItem('/settings', 'Settings')}
            {navItem('/support', 'Support')}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AuthGate>
          <AppRoutes />
        </AuthGate>
      </main>
    </div>
  );
}