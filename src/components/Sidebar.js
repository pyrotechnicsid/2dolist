import React, { useState, useRef, useEffect } from 'react';
import './Sidebar.css';

const LIST_COLORS = ['#6c5ce7', '#00d2a0', '#ff6b6b', '#ffc53d', '#0984e3', '#e84393', '#00cec9', '#fd79a8'];

function Sidebar({ lists, activeListId, onSelect, onCreate, onDelete, onUpdate, user, onLogout, open, onClose }) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6c5ce7');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const editRef = useRef(null);

  useEffect(() => {
    if (editingId !== null && editRef.current) {
      const timer = setTimeout(() => {
        if (editRef.current) {
          editRef.current.focus();
          editRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editingId]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreate(newName.trim(), newColor);
    setNewName('');
    setNewColor('#6c5ce7');
    setShowNew(false);
  };

  const handleEditSave = (id) => {
    if (editName.trim() && editName.trim() !== (lists.find(l => l.id === id)?.name || '')) {
      onUpdate(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const ownedLists = lists.filter((l) => l.permission === 'owner');
  const sharedLists = lists.filter((l) => l.permission !== 'owner');

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-inner">
        {/* Brand - desktop only */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <div>
              <span className="sb-accent">2doo</span><span className="sb-serif">lists</span>
            </div>
          </div>
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user.displayName}</span>
            <button className="sidebar-logout" onClick={onLogout} title="Sign out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* My Lists */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">My Lists</span>
            <button className="sidebar-add-btn" onClick={() => setShowNew(!showNew)} title="New list">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          {showNew && (
            <form className="new-list-form slide-down" onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="List name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className="new-list-colors">
                {LIST_COLORS.map((c) => (
                  <button
                    key={c} type="button"
                    className={`color-dot ${newColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
              <div className="new-list-actions">
                <button type="button" className="nl-cancel" onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="nl-create" disabled={!newName.trim()}>Create</button>
              </div>
            </form>
          )}

          <div className="sidebar-list-items">
            {ownedLists.map((list) => (
              <div
                key={list.id}
                className={`sidebar-item ${activeListId === list.id ? 'active' : ''}`}
                onClick={() => onSelect(list.id)}
              >
                <div className="sidebar-item-dot" style={{ background: list.color }} />
                <div className="sidebar-item-content">
                  {editingId === list.id ? (
                    <input
                      className="sidebar-edit-input"
                      ref={editRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleEditSave(list.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(list.id); if (e.key === 'Escape') setEditingId(null); }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="sidebar-item-name">{list.name}</span>
                  )}
                  <span className="sidebar-item-count">{list.task_count}</span>
                </div>
                <div className="sidebar-item-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="si-action"
                    onClick={() => { setEditingId(list.id); setEditName(list.name); }}
                    title="Rename"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  {ownedLists.length > 1 && (
                    <button
                      className="si-action si-delete"
                      onClick={() => { if (window.confirm(`Delete "${list.name}" and all its tasks?`)) onDelete(list.id); }}
                      title="Delete list"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shared with me */}
        {sharedLists.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Shared with me</span>
            </div>
            <div className="sidebar-list-items">
              {sharedLists.map((list) => (
                <div
                  key={list.id}
                  className={`sidebar-item ${activeListId === list.id ? 'active' : ''}`}
                  onClick={() => onSelect(list.id)}
                >
                  <div className="sidebar-item-dot" style={{ background: list.color }} />
                  <div className="sidebar-item-content">
                    <span className="sidebar-item-name">{list.name}</span>
                    <span className="sidebar-item-owner">by {list.owner_name}</span>
                  </div>
                  <span className="sidebar-item-badge">{list.permission}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="sidebar-footer">Made by Sid Bose</div>
    </aside>
  );
}

export default Sidebar;
