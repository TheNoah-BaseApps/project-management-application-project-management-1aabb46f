'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Flag, Plus, Edit, Trash2, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ProjectMilestonesPage() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    project_id: '',
    milestone_name: '',
    planned_date: '',
    actual_date: '',
    status: 'Planned',
    predecessor_milestones: '',
    successor_milestones: '',
    acceptance_criteria: '',
    owner: '',
    delay_reason: '',
    baseline_date: '',
    revised_date: '',
    completion_evidence: '',
    impact_assessment: '',
    celebration_plan: '',
  });

  useEffect(() => {
    fetchMilestones();
  }, []);

  async function fetchMilestones() {
    try {
      setLoading(true);
      const response = await fetch('/api/project-milestones');
      const data = await response.json();

      if (data.success) {
        setMilestones(data.data);
      } else {
        toast.error('Failed to load milestones');
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Error loading milestones');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = selectedMilestone
        ? `/api/project-milestones/${selectedMilestone.id}`
        : '/api/project-milestones';
      const method = selectedMilestone ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(selectedMilestone ? 'Milestone updated' : 'Milestone created');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchMilestones();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving milestone');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      const response = await fetch(`/api/project-milestones/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Milestone deleted');
        fetchMilestones();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Error deleting milestone');
    }
  }

  function resetForm() {
    setFormData({
      project_id: '',
      milestone_name: '',
      planned_date: '',
      actual_date: '',
      status: 'Planned',
      predecessor_milestones: '',
      successor_milestones: '',
      acceptance_criteria: '',
      owner: '',
      delay_reason: '',
      baseline_date: '',
      revised_date: '',
      completion_evidence: '',
      impact_assessment: '',
      celebration_plan: '',
    });
    setSelectedMilestone(null);
  }

  function openEditModal(milestone) {
    setSelectedMilestone(milestone);
    setFormData({
      project_id: milestone.project_id || '',
      milestone_name: milestone.milestone_name || '',
      planned_date: milestone.planned_date ? milestone.planned_date.split('T')[0] : '',
      actual_date: milestone.actual_date ? milestone.actual_date.split('T')[0] : '',
      status: milestone.status || 'Planned',
      predecessor_milestones: milestone.predecessor_milestones || '',
      successor_milestones: milestone.successor_milestones || '',
      acceptance_criteria: milestone.acceptance_criteria || '',
      owner: milestone.owner || '',
      delay_reason: milestone.delay_reason || '',
      baseline_date: milestone.baseline_date ? milestone.baseline_date.split('T')[0] : '',
      revised_date: milestone.revised_date ? milestone.revised_date.split('T')[0] : '',
      completion_evidence: milestone.completion_evidence || '',
      impact_assessment: milestone.impact_assessment || '',
      celebration_plan: milestone.celebration_plan || '',
    });
    setShowEditModal(true);
  }

  const stats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'Completed').length,
    inProgress: milestones.filter(m => m.status === 'In Progress').length,
    delayed: milestones.filter(m => m.status === 'Delayed').length,
  };

  function getStatusBadge(status) {
    const variants = {
      'Completed': { variant: 'default', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      'In Progress': { variant: 'default', className: 'bg-blue-100 text-blue-800', icon: Clock },
      'Delayed': { variant: 'default', className: 'bg-red-100 text-red-800', icon: AlertCircle },
      'Planned': { variant: 'outline', className: '', icon: Flag },
    };
    const config = variants[status] || variants['Planned'];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timeline & Milestones</h1>
          <p className="text-gray-600 mt-1">Track project timeline and milestone planning</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Delayed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.delayed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Milestones</CardTitle>
          <CardDescription>Timeline planning and milestone tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first project milestone</p>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milestone Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead>Actual Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((milestone) => (
                  <TableRow key={milestone.id}>
                    <TableCell className="font-medium">{milestone.milestone_name}</TableCell>
                    <TableCell>{milestone.owner}</TableCell>
                    <TableCell>
                      {milestone.planned_date
                        ? new Date(milestone.planned_date).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {milestone.actual_date
                        ? new Date(milestone.actual_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(milestone)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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

      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMilestone ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
            <DialogDescription>
              {selectedMilestone ? 'Update milestone details' : 'Create a new project milestone'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="milestone_name">Milestone Name *</Label>
              <Input
                id="milestone_name"
                value={formData.milestone_name}
                onChange={(e) => setFormData({ ...formData, milestone_name: e.target.value })}
                placeholder="Phase 1 Completion"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner">Owner *</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Person responsible"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planned_date">Planned Date *</Label>
                <Input
                  id="planned_date"
                  type="date"
                  value={formData.planned_date}
                  onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="actual_date">Actual Date</Label>
                <Input
                  id="actual_date"
                  type="date"
                  value={formData.actual_date}
                  onChange={(e) => setFormData({ ...formData, actual_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseline_date">Baseline Date</Label>
                <Input
                  id="baseline_date"
                  type="date"
                  value={formData.baseline_date}
                  onChange={(e) => setFormData({ ...formData, baseline_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="revised_date">Revised Date</Label>
                <Input
                  id="revised_date"
                  type="date"
                  value={formData.revised_date}
                  onChange={(e) => setFormData({ ...formData, revised_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="acceptance_criteria">Acceptance Criteria</Label>
              <Textarea
                id="acceptance_criteria"
                value={formData.acceptance_criteria}
                onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                placeholder="Define what constitutes completion"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="predecessor_milestones">Predecessor Milestones</Label>
                <Input
                  id="predecessor_milestones"
                  value={formData.predecessor_milestones}
                  onChange={(e) => setFormData({ ...formData, predecessor_milestones: e.target.value })}
                  placeholder="Comma-separated IDs"
                />
              </div>
              <div>
                <Label htmlFor="successor_milestones">Successor Milestones</Label>
                <Input
                  id="successor_milestones"
                  value={formData.successor_milestones}
                  onChange={(e) => setFormData({ ...formData, successor_milestones: e.target.value })}
                  placeholder="Comma-separated IDs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="delay_reason">Delay Reason (if applicable)</Label>
              <Textarea
                id="delay_reason"
                value={formData.delay_reason}
                onChange={(e) => setFormData({ ...formData, delay_reason: e.target.value })}
                placeholder="Explain any delays"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="impact_assessment">Impact Assessment</Label>
              <Textarea
                id="impact_assessment"
                value={formData.impact_assessment}
                onChange={(e) => setFormData({ ...formData, impact_assessment: e.target.value })}
                placeholder="Assess impact on project timeline"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="completion_evidence">Completion Evidence</Label>
              <Textarea
                id="completion_evidence"
                value={formData.completion_evidence}
                onChange={(e) => setFormData({ ...formData, completion_evidence: e.target.value })}
                placeholder="Evidence of milestone completion"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="celebration_plan">Celebration Plan</Label>
              <Textarea
                id="celebration_plan"
                value={formData.celebration_plan}
                onChange={(e) => setFormData({ ...formData, celebration_plan: e.target.value })}
                placeholder="How to celebrate this milestone"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {selectedMilestone ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  selectedMilestone ? 'Update Milestone' : 'Create Milestone'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}