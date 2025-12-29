'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import BudgetTable from '@/components/budget/BudgetTable';
import BudgetItemForm from '@/components/budget/BudgetItemForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BudgetPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

        const budgetResponse = await fetch(`/api/projects/${params.id}/budget-items`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!budgetResponse.ok) throw new Error('Failed to fetch budget items');
        
        const budgetData = await budgetResponse.json();
        setBudgetItems(budgetData.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, refreshKey]);

  const handleBudgetItemCreated = () => {
    setIsCreateOpen(false);
    setRefreshKey(prev => prev + 1);
    toast.success('Budget item created successfully');
  };

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

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/projects/${params.id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-gray-600">{project?.name}</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Budget Item
        </Button>
      </div>

      <BudgetTable
        budgetItems={budgetItems}
        onUpdate={() => setRefreshKey(prev => prev + 1)}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
          </DialogHeader>
          <BudgetItemForm
            projectId={params.id}
            onSuccess={handleBudgetItemCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}