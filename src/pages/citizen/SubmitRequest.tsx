import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function SubmitRequest() {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [formData, setFormData] = useState({ serviceTypeId: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/common/service-types').then(res => setServiceTypes(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/citizen/service-requests', formData);
      const id = res.data?.id;
      if (id) navigate(`/payment/${id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">New Service Request</h1>
        <p className="text-slate-500 font-medium">Select a service type and provide any necessary details.</p>
      </header>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-900 ml-1">Service Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceTypes.map((type: any) => (
                <div 
                  key={type.id}
                  onClick={() => setFormData({ ...formData, serviceTypeId: type.id })}
                  className={cn(
                    "p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                    formData.serviceTypeId === type.id 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      formData.serviceTypeId === type.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'
                    )}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{type.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                        ${Number(type.price ?? 0).toFixed(2)} processing fee
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    formData.serviceTypeId === type.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white'
                  )}>
                    {formData.serviceTypeId === type.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 ml-1">Additional Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all min-h-[160px]"
              placeholder="Provide any specific details or context for your request..."
            />
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
               <AlertCircle size={20} />
             </div>
             <div className="text-sm">
               <p className="font-bold text-blue-900 mb-1">Required Documents</p>
               <p className="text-blue-700 leading-relaxed">Once submitted, you may be asked to upload supporting documents based on the service selected. You can track this in your dashboard.</p>
             </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !formData.serviceTypeId}
            className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (
              <>
                Confirm & Submit Request <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(' '); }
