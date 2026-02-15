import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Sidebar from './Sidebar';
import TodoView from './TodoView';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchLists = useCallback(async () => {
    try {
      const data = await api.getLists();
      setLists(data.lists);
      if (data.lists.length > 0 && !activeListId) {
        setActiveListId(data.lists[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch lists:', err);
    } finally {
      setLoading(false);
    }
  }, [activeListId]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const handleCreateList = async (name, color) => {
    const data = await api.createList(name, color);
    setLists((prev) => [data.list, ...prev]);
    setActiveListId(data.list.id);
    setSidebarOpen(false);
  };

  const handleDeleteList = async (id) => {
    await api.deleteList(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeListId === id) {
      const remaining = lists.filter((l) => l.id !== id);
      setActiveListId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateList = async (id, updates) => {
    const data = await api.updateList(id, updates);
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...data.list } : l)));
  };

  const activeList = lists.find((l) => l.id === activeListId) || null;

  const refreshListCounts = useCallback(() => {
    fetchLists();
  }, [fetchLists]);

  return (
    <div className="dashboard">
      {/* Mobile header */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="dash-brand">
            <span className="dash-brand-accent">2doo</span><span className="dash-brand-serif">lists</span>
          </div>
          <button className="dash-logout" onClick={onLogout} title="Sign out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="dash-layout">
        {/* Sidebar */}
        <Sidebar
          lists={lists}
          activeListId={activeListId}
          onSelect={(id) => { setActiveListId(id); setSidebarOpen(false); }}
          onCreate={handleCreateList}
          onDelete={handleDeleteList}
          onUpdate={handleUpdateList}
          user={user}
          onLogout={onLogout}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <main className="dash-main">
          {loading ? (
            <div className="main-loader">
              <div className="loader-pulse" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)' }} />
            </div>
          ) : activeList ? (
            <TodoView
              list={activeList}
              user={user}
              onListCountChange={refreshListCounts}
            />
          ) : (
            <div className="empty-main fade-in">
              <div className="empty-main-icon">📋</div>
              <h2>No lists yet</h2>
              <p>Create your first list to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
