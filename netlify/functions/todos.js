const { getDb, createResponse, handleOptions, verifyToken, checkListAccess } = require('./utils/db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  const user = verifyToken(event);
  if (!user) return createResponse(401, { error: 'Unauthorized' });

  const sql = getDb();

  try {
    // GET - list todos for a specific list
    if (event.httpMethod === 'GET') {
      const listId = event.queryStringParameters?.listId;
      if (!listId) return createResponse(400, { error: 'listId is required' });

      const access = await checkListAccess(sql, listId, user.userId);
      if (!access) return createResponse(403, { error: 'You do not have access to this list' });

      const todos = await sql`
        SELECT id, list_id, title, description, completed, priority, created_at, updated_at
        FROM todos WHERE list_id = ${listId}
        ORDER BY
          completed ASC,
          CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
          created_at DESC
      `;
      return createResponse(200, { todos, permission: access.permission });
    }

    // POST - create todo in a list
    if (event.httpMethod === 'POST') {
      const { listId, title, description, priority } = JSON.parse(event.body);
      if (!listId || !title || !title.trim()) {
        return createResponse(400, { error: 'listId and title are required' });
      }

      const access = await checkListAccess(sql, listId, user.userId);
      if (!access) return createResponse(403, { error: 'You do not have access to this list' });
      if (access.permission === 'view') return createResponse(403, { error: 'You have view-only access to this list' });

      const result = await sql`
        INSERT INTO todos (list_id, title, description, priority)
        VALUES (${listId}, ${title.trim()}, ${description || ''}, ${priority || 'medium'})
        RETURNING id, list_id, title, description, completed, priority, created_at, updated_at
      `;

      // Update list timestamp
      await sql`UPDATE lists SET updated_at = NOW() WHERE id = ${listId}`;

      return createResponse(201, { todo: result[0] });
    }

    // PUT - update todo
    if (event.httpMethod === 'PUT') {
      const { id, title, description, completed, priority } = JSON.parse(event.body);
      if (!id) return createResponse(400, { error: 'Todo ID is required' });

      // Get the todo's list and check access
      const todo = await sql`SELECT list_id FROM todos WHERE id = ${id}`;
      if (todo.length === 0) return createResponse(404, { error: 'Todo not found' });

      const access = await checkListAccess(sql, todo[0].list_id, user.userId);
      if (!access) return createResponse(403, { error: 'You do not have access to this list' });
      if (access.permission === 'view') return createResponse(403, { error: 'You have view-only access to this list' });

      const result = await sql`
        UPDATE todos SET
          title = COALESCE(${title || null}, title),
          description = COALESCE(${description !== undefined ? description : null}, description),
          completed = COALESCE(${completed !== undefined ? completed : null}, completed),
          priority = COALESCE(${priority || null}, priority),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, list_id, title, description, completed, priority, created_at, updated_at
      `;

      if (result.length === 0) return createResponse(404, { error: 'Todo not found' });
      return createResponse(200, { todo: result[0] });
    }

    // DELETE - delete todo
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      if (!id) return createResponse(400, { error: 'Todo ID is required' });

      const todo = await sql`SELECT list_id FROM todos WHERE id = ${id}`;
      if (todo.length === 0) return createResponse(404, { error: 'Todo not found' });

      const access = await checkListAccess(sql, todo[0].list_id, user.userId);
      if (!access) return createResponse(403, { error: 'You do not have access to this list' });
      if (access.permission === 'view') return createResponse(403, { error: 'You have view-only access to this list' });

      await sql`DELETE FROM todos WHERE id = ${id}`;
      return createResponse(200, { deleted: true });
    }

    return createResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Todos error:', err);
    return createResponse(500, { error: 'Internal server error' });
  }
};
