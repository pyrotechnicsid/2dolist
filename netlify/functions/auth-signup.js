const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, createResponse, handleOptions, JWT_SECRET } = require('./utils/db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  if (event.httpMethod !== 'POST') return createResponse(405, { error: 'Method not allowed' });

  try {
    const { email, password, displayName } = JSON.parse(event.body);

    if (!email || !password || !displayName) {
      return createResponse(400, { error: 'Email, password, and display name are required' });
    }
    if (password.length < 6) {
      return createResponse(400, { error: 'Password must be at least 6 characters' });
    }

    const sql = getDb();

    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return createResponse(409, { error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${displayName})
      RETURNING id, email, display_name, created_at
    `;

    const user = result[0];

    // Create a default list for the new user
    await sql`
      INSERT INTO lists (owner_id, name, color)
      VALUES (${user.id}, 'My Tasks', '#6c5ce7')
    `;

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return createResponse(201, {
      token,
      user: { id: user.id, email: user.email, displayName: user.display_name },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return createResponse(500, { error: 'Internal server error' });
  }
};
