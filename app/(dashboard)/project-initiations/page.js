'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2, FileText, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectInitiationsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    business_case: '',
    project_sponsor: '',
    initiation_date: '',
    project_type: 'Internal',
    priority: 'Medium',
    success_criteria: '',
    constraints: '',
    assumptions: '',
    high_level_risks: '',
    estimated_duration: '',
    estimated_budget: '',
    approval_status: 'Pending',
    intake_form_version: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/project-initiations');
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        toast.error('Failed to fetch project initiations');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Error loading project initiations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/project-initiations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Project initiation created successfully');
        setShowAddModal(false);
        fetchProjects();
        resetForm();
      } else {
        toast.error(data.error || 'Failed to create project initiation');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error creating project initiation');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/project-initiations/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Project initiation updated successfully');
        setShowEditModal(false);
        fetchProjects();
        resetForm();
      } else {
        toast.error(data.error || 'Failed to update project initiation');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Error updating project initiation');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project initiation?')) return;

    try {
      const response = await fetch(`/api/project-initiations/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Project initiation deleted successfully');
        fetchProjects();
      } else {
        toast.error(data.error || 'Failed to delete project initiation');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project initiation');
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      project_id: project.project_id || '',
      project_name: project.project_name || '',
      business_case: project.business_case || '',
      project_sponsor: project.project_sponsor || '',
      initiation_date: project.initiation_date ? new Date(project.initiation_date).toISOString().split('T')[0] : '',
      project_type: project.project_type || 'Internal',
      priority: project.priority || 'Medium',
      success_criteria: project.success_criteria || '',
      constraints: project.constraints || '',
      assumptions: project.assumptions || '',
      high_level_risks: project.high_level_risks || '',
      estimated_duration: project.estimated_duration || '',
      estimated_budget: project.estimated_budget || '',
      approval_status: project.approval_status || 'Pending',
      intake_form_version: project.intake_form_version || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      project_name: '',
      business_case: '',
      project_sponsor: '',
      initiation_date: '',
      project_type: 'Internal',
      priority: 'Medium',
      success_criteria: '',
      constraints: '',
      assumptions: '',
      high_level_risks: '',
      estimated_duration: '',
      estimated_budget: '',
      approval_status: 'Pending',
      intake_form_version: ''
    });
    setSelectedProject(null);
  };

  const getStatusStats = () => {
    const stats = {
      total: projects.length,
      pending: projects.filter(p => p.approval_status === 'Pending').length,
      approved: projects.filter(p => p.approval_status === 'Approved').length,
      rejected: projects.filter(p => p.approval_status === 'Rejected').length
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Initiations</h1>
            <p className="text-gray-500 mt-1">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Initiations</h1>
          <p className="text-gray-500 mt-1">Manage project intake and initiation process</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project Intake
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.pending}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold">{stats.approved}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Intake List</CardTitle>
          <CardDescription>View and manage all project initiation requests</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No project initiations found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first project intake request</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project Intake
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Initiation Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.project_id}</TableCell>
                    <TableCell>{project.project_name}</TableCell>
                    <TableCell>{project.project_sponsor}</TableCell>
                    <TableCell>{project.project_type}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.priority === 'High' ? 'bg-red-100 text-red-800' :
                        project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.approval_status === 'Approved' ? 'bg-green-100 text-green-800' :
                        project.approval_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.approval_status}
                      </span>
                    </TableCell>
                    <TableCell>{project.initiation_date ? new Date(project.initiation_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
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

      {/* Add Project Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Project Intake</DialogTitle>
            <DialogDescription>Create a new project initiation request</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project ID *</Label>
                <Input
                  id="project_id"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_case">Business Case *</Label>
              <Textarea
                id="business_case"
                value={formData.business_case}
                onChange={(e) => setFormData({ ...formData, business_case: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_sponsor">Project Sponsor *</Label>
                <Input
                  id="project_sponsor"
                  value={formData.project_sponsor}
                  onChange={(e) => setFormData({ ...formData, project_sponsor: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initiation_date">Initiation Date *</Label>
                <Input
                  id="initiation_date"
                  type="date"
                  value={formData.initiation_date}
                  onChange={(e) => setFormData({ ...formData, initiation_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type *</Label>
                <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                    <SelectItem value="Strategic">Strategic</SelectItem>
                    <SelectItem value="Operational">Operational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval_status">Approval Status *</Label>
                <Select value={formData.approval_status} onValueChange={(value) => setFormData({ ...formData, approval_status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="success_criteria">Success Criteria</Label>
              <Textarea
                id="success_criteria"
                value={formData.success_criteria}
                onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints</Label>
                <Textarea
                  id="constraints"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assumptions">Assumptions</Label>
                <Textarea
                  id="assumptions"
                  value={formData.assumptions}
                  onChange={(e) => setFormData({ ...formData, assumptions: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="high_level_risks">High Level Risks</Label>
              <Textarea
                id="high_level_risks"
                value={formData.high_level_risks}
                onChange={(e) => setFormData({ ...formData, high_level_risks: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_duration">Estimated Duration (days)</Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_budget">Estimated Budget ($)</Label>
                <Input
                  id="estimated_budget"
                  type="number"
                  value={formData.estimated_budget}
                  onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intake_form_version">Form Version</Label>
                <Input
                  id="intake_form_version"
                  value={formData.intake_form_version}
                  onChange={(e) => setFormData({ ...formData, intake_form_version: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Project Intake</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project Initiation</DialogTitle>
            <DialogDescription>Update project initiation details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_project_id">Project ID *</Label>
                <Input
                  id="edit_project_id"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_project_name">Project Name *</Label>
                <Input
                  id="edit_project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_business_case">Business Case *</Label>
              <Textarea
                id="edit_business_case"
                value={formData.business_case}
                onChange={(e) => setFormData({ ...formData, business_case: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_project_sponsor">Project Sponsor *</Label>
                <Input
                  id="edit_project_sponsor"
                  value={formData.project_sponsor}
                  onChange={(e) => setFormData({ ...formData, project_sponsor: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_initiation_date">Initiation Date *</Label>
                <Input
                  id="edit_initiation_date"
                  type="date"
                  value={formData.initiation_date}
                  onChange={(e) => setFormData({ ...formData, initiation_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_project_type">Project Type *</Label>
                <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                    <SelectItem value="Strategic">Strategic</SelectItem>
                    <SelectItem value="Operational">Operational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_approval_status">Approval Status *</Label>
                <Select value={formData.approval_status} onValueChange={(value) => setFormData({ ...formData, approval_status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_success_criteria">Success Criteria</Label>
              <Textarea
                id="edit_success_criteria"
                value={formData.success_criteria}
                onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_constraints">Constraints</Label>
                <Textarea
                  id="edit_constraints"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_assumptions">Assumptions</Label>
                <Textarea
                  id="edit_assumptions"
                  value={formData.assumptions}
                  onChange={(e) => setFormData({ ...formData, assumptions: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_high_level_risks">High Level Risks</Label>
              <Textarea
                id="edit_high_level_risks"
                value={formData.high_level_risks}
                onChange={(e) => setFormData({ ...formData, high_level_risks: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_estimated_duration">Estimated Duration (days)</Label>
                <Input
                  id="edit_estimated_duration"
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_estimated_budget">Estimated Budget ($)</Label>
                <Input
                  id="edit_estimated_budget"
                  type="number"
                  value={formData.estimated_budget}
                  onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_intake_form_version">Form Version</Label>
                <Input
                  id="edit_intake_form_version"
                  value={formData.intake_form_version}
                  onChange={(e) => setFormData({ ...formData, intake_form_version: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}