import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/status-reports:
 *   get:
 *     summary: Get all project status reports
 *     description: Retrieve a list of all project status reports with optional filtering
 *     tags: [Project Status Reports]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
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
 *         description: List of status reports retrieved successfully
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

    let sql = 'SELECT * FROM project_status_reports';
    let params = [];
    
    if (project_id) {
      sql += ' WHERE project_id = $1';
      params.push(project_id);
      sql += ' ORDER BY report_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY report_date DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching status reports:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/status-reports:
 *   post:
 *     summary: Create a new project status report
 *     description: Create a new status report entry
 *     tags: [Project Status Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - reporting_period
 *               - report_date
 *               - prepared_by
 *               - schedule_status
 *               - budget_status
 *               - scope_status
 *             properties:
 *               project_id:
 *                 type: string
 *               reporting_period:
 *                 type: string
 *               report_date:
 *                 type: string
 *                 format: date-time
 *               prepared_by:
 *                 type: string
 *               schedule_status:
 *                 type: string
 *               budget_status:
 *                 type: string
 *               scope_status:
 *                 type: string
 *               key_accomplishments:
 *                 type: string
 *               upcoming_milestones:
 *                 type: string
 *               critical_issues:
 *                 type: string
 *               risks_overview:
 *                 type: string
 *               change_request_summary:
 *                 type: string
 *               forecast_completion_date:
 *                 type: string
 *                 format: date-time
 *               variance_analysis:
 *                 type: string
 *               stakeholder_feedback:
 *                 type: string
 *     responses:
 *       201:
 *         description: Status report created successfully
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
      reporting_period,
      report_date,
      prepared_by,
      schedule_status,
      budget_status,
      scope_status,
      key_accomplishments,
      upcoming_milestones,
      critical_issues,
      risks_overview,
      change_request_summary,
      forecast_completion_date,
      variance_analysis,
      stakeholder_feedback
    } = body;

    // Validation
    if (!project_id || !reporting_period || !report_date || !prepared_by || !schedule_status || !budget_status || !scope_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO project_status_reports (
        id, project_id, reporting_period, report_date, prepared_by,
        schedule_status, budget_status, scope_status, key_accomplishments,
        upcoming_milestones, critical_issues, risks_overview, change_request_summary,
        forecast_completion_date, variance_analysis, stakeholder_feedback,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        NOW(), NOW()
      ) RETURNING *
    `;

    const result = await query(sql, [
      project_id,
      reporting_period,
      report_date,
      prepared_by,
      schedule_status,
      budget_status,
      scope_status,
      key_accomplishments || null,
      upcoming_milestones || null,
      critical_issues || null,
      risks_overview || null,
      change_request_summary || null,
      forecast_completion_date || null,
      variance_analysis || null,
      stakeholder_feedback || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating status report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}