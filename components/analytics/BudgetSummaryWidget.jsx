'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export default function BudgetSummaryWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/analytics/budget-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch budget summary');
        
        const data = await response.json();
        setSummary(data.data);
      } catch (err) {
        console.error('Budget summary fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const variance = summary?.totalVariance || 0;
  const isOverBudget = variance > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Total Estimated</p>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalEstimated || 0)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Total Actual</p>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalActual || 0)}</p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-1">Total Variance</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(variance))}
              </p>
              {isOverBudget ? (
                <TrendingUp className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {isOverBudget ? 'Over budget' : 'Under budget'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}