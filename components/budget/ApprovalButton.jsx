'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/lib/permissions.client';
import { useAuth } from '@/lib/auth';

export default function ApprovalButton({ budgetItemId, onApproved }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { canApprove } = usePermissions(user);

  if (!canApprove()) {
    return null;
  }

  const handleApprove = async () => {
    setLoading(true);
    try {
      console.log('Approve request initiated:', {
        budgetItemId,
        endpoint: `/api/budget-items/${budgetItemId}/approve`,
        method: 'POST',
        body: { approval_status: 'approved' }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/budget-items/${budgetItemId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approval_status: 'approved' }),
      });

      console.log('Approve response status:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const data = await response.json();
      console.log('Approve response body:', data);

      if (!response.ok) {
        console.error('Approve error response:', {
          status: response.status,
          error: data.error,
          fullResponse: data
        });
        throw new Error(data.error || 'Failed to approve budget item');
      }

      console.log('Approve success response:', data);
      toast.success('Budget item approved successfully');
      setShowConfirm(false);
      onApproved();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="text-green-600 hover:text-green-700"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Approve
      </Button>

      <ConfirmModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleApprove}
        title="Approve Budget Item"
        description="Are you sure you want to approve this budget item? This action will be logged in the audit trail."
        loading={loading}
      />
    </>
  );
}