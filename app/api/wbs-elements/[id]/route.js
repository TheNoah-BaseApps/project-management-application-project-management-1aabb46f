import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/wbs-elements/{id}:
 *   get:
 *     summary: Get WBS element by ID
 *     tags: [WBS Elements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: WBS element retrieved successfully
 *       404:
 *         description: WBS element not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM wbs_elements WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'WBS element not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching WBS element:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/wbs-elements/{id}:
 *   put:
 *     summary: Update WBS element
 *     tags: [WBS Elements]
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
 *         description: WBS element updated successfully
 *       404:
 *         description: WBS element not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
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

    const sql = `
      UPDATE wbs_elements
      SET
        wbs_code = COALESCE($1, wbs_code),
        element_name = COALESCE($2, element_name),
        level = COALESCE($3, level),
        parent_element = COALESCE($4, parent_element),
        responsible_party = COALESCE($5, responsible_party),
        estimated_effort = COALESCE($6, estimated_effort),
        start_date = COALESCE($7, start_date),
        end_date = COALESCE($8, end_date),
        actual_start_date = COALESCE($9, actual_start_date),
        actual_end_date = COALESCE($10, actual_end_date),
        completion_percentage = COALESCE($11, completion_percentage),
        dependencies = COALESCE($12, dependencies),
        deliverables = COALESCE($13, deliverables),
        wbs_version = COALESCE($14, wbs_version),
        updated_at = NOW()
      WHERE id = $15
      RETURNING *
    `;

    const result = await query(sql, [
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
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'WBS element not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating WBS element:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/wbs-elements/{id}:
 *   delete:
 *     summary: Delete WBS element
 *     tags: [WBS Elements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: WBS element deleted successfully
 *       404:
 *         description: WBS element not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'DELETE FROM wbs_elements WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'WBS element not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WBS element deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting WBS element:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}