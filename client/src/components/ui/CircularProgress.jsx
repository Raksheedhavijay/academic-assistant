import React from 'react';

export default function CircularProgress({ value = 85, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const isLow = value < 75;
  const color = isLow ? '#EF4444' : value >= 90 ? '#22C55E' : '#2563EB';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700/60 fill-none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-none transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-xl font-bold ${isLow ? 'text-danger animate-pulse' : 'text-slate-900 dark:text-white'}`}>
          {value}%
        </span>
        <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendance</span>
      </div>
    </div>
  );
}
