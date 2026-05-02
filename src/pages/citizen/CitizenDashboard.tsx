import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { motion } from 'motion/react';
import { FileText, AlertCircle, TrendingUp, Megaphone, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CitizenDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/citizen/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bento-grid">
      {/* Welcome Card */}
      <div className="bento-card col-span-2 row-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-xl flex flex-col justify-between">
        <div className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mb-3">System Status</div>
        <div className="flex justify-between items-end">
          <div className="text-3xl font-light italic leading-tight">
             Good morning, {data?.user?.firstName || 'Citizen'}.<br/>
             <span className="font-bold not-italic">You have {data?.stats?.totalRequests || 0} active requests.</span>
          </div>
          <div className="text-right text-[10px] font-bold uppercase tracking-tight text-blue-200/50">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bento-card col-span-1">
        <div className="bento-card-header">Service Activity</div>
        <div className="text-4xl font-bold text-slate-800 mt-2">{data?.stats?.totalRequests || 0}</div>
        <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">+1 from last month</div>
      </div>

      <div className="bento-card col-span-1 text-emerald-600">
        <div className="bento-card-header">Complaints</div>
        <div className="text-4xl font-bold mt-2">{data?.stats?.totalComplaints || 0}</div>
        <div className="text-[10px] mt-1 uppercase font-bold tracking-tight text-emerald-500">All cases resolved</div>
      </div>

      {/* Recent Announcements */}
      <div className="bento-card col-span-3 row-span-2">
        <div className="bento-card-header flex justify-between items-center">
          <span>Recent Announcements</span>
          <button className="text-[10px] text-blue-600 font-bold uppercase hover:underline">View All</button>
        </div>
        <div className="space-y-4 mt-4">
          {data?.announcements?.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
               <div className={cn(
                 "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                 item.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
               )}>
                 <Megaphone size={18} />
               </div>
               <div className="flex-1 overflow-hidden">
                 <div className="flex justify-between items-center mb-1">
                   <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                   <span className="text-[10px] font-bold text-slate-400 font-mono">
                     {new Date(item.publishedAt).toLocaleDateString()}
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 truncate">{item.content}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bento-card col-span-1 row-span-2">
        <div className="bento-card-header">Quick Navigation</div>
        <div className="grid grid-cols-2 gap-2 mt-4">
           <QuickAction icon="📄" label="Permits" onClick={() => navigate('/new-request')} />
           <QuickAction icon="🏛️" label="Tax" onClick={() => navigate('/tax')} />
           <QuickAction icon="🚨" label="Report" onClick={() => navigate('/complaints')} />
           <QuickAction icon="📍" label="Our Location" onClick={() => navigate('/transit')} />
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Need Help?</p>
          <button className="bg-slate-100 text-slate-700 w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors">
             Contact Center
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: string, label: string, onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100 cursor-pointer hover:border-blue-500 hover:bg-white transition-all group"
    >
      <div className="text-lg group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">{label}</div>
    </button>
  );
}

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(' '); }
