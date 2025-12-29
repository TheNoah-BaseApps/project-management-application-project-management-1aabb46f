import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/stakeholders:
 *   get:
 *     summary: Get all stakeholders
 *     description: Retrieve all stakeholders with optional filtering by project
 *     tags: [Stakeholders]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by project ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of stakeholders
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
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM stakeholders';
    let params = [];

    if (projectId) {
      sql += ' WHERE project_id = $1';
      params.push(projectId);
      sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching stakeholders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/stakeholders:
 *   post:
 *     summary: Create a new stakeholder
 *     description: Create a new stakeholder for a project
 *     tags: [Stakeholders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - stakeholder_id
 *               - name
 *               - role
 *               - influence_level
 *               - interest_level
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *               stakeholder_id:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               department:
 *                 type: string
 *               influence_level:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *               interest_level:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *     responses:
 *       201:
 *         description: Stakeholder created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      project_id,
      stakeholder_id,
      name,
      role,
      department,
      influence_level,
      interest_level,
      communication_preference,
      engagement_strategy,
      concerns,
      requirements,
      satisfaction_level,
      is_decision_maker,
      stakeholder_category,
    } = body;

    if (!project_id || !stakeholder_id || !name || !role || !influence_level || !interest_level) {
      return NextResponse.json(
        { success: false, error: 'project_id, stakeholder_id, name, role, influence_level, and interest_level are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO stakeholders (
        project_id, stakeholder_id, name, role, department, influence_level,
        interest_level, communication_preference, engagement_strategy, concerns,
        requirements, satisfaction_level, is_decision_maker, stakeholder_category,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        project_id,
        stakeholder_id,
        name,
        role,
        department || null,
        influence_level,
        interest_level,
        communication_preference || null,
        engagement_strategy || null,
        concerns || null,
        requirements || null,
        satisfaction_level || null,
        is_decision_maker || false,
        stakeholder_category || null,
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stakeholder:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}