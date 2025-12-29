'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/lib/permissions';

export default function ApprovalButton({ budgetItemId, onApproved }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { canApprove } = usePermissions();

  if (!canApprove()) {
    return null;
  }

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/budget-items/${budgetItemId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approval_status: 'approved' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve budget item');
      }

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