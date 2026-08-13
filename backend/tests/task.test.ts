import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { getDb } from '../database/db.js';

describe('Task Management API Tests', () => {
  beforeAll(() => {
    // Ensure DB is initialized
    getDb();
  });

  // Test 1: Empty title submission validation
  it('should reject task creation with empty title (400 Bad Request)', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        columnId: 1,
        title: '   ', // whitespace / empty
        description: 'Test description',
        priority: 'High'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Task title is required');
  });

  // Test 2: Task move functionality
  it('should move a task to another column', async () => {
    // First create a task in column 1 (To Do)
    const createRes = await request(app)
      .post('/api/tasks')
      .send({
        columnId: 1,
        title: 'Test Task for Move',
        description: 'Moving to column 2',
        priority: 'Medium'
      });

    expect(createRes.status).toBe(201);
    const createdTask = createRes.body;
    expect(createdTask.column_id).toBe(1);

    // Now move task to column 2 (In Progress)
    const moveRes = await request(app)
      .patch(`/api/tasks/${createdTask.id}/move`)
      .send({
        columnId: 2
      });

    expect(moveRes.status).toBe(200);
    expect(moveRes.body.id).toBe(createdTask.id);
    expect(moveRes.body.column_id).toBe(2);
  });
});
