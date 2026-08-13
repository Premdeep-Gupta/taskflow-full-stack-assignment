import React, { useState } from 'react';
import { Task, Column, Subtask } from '../types';
import { toggleSubtaskApi, createSubtaskApi } from '../services/taskApi';
import { X, CheckSquare, Plus, Clock, User, MessageSquare, Paperclip } from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  task: Task | null;
  columns: Column[];
  onClose: () => void;
  onRefreshData: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  task,
  columns,
  onClose,
  onRefreshData,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>('');
  const [isAddingSubtask, setIsAddingSubtask] = useState<boolean>(false);

  if (!isOpen || !task) return null;

  const currentColumn = columns.find(c => c.id === task.column_id);
  const subtasksList = task.subtasks || [];
  const completedCount = subtasksList.filter(s => s.is_completed === 1 || s.is_completed === true).length;
  const progressPercent = subtasksList.length > 0 ? Math.round((completedCount / subtasksList.length) * 100) : task.progress_percent || 0;

  const handleToggleSubtask = async (subId: number) => {
    try {
      await toggleSubtaskApi(subId);
      onRefreshData();
    } catch (err) {
      console.error('Failed to toggle subtask', err);
    }
  };

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setIsAddingSubtask(true);
    try {
      await createSubtaskApi(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
      onRefreshData();
    } catch (err) {
      console.error('Failed to add subtask', err);
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              {currentColumn?.name || 'Task'}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getPriorityBadgeColor(task.priority)}`}>
              {task.priority} Priority
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Title & Description */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {task.title}
            </h2>
            {task.description ? (
              <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic mt-1">No description provided</p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                Checklist Progress ({completedCount}/{subtasksList.length})
              </span>
              <span className="text-blue-700 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Subtasks ({subtasksList.length})
            </h3>

            <div className="space-y-2">
              {subtasksList.map((sub) => {
                const isDone = sub.is_completed === 1 || sub.is_completed === true;
                return (
                  <label
                    key={sub.id}
                    className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2.5 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={`text-xs font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {sub.title}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a new subtask item..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Task Metadata */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Assigned: <strong className="text-slate-700">{task.assignee_name || 'Alex Doe'}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-slate-400" />
                {task.comments_count || 1} comments
              </span>
              <span className="flex items-center gap-1">
                <Paperclip className="w-3 h-3 text-slate-400" />
                {task.attachments_count || 2} files
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
