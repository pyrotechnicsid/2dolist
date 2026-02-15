const { neon } = require('@neondatabase/serverless');

let sql;

function getDb() {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

function handleOptions() {
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: '',
  };
}

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function verifyToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Check if a user has access to a list (owner or shared)
async function checkListAccess(sql, listId, userId) {
  const result = await sql`
    SELECT l.id, l.owner_id, l.name, l.color,
      CASE WHEN l.owner_id = ${userId} THEN 'owner'
           ELSE COALESCE(ls.permission, NULL)
      END as permission
    FROM lists l
    LEFT JOIN list_shares ls ON ls.list_id = l.id AND ls.shared_with_id = ${userId}
    WHERE l.id = ${listId} AND (l.owner_id = ${userId} OR ls.shared_with_id = ${userId})
  `;
  return result.length > 0 ? result[0] : null;
}

module.exports = { getDb, createResponse, handleOptions, verifyToken, checkListAccess, JWT_SECRET };
