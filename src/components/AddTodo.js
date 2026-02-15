import React, { useState } from 'react';
import './AddTodo.css';

function AddTodo({ onAdd, onCancel, color }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onAdd(title, description, priority);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
