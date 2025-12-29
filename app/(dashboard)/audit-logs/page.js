'use client';

import AuditLogTable from '@/components/audit/AuditLogTable';

export default function AuditLogsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Audit Trail</h1>
      <AuditLogTable />
    </div>
  );
}