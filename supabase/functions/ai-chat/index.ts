import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { messages = [], mode = 'summary' } = await req.json();

    const system = mode === 'quiz'
      ? 'You generate Socratic quiz questions with brief feedback.'
      : mode === 'deep'
      ? 'You are a deep explainer. Provide detailed, step-by-step reasoning with examples.'
      : 'You summarize and highlight key points clearly and concisely.';

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
    if (!openaiKey) throw new Error('Missing OPENAI_API_KEY');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: system }, ...messages.map((m: any) => ({ role: m.role, content: m.message }))],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }
    const json = await response.json();
    const reply = json.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});