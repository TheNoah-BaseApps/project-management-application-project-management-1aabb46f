import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/wbs-elements:
 *   get:
 *     summary: Get all WBS elements
 *     description: Retrieve all work breakdown structure elements with optional filtering
 *     tags: [WBS Elements]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *         description: Filter by WBS level
 *     responses:
 *       200:
 *         description: List of WBS elements retrieved successfully
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
    const level = searchParams.get('level');

    let sql = 'SELECT * FROM wbs_elements WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (projectId) {
      sql += ` AND project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    if (level) {
      sql += ` AND level = $${paramCount}`;
      params.push(parseInt(level));
      paramCount++;
    }

    sql += ' ORDER BY wbs_code ASC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching WBS elements:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/wbs-elements:
 *   post:
 *     summary: Create new WBS element
 *     description: Add a new work breakdown structure element
 *     tags: [WBS Elements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - wbs_code
 *               - element_name
 *               - level
 *               - responsible_party
 *             properties:
 *               project_id:
 *                 type: string
 *               wbs_code:
 *                 type: string
 *               element_name:
 *                 type: string
 *               level:
 *                 type: integer
 *               parent_element:
 *                 type: string
 *               responsible_party:
 *                 type: string
 *               estimated_effort:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               completion_percentage:
 *                 type: integer
 *               dependencies:
 *                 type: string
 *               deliverables:
 *                 type: string
 *               wbs_version:
 *                 type: string
 *     responses:
 *       201:
 *         description: WBS element created successfully
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
      wbs_code,
      element_name,
      level,
      parent_element,
      responsible_party,
      estimated_effort,
      start_date,
      end_date,
      actual_start_date,
      actual_end_date,
      completion_percentage,
      dependencies,
      deliverables,
      wbs_version,
    } = body;

    // Validation
    if (!project_id || !wbs_code || !element_name || !level || !responsible_party) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO wbs_elements (
        project_id, wbs_code, element_name, level, parent_element,
        responsible_party, estimated_effort, start_date, end_date,
        actual_start_date, actual_end_date, completion_percentage,
        dependencies, deliverables, wbs_version,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        NOW(), NOW()
      ) RETURNING *
    `;

    const result = await query(sql, [
      project_id,
      wbs_code,
      element_name,
      level,
      parent_element || null,
      responsible_party,
      estimated_effort || null,
      start_date || null,
      end_date || null,
      actual_start_date || null,
      actual_end_date || null,
      completion_percentage || 0,
      dependencies || null,
      deliverables || null,
      wbs_version || '1.0',
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating WBS element:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}