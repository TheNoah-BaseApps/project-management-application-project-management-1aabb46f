'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const transitions = {
  draft: 'budgeting',
  budgeting: 'planning',
  planning: 'in_progress',
  in_progress: 'completed',
};

export default function TransitionButton({ projectId, currentStatus, onTransitioned }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const nextStatus = transitions[currentStatus];

  if (!nextStatus) {
    return null;
  }

  const handleTransition = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/workflow/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to_workflow: nextStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to transition workflow');
      }

      toast.success(`Project transitioned to ${nextStatus.replace('_', ' ')}`);
      setShowConfirm(false);
      onTransitioned();
    } catch (error) {
      console.error('Transition error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>
        <ArrowRight className="h-4 w-4 mr-2" />
        Move to {nextStatus.replace('_', ' ')}
      </Button>

      <ConfirmModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleTransition}
        title="Transition Workflow"
        description={`Are you sure you want to move this project to ${nextStatus.replace('_', ' ')}?`}
        loading={loading}
      />
    </>
  );
}