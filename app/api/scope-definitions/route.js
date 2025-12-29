import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/scope-definitions:
 *   get:
 *     summary: Get all scope definitions
 *     description: Retrieve all scope definitions with optional filtering by project
 *     tags: [Scope Definitions]
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
 *         description: List of scope definitions
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

    let sql = 'SELECT * FROM scope_definitions';
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
    console.error('Error fetching scope definitions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/scope-definitions:
 *   post:
 *     summary: Create a new scope definition
 *     description: Create a new scope definition for a project
 *     tags: [Scope Definitions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - scope_statement
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *               scope_statement:
 *                 type: string
 *               in_scope_items:
 *                 type: string
 *               out_of_scope_items:
 *                 type: string
 *               acceptance_criteria:
 *                 type: string
 *               assumptions:
 *                 type: string
 *               constraints:
 *                 type: string
 *               deliverables:
 *                 type: string
 *               exclusions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Scope definition created successfully
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
      scope_statement,
      in_scope_items,
      out_of_scope_items,
      acceptance_criteria,
      assumptions,
      constraints,
      deliverables,
      exclusions,
      scope_baseline_version,
      scope_review_cycle,
    } = body;

    if (!project_id || !scope_statement) {
      return NextResponse.json(
        { success: false, error: 'project_id and scope_statement are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO scope_definitions (
        project_id, scope_statement, in_scope_items, out_of_scope_items,
        acceptance_criteria, assumptions, constraints, deliverables, exclusions,
        scope_baseline_version, scope_review_cycle, scope_change_count,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        project_id,
        scope_statement,
        in_scope_items || null,
        out_of_scope_items || null,
        acceptance_criteria || null,
        assumptions || null,
        constraints || null,
        deliverables || null,
        exclusions || null,
        scope_baseline_version || '1.0',
        scope_review_cycle || null,
        0,
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating scope definition:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}