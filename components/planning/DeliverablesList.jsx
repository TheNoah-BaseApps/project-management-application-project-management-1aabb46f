'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';

export default function DeliverablesList({ deliverables }) {
  if (!deliverables) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No deliverables defined yet.</p>
        </CardContent>
      </Card>
    );
  }

  const deliverablesList = deliverables.split('\n').filter(d => d.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deliverables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deliverablesList.map((deliverable, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{deliverable}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}