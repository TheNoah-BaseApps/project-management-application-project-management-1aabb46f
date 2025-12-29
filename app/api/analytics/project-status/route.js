/**
 * @swagger
 * /api/analytics/project-status:
 *   get:
 *     summary: Get project status distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project status distribution
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
      `SELECT status, COUNT(*) as count 
       FROM projects 
       GROUP BY status 
       ORDER BY count DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Project status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project status' },
      { status: 500 }
    );
  }
}