import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  icon: Icon,
  ...props 
}, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm hover:shadow",
    secondary: "bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] hover:bg-[var(--bg-elevated)] shadow-sm",
    ghost: "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]",
    danger: "bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20"
  };

  const sizes = {
    sm: "text-[13px] px-3 py-1.5 gap-1.5",
    md: "text-[14px] px-4 py-2 gap-2",
    lg: "text-[15px] px-5 py-2.5 gap-2.5"
  };

  return (
    <button 
      ref={ref}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} />}
      {!loading && Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
