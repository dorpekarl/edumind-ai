import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Flashcards from './pages/Flashcards';
import Analytics from './pages/Analytics';
import Subscription from './pages/Subscription';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Onboarding from './pages/Onboarding';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/flashcards" element={<Flashcards />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/support" element={<Support />} />
    </Routes>
  );
}