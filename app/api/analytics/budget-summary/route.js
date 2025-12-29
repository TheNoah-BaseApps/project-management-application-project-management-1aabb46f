/**
 * @swagger
 * /api/analytics/budget-summary:
 *   get:
 *     summary: Get budget analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget summary
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/database';

export async function GET(request) {
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
      `SELECT 
         COALESCE(SUM(estimated_cost), 0) as total_estimated,
         COALESCE(SUM(actual_cost), 0) as total_actual,
         COALESCE(SUM(variance), 0) as total_variance,
         COALESCE(SUM(forecast_remaining), 0) as total_forecast_remaining
       FROM budget_items`
    );

    return NextResponse.json({
      success: true,
      data: {
        totalEstimated: parseFloat(result.rows[0].total_estimated),
        totalActual: parseFloat(result.rows[0].total_actual),
        totalVariance: parseFloat(result.rows[0].total_variance),
        totalForecastRemaining: parseFloat(result.rows[0].total_forecast_remaining),
      },
    });
  } catch (error) {
    console.error('Budget summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budget summary' },
      { status: 500 }
    );
  }
}