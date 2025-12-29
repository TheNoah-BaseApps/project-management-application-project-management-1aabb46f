/**
 * @swagger
 * /api/project-plans/{id}:
 *   patch:
 *     summary: Update project plan
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan updated
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/database';
import { logAudit } from '@/lib/audit';

export async function PATCH(request, { params }) {
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

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    const allowedFields = [
      'methodology',
      'tools_to_be_used',
      'deliverables',
      'dependencies',
      'quality_standards',
      'communication_plan',
      'change_control_process',
      'planning_assumptions',
      'planning_constraints',
      'planning_risks',
      'baseline_scope',
      'baseline_schedule',
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(body[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(params.id);

    const result = await query(
      `UPDATE project_plans SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    await logAudit({
      entity_type: 'project_plan',
      entity_id: params.id,
      user_id: payload.id,
      action: 'update',
      changes: body,
    });

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}