import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Trash2, Wrench } from 'lucide-react';

type ServiceTypeItem = {
  id: number;
  name: string;
  description?: string | null;
  price: string | number;
  requiresDocuments: boolean;
};

export default function AdminServiceTypes() {
  const [items, setItems] = useState<ServiceTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [requiresDocuments, setRequiresDocuments] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/service-types');
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

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/service-types', {
        name,
        description: description || null,
        price,
        requiresDocuments,
      });
      setName('');
      setDescription('');
      setPrice(0);
      setRequiresDocuments(true);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: number, patch: Partial<ServiceTypeItem>) => {
    await api.patch(`/admin/service-types/${id}`, patch);
    await load();
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this service type?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/service-types/${id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading service types...</div>;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Service types</h1>
          <p className="text-slate-500 font-medium tracking-tight">
            View all available service request types, set the processing fee citizens pay, and add new types.
          </p>
        </div>
        <button
          onClick={load}
          className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800"
        >
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-6">
            <Wrench size={18} className="text-blue-600" />
            New service type
          </div>
          <form onSubmit={create} className="space-y-4">
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Processing fee (USD)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Description (optional)">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900 min-h-[140px]"
              />
            </Field>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <span className="text-sm font-bold text-slate-700">Requires documents</span>
              <input
                type="checkbox"
                checked={requiresDocuments}
                onChange={(e) => setRequiresDocuments(e.target.checked)}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : 'Create type'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-8 py-5 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-6">Type</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center col-span-2">Fee</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center col-span-2">Docs</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right col-span-2">Actions</span>
          </div>

          {items.length === 0 ? (
            <div className="p-16 text-center text-slate-500">No service types.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {items.map((t) => (
                <div key={t.id} className="grid grid-cols-12 px-8 py-6 items-start gap-4">
                  <div className="col-span-6 min-w-0">
                    <input
                      key={`nm-${t.id}-${t.name}`}
                      defaultValue={t.name}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== t.name) void update(t.id, { name: v });
                      }}
                      className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-slate-300 outline-none"
                    />
                    {t.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{t.description}</p>}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <input
                      key={`pr-${t.id}-${t.price}`}
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={Number(t.price)}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v) && v >= 0 && v !== Number(t.price)) {
                          void update(t.id, { price: v });
                        }
                      }}
                      className="w-28 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-center"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => update(t.id, { requiresDocuments: !t.requiresDocuments })}
                      className={t.requiresDocuments
                        ? 'px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700'
                        : 'px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600'}
                    >
                      {t.requiresDocuments ? 'Yes' : 'No'}
                    </button>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => remove(t.id)}
                      disabled={deletingId === t.id}
                      className="bg-white border border-slate-200 text-red-600 text-xs px-3 py-2 rounded-lg font-bold hover:bg-red-50 disabled:opacity-60 inline-flex items-center gap-2"
                    >
                      {deletingId === t.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      Delete
                    </button>
                  </div>
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

