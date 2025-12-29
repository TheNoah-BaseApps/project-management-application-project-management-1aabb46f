import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/communication-plans:
 *   get:
 *     summary: Get all communication plans
 *     description: Retrieve all communication plans with optional filtering by project_id
 *     tags: [Communication Plans]
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
 *         description: List of communication plans retrieved successfully
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM communication_plans';
    const params = [];
    
    if (project_id) {
      sql += ' WHERE project_id = $1';
      params.push(project_id);
      sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching communication plans:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/communication-plans:
 *   post:
 *     summary: Create a new communication plan
 *     description: Create a new communication plan record
 *     tags: [Communication Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - communication_plan_id
 *               - audience
 *               - message
 *               - frequency
 *               - channel
 *               - owner
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *               communication_plan_id:
 *                 type: string
 *               audience:
 *                 type: string
 *               message:
 *                 type: string
 *               frequency:
 *                 type: string
 *               channel:
 *                 type: string
 *               owner:
 *                 type: string
 *               last_sent_date:
 *                 type: string
 *                 format: date-time
 *               next_send_date:
 *                 type: string
 *                 format: date-time
 *               feedback_mechanism:
 *                 type: string
 *               success_metrics:
 *                 type: string
 *               escalation_path:
 *                 type: string
 *               language_requirements:
 *                 type: string
 *               confidentiality_level:
 *                 type: string
 *               approval_required:
 *                 type: boolean
 *               template_used:
 *                 type: string
 *     responses:
 *       201:
 *         description: Communication plan created successfully
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
      communication_plan_id,
      audience,
      message,
      frequency,
      channel,
      owner,
      last_sent_date,
      next_send_date,
      feedback_mechanism,
      success_metrics,
      escalation_path,
      language_requirements,
      confidentiality_level,
      approval_required,
      template_used
    } = body;

    // Validation
    if (!project_id || !communication_plan_id || !audience || !message || !frequency || !channel || !owner) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO communication_plans (
        project_id, communication_plan_id, audience, message, frequency, channel, owner,
        last_sent_date, next_send_date, feedback_mechanism, success_metrics,
        escalation_path, language_requirements, confidentiality_level,
        approval_required, template_used, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      project_id,
      communication_plan_id,
      audience,
      message,
      frequency,
      channel,
      owner,
      last_sent_date || null,
      next_send_date || null,
      feedback_mechanism || null,
      success_metrics || null,
      escalation_path || null,
      language_requirements || null,
      confidentiality_level || null,
      approval_required || null,
      template_used || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating communication plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}