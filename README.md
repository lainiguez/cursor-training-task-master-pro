# TaskMaster Pro

A professional Task Management MVP built with **Node.js**, **TypeScript**, **Express**, and **Prisma** (SQLite).

## Prompts used to build this application

"
Act as a Senior Backend Engineer. Initialize a Node.js project named "TaskMaster Pro" using TypeScript, Express, and Prisma with SQLite.

Goal: Build a professional Task Management MVP with the following requirements:

Data Model (Prisma): Create a schema with a Task model including:

id (String/UUID), title (String), description (String, optional).

status (Enum: PENDING, IN_PROGRESS, COMPLETED).

priority (Enum: LOW, MEDIUM, HIGH, URGENT).

createdAt and updatedAt (DateTime).

userId (String) to associate tasks with a specific user.

Architecture:

Use a Repository Pattern for database access.

Use a Service Layer for business logic (e.g., TaskService).

Use Controllers for handling HTTP requests.

Core API Endpoints:

POST /tasks: Create a task (Validated by Zod).

GET /tasks: List tasks with a Flexible Filter Function (filter by status, priority, or search description).

PATCH /tasks/:id: Update task status or priority.

DELETE /tasks/:id: Soft delete a task.

Special Requirements:

Security: Create a middleware that validates a static API Key from the .env file via the X-API-KEY header.

Error Handling: Implement a global middleware to catch errors and return consistent JSON: { "success": false, "message": "..." }.

Testing: Generate a Jest test suite for the TaskService to verify that tasks cannot be created with an empty title.

Please start by generating the schema.prisma file and the folder structure.
"

To add tests:

"add as many tests as required to cover all the endpoints, security, logic, etc"

## Features

- **Task Management**: Create, read, update, and delete tasks.
- **Flexible Filtering**: Filter tasks by status, priority, or search description.
- **Security**: API Key authentication via `X-API-KEY` header.
- **Clean Architecture**: Organized into Controllers, Services, and Repositories.
- **Validation**: Strong request validation using **Zod**.
- **Soft Deletes**: Tasks are marked as deleted rather than removed from the database.

## Prerequisites

- Node.js (v14+ recommended)
- npm

## Setup & Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Configuration**:
    Ensure you have a `.env` file in the root directory (based on `.env.example` if available). 
    
    Example `.env`:
    ```env
    PORT=3000
    DATABASE_URL="file:./dev.db"
    API_KEY="my-secret-api-key-123"
    ```

3.  **Database Setup**:
    Initialize the SQLite database and client:
    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Application

**Development Mode** (with hot-reload):
```bash
npm run dev
```

**Production/Standard Start**:
```bash
npm start
```

The server runs on `http://localhost:3000` by default.

## Testing

Run the Jest test suite:
```bash
npm test
```

## API Usage (Curl Examples)

**Important**: Replace `my-secret-api-key-123` with the `API_KEY` defined in your `.env` file.

### 1. Create a Task
POST `/tasks`
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: my-secret-api-key-123" \
  -d '{
    "title": "Complete Project Documentation",
    "description": "Write the README with detailed curl examples.",
    "priority": "HIGH",
    "userId": "user_001"
  }'
```

### 2. List All Tasks
GET `/tasks`
```bash
curl -X GET http://localhost:3000/tasks \
  -H "X-API-KEY: my-secret-api-key-123"
```

### 3. Filter Tasks
GET `/tasks?status=PENDING&priority=HIGH&search=Documentation`
```bash
curl -X GET "http://localhost:3000/tasks?status=PENDING&priority=HIGH&search=Documentation" \
  -H "X-API-KEY: my-secret-api-key-123"
```

### 4. Update Task
PATCH `/tasks/:id`
*Replace `:id` with an actual UUID.*
```bash
curl -X PATCH http://localhost:3000/tasks/YOUR_TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: my-secret-api-key-123" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "URGENT"
  }'
```

### 5. Delete a Task
DELETE `/tasks/:id`
*Replace `:id` with an actual UUID.*
```bash
curl -X DELETE http://localhost:3000/tasks/YOUR_TASK_ID_HERE \
  -H "X-API-KEY: my-secret-api-key-123"
```