'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export default function ForecastChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/analytics/budget-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch forecast');
        
        const data = await response.json();
        setForecast(data.data);
      } catch (err) {
        console.error('Forecast fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
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

  const estimated = forecast?.totalEstimated || 0;
  const actual = forecast?.totalActual || 0;
  const remaining = Math.max(estimated - actual, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Cost Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Estimated</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(estimated)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Actual</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(actual)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(remaining)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm text-gray-600">
                {estimated > 0 ? ((actual / estimated) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full"
                style={{
                  width: `${estimated > 0 ? Math.min((actual / estimated) * 100, 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {actual > estimated && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Budget exceeded by {formatCurrency(actual - estimated)}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}