import React from 'react';

export default function StudyHeatmap({ data = [] }) {
  const intensityColors = [
    'bg-slate-200 dark:bg-slate-800',
    'bg-blue-300 dark:bg-blue-900/60',
    'bg-primary-500 dark:bg-primary-600',
    'bg-accent-500 dark:bg-accent-600'
  ];

  const weeks = Array.from({ length: 4 }, (_, w) => Array.from({ length: 7 }, (_, d) => w * 7 + d));

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/20 dark:border-slate-700/60">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Learning Activity Heatmap (Last 28 Days)</h4>
        <span className="text-xs text-primary font-semibold">🔥 7-Day Streak</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weeks.flatMap(week => week).map((dayIdx) => {
          const item = data.find(d => d.dayIndex === dayIdx) || { intensity: (dayIdx % 4) };
          return (
            <div
              key={dayIdx}
              title={`Day ${dayIdx + 1}: Level ${item.intensity}`}
              className={`h-6 rounded-md transition-transform hover:scale-110 cursor-pointer ${intensityColors[item.intensity]}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-end space-x-1.5 mt-3 text-[10px] text-slate-400">
        <span>Less</span>
        {intensityColors.map((col, idx) => (
          <span key={idx} className={`w-2.5 h-2.5 rounded-sm ${col}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
