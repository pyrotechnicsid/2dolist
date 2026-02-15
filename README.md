# 2doolists — Organize, Share, and Conquer Your Tasks

A modern, full-stack todo app with multiple lists, sharing, and user authentication. Built with React, Netlify Functions, and Neon Postgres.

## Features

- User signup/login with hashed passwords (bcrypt) and JWT auth
- **Multiple lists** per account with custom colors
- **Share lists** with other users (edit or view-only permissions)
- Shared lists appear in a separate "Shared with me" section
- Full CRUD for todos with priority levels (low/medium/high)
- Filter by all/active/done per list
- Inline editing (double-click a task title)
- Progress tracking bar per list
- Dark theme with modern design
- Fully responsive (sidebar collapses on mobile)

## Setup

### 1. Create a Neon Database

1. Go to [console.neon.tech](https://console.neon.tech) and create a free account
2. Create a new project
3. In the **SQL Editor**, paste and run the contents of `setup.sql`
4. Copy your **connection string** from the Connection Details panel

### 2. Deploy to Netlify

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Select your repo — build settings auto-detect from `netlify.toml`
4. Go to **Site settings → Environment variables** and add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |

5. Trigger a redeploy

### 3. Done!

Visit your Netlify URL, create an account, and start organizing.

## Project Structure

```
├── netlify/
│   └── functions/
│       ├── auth-signup.js   # POST - create account
│       ├── auth-login.js    # POST - sign in
│       ├── lists.js         # GET/POST/PUT/DELETE - list CRUD
│       ├── shares.js        # GET/POST/DELETE - sharing
│       ├── todos.js         # GET/POST/PUT/DELETE - todo CRUD
│       ├── package.json     # Function dependencies
│       └── utils/db.js      # Shared DB + auth helpers
├── public/index.html
├── src/
│   ├── api.js               # Frontend API client
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   └── components/
│       ├── AuthPage.js      # Login/signup
│       ├── Dashboard.js     # Layout with sidebar
│       ├── Sidebar.js       # List management sidebar
│       ├── TodoView.js      # Tasks for selected list
│       ├── AddTodo.js       # New task form
│       ├── TodoItem.js      # Individual task card
│       └── ShareModal.js    # Share list dialog
├── setup.sql                # Database schema
├── netlify.toml
└── package.json
```

## How Sharing Works

- Only list **owners** can share their lists
- Share by entering the other user's email address
- Choose **"Can edit"** (add/toggle/delete tasks) or **"View only"**
- Shared lists appear under "Shared with me" in the recipient's sidebar
- Owners can remove collaborators at any time

## Tech Stack

- **Frontend:** React 18, CSS (custom dark theme)
- **Backend:** Netlify Functions (serverless)
- **Database:** Neon Postgres (free tier)
- **Auth:** bcryptjs + JSON Web Tokens
