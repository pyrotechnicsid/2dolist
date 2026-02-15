import React, { useState } from 'react';
import './AddTodo.css';

function AddTodo({ onAdd, onCancel, color }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onAdd(title, description, priority, dueDate || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date as YYYY-MM-DD for the min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="add-todo-form" onSubmit={handleSubmit} style={{ borderColor: color }}>
      <input
        type="text" className="add-todo-title"
        placeholder="What needs to be done?"
        value={title} onChange={(e) => setTitle(e.target.value)}
        autoFocus required
      />
      <textarea
        className="add-todo-desc"
        placeholder="Add a description (optional)"
        value={description} onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <div className="add-todo-footer">
        <div className="add-todo-options">
          <div className="priority-selector">
            {['low', 'medium', 'high'].map((p) => (
              <button key={p} type="button"
                className={`priority-btn priority-${p} ${priority === p ? 'active' : ''}`}
                onClick={() => setPriority(p)}
              >
                <span className="priority-dot" />{p}
              </button>
            ))}
          </div>
          <div className="due-date-picker">
            <svg className="due-date-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input
              type="date"
              className="due-date-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={today}
            />
            {dueDate && (
              <button type="button" className="due-date-clear" onClick={() => setDueDate('')} title="Clear date">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="add-todo-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="submit-btn" disabled={loading || !title.trim()} style={{ background: color }}>
            {loading ? 'Adding...' : 'Add task'}
          </button>
        </div>
      </div>
      {error && <div className="add-error">{error}</div>}
    </form>
  );
}

export default AddTodo;
