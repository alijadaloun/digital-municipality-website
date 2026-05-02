import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { Activity, Loader2 } from 'lucide-react';

type LogItem = {
  id: number;
  userId?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  metadata?: any;
  createdAt?: string;
  user?: { firstName: string; lastName: string; email: string } | null;
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [action, setAction] = useState('');
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);

  const limit = 50;

  const load = async (reset: boolean) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await api.get('/admin/logs', {
        params: {
          limit,
          offset: reset ? 0 : offset,
          action: action || undefined,
        },
      });
      const next = Array.isArray(res.data) ? res.data : [];
      if (reset) setLogs(next);
      else setLogs((prev) => [...prev, ...next]);
      setOffset((prev) => (reset ? limit : prev + limit));
    } catch {
      if (reset) setLogs([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      const u = l.user ? `${l.user.firstName} ${l.user.lastName} ${l.user.email}` : '';
      return `${l.action} ${l.details || ''} ${u} ${l.ipAddress || ''}`.toLowerCase().includes(q);
    });
  }, [logs, query]);

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading system logs...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">System Logs</h1>
          <p className="text-slate-500 font-medium tracking-tight">Audit trail of key actions across the system.</p>
        </div>
        <button
          onClick={() => load(true)}
          className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800"
        >
          Refresh
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search action, details, user, IP..."
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
            />
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Action filter (exact)"
              className="w-[220px] px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
            />
            <button
              onClick={() => load(true)}
              className="bg-blue-600 text-white text-xs px-4 py-3 rounded-xl font-bold hover:bg-blue-700 whitespace-nowrap"
            >
              Apply
            </button>
          </div>
          <div className="text-xs font-bold text-slate-400 whitespace-nowrap">{filtered.length} shown</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
              <Activity size={28} />
            </div>
            <p className="font-medium">No logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((l) => (
              <div key={l.id} className="px-8 py-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{l.action}</p>
                    {l.details && <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">{l.details}</p>}
                    <p className="text-[10px] text-slate-400 font-mono mt-3">
                      {l.createdAt ? new Date(l.createdAt).toLocaleString() : '—'} • IP: {l.ipAddress || '—'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      User: {l.user ? `${l.user.firstName} ${l.user.lastName} (${l.user.email})` : (l.userId || '—')}
                    </p>
                  </div>
                  <div className="shrink-0 text-[10px] font-mono text-slate-400">#{l.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Showing latest logs (load more for older entries).</span>
          <button
            onClick={() => load(false)}
            disabled={loadingMore}
            className="bg-white border border-slate-200 text-slate-700 text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {loadingMore ? <Loader2 className="animate-spin" size={16} /> : 'Load more'}
          </button>
        </div>
      </div>
    </div>
  );
}

