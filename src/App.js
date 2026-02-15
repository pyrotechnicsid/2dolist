import React, { useState, useEffect, useCallback } from 'react';
import { getUser, getToken, clearAuth } from './api';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const u = getUser();
    const t = getToken();
    if (u && t) setUser(u);
    setChecking(false);
  }, []);

  const handleAuth = useCallback((userData) => {
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  if (checking) {
    return (
      <div className="app-loader">
        <div className="loader-pulse" />
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onAuth={handleAuth} />
      )}
    </div>
  );
}

export default App;
