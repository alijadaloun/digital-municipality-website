import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/app-logo.png';
import { ArrowRight, UserCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function LandingPage() {
  const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string; description?: string; price: string | number }[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const byblos = useMemo(
    () => ({
      center: { lat: 34.123, lng: 35.651 },
      bbox: { left: 35.60, bottom: 34.07, right: 35.70, top: 34.17 },
    }),
    []
  );

  const mapSrc = useMemo(() => {
    const { left, bottom, right, top } = byblos.bbox;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${byblos.center.lat}%2C${byblos.center.lng}`;
  }, [byblos]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/common/service-types');
        setServiceTypes(Array.isArray(res.data) ? res.data : []);
      } catch {
        setServiceTypes([]);
      } finally {
        setLoadingServices(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 sm:py-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Municipality logo" className="w-10 h-10" />
          <span className="font-bold text-lg sm:text-xl tracking-tight">Municipality Website</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/login" className="text-sm font-medium hover:text-blue-600 transition-colors">Login</Link>
          <Link to="/register" className="bg-slate-900 text-white px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all flex items-center gap-2">
            <span className="hidden sm:inline">Register Account</span>
            <span className="sm:hidden">Register</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-24 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] sm:leading-[0.9] tracking-tighter mb-6 sm:mb-8 italic serif">
              The Digital Heart of Your <span className="text-blue-600">Municipality</span>.
            </h1>
            <p className="text-base sm:text-xl text-slate-500 mb-8 sm:mb-10 max-w-lg leading-relaxed">
              Streamline your civic life. Submit requests, track documents, and participate in community decisions—all from one secure digital platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/register" className="bg-blue-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-center">
                Get Started Today
              </Link>
              <Link to="/login" className="px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-center">
                Login
              </Link>
            </div>
            <div className="mt-8 space-y-2 text-sm text-slate-500">
              <p>
                <span className="font-bold text-slate-900">Register</span> to submit requests and file complaints.
              </p>
              <p>
                <span className="font-bold text-slate-900">Login</span> to track request progress, vote in polls, view announcements, and more.
              </p>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="relative"
          >
            <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden relative border border-slate-200 shadow-2xl">
               <img 
                 src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000" 
                 alt="Civic center" 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent"></div>
            </div>
            {/* Floating Info Cards */}
            <div className="hidden sm:block absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[240px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><UserCheck size={20} /></div>
                <span className="font-bold">Fast Approval</span>
              </div>
              <p className="text-xs text-slate-500">Service requests are processed 80% faster through our digital pipeline.</p>
            </div>
          </motion.div>
        </div>

        {/* Services Showcase */}
        <section className="mt-16 sm:mt-28">
          <div className="flex flex-col items-center mb-12 text-center">
            <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Services</span>
            <h2 className="text-4xl font-bold tracking-tighter">Available Municipal Services</h2>
            <p className="text-slate-500 mt-4 max-w-2xl">
              Browse services offered by the municipality. Create an account to submit requests online.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-7">Service</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center col-span-2">Fee</span>
            </div>

            {loadingServices ? (
              <div className="p-12 text-center text-slate-500 font-medium">Loading services...</div>
            ) : serviceTypes.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">No services available yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {serviceTypes.map((s) => (
                  <div key={s.id} className="px-4 sm:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                      <div className="md:col-span-7 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                      {s.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>}
                      </div>
                      <div className="md:col-span-2 md:text-center">
                        <span className="text-xs font-bold text-slate-700">${Number(s.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="md:col-span-3 md:flex md:justify-end">
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Visit Us */}
        <section className="mt-16 sm:mt-24">
          <div className="flex flex-col items-center mb-12 text-center">
            <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Visit Us</span>
            <h2 className="text-4xl font-bold tracking-tighter">Find the Municipality</h2>
            <p className="text-slate-500 mt-4 max-w-2xl">
              Visit us in Byblos/Jbeil or contact our office for support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <MapPin size={18} className="text-blue-600" />
                  Map
                </div>
                <a
                  className="text-xs font-bold text-blue-600 hover:underline"
                  href={`https://www.openstreetmap.org/#map=16/${byblos.center.lat}/${byblos.center.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open directions
                </a>
              </div>
              <iframe title="Byblos map" src={mapSrc} className="w-full h-[320px] sm:h-[420px]" />
            </div>

            <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">Contact (Mock)</div>
              <div className="p-6 space-y-5">
                <InfoRow icon={<MapPin size={18} className="text-blue-600" />} label="Address" value="Byblos Municipality, Jbeil Main Street, Lebanon" />
                <InfoRow icon={<Phone size={18} className="text-blue-600" />} label="Phone" value="+961 9 123 456" />
                <InfoRow icon={<Mail size={18} className="text-blue-600" />} label="Email" value="support@byblos-municipality.gov" />
                <InfoRow icon={<Clock size={18} className="text-blue-600" />} label="Working hours" value="Mon–Fri, 8:00 AM – 3:00 PM" />

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">
                    Create an account to submit requests online, or login to track progress, vote in polls, and view announcements.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Link to="/register" className="bg-blue-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700">
                      Register
                    </Link>
                    <Link to="/login" className="bg-white border border-slate-200 text-slate-700 text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50">
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-16 sm:mt-24">
          <div className="flex flex-col items-center mb-20 text-center">
            <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Core Ecosystem</span>
            <h2 className="text-5xl font-bold tracking-tighter">Simplified Municipal Services</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4 p-4">
            <div className="bento-card col-span-2 row-span-2 p-12 bg-slate-900 text-white border-none flex flex-col justify-between">
               <div>
                  <h3 className="text-3xl font-bold mb-4 italic serif">Official Requests</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">Apply for certificates, permits, and licenses directly from your secure unified dashboard.</p>
               </div>
               <div className="flex gap-2">
                  <div className="bg-slate-800 p-4 rounded-2xl text-2xl">📄</div>
                  <div className="bg-slate-800 p-4 rounded-2xl text-2xl">🏛️</div>
                  <div className="bg-slate-800 p-4 rounded-2xl text-2xl">📜</div>
               </div>
            </div>

            <div className="bento-card col-span-2 row-span-1 bg-blue-600 text-white border-none flex items-center gap-8">
               <div className="p-6 bg-blue-500 rounded-3xl text-4xl shadow-lg">🚨</div>
               <div>
                  <h3 className="text-xl font-bold mb-1">Civic Complaints</h3>
                  <p className="text-blue-100 text-sm">Report local issues and monitor resolutions in real-time.</p>
               </div>
            </div>

            <div className="bento-card col-span-1 row-span-1 border-slate-200">
               <div className="text-2xl mb-4">📊</div>
               <h3 className="text-sm font-bold mb-1">Live Polls</h3>
               <p className="text-[11px] text-slate-500">Participate in community decisions.</p>
            </div>

            <div className="bento-card col-span-1 row-span-1 bg-white border-slate-200">
               <div className="text-2xl mb-4">🔐</div>
               <h3 className="text-sm font-bold mb-1">Secure Data</h3>
               <p className="text-[11px] text-slate-500">Military-grade vault for documents.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Digital Municipality System. All rights reserved.
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Built for COE416 — Software Engineering
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-10 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all transform hover:-translate-y-1">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 p-2 rounded-xl bg-slate-50 border border-slate-100">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
