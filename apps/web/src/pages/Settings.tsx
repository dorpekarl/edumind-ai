import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { ThemeToggle } from '@edumind/shared/src/components/ThemeToggle';

export default function Settings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? '');
      setName(data.user?.user_metadata?.name ?? '');
    }
    load();
  }, []);

  async function resetPassword() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/onboarding' });
    if (error) alert(error.message); else alert('Check your email for reset link');
  }

  return (
    <div className="grid gap-6 max-w-xl">
      <div className="p-4 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Profile</h3>
        <div className="grid gap-2">
          <label className="text-sm">Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900" />
          <label className="text-sm">Email</label>
          <input value={email} disabled className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900" />
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Theme</h3>
        <ThemeToggle />
      </div>
      <div className="p-4 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Security</h3>
        <button className="px-3 py-2 bg-primary text-white rounded-md" onClick={resetPassword}>Reset password</button>
      </div>
    </div>
  );
}