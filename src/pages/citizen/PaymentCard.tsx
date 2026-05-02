import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PaymentCard() {
  const { serviceRequestId } = useParams<{ serviceRequestId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const statePaymentId = (location.state as { paymentId?: string } | null)?.paymentId;

  const [paymentId, setPaymentId] = useState<string | null>(statePaymentId ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [amountDue, setAmountDue] = useState<number | null>(null);
  const [serviceLabel, setServiceLabel] = useState<string | null>(null);

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (!serviceRequestId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/citizen/service-requests/${serviceRequestId}/payment-summary`)
      .then((res) => {
        const amt = round2(res.data?.amount);
        setAmountDue(amt);
        const name =
          res.data?.serviceType?.name ??
          res.data?.serviceRequest?.serviceType?.name ??
          null;
        setServiceLabel(name);
        const lp = res.data?.latestPayment;
        if (statePaymentId) {
          setPaymentId(statePaymentId);
          setError(null);
          return;
        }
        if (lp?.status === 'pending' && lp?.paymentMethod === 'card' && lp?.id) {
          setPaymentId(lp.id);
          setError(null);
        } else {
          setError('No pending card payment found. Start from checkout.');
        }
      })
      .catch(() => setError('Could not load payment.'))
      .finally(() => setLoading(false));
  }, [serviceRequestId, statePaymentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/citizen/payments/${paymentId}/confirm-card`, {
        cardholderName: cardholderName.trim(),
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiry: expiry.trim(),
        cvv: cvv.trim(),
      });
      navigate('/my-requests', {
        replace: true,
        state: { paymentMessage: 'Payment completed successfully.' },
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCardInput = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  };

  if (loading) {
    return <div className="p-10 text-slate-500 font-medium">Preparing secure form…</div>;
  }

  if (!paymentId && error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <p className="text-slate-600">{error}</p>
        <Link
          to={serviceRequestId ? `/payment/${serviceRequestId}` : '/my-requests'}
          className="text-blue-600 font-bold text-sm"
        >
          Go to payment checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <button
        type="button"
        onClick={() => navigate(`/payment/${serviceRequestId}`)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Back to payment options
      </button>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add card</h1>
        <p className="text-slate-500 font-medium">
          Enter your card details to pay the processing fee. This demo validates your card only — nothing is sent to a
          real bank.
        </p>
        {amountDue !== null && amountDue > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount due</p>
              <p className="text-lg font-bold text-slate-900">${amountDue.toFixed(2)}</p>
              {serviceLabel && (
                <p className="text-xs text-slate-500 mt-0.5">{serviceLabel}</p>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
        <ShieldCheck size={18} />
        Use test cards such as 4242 4242 4242 4242 with any future expiry and any 3-digit CVV.
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900 ml-1">Name on card</label>
          <input
            required
            autoComplete="cc-name"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            placeholder="Full name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900 ml-1">Card number</label>
          <input
            required
            inputMode="numeric"
            autoComplete="cc-number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono tracking-wide"
            placeholder="4242 4242 4242 4242"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 ml-1">Expiry</label>
            <input
              required
              inputMode="numeric"
              autoComplete="cc-exp"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono"
              placeholder="MM/YY"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 ml-1">CVV</label>
            <input
              required
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono"
              placeholder="123"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="animate-spin" size={22} /> : 'Pay securely'}
        </button>
      </form>
    </div>
  );
}

function round2(v: unknown): number {
  const n = Number(v ?? 0);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}
