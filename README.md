# Hotel and Restaurant Reservation System

Built with React, Tailwind CSS, Node.js, Express, PostgreSQL, and pgAdmin 4.

## Requirements

Install:

- [Node.js 22 LTS](https://nodejs.org/)
- [PostgreSQL with pgAdmin 4](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads) when using the clone method

## Get the Project

### Clone with Git

Copy the HTTPS URL from the GitHub **Code** button, then run:

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd "Hotel and Restaurant Reservation System Project"
```

Replace the sample URL with the real GitHub repository URL.

### Download ZIP

1. Open the repository on GitHub.
2. Select **Code > Download ZIP**.
3. Extract the ZIP file.
4. Open the extracted folder in Visual Studio Code.

## Install Dependencies

In a terminal opened at the project root, run:

```bash
cd frontend
npm install
cd ../backend
npm install
cd ..
```

## Set Up the Database with pgAdmin 4

Every group member creates a separate local database by following the same instructions.

### 1. Create the database

1. Open **pgAdmin 4**.
2. Connect to the local PostgreSQL server.
3. Expand **Servers > PostgreSQL > Databases**.
4. Right-click **Databases** and select **Create > Database**.
5. Enter `hotel_restaurant` as the database name.
6. Keep `postgres` as the owner and select **Save**.

### 2. Create the tables

1. Select the new `hotel_restaurant` database.
2. Open **Tools > Query Tool**.
3. Select the **Open File** folder icon.
4. Open:

```text
database/migrations/001_initial_schema.sql
```

5. Select **Execute Script** or press **F5**.
6. Confirm that the Data Output shows:

```text
restaurant_tables
rooms
users
```

The migration creates the three tables, their validation rules, and required indexes.

### 3. Add sample data (optional)

Skip this step when empty tables are preferred.

1. Keep the `hotel_restaurant` Query Tool open.
2. Select **Open File**.
3. Open:

```text
database/seeds/001_sample_data.sql
```

4. Select **Execute Script** or press **F5**.

The Data Output should report six rooms and five restaurant tables. No sample user or password is added.

### 4. View the tables

In pgAdmin's Object Explorer, expand:

```text
hotel_restaurant
└── Schemas
    └── public
        └── Tables
```

Right-click **Tables** and select **Refresh** if the tables are not immediately visible.

To list them in the Query Tool, run:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Configure the Backend Connection

From the project root, create a private environment file.

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
