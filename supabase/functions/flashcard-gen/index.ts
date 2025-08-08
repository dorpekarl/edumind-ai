import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { text } = await req.json();
    if (!text || text.length < 10) throw new Error('Provide text with at least 10 characters');

    const prompt = `Create 10 concise Q&A flashcards from the following content. Return strict JSON with schema {"cards":[{"question":"...","answer":"..."}...]}. Content:\n${text}`;

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
    if (!openaiKey) throw new Error('Missing OPENAI_API_KEY');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] })
    });

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content ?? '{}';

    let parsed: any;
    try { parsed = JSON.parse(content); } catch {
      // attempt to extract JSON if wrapped
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { cards: [] };
    }
    const cards = Array.isArray(parsed.cards) ? parsed.cards.slice(0, 20) : [];
    return new Response(JSON.stringify({ cards }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});