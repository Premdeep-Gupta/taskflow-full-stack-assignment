import React from 'react';
import { Task, Column, Priority } from '../types';
import { Edit2, Trash2, Clock, GripVertical, MessageSquare, Paperclip, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  columns: Column[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (taskId: number, targetColumnId: number) => void;
  onCardClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columns,
  onEdit,
  onDelete,
  onMove,
  onCardClick,
}) => {
  const isCompleted = task.column_id === 3 || task.progress_percent === 100;

  const getPriorityBadge = (priority: Priority) => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Completed
        </span>
      );
    }
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
            <span className="text-red-500 font-bold">!</span>
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
            <span className="text-amber-500 font-bold">―</span>
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const getAvatarBg = (avatar?: string) => {
    switch (avatar) {
      case 'AD':
        return 'bg-blue-600 text-white';
      case 'RK':
        return 'bg-amber-600 text-white';
      case 'JD':
        return 'bg-purple-600 text-white';
      case 'SK':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const formattedDate = new Date(task.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3 group relative">
      {/* Priority Bar Top Accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
          isCompleted
            ? 'bg-emerald-500'
            : task.priority === 'High'
            ? 'bg-red-500'
            : task.priority === 'Medium'
            ? 'bg-amber-500'
            : 'bg-slate-300'
        }`}
      />

      {/* Top row: Drag handle + Priority & Action buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 cursor-grab shrink-0" />
          {getPriorityBadge(task.priority)}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div
        onClick={() => onCardClick && onCardClick(task)}
        className="cursor-pointer group-hover:text-blue-600 transition-colors"
      >
        <h4 className="font-semibold text-slate-900 text-sm leading-snug break-words">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Progress Bar (if in progress or percent > 0) */}
      {(task.column_id === 2 || (task.progress_percent && task.progress_percent > 0 && task.progress_percent < 100)) && (
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-500">
            <span>Progress</span>
            <span className="font-bold text-blue-700">{task.progress_percent || 50}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${task.progress_percent || 50}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Avatar, Comments, Attachments, Column Dropdown, Date */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-2xs ${getAvatarBg(
              task.assignee_avatar
            )}`}
            title={task.assignee_name || 'Assignee'}
          >
            {task.assignee_avatar || 'AD'}
          </div>

          {/* Comments badge */}
          <div className="flex items-center gap-0.5 text-slate-400 text-[11px]" title="Comments">
            <MessageSquare className="w-3 h-3" />
            <span>{task.comments_count || 1}</span>
          </div>

          {/* Attachments badge */}
          <div className="flex items-center gap-0.5 text-slate-400 text-[11px]" title="Attachments">
            <Paperclip className="w-3 h-3" />
            <span>{task.attachments_count || 2}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Column selector */}
          <select
            value={task.column_id}
            onChange={(e) => onMove(task.id, Number(e.target.value))}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md px-2 py-0.5 font-medium text-slate-700 text-[11px] focus:outline-none cursor-pointer"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>

          {/* Date stamp */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

