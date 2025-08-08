import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import atomOneLight from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph } from 'docx';
import { supabase } from '../supabaseClient';

SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('javascript', javascript);

type Message = { id?: string; role: 'user' | 'assistant' | 'system'; message: string; created_at?: string };

type Mode = 'summary' | 'deep' | 'quiz';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('summary');
  const [speaking, setSpeaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  useEffect(() => {
    const sub = supabase
      .channel('realtime:chat_history')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_history' }, (payload) => {
        const row = payload.new as Message;
        setMessages((m) => [...m, row]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  useEffect(() => {
    containerRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function loadHistory() {
    const { data } = await supabase.from('chat_history').select('*').order('created_at', { ascending: true }).limit(50);
    setMessages(data ?? []);
  }
  useEffect(() => { loadHistory(); }, []);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    const userMessage: Message = { role: 'user', message: text };
    setMessages((m) => [...m, userMessage]);
    await supabase.from('chat_history').insert({ user_id: userId, role: 'user', message: text });

    const { data: fnRes, error } = await supabase.functions.invoke('ai-chat', {
      body: { mode, messages: [...messages.filter(m => m.role !== 'system'), userMessage] }
    });
    if (error) {
      const err: Message = { role: 'assistant', message: `Error: ${error.message}` } as Message;
      setMessages((m) => [...m, err]);
      return;
    }
    const assistant: Message = { role: 'assistant', message: fnRes.reply };
    setMessages((m) => [...m, assistant]);
    await supabase.from('chat_history').insert({ user_id: userId, role: 'assistant', message: fnRes.reply });
  }

  function exportPDF() {
    const element = document.getElementById('chat-export');
    if (!element) return;
    html2pdf().from(element).set({ filename: 'edumind-chat.pdf' }).save();
  }

  async function exportWord() {
    const doc = new Document({
      sections: [
        {
          children: messages.map((m) => new Paragraph(`${m.role.toUpperCase()}: ${m.message}`)),
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edumind-chat.docx';
    a.click();
    URL.revokeObjectURL(url);
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900"
        >
          <option value="summary">Summary</option>
          <option value="deep">Deep Dive</option>
          <option value="quiz">Quiz</option>
        </select>
        <button onClick={exportPDF} className="px-3 py-2 bg-primary text-white rounded-md">Export PDF</button>
        <button onClick={exportWord} className="px-3 py-2 bg-gray-200 dark:bg-gray-800 rounded-md">Export Word</button>
      </div>

      <div id="chat-export" ref={containerRef} className="space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-3 rounded-md border ${m.role === 'assistant' ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'} border-gray-200 dark:border-gray-800`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase text-gray-500">{m.role}</span>
              {m.role === 'assistant' && (
                <button className="text-xs text-primary" onClick={() => speak(m.message)}>
                  {speaking ? 'Speaking…' : 'Read aloud'}
                </button>
              )}
            </div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <SyntaxHighlighter
                      {...rest as any}
                      PreTag="div"
                      language={match[1]}
                      style={theme === 'dark' ? atomOneDark : atomOneLight}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {m.message}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Ask anything…"
          className="flex-1 border rounded-md px-3 py-2 bg-white dark:bg-gray-900"
        />
        <button onClick={send} className="px-4 py-2 bg-primary text-white rounded-md">Send</button>
      </div>
    </div>
  );
}