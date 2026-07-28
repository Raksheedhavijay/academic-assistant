import React from 'react';

export default function Skeleton({ className = 'h-6 w-full' }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded-xl ${className}`} />
  );
}
