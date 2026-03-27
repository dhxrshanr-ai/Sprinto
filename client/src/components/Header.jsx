import { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';

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
        <div className={`relative flex-1 group transition-all duration-300 ${searchFocused ? 'md:max-w-md' : 'md:max-w-xs'}`}>
          <Search 
            size={14} 
            className={`absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} 
          />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-elevated)] group-hover:border-[var(--border-strong)] focus:border-[var(--accent)] text-[var(--text-main)] pl-8 pr-3 py-1.5 rounded-md text-sm transition-all outline-none placeholder:text-[var(--text-muted)] shadow-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex gap-1">
            <kbd className="hidden lg:inline-block text-[10px] font-mono bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-muted)] px-1.5 py-0.5 rounded shadow-sm">⌘</kbd>
            <kbd className="hidden lg:inline-block text-[10px] font-mono bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-muted)] px-1.5 py-0.5 rounded shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-md hover:bg-[var(--bg-elevated)] transition-colors group">
          <Bell size={18} className="group-hover:scale-105 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-surface)]"></span>
        </button>
      </div>
    </header>
  );
}
