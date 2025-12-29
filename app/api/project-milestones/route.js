import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/project-milestones:
 *   get:
 *     summary: Get all project milestones
 *     description: Retrieve all project timeline milestones with optional filtering
 *     tags: [Project Milestones]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (Planned, In Progress, Completed, Delayed)
 *     responses:
 *       200:
 *         description: List of milestones retrieved successfully
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM project_milestones WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (projectId) {
      sql += ` AND project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    if (status) {
      sql += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    sql += ' ORDER BY planned_date ASC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching project milestones:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/project-milestones:
 *   post:
 *     summary: Create new project milestone
 *     description: Add a new milestone to project timeline
 *     tags: [Project Milestones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - milestone_name
 *               - planned_date
 *               - status
 *               - owner
 *             properties:
 *               project_id:
 *                 type: string
 *               milestone_name:
 *                 type: string
 *               planned_date:
 *                 type: string
 *                 format: date-time
 *               actual_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [Planned, In Progress, Completed, Delayed]
 *               predecessor_milestones:
 *                 type: string
 *               successor_milestones:
 *                 type: string
 *               acceptance_criteria:
 *                 type: string
 *               owner:
 *                 type: string
 *               delay_reason:
 *                 type: string
 *               baseline_date:
 *                 type: string
 *                 format: date-time
 *               revised_date:
 *                 type: string
 *                 format: date-time
 *               completion_evidence:
 *                 type: string
 *               impact_assessment:
 *                 type: string
 *               celebration_plan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Milestone created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      project_id,
      milestone_name,
      planned_date,
      actual_date,
      status,
      predecessor_milestones,
      successor_milestones,
      acceptance_criteria,
      owner,
      delay_reason,
      baseline_date,
      revised_date,
      completion_evidence,
      impact_assessment,
      celebration_plan,
    } = body;

    // Validation
    if (!project_id || !milestone_name || !planned_date || !status || !owner) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO project_milestones (
        project_id, milestone_name, planned_date, actual_date, status,
        predecessor_milestones, successor_milestones, acceptance_criteria,
        owner, delay_reason, baseline_date, revised_date,
        completion_evidence, impact_assessment, celebration_plan,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        NOW(), NOW()
      ) RETURNING *
    `;

    const result = await query(sql, [
      project_id,
      milestone_name,
      planned_date,
      actual_date || null,
      status,
      predecessor_milestones || null,
      successor_milestones || null,
      acceptance_criteria || null,
      owner,
      delay_reason || null,
      baseline_date || null,
      revised_date || null,
      completion_evidence || null,
      impact_assessment || null,
      celebration_plan || null,
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project milestone:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}