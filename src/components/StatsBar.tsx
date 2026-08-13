import React from 'react';
import { ColumnStat } from '../types';
import { CheckCircle2, Clock, ListTodo, ArrowRight } from 'lucide-react';

interface StatsBarProps {
  stats: ColumnStat[];
  onOpenSqlInspector: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, onOpenSqlInspector }) => {
  const totalTasks = stats ? stats.reduce((acc, curr) => acc + (curr.task_count || 0), 0) : 0;

  const getColIcon = (name: string) => {
    if (name.toLowerCase().includes('to do')) return <ListTodo className="w-3.5 h-3.5 text-blue-500" />;
    if (name.toLowerCase().includes('progress')) return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 gap-4 flex-wrap">
      {/* Left Pulse indicator */}
      <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] text-slate-700">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span>Live SQLite Metrics:</span>
      </div>

      {/* Center Metrics Pills */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {stats.map(stat => (
          <div
            key={stat.id}
            className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs text-slate-700 text-[11px] font-medium"
          >
            {getColIcon(stat.name)}
            <span>{stat.name}:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {stat.task_count}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1 bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded-full text-[11px]">
          <span>Total:</span>
          <span className="text-blue-700 font-bold">{totalTasks} tasks</span>
        </div>
      </div>

      {/* Right Action Link */}
      <button
        onClick={onOpenSqlInspector}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-[11px] transition-colors cursor-pointer"
      >
        <span>Inspect SQL</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

