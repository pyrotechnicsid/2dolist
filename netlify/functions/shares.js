const { getDb, createResponse, handleOptions, verifyToken } = require('./utils/db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  const user = verifyToken(event);
  if (!user) return createResponse(401, { error: 'Unauthorized' });

  const sql = getDb();

  try {
    // GET - get collaborators for a list
    if (event.httpMethod === 'GET') {
      const listId = event.queryStringParameters?.listId;
      if (!listId) return createResponse(400, { error: 'listId is required' });

      // Verify ownership
      const list = await sql`SELECT id FROM lists WHERE id = ${listId} AND owner_id = ${user.userId}`;
      if (list.length === 0) return createResponse(403, { error: 'Only the list owner can view collaborators' });

      const shares = await sql`
        SELECT ls.id, ls.permission, ls.created_at,
          u.id as user_id, u.email, u.display_name
        FROM list_shares ls
        JOIN users u ON u.id = ls.shared_with_id
        WHERE ls.list_id = ${listId}
        ORDER BY ls.created_at DESC
      `;
      return createResponse(200, { shares });
    }

    // POST - share a list with a user by email
    if (event.httpMethod === 'POST') {
      const { listId, email, permission } = JSON.parse(event.body);
      if (!listId || !email) {
        return createResponse(400, { error: 'listId and email are required' });
      }

      // Verify ownership
      const list = await sql`SELECT id, name FROM lists WHERE id = ${listId} AND owner_id = ${user.userId}`;
      if (list.length === 0) return createResponse(403, { error: 'Only the list owner can share it' });

      // Find the target user
      const targetUser = await sql`SELECT id, email, display_name FROM users WHERE email = ${email.toLowerCase()}`;
      if (targetUser.length === 0) {
        return createResponse(404, { error: 'No user found with that email' });
      }

      if (targetUser[0].id === user.userId) {
        return createResponse(400, { error: "You can't share a list with yourself" });
      }

      // Check if already shared
      const existing = await sql`
        SELECT id FROM list_shares WHERE list_id = ${listId} AND shared_with_id = ${targetUser[0].id}
      `;
      if (existing.length > 0) {
        // Update permission
        await sql`
          UPDATE list_shares SET permission = ${permission || 'edit'}
          WHERE list_id = ${listId} AND shared_with_id = ${targetUser[0].id}
        `;
        return createResponse(200, {
          message: 'Permission updated',
          share: { user_id: targetUser[0].id, email: targetUser[0].email, display_name: targetUser[0].display_name, permission: permission || 'edit' }
        });
      }

      // Create share
      const result = await sql`
        INSERT INTO list_shares (list_id, shared_with_id, permission)
        VALUES (${listId}, ${targetUser[0].id}, ${permission || 'edit'})
        RETURNING id, permission, created_at
      `;

      return createResponse(201, {
        share: {
          ...result[0],
          user_id: targetUser[0].id,
          email: targetUser[0].email,
          display_name: targetUser[0].display_name,
        }
      });
    }

    // DELETE - unshare (remove collaborator)
    if (event.httpMethod === 'DELETE') {
      const { listId, userId: targetUserId } = JSON.parse(event.body);
      if (!listId || !targetUserId) {
        return createResponse(400, { error: 'listId and userId are required' });
      }

      // Verify ownership
      const list = await sql`SELECT id FROM lists WHERE id = ${listId} AND owner_id = ${user.userId}`;
      if (list.length === 0) return createResponse(403, { error: 'Only the list owner can remove collaborators' });

      await sql`DELETE FROM list_shares WHERE list_id = ${listId} AND shared_with_id = ${targetUserId}`;
      return createResponse(200, { deleted: true });
    }

    return createResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Sharing error:', err);
    return createResponse(500, { error: 'Internal server error' });
  }
};
