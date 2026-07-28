import React from 'react';

export default function StatCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colorStyles = {
    primary: 'from-primary/20 to-primary/5 text-primary border-primary/30',
    secondary: 'from-secondary/20 to-secondary/5 text-secondary border-secondary/30',
    accent: 'from-accent/20 to-accent/5 text-accent border-accent/30',
    success: 'from-success/20 to-success/5 text-success border-success/30',
    danger: 'from-danger/20 to-danger/5 text-danger border-danger/30',
  }[color];

  return (
    <div className="glass-card p-5 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
          {change && (
            <p className="text-xs font-medium text-success mt-1 flex items-center space-x-1">
              <span>↑</span>
              <span>{change}</span>
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorStyles} flex items-center justify-center border shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
