import { motion } from 'framer-motion';

export default function Logo({ iconOnly = false, className = "" }) {
  return (
    <motion.div 
      className={`flex items-center gap-2.5 ${className}`}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="relative flex shadow-sm items-center justify-center min-w-8 w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6]">
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-white" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          {/* Abstract Geometric 'S' / Flow */}
          <path d="M16 5H8L4 12h8l-4 7h8l4-7h-8z" />
        </svg>
      </div>
      {!iconOnly && (
        <span className="text-[20px] font-bold tracking-tight text-[var(--text-main)]" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
          Sprinto
        </span>
      )}
    </motion.div>
  );
}
