import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, Settings as SettingsIcon, Bell, Shield, Palette, 
  HelpCircle, LogOut, ChevronRight, Check, Globe, Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';

const SETTINGS_CATEGORIES = [
  { id: 'profile', name: 'Profile', icon: User, color: 'text-blue-500' },
  { id: 'notifications', name: 'Notifications', icon: Bell, color: 'text-amber-500' },
  { id: 'security', name: 'Security', icon: Shield, color: 'text-red-500' },
  { id: 'appearance', name: 'Appearance', icon: Palette, color: 'text-purple-500' },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  const isDark = theme === 'dark';

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-full flex flex-col pt-4 overflow-x-hidden">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your account and customize your Sprinto experience.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 pb-10">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5">
          {SETTINGS_CATEGORIES.map((cat) => {
            const active = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium border ${
                  active 
                    ? 'bg-[var(--bg-elevated)] border-[var(--border-strong)] text-[var(--text-main)] shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]/50 border-transparent hover:border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <cat.icon size={16} className={active ? cat.color : 'text-[var(--text-muted)] transition-colors'} />
                  {cat.name}
                </div>
                {active && <ChevronRight size={14} className="text-[var(--text-muted)]" />}
              </button>
            )
          })}
          
          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] space-y-1.5 opacity-60">
             <button className="flex items-center gap-3 px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              <HelpCircle size={14} /> Documentation
            </button>
            <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:text-red-500 transition-colors">
              <LogOut size={14} /> Log out from all devices
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 min-w-0 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="linear-card flex-1 p-6 md:p-8 flex flex-col border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md rounded-2xl shadow-xl overflow-y-auto max-h-[calc(100vh-250px)]"
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-[var(--border-subtle)]">
                    <div className="relative group overflow-hidden">
                      <div className="w-20 h-20 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-3xl font-bold text-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold cursor-pointer rounded-2xl">
                        CHANGE
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-main)] mb-1">{user?.name}</h3>
                      <p className="text-sm text-[var(--text-muted)]">Global Profile & Personal Identification</p>
                      <span className="inline-flex items-center gap-1.5 mt-2.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest">
                        FREE TIER
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] ml-1">Full Name</label>
                      <input readOnly value={user?.name} className="w-full bg-[var(--bg-elevated)]/50 border border-[var(--border-subtle)] rounded-md px-3 py-2 text-sm text-[var(--text-muted)] cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] ml-1">Email Address</label>
                      <input readOnly value={user?.email} className="w-full bg-[var(--bg-elevated)]/50 border border-[var(--border-subtle)] rounded-md px-3 py-2 text-sm text-[var(--text-muted)] cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-strong)] mt-4">
                    <div className="flex items-start gap-3">
                      <Globe size={18} className="text-[var(--accent)] mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-[var(--text-main)] mb-1">Timezone Settings</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">Your timezone is currently set to (GMT-05:00) Eastern Time. This determines how task deadlines and activity logs are displayed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8 h-full">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-main)] mb-1">App Appearance</h3>
                    <p className="text-sm text-[var(--text-muted)]">Choose your preferred visual style for the dashboard.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 underline-offset-4">
                    <div 
                      onClick={() => !isDark && toggleTheme()}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${isDark ? 'border-[var(--accent)] bg-[var(--bg-elevated)] shadow-lg shadow-[var(--accent)]/10 ring-2 ring-[var(--accent)] ring-offset-4 ring-offset-[var(--bg-surface)]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 opacity-60 hover:opacity-100'}`}
                    >
                      <div className="w-full aspect-video bg-gray-900 rounded mb-3 border border-gray-800" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sprinto Dark</span>
                        {isDark && <Check size={14} className="text-[var(--accent)]" />}
                      </div>
                    </div>
                    <div 
                      onClick={() => isDark && toggleTheme()}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${!isDark ? 'border-[var(--accent)] bg-[var(--bg-elevated)] shadow-lg shadow-[var(--accent)]/10 ring-2 ring-[var(--accent)] ring-offset-4 ring-offset-[var(--bg-surface)]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 opacity-60 hover:opacity-100'}`}
                    >
                       <div className="w-full aspect-video bg-gray-100 rounded mb-3 border border-gray-200" />
                       <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pure Light</span>
                        {!isDark && <Check size={14} className="text-[var(--accent)]" />}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg">
                    <Laptop size={18} className="text-[var(--text-muted)]" />
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-main)] mb-0.5">Sync with OS</h4>
                      <p className="text-[11px] text-[var(--text-muted)]">Automatically change appearance based on your system preference.</p>
                    </div>
                    <div className="ml-auto w-10 h-5 bg-gray-600 rounded-full flex items-center px-1 border border-gray-500 cursor-pointer" onClick={() => { localStorage.removeItem('sprinto_theme'); window.location.reload(); }}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-all ${localStorage.getItem('sprinto_theme') ? 'translate-x-0' : 'translate-x-5'}`} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'profile' && activeTab !== 'appearance' && (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <SettingsIcon size={48} className="mb-4" />
                  <h3 className="text-lg font-medium">Module coming soon</h3>
                  <p className="text-sm max-w-xs mx-auto mt-2">We're working on making the {activeTab} fine-tuning available to all users.</p>
                </div>
              )}

              <div className="mt-auto pt-8 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)]">
                <Button variant="secondary" className="px-6">Discard</Button>
                <Button onClick={handleSave} className="px-8 flex items-center gap-2">
                  {isSaved ? <><Check size={14} /> Saved</> : 'Update Preferences'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
