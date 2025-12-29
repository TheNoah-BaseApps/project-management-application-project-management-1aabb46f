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
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Edit, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    stakeholder_id: '',
    name: '',
    role: '',
    department: '',
    influence_level: 'Medium',
    interest_level: 'Medium',
    communication_preference: '',
    engagement_strategy: '',
    concerns: '',
    requirements: '',
    satisfaction_level: '',
    is_decision_maker: false,
    stakeholder_category: '',
  });

  useEffect(() => {
    fetchStakeholders();
  }, []);

  async function fetchStakeholders() {
    try {
      setLoading(true);
      const response = await fetch('/api/stakeholders');
      const data = await response.json();
      if (data.success) {
        setStakeholders(data.data);
      } else {
        toast.error('Failed to fetch stakeholders');
      }
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
      toast.error('Error loading stakeholders');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const response = await fetch('/api/stakeholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Stakeholder created successfully');
        setIsCreateOpen(false);
        resetForm();
        fetchStakeholders();
      } else {
        toast.error(data.error || 'Failed to create stakeholder');
      }
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      toast.error('Error creating stakeholder');
    }
  }

  async function handleUpdate() {
    try {
      const response = await fetch(`/api/stakeholders/${selectedStakeholder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Stakeholder updated successfully');
        setIsEditOpen(false);
        setSelectedStakeholder(null);
        resetForm();
        fetchStakeholders();
      } else {
        toast.error(data.error || 'Failed to update stakeholder');
      }
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      toast.error('Error updating stakeholder');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this stakeholder?')) return;

    try {
      const response = await fetch(`/api/stakeholders/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Stakeholder deleted successfully');
        fetchStakeholders();
      } else {
        toast.error(data.error || 'Failed to delete stakeholder');
      }
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast.error('Error deleting stakeholder');
    }
  }

  function handleEdit(stakeholder) {
    setSelectedStakeholder(stakeholder);
    setFormData({
      project_id: stakeholder.project_id || '',
      stakeholder_id: stakeholder.stakeholder_id || '',
      name: stakeholder.name || '',
      role: stakeholder.role || '',
      department: stakeholder.department || '',
      influence_level: stakeholder.influence_level || 'Medium',
      interest_level: stakeholder.interest_level || 'Medium',
      communication_preference: stakeholder.communication_preference || '',
      engagement_strategy: stakeholder.engagement_strategy || '',
      concerns: stakeholder.concerns || '',
      requirements: stakeholder.requirements || '',
      satisfaction_level: stakeholder.satisfaction_level || '',
      is_decision_maker: stakeholder.is_decision_maker || false,
      stakeholder_category: stakeholder.stakeholder_category || '',
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setFormData({
      project_id: '',
      stakeholder_id: '',
      name: '',
      role: '',
      department: '',
      influence_level: 'Medium',
      interest_level: 'Medium',
      communication_preference: '',
      engagement_strategy: '',
      concerns: '',
      requirements: '',
      satisfaction_level: '',
      is_decision_maker: false,
      stakeholder_category: '',
    });
  }

  const stats = {
    total: stakeholders.length,
    highInfluence: stakeholders.filter(s => s.influence_level === 'High').length,
    decisionMakers: stakeholders.filter(s => s.is_decision_maker).length,
    highInterest: stakeholders.filter(s => s.interest_level === 'High').length,
  };

  function getInfluenceIcon(level) {
    if (level === 'High') return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (level === 'Low') return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stakeholders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stakeholders</h1>
          <p className="mt-2 text-gray-600">Identify and manage project stakeholder engagement</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stakeholder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Stakeholder</DialogTitle>
              <DialogDescription>Add a new stakeholder to the project</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="stakeholder_id">Stakeholder ID *</Label>
                  <Input
                    id="stakeholder_id"
                    value={formData.stakeholder_id}
                    onChange={(e) => setFormData({ ...formData, stakeholder_id: e.target.value })}
                    placeholder="Unique stakeholder identifier"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Stakeholder name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Project Sponsor, Team Lead"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Department or organization"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stakeholder_category">Category</Label>
                  <Input
                    id="stakeholder_category"
                    value={formData.stakeholder_category}
                    onChange={(e) => setFormData({ ...formData, stakeholder_category: e.target.value })}
                    placeholder="e.g., Internal, External, Client"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="influence_level">Influence Level *</Label>
                  <Select
                    value={formData.influence_level}
                    onValueChange={(value) => setFormData({ ...formData, influence_level: value })}
                  >
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
                <div className="grid gap-2">
                  <Label htmlFor="interest_level">Interest Level *</Label>
                  <Select
                    value={formData.interest_level}
                    onValueChange={(value) => setFormData({ ...formData, interest_level: value })}
                  >
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="communication_preference">Communication Preference</Label>
                <Input
                  id="communication_preference"
                  value={formData.communication_preference}
                  onChange={(e) => setFormData({ ...formData, communication_preference: e.target.value })}
                  placeholder="e.g., Email, Phone, In-person"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="engagement_strategy">Engagement Strategy</Label>
                <Textarea
                  id="engagement_strategy"
                  value={formData.engagement_strategy}
                  onChange={(e) => setFormData({ ...formData, engagement_strategy: e.target.value })}
                  placeholder="How to engage this stakeholder"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="concerns">Concerns</Label>
                <Textarea
                  id="concerns"
                  value={formData.concerns}
                  onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                  placeholder="Stakeholder concerns or issues"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Stakeholder requirements"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="satisfaction_level">Satisfaction Level</Label>
                  <Select
                    value={formData.satisfaction_level}
                    onValueChange={(value) => setFormData({ ...formData, satisfaction_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Very Satisfied">Very Satisfied</SelectItem>
                      <SelectItem value="Satisfied">Satisfied</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                      <SelectItem value="Dissatisfied">Dissatisfied</SelectItem>
                      <SelectItem value="Very Dissatisfied">Very Dissatisfied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="is_decision_maker"
                    checked={formData.is_decision_maker}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_decision_maker: checked })}
                  />
                  <Label htmlFor="is_decision_maker" className="cursor-pointer">
                    Decision Maker
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Stakeholder</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stakeholders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Influence</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highInfluence}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Makers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.decisionMakers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Interest</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highInterest}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stakeholder Registry</CardTitle>
          <CardDescription>Track and manage project stakeholder relationships</CardDescription>
        </CardHeader>
        <CardContent>
          {stakeholders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No stakeholders</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding stakeholders to your project.</p>
              <div className="mt-6">
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stakeholder
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Influence</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Decision Maker</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakeholders.map((stakeholder) => (
                  <TableRow key={stakeholder.id}>
                    <TableCell className="font-medium">{stakeholder.name}</TableCell>
                    <TableCell>{stakeholder.role}</TableCell>
                    <TableCell>{stakeholder.department || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getInfluenceIcon(stakeholder.influence_level)}
                        <span className="text-sm">{stakeholder.influence_level}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stakeholder.interest_level === 'High' ? 'default' : 'secondary'}>
                        {stakeholder.interest_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {stakeholder.is_decision_maker ? (
                        <Badge className="bg-purple-100 text-purple-800">Yes</Badge>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(stakeholder)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(stakeholder.id)}>
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
            <DialogTitle>Edit Stakeholder</DialogTitle>
            <DialogDescription>Update stakeholder information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_name">Name *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_role">Role *</Label>
                <Input
                  id="edit_role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_influence_level">Influence Level</Label>
                <Select
                  value={formData.influence_level}
                  onValueChange={(value) => setFormData({ ...formData, influence_level: value })}
                >
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
              <div className="grid gap-2">
                <Label htmlFor="edit_interest_level">Interest Level</Label>
                <Select
                  value={formData.interest_level}
                  onValueChange={(value) => setFormData({ ...formData, interest_level: value })}
                >
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_engagement_strategy">Engagement Strategy</Label>
              <Textarea
                id="edit_engagement_strategy"
                value={formData.engagement_strategy}
                onChange={(e) => setFormData({ ...formData, engagement_strategy: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_is_decision_maker"
                checked={formData.is_decision_maker}
                onCheckedChange={(checked) => setFormData({ ...formData, is_decision_maker: checked })}
              />
              <Label htmlFor="edit_is_decision_maker" className="cursor-pointer">
                Decision Maker
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Stakeholder</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}