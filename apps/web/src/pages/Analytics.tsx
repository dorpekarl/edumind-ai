import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../supabaseClient';

export default function Analytics() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('analytics').select('*').order('created_at', { ascending: true }).limit(90);
      setData(data ?? []);
    }
    load();
  }, []);

  const hoursData = data.map((d) => ({ date: new Date(d.created_at).toLocaleDateString(), hours: d.study_hours ?? 0 }));
  const flashcardsTotal = data.reduce((a, b) => a + (b.flashcards_completed ?? 0), 0);
  const topicsTotal = data.reduce((a, b) => a + (b.topics_completed ?? 0), 0);

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat title="Total hours" value={`${hoursData.reduce((a,b)=>a+b.hours,0)}`} />
        <Stat title="Flashcards completed" value={`${flashcardsTotal}`} />
        <Stat title="Topics completed" value={`${topicsTotal}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-2">Study hours over time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hoursData}>
                <XAxis dataKey="date" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#6C5CE7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-2">Activity breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Flashcards', value: flashcardsTotal }, { name: 'Topics', value: topicsTotal }]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6C5CE7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={[{ name: 'Completed', value: flashcardsTotal }, { name: 'Remaining', value: Math.max(0, 100 - flashcardsTotal) }]} cx="50%" cy="50%" outerRadius={100} label>
                <Cell fill="#6C5CE7" />
                <Cell fill="#A29BFE" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
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