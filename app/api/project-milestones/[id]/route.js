import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/project-milestones/{id}:
 *   get:
 *     summary: Get milestone by ID
 *     tags: [Project Milestones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone retrieved successfully
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM project_milestones WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching milestone:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/project-milestones/{id}:
 *   put:
 *     summary: Update milestone
 *     tags: [Project Milestones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Milestone updated successfully
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      milestone_name,
      planned_date,
      actual_date,
      status,
      predecessor_milestones,
      successor_milestones,
      acceptance_criteria,
      owner,
      delay_reason,
      baseline_date,
      revised_date,
      completion_evidence,
      impact_assessment,
      celebration_plan,
    } = body;

    const sql = `
      UPDATE project_milestones
      SET
        milestone_name = COALESCE($1, milestone_name),
        planned_date = COALESCE($2, planned_date),
        actual_date = COALESCE($3, actual_date),
        status = COALESCE($4, status),
        predecessor_milestones = COALESCE($5, predecessor_milestones),
        successor_milestones = COALESCE($6, successor_milestones),
        acceptance_criteria = COALESCE($7, acceptance_criteria),
        owner = COALESCE($8, owner),
        delay_reason = COALESCE($9, delay_reason),
        baseline_date = COALESCE($10, baseline_date),
        revised_date = COALESCE($11, revised_date),
        completion_evidence = COALESCE($12, completion_evidence),
        impact_assessment = COALESCE($13, impact_assessment),
        celebration_plan = COALESCE($14, celebration_plan),
        updated_at = NOW()
      WHERE id = $15
      RETURNING *
    `;

    const result = await query(sql, [
      milestone_name,
      planned_date,
      actual_date,
      status,
      predecessor_milestones,
      successor_milestones,
      acceptance_criteria,
      owner,
      delay_reason,
      baseline_date,
      revised_date,
      completion_evidence,
      impact_assessment,
      celebration_plan,
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/project-milestones/{id}:
 *   delete:
 *     summary: Delete milestone
 *     tags: [Project Milestones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone deleted successfully
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'DELETE FROM project_milestones WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}