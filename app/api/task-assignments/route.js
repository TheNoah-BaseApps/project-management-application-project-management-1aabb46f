import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/task-assignments:
 *   get:
 *     summary: Get all task assignments
 *     description: Retrieve all task assignments with optional filtering
 *     tags: [Task Assignments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *         description: Filter by assigned person
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
 *         description: List of task assignments
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
    const assigned_to = searchParams.get('assigned_to');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM task_assignments WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (assigned_to) {
      sql += ` AND assigned_to = $${paramIndex}`;
      params.push(assigned_to);
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
    console.error('Error fetching task assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/task-assignments:
 *   post:
 *     summary: Create a new task assignment
 *     description: Create a new task assignment record
 *     tags: [Task Assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - task_name
 *               - assigned_to
 *               - planned_start_date
 *               - planned_end_date
 *               - status
 *               - priority
 *             properties:
 *               task_id:
 *                 type: string
 *               task_name:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *               planned_start_date:
 *                 type: string
 *                 format: date-time
 *               planned_end_date:
 *                 type: string
 *                 format: date-time
 *               actual_start_date:
 *                 type: string
 *                 format: date-time
 *               actual_end_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               completion_percentage:
 *                 type: integer
 *               priority:
 *                 type: string
 *               dependencies:
 *                 type: string
 *               estimated_effort:
 *                 type: integer
 *               actual_effort:
 *                 type: integer
 *               blockers:
 *                 type: string
 *               last_updated_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task assignment created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      task_id,
      task_name,
      assigned_to,
      planned_start_date,
      planned_end_date,
      actual_start_date,
      actual_end_date,
      status,
      completion_percentage,
      priority,
      dependencies,
      estimated_effort,
      actual_effort,
      blockers,
      last_updated_date
    } = body;

    // Validation
    if (!task_id || !task_name || !assigned_to || !planned_start_date || !planned_end_date || !status || !priority) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: task_id, task_name, assigned_to, planned_start_date, planned_end_date, status, priority' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO task_assignments (
        task_id, task_name, assigned_to, planned_start_date, planned_end_date,
        actual_start_date, actual_end_date, status, completion_percentage, priority,
        dependencies, estimated_effort, actual_effort, blockers, last_updated_date,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      task_id,
      task_name,
      assigned_to,
      planned_start_date,
      planned_end_date,
      actual_start_date || null,
      actual_end_date || null,
      status,
      completion_percentage || null,
      priority,
      dependencies || null,
      estimated_effort || null,
      actual_effort || null,
      blockers || null,
      last_updated_date || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}