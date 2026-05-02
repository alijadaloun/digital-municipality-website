import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Megaphone, Trash2 } from 'lucide-react';

type AnnouncementItem = {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  publishedAt?: string;
};

export default function AdminAnnouncements() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementItem['priority']>('low');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/announcements', { title, content, priority });
      setTitle('');
      setContent('');
      setPriority('low');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/announcements/${id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading announcements...</div>;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Publish News</h1>
          <p className="text-slate-500 font-medium tracking-tight">Create municipality announcements for citizens.</p>
        </div>
        <button
          onClick={load}
          className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800"
        >
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-6">
            <Megaphone size={18} className="text-blue-600" />
            New announcement
          </div>

          <form onSubmit={publish} className="space-y-4">
            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Content">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900 min-h-[180px]"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : 'Publish'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-8 py-5 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-7">Announcement</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center col-span-2">Priority</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right col-span-3">Actions</span>
          </div>

          {items.length === 0 ? (
            <div className="p-16 text-center text-slate-500">No announcements yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {items.map((a) => (
                <div key={a.id} className="grid grid-cols-12 px-8 py-6 items-start gap-4">
                  <div className="col-span-7 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{a.title}</p>
                    <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap line-clamp-3">{a.content}</p>
                    {a.publishedAt && (
                      <p className="text-[10px] text-slate-400 font-mono mt-3">
                        {new Date(a.publishedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-slate-50 border-slate-200 text-slate-700">
                      {a.priority}
                    </span>
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <button
                      onClick={() => remove(a.id)}
                      disabled={deletingId === a.id}
                      className="bg-white border border-slate-200 text-red-600 text-xs px-3 py-2 rounded-lg font-bold hover:bg-red-50 disabled:opacity-60 inline-flex items-center gap-2"
                    >
                      {deletingId === a.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-900 ml-1">{label}</label>
      {children}
    </div>
  );
}

