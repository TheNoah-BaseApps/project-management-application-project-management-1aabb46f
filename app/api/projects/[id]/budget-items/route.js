/**
 * @swagger
 * /api/projects/{id}/budget-items:
 *   get:
 *     summary: List budget items for project
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
 *         description: List of budget items
 *   post:
 *     summary: Create budget item for project
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
 *       201:
 *         description: Budget item created
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/database';
import { logAudit } from '@/lib/audit';
import { calculateVariance, calculateForecastRemaining } from '@/lib/calculations';

export async function GET(request, { params }) {
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
      `SELECT b.*, u.name as approved_by_name 
       FROM budget_items b 
       LEFT JOIN users u ON b.approved_by = u.id 
       WHERE b.project_id = $1 
       ORDER BY b.created_at DESC`,
      [params.id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get budget items error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budget items' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const {
      budget_item_id,
      category,
      estimated_cost,
      actual_cost,
      fiscal_period,
      cost_center,
      contingency_percentage,
      justification,
      funding_source,
    } = body;

    if (!budget_item_id || !category || estimated_cost === undefined) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const variance = calculateVariance(estimated_cost, actual_cost || 0);
    const forecastRemaining = calculateForecastRemaining(estimated_cost, actual_cost || 0);

    const result = await query(
      `INSERT INTO budget_items (
        project_id, budget_item_id, category, estimated_cost, actual_cost, 
        variance, fiscal_period, cost_center, approval_status, 
        forecast_remaining, contingency_percentage, justification, 
        funding_source, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        params.id,
        budget_item_id,
        category,
        estimated_cost,
        actual_cost || 0,
        variance,
        fiscal_period,
        cost_center,
        'pending',
        forecastRemaining,
        contingency_percentage || 10,
        justification,
        funding_source,
      ]
    );

    await logAudit({
      entity_type: 'budget_item',
      entity_id: result.rows[0].id,
      user_id: payload.id,
      action: 'create',
      changes: body,
    });

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create budget item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create budget item' },
      { status: 500 }
    );
  }
}