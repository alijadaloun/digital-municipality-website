import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function AuthHomeButton() {
  return (
    <Link
      to="/"
      className="fixed top-5 left-5 z-50 inline-flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-md ring-1 ring-slate-200/90 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-lg hover:ring-slate-300"
      aria-label="Back to home"
    >
      <Home size={20} strokeWidth={2} aria-hidden />
      <span className="hidden sm:inline">Home</span>
    </Link>
  );
}
