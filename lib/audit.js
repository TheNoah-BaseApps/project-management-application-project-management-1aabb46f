import { query } from './database';

export async function logAudit({ entity_type, entity_id, user_id, action, changes }) {
  try {
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, user_id, action, changes, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [entity_type, entity_id, user_id, action, JSON.stringify(changes)]
    );
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

export async function getAuditLogs({ entity_type, entity_id, user_id, limit = 100 }) {
  try {
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (entity_type) {
      conditions.push(`entity_type = $${paramCount}`);
      params.push(entity_type);
      paramCount++;
    }

    if (entity_id) {
      conditions.push(`entity_id = $${paramCount}`);
      params.push(entity_id);
      paramCount++;
    }

    if (user_id) {
      conditions.push(`user_id = $${paramCount}`);
      params.push(user_id);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);

    const result = await query(
      `SELECT a.*, u.name as user_name 
       FROM audit_logs a 
       LEFT JOIN users u ON a.user_id = u.id 
       ${whereClause}
       ORDER BY a.created_at DESC 
       LIMIT $${paramCount}`,
      params
    );

    return result.rows;
  } catch (error) {
    console.error('Get audit logs error:', error);
    throw error;
  }
}