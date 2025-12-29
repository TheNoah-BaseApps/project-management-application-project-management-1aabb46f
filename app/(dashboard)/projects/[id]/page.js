'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectDetailHeader from '@/components/projects/ProjectDetailHeader';
import WorkflowStepper from '@/components/workflow/WorkflowStepper';
import { AlertCircle, DollarSign, FileText, Settings } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch project details
        const projectResponse = await fetch(`/api/projects/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!projectResponse.ok) {
          if (projectResponse.status === 404) {
            throw new Error('Project not found');
          }
          throw new Error('Failed to fetch project');
        }

        const projectData = await projectResponse.json();
        setProject(projectData.data);

        // Fetch budget items
        const budgetResponse = await fetch(`/api/projects/${params.id}/budget-items`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (budgetResponse.ok) {
          const budgetData = await budgetResponse.json();
          setBudgetItems(budgetData.data || []);
        }

        // Fetch project plan
        const planResponse = await fetch(`/api/projects/${params.id}/plan`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (planResponse.ok) {
          const planData = await planResponse.json();
          setPlan(planData.data);
        }
      } catch (err) {
        console.error('Project fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProjectData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-24 mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const totalEstimated = budgetItems.reduce((sum, item) => sum + parseFloat(item.estimated_cost || 0), 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + parseFloat(item.actual_cost || 0), 0);
  const approvedItems = budgetItems.filter(item => item.approval_status === 'approved').length;

  return (
    <div>
      <ProjectDetailHeader project={project} />

      <WorkflowStepper currentStatus={project.status} className="mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetItems.length}</div>
            <p className="text-sm text-gray-600">{approvedItems} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Estimated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEstimated.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalActual.toFixed(2)}</div>
            <p className={`text-sm ${totalActual > totalEstimated ? 'text-red-600' : 'text-green-600'}`}>
              Variance: ${(totalActual - totalEstimated).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage budget items, track costs, and review approvals
            </p>
            <Button onClick={() => router.push(`/projects/${params.id}/budget`)}>
              <FileText className="h-4 w-4 mr-2" />
              View Budget
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Project Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Define methodology, deliverables, and baselines
            </p>
            <Button
              onClick={() => router.push(`/projects/${params.id}/planning`)}
              disabled={!budgetItems.some(item => item.approval_status === 'approved')}
            >
              <FileText className="h-4 w-4 mr-2" />
              {plan ? 'View Plan' : 'Create Plan'}
            </Button>
            {!budgetItems.some(item => item.approval_status === 'approved') && (
              <p className="text-sm text-amber-600 mt-2">
                Approve at least one budget item first
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}