import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { FileText, Search, Filter, Clock, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

type ServiceRequestRow = {
  id: string;
  status: string;
  createdAt: string;
  serviceType?: { name: string; price?: string | number };
  service_type?: { name: string; price?: string | number };
  payments?: { id: string; status: string; paymentMethod: string | null; amount: string | number }[];
};

export default function MyRequests() {
  const [requests, setRequests] = useState<ServiceRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const paymentFlash = (location.state as { paymentMessage?: string } | null)?.paymentMessage;

  useEffect(() => {
    api.get('/citizen/service-requests/my').then(res => {
      setRequests(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-slate-500 font-medium">Fetching records...</div>;

  return (
    <div className="space-y-10">
      {paymentFlash && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">
          {paymentFlash}
        </div>
      )}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">My Service Requests</h1>
          <p className="text-slate-500 font-medium tracking-tight">History of all your municipal applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search by ID..." 
              className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900 w-64"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-2">Service Type</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Date Submitted</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Fee</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</span>
        </div>

        <div className="divide-y divide-slate-50">
          {requests.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
                <FileText size={32} />
              </div>
              <p className="text-slate-500 font-medium">You haven't submitted any requests yet.</p>
            </div>
          ) : (
            requests.map((req) => {
              const svc = req.serviceType || req.service_type;
              const price = Number(svc?.price ?? 0);
              const pay = req.payments?.[0];
              const needsPay = price > 0 && pay?.status !== 'completed';
              const payLabel =
                price <= 0
                  ? '—'
                  : pay?.status === 'completed'
                    ? 'Paid'
                    : pay?.status === 'pending'
                      ? 'Pending'
                      : 'Due';

              return (
              <motion.div 
                key={req.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-6 px-8 py-6 items-center hover:bg-slate-50/50 transition-colors group"
              >
                <div className="col-span-2 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{svc?.name ?? '—'}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{req.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
                    <Clock size={12} className="text-slate-400" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-center">
                   <StatusBadge status={req.status} />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{payLabel}</span>
                  {price > 0 && (
                    <p className="text-xs font-mono text-slate-600">${price.toFixed(2)}</p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                   {needsPay && (
                     <Link
                       to={`/payment/${req.id}`}
                       className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg"
                     >
                       <CreditCard size={14} />
                       Pay fee
                     </Link>
                   )}
                   <span className="text-xs font-bold text-slate-400">Details</span>
                </div>
              </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    submitted: 'bg-blue-50 text-blue-600 border-blue-100',
    under_review: 'bg-orange-50 text-orange-600 border-orange-100',
    approved: 'bg-green-50 text-green-600 border-green-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
    completed: 'bg-teal-50 text-teal-600 border-teal-100',
  };
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
      styles[status] || styles.submitted
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(' '); }
