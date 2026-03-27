# Sprinto — Fullstack Kanban Task Manager

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" />
  <img src="https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions" />
</p>

> A production-ready, industry-level fullstack Kanban task management application with real-time collaboration, JWT authentication, drag-and-drop boards, and a complete DevOps pipeline.

---

## 📐 Project Structure

```
Root/
├── client/                  # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Navbar, TaskCard, TaskModal
│   │   ├── context/         # AuthContext
│   │   └── pages/           # Login, Register, Dashboard, Board
│   ├── Dockerfile           # Multi-stage nginx production build
│   └── nginx.conf           # SPA routing + API proxy
├── config/                  # DB connection, Winston logger
├── middleware/              # JWT auth middleware
├── models/                  # Mongoose schemas (User, Task, Project, etc.)
├── routes/                  # Express RESTful API routes
├── socket/                  # Socket.IO real-time events
├── tests/                   # API integration tests
├── .github/workflows/       # GitHub Actions CI/CD
├── docker-compose.yml       # Full-stack orchestration
├── Dockerfile               # Backend production image
├── .env.example             # Environment variable template
└── README.md
```

---

## 🚀 Tech Stack

| Layer        | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS v4      |
| Backend     | Node.js 20, Express 5                |
| Database    | MongoDB Atlas, Mongoose ODM          |
| Auth        | JWT (JSON Web Tokens), bcryptjs      |
| Real-time   | Socket.IO                            |
| Drag & Drop | @hello-pangea/dnd                    |
| Logging     | Winston + Morgan                     |
| DevOps      | Docker, Docker Compose, GitHub Actions |
| Deployment  | Vercel (frontend) + Render (backend) |

---

## ⚡ Features

- **🔐 JWT Authentication** — Secure login/register with token stored in localStorage
- **📋 Kanban Boards** — Drag & drop tasks between To Do / In Progress / Done columns
- **✅ Full Task CRUD** — Create, edit, delete tasks with title, description, priority, due date, labels, assignee
- **👥 Team Collaboration** — Invite members to projects by email
- **🔔 Real-time Notifications** — Socket.IO push notifications for task assignments and project invites
- **📊 Dashboard** — Project stats, member avatars, last-updated timestamps
- **📱 Responsive** — Fully mobile-friendly layout
- **🎨 Premium UI** — Dark glassmorphism design with smooth animations

---

## 🛠️ Local Development Setup

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas URI)
- npm >= 9

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd "Project Management Tool"

# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
```

### 3. Start Backend

```bash
npm run dev       # Starts Express on http://localhost:5000
```

### 4. Start Frontend

```bash
cd client
npm run dev       # Starts Vite dev server on http://localhost:3000
```

The Vite dev server proxies `/api` requests to the backend automatically.

---

## 🐳 Docker Setup

Run the **entire stack** (MongoDB + Backend + Frontend) with a single command:

```bash
# Copy and edit environment variables
cp .env.example .env

# Start all services
docker-compose up --build

# Access the app at http://localhost
# Backend API at http://localhost:5000
```

### Optional: With Mongo Express UI

```bash
docker-compose --profile debug up --build
# Mongo Express at http://localhost:8081
```

### Stop services

```bash
docker-compose down
docker-compose down -v  # Also remove MongoDB data volume
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint              | Description       | Auth |
|--------|-----------------------|-------------------|------|
| POST   | `/api/auth/register`  | Register new user | ❌   |
| POST   | `/api/auth/login`     | Login             | ❌   |
| GET    | `/api/auth/me`        | Get current user  | ✅   |

### Projects

| Method | Endpoint                       | Description             |
|--------|--------------------------------|-------------------------|
| GET    | `/api/projects`                | List my projects        |
| POST   | `/api/projects`                | Create project          |
| GET    | `/api/projects/:id`            | Get project             |
| PUT    | `/api/projects/:id`            | Update project (owner)  |
| DELETE | `/api/projects/:id`            | Delete project (owner)  |
| POST   | `/api/projects/:id/members`    | Add member by email     |

### Tasks

| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| GET    | `/api/tasks?project=` | Get tasks for project         |
| POST   | `/api/tasks`          | Create task                   |
| PUT    | `/api/tasks/:id`      | Update task                   |
| PUT    | `/api/tasks/:id/move` | Move task (drag & drop)       |
| DELETE | `/api/tasks/:id`      | Delete task                   |

### Other

- `GET /api/health` — Server health check
- `GET /api/notifications` — Get user notifications
- `GET /api/comments?task=` — Get task comments
- `POST /api/comments` — Add comment to task

---

## 🚢 Deployment

### Frontend → Vercel

1. Create a Vercel project linked to your GitHub repo
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_API_URL=https://your-backend.render.com/api`
4. Add GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Backend → Render

1. Create a Render **Web Service** from your repo
2. Set **Root Directory** to `/` (repo root)
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`
6. Copy the **Deploy Hook URL** and add to GitHub secrets as `RENDER_DEPLOY_HOOK_URL`

### Database → MongoDB Atlas

1. Create a free M0 cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist `0.0.0.0/0` for Render
4. Copy the connection string to `MONGO_URI`

---

## ⚙️ CI/CD Pipeline

GitHub Actions workflow at `.github/workflows/ci-cd.yml`:

```
Push to main
    │
    ├── backend-ci       → Install deps → Run tests → Health check
    ├── frontend-ci      → Install deps → Lint → Build → Upload artifact
    │
    └── (on main only)
        ├── docker-build → Build & push GHCR images (backend + frontend)
        ├── deploy-frontend → Deploy to Vercel
        └── deploy-backend  → Trigger Render deploy hook
```

### Required GitHub Secrets

| Secret                    | Description                      |
|--------------------------|----------------------------------|
| `VERCEL_TOKEN`           | Vercel personal access token     |
| `VERCEL_ORG_ID`          | Vercel organization/user ID      |
| `VERCEL_PROJECT_ID`      | Vercel project ID                |
| `RENDER_DEPLOY_HOOK_URL` | Render deploy hook URL           |

---

## 🧪 Running Tests

```bash
# Start the server first (with a test DB)
MONGO_URI=mongodb://localhost:27017/Sprinto_test npm run dev &

# Run API integration tests
npm test
```

---

## 📸 Screenshots

| Login Page | Dashboard | Kanban Board |
|:----------:|:---------:|:------------:|
| _screenshot_ | _screenshot_ | _screenshot_ |

---

## 📋 Environment Variables Reference

```bash
# Backend (.env)
MONGO_URI=mongodb+srv://...            # MongoDB Atlas URI
JWT_SECRET=long_random_secret          # Min 32 chars
PORT=5000                              # Server port
NODE_ENV=development                   # development | production | test
CLIENT_URL=http://localhost:3000       # Frontend origin for CORS

# Frontend (client/.env.local) — optional
VITE_API_URL=/api                      # API base URL
```

---

## 📄 License

MIT © Sprinto

---

<p align="center">Built with ❤️ as an industry-level portfolio project demonstrating fullstack development and DevOps best practices.</p>
