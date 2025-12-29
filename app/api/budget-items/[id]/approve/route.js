/**
 * @swagger
 * /api/budget-items/{id}/approve:
 *   post:
 *     summary: Approve budget item
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               approval_status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Budget item approved
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/database';
import { canApprove } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await verifyToken(authHeader?.substring(7));

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!canApprove(payload.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { approval_status } = body;

    if (!['approved', 'rejected'].includes(approval_status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid approval status' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE budget_items 
       SET approval_status = $1, 
           approved_by = $2, 
           approval_date = NOW(),
           last_review_date = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [approval_status, payload.id, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Budget item not found' },
        { status: 404 }
      );
    }

    await logAudit({
      entity_type: 'budget_item',
      entity_id: params.id,
      user_id: payload.id,
      action: 'approve',
      changes: { approval_status },
    });

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Approve budget item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve budget item' },
      { status: 500 }
    );
  }
}