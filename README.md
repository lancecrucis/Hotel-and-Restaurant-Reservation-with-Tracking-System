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

From the project root, run:

```bash
cd frontend
npm ci
cd ../backend
npm ci
cd ..
```

## Set Up the Database with pgAdmin 4

Each group member creates their own local copy of the database. The database files are already included in the `database` folder.

### 1. Create the database

1. Open **pgAdmin 4**.
2. Connect to the local PostgreSQL server.
3. Expand **Servers > PostgreSQL > Databases**.
4. Right-click **Databases** and select **Create > Database**.
5. Enter `hotel_restaurant` as the database name.
6. Keep `postgres` as the owner and select **Save**.

### 2. Create all tables

1. Select the new `hotel_restaurant` database.
2. Open **Tools > Query Tool**.
3. Use **Open File** and execute these files one at a time with **F5**, in this exact order:

```text
database/migrations/001_initial_schema.sql
database/migrations/002_hotel_reservations.sql
database/migrations/003_restaurant_reservations.sql
database/migrations/004_reservation_history_and_notifications.sql
database/migrations/005_payments.sql
```

4. Confirm that the database contains:

```text
restaurant_tables
rooms
users
reservations
hotel_reservations
restaurant_reservations
reservation_status_history
notifications
payments
```

The migration files create the tables, validation rules, relationships, indexes, notifications trigger, and payment table. Run them in order. For a completely fresh setup, create a new empty database first.

### 3. Add sample data

This adds six rooms and five restaurant tables for testing. It does not create a sample user or password.

1. Keep the `hotel_restaurant` Query Tool open.
2. Select **Open File** and open:

```text
database/seeds/001_sample_data.sql
```

3. Press **F5**.

The Data Output should report six rooms and five restaurant tables. The seed is safe to run again because matching room and table numbers are updated instead of duplicated.

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
