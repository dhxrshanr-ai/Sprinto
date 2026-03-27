import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Bell, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Logo from './ui/Logo';

export default function Navbar({ notifCount = 0, onOpenNotif }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b'];
  const colorIdx = (user?.name?.charCodeAt(0) || 0) % colors.length;

  return (
    <header className="h-16 bg-[#16162a]/90 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Logo */}
      <button onClick={() => navigate('/')} className="flex items-center mr-4">
        <Logo className="hidden sm:flex" />
        <Logo iconOnly={true} className="sm:hidden" />
      </button>

      {/* Dashboard link */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 text-sm transition px-3 py-1.5 rounded-lg hover:bg-white/5"
      >
        <LayoutDashboard size={16} /> <span className="hidden sm:block">Dashboard</span>
      </button>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        id="nav-notifications"
        onClick={onOpenNotif}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
      >
        <Bell size={18} />
        {notifCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {notifCount > 9 ? '9+' : notifCount}
          </span>
        )}
      </button>

      {/* User menu */}
      <div ref={dropRef} className="relative">
        <button
          id="nav-user-menu"
          onClick={() => setDropOpen(!dropOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: colors[colorIdx] }}
          >
            {initial}
          </div>
          <span className="text-sm text-slate-300 hidden sm:block">{user?.name}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-12 w-48 glass-card rounded-xl py-1.5 shadow-xl z-50 fade-in">
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              id="nav-logout"
              onClick={() => { setDropOpen(false); logout(); navigate('/login'); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
