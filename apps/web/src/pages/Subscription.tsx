import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

type Sub = { plan: string; status: string; renewal_date: string };

export default function Subscription() {
  const [sub, setSub] = useState<Sub | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('subscriptions')
        .select('plan,status,renewal_date')
        .eq('user_id', userData.user?.id)
        .maybeSingle();
      setSub(data as any);
    }
    load();
  }, []);

  async function startCheckout(plan: string) {
    const { data, error } = await supabase.functions.invoke('paystack-webhook', { body: { action: 'init', plan } });
    if (error) return alert(error.message);
    // For web, redirect to authorization url if provided
    if (data?.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      alert('Unable to start checkout');
    }
  }

  return (
    <div className="grid gap-6">
      <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Your subscription</h3>
        {sub ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Plan: <b>{sub.plan}</b> – Status: <b>{sub.status}</b> – Renews: {new Date(sub.renewal_date).toLocaleDateString()}
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">No active subscription</div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <PlanCard title="Basic" price="$5/mo" onClick={() => startCheckout('basic')} />
        <PlanCard title="Pro" price="$12/mo" featured onClick={() => startCheckout('pro')} />
        <PlanCard title="Team" price="$30/mo" onClick={() => startCheckout('team')} />
      </div>
    </div>
  );
}

function PlanCard({ title, price, featured, onClick }: { title: string; price: string; featured?: boolean; onClick: () => void }) {
  return (
    <div className={`p-6 rounded-lg border ${featured ? 'border-primary' : 'border-gray-200 dark:border-gray-800'} bg-white dark:bg-gray-950`}>
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-3xl font-bold my-2">{price}</div>
      <button onClick={onClick} className="px-3 py-2 bg-primary text-white rounded-md">Choose {title}</button>
    </div>
  );
}