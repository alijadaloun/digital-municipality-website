import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, FileText } from 'lucide-react';

type Report = {
  totals: { totalUsers: number; admins: number; citizens: number };
  topRequesters: any[];
};

export default function AdminUserReport() {
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports/users');
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-10 text-slate-500 font-medium">Generating report...</div>;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">User Report</h1>
          <p className="text-slate-500 font-medium tracking-tight">High-level user statistics and activity.</p>
        </div>
        <button
          onClick={load}
          className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800"
        >
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat title="Total users" value={data?.totals?.totalUsers ?? 0} icon={<Users size={18} />} />
        <Stat title="Admins" value={data?.totals?.admins ?? 0} icon={<Users size={18} />} />
        <Stat title="Citizens" value={data?.totals?.citizens ?? 0} icon={<Users size={18} />} />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-900">
          <FileText size={18} className="text-blue-600" />
          Top service-request submitters
        </div>
        {!data?.topRequesters?.length ? (
          <div className="p-12 text-slate-500">No data yet.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.topRequesters.map((row: any, idx: number) => (
              <div key={idx} className="px-8 py-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {row.user ? `${row.user.firstName} ${row.user.lastName}` : row.userId}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{row.user?.email || '—'}</p>
                </div>
                <span className="text-sm font-bold text-slate-900">{row.dataValues?.count ?? row.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{title}</div>
      <div className="flex items-end justify-between mt-3">
        <div className="text-4xl font-bold text-slate-900">{value}</div>
        <div className="p-3 rounded-xl bg-slate-50 text-slate-500">{icon}</div>
      </div>
    </div>
  );
}

