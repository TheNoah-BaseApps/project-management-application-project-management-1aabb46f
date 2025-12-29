'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function VarianceChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch projects');
        
        const projectsData = await response.json();
        const projects = projectsData.data || [];

        // Fetch budget items for each project
        const varianceData = await Promise.all(
          projects.slice(0, 5).map(async (project) => {
            const budgetResponse = await fetch(`/api/projects/${project.id}/budget-items`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (budgetResponse.ok) {
              const budgetData = await budgetResponse.json();
              const items = budgetData.data || [];
              const totalVariance = items.reduce((sum, item) => sum + parseFloat(item.variance || 0), 0);
              return { name: project.name, variance: totalVariance };
            }

            return { name: project.name, variance: 0 };
          })
        );

        setData(varianceData);
      } catch (err) {
        console.error('Variance data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const maxVariance = Math.max(...data.map(d => Math.abs(d.variance)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Budget Variance by Project
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No variance data available</p>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  <span className={`text-sm font-semibold ${item.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(item.variance).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${item.variance > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{
                      width: `${(Math.abs(item.variance) / maxVariance) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}