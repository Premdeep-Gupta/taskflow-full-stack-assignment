import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function seedDatabase(dbPath) {
  const targetDbPath = dbPath || path.join(__dirname, 'taskflow.db');
  const db = new DatabaseSync(targetDbPath);

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Read schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Check if boards table has data
  const boardCountStmt = db.prepare('SELECT COUNT(*) as count FROM boards');
  const result = boardCountStmt.get();

  if (result && result.count > 0) {
    console.log('Database already contains seed data.');
    return db;
  }

  console.log('Seeding initial data into TaskFlow database...');

  // Insert initial Board
  const insertBoard = db.prepare('INSERT INTO boards (name) VALUES (?)');
  const boardResult = insertBoard.run('TaskFlow');
  const boardId = boardResult.lastInsertRowid;

  // Insert Columns
  const insertColumn = db.prepare('INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)');
  const col1 = insertColumn.run(boardId, 'To Do', 1);
  const col2 = insertColumn.run(boardId, 'In Progress', 2);
  const col3 = insertColumn.run(boardId, 'Done', 3);

  const todoId = col1.lastInsertRowid;
  const inProgressId = col2.lastInsertRowid;
  const doneId = col3.lastInsertRowid;

  // Insert Tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (column_id, title, description, priority, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const t1 = new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString();
  const t2 = new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString();
  const t3 = new Date(now.getTime() - 1000 * 60 * 60 * 1).toISOString();
  const t4 = new Date(now.getTime()).toISOString();

  insertTask.run(todoId, 'Build login page', 'Implement authentication flow and form validation', 'High', t1);
  insertTask.run(todoId, 'Create API', 'Design REST endpoints for task management', 'Medium', t2);
  insertTask.run(inProgressId, 'Database integration', 'Connect SQLite database with Express backend', 'High', t3);
  insertTask.run(doneId, 'Project setup', 'Initialize React Vite and Express application', 'Low', t4);

  console.log('Database seeded successfully!');
  return db;
}

// Run directly if called as a script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
