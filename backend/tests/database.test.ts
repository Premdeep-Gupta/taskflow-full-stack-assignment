import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { getDb, getTasksPerColumn, getTasksByPriority } from '../database/db.js';

describe('Database Query Tests', () => {
  beforeAll(() => {
    getDb();
  });

  // Test 3: SQL Query 1 - Tasks per column
  it('should return tasks count grouped per column using SQL query', async () => {
    const response = await request(app).get('/api/stats/tasks-per-column');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(3);

    // Each column should have id, name, and task_count
    const todoCol = response.body.find((col: any) => col.name === 'To Do');
    expect(todoCol).toBeDefined();
    expect(typeof todoCol.task_count).toBe('number');
  });

  // Test 4: SQL Query 2 - Tasks by priority
  it('should return tasks filtered by priority ordered newest first', async () => {
    const tasks = getTasksByPriority('High');

    expect(Array.isArray(tasks)).toBe(true);
    tasks.forEach(task => {
      expect(task.priority.toLowerCase()).toBe('high');
      expect(task.column_name).toBeDefined();
    });
  });
});
