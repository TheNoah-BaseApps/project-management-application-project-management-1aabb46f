'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export default function AuditLogTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/audit-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch audit logs');
        
        const data = await response.json();
        setLogs(data.data || []);
      } catch (err) {
        console.error('Audit logs fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
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

  const getActionBadge = (action) => {
    switch (action) {
      case 'create':
        return <Badge className="bg-green-100 text-green-800">Created</Badge>;
      case 'update':
        return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
      case 'approve':
        return <Badge className="bg-purple-100 text-purple-800">Approved</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-gray-500">No audit logs yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Changes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="capitalize">{log.entity_type}</TableCell>
              <TableCell>{getActionBadge(log.action)}</TableCell>
              <TableCell>{log.user_name || 'Unknown'}</TableCell>
              <TableCell className="max-w-md">
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-20">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}