const API_BASE = '/.netlify/functions';

function getToken() {
  return localStorage.getItem('tdl_token');
}

function setAuth(token, user) {
  localStorage.setItem('tdl_token', token);
  localStorage.setItem('tdl_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('tdl_token');
  localStorage.removeItem('tdl_user');
}

function getUser() {
  try {
    const u = localStorage.getItem('tdl_user');
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
  // Auth
  signup: (email, password, displayName) =>
    request('/auth-signup', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),
  login: (email, password) =>
    request('/auth-login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Lists
  getLists: () => request('/lists'),
  createList: (name, color) =>
    request('/lists', { method: 'POST', body: JSON.stringify({ name, color }) }),
  updateList: (id, updates) =>
    request('/lists', { method: 'PUT', body: JSON.stringify({ id, ...updates }) }),
  deleteList: (id) =>
    request('/lists', { method: 'DELETE', body: JSON.stringify({ id }) }),

  // Sharing
  getShares: (listId) => request(`/shares?listId=${listId}`),
  shareList: (listId, email, permission) =>
    request('/shares', { method: 'POST', body: JSON.stringify({ listId, email, permission }) }),
  unshare: (listId, userId) =>
    request('/shares', { method: 'DELETE', body: JSON.stringify({ listId, userId }) }),

  // Todos
  getTodos: (listId) => request(`/todos?listId=${listId}`),
  createTodo: (listId, title, description, priority, dueDate) =>
    request('/todos', { method: 'POST', body: JSON.stringify({ listId, title, description, priority, dueDate }) }),
  updateTodo: (id, updates) =>
    request('/todos', { method: 'PUT', body: JSON.stringify({ id, ...updates }) }),
  deleteTodo: (id) =>
    request('/todos', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

export { setAuth, clearAuth, getUser, getToken };
