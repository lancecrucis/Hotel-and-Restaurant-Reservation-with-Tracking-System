# Hotel and Restaurant Reservation System

A group project for building three main parts of a hotel and restaurant reservation system:

- Login and customer registration
- Hotel room browsing and availability search
- Restaurant table browsing and availability search

## Technology Stack

- **Frontend:** React, TypeScript, Vite, and Tailwind CSS
- **Backend:** Node.js and Express.js
- **Database:** PostgreSQL

## Project Status

This repository contains the shared project structure and the first PostgreSQL schema for users, hotel rooms, and restaurant tables. Each group member should implement their assigned feature inside the existing folders. The frontend Tailwind test page already builds successfully, while the backend server, API routes, and feature screens still need to be implemented.

## Team Responsibilities

### Kath — Login and Registration

Frontend folder:

```text
frontend/src/features/LoginAndRegister/
```

Backend folder:

```text
backend/src/modules/auth/
```

Endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Jesus — Hotel Rooms

Frontend folder:

```text
frontend/src/features/HotelScreen/
```

Backend folder:

```text
backend/src/modules/hotel/
```

Endpoints:

```text
GET /api/v1/rooms
GET /api/v1/rooms/available
GET /api/v1/rooms/:roomId
```

Register `/available` before `/:roomId` in the Express router so that `available` is not interpreted as a room ID.

### Redgie — Restaurant Tables

Frontend folder:

```text
frontend/src/features/RestaurantScreen/
```

Backend folder:

```text
backend/src/modules/restaurant/
```

Endpoints:

```text
GET /api/v1/restaurant/tables
GET /api/v1/restaurant/tables/available
GET /api/v1/restaurant/tables/:tableId
```

Register `/available` before `/:tableId` in the Express router.

### Project Lead — Shared Integration

The project lead should manage the shared files below to reduce merge conflicts:

```text
frontend/src/App.tsx
frontend/src/app/router.tsx
frontend/src/services/api.ts
backend/src/app.js
backend/src/server.js
backend/src/config/database.js
README.md
```

The project lead should also coordinate the PostgreSQL schema, environment variables, and final integration of the three features.

## Prerequisites

Install the following before setting up the project:

- [Node.js](https://nodejs.org/) 22 LTS or newer
- npm, which is included with Node.js
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads), only if using the clone method
- A code editor such as [Visual Studio Code](https://code.visualstudio.com/)

Verify the installations:

```bash
node --version
npm --version
psql --version
```

## Get the Project

Choose either the Git clone method or the Download ZIP method.

### Method 1: Clone with Git

1. Open the repository on GitHub.
2. Select **Code** and copy the HTTPS URL.
3. Open a terminal in the folder where you want to keep the project.
4. Run the following commands, replacing the sample URL with the repository URL:

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd "Hotel and Restaurant Reservation System Project"
```

If GitHub gives the downloaded folder a different name, use that folder name in the `cd` command.

### Method 2: Download ZIP

1. Open the repository on GitHub.
2. Select **Code**.
3. Select **Download ZIP**.
4. Extract the downloaded ZIP file.
5. Open the extracted project folder in Visual Studio Code.
6. In Visual Studio Code, select **Terminal > New Terminal**.

The ZIP does not include Git history. Use the clone method if you need to create branches, pull updates, and submit work through GitHub.

## Install the Dependencies

The frontend and backend are separate Node.js projects, so install both sets of dependencies.

From the project root, install the frontend dependencies:

```bash
cd frontend
npm install
```

Return to the project root and install the backend dependencies:

```bash
cd ../backend
npm install
```

Do not copy or upload `node_modules`. Each teammate should generate it by running `npm install`.

## Run the Frontend

From the `frontend` folder:

```bash
npm run dev
```

Open the local address printed in the terminal, normally:

```text
http://localhost:5173
```

Useful frontend commands:

```bash
npm run lint
npm run build
npm run preview
```

## Run the Backend

The backend entry files are currently empty scaffolds. After the shared Express server and backend scripts are implemented, the project lead should add and document commands such as:

```bash
npm run dev
npm start
```

Until that setup is completed, installing the backend dependencies is sufficient for initial feature development. Do not assume that the backend is running just because `npm install` succeeds.

## Environment Variables

Never commit real passwords, database URLs, or token secrets. Environment files are ignored by Git.

Copy the committed environment template before starting backend development:

```bash
cd backend
cp .env.example .env
```

Windows PowerShell users can run:

```powershell
Copy-Item .env.example .env
```

The local file contains values similar to:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hotel_restaurant
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_a_private_random_value
DATABASE_SSL=false
```

Each teammate can copy that example to `backend/.env` and enter their own local PostgreSQL password. The real `.env` file must not be uploaded to GitHub.

The frontend may also use a local `frontend/.env` value such as:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## PostgreSQL Setup

The committed database currently contains:

```text
users
rooms
restaurant_tables
```

From the project root, create and populate the local database:

```bash
createdb -U postgres hotel_restaurant
psql -U postgres -d hotel_restaurant -f database/migrations/001_initial_schema.sql
psql -U postgres -d hotel_restaurant -f database/seeds/001_sample_data.sql
```

PostgreSQL will ask for the password selected during installation. Afterward, copy `backend/.env.example` to `backend/.env` and replace `YOUR_PASSWORD` in `DATABASE_URL` with that password.

If `createdb` or `psql` is not recognized, add PostgreSQL's `bin` directory to the system PATH or run the same SQL files through pgAdmin's Query Tool. Apply the migration before the seed file.

The migration is safe to run more than once, and the seed file updates matching room and table numbers instead of creating duplicates. It intentionally does not create a sample user because authentication must store a securely generated password hash.

Reservation tables will be added later. Until then, the availability endpoints can filter by capacity and the current `status` value; they cannot calculate availability for specific dates or times.

## Recommended Git Workflow

Download ZIP is suitable for viewing the project, but contributors should preferably clone the repository and use feature branches.

Before starting work:

```bash
git switch main
git pull
git switch -c feature/short-feature-name
```

Examples:

```text
feature/auth-pages
feature/hotel-screen
feature/restaurant-screen
```

After completing a small piece of work:

```bash
git add .
git commit -m "Add hotel room list screen"
git push -u origin feature/hotel-screen
```

Then open a pull request on GitHub. Avoid committing directly to `main`, and pull the latest changes before beginning new work.

## Folder Structure

```text
Hotel and Restaurant Reservation System Project/
├── backend/
│   └── src/
│       ├── config/
│       ├── middleware/
│       └── modules/
│           ├── auth/
│           ├── hotel/
│           └── restaurant/
├── database/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seeds/
│       └── 001_sample_data.sql
├── frontend/
│   └── src/
│       ├── app/
│       ├── features/
│       │   ├── HotelScreen/
│       │   ├── LoginAndRegister/
│       │   └── RestaurantScreen/
│       └── services/
└── README.md
```

## Before Merging a Feature

- Keep feature-specific code inside the assigned feature/module folder.
- Coordinate before changing shared integration files.
- Do not commit `.env`, passwords, secrets, `node_modules`, or build output.
- Confirm that API request and response formats match the agreed endpoint definitions in this README.
- Run `npm run lint` and `npm run build` in `frontend`.
- Test the affected API endpoints once the backend test setup is available.

