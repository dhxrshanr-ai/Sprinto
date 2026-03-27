import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Folders, CheckSquare, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Logo from './ui/Logo';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', icon: LayoutGrid, path: '/' },
    { name: 'Boards', icon: Folders, path: '/boards' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <motion.aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand / Logo */}
        <div className="h-14 flex items-center px-4 border-b border-[var(--border-subtle)]">
          <Link to="/" className="flex items-center gap-2 group ml-1 mt-1">
            <Logo />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 px-2">Menu</div>
          
          {navLinks.map((link) => {
            const active = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  active 
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]/50'
                }`}
              >
                <link.icon size={16} className={active ? 'text-[var(--accent)]' : ''} />
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* User / Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-semibold text-white shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-main)] truncate">{user?.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-red-400 px-2 py-1.5 transition-colors"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </motion.aside>
    </>
  );
}
