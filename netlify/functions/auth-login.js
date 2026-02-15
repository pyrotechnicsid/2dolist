const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, createResponse, handleOptions, JWT_SECRET } = require('./utils/db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  if (event.httpMethod !== 'POST') return createResponse(405, { error: 'Method not allowed' });

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return createResponse(400, { error: 'Email and password are required' });
    }

    const sql = getDb();
    const result = await sql`
      SELECT id, email, password_hash, display_name FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (result.length === 0) {
      return createResponse(401, { error: 'Invalid email or password' });
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return createResponse(401, { error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return createResponse(200, {
      token,
      user: { id: user.id, email: user.email, displayName: user.display_name },
    });
  } catch (err) {
    console.error('Login error:', err);
    return createResponse(500, { error: 'Internal server error' });
  }
};
