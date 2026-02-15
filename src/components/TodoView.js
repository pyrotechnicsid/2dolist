import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';
import ShareModal from './ShareModal';
import './TodoView.css';

function TodoView({ list, user, onListCountChange }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [permission, setPermission] = useState('owner');

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTodos(list.id);
      setTodos(data.todos);
      setPermission(data.permission);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  }, [list.id]);

  useEffect(() => {
    fetchTodos();
    setFilter('all');
    setShowAdd(false);
  }, [fetchTodos]);

  const canEdit = permission === 'owner' || permission === 'edit';
  const isOwner = permission === 'owner';

  const handleAdd = async (title, description, priority) => {
    const data = await api.createTodo(list.id, title, description, priority);
    setTodos((prev) => [data.todo, ...prev]);
    setShowAdd(false);
    onListCountChange();
  };

  const handleToggle = async (id, completed) => {
    const data = await api.updateTodo(id, { completed: !completed });
    setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
    onListCountChange();
  };

  const handleUpdate = async (id, updates) => {
    const data = await api.updateTodo(id, updates);
    setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
  };

  const handleDelete = async (id) => {
    await api.deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    onListCountChange();
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

  return (
    <div className="todo-view">
      <div className="tv-content">
        {/* List header */}
        <div className="tv-header fade-in">
          <div className="tv-header-left">
            <div className="tv-color-bar" style={{ background: list.color }} />
            <div>
              <h1 className="tv-title">{list.name}</h1>
              {list.permission !== 'owner' && (
                <span className="tv-shared-badge">
                  Shared by {list.owner_name} · {list.permission}
                </span>
              )}
            </div>
          </div>
          {isOwner && (
            <button className="tv-share-btn" onClick={() => setShowShare(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
          )}
        </div>

        {/* Progress */}
        {stats.total > 0 && (
          <div className="tv-stats fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="tv-progress">
              <div className="tv-progress-fill" style={{ width: `${(stats.done / stats.total) * 100}%`, background: list.color }} />
            </div>
            <span className="tv-stat-label">{stats.done}/{stats.total} complete</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="tv-toolbar fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="filter-tabs">
            {['all', 'active', 'done'].map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
                <span className="filter-count">{f === 'all' ? stats.total : f === 'active' ? stats.active : stats.done}</span>
              </button>
            ))}
          </div>
          {canEdit && (
            <button className="add-btn" onClick={() => setShowAdd(!showAdd)} style={{ background: list.color }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New task
            </button>
          )}
        </div>

        {/* Add form */}
        {showAdd && canEdit && (
          <div className="slide-down">
            <AddTodo onAdd={handleAdd} onCancel={() => setShowAdd(false)} color={list.color} />
          </div>
        )}

        {/* Tasks */}
        <div className="todo-list">
          {loading ? (
            <div className="todo-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-item" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state fade-in">
              <div className="empty-icon">{filter === 'done' ? '🎯' : filter === 'active' ? '🎉' : '📝'}</div>
              <p>{filter === 'done' ? 'No completed tasks yet' : filter === 'active' ? 'All tasks completed!' : 'No tasks yet — add your first one!'}</p>
            </div>
          ) : (
            filtered.map((todo, i) => (
              <div key={todo.id} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <TodoItem
                  todo={todo}
                  onToggle={() => handleToggle(todo.id, todo.completed)}
                  onUpdate={(updates) => handleUpdate(todo.id, updates)}
                  onDelete={() => handleDelete(todo.id)}
                  canEdit={canEdit}
                  accentColor={list.color}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal listId={list.id} listName={list.name} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

export default TodoView;
