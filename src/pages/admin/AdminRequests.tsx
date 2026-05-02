import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { FileText, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

type ServiceRequestItem = {
  id: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: { firstName: string; lastName: string; email: string };
  service_type?: { id: number; name: string; price: string | number };
  serviceType?: { id: number; name: string; price: string | number };
};

function getServiceTypeName(r: ServiceRequestItem) {
  return (r as any).service_type?.name || (r as any).serviceType?.name || '—';
}

function getUserLabel(r: ServiceRequestItem) {
  const u = (r as any).user;
  if (!u) return '—';
  return `${u.firstName} ${u.lastName}`;
}

function statusOrder(s: ServiceRequestItem['status']) {
  // pending-first ordering
  if (s === 'submitted') return 0;
  if (s === 'under_review') return 1;
  if (s === 'approved') return 2;
  if (s === 'completed') return 3;
  return 4; // rejected last
}

export default function AdminRequests() {
  const [items, setItems] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ServiceRequestItem['status']>('all');
  const [query, setQuery] = useState('');
  const [searchParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/service-requests');
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

  useEffect(() => {
    const status = searchParams.get('status') as any;
    if (status && ['submitted', 'under_review', 'approved', 'rejected', 'completed'].includes(status)) {
      setFilter(status);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = items.slice();
    list.sort((a, b) => statusOrder(a.status) - statusOrder(b.status) || (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (filter !== 'all') list = list.filter((i) => i.status === filter);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((i) => {
      const u = (i as any).user;
      const uStr = u ? `${u.firstName} ${u.lastName} ${u.email}` : '';
      return `${i.id} ${getServiceTypeName(i)} ${uStr}`.toLowerCase().includes(q);
    });
  }, [items, filter, query]);

  const update = async (id: string, patch: { status: ServiceRequestItem['status']; notes?: string }) => {
    setSavingId(id);
    try {
      await api.patch(`/admin/service-requests/${id}/status`, patch);
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const approve = async (r: ServiceRequestItem) => {
    const note = window.prompt(
      'Approval note (optional). If documents/info are missing, write what is needed:',
      r.notes || ''
    );
    if (note === null) return;
    await update(r.id, { status: 'approved', notes: note || undefined });
  };

  const reject = async (r: ServiceRequestItem) => {
    const note = window.prompt(
      'Rejection note (required). Explain what is missing / how to fix:',
      r.notes || ''
    );
    if (note === null) return;
    if (!note.trim()) {
      window.alert('Rejection note is required.');
      return;
    }
    await update(r.id, { status: 'rejected', notes: note });
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading service requests...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Service Requests</h1>
          <p className="text-slate-500 font-medium tracking-tight">Pending requests are shown first.</p>
        </div>
        <button
          onClick={load}
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
              placeholder="Search by ID, user, or service type..."
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold"
            >
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="text-xs font-bold text-slate-400 whitespace-nowrap">{filtered.length} results</div>
        </div>

        <div className="grid grid-cols-12 px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-4">Request</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-3">Citizen</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center col-span-2">Status</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right col-span-3">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
              <FileText size={28} />
            </div>
            <p className="font-medium">No service requests found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((r) => (
              <div key={r.id} className="grid grid-cols-12 px-8 py-6 items-start gap-4">
                <div className="col-span-4">
                  <p className="text-sm font-bold text-slate-900">
                    {getServiceTypeName(r)}
                    <span className="ml-2 text-[10px] font-mono text-slate-400">{r.id.slice(0, 8)}...</span>
                  </p>
                  {r.createdAt && (
                    <p className="text-[10px] text-slate-400 font-mono mt-2">
                      Created: {new Date(r.createdAt).toLocaleString()}
                    </p>
                  )}
                  {r.notes && (
                    <p className="text-xs text-slate-600 mt-3 whitespace-pre-wrap line-clamp-3">{r.notes}</p>
                  )}
                </div>

                <div className="col-span-3">
                  <p className="text-sm font-bold text-slate-900">{getUserLabel(r)}</p>
                  <p className="text-xs text-slate-500 mt-1">{(r as any).user?.email || '—'}</p>
                </div>

                <div className="col-span-2 flex justify-center">
                  <StatusBadge status={r.status} />
                </div>

                <div className="col-span-3 flex items-start justify-end gap-2">
                  <button
                    onClick={() => approve(r)}
                    disabled={savingId === r.id || r.status === 'approved' || r.status === 'completed'}
                    className="bg-green-600 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    {savingId === r.id ? <Loader2 className="animate-spin" size={16} /> : 'Accept'}
                  </button>
                  <button
                    onClick={() => reject(r)}
                    disabled={savingId === r.id || r.status === 'rejected' || r.status === 'completed'}
                    className="bg-red-600 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-60"
                  >
                    Reject
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

function StatusBadge({ status }: { status: ServiceRequestItem['status'] }) {
  const styles: Record<ServiceRequestItem['status'], string> = {
    submitted: 'bg-blue-50 text-blue-600 border-blue-100',
    under_review: 'bg-orange-50 text-orange-600 border-orange-100',
    approved: 'bg-green-50 text-green-600 border-green-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
    completed: 'bg-teal-50 text-teal-600 border-teal-100',
  };
  return (
    <span className={`px-3 py-2 rounded-xl text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

