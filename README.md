# Hotel and Restaurant Reservation System

Built with React, Tailwind CSS, Node.js, Express, and PostgreSQL.

## Requirements

Install these programs first:

- [Node.js 22 LTS](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads) if you want to clone the repository

Check that they are installed:

```bash
node --version
npm --version
psql --version
```

## Download the Project

### Option 1: Clone with Git

Copy the HTTPS URL from the GitHub **Code** button, then run:

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd "Hotel and Restaurant Reservation System Project"
```

Replace the sample URL with the real repository URL. If the downloaded folder has a different name, use that name in the `cd` command.

### Option 2: Download ZIP

1. Open the repository on GitHub.
2. Select **Code > Download ZIP**.
3. Extract the ZIP file.
4. Open the extracted folder in Visual Studio Code.
5. Select **Terminal > New Terminal**.

## Install Dependencies

Install the frontend packages:

```bash
cd frontend
npm install
```

Install the backend packages:

```bash
cd ../backend
npm install
cd ..
```

Do not upload `node_modules`. Every developer generates it by running `npm install`.

## Set Up PostgreSQL

### 1. Create the database

From the project root, run:

```bash
createdb -U postgres hotel_restaurant
```

Enter the PostgreSQL password selected during installation.

### 2. Create the tables

```bash
psql -U postgres -d hotel_restaurant -f database/migrations/001_initial_schema.sql
```

This creates the following tables:

- `users`
- `rooms`
- `restaurant_tables`

### 3. Add sample data

```bash
psql -U postgres -d hotel_restaurant -f database/seeds/001_sample_data.sql
```

The seed adds sample rooms and restaurant tables. It does not add a sample user or password.

### 4. Create the backend environment file

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

On macOS or Linux:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and replace `YOUR_PASSWORD` with your PostgreSQL password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hotel_restaurant
```

Do not upload the real `.env` file because it contains private information.

## Verify the Database

Open PostgreSQL:

```bash
psql -U postgres -d hotel_restaurant
```

Then run:

```sql
\dt
SELECT * FROM rooms;
SELECT * FROM restaurant_tables;
```

Exit PostgreSQL with:

```sql
\q
```

## Start the Frontend

```bash
cd frontend
npm run dev
```

Open the address displayed in the terminal, normally `http://localhost:5173`.

## If PostgreSQL Commands Are Not Recognized

Add PostgreSQL's `bin` folder to the system PATH, or open pgAdmin and run these files with its Query Tool in this order:

1. `database/migrations/001_initial_schema.sql`
2. `database/seeds/001_sample_data.sql`
