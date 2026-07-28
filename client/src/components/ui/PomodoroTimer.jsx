import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Sparkles } from 'lucide-react';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (mode === 'focus') {
        alert('🎉 Great Focus Session completed! Take a 5-minute break.');
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        alert('⏰ Break time over! Back to focus mode.');
        setMode('focus');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-2 bg-white/40 dark:bg-slate-800/40 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={() => switchMode('focus')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'focus' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Focus (25m)</span>
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'break' ? 'bg-secondary text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Short Break (5m)</span>
        </button>
      </div>

      <div className="text-5xl font-black tracking-tight font-mono gradient-text my-2">
        {formattedTime}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTimer}
          className={`p-3.5 rounded-2xl text-white font-semibold flex items-center justify-center transition-transform hover:scale-105 shadow-lg ${
            isRunning ? 'bg-amber-500 shadow-amber-500/30' : 'bg-primary shadow-primary/30'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1 pt-2">
        <Sparkles className="w-3 h-3 text-accent" />
        <span>Pomodoro Technique: Boost memory retention by 40%</span>
      </p>
    </div>
  );
}
