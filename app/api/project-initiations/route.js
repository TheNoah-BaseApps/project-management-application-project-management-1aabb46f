import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/project-initiations:
 *   get:
 *     summary: Get all project initiations
 *     description: Retrieve all project initiation records with optional filtering
 *     tags: [Project Initiations]
 *     parameters:
 *       - in: query
 *         name: approval_status
 *         schema:
 *           type: string
 *         description: Filter by approval status
 *       - in: query
 *         name: project_type
 *         schema:
 *           type: string
 *         description: Filter by project type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of project initiations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const approval_status = searchParams.get('approval_status');
    const project_type = searchParams.get('project_type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM project_initiations WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (approval_status) {
      sql += ` AND approval_status = $${paramIndex}`;
      params.push(approval_status);
      paramIndex++;
    }

    if (project_type) {
      sql += ` AND project_type = $${paramIndex}`;
      params.push(project_type);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching project initiations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/project-initiations:
 *   post:
 *     summary: Create a new project initiation
 *     description: Create a new project initiation record
 *     tags: [Project Initiations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - project_name
 *               - business_case
 *               - project_sponsor
 *               - initiation_date
 *               - project_type
 *               - priority
 *               - approval_status
 *             properties:
 *               project_id:
 *                 type: string
 *               project_name:
 *                 type: string
 *               business_case:
 *                 type: string
 *               project_sponsor:
 *                 type: string
 *               initiation_date:
 *                 type: string
 *                 format: date-time
 *               project_type:
 *                 type: string
 *               priority:
 *                 type: string
 *               success_criteria:
 *                 type: string
 *               constraints:
 *                 type: string
 *               assumptions:
 *                 type: string
 *               high_level_risks:
 *                 type: string
 *               estimated_duration:
 *                 type: integer
 *               estimated_budget:
 *                 type: integer
 *               approval_status:
 *                 type: string
 *               intake_form_version:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project initiation created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      project_id,
      project_name,
      business_case,
      project_sponsor,
      initiation_date,
      project_type,
      priority,
      success_criteria,
      constraints,
      assumptions,
      high_level_risks,
      estimated_duration,
      estimated_budget,
      approval_status,
      intake_form_version
    } = body;

    // Validation
    if (!project_id || !project_name || !business_case || !project_sponsor || !initiation_date || !project_type || !priority || !approval_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: project_id, project_name, business_case, project_sponsor, initiation_date, project_type, priority, approval_status' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO project_initiations (
        project_id, project_name, business_case, project_sponsor, initiation_date,
        project_type, priority, success_criteria, constraints, assumptions,
        high_level_risks, estimated_duration, estimated_budget, approval_status,
        intake_form_version, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      project_id,
      project_name,
      business_case,
      project_sponsor,
      initiation_date,
      project_type,
      priority,
      success_criteria || null,
      constraints || null,
      assumptions || null,
      high_level_risks || null,
      estimated_duration || null,
      estimated_budget || null,
      approval_status,
      intake_form_version || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project initiation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}