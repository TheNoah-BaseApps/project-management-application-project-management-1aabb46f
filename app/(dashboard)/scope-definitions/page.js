'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ScopeDefinitionsPage() {
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    scope_statement: '',
    in_scope_items: '',
    out_of_scope_items: '',
    acceptance_criteria: '',
    assumptions: '',
    constraints: '',
    deliverables: '',
    exclusions: '',
    scope_baseline_version: '1.0',
    scope_review_cycle: '',
  });

  useEffect(() => {
    fetchScopes();
  }, []);

  async function fetchScopes() {
    try {
      setLoading(true);
      const response = await fetch('/api/scope-definitions');
      const data = await response.json();
      if (data.success) {
        setScopes(data.data);
      } else {
        toast.error('Failed to fetch scope definitions');
      }
    } catch (error) {
      console.error('Error fetching scope definitions:', error);
      toast.error('Error loading scope definitions');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const response = await fetch('/api/scope-definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Scope definition created successfully');
        setIsCreateOpen(false);
        resetForm();
        fetchScopes();
      } else {
        toast.error(data.error || 'Failed to create scope definition');
      }
    } catch (error) {
      console.error('Error creating scope definition:', error);
      toast.error('Error creating scope definition');
    }
  }

  async function handleUpdate() {
    try {
      const response = await fetch(`/api/scope-definitions/${selectedScope.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Scope definition updated successfully');
        setIsEditOpen(false);
        setSelectedScope(null);
        resetForm();
        fetchScopes();
      } else {
        toast.error(data.error || 'Failed to update scope definition');
      }
    } catch (error) {
      console.error('Error updating scope definition:', error);
      toast.error('Error updating scope definition');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this scope definition?')) return;

    try {
      const response = await fetch(`/api/scope-definitions/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Scope definition deleted successfully');
        fetchScopes();
      } else {
        toast.error(data.error || 'Failed to delete scope definition');
      }
    } catch (error) {
      console.error('Error deleting scope definition:', error);
      toast.error('Error deleting scope definition');
    }
  }

  function handleEdit(scope) {
    setSelectedScope(scope);
    setFormData({
      project_id: scope.project_id || '',
      scope_statement: scope.scope_statement || '',
      in_scope_items: scope.in_scope_items || '',
      out_of_scope_items: scope.out_of_scope_items || '',
      acceptance_criteria: scope.acceptance_criteria || '',
      assumptions: scope.assumptions || '',
      constraints: scope.constraints || '',
      deliverables: scope.deliverables || '',
      exclusions: scope.exclusions || '',
      scope_baseline_version: scope.scope_baseline_version || '1.0',
      scope_review_cycle: scope.scope_review_cycle || '',
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setFormData({
      project_id: '',
      scope_statement: '',
      in_scope_items: '',
      out_of_scope_items: '',
      acceptance_criteria: '',
      assumptions: '',
      constraints: '',
      deliverables: '',
      exclusions: '',
      scope_baseline_version: '1.0',
      scope_review_cycle: '',
    });
  }

  const stats = {
    total: scopes.length,
    approved: scopes.filter(s => s.approved_by).length,
    pending: scopes.filter(s => !s.approved_by).length,
    changes: scopes.reduce((sum, s) => sum + (s.scope_change_count || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scope definitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scope Definitions</h1>
          <p className="mt-2 text-gray-600">Define and manage project scope with approval workflows</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Scope Definition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Scope Definition</DialogTitle>
              <DialogDescription>Define the project scope and boundaries</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project_id">Project ID</Label>
                <Input
                  id="project_id"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  placeholder="Enter project UUID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scope_statement">Scope Statement *</Label>
                <Textarea
                  id="scope_statement"
                  value={formData.scope_statement}
                  onChange={(e) => setFormData({ ...formData, scope_statement: e.target.value })}
                  placeholder="Comprehensive scope statement"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="in_scope_items">In Scope Items</Label>
                <Textarea
                  id="in_scope_items"
                  value={formData.in_scope_items}
                  onChange={(e) => setFormData({ ...formData, in_scope_items: e.target.value })}
                  placeholder="List items included in scope"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="out_of_scope_items">Out of Scope Items</Label>
                <Textarea
                  id="out_of_scope_items"
                  value={formData.out_of_scope_items}
                  onChange={(e) => setFormData({ ...formData, out_of_scope_items: e.target.value })}
                  placeholder="List items excluded from scope"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acceptance_criteria">Acceptance Criteria</Label>
                <Textarea
                  id="acceptance_criteria"
                  value={formData.acceptance_criteria}
                  onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                  placeholder="Define acceptance criteria"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assumptions">Assumptions</Label>
                <Textarea
                  id="assumptions"
                  value={formData.assumptions}
                  onChange={(e) => setFormData({ ...formData, assumptions: e.target.value })}
                  placeholder="Project assumptions"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="constraints">Constraints</Label>
                <Textarea
                  id="constraints"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="Project constraints"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deliverables">Deliverables</Label>
                <Textarea
                  id="deliverables"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  placeholder="Expected deliverables"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exclusions">Exclusions</Label>
                <Textarea
                  id="exclusions"
                  value={formData.exclusions}
                  onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                  placeholder="Specific exclusions"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scope_baseline_version">Baseline Version</Label>
                  <Input
                    id="scope_baseline_version"
                    value={formData.scope_baseline_version}
                    onChange={(e) => setFormData({ ...formData, scope_baseline_version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scope_review_cycle">Review Cycle</Label>
                  <Input
                    id="scope_review_cycle"
                    value={formData.scope_review_cycle}
                    onChange={(e) => setFormData({ ...formData, scope_review_cycle: e.target.value })}
                    placeholder="e.g., Monthly, Quarterly"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Scope Definition</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scopes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.changes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scope Definitions</CardTitle>
          <CardDescription>Manage project scope statements and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          {scopes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No scope definitions</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new scope definition.</p>
              <div className="mt-6">
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Scope Definition
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Scope Statement</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scopes.map((scope) => (
                  <TableRow key={scope.id}>
                    <TableCell className="font-mono text-xs">{scope.project_id?.substring(0, 8)}...</TableCell>
                    <TableCell className="max-w-md truncate">{scope.scope_statement}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{scope.scope_baseline_version}</Badge>
                    </TableCell>
                    <TableCell>{scope.scope_change_count || 0}</TableCell>
                    <TableCell>
                      {scope.approved_by ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(scope)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(scope.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Scope Definition</DialogTitle>
            <DialogDescription>Update the project scope details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_scope_statement">Scope Statement *</Label>
              <Textarea
                id="edit_scope_statement"
                value={formData.scope_statement}
                onChange={(e) => setFormData({ ...formData, scope_statement: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_in_scope_items">In Scope Items</Label>
              <Textarea
                id="edit_in_scope_items"
                value={formData.in_scope_items}
                onChange={(e) => setFormData({ ...formData, in_scope_items: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_out_of_scope_items">Out of Scope Items</Label>
              <Textarea
                id="edit_out_of_scope_items"
                value={formData.out_of_scope_items}
                onChange={(e) => setFormData({ ...formData, out_of_scope_items: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_acceptance_criteria">Acceptance Criteria</Label>
              <Textarea
                id="edit_acceptance_criteria"
                value={formData.acceptance_criteria}
                onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_deliverables">Deliverables</Label>
              <Textarea
                id="edit_deliverables"
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Scope Definition</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}