# PeerCheck System Documentation

## 1. What This Document Covers

This document is an in-depth, code-based explanation of the current `PeerCheck` repository as it exists in this folder. It covers:

- the frontend and backend technology stack
- the external platforms and services integrated into the app
- the package-level libraries used by the project
- the application features from an end-user and client-demo point of view
- how the main data is collected, stored, derived, and calculated
- how the files connect to each other across the codebase
- how the overall frontend, backend, routes, controllers, and models work together

This is based on the code currently present in the repository root, `peerCheck-frontend`, and `server`.

Important note: this repo clearly shows several integrated services such as MongoDB Atlas, Cloudflare R2, and Gmail SMTP. However, it does **not** include committed infrastructure files for a specific frontend hosting provider like Vercel, Netlify, or Render. Where deployment details are not explicitly committed, this document labels them as inferred rather than proven.

---

## 2. High-Level Product Summary

PeerCheck is a full-stack collaboration, project monitoring, peer review, and academic/team integrity platform.

At a practical level, it allows:

- students or team members to register, log in, create teams, create projects, create tasks, upload proof of work, review peers, and track progress
- teachers or mentors to monitor assigned projects, evaluate teams, inspect metrics, and review collaboration quality
- admins to monitor platform security, user activity, deleted data, task edits, and overall system performance

The product combines classic project management with academic/team accountability features:

- task progress tracking
- time/focus tracking
- proof uploads
- suspicious activity flags
- peer review scoring
- teacher evaluation
- contributor fairness and free-rider detection
- project health scoring
- user productivity scoring
- notifications
- onboarding tours
- team and connection management

In short, PeerCheck is not just a task board. It is a project accountability and validation platform.

---

## 3. Repository Structure

### Root

- `package.json`
- `package-lock.json`
- `README.md`
- `peerCheck-frontend/`
- `server/`

### Root-level role

The root package is mainly an orchestration layer for development:

- starts backend with `node server/server.js`
- runs backend in dev with `nodemon`
- starts frontend by moving into `peerCheck-frontend`
- runs both frontend and backend together via `concurrently`

### Main subprojects

- `peerCheck-frontend/`: Vite + React frontend
- `server/`: Express + MongoDB backend

This is a standard split frontend/backend monorepo-like structure, though it is managed with separate package manifests instead of a full workspace system.

---

## 4. Technology Stack

## 4.1 Root/Development Tooling

From the root `package.json`:

- Node.js runtime
- `concurrently` for running frontend and backend together
- `nodemon` via script usage for backend hot reload

The root package also includes a few dependencies that functionally belong to the app stack, but most application code actually lives inside the frontend and backend subfolders.

## 4.2 Frontend Stack

The frontend is built with:

- React 19
- Vite 7
- React Router DOM 7
- Material UI 7
- Emotion (`@emotion/react`, `@emotion/styled`) for MUI styling
- Tailwind CSS 4
- PostCSS + Autoprefixer
- Framer Motion
- Axios

Additional frontend libraries include:

- `react-chartjs-2` and `chart.js` for charts
- `recharts` for dashboard visualizations
- `notistack` for snackbars/toasts
- `shepherd.js` for guided tours/onboarding
- `@tiptap/react` and starter extensions for rich-text editing in project/task-related UI
- Radix UI primitives for dialogs, tabs, dropdowns, labels, avatars, tooltips, etc.
- `@phosphor-icons/react`, `@tabler/icons-react`, `react-icons`, and MUI icons for UI iconography
- `date-fns` for date formatting and handling
- `react-intersection-observer` for viewport-driven effects
- `react-router-hash-link`
- `tailwind-merge`
- `tw-animate-css`

Fonts explicitly installed include:

- Inter
- Roboto
- Alkatra
- ADLaM Display

## 4.3 Backend Stack

The backend is built with:

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT-based authentication
- `bcryptjs` for password hashing
- `dotenv` for environment variable loading
- `cors`
- `multer` for file upload handling
- `node-cron` for scheduled jobs
- `nodemailer` for password reset email delivery
- AWS SDK v3 S3 client packages for Cloudflare R2 object storage compatibility

Installed backend libraries also include:

- `exceljs`
- `dayjs`
- `socket.io`

Based on the scanned code, those three are present in dependencies, but `socket.io`, `dayjs`, and `exceljs` are not clearly wired into the currently active request path in the files inspected. They may be planned, partially implemented, or used in code paths outside the primary flows.

## 4.4 Runtime Architecture Style

This codebase follows a conventional layered structure:

- frontend UI components and hooks call API utilities
- API requests hit Express routes
- routes dispatch controllers
- controllers query/update Mongoose models
- models persist to MongoDB
- some controllers also integrate external services like email and object storage

That makes PeerCheck a classic SPA + REST API architecture.

---

## 5. External Services, Platforms, and Deployment Surfaces

## 5.1 MongoDB Atlas

This is explicitly present in `server/mongodbConnectivity.js`.

The backend:

- first tries `process.env.MONGO_URI`
- logs `MongoDB Atlas Connected` when successful
- falls back to `process.env.LOCAL_MONGO_URI` if Atlas fails

This means MongoDB Atlas is the primary cloud database, with local MongoDB as a local/dev fallback.

## 5.2 Local MongoDB

Also explicit in `server/mongodbConnectivity.js`.

If Atlas is unreachable, the system attempts a local MongoDB connection. This suggests the project supports:

- local development with a local DB
- cloud-connected usage via Atlas

## 5.3 Cloudflare R2

This is explicit in `server/r2Client.js`.

The app configures an S3-compatible client pointing to:

- `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

This means PeerCheck uses Cloudflare R2 as object storage for uploaded files, especially task proof files and likely profile images or similar file assets where needed.

Although it uses AWS SDK packages, the actual storage provider is Cloudflare R2, not Amazon S3 directly.

## 5.4 Gmail / SMTP via Nodemailer

Explicit in `server/controllers/authControllers.js`.

Password reset emails are sent using:

- `nodemailer`
- Gmail service credentials from environment variables

This means Gmail SMTP is part of the app’s operational platform stack.

## 5.5 Frontend URL and Backend API URL

The app uses environment-driven URLs:

- frontend reset URL uses `process.env.FRONTEND_URL`
- frontend API base uses `import.meta.env.VITE_API_BASE_URL`

This means deployment depends on environment configuration and is intended to support different environments such as:

- local development
- staging
- production

## 5.6 Dev Servers

Local development clearly uses:

- Vite dev server for frontend
- Node/Express server for backend
- concurrent execution via root scripts

## 5.7 Hosting Provider Status

What is **proven by code**:

- MongoDB Atlas
- local MongoDB fallback
- Cloudflare R2
- Gmail SMTP
- environment-based frontend/backend URLs

What is **not proven by committed code in this repo**:

- a specific frontend hosting provider such as Vercel/Netlify
- a specific backend hosting provider such as Render/Railway/Fly.io
- CI/CD provider

So if you are showing this to a client, the safe statement is:

"PeerCheck is already structured for cloud deployment, uses MongoDB Atlas and Cloudflare R2 as cloud services, and externalizes its frontend/backend URLs via environment variables. However, this repo does not currently commit provider-specific deployment configuration for a named frontend or backend hosting platform."

---

## 6. Frontend Architecture

## 6.1 Frontend Entry

Main entry:

- `peerCheck-frontend/src/main.jsx`

Responsibilities:

- imports global CSS
- renders `<App />`
- wraps the whole app with `NotificationProvider`

This means notifications are treated as app-wide shared state.

## 6.2 App Router

Main router:

- `peerCheck-frontend/src/App.jsx`

Responsibilities:

- mounts `BrowserRouter`
- defines public and protected routes
- manages theme selection and persistence
- restores user from `localStorage`
- exposes student and teacher app shells

Primary route areas:

- `/` -> landing/home page
- auth pages under `AuthPage`
- `/forgot-password`
- `/reset-password/:token`
- `/admin-page`
- `/sec-n-auth`
- `/user-app/*`
- `/teacher-app/*`

## 6.3 Authentication Handling on Frontend

Key files:

- `src/Components/ProtectedRoute.jsx`
- `src/api/axiosClient.js`
- `src/utils/auth.js`
- `src/utils/user.js`

How it works:

- JWT token is stored in `localStorage`
- `axiosClient` injects `Authorization: Bearer <token>` automatically
- `ProtectedRoute` blocks protected pages if no token exists
- user data is also read from `localStorage`

This is a localStorage-based SPA authentication model.

## 6.4 Theming

Theme-related files:

- `src/assets/theme.js`
- `src/utils/themeUtils.js`
- `src/Components/ThemesComponents/ThemePicker.jsx`
- `src/Components/ThemesComponents/ThemeToggleButton.jsx`

Behavior:

- app stores selected theme name in `localStorage`
- theme is applied via MUI `ThemeProvider`
- body background/text colors are updated when theme changes

This means PeerCheck has user-visible theme personalization built into the core app shell.

## 6.5 Frontend Layout Shells

Student shell:

- `src/Components/user-dashboard/UserApp.jsx`

Teacher shell:

- `src/Components/teacher-dashboard/teacher-dash-app.jsx`

These files are layout controllers more than content-only components. They handle:

- tab navigation
- mobile drawer behavior
- logout
- top-level role-specific navigation
- notification bell access
- todo access
- guided tour entry

## 6.6 Shared Frontend Patterns

The frontend is organized into:

- `Components/`
- `hooks/`
- `contexts/`
- `utils/`
- `api/`

The pattern is:

- UI components present data and trigger actions
- hooks collect data and manage local domain logic
- `axiosClient` performs HTTP requests
- contexts provide cross-cutting shared state like notifications

## 6.7 Major Frontend Feature Areas

### Public/Auth

- `Components/Login/Home.jsx`
- `Components/Login/Login.jsx`
- `Components/Login/AuthPage.jsx`
- `Components/Login/AuthShell.jsx`
- `Components/Login/Helper Components/Signup.jsx`
- `ForgotPassword.jsx`
- `ResetPassword.jsx`
- `ReviewDialog.jsx`

These power:

- landing page
- sign-up
- sign-in
- review/testimonial submission
- forgot/reset password

### Student Dashboard

Key areas:

- `Dashboard.jsx`
- `Tasks.jsx`
- `Projects.jsx`
- `MyProject.jsx`
- `PeerTeams.jsx`
- `Profile.jsx`
- `NotificationsPage.jsx`

### Teacher Dashboard

Key areas:

- `teacher-dashboard/Dashboard.jsx`
- `TeacherClasses.jsx`
- `Feedback.jsx`
- `Profile.jsx`

### Admin Area

Key areas:

- `AdminPage.jsx`
- `UserManagement.jsx`
- `SystemManagement.jsx`
- `SecNAuth.jsx`
- `Performance.jsx`

### Supportive UI

- task components
- project components
- upload proof modal
- sticky notes panel/icon
- tour guide steps
- notification bell
- todo list dialog

---

## 7. Backend Architecture

## 7.1 Backend Entry

Main file:

- `server/server.js`

Responsibilities:

- loads environment variables from `server/.env`
- creates Express app
- enables CORS
- enables JSON body parsing
- mounts route modules under `/api/...`
- connects to database
- starts listening on `PORT` or `5000`

## 7.2 Backend Route Modules

Mounted route groups:

- `/api/auth`
- `/api/admin`
- `/api/user`
- `/api/projects`
- `/api/reviews`
- `/api/home` mapped to auth routes for basic-data behavior
- `/api/peer-review`
- `/api/sticky-note`
- `/api/teacher`
- `/api/todos`

Each route file delegates actual logic to controllers.

## 7.3 Middleware

Important middleware:

- `authMiddleware`
- `protectAdmin`
- `teacherOnlyMiddleware`
- `uploadMiddleware`

Role:

- verify JWTs
- enforce admin-only access
- enforce teacher-only access
- process avatar and proof file uploads with `multer`

## 7.4 Controllers

The controllers folder contains the actual business logic for:

- auth
- users
- productivity
- discovery
- projects
- tasks
- peer reviews
- project evaluations
- mentor/teacher flows
- admin analytics
- teams
- connections
- sticky notes
- todos
- comments
- notifications
- activity logging
- deadline checking

This is the real core of the backend.

## 7.5 Models

Mongoose models define the persistence layer for:

- users
- tasks
- projects
- peer reviews
- project evaluations
- teams
- connections
- notifications
- todos
- reviews/testimonials
- comments
- sticky notes
- mentor assignments
- login logs
- password resets
- deleted project records
- deleted task records
- edited task records
- task activity events
- tour guide completion state

---

## 8. Main Domain Concepts

The app revolves around a few major domain entities:

### User

Stores:

- identity
- login credentials
- role
- profile fields
- avatar
- bio
- institution/course/year
- online status
- productivity metrics

Roles include:

- `student`
- `teacher`
- `admin`

### Team

Represents a peer group.

Stores:

- name
- members
- projects
- creator

### Project

Represents a collaborative work container.

Stores:

- project metadata
- team link
- deadline
- progress
- health/metrics
- grading criteria
- toolkit

### Task

Represents actionable work inside a project.

Stores:

- title
- description
- assignee
- assigner
- project link
- deadline
- estimated time
- focus time
- assignment history
- proof uploads
- risk flags
- grading metadata
- calculated metrics
- task metrics
- progress by user

### Peer Review

Represents member-to-member evaluation inside a project.

Stores:

- reviewer
- reviewee
- project
- criterion scores
- comment
- total score

### Project Evaluation

Represents teacher or student evaluation of a project.

Stores:

- project
- evaluator
- evaluator role
- rubric grading
- member contribution scores
- suspicion flags
- final score

### Notification

Represents user-visible activity or alert.

Stores:

- user
- type
- title
- message
- related IDs
- priority
- read state
- action URL
- expiration

### Todo

Represents lightweight personal or project-linked checklist items.

---

## 9. End-User Functionalities

## 9.1 Public Visitor Features

A first-time visitor can:

- visit the landing page
- see platform stats such as active users, total users, recent reviews, and satisfaction-style metrics
- read testimonial/review content
- sign up
- log in
- request a password reset

The landing page fetches live backend data through `/user/basic-data`.

## 9.2 Account and Access Features

Users can:

- register as student or teacher
- log in with username or email
- log out
- reset password through emailed token link

Admins appear to be role-based and not exposed via ordinary self-signup in the normal UX.

## 9.3 Student/User Features

A logged-in student can:

- access a dashboard
- create and manage projects
- create and manage tasks
- view their project in detail
- create or join peer teams
- connect with other users
- accept or reject peer requests
- upload an avatar
- edit profile details
- receive notifications
- use a todo list
- create sticky notes on a project
- upload proof files to tasks
- comment on tasks
- submit peer reviews
- view project and task metrics
- complete guided tours
- switch themes

## 9.4 Teacher Features

A teacher can:

- access a teacher dashboard
- view monitored projects
- view monitored teams
- access analytics
- submit teacher evaluations
- update/delete evaluations
- inspect project metrics and risk/health indicators

## 9.5 Admin Features

Admins can:

- inspect security statistics
- review login attempts and failed logins
- inspect password reset activity
- view all users
- change user status
- review deleted projects
- review deleted tasks
- review edited task history
- inspect project stats
- inspect performance analytics
- inspect system stats

This suggests a strong governance and monitoring layer beyond the normal collaboration app features.

---

## 10. Client Demo: How the App Is Used From an End User Point of View

If this were being demoed to a client, the flow would look like this:

### Step 1: Visitor lands on the website

They arrive on the home page and see:

- branding and product explanation
- live usage numbers
- recent reviews/testimonials
- call-to-action into signup/login

### Step 2: User creates an account or logs in

The user can register with:

- full name
- username
- email
- date of birth
- password
- role

The backend validates:

- required fields
- age threshold
- email shape
- password length
- unique email
- unique username

### Step 3: User enters their dashboard

After login, the user is routed into either:

- student dashboard shell
- teacher dashboard shell

The app restores:

- token
- user state
- selected theme
- notification context

### Step 4: User creates or joins a team

The user can:

- discover suggested users
- search for users
- send connection requests
- accept/decline requests
- create a team
- invite members
- view peer team data

### Step 5: User creates a project

Project creation includes:

- project name
- description
- start date
- deadline
- team
- optional tags
- grading criteria
- optional mentor assignment

This makes the project both a collaboration space and an evaluable unit.

### Step 6: User creates tasks inside the project

Tasks capture:

- title
- description
- assignee
- project link
- estimated time
- deadline
- priority

Tasks can later be:

- updated
- reassigned
- status-changed
- proof-backed
- commented on
- inspected in detail

### Step 7: Team members work and upload proof

For accountability, users can upload proof files to tasks. The backend accepts a broad set of file types:

- images
- PDFs
- Word/Excel/PowerPoint files
- text/code files
- zip/rar archives

Those uploads feed directly into task validity and risk assessment logic.

### Step 8: System computes risk, efficiency, and progress

As tasks evolve, the app derives:

- completion/progress
- efficiency
- overdue state
- proof compliance
- risk score
- manual review flags
- project health

This is one of the core differentiators of PeerCheck compared to a basic task board.

### Step 9: Team members review one another

Users can submit peer reviews by scoring teammates on:

- contribution
- collaboration
- quality
- punctuality

These scores affect:

- per-member peer review summaries
- normalized peer scores
- free-rider detection
- overall grading calculations
- productivity summaries

### Step 10: Teacher reviews the project

A teacher can assess:

- technical execution
- task validity
- time authenticity
- teamwork
- documentation quality

They can also assign contribution scores per member.

### Step 11: System produces health and productivity views

From the user perspective, PeerCheck becomes a monitoring dashboard showing:

- who is contributing
- which tasks are at risk
- which projects are healthy or unhealthy
- whether work is backed by proof
- whether deadlines are being met
- how fairly work is distributed

### Step 12: Admin/governance visibility

For the organization, admins can view:

- authentication/security activity
- platform health
- user statuses
- destructive data history
- behavioral patterns

That makes PeerCheck useful not just for students, but for instructors, mentors, and institutional oversight.

---

## 11. Core Calculations and How Data Is Derived

This is one of the most important parts of the system.

## 11.1 Task Status Weighting

Task/project progress is not binary. It uses weighted status scoring:

- `not_started` = 0
- `paused` = 0.3
- `active` = 0.5
- `completed` = 1

Project progress is:

`sum(task status weights) / total task count * 100`

This gives a more realistic progress percentage than only counting completed tasks.

## 11.2 Task Efficiency

Task efficiency is based on:

- `totalFocusTime`
- `estimatedTime`

Typical formula:

`focusTime / estimatedTime * 100`

Interpretation in project/task metrics includes labels like:

- rushed/suspicious
- below ideal
- ideal
- slightly padded
- padded time

This makes time authenticity a first-class metric in the app.

## 11.3 Task Risk Logic

Task risk is derived from flags such as:

- padded time
- rushed completion
- no proof
- overdue
- not started near deadline
- near deadline

The controller builds a risk score by adding points for suspicious states. It then maps the result to levels like:

- low
- medium
- high
- critical

This risk model is one of the app’s fraud/integrity detection layers.

## 11.4 Project Time Efficiency

Project-level efficiency aggregates task estimated time and focus time:

`sum(totalFocusTime) / sum(totalEstimatedTime) * 100`

Then it labels the result as:

- underworked
- on track
- overreported
- severely overreported

## 11.5 Proof Compliance

Project proof compliance is:

`tasks with at least one proof upload / total tasks * 100`

This is a direct indicator of how much of the team’s claimed work is supported by evidence.

## 11.6 Contributor Fairness

Contributor fairness computes per-team-member stats such as:

- assigned task count
- completed task count
- assigned percentage
- completed percentage
- free-rider flag

Potential free-rider behavior is flagged when a user is assigned work but completes none in a sufficiently sized project.

## 11.7 Deadline Health

Project deadline health tracks:

- overdue task count
- overdue rate
- upcoming deadlines

Overdue rate is:

`overdue tasks / total tasks * 100`

## 11.8 Project Health Score

The backend combines several dimensions into a single project health score:

- progress: 40%
- risk-adjusted score: 30%
- proof compliance: 20%
- deadline-adjusted score: 10%

So health is not a vague label. It is a weighted composite metric.

The health categories are:

- excellent
- good
- needs attention
- critical

## 11.9 Peer Review Score Aggregation

Peer reviews use four criteria:

- contribution
- collaboration
- quality
- punctuality

For each submitted peer review:

- the system averages the four values into `totalScore`

For each member:

- the system averages all received `totalScore` values
- normalizes the 1-5 score to a 0-100 score

This creates:

- average peer score
- normalized peer score
- review count
- project peer average

## 11.10 Free-Rider Detection

Free-rider detection combines:

- peer score
- completed tasks

Current logic flags a free rider when:

- peer score is low
- and completed tasks are zero

The result is saved into project metrics for teacher/admin visibility.

## 11.11 Grade Calculation

Final grade calculation combines:

- task completion score
- peer review score
- teacher review score

Default weights seen in code:

- task completion: 40
- peer review: 30
- teacher review: 30

The sum must equal 100.

Each member gets:

- sub-scores
- weight summary
- final numeric grade
- letter grade

## 11.12 User Productivity

User productivity is one of the most advanced calculations in the app.

It aggregates:

- assigned tasks
- completed tasks
- total focus time
- task efficiency
- average risk
- on-time completion rate
- peer review score
- collaboration score
- project evaluation score
- project contribution history

The overall productivity score is weighted as:

- task efficiency: 40%
- peer reviews: 30%
- project evaluations: 20%
- on-time rate: 10%

This creates a per-user performance profile, not just a simple activity counter.

---

## 12. Data Collection: What the System Actually Collects

From the current codebase, the app collects or derives the following categories of data.

## 12.1 Identity and Access Data

- name
- username
- email
- password hash
- date of birth
- role
- account status
- reset token/expiry
- login logs
- online status

## 12.2 Profile Data

- bio
- avatar
- skills
- institution
- course
- year

## 12.3 Team/Connection Data

- sent/received connection requests
- accepted connections
- team membership
- team creator
- project-team relationships

## 12.4 Project Data

- name
- description
- start date
- deadline
- status
- tags
- team association
- grading criteria
- toolkit
- metrics

## 12.5 Task Data

- title
- description
- project association
- assignee
- assigner
- estimated time
- total focus time
- deadline
- end date
- status
- proof uploads
- assignment history
- per-task metrics
- per-user progress
- activity history

## 12.6 Evaluation Data

- peer review criteria scores
- peer review comments
- teacher rubric scores
- teacher/member contribution scores
- suspicion flags
- final scores

## 12.7 Notification and Audit Data

- notifications
- deleted task history
- deleted project history
- edited task history
- login attempts
- password reset records

## 12.8 UX State / Guidance Data

- tour guide completion flags
- saved theme name in localStorage

---

## 13. Backend API Surface by Capability

This is the practical route-level view.

## 13.1 Auth

Via `server/routes/authRoutes.js`:

- register
- login
- forgot password
- reset password
- logout
- basic public/home data

## 13.2 User Area

Via `server/routes/userRoutes.js`:

- dashboard stats
- productivity
- profile fetch/update
- avatar upload
- mentor fetch
- task CRUD
- task filtering
- task details
- task status update
- task assignment/reassignment
- task activity logs
- proof upload/download/delete
- peer connection requests
- team CRUD and invitations
- user discovery and search
- tour completion tracking
- nested notification routes
- nested comment routes

## 13.3 Projects

Via `server/routes/projectRoutes.js`:

- create project
- list projects
- search projects
- get/update/delete a project
- get project metrics
- refresh project metrics
- contributor analytics
- task metrics per task
- submit project evaluation
- read member evaluation summaries
- delete evaluation

## 13.4 Peer Review

Via `server/routes/peerReviewRoutes.js`:

- submit peer review
- get project peer reviews
- aggregate project peer scores
- get own peer score
- check if review can be submitted
- lock peer reviews
- calculate grades
- check completion state

## 13.5 Teacher

Via `server/routes/teacherRoutes.js`:

- get monitored projects
- get monitored teams
- teacher dashboard
- teacher analytics
- submit/update/delete evaluation

## 13.6 Admin

Via `server/routes/adminRoutes.js`:

- security stats
- login logs
- failed logins
- password resets
- user data
- user status changes
- activity summary
- deleted projects
- deleted tasks
- edited tasks history
- project stats
- performance analytics
- system stats

## 13.7 Notifications

Via `server/routes/notificationRoutes.js`:

- list notifications
- notification stats
- mark one read
- mark all read
- delete one
- clear all

## 13.8 Comments

Via `server/routes/commentRoutes.js`:

- create comment
- get task comments
- count comments
- update/delete comment

## 13.9 Sticky Notes

Via `server/routes/stickyNoteRoutes.js`:

- create
- get project notes
- update
- delete
- pin/unpin
- move
- reorder

## 13.10 Todos

Via `server/routes/todoRoutes.js`:

- list
- stats
- create
- update
- delete
- toggle
- bulk update
- quick add

---

## 14. How Files Connect to Each Other

This section explains the real dependency chain.

## 14.1 Frontend Request Flow

Example path for a logged-in user opening tasks:

1. `App.jsx` routes the user into `/user-app/tasks`
2. `UserApp.jsx` provides the dashboard shell
3. `Tasks.jsx` renders the tasks page
4. `useTasks.js` performs data fetching and state logic
5. `axiosClient.js` sends request to backend
6. backend route `/api/user/tasks/all` in `userRoutes.js`
7. route calls `taskController.getAllTasks`
8. controller loads `Task` documents from MongoDB
9. controller enriches tasks with metrics
10. JSON returns to frontend
11. task rows/details components render results

That is the standard pattern throughout the app.

## 14.2 Authentication Flow

1. `Login.jsx` or signup components collect credentials
2. `axiosClient` sends request to `/api/auth/login` or `/api/auth/register`
3. `authRoutes.js` dispatches `authControllers.js`
4. `authControllers.js` talks to `User`, `PasswordReset`, `login_logs`, and `TourGuideInfo`
5. JWT is returned on successful login
6. frontend stores token in `localStorage`
7. `ProtectedRoute` and `axiosClient` use it on subsequent requests

## 14.3 Project Creation Flow

1. `Projects.jsx` gathers project form data
2. frontend calls `POST /api/projects`
3. `projectRoutes.js` calls `createProject`
4. controller validates required fields
5. controller checks the selected team in `peergroup_log.js`
6. controller creates a `Project`
7. initial metrics structure is seeded
8. frontend refreshes the project list/UI

## 14.4 Task Tracking Flow

1. user creates/edits a task in project UI
2. backend stores task in `tasks.js`
3. task updates may change:
   - status
   - assignment history
   - end date
   - proof uploads
   - metrics
4. controller may recalculate project metrics via `updateProjectMetricsInDB`
5. notifications may be generated
6. user productivity may be updated

## 14.5 Proof Upload Flow

1. frontend opens `UploadProofModal.jsx`
2. form sends file to `/api/user/task/:taskId/proof`
3. `multer` processes file in memory
4. backend uses R2 client to store the file externally
5. metadata is saved inside task `proofUploads`
6. task/project metrics can later use proof presence in compliance/risk calculations

## 14.6 Notification Flow

1. action occurs, such as task assignment or proof upload
2. feature controller calls helper from `notificationController.js`
3. `Notification` record is stored in MongoDB
4. frontend `NotificationProvider` polls every 30 seconds
5. UI updates unread count and notification lists

## 14.7 Peer Review Flow

1. frontend `PeerReviewTab.jsx` and `usePeerReview.js` gather input
2. user submits scores/comments
3. backend validates project membership and self-review prevention
4. `PeerReview` document is created or updated
5. project peer metrics are recalculated
6. free-rider detection runs
7. frontend can fetch personal score, project aggregates, and completion state

## 14.8 Teacher Evaluation Flow

1. teacher opens teacher dashboard/feedback area
2. frontend calls teacher and project endpoints
3. teacher submits rubric and member evaluations
4. backend stores `ProjectEvaluation`
5. evaluation data contributes to user productivity and project-level interpretation

---

## 15. Frontend File Organization in Practical Terms

### Core app shell

- `src/main.jsx`
- `src/App.jsx`
- `src/index.css`
- `src/App.css`

### API and utilities

- `src/api/axiosClient.js`
- `src/utils/auth.js`
- `src/utils/user.js`
- `src/utils/taskUtils.js`
- `src/utils/dashboardUtils.js`
- `src/utils/peerReviewUtils.js`
- `src/utils/themeUtils.js`
- `src/utils/activityHelpers.js`

### State/context

- `src/contexts/NotificationContext.jsx`

### Hooks

- `src/hooks/useTasks.js`
- `src/hooks/useMyProjects.jsx`
- `src/hooks/usePeerReview.js`
- `src/hooks/useDashboardData.js`
- `src/hooks/useGeneralUIlogic.js`
- `src/hooks/useInView.js`
- `src/hooks/use-mobile.ts`

### Major component buckets

- `Login/`
- `user-dashboard/`
- `teacher-dashboard/`
- `AdminComponents/`
- `Notifications/`
- `ThemesComponents/`

This is a feature-oriented component tree rather than a purely atomic design system.

---

## 16. Backend File Organization in Practical Terms

### Bootstrapping/config

- `server/server.js`
- `server/mongodbConnectivity.js`
- `server/r2Client.js`

### Middleware

- `middleware/authMiddleware.js`
- `middleware/uploadMiddleware.js`

### Routes

- one file per major API area

### Controllers

- one controller per major feature domain

### Models

- one Mongoose model per collection or audit structure

This is a conventional and understandable backend layout for scaling feature-by-feature.

---

## 17. Dependency Inventory

This section lists external modules and how they fit.

## 17.1 Root Dependencies

### Used for project orchestration

- `concurrently`

### Present at root but conceptually app-related

- `mongodb`
- `@tailwindcss/vite`
- `@tanstack/react-table`
- `tailwindcss`

## 17.2 Frontend Dependencies

### Core SPA/UI

- `react`
- `react-dom`
- `react-router-dom`
- `axios`

### UI system

- `@mui/material`
- `@mui/icons-material`
- `@mui/system`
- `@emotion/react`
- `@emotion/styled`

### Styling and motion

- `tailwindcss`
- `@tailwindcss/vite`
- `framer-motion`
- `tw-animate-css`
- `tailwind-merge`

### Charts/analytics

- `chart.js`
- `react-chartjs-2`
- `recharts`

### Interaction/support

- `notistack`
- `react-intersection-observer`
- `shepherd.js`
- `date-fns`

### Rich text and UI primitives

- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-highlight`
- `@tiptap/extension-placeholder`
- `@tiptap/extension-underline`
- Radix dialog/select/tooltip/dropdown/tabs/avatar/etc.

### Icons/fonts

- `@phosphor-icons/react`
- `@tabler/icons-react`
- `react-icons`
- `@fontsource/inter`
- `@fontsource/roboto`
- `@fontsource/alkatra`
- `@fontsource/adlam-display`

### Installed but not clearly evidenced in scanned active usage

- `socket.io-client`
- `shadcn`

They may be reserved for future or less central flows.

## 17.3 Backend Dependencies

### Core backend

- `express`
- `mongoose`
- `cors`
- `dotenv`

### Auth/security

- `bcryptjs`
- `jsonwebtoken`

### File and external service handling

- `multer`
- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`
- `nodemailer`

### Scheduling/time

- `node-cron`

### Installed but not clearly evidenced as core active runtime in scanned flows

- `exceljs`
- `dayjs`
- `socket.io`

---

## 18. Notable Design Strengths

The codebase shows several strong product ideas:

- the app blends project management with evidence-backed accountability
- project metrics are derived, not only manually entered
- peer review and teacher review are both first-class
- risk analysis is integrated into normal task/project flows
- there is governance visibility for admins
- the architecture is understandable and modular

From a product positioning perspective, this is stronger than a plain class project tracker because it actively tries to measure authenticity, contribution, and fairness.

---

## 19. Notable Technical Observations

These are not criticisms for a client demo. They are architecture observations from the current code.

- The repo is structured for deployment, but named hosting providers are not committed in infra config.
- Notifications are currently polled from the frontend every 30 seconds rather than clearly delivered through live sockets.
- `socket.io` is installed on both sides, but a full live socket server/client integration is not visible in the scanned runtime path.
- The app stores auth state in `localStorage`, which is common for SPAs but has different tradeoffs than httpOnly cookie auth.
- There is no visible automated test suite in the root or package scripts scanned here.
- Some controllers and components are very large, which means business logic is powerful but concentrated in big files.

---

## 20. Final Architecture Summary

PeerCheck is a multi-role full-stack web platform built to verify and manage collaborative work.

At the technical level, it consists of:

- a React + Vite frontend
- an Express + Mongoose backend
- MongoDB Atlas with local fallback
- Cloudflare R2 for object/file storage
- Gmail SMTP for password reset emails
- environment-driven API/frontend URLs for deployment flexibility

At the product level, it offers:

- user auth and profiles
- team creation and peer networking
- project creation and tracking
- task assignment and lifecycle management
- proof-of-work uploads
- comments and notifications
- sticky notes and todos
- peer review
- teacher evaluation
- project health and fraud-risk style metrics
- user productivity scoring
- teacher monitoring dashboards
- admin security/performance governance panels

At the code-connection level, the repository follows a clean request pipeline:

- frontend component/hook
- axios client
- Express route
- controller
- Mongoose model
- MongoDB persistence
- optional notification/storage/email side effect

That means PeerCheck is already more than a UI prototype. It is a feature-complete application architecture aimed at collaboration accountability, educational project oversight, and measurable contribution tracking.
