import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BarChart3, Loader2 } from 'lucide-react';

type PollOption = { id: number; optionText: string };
type PollItem = {
  id: number;
  question: string;
  description?: string | null;
  expiresAt?: string | null;
  options?: PollOption[];
};

export default function Polls() {
  const [items, setItems] = useState<PollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingPollId, setVotingPollId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/common/polls');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setItems([]);
      setError('Failed to load polls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const vote = async (pollId: number, optionId: number) => {
    setVotingPollId(pollId);
    setError(null);
    try {
      await api.post(`/citizen/polls/${pollId}/vote`, { optionId });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not submit vote.');
    } finally {
      setVotingPollId(null);
    }
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading polls...</div>;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Polls</h1>
          <p className="text-slate-500 font-medium tracking-tight">Vote on community initiatives and surveys.</p>
        </div>
      </header>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 text-slate-500 rounded-2xl">
              <BarChart3 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Active polls</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{items.length} available</p>
            </div>
          </div>
          <button
            onClick={load}
            className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
              <BarChart3 size={32} />
            </div>
            <p className="text-slate-500 font-medium">No active polls right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map((p) => (
              <div key={p.id} className="px-8 py-6">
                <p className="text-sm font-bold text-slate-900">{p.question}</p>
                {p.description && <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">{p.description}</p>}
                {p.expiresAt && (
                  <p className="text-[10px] text-slate-400 font-mono mt-3">
                    Expires: {new Date(p.expiresAt).toLocaleString()}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(p.options || []).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => vote(p.id, o.id)}
                      disabled={votingPollId === p.id}
                      className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-white hover:border-slate-300 transition-all disabled:opacity-60"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-slate-800">{o.optionText}</span>
                        {votingPollId === p.id && <Loader2 className="animate-spin" size={16} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

