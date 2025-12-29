'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function RiskTracker({ risks }) {
  if (!risks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No risks identified yet.</p>
        </CardContent>
      </Card>
    );
  }

  const risksList = risks.split('\n').filter(r => r.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Risk Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {risksList.map((risk, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-amber-200 rounded-lg bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{risk}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}