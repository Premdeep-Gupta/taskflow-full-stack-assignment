import express, { Request, Response } from 'express';
import {
  getBoardWithColumnsAndTasks,
  getTasksPerColumn,
  getTasksByPriority,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  resetDatabase,
  getSqlLogs,
  runCustomSqlQuery,
  toggleSubtask,
  createSubtask
} from '../database/db.js';

export const app = express();

app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'TaskFlow' });
});

/**
 * GET /api/boards/:id
 * Get board by ID with columns and tasks. Optional ?priority=High and ?search=api query parameters.
 */
app.get('/api/boards/:id', (req: Request, res: Response) => {
  const boardId = Number(req.params.id);
  if (isNaN(boardId)) {
    return res.status(400).json({ message: 'Invalid board ID' });
  }

  const priorityFilter = req.query.priority as string | undefined;
  const searchFilter = req.query.search as string | undefined;
  const board = getBoardWithColumnsAndTasks(boardId, priorityFilter, searchFilter);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  return res.json(board);
});

/**
 * POST /api/reset
 * Reset DB to initial seed state
 */
app.post('/api/reset', (req: Request, res: Response) => {
  try {
    resetDatabase();
    return res.json({ message: 'Database reset to initial state successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to reset database' });
  }
});

/**
 * POST /api/sql-run
 * Execute custom raw SQL query for Live SQL Playground
 */
app.post('/api/sql-run', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ message: 'SQL query string is required' });
  }

  try {
    const result = runCustomSqlQuery(query);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'SQL Execution Error' });
  }
});

/**
 * PATCH /api/subtasks/:id/toggle
 * Toggle subtask completion status
 */
app.patch('/api/subtasks/:id/toggle', (req: Request, res: Response) => {
  const subtaskId = Number(req.params.id);
  if (isNaN(subtaskId)) {
    return res.status(400).json({ message: 'Invalid subtask ID' });
  }

  const result = toggleSubtask(subtaskId);
  if (!result) {
    return res.status(404).json({ message: 'Subtask not found' });
  }

  return res.json(result);
});

/**
 * POST /api/tasks/:id/subtasks
 * Add a new subtask to a task
 */
app.post('/api/tasks/:id/subtasks', (req: Request, res: Response) => {
  const taskId = Number(req.params.id);
  const { title } = req.body;

  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Subtask title is required' });
  }

  try {
    const newSubtask = createSubtask(taskId, title);
    return res.status(201).json(newSubtask);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to create subtask' });
  }
});

/**
 * GET /api/sql-logs
 * Get recent executed SQL queries for SQL Inspector
 */
app.get('/api/sql-logs', (req: Request, res: Response) => {
  return res.json(getSqlLogs());
});



/**
 * GET /api/boards/:id/stats OR GET /api/stats/tasks-per-column
 * Query 1: Tasks per column count
 */
app.get('/api/boards/:id/stats', (req: Request, res: Response) => {
  const boardId = Number(req.params.id) || 1;
  const stats = getTasksPerColumn(boardId);
  return res.json(stats);
});

app.get('/api/stats/tasks-per-column', (req: Request, res: Response) => {
  const boardId = Number(req.query.boardId) || 1;
  const stats = getTasksPerColumn(boardId);
  return res.json(stats);
});

/**
 * GET /api/tasks?priority=High
 * Query 2: Filter tasks by priority
 */
app.get('/api/tasks', (req: Request, res: Response) => {
  const priority = req.query.priority as string | undefined;

  if (priority && priority.toLowerCase() !== 'all') {
    const tasks = getTasksByPriority(priority);
    return res.json(tasks);
  }

  // If no priority specified, return default board tasks
  const board = getBoardWithColumnsAndTasks(1);
  if (!board) {
    return res.json([]);
  }
  const allTasks = board.columns.flatMap(c => c.tasks);
  return res.json(allTasks);
});

/**
 * POST /api/tasks
 * Create a new task with strict backend validation
 */
app.post('/api/tasks', (req: Request, res: Response) => {
  const { columnId, title, description, priority } = req.body;

  // Backend Validation for empty/missing title
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  if (!columnId || isNaN(Number(columnId))) {
    return res.status(400).json({ message: 'Column ID is required' });
  }

  const normalizedPriority = ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium';

  try {
    const task = createTask(Number(columnId), title, description, normalizedPriority);
    return res.status(201).json(task);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to create task' });
  }
});

/**
 * PUT /api/tasks/:id
 * Update an existing task
 */
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  const { title, description, priority } = req.body;

  // Backend Validation for empty/missing title
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const normalizedPriority = ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium';

  const updatedTask = updateTask(taskId, title, description, normalizedPriority);

  if (!updatedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.json(updatedTask);
});

/**
 * PATCH /api/tasks/:id/move
 * Move a task to another column
 */
app.patch('/api/tasks/:id/move', (req: Request, res: Response) => {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  const { columnId } = req.body;
  if (!columnId || isNaN(Number(columnId))) {
    return res.status(400).json({ message: 'Target columnId is required' });
  }

  const movedTask = moveTask(taskId, Number(columnId));

  if (!movedTask) {
    return res.status(404).json({ message: 'Task or column not found' });
  }

  return res.json(movedTask);
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  const success = deleteTask(taskId);
  if (!success) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.json({ message: 'Task deleted successfully' });
});
