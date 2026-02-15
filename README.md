# Taskflow — Neon + React Todo App on Netlify

A modern, full-stack todo application with user authentication, built with React, Netlify Functions, and Neon Postgres.

## Features

- User signup/login with hashed passwords (bcrypt) and JWT auth
- Full CRUD for todos with priority levels (low/medium/high)
- Filter by all/active/done
- Inline editing (double-click a task title)
- Progress tracking bar
- Dark theme with modern design
- Fully responsive

## Setup

### 1. Create a Neon Database

1. Go to [console.neon.tech](https://console.neon.tech) and create a free account
2. Create a new project
3. In the **SQL Editor**, paste and run the contents of `setup.sql`
4. Copy your **connection string** (looks like `postgresql://user:pass@host/dbname?sslmode=require`)

### 2. Deploy to Netlify

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Select your repo
4. Build settings should auto-detect from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. Go to **Site settings → Environment variables** and add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |

6. Trigger a redeploy (Deploys → Trigger deploy)

### 3. Done!

Visit your Netlify URL, create an account, and start adding tasks.

## Project Structure

```
├── netlify/
│   └── functions/          # Serverless API endpoints
│       ├── auth-signup.js  # POST - create account
│       ├── auth-login.js   # POST - sign in
│       ├── todos.js        # GET/POST/PUT/DELETE - todo CRUD
│       ├── package.json    # Function dependencies
│       └── utils/
│           └── db.js       # Shared DB + auth helpers
├── public/
│   └── index.html
├── src/
│   ├── api.js              # Frontend API client
│   ├── App.js              # Root component
│   ├── index.js            # Entry point
│   ├── index.css           # Global styles
│   └── components/
│       ├── AuthPage.js     # Login/signup form
│       ├── Dashboard.js    # Main todo interface
│       ├── AddTodo.js      # New task form
│       └── TodoItem.js     # Individual task card
├── setup.sql               # Database schema
├── netlify.toml            # Netlify config
└── package.json
```

## Local Development

```bash
npm install
cd netlify/functions && npm install && cd ../..

# Set env vars
export DATABASE_URL="your-neon-connection-string"
export JWT_SECRET="dev-secret"

# Run with Netlify CLI
npx netlify dev
```

## Tech Stack

- **Frontend:** React 18, CSS (custom dark theme)
- **Backend:** Netlify Functions (serverless)
- **Database:** Neon Postgres (free tier)
- **Auth:** bcryptjs + JSON Web Tokens
