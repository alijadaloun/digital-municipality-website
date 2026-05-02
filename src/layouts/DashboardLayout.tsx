import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Landmark, LayoutDashboard, FileText, AlertCircle, 
  Bell, User, LogOut, Megaphone, BarChart3, Settings, Bot, Menu, X, Wrench
} from 'lucide-react';
import logo from '../assets/app-logo.png';
import api from '../api/axios';
import { AnimatePresence, motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

type Crumb = { label: string; href?: string };

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
};

export default function DashboardLayout({ children, isAdmin }: { children: React.ReactNode, isAdmin?: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const citizenNav: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'My Requests', href: '/my-requests', icon: <FileText size={20} /> },
    { label: 'Tax', href: '/tax', icon: <Landmark size={20} /> },
    { label: 'Complaints', href: '/complaints', icon: <AlertCircle size={20} /> },
    { label: 'Announcements', href: '/announcements', icon: <Megaphone size={20} /> },
    { label: 'Polls', href: '/polls', icon: <BarChart3 size={20} /> },
    { label: 'Visit Us', href: '/transit', icon: <Landmark size={20} /> },
    { label: 'Ask BOT', href: '/bot', icon: <Bot size={20} /> },
  ];

  const adminNav: NavItem[] = [
    { label: 'Admin Panel', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Service Requests', href: '/admin/requests', icon: <FileText size={20} /> },
    { label: 'Service types', href: '/admin/types', icon: <Wrench size={20} /> },
    { label: 'Complaints', href: '/admin/complaints', icon: <AlertCircle size={20} /> },
    { label: 'User Management', href: '/admin/users', icon: <User size={20} /> },
    { label: 'System Logs', href: '/admin/logs', icon: <Settings size={20} /> },
  ];

  const navItems = isAdmin ? adminNav : citizenNav;

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const headerTitle = useMemo(() => {
    if (isAdmin && location.pathname === '/admin/types') return 'Service types';
    if (isAdmin) return 'Administration';
    if (location.pathname === '/new-request') return 'New Service Request';
    if (location.pathname.startsWith('/payment/') && location.pathname.endsWith('/card')) return 'Add card';
    if (location.pathname.startsWith('/payment/')) return 'Payment';
    if (location.pathname === '/my-requests') return 'My Requests';
    if (location.pathname === '/complaints') return 'Complaints';
    if (location.pathname === '/announcements') return 'Announcements';
    if (location.pathname === '/polls') return 'Polls';
    if (location.pathname === '/bot') return 'Municipality BOT';
    return 'Citizen Dashboard';
  }, [isAdmin, location.pathname]);

  const breadcrumbs = useMemo<Crumb[]>(() => {
    const isAdminPath = location.pathname.startsWith('/admin');

    // Build a "known labels" map from nav items.
    const labelByHref = new Map<string, string>();
    for (const item of citizenNav) labelByHref.set(item.href, item.label);
    for (const item of adminNav) labelByHref.set(item.href, item.label);

    if (isAdminPath) {
      const base: Crumb[] = [{ label: 'Admin', href: '/admin' }];
      if (location.pathname === '/admin') return base;

      const adminLabel =
        labelByHref.get(location.pathname) ||
        (location.pathname.startsWith('/admin/reports') ? 'Reports' : undefined) ||
        'Page';

      return [...base, { label: adminLabel, href: location.pathname }];
    }

    const base: Crumb[] = [{ label: 'Dashboard', href: '/dashboard' }];
    if (location.pathname === '/dashboard') return base;

    if (location.pathname.startsWith('/payment/')) {
      const parts = location.pathname.split('/').filter(Boolean);
      const reqId = parts[1];
      const crumbs: Crumb[] = [...base, { label: 'Payment', href: reqId ? `/payment/${reqId}` : undefined }];
      if (location.pathname.endsWith('/card') && reqId) {
        return [...crumbs, { label: 'Add card', href: location.pathname }];
      }
      return crumbs;
    }

    const pageLabel = labelByHref.get(location.pathname) || headerTitle;
    return [...base, { label: pageLabel, href: location.pathname }];
  }, [adminNav, citizenNav, headerTitle, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // close mobile drawer on route change
    setSidebarOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const fetchNotifications = async () => {
    if (isAdmin) return;
    setLoadingNotifications(true);
    try {
      const res = await api.get('/citizen/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (isAdmin) return;
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = dropdownRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setNotificationsOpen(false);
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [notificationsOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col sticky top-0 h-screen text-slate-400">
        <div className="p-6 flex items-center gap-3">
          <img src={logo} alt="Municipality logo" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight text-white">MUNI-PORTAL</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <div className="opacity-70">{item.icon}</div>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2">Account</div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors w-full text-left"
          >
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
               {user?.firstName[0]}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
               <p className="text-[10px] font-medium text-slate-500 truncate">{user?.roles[0]}</p>
             </div>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 mt-4 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col text-slate-400">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Municipality logo" className="w-8 h-8" />
                <span className="font-bold text-lg tracking-tight text-white">MUNI-PORTAL</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold transition-all",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "hover:bg-slate-800 hover:text-slate-100"
                  )}
                >
                  <div className="opacity-70">{item.icon}</div>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] font-medium text-slate-500 truncate">{user?.roles?.[0]}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 mt-4 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium min-w-0">
             <button
               type="button"
               onClick={() => setSidebarOpen(true)}
               className="md:hidden p-2 rounded-lg hover:bg-slate-50 text-slate-500"
               aria-label="Open menu"
             >
               <Menu size={18} />
             </button>
             <nav className="flex items-center gap-2 min-w-0" aria-label="Breadcrumb">
               {breadcrumbs.map((c, idx) => (
                 <div key={`${c.label}-${idx}`} className="flex items-center gap-2 min-w-0">
                   {idx > 0 && <span className="text-slate-300">/</span>}
                   {c.href && idx < breadcrumbs.length - 1 ? (
                     <Link
                       to={c.href}
                       className="text-slate-500 hover:text-slate-900 transition-colors font-semibold truncate max-w-[140px] sm:max-w-[220px]"
                     >
                       {c.label}
                     </Link>
                   ) : (
                     <span className="text-slate-900 font-bold uppercase tracking-tight truncate max-w-[160px] sm:max-w-[280px]">
                       {c.label}
                     </span>
                   )}
                 </div>
               ))}
             </nav>
          </div>
          
          <div className="flex items-center gap-6">
            {!isAdmin && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={async () => {
                    const next = !notificationsOpen;
                    setNotificationsOpen(next);
                    if (next) await fetchNotifications();
                  }}
                  className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg relative"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-[360px] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-20">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Notifications</span>
                      <button
                        onClick={fetchNotifications}
                        className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline"
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="max-h-[360px] overflow-auto">
                      {loadingNotifications ? (
                        <div className="p-6 text-sm text-slate-500">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-10 text-center text-sm text-slate-500">No notifications.</div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {notifications.slice(0, 20).map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                'px-4 py-3 hover:bg-slate-50 transition-colors',
                                !n.isRead && 'bg-blue-50/30'
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className={cn('text-sm font-bold truncate', !n.isRead ? 'text-slate-900' : 'text-slate-700')}>
                                    {n.title}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                </div>
                                {!n.isRead && <span className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                              </div>
                              {n.createdAt && (
                                <p className="text-[10px] text-slate-400 font-mono mt-2">
                                  {new Date(n.createdAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:underline"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!isAdmin && (
              <button
                onClick={() => navigate('/new-request')}
                className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors"
              >
                New Service Request
              </button>
            )}
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
