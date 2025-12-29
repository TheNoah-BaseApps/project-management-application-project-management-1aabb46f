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

    // Validate params.id exists
    if (!params?.id) {
      return NextResponse.json(
        { success: false, error: 'Budget item ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid budget item ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { approval_status } = body;

    if (!approval_status) {
      return NextResponse.json(
        { success: false, error: 'Approval status is required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(approval_status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid approval status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // First check if the budget item exists
    const checkResult = await query(
      'SELECT id FROM budget_items WHERE id = $1',
      [params.id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Budget item not found' },
        { status: 404 }
      );
    }

    // Update the budget item with proper SQL syntax
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
        { success: false, error: 'Failed to update budget item' },
        { status: 500 }
      );
    }

    // Log audit trail
    try {
      await logAudit({
        entity_type: 'budget_item',
        entity_id: params.id,
        user_id: payload.id,
        action: 'approve',
        changes: { approval_status },
      });
    } catch (auditError) {
      console.error('Audit logging error:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    // Log comprehensive error details for debugging
    console.error('Approve budget item error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      stack: error.stack,
    });

    // Extract user role from JWT token for role-based error transparency
    let userRole = null;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.substring(7);
        const payload = await verifyToken(token);
        userRole = payload?.role;
      }
    } catch (tokenError) {
      console.error('Error extracting user role:', tokenError);
    }

    // Role-based error transparency:
    // Admin users receive detailed error information for debugging
    // Non-admin users receive generic error messages for security
    let errorResponse;
    if (userRole === 'admin') {
      errorResponse = {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
      };
    } else {
      errorResponse = 'Failed to approve budget item';
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorResponse
      },
      { status: 500 }
    );
  }
}