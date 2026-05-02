import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { CreditCard, Building2, Banknote, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

type PaymentMethod = 'card' | 'bank_transfer' | 'cash_at_counter';

type Summary = {
  amount: number;
  requiresPayment: boolean;
  serviceType?: { id?: number; name?: string; price?: number } | null;
  serviceRequest: { id: string; status: string };
  latestPayment: {
    id: string;
    status: string;
    paymentMethod: string | null;
    amount: string | number;
  } | null;
};

export default function PaymentCheckout() {
  const { serviceRequestId } = useParams<{ serviceRequestId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [submitting, setSubmitting] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);

  useEffect(() => {
    if (!serviceRequestId) return;
    setLoading(true);
    api
      .get(`/citizen/service-requests/${serviceRequestId}/payment-summary`)
      .then((res) => {
        setSummary(res.data);
        setError(null);
        const m = res.data?.latestPayment?.paymentMethod;
        if (m === 'bank_transfer' || m === 'cash_at_counter' || m === 'card') {
          setMethod(m);
        }
      })
      .catch(() => setError('Could not load payment details.'))
      .finally(() => setLoading(false));
  }, [serviceRequestId]);

  const nestedSt = summary?.serviceRequest as { serviceType?: { name?: string } } | undefined;
  const serviceName =
    summary?.serviceType?.name ?? nestedSt?.serviceType?.name ?? 'Service request';

  if (offlineSaved) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-10">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10 space-y-6 text-center">
          <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Preference saved</h2>
          {method === 'bank_transfer' ? (
            <div className="text-left text-sm text-slate-600 space-y-3 bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="font-bold text-slate-900">Bank transfer</p>
              <p>Use reference <span className="font-mono font-bold">{serviceRequestId?.slice(0, 8)}</span> so we can match your payment.</p>
              <p>Transfer the amount due to the municipality account shown on your invoice or at the front desk. Funds must clear before processing continues.</p>
            </div>
          ) : (
            <div className="text-left text-sm text-slate-600 space-y-3 bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="font-bold text-slate-900">Pay at counter</p>
              <p>
                Visit the municipal service center during business hours with your request reference and pay{' '}
                <span className="font-bold text-slate-900">${round2(summary?.amount).toFixed(2)}</span> at the desk.
              </p>
            </div>
          )}
          <Link
            to="/my-requests"
            className="inline-flex items-center justify-center w-full sm:w-auto bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800"
          >
            Back to my requests
          </Link>
        </div>
      </div>
    );
  }

  const onContinue = async () => {
    if (!serviceRequestId || !summary?.requiresPayment) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/citizen/service-requests/${serviceRequestId}/payments`, {
        paymentMethod: method,
      });
      const payment = res.data?.payment;
      if (method === 'card' && payment?.id) {
        navigate(`/payment/${serviceRequestId}/card`, { state: { paymentId: payment.id } });
      } else {
        setOfflineSaved(true);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not start payment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-slate-500 font-medium">Loading checkout…</div>;
  }

  if (error && !summary) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <p className="text-slate-600 mb-4">{error}</p>
        <Link to="/my-requests" className="text-blue-600 font-bold text-sm">
          Back to my requests
        </Link>
      </div>
    );
  }

  if (!summary) return null;

  if (!summary.requiresPayment) {
    return (
      <div className="max-w-xl mx-auto space-y-8 text-center py-16">
        <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">No fee for this request</h1>
        <p className="text-slate-500">There is no document processing charge for the selected service.</p>
        <Link
          to="/my-requests"
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800"
        >
          View my requests
        </Link>
      </div>
    );
  }

  if (summary.latestPayment?.status === 'completed') {
    return (
      <div className="max-w-xl mx-auto space-y-8 text-center py-16">
        <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Already paid</h1>
        <p className="text-slate-500">
          Reference: {summary.latestPayment.id.slice(0, 8)}… — you are all set.
        </p>
        <Link
          to="/my-requests"
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800"
        >
          Back to my requests
        </Link>
      </div>
    );
  }

  const amount = round2(summary.amount);
  const options: { id: PaymentMethod; label: string; hint: string; icon: React.ReactNode }[] = [
    {
      id: 'card',
      label: 'Credit or debit card',
      hint: 'Pay online — you will add your card on the next step',
      icon: <CreditCard size={22} />,
    },
    {
      id: 'bank_transfer',
      label: 'Bank transfer',
      hint: 'We will show transfer instructions after you continue',
      icon: <Building2 size={22} />,
    },
    {
      id: 'cash_at_counter',
      label: 'Pay at municipality counter',
      hint: 'Bring your request reference to the service desk',
      icon: <Banknote size={22} />,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Pay processing fee</h1>
        <p className="text-slate-500 font-medium">
          Document and application fees for <span className="text-slate-800">{serviceName}</span>
        </p>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10 space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Amount due</span>
          <span className="text-3xl font-bold text-slate-900">
            ${amount.toFixed(2)}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-900 ml-1">Payment method</p>
          <div className="space-y-3">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setMethod(o.id)}
                className={cn(
                  'w-full text-left p-5 rounded-2xl border-2 flex items-start gap-4 transition-all',
                  method === o.id
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200',
                )}
              >
                <div
                  className={cn(
                    'p-2.5 rounded-xl',
                    method === o.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400',
                  )}
                >
                  {o.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{o.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{o.hint}</p>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                    method === o.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white',
                  )}
                >
                  {method === o.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {method === 'card' && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-900">
            <span className="font-bold">Next step:</span> you will securely enter your card details on the following
            screen. Card numbers are validated here for this demo and are not stored.
          </div>
        )}

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="button"
          disabled={submitting}
          onClick={onContinue}
          className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <>
              {method === 'card' ? 'Continue to add card' : 'Continue'}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function cn(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

function round2(v: unknown): number {
  const n = Number(v ?? 0);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}
