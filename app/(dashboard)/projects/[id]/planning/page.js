'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import PlanForm from '@/components/planning/PlanForm';
import BaselineViewer from '@/components/planning/BaselineViewer';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function PlanningPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [plan, setPlan] = useState(null);
  const [canCreatePlan, setCanCreatePlan] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const projectResponse = await fetch(`/api/projects/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!projectResponse.ok) throw new Error('Failed to fetch project');
        
        const projectData = await projectResponse.json();
        setProject(projectData.data);

        // Check if budget items are approved
        const budgetResponse = await fetch(`/api/projects/${params.id}/budget-items`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (budgetResponse.ok) {
          const budgetData = await budgetResponse.json();
          const hasApprovedItems = (budgetData.data || []).some(item => item.approval_status === 'approved');
          setCanCreatePlan(hasApprovedItems);
        }

        const planResponse = await fetch(`/api/projects/${params.id}/plan`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (planResponse.ok) {
          const planData = await planResponse.json();
          if (planData.data) {
            setPlan(planData.data);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96" />
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

  if (!canCreatePlan && !plan) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/projects/${params.id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Project Planning</h1>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to approve at least one budget item before creating a project plan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/projects/${params.id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Project Planning</h1>
          <p className="text-gray-600">{project?.name}</p>
        </div>
      </div>

      {plan ? (
        <div className="space-y-6">
          <BaselineViewer plan={plan} />
          <PlanForm projectId={params.id} existingPlan={plan} />
        </div>
      ) : (
        <PlanForm projectId={params.id} />
      )}
    </div>
  );
}