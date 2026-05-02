import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { AlertCircle, Camera, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

type ComplaintItem = {
  id: string;
  subject: string;
  description?: string;
  category?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminResponse?: string | null;
  locationText?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  attachments?: { id: number; fileUrl: string }[];
};

export default function Complaints() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [locationText, setLocationText] = useState('');
  const [useGps, setUseGps] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [items, setItems] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);

  const canSubmit = useMemo(() => subject.trim().length >= 3 && description.trim().length >= 10, [subject, description]);

  const loadMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/citizen/complaints/my');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyComplaints();
  }, []);

  useEffect(() => {
    if (!useGps) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [useGps]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitted(false);
    try {
      const fd = new FormData();
      fd.append('subject', subject.trim());
      fd.append('description', description.trim());
      fd.append('category', category);
      if (locationText.trim()) fd.append('locationText', locationText.trim());
      if (coords) {
        fd.append('latitude', String(coords.lat));
        fd.append('longitude', String(coords.lng));
      }
      if (image) fd.append('image', image);

      await api.post('/citizen/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      setSubject('');
      setDescription('');
      setLocationText('');
      setUseGps(false);
      setCoords(null);
      setImage(null);
      setSubmitted(true);
      await loadMyComplaints();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Complaints</h1>
          <p className="text-slate-500 font-medium tracking-tight">
            Submit complaints with category, image, and optional location. Track status updates here.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="text-slate-900 font-bold mb-6">Submit a complaint</div>

          {submitted && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-800 flex items-center gap-3">
              <CheckCircle2 size={18} />
              <p className="text-sm font-semibold">Complaint submitted successfully.</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                >
                  <option>General</option>
                  <option>Roads</option>
                  <option>Garbage</option>
                  <option>Water</option>
                  <option>Electricity</option>
                  <option>Noise</option>
                  <option>Safety</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="Subject">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                  placeholder="Short title"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900 min-h-[140px]"
                placeholder="Explain what happened, where, and when..."
              />
              <p className="text-[10px] text-slate-400 font-mono">
                {description.trim().length}/10 minimum characters
              </p>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Location (optional)">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                    placeholder="Street / landmark"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setUseGps((v) => !v)}
                    className={useGps
                      ? 'text-xs font-bold text-blue-600'
                      : 'text-xs font-bold text-slate-500 hover:text-slate-900'}
                  >
                    {useGps ? 'Using GPS (click to disable)' : 'Attach GPS location'}
                  </button>
                  {useGps && coords && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </span>
                  )}
                </div>
              </Field>

              <Field label="Image (optional)">
                <label className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-white">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Camera size={18} className="text-slate-400" />
                    {image ? image.name : 'Upload image'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  />
                </label>
              </Field>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <AlertCircle size={18} />}
              Submit Complaint
            </button>
          </form>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">My complaints</p>
            <p className="text-sm font-bold text-slate-900 mt-1">Status & history</p>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-slate-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No complaints yet.</div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[620px] overflow-auto">
              {items.map((c) => (
                <div key={c.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{c.subject}</p>
                      <p className="text-xs text-slate-500 mt-1 truncate">{c.category || 'General'}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  {c.description && <p className="text-xs text-slate-600 mt-3 line-clamp-3">{c.description}</p>}
                  {c.adminResponse && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin response</p>
                      <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">{c.adminResponse}</p>
                    </div>
                  )}
                  {c.attachments?.[0]?.fileUrl && (
                    <a
                      className="mt-4 inline-block text-xs font-bold text-blue-600 hover:underline"
                      href={c.attachments[0].fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View attachment
                    </a>
                  )}
                  {c.createdAt && (
                    <p className="text-[10px] font-mono text-slate-400 mt-3">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-900 ml-1">{label}</label>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: ComplaintItem['status'] }) {
  const styles: Record<string, string> = {
    open: 'bg-blue-50 text-blue-600 border-blue-100',
    in_progress: 'bg-orange-50 text-orange-600 border-orange-100',
    resolved: 'bg-green-50 text-green-600 border-green-100',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0',
      styles[status] || styles.open
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(' '); }

