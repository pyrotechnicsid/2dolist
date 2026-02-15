import React, { useState } from 'react';
import './TodoItem.css';

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [deleting, setDeleting] = useState(false);

  const handleSave = () => {
    if (title.trim() && title !== todo.title) {
      onUpdate({ title: title.trim() });
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setTitle(todo.title); setEditing(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(); } catch { setDeleting(false); }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${deleting ? 'deleting' : ''}`}>
      {/* Checkbox */}
      <button
        className={`todo-check ${todo.completed ? 'checked' : ''}`}
        onClick={onToggle}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="todo-content">
        {editing ? (
          <input
            className="todo-edit-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div className="todo-title" onDoubleClick={() => { if (!todo.completed) setEditing(true); }}>
            {todo.title}
          </div>
        )}

        <div className="todo-meta">
          <span className={`todo-priority priority-${todo.priority}`}>
            <span className="priority-dot" />
            {todo.priority}
          </span>
          <span className="todo-time">{timeAgo(todo.created_at)}</span>
        </div>

        {todo.description && (
          <div className="todo-description">{todo.description}</div>
        )}
      </div>

      {/* Actions */}
      <div className="todo-actions">
        {!todo.completed && (
          <button
            className="todo-action-btn edit"
            onClick={() => setEditing(true)}
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        <button
          className="todo-action-btn delete"
          onClick={handleDelete}
          title="Delete"
          disabled={deleting}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TodoItem;
