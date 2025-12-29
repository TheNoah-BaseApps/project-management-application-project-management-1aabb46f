'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, AlertCircle } from 'lucide-react';

export default function ProjectStatusWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/analytics/project-status', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch project status');
        
        const data = await response.json();
        setStatusData(data.data || []);
      } catch (err) {
        console.error('Project status fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
      case 'planning':
      case 'budgeting':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Project Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {statusData.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No projects yet</p>
        ) : (
          <div className="space-y-4">
            {statusData.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                    style={{
                      width: `${(item.count / statusData.reduce((sum, s) => sum + parseInt(s.count), 0)) * 100}%`,
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