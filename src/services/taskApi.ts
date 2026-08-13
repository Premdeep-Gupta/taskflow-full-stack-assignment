import { Board, Task, ColumnStat, SqlLog, Subtask, SqlQueryResult, CreateTaskPayload, UpdateTaskPayload } from '../types';

const API_BASE = '/api';

export async function fetchBoard(boardId: number = 1, priority?: string, search?: string): Promise<Board> {
  const params = new URLSearchParams();
  if (priority && priority !== 'All') params.append('priority', priority);
  if (search && search.trim() !== '') params.append('search', search.trim());

  const url = `${API_BASE}/boards/${boardId}${params.toString() ? '?' + params.toString() : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to fetch board' }));
    throw new Error(errorData.message || 'Failed to fetch board');
  }
  return res.json();
}

export async function fetchStats(boardId: number = 1): Promise<ColumnStat[]> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/stats`);
  if (!res.ok) {
    throw new Error('Failed to fetch board stats');
  }
  return res.json();
}

export async function resetDb(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to reset database');
  }
  return res.json();
}

export async function fetchSqlLogs(): Promise<SqlLog[]> {
  const res = await fetch(`${API_BASE}/sql-logs`);
  if (!res.ok) {
    throw new Error('Failed to fetch SQL logs');
  }
  return res.json();
}

export async function fetchTasksByPriority(priority: string): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks?priority=${encodeURIComponent(priority)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch tasks by priority');
  }
  return res.json();
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create task');
  }
  return data;
}

export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update task');
  }
  return data;
}

export async function moveTask(taskId: number, columnId: number): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columnId })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to move task');
  }
  return data;
}

export async function runSqlQuery(query: string): Promise<SqlQueryResult> {
  const res = await fetch(`${API_BASE}/sql-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to execute SQL query');
  }
  return data;
}

export async function toggleSubtaskApi(subtaskId: number): Promise<{ subtask: Subtask; parentTask: Task }> {
  const res = await fetch(`${API_BASE}/subtasks/${subtaskId}/toggle`, {
    method: 'PATCH'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to toggle subtask');
  }
  return data;
}

export async function createSubtaskApi(taskId: number, title: string): Promise<Subtask> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create subtask');
  }
  return data;
}

export async function deleteTask(taskId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete task');
  }
  return data;
}


