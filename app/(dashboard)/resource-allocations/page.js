'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Search, Edit, Trash2, Calendar, Briefcase, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ResourceAllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    project_id: '',
    resource_name: '',
    resource_type: 'Human Resource',
    role: '',
    allocated_hours: '',
    allocation_start_date: '',
    allocation_end_date: '',
    actual_utilization: '',
    skill_set: '',
    cost_rate: '',
    availability: 'Full Time',
    overallocation_flag: false,
    allocation_approval_date: '',
    replacement_resource: '',
    allocation_notes: ''
  });

  useEffect(() => {
    fetchAllocations();
    fetchProjects();
  }, []);

  async function fetchAllocations() {
    try {
      const res = await fetch('/api/resource-allocations');
      const data = await res.json();
      if (data.success) {
        setAllocations(data.data);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
      toast.error('Failed to fetch resource allocations');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = selectedAllocation 
        ? `/api/resource-allocations/${selectedAllocation.id}` 
        : '/api/resource-allocations';
      const method = selectedAllocation ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(selectedAllocation ? 'Allocation updated successfully' : 'Allocation created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        fetchAllocations();
        resetForm();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving allocation:', error);
      toast.error('Failed to save allocation');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this allocation?')) return;
    
    try {
      const res = await fetch(`/api/resource-allocations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Allocation deleted successfully');
        fetchAllocations();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast.error('Failed to delete allocation');
    }
  }

  function openEditModal(allocation) {
    setSelectedAllocation(allocation);
    setFormData({
      project_id: allocation.project_id,
      resource_name: allocation.resource_name,
      resource_type: allocation.resource_type,
      role: allocation.role,
      allocated_hours: allocation.allocated_hours,
      allocation_start_date: allocation.allocation_start_date?.split('T')[0] || '',
      allocation_end_date: allocation.allocation_end_date?.split('T')[0] || '',
      actual_utilization: allocation.actual_utilization || '',
      skill_set: allocation.skill_set || '',
      cost_rate: allocation.cost_rate || '',
      availability: allocation.availability || 'Full Time',
      overallocation_flag: allocation.overallocation_flag || false,
      allocation_approval_date: allocation.allocation_approval_date?.split('T')[0] || '',
      replacement_resource: allocation.replacement_resource || '',
      allocation_notes: allocation.allocation_notes || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      project_id: '',
      resource_name: '',
      resource_type: 'Human Resource',
      role: '',
      allocated_hours: '',
      allocation_start_date: '',
      allocation_end_date: '',
      actual_utilization: '',
      skill_set: '',
      cost_rate: '',
      availability: 'Full Time',
      overallocation_flag: false,
      allocation_approval_date: '',
      replacement_resource: '',
      allocation_notes: ''
    });
    setSelectedAllocation(null);
  }

  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = allocation.resource_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allocation.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || allocation.project_id === filterProject;
    const matchesType = filterType === 'all' || allocation.resource_type === filterType;
    return matchesSearch && matchesProject && matchesType;
  });

  const stats = {
    total: allocations.length,
    totalHours: allocations.reduce((sum, a) => sum + (a.allocated_hours || 0), 0),
    overallocated: allocations.filter(a => a.overallocation_flag).length,
    avgUtilization: allocations.length > 0 
      ? Math.round(allocations.reduce((sum, a) => sum + (a.actual_utilization || 0), 0) / allocations.length)
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading allocations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Allocations</h1>
          <p className="text-gray-600 mt-1">Manage resource assignments and utilization</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Allocation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Allocations</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Hours</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalHours.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overallocated</CardTitle>
            <Briefcase className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overallocated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Utilization</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.avgUtilization}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Human Resource">Human Resource</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Material">Material</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Allocations List */}
      {filteredAllocations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No allocations found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first resource allocation</p>
            <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Allocation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAllocations.map(allocation => (
            <Card key={allocation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {allocation.resource_name}
                      {allocation.overallocation_flag && (
                        <Badge variant="destructive" className="ml-2">Overallocated</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {allocation.role}
                      </span>
                      <span>{allocation.resource_type}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {allocation.allocated_hours}h allocated
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(allocation)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(allocation.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Start Date</Label>
                    <p className="text-sm font-medium mt-1">
                      {new Date(allocation.allocation_start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">End Date</Label>
                    <p className="text-sm font-medium mt-1">
                      {new Date(allocation.allocation_end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Availability</Label>
                    <Badge className="mt-1">{allocation.availability}</Badge>
                  </div>
                  {allocation.actual_utilization && (
                    <div>
                      <Label className="text-sm text-gray-600">Utilization</Label>
                      <p className="text-sm font-medium mt-1">{allocation.actual_utilization}%</p>
                    </div>
                  )}
                </div>
                {allocation.skill_set && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Skills</Label>
                    <p className="text-sm mt-1">{allocation.skill_set}</p>
                  </div>
                )}
                {allocation.allocation_notes && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Notes</Label>
                    <p className="text-sm text-gray-700 mt-1">{allocation.allocation_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => { 
        if (!open) { resetForm(); setShowAddModal(false); setShowEditModal(false); }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAllocation ? 'Edit Resource Allocation' : 'Add Resource Allocation'}</DialogTitle>
            <DialogDescription>
              {selectedAllocation ? 'Update the allocation details' : 'Fill in the details for the new resource allocation'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_id">Project *</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData({...formData, project_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resource_name">Resource Name *</Label>
                <Input
                  id="resource_name"
                  value={formData.resource_name}
                  onChange={(e) => setFormData({...formData, resource_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="resource_type">Resource Type *</Label>
                <Select value={formData.resource_type} onValueChange={(value) => setFormData({...formData, resource_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Human Resource">Human Resource</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="e.g., Developer, PM"
                  required
                />
              </div>
              <div>
                <Label htmlFor="allocated_hours">Allocated Hours *</Label>
                <Input
                  id="allocated_hours"
                  type="number"
                  value={formData.allocated_hours}
                  onChange={(e) => setFormData({...formData, allocated_hours: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="actual_utilization">Actual Utilization (%)</Label>
                <Input
                  id="actual_utilization"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.actual_utilization}
                  onChange={(e) => setFormData({...formData, actual_utilization: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="allocation_start_date">Start Date *</Label>
                <Input
                  id="allocation_start_date"
                  type="date"
                  value={formData.allocation_start_date}
                  onChange={(e) => setFormData({...formData, allocation_start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="allocation_end_date">End Date *</Label>
                <Input
                  id="allocation_end_date"
                  type="date"
                  value={formData.allocation_end_date}
                  onChange={(e) => setFormData({...formData, allocation_end_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost_rate">Cost Rate ($/hr)</Label>
                <Input
                  id="cost_rate"
                  type="number"
                  value={formData.cost_rate}
                  onChange={(e) => setFormData({...formData, cost_rate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select value={formData.availability} onValueChange={(value) => setFormData({...formData, availability: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Time">Full Time</SelectItem>
                    <SelectItem value="Part Time">Part Time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="allocation_approval_date">Approval Date</Label>
                <Input
                  id="allocation_approval_date"
                  type="date"
                  value={formData.allocation_approval_date}
                  onChange={(e) => setFormData({...formData, allocation_approval_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="replacement_resource">Replacement Resource</Label>
                <Input
                  id="replacement_resource"
                  value={formData.replacement_resource}
                  onChange={(e) => setFormData({...formData, replacement_resource: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="skill_set">Skill Set</Label>
              <Input
                id="skill_set"
                value={formData.skill_set}
                onChange={(e) => setFormData({...formData, skill_set: e.target.value})}
                placeholder="e.g., React, Node.js, AWS"
              />
            </div>
            <div>
              <Label htmlFor="allocation_notes">Notes</Label>
              <Textarea
                id="allocation_notes"
                value={formData.allocation_notes}
                onChange={(e) => setFormData({...formData, allocation_notes: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overallocation_flag"
                checked={formData.overallocation_flag}
                onCheckedChange={(checked) => setFormData({...formData, overallocation_flag: checked})}
              />
              <Label htmlFor="overallocation_flag" className="cursor-pointer">
                Mark as overallocated
              </Label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { resetForm(); setShowAddModal(false); setShowEditModal(false); }}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedAllocation ? 'Update Allocation' : 'Add Allocation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}