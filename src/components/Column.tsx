import React from 'react';
import { Column, Task } from '../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface ColumnProps {
  column: Column;
  allColumns: Column[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (taskId: number, targetColumnId: number) => void;
  onCreateTaskInColumn: (columnId: number) => void;
  onCardClick?: (task: Task) => void;
}

export const ColumnComponent: React.FC<ColumnProps> = ({
  column,
  allColumns,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onCreateTaskInColumn,
  onCardClick,
}) => {
  const getHeaderDotColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'to do':
        return 'bg-blue-500';
      case 'in progress':
        return 'bg-amber-500';
      case 'done':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="w-full lg:w-96 shrink-0 bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col max-h-[calc(100vh-10rem)] shadow-2xs">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${getHeaderDotColor(column.name)}`} />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">{column.name}</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
          {column.tasks.length}
        </span>
      </div>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[160px] scrollbar-thin scrollbar-thumb-slate-200">
        {column.tasks.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
            <span>No tasks in this column</span>
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={allColumns}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onMove={onMoveTask}
              onCardClick={onCardClick}
            />
          ))
        )}
      </div>

      {/* Add a Card Button at bottom of column */}
      <button
        onClick={() => onCreateTaskInColumn(column.id)}
        className="mt-3 w-full py-2.5 px-3 bg-white/70 hover:bg-white border border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
      >
        <Plus className="w-4 h-4 text-slate-500" />
        <span>Add a card</span>
      </button>
    </div>
  );
};

