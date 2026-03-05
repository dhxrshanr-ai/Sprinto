# 🚀 Project Management Tool

A **collaborative project management tool** with Kanban boards, real-time updates, and team collaboration features. Built with a modern emerald-green dark theme.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

---

## ✨ Features

- **🔐 Authentication** — Register & login with JWT-based auth
- **📋 Project Boards** — Create and manage multiple projects
- **📝 Kanban Board** — Drag-and-drop task cards across columns (To Do, In Progress, Done)
- **👥 Team Collaboration** — Invite members and assign tasks
- **💬 Comments** — Discuss tasks with threaded comments
- **🔔 Notifications** — Real-time notifications for task updates
- **⚡ Real-Time Updates** — Live sync via Socket.IO
- **🎨 Modern UI** — Glassmorphism dark theme with emerald-green accents

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML, CSS, JavaScript             |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB with Mongoose             |
| Auth       | JWT + bcrypt                      |
| Real-Time  | Socket.IO                        |

---

## 📁 Project Structure

```
Project Management Tool/
├── config/
│   └── db.js                # MongoDB connection config
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema
│   ├── Project.js           # Project schema
│   ├── Task.js              # Task schema
│   ├── Comment.js           # Comment schema
│   └── Notification.js      # Notification schema
├── routes/
│   ├── auth.js              # Auth routes (register/login)
│   ├── projects.js          # Project CRUD routes
│   ├── tasks.js             # Task CRUD routes
│   ├── comments.js          # Comment routes
│   └── notifications.js     # Notification routes
├── socket/
│   └── index.js             # Socket.IO event handlers
├── public/
│   ├── index.html           # Login/Register page
│   ├── dashboard.html       # Projects dashboard
│   ├── board.html           # Kanban board view
│   ├── css/
│   │   └── style.css        # Design system & styles
│   └── js/                  # Client-side JavaScript
├── server.js                # Express server entry point
├── .env                     # Environment variables
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) or [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Project-Management-Tool.git
   cd Project-Management-Tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/project-manager
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```

   > For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open your browser** at [http://localhost:5000](http://localhost:5000)

---

## 📡 API Endpoints

| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| POST   | `/api/auth/register`    | Register a new user      |
| POST   | `/api/auth/login`       | Login & get JWT token    |
| GET    | `/api/projects`         | Get all user projects    |
| POST   | `/api/projects`         | Create a new project     |
| GET    | `/api/tasks/:projectId` | Get tasks for a project  |
| POST   | `/api/tasks`            | Create a new task        |
| PUT    | `/api/tasks/:id`        | Update a task            |
| DELETE | `/api/tasks/:id`        | Delete a task            |
| POST   | `/api/comments`         | Add a comment to a task  |
| GET    | `/api/notifications`    | Get user notifications   |

---

## 📄 License

This project is licensed under the ISC License.
