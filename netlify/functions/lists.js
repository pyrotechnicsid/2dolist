const { getDb, createResponse, handleOptions, verifyToken } = require('./utils/db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  const user = verifyToken(event);
  if (!user) return createResponse(401, { error: 'Unauthorized' });

  const sql = getDb();

  try {
    // GET - get all lists (owned + shared with me)
    if (event.httpMethod === 'GET') {
      const lists = await sql`
        SELECT
          l.id, l.name, l.color, l.owner_id, l.created_at, l.updated_at,
          u.display_name as owner_name,
          CASE WHEN l.owner_id = ${user.userId} THEN 'owner' ELSE ls.permission END as permission,
          (SELECT COUNT(*) FROM todos t WHERE t.list_id = l.id) as task_count,
          (SELECT COUNT(*) FROM todos t WHERE t.list_id = l.id AND t.completed = true) as done_count
        FROM lists l
        JOIN users u ON u.id = l.owner_id
        LEFT JOIN list_shares ls ON ls.list_id = l.id AND ls.shared_with_id = ${user.userId}
        WHERE l.owner_id = ${user.userId} OR ls.shared_with_id = ${user.userId}
        ORDER BY l.updated_at DESC
      `;
      return createResponse(200, { lists });
    }

    // POST - create a new list
    if (event.httpMethod === 'POST') {
      const { name, color } = JSON.parse(event.body);
      if (!name || !name.trim()) {
        return createResponse(400, { error: 'List name is required' });
      }
      const result = await sql`
        INSERT INTO lists (owner_id, name, color)
        VALUES (${user.userId}, ${name.trim()}, ${color || '#6c5ce7'})
        RETURNING id, name, color, owner_id, created_at, updated_at
      `;
      const list = result[0];
      list.permission = 'owner';
      list.owner_name = '';
      list.task_count = '0';
      list.done_count = '0';
      return createResponse(201, { list });
    }

    // PUT - update a list (owner only)
    if (event.httpMethod === 'PUT') {
      const { id, name, color } = JSON.parse(event.body);
      if (!id) return createResponse(400, { error: 'List ID is required' });

      const result = await sql`
        UPDATE lists SET
          name = COALESCE(${name || null}, name),
          color = COALESCE(${color || null}, color),
          updated_at = NOW()
        WHERE id = ${id} AND owner_id = ${user.userId}
        RETURNING id, name, color, owner_id, created_at, updated_at
      `;
      if (result.length === 0) return createResponse(404, { error: 'List not found or not owned by you' });
      return createResponse(200, { list: result[0] });
    }

    // DELETE - delete a list (owner only)
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      if (!id) return createResponse(400, { error: 'List ID is required' });

      const result = await sql`
        DELETE FROM lists WHERE id = ${id} AND owner_id = ${user.userId} RETURNING id
      `;
      if (result.length === 0) return createResponse(404, { error: 'List not found or not owned by you' });
      return createResponse(200, { deleted: true });
    }

    return createResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Lists error:', err);
    return createResponse(500, { error: 'Internal server error' });
  }
};
