import React from 'react';
import { Plus, Filter, Kanban, Search, Code, RotateCcw } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  onCreateTaskClick: () => void;
  onOpenSqlInspector: () => void;
  onResetDb: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  onCreateTaskClick,
  onOpenSqlInspector,
  onResetDb,
  isResetting,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              TaskFlow
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                BOARD
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">Full-Stack Task Management Board</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* SQL Inspector */}
          <button
            onClick={onOpenSqlInspector}
            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Open Live SQL Query Inspector"
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline font-mono">&lt;&gt; SQL Inspector</span>
          </button>

          {/* Reset DB */}
          <button
            onClick={onResetDb}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Reset database to initial seed data"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset DB</span>
          </button>

          {/* Priority Filter */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-7 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <div className="absolute right-2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Create Task Button */}
          <button
            onClick={onCreateTaskClick}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};

