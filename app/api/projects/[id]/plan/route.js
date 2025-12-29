/**
 * @swagger
 * /api/projects/{id}/plan:
 *   get:
 *     summary: Get project plan
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
 *         description: Project plan
 *       404:
 *         description: Plan not found
 *   post:
 *     summary: Create project plan
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Plan created
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/database';
import { logAudit } from '@/lib/audit';

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await verifyToken(authHeader?.substring(7));

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await query(
      'SELECT * FROM project_plans WHERE project_id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get plan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await verifyToken(authHeader?.substring(7));

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if budget items are approved
    const budgetCheck = await query(
      'SELECT COUNT(*) FROM budget_items WHERE project_id = $1 AND approval_status = $2',
      [params.id, 'approved']
    );

    if (parseInt(budgetCheck.rows[0].count) === 0) {
      return NextResponse.json(
        { success: false, error: 'Approve at least one budget item first' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      methodology,
      tools_to_be_used,
      deliverables,
      dependencies,
      quality_standards,
      communication_plan,
      change_control_process,
      planning_assumptions,
      planning_constraints,
      planning_risks,
      baseline_scope,
      baseline_schedule,
    } = body;

    const result = await query(
      `INSERT INTO project_plans (
        project_id, planning_start_date, methodology, tools_to_be_used,
        deliverables, dependencies, quality_standards, communication_plan,
        change_control_process, planning_assumptions, planning_constraints,
        planning_risks, baseline_scope, baseline_schedule, created_at, updated_at
      ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        params.id,
        methodology,
        tools_to_be_used,
        deliverables,
        dependencies,
        quality_standards,
        communication_plan,
        change_control_process,
        planning_assumptions,
        planning_constraints,
        planning_risks,
        baseline_scope,
        baseline_schedule,
      ]
    );

    await logAudit({
      entity_type: 'project_plan',
      entity_id: result.rows[0].id,
      user_id: payload.id,
      action: 'create',
      changes: body,
    });

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}