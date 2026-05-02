import React, { useMemo, useRef, useState } from 'react';
import api from '../../api/axios';
import { Bot, Loader2, Send } from 'lucide-react';

type ChatMsg = { role: 'user' | 'model'; content: string };

export default function MunicipalityBot() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'model', content: 'Hi — I’m Municipality BOT. Ask me about service requests, complaints, taxes, or portal usage.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const history = useMemo(
    () => messages.filter((m) => m.content).map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    const next = [...messages, { role: 'user', content: text } as ChatMsg];
    setMessages(next);
    queueMicrotask(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));

    try {
      const res = await api.post('/citizen/bot/ask', { message: text, history });
      const reply = String(res.data?.reply || '').trim() || 'Sorry — I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'model', content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: e?.response?.data?.message || 'BOT is currently unavailable.' },
      ]);
    } finally {
      setSending(false);
      queueMicrotask(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Ask Municipality BOT</h1>
          <p className="text-slate-500 font-medium tracking-tight">
            Get help with municipal services, requirements, and portal workflows.
          </p>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-900">
          <Bot size={18} className="text-blue-600" />
          Chat
        </div>

        <div className="p-6 space-y-4 max-h-[520px] overflow-auto">
          {messages.map((m, idx) => (
            <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[80%] bg-slate-900 text-white px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap'
                    : 'max-w-[80%] bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap'
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send();
              }}
              placeholder="Type your question…"
              className="flex-1 px-5 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-slate-900"
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Send
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-3">
            Tip: include the service type, your situation, and what you already submitted.
          </p>
        </div>
      </div>
    </div>
  );
}

