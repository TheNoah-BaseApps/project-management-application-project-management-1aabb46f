import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/change-requests:
 *   get:
 *     summary: Get all change requests
 *     description: Retrieve all change requests with optional filtering and pagination
 *     tags: [Change Request Management]
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

    let sql = 'SELECT * FROM change_requests WHERE 1=1';
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

    sql += ` ORDER BY request_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/change-requests:
 *   post:
 *     summary: Create a new change request
 *     description: Create a new change request record
 *     tags: [Change Request Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - change_request_id
 *               - request_date
 *               - requested_by
 *               - change_type
 *               - description
 *               - priority
 *               - status
 *             properties:
 *               change_request_id:
 *                 type: string
 *               request_date:
 *                 type: string
 *                 format: date-time
 *               requested_by:
 *                 type: string
 *               change_type:
 *                 type: string
 *               description:
 *                 type: string
 *               impact_analysis:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               approval_decision:
 *                 type: string
 *               approved_by:
 *                 type: string
 *               approval_date:
 *                 type: string
 *                 format: date-time
 *               implementation_date:
 *                 type: string
 *                 format: date-time
 *               related_documents:
 *                 type: string
 *               baseline_updates_required:
 *                 type: string
 *               change_board_review_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Change request created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      change_request_id,
      request_date,
      requested_by,
      change_type,
      description,
      impact_analysis,
      priority,
      status,
      approval_decision,
      approved_by,
      approval_date,
      implementation_date,
      related_documents,
      baseline_updates_required,
      change_board_review_date
    } = body;

    if (!change_request_id || !request_date || !requested_by || !change_type || !description || !priority || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO change_requests (
        change_request_id, request_date, requested_by, change_type, description,
        impact_analysis, priority, status, approval_decision, approved_by,
        approval_date, implementation_date, related_documents,
        baseline_updates_required, change_board_review_date,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        change_request_id, request_date, requested_by, change_type, description,
        impact_analysis, priority, status, approval_decision, approved_by,
        approval_date, implementation_date, related_documents,
        baseline_updates_required, change_board_review_date
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating change request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}