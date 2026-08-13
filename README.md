# TaskFlow — Full-Stack Task Management Board

A modern, full-stack Trello-like Task Management Application built as a Full-Stack Developer Take-Home Assignment.

---

## 📋 Overview

**TaskFlow** allows teams to organize tasks into columns (`To Do`, `In Progress`, `Done`), filter by priority (`High`, `Medium`, `Low`), update task statuses via column moves, and persist all changes in a relational SQLite database.

It demonstrates clean architecture with an Express backend, SQLite database using raw SQL queries (no ORM, as per evaluation criteria), a responsive React + Vite frontend, and comprehensive automated test coverage with Vitest + Supertest.

---

## ✨ Features

- **Board Canvas**: Clean 3-column layout (`To Do`, `In Progress`, `Done`) with sticky headers and task counters.
- **Task Management**:
  - **Create Task**: Form modal with title, description, priority, and column selection.
  - **Edit Task**: Edit existing task title, description, and priority.
  - **Delete Task**: Delete confirmation dialog with persistent backend deletion.
  - **Move Task**: Move tasks seamlessly between columns using dropdown selection or direct PATCH endpoint.
- **Priority Filtering**: Top filter bar (`All Priorities`, `High`, `Medium`, `Low`).
- **Backend Validation**: Strict backend validation enforcing non-empty titles, returning HTTP `400 Bad Request` with `{"message": "Task title is required"}`.
- **SQL Metrics Bar**: Live visual metrics showing tasks per column computed via non-trivial SQL queries (`GROUP BY` and `JOIN`).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons
- **Backend**: Node.js, Express
- **Database**: SQLite (`node:sqlite` / `better-sqlite3` compatible) with raw SQL
- **Testing**: Vitest, Supertest
- **Build & Bundling**: `tsx` (dev server), `esbuild` (production bundled CJS server)

---

## 🏗️ Architecture & Project Structure

```
taskflow/
├── backend/
│   ├── database/
│   │   ├── schema.sql           # Mandatory CREATE TABLE statements
│   │   ├── seed.js              # Database seed script
│   │   ├── taskflow.db          # SQLite database instance
│   │   └── db.ts                # Raw SQL query service layer
│   ├── src/
│   │   └── app.ts               # Express API routes & backend validation
│   └── tests/
│       ├── task.test.ts         # Validation & task move tests
│       └── database.test.ts     # SQL query tests
├── database/
│   └── schema.sql               # Database schema mirror for grader verification
├── src/
│   ├── components/
│   │   ├── Board.tsx            # Main board container
│   │   ├── Column.tsx           # Column container
│   │   ├── TaskCard.tsx         # Task item card with move & action buttons
│   │   ├── TaskFormModal.tsx    # Create & Edit modal
│   │   ├── DeleteConfirmModal.tsx# Delete confirmation dialog
│   │   ├── ErrorMessage.tsx     # Error banner display
│   │   ├── Navbar.tsx           # Top navigation & priority filter
│   │   └── StatsBar.tsx         # SQL query metrics header
│   ├── services/
│   │   └── taskApi.ts           # Frontend API client
│   ├── App.tsx                  # Root state & page layout
│   ├── types.ts                 # Shared TypeScript interfaces
│   └── main.tsx                 # React entry point
├── server.ts                    # Full-stack Express + Vite server entry point
├── package.json
└── README.md
```

---

## 🗄️ Database Schema (`backend/database/schema.sql`)

The application enforces primary keys, foreign keys with `ON DELETE CASCADE`, `NOT NULL` constraints, and default values:

```sql
CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    column_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);
```

---

## 🔍 Required Non-Trivial SQL Queries

### Query 1: Tasks Per Column Count
Uses `LEFT JOIN` and `GROUP BY` to return task distribution per column:
```sql
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
```

### Query 2: Filter Tasks by Priority (Newest First)
Uses `JOIN` to query tasks by priority ordered by creation timestamp:
```sql
SELECT
    t.id,
    t.title,
    t.description,
    t.priority,
    t.created_at,
    c.name AS column_name
FROM tasks t
JOIN columns c
    ON t.column_id = c.id
WHERE LOWER(t.priority) = LOWER(?)
ORDER BY t.created_at DESC;
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Sample Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/boards/1` | Fetch board with columns & tasks | - |
| **GET** | `/api/stats/tasks-per-column` | Execute Query 1 (tasks count per column) | - |
| **GET** | `/api/tasks?priority=High` | Execute Query 2 (filtered tasks by priority) | - |
| **POST** | `/api/tasks` | Create task (Strict validation) | `{"columnId": 1, "title": "Build API", "description": "Endpoints", "priority": "High"}` |
| **PUT** | `/api/tasks/:id` | Update task details | `{"title": "Updated Title", "description": "Updated", "priority": "Medium"}` |
| **PATCH** | `/api/tasks/:id/move` | Move task to another column | `{"columnId": 2}` |
| **DELETE**| `/api/tasks/:id` | Delete task from database | - |

---

## 🌱 Seed Data (`backend/database/seed.js`)

Seeding populates initial default board:
- **Board**: `TaskFlow`
- **Columns**: `To Do`, `In Progress`, `Done`
- **Tasks**:
  - **To Do**: "Build login page" (High), "Create API" (Medium)
  - **In Progress**: "Database integration" (High)
  - **Done**: "Project setup" (Low)

Run seed manually:
```bash
node backend/database/seed.js
```

---

## 🧪 Testing

Automated tests written with Vitest + Supertest cover:
1. **Empty Title Validation**: Expects `400 Bad Request` with message `"Task title is required"`.
2. **Move Task**: Expects `column_id` updated from 1 to 2 via `PATCH /api/tasks/:id/move`.
3. **Database Query**: Verifies SQL Query 1 (`tasks-per-column`) returns accurate column task counts.

Run tests:
```bash
npm test
```

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build & Start Production Server**:
   ```bash
   npm run build
   npm start
   ```

---

## 💡 Assumptions & Decisions

1. **No ORM Choice**: Raw SQL queries were used explicitly to satisfy assignment database inspection requirements.
2. **Dropdown Control over Drag-and-Drop**: Selected robust dropdown controls for moving tasks across columns to ensure reliable accessibility across mobile and touch screens.
3. **Unified Single-Port Deployment**: Express handles both API endpoints `/api/*` and Vite frontend middleware on port `3000` for simple Cloud Run container serving.

---

## 🔮 Future Improvements

- Add Drag-and-Drop using `@hello-pangea/dnd` alongside column move dropdown.
- Add user authentication and team board sharing.
- Add task search and tags/labels support.

---

## ⏱️ Time Spent & Learning Outcomes

- **Time Spent**: ~2.5 hours
- **Key Learnings**: Utilizing native Node 22 SQLite (`node:sqlite`) for zero-dependency native SQL execution, implementing clean RESTful API endpoint design with Supertest suite, and crafting responsive Tailwind CSS Kanban UI layouts.
