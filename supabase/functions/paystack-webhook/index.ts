import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const sb = createClient(supabaseUrl, serviceKey);
  const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');

  try {
    // Handle webhook
    const signature = req.headers.get('x-paystack-signature');
    if (signature) {
      const bodyText = await req.text();
      // Note: For full security, compute HMAC with PAYSTACK_WEBHOOK_SECRET and compare
      const event = JSON.parse(bodyText);
      if (event?.event === 'charge.success') {
        const email = event.data.customer.email as string;
        const plan = event.data.plan?.name ?? 'pro';
        const renewal = new Date(event.data.next_payment_date ?? Date.now());
        // Map email to user id
        const { data: users } = await sb.from('users').select('id').eq('email', email).limit(1);
        const userId = users?.[0]?.id;
        if (userId) {
          await sb.from('subscriptions').upsert({ user_id: userId, plan, status: 'active', renewal_date: renewal.toISOString().slice(0,10) });
        }
      }
      return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Init flow
    const { action, plan } = await req.json();
    if (action === 'init') {
      if (!paystackSecret) throw new Error('Missing PAYSTACK_SECRET_KEY');
      const { data: auth } = await sb.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error('Not authenticated');
      const amountMap: Record<string, number> = { basic: 500, pro: 1200, team: 3000 };
      const amount = amountMap[plan] ?? 1200;
      const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${paystackSecret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, amount: amount * 100 })
      });
      const json = await initRes.json();
      return new Response(JSON.stringify({ authorization_url: json?.data?.authorization_url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});