import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [summary, setSummary] = useState({ hours: 0, topics: 0, flashcards: 0 });
  const [chartData, setChartData] = useState<{ date: string; hours: number }[]>([]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data } = await supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(30);
      if (!data) return;
      const hours = data.reduce((a, b) => a + (b.study_hours ?? 0), 0);
      const topics = data.reduce((a, b) => a + (b.topics_completed ?? 0), 0);
      const flashcards = data.reduce((a, b) => a + (b.flashcards_completed ?? 0), 0);
      if (!ignore) {
        setSummary({ hours, topics, flashcards });
        setChartData(data.map((d) => ({ date: new Date(d.created_at).toLocaleDateString(), hours: d.study_hours ?? 0 })));
      }
    }
    load();
    const channel = supabase
      .channel('realtime:analytics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'analytics' },
        () => load()
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Study hours" value={`${summary.hours}`} />
        <Stat title="Topics completed" value={`${summary.topics}`} />
        <Stat title="Flashcards done" value={`${summary.flashcards}`} />
      </div>
      <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Last 30 days</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="#6C5CE7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink to="/chat" title="AI Chat" desc="Ask, summarize, quiz, and more" />
        <QuickLink to="/flashcards" title="Flashcards" desc="Study and generate cards" />
        <QuickLink to="/analytics" title="Analytics" desc="Track your progress" />
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function QuickLink({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to} className="p-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{desc}</div>
    </Link>
  );
}