export type Priority = 'Low' | 'Medium' | 'High';

export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean | number;
  created_at?: string;
}

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  progress_percent?: number;
  assignee_name?: string;
  assignee_avatar?: string;
  comments_count?: number;
  attachments_count?: number;
  created_at: string;
  column_name?: string;
  subtasks?: Subtask[];
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  tasks: Task[];
  task_count?: number;
}

export interface Board {
  id: number;
  name: string;
  created_at: string;
  columns: Column[];
}

export interface ColumnStat {
  id: number;
  name: string;
  task_count: number;
}

export interface SqlLog {
  id: string;
  query: string;
  timestamp: string;
  execution_ms: number;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionMs: number;
  query: string;
}

export interface CreateTaskPayload {
  columnId: number;
  title: string;
  description?: string;
  priority: Priority;
  progress_percent?: number;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  priority: Priority;
  progress_percent?: number;
}


