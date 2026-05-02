import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { AlertCircle, Loader2 } from 'lucide-react';

type ComplaintItem = {
  id: string;
  subject: string;
  description?: string;
  category?: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminResponse?: string | null;
  locationText?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  user?: { firstName: string; lastName: string; email: string };
  attachments?: { id: number; fileUrl: string }[];
};

export default function AdminComplaints() {
  const [items, setItems] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ComplaintItem['status']>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/complaints');
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

  const filtered = useMemo(() => {
    const statusRank = (s: ComplaintItem['status']) => {
      if (s === 'open') return 0;
      if (s === 'in_progress') return 1;
      if (s === 'resolved') return 2;
      return 3;
    };
    const sorted = items
      .slice()
      .sort((a, b) => statusRank(a.status) - statusRank(b.status) || (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (filter === 'all') return sorted;
    return sorted.filter((i) => i.status === filter);
  }, [items, filter]);

  const update = async (id: string, patch: Partial<Pick<ComplaintItem, 'status' | 'adminResponse'>>) => {
    setSavingId(id);
    try {
      await api.patch(`/admin/complaints/${id}`, patch);
      await load();
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading complaints...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Complaints</h1>
          <p className="text-slate-500 font-medium tracking-tight">Review citizen reports and update their status.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={load}
            className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-4">Complaint</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-3">Citizen</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center col-span-2">Status</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right col-span-3">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
              <AlertCircle size={28} />
            </div>
            <p className="font-medium">No complaints found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((c) => (
              <div key={c.id} className="grid grid-cols-12 px-8 py-6 items-start gap-4">
                <div className="col-span-4">
                  <p className="text-sm font-bold text-slate-900">{c.subject}</p>
                  <p className="text-xs text-slate-500 mt-1">{c.category || 'General'}</p>
                  {c.description && <p className="text-xs text-slate-600 mt-3 line-clamp-3">{c.description}</p>}
                  {c.locationText && <p className="text-[10px] text-slate-400 font-mono mt-3">📍 {c.locationText}</p>}
                  {(c.latitude != null && c.longitude != null) && (
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      {Number(c.latitude).toFixed(5)}, {Number(c.longitude).toFixed(5)}
                    </p>
                  )}
                  {c.attachments?.[0]?.fileUrl && (
                    <a
                      className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline"
                      href={c.attachments[0].fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View attachment
                    </a>
                  )}
                </div>

                <div className="col-span-3">
                  <p className="text-sm font-bold text-slate-900">
                    {c.user ? `${c.user.firstName} ${c.user.lastName}` : '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{c.user?.email || '—'}</p>
                  {c.createdAt && <p className="text-[10px] text-slate-400 font-mono mt-3">{new Date(c.createdAt).toLocaleString()}</p>}
                </div>

                <div className="col-span-2 flex justify-center">
                  <select
                    value={c.status}
                    onChange={(e) => update(c.id, { status: e.target.value as any })}
                    disabled={savingId === c.id}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="col-span-3 flex items-start justify-end gap-2">
                  <button
                    onClick={() => {
                      const resp = window.prompt('Admin response (optional):', c.adminResponse || '');
                      if (resp === null) return;
                      update(c.id, { adminResponse: resp });
                    }}
                    disabled={savingId === c.id}
                    className="bg-white border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-lg font-bold hover:bg-slate-50"
                  >
                    Respond
                  </button>
                  <button
                    onClick={() => update(c.id, { status: 'in_progress' })}
                    disabled={savingId === c.id}
                    className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-blue-700"
                  >
                    {savingId === c.id ? <Loader2 className="animate-spin" size={16} /> : 'Take'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

