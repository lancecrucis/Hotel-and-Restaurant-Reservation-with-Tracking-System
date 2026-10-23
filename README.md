# Hotel and Restaurant Reservation System

Built with React, Tailwind CSS, Node.js, Express, PostgreSQL, and pgAdmin 4.

## Requirements

Install:

- [Node.js 22 LTS](https://nodejs.org/)
- [PostgreSQL with pgAdmin 4](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads) when using the clone method

## Get the Project

### Clone with Git

Open PowerShell or a terminal and run:

```bash
git clone https://github.com/lancecrucis/Hotel-and-Restaurant-Reservation-with-Tracking-System.git
cd Hotel-and-Restaurant-Reservation-with-Tracking-System
```

### Download ZIP

1. Open the repository on GitHub.
2. Select **Code > Download ZIP**.
3. Extract the ZIP file.
4. Open the extracted folder in Visual Studio Code.

## Install Dependencies

From the project root, run one command:

```bash
npm run setup
```

This installs both the frontend and backend dependencies. If the project is already running, stop the frontend and backend first before running setup again.

## Automatic Database Setup

The backend now creates the local database, tables, indexes, notification trigger, and sample room/table data automatically when it starts.

You only need:

1. Install PostgreSQL and pgAdmin 4.
2. Make sure the PostgreSQL server is running.
3. Copy `backend/.env.example` to `backend/.env` and enter your PostgreSQL password.
4. Start the backend using the command below.

The PostgreSQL user must have permission to create databases. The default local `postgres` user normally has this permission.

If automatic database creation is not allowed, create an empty database named `hotel_restaurant` in pgAdmin once, then start the backend again. It will still create all tables and sample data automatically.

The automatic setup uses these files internally:

```text
database/migrations/
database/seeds/001_sample_data.sql
```

To disable automatic database creation or sample data, set these values in `backend/.env`:

```env
AUTO_CREATE_DATABASE=false
AUTO_SEED=false
```

To see the tables in pgAdmin, expand:

```text
hotel_restaurant
└── Schemas
    └── public
        └── Tables
```

Right-click **Tables** and select **Refresh** if needed.

## Configure the Backend Connection

From the project root, create a private environment file if you have not already done so.

Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

macOS or Linux:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and replace `YOUR_PASSWORD` with the PostgreSQL password used in pgAdmin:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hotel_restaurant
```

Never upload `backend/.env` to GitHub. Every member uses their own local PostgreSQL password.

## Run the Project

Start the backend:

```bash
cd backend
npm run dev
```

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Backend health check:

```text
http://localhost:5000/api/v1/health
```

Frontend:

```text
http://localhost:5173
```
