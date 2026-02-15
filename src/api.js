const API_BASE = '/.netlify/functions';

function getToken() {
  return localStorage.getItem('tf_token');
}

function setAuth(token, user) {
  localStorage.setItem('tf_token', token);
  localStorage.setItem('tf_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('tf_token');
  localStorage.removeItem('tf_user');
}

function getUser() {
  try {
    const u = localStorage.getItem('tf_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup: (email, password, displayName) =>
    request('/auth-signup', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),

  login: (email, password) =>
    request('/auth-login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getTodos: () => request('/todos'),

  createTodo: (title, description, priority) =>
    request('/todos', { method: 'POST', body: JSON.stringify({ title, description, priority }) }),

  updateTodo: (id, updates) =>
    request('/todos', { method: 'PUT', body: JSON.stringify({ id, ...updates }) }),

  deleteTodo: (id) =>
    request('/todos', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

export { setAuth, clearAuth, getUser, getToken };
