import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

type Card = { id?: string; question: string; answer: string; collection_id?: number | null; ef?: number; interval_days?: number; repetitions?: number; due_date?: string | null };

enum StudyMode { View = 'view', Quiz = 'quiz' }

export default function Flashcards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [mode, setMode] = useState<StudyMode>(StudyMode.View);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [collections, setCollections] = useState<{ id: number; name: string }[]>([]);
  const [collectionId, setCollectionId] = useState<number | 'all'>('all');
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('flashcards').select('*').order('created_at', { ascending: true });
      setCards(data ?? []);
      const { data: cols } = await supabase.from('flashcard_collections').select('id,name').order('created_at');
      setCollections(cols ?? []);
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
    const inserts = data.cards.map((c: Card) => ({ ...c, user_id: userId, collection_id: collectionId === 'all' ? null : collectionId }));
    await supabase.from('flashcards').insert(inserts);
  }

  async function newCollection() {
    const name = prompt('Collection name');
    if (!name) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    const { data, error } = await supabase.from('flashcard_collections').insert({ name, user_id: userId }).select('id,name').single();
    if (!error && data) {
      setCollections((c) => [...c, data]);
      setCollectionId(data.id);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const text = await file.text();
    await generateFromText(text);
    setUploading(false);
  }

  const filtered = useMemo(() => {
    let list = cards;
    if (collectionId !== 'all') list = list.filter((c) => c.collection_id === collectionId);
    if (mode === StudyMode.Quiz) {
      list = list
        .filter((c) => !c.due_date || new Date(c.due_date) <= new Date())
        .sort((a, b) => (a.due_date ? new Date(a.due_date).getTime() : 0) - (b.due_date ? new Date(b.due_date).getTime() : 0));
    }
    if (shuffle) list = [...list].sort(() => Math.random() - 0.5);
    return list;
  }, [cards, collectionId, shuffle, mode]);

  const current = filtered[idx % Math.max(filtered.length, 1)];

  function applyReview(card: Card, quality: 0 | 1 | 2 | 3 | 4 | 5) {
    const prevEf = card.ef ?? 2.5;
    const prevReps = card.repetitions ?? 0;
    const prevInt = card.interval_days ?? 0;
    const ef = Math.max(1.3, prevEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const repetitions = quality < 3 ? 0 : prevReps + 1;
    const interval_days = repetitions === 0 ? 1 : repetitions === 1 ? 1 : Math.round(prevInt * ef) || 1;
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + interval_days);
    return { ef, repetitions, interval_days, due_date: due_date.toISOString().slice(0, 10) };
  }

  async function mark(card: Card, quality: 0 | 1 | 2 | 3 | 4 | 5) {
    const update = applyReview(card, quality);
    await supabase.from('flashcards').update(update).eq('id', card.id);
    setIdx((i) => (i + 1) % Math.max(filtered.length, 1));
    setShow(false);
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('analytics').insert({ user_id: userData.user?.id, flashcards_completed: 1 });
  }

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
        <select value={collectionId} onChange={(e)=> setCollectionId((e.target.value === 'all' ? 'all' : Number(e.target.value)))} className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900">
          <option value="all">All collections</option>
          {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="px-3 py-2 rounded-md border" onClick={newCollection}>New collection</button>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shuffle} onChange={(e)=>setShuffle(e.target.checked)} /> Shuffle</label>
      </div>

      {mode === StudyMode.View && (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id ?? c.question} className="p-4 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 mb-1">EF {c.ef ?? 2.5} • Interval {c.interval_days ?? 0}d</div>
              <div className="font-semibold mb-2">{c.question}</div>
              <div className="text-gray-600 dark:text-gray-300">{c.answer}</div>
            </div>
          ))}
        </div>
      )}

      {mode === StudyMode.Quiz && current && (
        <div className="max-w-xl">
          <div className="p-6 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Due {current.due_date ?? 'today'}</div>
            <div className="font-semibold mb-2">{current.question}</div>
            {show && <div className="text-gray-600 dark:text-gray-300">{current.answer}</div>}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <button className="px-3 py-2 rounded-md border" onClick={() => setShow((s) => !s)}>{show? 'Hide' : 'Show'} answer</button>
            <button className="px-3 py-2 rounded-md border" onClick={() => setIdx((i) => (i + 1) % Math.max(filtered.length, 1))}>Skip</button>
            <button className="px-3 py-2 rounded-md border" onClick={() => mark(current, 2)}>Hard</button>
            <button className="px-3 py-2 rounded-md border" onClick={() => mark(current, 3)}>Good</button>
            <button className="px-3 py-2 rounded-md border" onClick={() => mark(current, 5)}>Easy</button>
          </div>
        </div>
      )}

      {uploading && <div>Generating flashcards…</div>}
    </div>
  );
}