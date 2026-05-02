import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Trash2, UserPlus } from 'lucide-react';

type UserItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  roles?: { name: string }[];
  createdAt?: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'CITIZEN',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
    );
  }, [users, query]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/users', {
        ...form,
        phone: form.phone || null,
      });
      setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'CITIZEN' });
      await load();
    } finally {
      setCreating(false);
    }
  };

  const del = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium">Loading users...</div>;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">User Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">View, create, and delete users.</p>
        </div>
        <button
          onClick={load}
          className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800"
        >
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
            />
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{filtered.length} users</span>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map((u) => (
              <div key={u.id} className="px-8 py-6 flex items-center justify-between gap-6">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {u.firstName} {u.lastName}
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {u.roles?.map((r) => r.name).join(', ') || '—'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{u.email}</p>
                  {u.phone && <p className="text-xs text-slate-500 mt-1">{u.phone}</p>}
                </div>

                <button
                  onClick={() => del(u.id)}
                  disabled={deletingId === u.id}
                  className="shrink-0 bg-white border border-slate-200 text-red-600 text-xs px-3 py-2 rounded-lg font-bold hover:bg-red-50 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {deletingId === u.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-6">
            <UserPlus size={18} className="text-blue-600" />
            Add user
          </div>

          <form onSubmit={create} className="space-y-4">
            <Field label="First name">
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Last name">
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Phone (optional)">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </Field>
            <Field label="Temporary password">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
                required
              />
            </Field>
            <Field label="Role">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              >
                <option value="CITIZEN">Citizen</option>
                <option value="ADMIN">Admin</option>
              </select>
            </Field>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {creating ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              Create user
            </button>
          </form>
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

