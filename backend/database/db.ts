import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  is_completed: number;
  created_at: string;
}

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: 'Low' | 'Medium' | 'High';
  progress_percent: number;
  assignee_name: string;
  assignee_avatar: string;
  comments_count: number;
  attachments_count: number;
  created_at: string;
  updated_at?: string;
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

export interface SqlLog {
  id: string;
  query: string;
  timestamp: string;
  execution_ms: number;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

const sqlLogs: SqlLog[] = [];

export function logSqlQuery(query: string, startTime: number, type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE') {
  const executionMs = Number((performance.now() - startTime).toFixed(2));
  sqlLogs.unshift({
    id: Math.random().toString(36).substring(2, 9),
    query: query.trim(),
    timestamp: new Date().toLocaleTimeString(),
    execution_ms: executionMs,
    type
  });
  if (sqlLogs.length > 50) sqlLogs.pop();
}

export function getSqlLogs(): SqlLog[] {
  return sqlLogs;
}

let dbInstance: DatabaseSync | null = null;

export function seedInitialData(db: DatabaseSync) {
  // Clear existing data & reset auto-increment sequences
  db.exec('DELETE FROM subtasks;');
  db.exec('DELETE FROM tasks;');
  db.exec('DELETE FROM columns;');
  db.exec('DELETE FROM boards;');
  try {
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('subtasks', 'tasks', 'columns', 'boards');");
  } catch (e) {
    // sqlite_sequence might not exist yet
  }

  const insertBoard = db.prepare('INSERT INTO boards (name) VALUES (?)');
  const boardResult = insertBoard.run('TaskFlow Main Board');
  const boardId = Number(boardResult.lastInsertRowid);

  const insertCol = db.prepare('INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)');
  const col1 = Number(insertCol.run(boardId, 'To Do', 1).lastInsertRowid);
  const col2 = Number(insertCol.run(boardId, 'In Progress', 2).lastInsertRowid);
  const col3 = Number(insertCol.run(boardId, 'Done', 3).lastInsertRowid);

  const insertTask = db.prepare(`
    INSERT INTO tasks (column_id, title, description, priority, progress_percent, assignee_name, assignee_avatar, comments_count, attachments_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSub = db.prepare(`
    INSERT INTO subtasks (task_id, title, is_completed) VALUES (?, ?, ?)
  `);

  // To Do tasks (5 tasks)
  const t1 = Number(insertTask.run(col1, 'Create API', 'Design REST endpoints for task management.', 'Medium', 0, 'Alex Doe', 'AD', 1, 2).lastInsertRowid);
  insertSub.run(t1, 'Define Express routes', 0);
  insertSub.run(t1, 'Add Zod backend validation', 0);

  const t2 = Number(insertTask.run(col1, 'Build login page', 'Implement authentication flow and form validation.', 'High', 0, 'Rohan Kumar', 'RK', 4, 1).lastInsertRowid);
  insertSub.run(t2, 'Create React form state', 0);

  insertTask.run(col1, 'Setup database', 'Write relational schema.sql and seed.sql with foreign keys.', 'Medium', 0, 'Sara Khan', 'SK', 2, 0);
  insertTask.run(col1, 'Write documentation', 'Complete architecture.md and api.md documentation.', 'Low', 0, 'John Doe', 'JD', 1, 3);
  insertTask.run(col1, 'Create React UI', 'Build TanStack Query powered Kanban board with Tailwind CSS.', 'Medium', 0, 'Alex Doe', 'AD', 3, 2);

  // In Progress tasks (5 tasks)
  const t6 = Number(insertTask.run(col2, 'Database integration', 'Connect SQLite database with Express backend and setup query services.', 'High', 67, 'John Doe', 'JD', 2, 2).lastInsertRowid);
  insertSub.run(t6, 'Setup node:sqlite connection', 1);
  insertSub.run(t6, 'Create CRUD helper functions', 1);
  insertSub.run(t6, 'Write Supertest database test suite', 0);

  const t7 = Number(insertTask.run(col2, 'Setup CI/CD Pipeline', 'Configure GitHub Actions for automated testing and deployment to staging.', 'Medium', 50, 'Sara Khan', 'SK', 3, 1).lastInsertRowid);
  insertSub.run(t7, 'Configure Github Actions workflow', 1);
  insertSub.run(t7, 'Setup Docker deployment container', 0);

  insertTask.run(col2, 'Implement Auth Middleware', 'Add JWT token verification and user permission guards.', 'High', 80, 'Rohan Kumar', 'RK', 5, 2);
  insertTask.run(col2, 'Add Drag & Drop', 'Implement smooth HTML5 drag and drop column card sorting.', 'Medium', 50, 'Alex Doe', 'AD', 2, 1);
  insertTask.run(col2, 'API Rate Limiting', 'Protect public REST endpoints using Express rate limiter.', 'Low', 30, 'John Doe', 'JD', 1, 0);

  // Done tasks (3 tasks)
  const t11 = Number(insertTask.run(col3, 'Project setup', 'Initialize React Vite and Express application workspace.', 'Low', 100, 'Sara Khan', 'SK', 3, 2).lastInsertRowid);
  insertSub.run(t11, 'Initialize Vite React TS app', 1);
  insertSub.run(t11, 'Setup Express backend server', 1);

  insertTask.run(col3, 'Create GitHub Repository', 'Initialize Git repository, branch protection rules and project documentation.', 'High', 100, 'Alex Doe', 'AD', 1, 1);
  insertTask.run(col3, 'Database schema', 'Validate SQLite constraints, primary keys, and foreign keys.', 'High', 100, 'Rohan Kumar', 'RK', 2, 4);

  // Log seeding SQL query
  logSqlQuery('SEED_INITIAL_DATA (13 Tasks + Subtasks across 3 Columns)', performance.now(), 'INSERT');
}

export function resetDatabase() {
  const db = getDb();
  seedInitialData(db);
}

export function getDb(customDbPath?: string): DatabaseSync {
  if (dbInstance && !customDbPath) {
    return dbInstance;
  }

  const defaultDbPath = path.join(__dirname, 'taskflow.db');
  const dbPath = customDbPath || defaultDbPath;

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');

  // Ensure schema exists
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Ensure default board and seed tasks exist
  const boardCount = (db.prepare('SELECT COUNT(*) as count FROM boards').get() as { count: number }).count;
  if (boardCount === 0) {
    seedInitialData(db);
  }

  if (!customDbPath) {
    dbInstance = db;
  }

  return db;
}

// Custom SQL Query Runner for SQL Inspector Playground
export function runCustomSqlQuery(rawQuery: string): {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionMs: number;
  query: string;
} {
  const startTime = performance.now();
  const db = getDb();
  const trimmed = rawQuery.trim();

  let type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT';
  if (/^insert/i.test(trimmed)) type = 'INSERT';
  else if (/^update/i.test(trimmed)) type = 'UPDATE';
  else if (/^delete/i.test(trimmed)) type = 'DELETE';

  let rows: Record<string, any>[] = [];
  let columns: string[] = [];

  if (type === 'SELECT') {
    const result = db.prepare(trimmed).all() as Record<string, any>[];
    rows = result;
    columns = result.length > 0 ? Object.keys(result[0]) : [];
  } else {
    const result = db.prepare(trimmed).run();
    rows = [{ lastInsertRowid: Number(result.lastInsertRowid), changes: Number(result.changes) }];
    columns = ['lastInsertRowid', 'changes'];
  }

  const executionMs = Number((performance.now() - startTime).toFixed(2));
  logSqlQuery(trimmed, startTime, type);

  return {
    columns,
    rows,
    rowCount: rows.length,
    executionMs,
    query: trimmed
  };
}

// Subtasks CRUD
export function getSubtasksForTask(taskId: number): Subtask[] {
  const db = getDb();
  return db.prepare('SELECT id, task_id, title, is_completed, created_at FROM subtasks WHERE task_id = ? ORDER BY id ASC').all(taskId) as unknown as Subtask[];
}

export function toggleSubtask(subtaskId: number): { subtask: Subtask; parentTask: Task | null } | null {
  const startTime = performance.now();
  const db = getDb();

  const sub = db.prepare('SELECT id, task_id, is_completed FROM subtasks WHERE id = ?').get(subtaskId) as any;
  if (!sub) return null;

  const newStatus = sub.is_completed ? 0 : 1;
  db.prepare('UPDATE subtasks SET is_completed = ? WHERE id = ?').run(newStatus, subtaskId);

  logSqlQuery(`UPDATE subtasks SET is_completed = ${newStatus} WHERE id = ${subtaskId}`, startTime, 'UPDATE');

  // Recalculate progress_percent for parent task
  const allSubtasks = getSubtasksForTask(sub.task_id);
  let progressPercent = 0;
  if (allSubtasks.length > 0) {
    const completedCount = allSubtasks.filter(s => Boolean(s.is_completed)).length;
    progressPercent = Math.round((completedCount / allSubtasks.length) * 100);
  }

  db.prepare('UPDATE tasks SET progress_percent = ? WHERE id = ?').run(progressPercent, sub.task_id);

  const updatedSubtask = db.prepare('SELECT id, task_id, title, is_completed, created_at FROM subtasks WHERE id = ?').get(subtaskId) as unknown as Subtask;
  const parentTask = (db.prepare('SELECT id, column_id, title, description, priority, progress_percent, assignee_name, assignee_avatar, comments_count, attachments_count, created_at FROM tasks WHERE id = ?').get(sub.task_id) as unknown) as Task;

  return { subtask: updatedSubtask, parentTask };
}

export function createSubtask(taskId: number, title: string): Subtask {
  const startTime = performance.now();
  const db = getDb();
  const res = db.prepare('INSERT INTO subtasks (task_id, title, is_completed) VALUES (?, ?, 0)').run(taskId, title.trim());
  const subId = Number(res.lastInsertRowid);

  logSqlQuery(`INSERT INTO subtasks (task_id, title) VALUES (${taskId}, '${title.trim()}')`, startTime, 'INSERT');

  // Recalculate progress_percent
  const allSubtasks = getSubtasksForTask(taskId);
  const completedCount = allSubtasks.filter(s => Boolean(s.is_completed)).length;
  const progressPercent = Math.round((completedCount / allSubtasks.length) * 100);
  db.prepare('UPDATE tasks SET progress_percent = ? WHERE id = ?').run(progressPercent, taskId);

  return db.prepare('SELECT id, task_id, title, is_completed, created_at FROM subtasks WHERE id = ?').get(subId) as unknown as Subtask;
}

// ----------------------------------------------------
// DB Query Service Functions
// ----------------------------------------------------

export function getBoardWithColumnsAndTasks(boardId: number = 1, priorityFilter?: string, searchFilter?: string): Board | null {
  const startTime = performance.now();
  const db = getDb();
  
  let board = db.prepare('SELECT id, name, created_at FROM boards WHERE id = ?').get(boardId) as {
    id: number;
    name: string;
    created_at: string;
  } | undefined;

  if (!board) {
    board = db.prepare('SELECT id, name, created_at FROM boards ORDER BY id ASC LIMIT 1').get() as {
      id: number;
      name: string;
      created_at: string;
    } | undefined;
  }

  if (!board) return null;
  const actualBoardId = board.id;

  const colQuery = 'SELECT id, board_id, name, position FROM columns WHERE board_id = ? ORDER BY position ASC';
  const columns = db.prepare(colQuery).all(actualBoardId) as {
    id: number;
    board_id: number;
    name: string;
    position: number;
  }[];

  const fullColumns: Column[] = columns.map(col => {
    let tasksQuery = `
      SELECT id, column_id, title, description, priority, progress_percent,
             assignee_name, assignee_avatar, comments_count, attachments_count, created_at, updated_at
      FROM tasks WHERE column_id = ?
    `;
    const params: (number | string)[] = [col.id];

    if (priorityFilter && priorityFilter.toLowerCase() !== 'all') {
      tasksQuery += ' AND LOWER(priority) = LOWER(?)';
      params.push(priorityFilter);
    }

    if (searchFilter && searchFilter.trim() !== '') {
      tasksQuery += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      params.push(`%${searchFilter.trim()}%`, `%${searchFilter.trim()}%`);
    }

    tasksQuery += ' ORDER BY id ASC, created_at DESC';

    const tasks = (db.prepare(tasksQuery).all(...params) as unknown) as Task[];

    // Fetch subtasks for each task
    const tasksWithSubtasks = tasks.map(t => {
      const subtasks = getSubtasksForTask(t.id);
      return { ...t, subtasks };
    });

    return {
      ...col,
      tasks: tasksWithSubtasks
    };
  });

  logSqlQuery(`SELECT * FROM boards b JOIN columns c JOIN tasks t WHERE b.id = ${actualBoardId}`, startTime, 'SELECT');

  return {
    id: board.id,
    name: board.name,
    created_at: board.created_at,
    columns: fullColumns
  };
}

export function getTasksPerColumn(boardId: number = 1): { id: number; name: string; task_count: number }[] {
  const startTime = performance.now();
  const db = getDb();
  const query = `
    SELECT
        c.id,
        c.name,
        COUNT(t.id) AS task_count
    FROM columns c
    LEFT JOIN tasks t
        ON c.id = t.column_id
    WHERE c.board_id = ?
    GROUP BY c.id, c.name
    ORDER BY c.position;
  `;
  const result = db.prepare(query).all(boardId) as { id: number; name: string; task_count: number }[];
  logSqlQuery(query, startTime, 'SELECT');
  return result;
}

export function getTasksByPriority(priority: string): Task[] {
  const startTime = performance.now();
  const db = getDb();
  const query = `
    SELECT
        t.id,
        t.column_id,
        t.title,
        t.description,
        t.priority,
        t.progress_percent,
        t.assignee_name,
        t.assignee_avatar,
        t.comments_count,
        t.attachments_count,
        t.created_at,
        c.name AS column_name
    FROM tasks t
    JOIN columns c
        ON t.column_id = c.id
    WHERE LOWER(t.priority) = LOWER(?)
    ORDER BY t.created_at DESC;
  `;
  const result = (db.prepare(query).all(priority) as unknown) as Task[];
  logSqlQuery(query, startTime, 'SELECT');
  return result;
}

export function createTask(
  columnId: number,
  title: string,
  description?: string,
  priority: string = 'Medium',
  progressPercent: number = 0,
  assigneeName: string = 'Alex Doe',
  assigneeAvatar: string = 'AD'
): Task {
  const startTime = performance.now();
  const db = getDb();
  const query = `
    INSERT INTO tasks (column_id, title, description, priority, progress_percent, assignee_name, assignee_avatar, comments_count, attachments_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = db.prepare(query).run(
    columnId,
    title.trim(),
    description ? description.trim() : null,
    priority,
    progressPercent,
    assigneeName,
    assigneeAvatar,
    1,
    2
  );
  const taskId = Number(result.lastInsertRowid);

  logSqlQuery(query, startTime, 'INSERT');

  const getStmt = db.prepare(`
    SELECT id, column_id, title, description, priority, progress_percent,
           assignee_name, assignee_avatar, comments_count, attachments_count, created_at
    FROM tasks WHERE id = ?
  `);
  return (getStmt.get(taskId) as unknown) as Task;
}

export function updateTask(
  taskId: number,
  title: string,
  description?: string,
  priority: string = 'Medium',
  progressPercent?: number
): Task | null {
  const startTime = performance.now();
  const db = getDb();

  const existing = db.prepare('SELECT id, progress_percent FROM tasks WHERE id = ?').get(taskId) as any;
  if (!existing) return null;

  const newProgress = progressPercent !== undefined ? progressPercent : existing.progress_percent;

  const query = `
    UPDATE tasks
    SET title = ?, description = ?, priority = ?, progress_percent = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.prepare(query).run(title.trim(), description ? description.trim() : null, priority, newProgress, taskId);

  logSqlQuery(query, startTime, 'UPDATE');

  return (db.prepare(`
    SELECT id, column_id, title, description, priority, progress_percent,
           assignee_name, assignee_avatar, comments_count, attachments_count, created_at
    FROM tasks WHERE id = ?
  `).get(taskId) as unknown) as Task;
}

export function moveTask(taskId: number, columnId: number): Task | null {
  const startTime = performance.now();
  const db = getDb();

  const colExists = db.prepare('SELECT id FROM columns WHERE id = ?').get(columnId);
  if (!colExists) return null;

  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!existing) return null;

  const query = 'UPDATE tasks SET column_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.prepare(query).run(columnId, taskId);

  logSqlQuery(query, startTime, 'UPDATE');

  return (db.prepare(`
    SELECT id, column_id, title, description, priority, progress_percent,
           assignee_name, assignee_avatar, comments_count, attachments_count, created_at
    FROM tasks WHERE id = ?
  `).get(taskId) as unknown) as Task;
}

export function deleteTask(taskId: number): boolean {
  const startTime = performance.now();
  const db = getDb();
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!existing) return false;

  const query = 'DELETE FROM tasks WHERE id = ?';
  db.prepare(query).run(taskId);
  logSqlQuery(query, startTime, 'DELETE');
  return true;
}


