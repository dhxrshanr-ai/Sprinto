import { NavLink } from 'react-router-dom';
import { LayoutGrid, Folders, CheckSquare, Settings, History } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutGrid, path: '/' },
  { name: 'Boards', icon: Folders, path: '/boards' },
  { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'History', icon: History, path: '/archive' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] backdrop-blur-xl border-t border-[var(--border-subtle)] px-2 py-2 flex justify-around items-center z-50 h-[68px] pb-safe">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-300 relative ${
              isActive 
                ? 'text-[var(--accent)] scale-110' 
                : 'text-[var(--text-muted)] active:scale-95'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_var(--accent)]' : ''} />
              <span className="text-[10px] font-bold tracking-tight uppercase">{item.name}</span>
              {isActive && (
                <div className="absolute -top-1 w-6 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
