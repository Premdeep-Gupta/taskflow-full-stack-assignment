import { useState, useEffect, useCallback } from 'react';
import { Board as BoardType, ColumnStat, Task, CreateTaskPayload, UpdateTaskPayload } from './types';
import { fetchBoard, fetchStats, createTask, updateTask, moveTask, deleteTask, resetDb } from './services/taskApi';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { Board } from './components/Board';
import { TaskFormModal } from './components/TaskFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SqlInspectorModal } from './components/SqlInspectorModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ErrorMessage } from './components/ErrorMessage';

export default function App() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [stats, setStats] = useState<ColumnStat[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<number | undefined>(undefined);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [isSqlInspectorOpen, setIsSqlInspectorOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);

  // Load Board & Stats from backend
  const loadData = useCallback(async (priority: string = 'All', search: string = '') => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const [boardData, statsData] = await Promise.all([
        fetchBoard(1, priority, search),
        fetchStats(1)
      ]);
      setBoard(boardData);
      setStats(statsData);

      // Refresh selected task detail if open
      if (selectedTaskForDetail && boardData) {
        const updatedTask = boardData.columns.flatMap(c => c.tasks).find(t => t.id === selectedTaskForDetail.id);
        if (updatedTask) setSelectedTaskForDetail(updatedTask);
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Error loading board data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTaskForDetail]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(selectedPriority, searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedPriority, searchQuery]);

  // Handlers
  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleResetDb = async () => {
    if (confirm('Are you sure you want to reset the database to initial seed data?')) {
      setIsResetting(true);
      try {
        await resetDb();
        await loadData(selectedPriority, searchQuery);
      } catch (err: any) {
        setGlobalError(err.message || 'Failed to reset database');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleCreateTaskClick = () => {
    setTaskToEdit(null);
    setDefaultColumnId(board?.columns[0]?.id || 1);
    setIsFormModalOpen(true);
  };

  const handleCreateTaskInColumn = (columnId: number) => {
    setTaskToEdit(null);
    setDefaultColumnId(columnId);
    setIsFormModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  const handleDeleteTaskClick = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      await loadData(selectedPriority, searchQuery);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveTask = async (taskId: number, targetColumnId: number) => {
    try {
      await moveTask(taskId, targetColumnId);
      await loadData(selectedPriority, searchQuery);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to move task');
    }
  };

  const handleFormSubmit = async (
    payload: CreateTaskPayload | UpdateTaskPayload,
    isEdit: boolean,
    taskId?: number
  ) => {
    if (isEdit && taskId) {
      await updateTask(taskId, payload as UpdateTaskPayload);
    } else {
      await createTask(payload as CreateTaskPayload);
    }
    await loadData(selectedPriority, searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedPriority={selectedPriority}
        onPriorityChange={handlePriorityChange}
        onCreateTaskClick={handleCreateTaskClick}
        onOpenSqlInspector={() => setIsSqlInspectorOpen(true)}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      {/* Live SQLite Metrics Bar */}
      <StatsBar
        stats={stats}
        onOpenSqlInspector={() => setIsSqlInspectorOpen(true)}
      />

      {/* Global Error Banner */}
      {globalError && (
        <div className="max-w-7xl w-full mx-auto px-4 pt-4">
          <ErrorMessage message={globalError} onClose={() => setGlobalError(null)} />
        </div>
      )}

      {/* Main Board */}
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col">
        <Board
          columns={board?.columns || []}
          selectedPriority={selectedPriority}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTaskClick}
          onMoveTask={handleMoveTask}
          onCreateTaskInColumn={handleCreateTaskInColumn}
          onCardClick={(task) => setSelectedTaskForDetail(task)}
          isLoading={isLoading}
        />
      </main>

      {/* Create / Edit Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultColumnId={defaultColumnId}
        columns={board?.columns || []}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Live SQL Inspector Modal */}
      <SqlInspectorModal
        isOpen={isSqlInspectorOpen}
        onClose={() => setIsSqlInspectorOpen(false)}
      />

      {/* Task Detail & Subtasks Modal */}
      <TaskDetailModal
        isOpen={Boolean(selectedTaskForDetail)}
        task={selectedTaskForDetail}
        columns={board?.columns || []}
        onClose={() => setSelectedTaskForDetail(null)}
        onRefreshData={() => loadData(selectedPriority, searchQuery)}
      />
    </div>
  );
}


