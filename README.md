# 🎓 Student Life Saver

**Student Life Saver** is a smart student productivity and academic management platform designed to help students manage tasks, schedules, deadlines, and study plans in one place.

It combines **task management, scheduling, AI-powered academic assistance, and emergency planning** to help students stay organized and avoid falling behind.

---

## 🚀 Features

### 📋 Task Management
- Create and manage academic tasks
- Set deadlines and priorities
- Track pending and completed tasks
- Organize workload efficiently

### 📅 Smart Schedule
- Plan study sessions
- Manage available time
- Organize tasks around your schedule
- Generate AI-assisted study schedules

### 🤖 Gemini AI Advisor
Powered by **Google Gemini**, the AI Advisor can help students:

- Create study plans
- Prioritize assignments
- Analyze workload
- Plan around deadlines
- Decide what to study first
- Handle last-minute academic workload

Example:

> "I have three assignments due tomorrow and an exam in two days. What should I work on first?"

The application sends the relevant context to the backend, which communicates securely with Gemini.

### 🆘 Rescue Plan

When a student is falling behind, the Rescue Plan helps create an actionable recovery strategy.

It can identify:

- Urgent tasks
- Important deadlines
- Recommended task order
- Estimated time allocation
- Tasks that can be postponed
- Immediate next actions

### 🔐 Authentication

The application uses **Supabase Authentication** for secure user login and session management.

### ☁️ Supabase Database

Supabase is used for storing application data such as:

- User profiles
- Tasks
- Schedules
- Academic information

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript

### Database & Authentication

- Supabase

### Artificial Intelligence

- Google Gemini API
- `@google/genai`

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      Student        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │  TypeScript + Vite  │
                    └───────┬───────┬─────┘
                            │       │
                  ┌─────────┘       └─────────┐
                  ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │     Supabase    │         │ Express Backend │
        │ Auth + Database │         │     /api/ai     │
        └─────────────────┘         └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   Google Gemini │
                                    │       AI        │
                                    └─────────────────┘
```

---

## 📁 Project Structure

```text
student-life-saver/
│
├── src/
│   ├── components/
│   │   ├── AIAdvisorModal.tsx
│   │   ├── RescuePlanModal.tsx
│   │   ├── ScheduleModal.tsx
│   │   └── ...
│   │
│   ├── views/
│   │   ├── DashboardView.tsx
│   │   ├── TasksView.tsx
│   │   ├── ScheduleView.tsx
│   │   ├── RescueCenterView.tsx
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── scheduleEngine.ts
│   │   ├── supabaseData.ts
│   │   └── ...
│   │
│   ├── lib/
│   │   └── supabase.ts
│   │
│   ├── App.tsx
│   └── types.ts
│
├── server.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.local
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Enter the project

```bash
cd student-life-saver
```

### 3. Install dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### ⚠️ Security

**Never commit `.env.local` to GitHub.**

Add this to `.gitignore`:

```gitignore
.env
.env.local
node_modules/
dist/
```

The Gemini API key must remain on the **backend**.

Do not expose it through a `VITE_` variable.

---

## 🤖 Gemini AI Integration

The application communicates with Gemini through the Express backend.

```text
React
  ↓
POST /api/ai/advisor
  ↓
Express Server
  ↓
Google Gemini API
  ↓
AI Response
  ↓
React UI
```

### Available AI endpoints

```text
POST /api/ai/advisor
POST /api/ai/smart-schedule
POST /api/ai/rescue-plan
```

The backend keeps the Gemini API key private and sends only the required student context to Gemini.

---

## ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

Depending on the project configuration, the application will be available at:

```text
http://localhost:5173
```

---

## 🧪 Build for Production

Run:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

## 🔒 Authentication Flow

Student Life Saver uses Supabase Authentication.

```text
User Login
    ↓
Supabase Authentication
    ↓
Session Created
    ↓
Session Stored
    ↓
Application Loads User
    ↓
Dashboard
```

The application restores the existing Supabase session when the page is refreshed so users do not need to log in repeatedly while their session remains valid.

---

## 🎯 Main Use Cases

### Student with multiple assignments

The student enters their assignments and deadlines.

Gemini analyzes the workload and helps determine what should be completed first.

### Student preparing for an exam

The student can provide:

- Exam date
- Available study hours
- Subjects
- Pending tasks

The AI can generate a realistic study plan.

### Student falling behind

The Rescue Plan can organize overdue and upcoming tasks into a recovery strategy.

---

## 🌟 Future Improvements

Potential future improvements include:

- 📱 Mobile application
- 🔔 Push notifications
- 📧 Email reminders
- 📊 Academic performance analytics
- 🎯 Personalized learning recommendations
- 📆 Google Calendar integration
- 🧠 More advanced AI planning
- 📈 Productivity statistics
- 🔄 Automatic deadline tracking

---

## 👨‍💻 Development

### Frontend

The frontend is built using React and TypeScript.

### Backend

The Express backend handles:

- AI requests
- Gemini API communication
- Server-side logic
- Secure API operations

### Database

Supabase handles:

- Authentication
- User data
- Tasks
- Schedule information

---

## ⚠️ Important

Do not commit sensitive information such as:

```text
GEMINI_API_KEY
Supabase service-role keys
.env.local
Passwords
Access tokens
```

Only public Supabase configuration intended for the browser should use `VITE_` environment variables.

---

## 📄 License

This project is currently intended for educational and academic purposes.

---

## 👨‍🎓 Student Life Saver

**Plan better. Study smarter. Stay ahead.**

Built with ❤️ using React, TypeScript, Supabase, Express, and Google Gemini AI.
