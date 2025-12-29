import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/agile-sprints:
 *   get:
 *     summary: Get all agile sprints
 *     description: Retrieve all agile sprints with optional filtering by project_id
 *     tags: [Agile Sprints]
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
 *         description: List of agile sprints retrieved successfully
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

    let sql = 'SELECT * FROM agile_sprints';
    const params = [];
    
    if (project_id) {
      sql += ' WHERE project_id = $1';
      params.push(project_id);
      sql += ' ORDER BY start_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY start_date DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching agile sprints:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/agile-sprints:
 *   post:
 *     summary: Create a new agile sprint
 *     description: Create a new agile sprint record
 *     tags: [Agile Sprints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - sprint_id
 *               - sprint_name
 *               - start_date
 *               - end_date
 *               - sprint_goal
 *               - scrum_master
 *               - product_owner
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *               sprint_id:
 *                 type: string
 *               sprint_name:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               sprint_goal:
 *                 type: string
 *               velocity:
 *                 type: integer
 *               actual_velocity:
 *                 type: integer
 *               daily_scrum_time:
 *                 type: string
 *               scrum_master:
 *                 type: string
 *               product_owner:
 *                 type: string
 *               committed_user_stories:
 *                 type: string
 *               completed_user_stories:
 *                 type: string
 *               carry_over_items:
 *                 type: string
 *               sprint_retrospective_date:
 *                 type: string
 *                 format: date-time
 *               impediments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agile sprint created successfully
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
      sprint_id,
      sprint_name,
      start_date,
      end_date,
      sprint_goal,
      velocity,
      actual_velocity,
      daily_scrum_time,
      scrum_master,
      product_owner,
      committed_user_stories,
      completed_user_stories,
      carry_over_items,
      sprint_retrospective_date,
      impediments
    } = body;

    // Validation
    if (!project_id || !sprint_id || !sprint_name || !start_date || !end_date || !sprint_goal || !scrum_master || !product_owner) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO agile_sprints (
        project_id, sprint_id, sprint_name, start_date, end_date, sprint_goal,
        velocity, actual_velocity, daily_scrum_time, scrum_master, product_owner,
        committed_user_stories, completed_user_stories, carry_over_items,
        sprint_retrospective_date, impediments, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      project_id,
      sprint_id,
      sprint_name,
      start_date,
      end_date,
      sprint_goal,
      velocity || null,
      actual_velocity || null,
      daily_scrum_time || null,
      scrum_master,
      product_owner,
      committed_user_stories || null,
      completed_user_stories || null,
      carry_over_items || null,
      sprint_retrospective_date || null,
      impediments || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agile sprint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}