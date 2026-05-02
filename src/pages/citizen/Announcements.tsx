import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Megaphone } from 'lucide-react';

type AnnouncementItem = {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  publishedAt?: string;
};

export default function Announcements() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/common/announcements');
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading announcements...</div>;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Announcements</h1>
          <p className="text-slate-500 font-medium tracking-tight">Official updates from the municipality.</p>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 text-slate-500 rounded-2xl">
              <Megaphone size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">All announcements</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{items.length} published</p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
              <Megaphone size={32} />
            </div>
            <p className="text-slate-500 font-medium">No announcements yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map((a) => (
              <div key={a.id} className="px-8 py-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">{a.content}</p>
                    {a.publishedAt && (
                      <p className="text-[10px] text-slate-400 font-mono mt-3">
                        {new Date(a.publishedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-slate-50 border-slate-200 text-slate-700">
                    {a.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

