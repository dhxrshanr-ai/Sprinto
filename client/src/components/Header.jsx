import { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ onMenuClick }) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-14 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between z-30 flex-shrink-0">
      <div className="flex items-center gap-3 w-full max-w-lg">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-md hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* Global Search */}
        <div className={`relative flex-1 group transition-all duration-500 ease-out h-9 ${searchFocused ? 'max-w-[400px]' : 'max-w-[200px]'}`}>
          <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${searchFocused ? 'bg-[var(--bg-elevated)] ring-2 ring-[var(--accent)]/20 shadow-lg' : 'bg-[var(--bg-elevated)]'}`} />
          
          <Search 
            size={14} 
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors z-10 ${searchFocused ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} 
          />
          
          <input
            type="text"
            placeholder="Search tasks, projects..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="relative w-full h-full bg-transparent text-[var(--text-main)] pl-10 pr-12 rounded-xl text-[13px] font-medium transition-all outline-none placeholder:text-[var(--text-muted)]/60 z-10"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 opacity-40 group-focus-within:opacity-100 transition-opacity">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 font-sans text-9px font-bold text-[var(--text-muted)]">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <button className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-elevated)] transition-all group border border-transparent hover:border-[var(--border-subtle)] shadow-sm">
          <Bell size={18} className="group-hover:rotate-[15deg] transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-surface)] shadow-none"></span>
        </button>
      </div>
    </header>
  );
}
