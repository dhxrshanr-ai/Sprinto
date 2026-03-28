import { motion } from 'framer-motion';

export default function Logo({ iconOnly = false, className = "" }) {
  return (
    <motion.div 
      className={`flex items-center gap-2.5 ${className}`}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="relative flex shadow-xl items-center justify-center min-w-10 w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] overflow-hidden">
        {/* Using standard public path for reliability */}
        <img 
          src="/favicon.svg" 
          alt="Sprinto Logo" 
          className="w-[22px] h-[22px] drop-shadow-sm select-none"
        />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/20" />
      </div>
      {!iconOnly && (
        <span className="text-[22px] font-bold tracking-tight text-[var(--text-main)]" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
          Sprinto
        </span>
      )}
    </motion.div>
  );
}
