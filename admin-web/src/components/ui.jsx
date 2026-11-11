// Reusable UI primitives

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-2.5 text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50';
  const variants = {
    primary: 'bg-brand-gradient text-white shadow-soft hover:scale-105 hover:shadow-lg',
    outline: 'border-2 border-white text-white hover:bg-white/10',
    ghost: 'text-primary hover:bg-primary-light dark:hover:bg-primary/10',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-ink/80 rounded-3xl shadow-soft p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink/70 dark:text-white/70">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        <input
          className={`w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 py-2.5 text-sm text-ink dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${Icon ? 'pl-10 pr-4' : 'px-4'} ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Badge({ children, variant = 'yellow', className = '' }) {
  const variants = {
    yellow: 'bg-secondary text-ink',
    green: 'bg-primary-light text-primary-dark',
    teal: 'bg-primary-dark/10 text-primary-dark',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
