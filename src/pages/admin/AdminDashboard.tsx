import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { motion } from 'motion/react';
import { Users, FileText, AlertCircle, Activity, ArrowUpRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-10 text-slate-500 font-medium">Initializing system terminal...</div>;

  return (
    <div className="bento-grid">
      {/* System Overview Card */}
      <div className="bento-card col-span-2 row-span-1 bg-slate-900 text-white border-none shadow-xl flex flex-col justify-between">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">System Metrics</div>
        <div className="flex justify-between items-end">
          <div className="text-3xl font-light italic leading-tight">
             Municipality Ops Terminal.<br/>
             <span className="font-bold not-italic text-blue-400">Total registered users: {data?.stats?.totalUsers || 0}</span>
          </div>
          <div className="text-right text-[10px] font-mono text-slate-500">
             v1.0.4 // STABLE
          </div>
        </div>
      </div>

      <div className="bento-card col-span-1 border-orange-200 bg-orange-50/30">
        <div className="bento-card-header text-orange-600">Pending Requests</div>
        <div className="text-4xl font-bold text-orange-700 mt-2">{data?.stats?.pendingRequests || 0}</div>
        <div className="text-[10px] text-orange-500 mt-1 uppercase font-bold tracking-tight">Review Required</div>
      </div>

      <div className="bento-card col-span-1 border-red-100 bg-red-50/30">
        <div className="bento-card-header text-red-600">Open Complaints</div>
        <div className="text-4xl font-bold text-red-700 mt-2">{data?.stats?.openComplaints || 0}</div>
        <div className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-tight">Priority Check</div>
      </div>

      {/* Activity Logs */}
      <div className="bento-card col-span-3 row-span-2">
        <div className="bento-card-header flex justify-between items-center">
          <span>Recent System Activity</span>
          <button className="text-[10px] text-slate-400 font-bold uppercase hover:text-slate-900 transition-colors">Details</button>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {data?.recentActivity?.map((log: any) => (
            <div key={log.id} className="py-3 flex items-center justify-between group hover:bg-slate-50 rounded-lg px-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-mono font-bold text-slate-400 uppercase">
                  {log.action.slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  </p>
                  <p className="text-[10px] text-slate-500">{log.details}</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-medium text-slate-400">
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Tools */}
      <div className="bento-card col-span-1 row-span-2">
        <div className="bento-card-header text-blue-600">Admin Shortcuts</div>
        <div className="space-y-2 mt-4">
           <AdminTool label="Approve Pending" icon="✅" onClick={() => navigate('/admin/requests?status=submitted')} />
           <AdminTool label="Publish News" icon="📢" onClick={() => navigate('/admin/announcements')} />
           <AdminTool label="Manage Types" icon="⚙️" onClick={() => navigate('/admin/types')} />
           <AdminTool label="User Report" icon="📊" onClick={() => navigate('/admin/reports/users')} />
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Performance</p>
           <div className="flex items-end gap-1 h-8">
              <div className="w-full bg-slate-100 h-full rounded-sm overflow-hidden relative">
                 <div className="absolute inset-0 bg-blue-500 w-[70%]"></div>
              </div>
              <div className="w-full bg-slate-100 h-full rounded-sm overflow-hidden relative">
                 <div className="absolute inset-0 bg-blue-500 w-[45%]"></div>
              </div>
              <div className="w-full bg-slate-100 h-full rounded-sm overflow-hidden relative">
                 <div className="absolute inset-0 bg-blue-500 w-[90%]"></div>
              </div>
           </div>
           <p className="text-[9px] text-slate-400 mt-2 font-mono">NODE_CLUSTER_HEALTH: OPTIMAL</p>
        </div>
      </div>
    </div>
  );
}

function AdminTool({ label, icon, onClick }: { label: string, icon: string, onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-white transition-all group"
    >
      <span className="text-sm group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </button>
  );
}

function AdminStatCard({ icon, label, value, sub, urgent }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</h4>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
      <p className={cn("text-[10px] font-bold uppercase tracking-wider ml-1", urgent ? 'text-red-500' : 'text-slate-400')}>{sub}</p>
      {urgent && <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500"></div>}
    </div>
  );
}

function QueueItem({ label, color }: any) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className={cn("w-2 h-2 rounded-full", color)}></div>
      <span className="text-sm font-bold text-slate-900 flex-1">{label}</span>
      <ArrowUpRight size={14} className="text-slate-300" />
    </div>
  );
}

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(' '); }
