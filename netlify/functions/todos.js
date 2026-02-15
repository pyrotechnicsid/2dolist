const { getDb, createResponse, handleOptions, verifyToken } = require('./utils/db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  const user = verifyToken(event);
  if (!user) return createResponse(401, { error: 'Unauthorized' });

  const sql = getDb();

  try {
    // GET - list todos
    if (event.httpMethod === 'GET') {
      const todos = await sql`
        SELECT id, title, description, completed, priority, created_at, updated_at
        FROM todos WHERE user_id = ${user.userId}
        ORDER BY
          completed ASC,
          CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
          created_at DESC
      `;
      return createResponse(200, { todos });
    }

    // POST - create todo
    if (event.httpMethod === 'POST') {
      const { title, description, priority } = JSON.parse(event.body);
      if (!title || !title.trim()) {
        return createResponse(400, { error: 'Title is required' });
      }
      const result = await sql`
        INSERT INTO todos (user_id, title, description, priority)
        VALUES (${user.userId}, ${title.trim()}, ${description || ''}, ${priority || 'medium'})
        RETURNING id, title, description, completed, priority, created_at, updated_at
      `;
      return createResponse(201, { todo: result[0] });
    }

    // PUT - update todo
    if (event.httpMethod === 'PUT') {
      const { id, title, description, completed, priority } = JSON.parse(event.body);
      if (!id) return createResponse(400, { error: 'Todo ID is required' });

      const result = await sql`
        UPDATE todos SET
          title = COALESCE(${title}, title),
          description = COALESCE(${description !== undefined ? description : null}, description),
          completed = COALESCE(${completed !== undefined ? completed : null}, completed),
          priority = COALESCE(${priority}, priority),
          updated_at = NOW()
        WHERE id = ${id} AND user_id = ${user.userId}
        RETURNING id, title, description, completed, priority, created_at, updated_at
      `;

      if (result.length === 0) return createResponse(404, { error: 'Todo not found' });
      return createResponse(200, { todo: result[0] });
    }

    // DELETE - delete todo
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      if (!id) return createResponse(400, { error: 'Todo ID is required' });

      const result = await sql`
        DELETE FROM todos WHERE id = ${id} AND user_id = ${user.userId} RETURNING id
      `;

      if (result.length === 0) return createResponse(404, { error: 'Todo not found' });
      return createResponse(200, { deleted: true });
    }

    return createResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Todos error:', err);
    return createResponse(500, { error: 'Internal server error' });
  }
};
