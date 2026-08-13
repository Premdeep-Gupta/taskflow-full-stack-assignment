import React from 'react';
import { Column, Task } from '../types';
import { ColumnComponent } from './Column';
import { Layers } from 'lucide-react';

interface BoardProps {
  columns: Column[];
  selectedPriority: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (taskId: number, targetColumnId: number) => void;
  onCreateTaskInColumn: (columnId: number) => void;
  onCardClick?: (task: Task) => void;
  isLoading: boolean;
}

export const Board: React.FC<BoardProps> = ({
  columns,
  selectedPriority,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onCreateTaskInColumn,
  onCardClick,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading TaskFlow Board...</p>
        </div>
      </div>
    );
  }

  const totalVisibleTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-x-auto">
      {selectedPriority !== 'All' && totalVisibleTasks === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm rounded-xl p-4 mb-4 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No tasks found matching priority filter <strong>"{selectedPriority}"</strong>.</span>
          </div>
        </div>
      )}

      {/* Columns Container */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-6 pb-6">
        {columns.map((column) => (
          <ColumnComponent
            key={column.id}
            column={column}
            allColumns={columns}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onMoveTask={onMoveTask}
            onCreateTaskInColumn={onCreateTaskInColumn}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};
