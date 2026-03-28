import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all duration-300 relative overflow-hidden group shadow-sm"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 0 : 180,
          scale: theme === 'dark' ? 1 : 0.9
        }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        {theme === 'dark' ? (
          <Moon size={18} className="transition-transform group-hover:scale-110" />
        ) : (
          <Sun size={18} className="transition-transform group-hover:scale-110" />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-[var(--accent)]/5 scale-0 group-active:scale-100 transition-transform rounded-lg" />
    </button>
  );
}
