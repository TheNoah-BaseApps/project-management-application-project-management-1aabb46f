'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

export default function BaselineViewer({ plan }) {
  if (!plan?.planning_approval_date) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Approved Baselines
          </CardTitle>
          <Badge className="bg-blue-100 text-blue-800">
            Approved {new Date(plan.planning_approval_date).toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-blue-900 mb-2">Baseline Scope</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.baseline_scope}</p>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-blue-900 mb-2">Baseline Schedule</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.baseline_schedule}</p>
        </div>
      </CardContent>
    </Card>
  );
}