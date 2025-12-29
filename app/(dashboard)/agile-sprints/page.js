'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Zap, Plus, Pencil, Trash2, Calendar, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AgileSprintsPage() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    sprint_id: '',
    sprint_name: '',
    start_date: '',
    end_date: '',
    sprint_goal: '',
    velocity: '',
    actual_velocity: '',
    daily_scrum_time: '',
    scrum_master: '',
    product_owner: '',
    committed_user_stories: '',
    completed_user_stories: '',
    carry_over_items: '',
    sprint_retrospective_date: '',
    impediments: ''
  });

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    try {
      const response = await fetch('/api/agile-sprints');
      const data = await response.json();
      if (data.success) {
        setSprints(data.data);
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
      toast.error('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/agile-sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          velocity: formData.velocity ? parseInt(formData.velocity) : null,
          actual_velocity: formData.actual_velocity ? parseInt(formData.actual_velocity) : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Sprint created successfully');
        setShowAddModal(false);
        resetForm();
        fetchSprints();
      } else {
        toast.error(data.error || 'Failed to create sprint');
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
      toast.error('Failed to create sprint');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/agile-sprints/${selectedSprint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          velocity: formData.velocity ? parseInt(formData.velocity) : null,
          actual_velocity: formData.actual_velocity ? parseInt(formData.actual_velocity) : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Sprint updated successfully');
        setShowEditModal(false);
        setSelectedSprint(null);
        resetForm();
        fetchSprints();
      } else {
        toast.error(data.error || 'Failed to update sprint');
      }
    } catch (error) {
      console.error('Error updating sprint:', error);
      toast.error('Failed to update sprint');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sprint?')) return;
    
    try {
      const response = await fetch(`/api/agile-sprints/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Sprint deleted successfully');
        fetchSprints();
      } else {
        toast.error(data.error || 'Failed to delete sprint');
      }
    } catch (error) {
      console.error('Error deleting sprint:', error);
      toast.error('Failed to delete sprint');
    }
  };

  const openEditModal = (sprint) => {
    setSelectedSprint(sprint);
    setFormData({
      project_id: sprint.project_id || '',
      sprint_id: sprint.sprint_id || '',
      sprint_name: sprint.sprint_name || '',
      start_date: sprint.start_date ? sprint.start_date.split('T')[0] : '',
      end_date: sprint.end_date ? sprint.end_date.split('T')[0] : '',
      sprint_goal: sprint.sprint_goal || '',
      velocity: sprint.velocity || '',
      actual_velocity: sprint.actual_velocity || '',
      daily_scrum_time: sprint.daily_scrum_time || '',
      scrum_master: sprint.scrum_master || '',
      product_owner: sprint.product_owner || '',
      committed_user_stories: sprint.committed_user_stories || '',
      completed_user_stories: sprint.completed_user_stories || '',
      carry_over_items: sprint.carry_over_items || '',
      sprint_retrospective_date: sprint.sprint_retrospective_date ? sprint.sprint_retrospective_date.split('T')[0] : '',
      impediments: sprint.impediments || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      sprint_id: '',
      sprint_name: '',
      start_date: '',
      end_date: '',
      sprint_goal: '',
      velocity: '',
      actual_velocity: '',
      daily_scrum_time: '',
      scrum_master: '',
      product_owner: '',
      committed_user_stories: '',
      completed_user_stories: '',
      carry_over_items: '',
      sprint_retrospective_date: '',
      impediments: ''
    });
  };

  const calculateCompletionRate = (sprint) => {
    if (!sprint.velocity || !sprint.actual_velocity) return 0;
    return Math.round((sprint.actual_velocity / sprint.velocity) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const activeSprints = sprints.filter(s => new Date(s.end_date) >= new Date());
  const avgVelocity = sprints.length > 0 
    ? Math.round(sprints.reduce((sum, s) => sum + (s.actual_velocity || 0), 0) / sprints.length)
    : 0;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agile Sprint Planning</h1>
          <p className="text-gray-600 mt-1">Manage sprint planning and daily scrum tracking</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sprint
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sprints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Sprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSprints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgVelocity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Open Impediments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {sprints.filter(s => s.impediments).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sprints</CardTitle>
          <CardDescription>View and manage all sprint planning and execution</CardDescription>
        </CardHeader>
        <CardContent>
          {sprints.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sprints yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first sprint</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sprint
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sprint Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Sprint Goal</TableHead>
                    <TableHead>Scrum Master</TableHead>
                    <TableHead>Velocity</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sprints.map((sprint) => {
                    const isActive = new Date(sprint.end_date) >= new Date();
                    const completion = calculateCompletionRate(sprint);
                    return (
                      <TableRow key={sprint.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {sprint.sprint_name}
                            {isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(sprint.start_date).toLocaleDateString()}</div>
                            <div className="text-gray-500">to {new Date(sprint.end_date).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{sprint.sprint_goal}</TableCell>
                        <TableCell>{sprint.scrum_master}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{sprint.actual_velocity || 0} / {sprint.velocity || 0}</div>
                            <div className="text-gray-500">story points</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sprint.velocity && sprint.actual_velocity ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${Math.min(completion, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{completion}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(sprint)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(sprint.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Sprint</DialogTitle>
            <DialogDescription>Create a new sprint for agile project execution</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sprint_id">Sprint ID *</Label>
                <Input
                  id="sprint_id"
                  value={formData.sprint_id}
                  onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
                  placeholder="e.g., SPRINT-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="project_id">Project ID *</Label>
                <Input
                  id="project_id"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sprint_name">Sprint Name *</Label>
              <Input
                id="sprint_name"
                value={formData.sprint_name}
                onChange={(e) => setFormData({ ...formData, sprint_name: e.target.value })}
                placeholder="e.g., Sprint 1 - Q4 2024"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sprint_goal">Sprint Goal *</Label>
              <Textarea
                id="sprint_goal"
                value={formData.sprint_goal}
                onChange={(e) => setFormData({ ...formData, sprint_goal: e.target.value })}
                placeholder="What is the objective of this sprint?"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scrum_master">Scrum Master *</Label>
                <Input
                  id="scrum_master"
                  value={formData.scrum_master}
                  onChange={(e) => setFormData({ ...formData, scrum_master: e.target.value })}
                  placeholder="Name of Scrum Master"
                  required
                />
              </div>
              <div>
                <Label htmlFor="product_owner">Product Owner *</Label>
                <Input
                  id="product_owner"
                  value={formData.product_owner}
                  onChange={(e) => setFormData({ ...formData, product_owner: e.target.value })}
                  placeholder="Name of Product Owner"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="velocity">Planned Velocity</Label>
                <Input
                  id="velocity"
                  type="number"
                  value={formData.velocity}
                  onChange={(e) => setFormData({ ...formData, velocity: e.target.value })}
                  placeholder="Story points"
                />
              </div>
              <div>
                <Label htmlFor="actual_velocity">Actual Velocity</Label>
                <Input
                  id="actual_velocity"
                  type="number"
                  value={formData.actual_velocity}
                  onChange={(e) => setFormData({ ...formData, actual_velocity: e.target.value })}
                  placeholder="Story points"
                />
              </div>
              <div>
                <Label htmlFor="daily_scrum_time">Daily Scrum Time</Label>
                <Input
                  id="daily_scrum_time"
                  type="time"
                  value={formData.daily_scrum_time}
                  onChange={(e) => setFormData({ ...formData, daily_scrum_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="committed_user_stories">Committed User Stories</Label>
              <Textarea
                id="committed_user_stories"
                value={formData.committed_user_stories}
                onChange={(e) => setFormData({ ...formData, committed_user_stories: e.target.value })}
                placeholder="List of committed stories"
              />
            </div>
            <div>
              <Label htmlFor="impediments">Impediments</Label>
              <Textarea
                id="impediments"
                value={formData.impediments}
                onChange={(e) => setFormData({ ...formData, impediments: e.target.value })}
                placeholder="Any blockers or impediments"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Sprint</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sprint</DialogTitle>
            <DialogDescription>Update sprint details and progress</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_sprint_id">Sprint ID *</Label>
                <Input
                  id="edit_sprint_id"
                  value={formData.sprint_id}
                  onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_project_id">Project ID *</Label>
                <Input
                  id="edit_project_id"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_sprint_name">Sprint Name *</Label>
              <Input
                id="edit_sprint_name"
                value={formData.sprint_name}
                onChange={(e) => setFormData({ ...formData, sprint_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_start_date">Start Date *</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_end_date">End Date *</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_sprint_goal">Sprint Goal *</Label>
              <Textarea
                id="edit_sprint_goal"
                value={formData.sprint_goal}
                onChange={(e) => setFormData({ ...formData, sprint_goal: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_scrum_master">Scrum Master *</Label>
                <Input
                  id="edit_scrum_master"
                  value={formData.scrum_master}
                  onChange={(e) => setFormData({ ...formData, scrum_master: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_product_owner">Product Owner *</Label>
                <Input
                  id="edit_product_owner"
                  value={formData.product_owner}
                  onChange={(e) => setFormData({ ...formData, product_owner: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_velocity">Planned Velocity</Label>
                <Input
                  id="edit_velocity"
                  type="number"
                  value={formData.velocity}
                  onChange={(e) => setFormData({ ...formData, velocity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_actual_velocity">Actual Velocity</Label>
                <Input
                  id="edit_actual_velocity"
                  type="number"
                  value={formData.actual_velocity}
                  onChange={(e) => setFormData({ ...formData, actual_velocity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_daily_scrum_time">Daily Scrum Time</Label>
                <Input
                  id="edit_daily_scrum_time"
                  type="time"
                  value={formData.daily_scrum_time}
                  onChange={(e) => setFormData({ ...formData, daily_scrum_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_completed_user_stories">Completed User Stories</Label>
              <Textarea
                id="edit_completed_user_stories"
                value={formData.completed_user_stories}
                onChange={(e) => setFormData({ ...formData, completed_user_stories: e.target.value })}
                placeholder="List of completed stories"
              />
            </div>
            <div>
              <Label htmlFor="edit_carry_over_items">Carry Over Items</Label>
              <Textarea
                id="edit_carry_over_items"
                value={formData.carry_over_items}
                onChange={(e) => setFormData({ ...formData, carry_over_items: e.target.value })}
                placeholder="Items to carry to next sprint"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedSprint(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Sprint</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}