'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ApprovalButton from './ApprovalButton';
import VarianceHighlight from './VarianceHighlight';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { toast } from 'sonner';

export default function BudgetTable({ budgetItems, onUpdate }) {
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/budget-items/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete budget item');

      toast.success('Budget item deleted successfully');
      setDeleteId(null);
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete budget item');
    } finally {
      setDeleting(false);
    }
  };

  const getApprovalBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  if (budgetItems.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-gray-500">No budget items yet. Create your first budget item to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Estimated Cost</TableHead>
              <TableHead className="text-right">Actual Cost</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead>Fiscal Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.budget_item_id}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.estimated_cost)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.actual_cost)}</TableCell>
                <TableCell className="text-right">
                  <VarianceHighlight variance={parseFloat(item.variance || 0)} />
                </TableCell>
                <TableCell>{item.fiscal_period}</TableCell>
                <TableCell>{getApprovalBadge(item.approval_status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.approval_status === 'pending' && (
                      <ApprovalButton budgetItemId={item.id} onApproved={onUpdate} />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmModal
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Budget Item"
        description="Are you sure you want to delete this budget item? This action cannot be undone."
        loading={deleting}
      />
    </>
  );
}