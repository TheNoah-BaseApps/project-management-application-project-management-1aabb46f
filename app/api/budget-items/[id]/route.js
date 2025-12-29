/**
 * @swagger
 * /api/budget-items/{id}:
 *   patch:
 *     summary: Update budget item
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget item updated
 *   delete:
 *     summary: Delete budget item
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget item deleted
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/database';
import { logAudit } from '@/lib/audit';
import { calculateVariance, calculateForecastRemaining } from '@/lib/calculations';

export async function PATCH(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await verifyToken(authHeader?.substring(7));

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { estimated_cost, actual_cost } = body;

    let variance, forecastRemaining;
    if (estimated_cost !== undefined || actual_cost !== undefined) {
      const current = await query('SELECT estimated_cost, actual_cost FROM budget_items WHERE id = $1', [params.id]);
      const currentEstimated = estimated_cost !== undefined ? estimated_cost : current.rows[0].estimated_cost;
      const currentActual = actual_cost !== undefined ? actual_cost : current.rows[0].actual_cost;
      
      variance = calculateVariance(currentEstimated, currentActual);
      forecastRemaining = calculateForecastRemaining(currentEstimated, currentActual);
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(body).forEach(key => {
      if (body[key] !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(body[key]);
        paramCount++;
      }
    });

    if (variance !== undefined) {
      updateFields.push(`variance = $${paramCount}`);
      updateValues.push(variance);
      paramCount++;
      updateFields.push(`forecast_remaining = $${paramCount}`);
      updateValues.push(forecastRemaining);
      paramCount++;
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(params.id);

    const result = await query(
      `UPDATE budget_items SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      updateValues
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
      action: 'update',
      changes: body,
    });

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update budget item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update budget item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await verifyToken(authHeader?.substring(7));

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await query(
      'DELETE FROM budget_items WHERE id = $1 RETURNING *',
      [params.id]
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
      action: 'delete',
      changes: {},
    });

    return NextResponse.json({
      success: true,
      message: 'Budget item deleted successfully',
    });
  } catch (error) {
    console.error('Delete budget item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete budget item' },
      { status: 500 }
    );
  }
}