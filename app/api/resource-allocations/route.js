import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/resource-allocations:
 *   get:
 *     summary: Get all resource allocations
 *     description: Retrieve a list of all resource allocations with optional filtering
 *     tags: [Resource Allocations]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: resource_type
 *         schema:
 *           type: string
 *         description: Filter by resource type
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
 *         description: List of resource allocations retrieved successfully
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
    const project_id = searchParams.get('project_id');
    const resource_type = searchParams.get('resource_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM resource_allocations';
    let params = [];
    let whereConditions = [];
    let paramCount = 1;
    
    if (project_id) {
      whereConditions.push(`project_id = $${paramCount}`);
      params.push(project_id);
      paramCount++;
    }
    
    if (resource_type) {
      whereConditions.push(`resource_type = $${paramCount}`);
      params.push(resource_type);
      paramCount++;
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    sql += ` ORDER BY allocation_start_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching resource allocations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/resource-allocations:
 *   post:
 *     summary: Create a new resource allocation
 *     description: Create a new resource allocation entry
 *     tags: [Resource Allocations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - resource_name
 *               - resource_type
 *               - role
 *               - allocated_hours
 *               - allocation_start_date
 *               - allocation_end_date
 *             properties:
 *               project_id:
 *                 type: string
 *               resource_name:
 *                 type: string
 *               resource_type:
 *                 type: string
 *               role:
 *                 type: string
 *               allocated_hours:
 *                 type: integer
 *               allocation_start_date:
 *                 type: string
 *                 format: date-time
 *               allocation_end_date:
 *                 type: string
 *                 format: date-time
 *               actual_utilization:
 *                 type: integer
 *               skill_set:
 *                 type: string
 *               cost_rate:
 *                 type: integer
 *               availability:
 *                 type: string
 *               overallocation_flag:
 *                 type: boolean
 *               allocation_approval_date:
 *                 type: string
 *                 format: date-time
 *               replacement_resource:
 *                 type: string
 *               allocation_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resource allocation created successfully
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
      resource_name,
      resource_type,
      role,
      allocated_hours,
      allocation_start_date,
      allocation_end_date,
      actual_utilization,
      skill_set,
      cost_rate,
      availability,
      overallocation_flag,
      allocation_approval_date,
      replacement_resource,
      allocation_notes
    } = body;

    // Validation
    if (!project_id || !resource_name || !resource_type || !role || !allocated_hours || !allocation_start_date || !allocation_end_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO resource_allocations (
        id, project_id, resource_name, resource_type, role, allocated_hours,
        allocation_start_date, allocation_end_date, actual_utilization, skill_set,
        cost_rate, availability, overallocation_flag, allocation_approval_date,
        replacement_resource, allocation_notes, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        NOW(), NOW()
      ) RETURNING *
    `;

    const result = await query(sql, [
      project_id,
      resource_name,
      resource_type,
      role,
      allocated_hours,
      allocation_start_date,
      allocation_end_date,
      actual_utilization || null,
      skill_set || null,
      cost_rate || null,
      availability || null,
      overallocation_flag || false,
      allocation_approval_date || null,
      replacement_resource || null,
      allocation_notes || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating resource allocation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}