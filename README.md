# Pet Connect - Full Project Context

This file is a complete context handoff for the Pet Connect MERN project.
Use it as a single source of truth when discussing this codebase with another LLM.

## 1) Project Overview

Pet Connect is a full-stack pet platform with:

- User authentication (signup, login, JWT-based sessions)
- Buy/Adopt listings
- Rent-a-Friend listings
- Stray feed reports
- Vet appointment booking

Stack:

- Frontend: React 19, Vite, React Router, Tailwind
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Containers: Docker + Docker Compose

## 2) Monorepo Structure

- client: React frontend
- server: Express API
- docker-compose.yml: runs mongo + backend + frontend
- .env: compose environment values

Important frontend files:

- client/src/context/AuthContext.jsx
- client/src/pages/Signup.jsx
- client/src/pages/Login.jsx
- client/src/components/Navbar.jsx
- client/src/components/ProtectedRoute.jsx
- client/src/main.jsx
- client/src/App.jsx

Important backend files:

- server/server.js
- server/routes/auth.js
- server/routes/pets.js
- server/routes/strays.js
- server/routes/vets.js
- server/controllers/authController.js
- server/controllers/petController.js
- server/controllers/strayController.js
- server/controllers/vetController.js
- server/middleware/auth.js
- server/models/User.js
- server/models/Pet.js
- server/models/StrayReport.js
- server/models/Appointment.js

## 3) Runtime Architecture

Services and ports:

- Frontend container: localhost:3001 (default)
- Backend container: localhost:5000
- Mongo container: localhost:27017

Data flow:

1. Browser loads frontend from nginx on port 3001 by default.
2. Frontend calls backend REST API at http://localhost:5000.
3. Backend uses MongoDB at mongodb://mongo:27017/petconnect inside Docker network.

## 4) Authentication Flow

Auth is managed globally in client/src/context/AuthContext.jsx.

State stored:

- user object (includes firstName derived from name if needed)
- token (JWT)

Persistent keys in localStorage:

- pet_connect_user
- pet_connect_token

Context functions:

- signup(formData)
- login(credentials)
- logout()

Signup API behavior:

- Primary endpoint: POST /api/auth/signup
- Compatibility fallback: POST /api/auth/register

Login API behavior:

- Endpoint: POST /api/auth/login

Logout behavior:

- Clears React auth state
- Removes token and user from localStorage

## 5) Frontend Auth Integration

Signup page:

- Validates fields
- Sends API request through AuthContext.signup
- Shows backend error message on failure
- Redirects to home on success

Login page:

- Validates fields
- Sends API request through AuthContext.login
- Shows backend error message on failure
- Redirects to home on success

Navbar behavior:

- Logged out: shows Log In and Sign Up buttons
- Logged in: shows "Welcome, <firstName>" and Logout button

Protected route helper:

- client/src/components/ProtectedRoute.jsx
- Redirects unauthenticated users to /login
- Preserves original route in router state

## 6) Backend API Summary

Base URL: http://localhost:5000

Health:

- GET /api/health

Auth:

- POST /api/auth/signup
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (Bearer token required)

Pets:

- GET /api/pets
  - Query options: status, species, sort, page, limit
- GET /api/pets/:id
- POST /api/pets (Bearer token required)

Strays:

- GET /api/strays
  - Query options: type, page, limit
- GET /api/strays/:id
- POST /api/strays (Bearer token required)

Vets:

- POST /api/vets/book (Bearer token required)
- GET /api/vets/appointments (Bearer token required)
- PATCH /api/vets/appointments/:id/cancel (Bearer token required)

## 7) Request and Response Notes

Auth signup request body used by frontend:

- name (constructed from firstName + lastName)
- email
- password
- role (owner or lover)

Auth success response shape:

- message
- token
- user

Authenticated endpoints require header:

- Authorization: Bearer <token>

## 8) Data Models

User:

- name, email, password, role

Pet:

- name, species, breed, age, status, price, description, imageURL, owner

StrayReport:

- type, title, description, location, reportedBy, resolved, helpersCount

Appointment:

- user, vetName, petName, date, time, status, notes

## 9) Docker Setup and Commands

Prerequisite:

- Docker Desktop installed and running

Start all services:

```bash
docker compose up --build -d
```

Check service status:

```bash
docker compose ps
```

Check logs:

```bash
docker compose logs -f
```

Stop services:

```bash
docker compose down
```

Stop and remove database volume (fresh DB):

```bash
docker compose down -v
```

Rebuild after code changes:

```bash
docker compose up --build -d
```

## 10) Environment Variables

Root .env is used by docker compose.
Current values:

- JWT_SECRET
- JWT_EXPIRES_IN

Backend container env from compose:

- PORT=5000
- NODE_ENV=production
- MONGO_URI=mongodb://mongo:27017/petconnect
- CLIENT_URL=http://localhost:3001

Docker port override option:

- FRONTEND_PORT controls the host port for the frontend container.
- Default is 3001 to avoid host conflicts on 3000.

## 11) Local Development (Without Docker)

Frontend:

- cd client
- npm install
- npm run dev

Backend:

- cd server
- npm install
- npm run dev

MongoDB would be required locally for this mode.

## 12) Current Status Snapshot

Done:

- AuthContext implemented and wired globally
- Signup and Login use real backend API
- Error handling shown in UI for auth failures
- Navbar reflects login state and supports logout
- ProtectedRoute component added
- Backend supports both /api/auth/signup and /api/auth/register
- Client production build passing

## 13) Prompt Template for Other LLMs

You can paste this:

"Use README.md as source of truth. This is a MERN monorepo named Pet Connect.
Please propose and implement changes incrementally.
Do not break Docker Compose setup.
If touching auth, preserve AuthContext localStorage keys:
pet_connect_user and pet_connect_token.
When adding protected pages, use ProtectedRoute.
Return file-by-file diffs and verification steps."
