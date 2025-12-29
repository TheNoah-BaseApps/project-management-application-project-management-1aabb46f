import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: Get all issues
 *     description: Retrieve all issues with optional filtering and pagination
 *     tags: [Issue and Escalation Management]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Successful response
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
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM issues WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      sql += ` AND priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    sql += ` ORDER BY date_raised DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/issues:
 *   post:
 *     summary: Create a new issue
 *     description: Create a new issue record
 *     tags: [Issue and Escalation Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - issue_id
 *               - issue_description
 *               - date_raised
 *               - raised_by
 *               - priority
 *               - severity
 *               - current_owner
 *               - status
 *             properties:
 *               issue_id:
 *                 type: string
 *               issue_description:
 *                 type: string
 *               date_raised:
 *                 type: string
 *                 format: date-time
 *               raised_by:
 *                 type: string
 *               priority:
 *                 type: string
 *               severity:
 *                 type: string
 *               current_owner:
 *                 type: string
 *               status:
 *                 type: string
 *               root_cause:
 *                 type: string
 *               resolution:
 *                 type: string
 *               resolution_date:
 *                 type: string
 *                 format: date-time
 *               escalation_level:
 *                 type: string
 *               escalation_path:
 *                 type: string
 *               related_risks:
 *                 type: string
 *               lessons_learned:
 *                 type: string
 *     responses:
 *       201:
 *         description: Issue created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      issue_id,
      issue_description,
      date_raised,
      raised_by,
      priority,
      severity,
      current_owner,
      status,
      root_cause,
      resolution,
      resolution_date,
      escalation_level,
      escalation_path,
      related_risks,
      lessons_learned
    } = body;

    if (!issue_id || !issue_description || !date_raised || !raised_by || !priority || !severity || !current_owner || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO issues (
        issue_id, issue_description, date_raised, raised_by, priority, severity,
        current_owner, status, root_cause, resolution, resolution_date,
        escalation_level, escalation_path, related_risks, lessons_learned,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        issue_id, issue_description, date_raised, raised_by, priority, severity,
        current_owner, status, root_cause, resolution, resolution_date,
        escalation_level, escalation_path, related_risks, lessons_learned
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}