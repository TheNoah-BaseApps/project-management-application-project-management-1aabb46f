/**
 * @swagger
 * /api/projects/{id}/workflow/transition:
 *   post:
 *     summary: Transition project to next workflow stage
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to_workflow:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workflow transitioned
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query, getClient } from '@/lib/database';
import { logAudit } from '@/lib/audit';

export async function POST(request, { params }) {
  const client = await getClient();
  
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await verifyToken(authHeader?.substring(7));

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to_workflow } = body;

    if (!to_workflow) {
      return NextResponse.json(
        { success: false, error: 'Target workflow is required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Get current project status
    const projectResult = await client.query(
      'SELECT status FROM projects WHERE id = $1',
      [params.id]
    );

    if (projectResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const currentStatus = projectResult.rows[0].status;

    // Update project status
    await client.query(
      'UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2',
      [to_workflow, params.id]
    );

    // Log workflow transition
    await client.query(
      `INSERT INTO workflow_transitions (
        project_id, from_workflow, to_workflow, transitioned_by, 
        transitioned_at, status
      ) VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [params.id, currentStatus, to_workflow, payload.id, 'completed']
    );

    await client.query('COMMIT');

    await logAudit({
      entity_type: 'project',
      entity_id: params.id,
      user_id: payload.id,
      action: 'workflow_transition',
      changes: { from: currentStatus, to: to_workflow },
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow transitioned successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Workflow transition error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transition workflow' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}