# Setup Guide - Digital Municipality System

## Prerequisites
- Node.js 18+
- MySQL (Optional, defaults to SQLite if DB_DIALECT is not set)

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your secrets.
4. Run migrations/seeders:
   (The system auto-syncs the database and runs seeders on first start in non-production mode).

## Running the Application

### Development Mode
Runs both the Express backend and Vite frontend with hot reloading.
```bash
npm run dev
```

### Production Build
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the server (ensure NODE_ENV=production):
   ```bash
   NODE_ENV=production npm start
   ```

## Testing

### Backend Tests (Jest)
```bash
npm run test:backend
```

### Frontend Tests (Vitest)
```bash
npm run test:frontend
```

### All Tests
```bash
npm run test
```

## Admin Credentials (Seeded)
- **Email:** `admin@municipality.gov`
- **Password:** `AdminPassword123`

## Citizen Credentials (Seeded)
- **Email:** `citizen@example.com`
- **Password:** `CitizenPassword123`
