-- ============================================
-- 2DOOLISTS - DATABASE SETUP
-- ============================================
-- Run this SQL in your Neon dashboard SQL editor
-- (https://console.neon.tech → your project → SQL Editor)
--
-- IMPORTANT: If you already ran the old setup.sql,
-- you should drop the old tables first:
--   DROP TABLE IF EXISTS todos, list_shares, lists, users CASCADE;
-- Then run this entire script.
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#6c5ce7',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- List sharing table
CREATE TABLE IF NOT EXISTS list_shares (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  shared_with_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(10) DEFAULT 'edit' CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, shared_with_id)
);

-- Todos table (now linked to lists, not users directly)
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lists_owner ON lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_list_shares_user ON list_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_list_shares_list ON list_shares(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_list ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_list_completed ON todos(list_id, completed);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
