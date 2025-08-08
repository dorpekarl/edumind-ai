import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        navigate('/onboarding?next=' + encodeURIComponent(location.pathname), { replace: true });
      } else {
        setReady(true);
      }
    }
    check();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) navigate('/onboarding', { replace: true });
      else setReady(true);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [navigate, location.pathname]);

  if (!ready) return null;
  return <>{children}</>;
}