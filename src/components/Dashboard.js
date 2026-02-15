import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      const data = await api.getTodos();
      setTodos(data.todos);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = async (title, description, priority) => {
    const data = await api.createTodo(title, description, priority);
    setTodos((prev) => [data.todo, ...prev]);
    setShowAdd(false);
  };

  const handleToggle = async (id, completed) => {
    const data = await api.updateTodo(id, { completed: !completed });
    setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
  };

  const handleUpdate = async (id, updates) => {
    const data = await api.updateTodo(id, updates);
    setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
  };

  const handleDelete = async (id) => {
    await api.deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    done: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-brand">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="dash-brand-text">Taskflow</span>
          </div>
          <div className="dash-user">
            <span className="dash-user-name">{user.displayName}</span>
            <button className="dash-logout" onClick={onLogout} title="Sign out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-content">
          {/* Greeting */}
          <div className="dash-greeting fade-in">
            <h1>
              {greeting()}, <span className="greeting-name">{user.displayName}</span>
            </h1>
            {stats.total > 0 ? (
              <p className="greeting-stats">
                You have <strong>{stats.active}</strong> active {stats.active === 1 ? 'task' : 'tasks'}
                {stats.done > 0 && <> and <strong>{stats.done}</strong> completed</>}
              </p>
            ) : (
              <p className="greeting-stats">No tasks yet — add your first one below</p>
            )}
          </div>

          {/* Stats bar */}
          {stats.total > 0 && (
            <div className="stats-bar fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="stat-progress">
                <div className="stat-progress-fill" style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }} />
              </div>
              <span className="stat-label">{stats.done}/{stats.total} complete</span>
            </div>
          )}

          {/* Toolbar */}
          <div className="dash-toolbar fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="filter-tabs">
              {['all', 'active', 'done'].map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
                  <span className="filter-count">
                    {f === 'all' ? stats.total : f === 'active' ? stats.active : stats.done}
                  </span>
                </button>
              ))}
            </div>

            <button className="add-btn" onClick={() => setShowAdd(!showAdd)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New task
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="slide-down">
              <AddTodo onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
            </div>
          )}

          {/* Todo list */}
          <div className="todo-list">
            {loading ? (
              <div className="todo-skeleton">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-item" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state fade-in">
                <div className="empty-icon">
                  {filter === 'done' ? '🎯' : filter === 'active' ? '🎉' : '📋'}
                </div>
                <p>
                  {filter === 'done'
                    ? 'No completed tasks yet'
                    : filter === 'active'
                    ? 'All tasks completed!'
                    : 'No tasks yet — get started!'}
                </p>
              </div>
            ) : (
              filtered.map((todo, i) => (
                <div key={todo.id} className="fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <TodoItem
                    todo={todo}
                    onToggle={() => handleToggle(todo.id, todo.completed)}
                    onUpdate={(updates) => handleUpdate(todo.id, updates)}
                    onDelete={() => handleDelete(todo.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
