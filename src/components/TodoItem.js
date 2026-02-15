import React, { useState } from 'react';
import './TodoItem.css';

function TodoItem({ todo, onToggle, onUpdate, onDelete, canEdit, accentColor }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [deleting, setDeleting] = useState(false);

  const handleSave = () => {
    if (title.trim() && title !== todo.title) onUpdate({ title: title.trim() });
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

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    // Handle both "2025-02-20" and "2025-02-20T00:00:00.000Z" formats
    const dateOnly = dateStr.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length !== 3) return null;
    const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (isNaN(due.getTime())) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));

    let label;
    if (diffDays < 0) label = `${Math.abs(diffDays)}d overdue`;
    else if (diffDays === 0) label = 'Due today';
    else if (diffDays === 1) label = 'Due tomorrow';
    else if (diffDays <= 7) label = `Due in ${diffDays}d`;
    else label = `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    let status = 'upcoming';
    if (diffDays < 0) status = 'overdue';
    else if (diffDays === 0) status = 'today';
    else if (diffDays <= 2) status = 'soon';

    return { label, status };
  };

  const dueInfo = formatDueDate(todo.due_date);

  const handleDateChange = (e) => {
    onUpdate({ dueDate: e.target.value || null });
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${deleting ? 'deleting' : ''}`}>
      <button
        className={`todo-check ${todo.completed ? 'checked' : ''}`}
        onClick={canEdit ? onToggle : undefined}
        style={todo.completed ? { background: accentColor, borderColor: accentColor } : {}}
        disabled={!canEdit}
      >
        {todo.completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>
      <div className="todo-content">
        {editing ? (
          <input
            className="todo-edit-input"
            value={title} onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave} onKeyDown={handleKeyDown} autoFocus
          />
        ) : (
          <div className="todo-title" onDoubleClick={() => { if (canEdit && !todo.completed) setEditing(true); }}>
            {todo.title}
          </div>
        )}
        <div className="todo-meta">
          <span className={`todo-priority priority-${todo.priority}`}>
            <span className="priority-dot" />{todo.priority}
          </span>
          {dueInfo && !todo.completed && (
            <span className={`todo-due todo-due-${dueInfo.status}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {dueInfo.label}
            </span>
          )}
          {dueInfo && todo.completed && (
            <span className="todo-due todo-due-done">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {new Date(todo.due_date.split('T')[0] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <span className="todo-time">{timeAgo(todo.created_at)}</span>
        </div>
        {todo.description && <div className="todo-description">{todo.description}</div>}
      </div>
      {canEdit && (
        <div className="todo-actions">
          {!todo.completed && (
            <label className="todo-action-btn date-action" title="Set due date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input
                type="date"
                className="todo-date-hidden"
                value={todo.due_date || ''}
                onChange={handleDateChange}
              />
            </label>
          )}
          {!todo.completed && (
            <button className="todo-action-btn edit" onClick={() => setEditing(true)} title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
          <button className="todo-action-btn delete" onClick={handleDelete} title="Delete" disabled={deleting}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default TodoItem;
