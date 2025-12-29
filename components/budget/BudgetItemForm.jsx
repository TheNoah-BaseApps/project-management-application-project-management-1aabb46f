'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  'Personnel',
  'Equipment',
  'Materials',
  'Services',
  'Travel',
  'Overhead',
  'Contingency',
  'Other',
];

const fundingSources = [
  'Internal Budget',
  'External Grant',
  'Client Funding',
  'Investment',
  'Loan',
  'Other',
];

export default function BudgetItemForm({ projectId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    budget_item_id: '',
    category: '',
    estimated_cost: '',
    actual_cost: '0',
    fiscal_period: '',
    cost_center: '',
    contingency_percentage: '10',
    justification: '',
    funding_source: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/budget-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          estimated_cost: parseFloat(formData.estimated_cost),
          actual_cost: parseFloat(formData.actual_cost),
          contingency_percentage: parseFloat(formData.contingency_percentage),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create budget item');
      }

      toast.success('Budget item created successfully');
      onSuccess();
    } catch (err) {
      console.error('Create budget item error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget_item_id">Item ID</Label>
          <Input
            id="budget_item_id"
            placeholder="e.g., BUD-001"
            value={formData.budget_item_id}
            onChange={(e) => setFormData({ ...formData, budget_item_id: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
          <Input
            id="estimated_cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actual_cost">Actual Cost ($)</Label>
          <Input
            id="actual_cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.actual_cost}
            onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fiscal_period">Fiscal Period</Label>
          <Input
            id="fiscal_period"
            placeholder="e.g., Q1-2024"
            value={formData.fiscal_period}
            onChange={(e) => setFormData({ ...formData, fiscal_period: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_center">Cost Center</Label>
          <Input
            id="cost_center"
            placeholder="e.g., CC-001"
            value={formData.cost_center}
            onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contingency_percentage">Contingency (%)</Label>
          <Input
            id="contingency_percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="10"
            value={formData.contingency_percentage}
            onChange={(e) => setFormData({ ...formData, contingency_percentage: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="funding_source">Funding Source</Label>
          <Select
            value={formData.funding_source}
            onValueChange={(value) => setFormData({ ...formData, funding_source: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {fundingSources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="justification">Justification</Label>
        <Textarea
          id="justification"
          placeholder="Explain the budget item justification"
          value={formData.justification}
          onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Budget Item'
          )}
        </Button>
      </div>
    </form>
  );
}