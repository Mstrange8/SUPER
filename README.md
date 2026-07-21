# Sanpete Pickleball Website

A community website for pickleball players in Sanpete County, Utah. Connect with other players, find courts, stay updated on events, and engage with the local pickleball community.

## Features

- 🏓 **Events Calendar**: View upcoming tournaments, leagues, fundraisers, and social events with color-coded categories
- 🏛️ **Court Directory**: Find pickleball courts in Sanpete County with interactive maps and detailed information
- 📚 **Resources**: Access recommended brands, articles, and helpful pickleball content
- 💬 **Discussion Groups**: Connect with other players, share news, and participate in community discussions
- 💰 **Donations**: Support the local pickleball community through secure Stripe donations

## Tech Stack

### Backend
- Hono
- TypeScript
- PostgreSQL database
- JWT authentication
- Stripe payment integration

### Frontend
- Vue.js 3 with TypeScript
- Vue Router for navigation
- Pinia for state management
- FullCalendar.js for event display
- Axios for API calls

### Hosting
- Hosted on Cloudflare
- Frontend configured through GitHub
- Backend configured through Wrangler
- Domain is configured through Cloudflare

### Database
- Managed by Neon
- Separate local and production databases

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Stripe account (for donations)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your database credentials and API keys

4. Create the PostgreSQL database:
   ```bash
   createdb sanpete_pickleball
   ```

5. Run database migrations:
   ```bash
   psql -d sanpete_pickleball -f src/database/migrations/001_create_users_table.sql
   psql -d sanpete_pickleball -f src/database/migrations/002_create_events_table.sql
   psql -d sanpete_pickleball -f src/database/migrations/003_create_courts_table.sql
   psql -d sanpete_pickleball -f src/database/migrations/004_create_resources_table.sql
   psql -d sanpete_pickleball -f src/database/migrations/005_create_groups_posts_comments_tables.sql
   ```

6. Start the development server:
   ```bash
   wrangler dev --port 3000
   ```

   The backend will run on http://localhost:3000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your backend API URL and other configurations

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:5173

## Project Structure

```
super/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── database/        # Database connection and migrations
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Vue components
│   │   ├── views/           # Page views
│   │   ├── router/          # Vue Router configuration
│   │   ├── stores/          # Pinia stores
│   │   └── services/        # API service layer
│   └── package.json
└── designs/                 # UI design mockups
```

## User Roles

- **Public Viewers**: Can view events, courts, and resources without an account
- **Registered Users**: Can post and participate in discussion groups
- **Admins/Sub-Admins**: Can create and manage events, courts, and resources

## Deployment

### Frontend Deployment
- Push to Github

### Backend Deployment
- cd backend wrangler deploy

## Development

### Running Tests
```bash
npm test
```
