import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Loader2, User, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateStoredUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/citizen/profile');
        const u = res.data?.user || res.data;
        setForm({
          firstName: u?.firstName || '',
          lastName: u?.lastName || '',
          phone: u?.phone || '',
        });
      } catch (e: any) {
        // fallback to local storage user
        setForm({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          phone: user?.phone || '',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.patch('/citizen/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      const next = res.data?.user || res.data;
      // keep roles/id/email from the stored object if backend doesn't include them
      updateStoredUser({ ...(user || {}), ...(next || {}) });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-500 font-medium tracking-tight">Edit your name and phone number.</p>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 text-slate-500">
            <User size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Account</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm font-semibold">
              Profile updated.
            </div>
          )}

          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="First name">
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Last name">
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Phone number" full>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                placeholder="+961 ..."
              />
            </Field>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all inline-flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'md:col-span-2 space-y-2' : 'space-y-2'}>
      <label className="text-sm font-bold text-slate-900 ml-1">{label}</label>
      {children}
    </div>
  );
}

