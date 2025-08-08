import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

type Card = { id?: string; question: string; answer: string };

enum StudyMode { View = 'view', Quiz = 'quiz' }

export default function Flashcards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [mode, setMode] = useState<StudyMode>(StudyMode.View);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('flashcards').select('*').order('created_at', { ascending: true });
      setCards(data ?? []);
    }
    load();
    const sub = supabase
      .channel('realtime:flashcards')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flashcards' }, () => load())
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  async function generateFromText(text: string) {
    const { data, error } = await supabase.functions.invoke('flashcard-gen', { body: { text } });
    if (error) return alert(error.message);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    const inserts = data.cards.map((c: Card) => ({ ...c, user_id: userId }));
    await supabase.from('flashcards').insert(inserts);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const text = await file.text();
    await generateFromText(text);
    setUploading(false);
  }

  const current = cards[idx];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        <button className={`px-3 py-2 rounded-md border ${mode===StudyMode.View?'bg-primary text-white':'bg-white dark:bg-gray-900'}`} onClick={() => setMode(StudyMode.View)}>Study</button>
        <button className={`px-3 py-2 rounded-md border ${mode===StudyMode.Quiz?'bg-primary text-white':'bg-white dark:bg-gray-900'}`} onClick={() => setMode(StudyMode.Quiz)}>Quiz</button>
        <label className="px-3 py-2 rounded-md border bg-white dark:bg-gray-900 cursor-pointer">
          Upload notes (PDF/TXT/DOCX)
          <input type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={handleFile} />
        </label>
        <button className="px-3 py-2 rounded-md border" onClick={async () => {
          const text = prompt('Paste content to generate flashcards from:');
          if (text) await generateFromText(text);
        }}>Generate from text</button>
      </div>

      {mode === StudyMode.View && (
        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.id ?? c.question} className="p-4 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
              <div className="font-semibold mb-2">{c.question}</div>
              <div className="text-gray-600 dark:text-gray-300">{c.answer}</div>
            </div>
          ))}
        </div>
      )}

      {mode === StudyMode.Quiz && current && (
        <div className="max-w-xl">
          <div className="p-6 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
            <div className="font-semibold mb-2">{current.question}</div>
            {show && <div className="text-gray-600 dark:text-gray-300">{current.answer}</div>}
          </div>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-2 rounded-md border" onClick={() => setShow((s) => !s)}>{show? 'Hide' : 'Show'} answer</button>
            <button className="px-3 py-2 rounded-md border" onClick={() => { setIdx((i) => (i + 1) % cards.length); setShow(false); }}>Next</button>
            <button className="px-3 py-2 rounded-md border" onClick={async () => {
              // track analytics
              const { data: userData } = await supabase.auth.getUser();
              await supabase.from('analytics').insert({ user_id: userData.user?.id, study_hours: 0, topics_completed: 0, flashcards_completed: 1 });
            }}>Mark done</button>
          </div>
        </div>
      )}

      {uploading && <div>Generating flashcards…</div>}
    </div>
  );
}