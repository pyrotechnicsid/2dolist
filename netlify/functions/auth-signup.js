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

    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return createResponse(409, { error: 'An account with this email already exists' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${displayName})
      RETURNING id, email, display_name, created_at
    `;

    const user = result[0];
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
