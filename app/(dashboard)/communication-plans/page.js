'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Plus, Pencil, Trash2, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunicationPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    communication_plan_id: '',
    audience: '',
    message: '',
    frequency: '',
    channel: '',
    owner: '',
    last_sent_date: '',
    next_send_date: '',
    feedback_mechanism: '',
    success_metrics: '',
    escalation_path: '',
    language_requirements: '',
    confidentiality_level: '',
    approval_required: false,
    template_used: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/communication-plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching communication plans:', error);
      toast.error('Failed to load communication plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/communication-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Communication plan created successfully');
        setShowAddModal(false);
        resetForm();
        fetchPlans();
      } else {
        toast.error(data.error || 'Failed to create communication plan');
      }
    } catch (error) {
      console.error('Error creating communication plan:', error);
      toast.error('Failed to create communication plan');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/communication-plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Communication plan updated successfully');
        setShowEditModal(false);
        setSelectedPlan(null);
        resetForm();
        fetchPlans();
      } else {
        toast.error(data.error || 'Failed to update communication plan');
      }
    } catch (error) {
      console.error('Error updating communication plan:', error);
      toast.error('Failed to update communication plan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this communication plan?')) return;
    
    try {
      const response = await fetch(`/api/communication-plans/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Communication plan deleted successfully');
        fetchPlans();
      } else {
        toast.error(data.error || 'Failed to delete communication plan');
      }
    } catch (error) {
      console.error('Error deleting communication plan:', error);
      toast.error('Failed to delete communication plan');
    }
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      project_id: plan.project_id || '',
      communication_plan_id: plan.communication_plan_id || '',
      audience: plan.audience || '',
      message: plan.message || '',
      frequency: plan.frequency || '',
      channel: plan.channel || '',
      owner: plan.owner || '',
      last_sent_date: plan.last_sent_date ? plan.last_sent_date.split('T')[0] : '',
      next_send_date: plan.next_send_date ? plan.next_send_date.split('T')[0] : '',
      feedback_mechanism: plan.feedback_mechanism || '',
      success_metrics: plan.success_metrics || '',
      escalation_path: plan.escalation_path || '',
      language_requirements: plan.language_requirements || '',
      confidentiality_level: plan.confidentiality_level || '',
      approval_required: plan.approval_required || false,
      template_used: plan.template_used || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      communication_plan_id: '',
      audience: '',
      message: '',
      frequency: '',
      channel: '',
      owner: '',
      last_sent_date: '',
      next_send_date: '',
      feedback_mechanism: '',
      success_metrics: '',
      escalation_path: '',
      language_requirements: '',
      confidentiality_level: '',
      approval_required: false,
      template_used: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Plans</h1>
          <p className="text-gray-600 mt-1">Manage project communication strategies and stakeholder engagement</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Communication Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(plans.map(p => p.channel)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Audiences Reached</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(plans.map(p => p.audience)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approval Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter(p => p.approval_required).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Communication Plans</CardTitle>
          <CardDescription>View and manage all project communication strategies</CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No communication plans yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first communication plan</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Communication Plan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan ID</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Next Send</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.communication_plan_id}</TableCell>
                      <TableCell>{plan.audience}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {plan.channel}
                        </span>
                      </TableCell>
                      <TableCell>{plan.frequency}</TableCell>
                      <TableCell>{plan.owner}</TableCell>
                      <TableCell>
                        {plan.next_send_date ? new Date(plan.next_send_date).toLocaleDateString() : 'Not scheduled'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(plan)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Communication Plan</DialogTitle>
            <DialogDescription>Create a new communication strategy for stakeholder engagement</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="communication_plan_id">Plan ID *</Label>
                <Input
                  id="communication_plan_id"
                  value={formData.communication_plan_id}
                  onChange={(e) => setFormData({ ...formData, communication_plan_id: e.target.value })}
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
              <Label htmlFor="audience">Audience *</Label>
              <Input
                id="audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="e.g., Executive Team, Project Sponsors"
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Communication message content"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="As Needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="channel">Channel *</Label>
                <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Dashboard">Dashboard</SelectItem>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner">Owner *</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Communication owner"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confidentiality_level">Confidentiality Level</Label>
                <Select value={formData.confidentiality_level} onValueChange={(value) => setFormData({ ...formData, confidentiality_level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="Confidential">Confidential</SelectItem>
                    <SelectItem value="Restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="last_sent_date">Last Sent Date</Label>
                <Input
                  id="last_sent_date"
                  type="date"
                  value={formData.last_sent_date}
                  onChange={(e) => setFormData({ ...formData, last_sent_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="next_send_date">Next Send Date</Label>
                <Input
                  id="next_send_date"
                  type="date"
                  value={formData.next_send_date}
                  onChange={(e) => setFormData({ ...formData, next_send_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="feedback_mechanism">Feedback Mechanism</Label>
              <Input
                id="feedback_mechanism"
                value={formData.feedback_mechanism}
                onChange={(e) => setFormData({ ...formData, feedback_mechanism: e.target.value })}
                placeholder="How will feedback be collected?"
              />
            </div>
            <div>
              <Label htmlFor="success_metrics">Success Metrics</Label>
              <Textarea
                id="success_metrics"
                value={formData.success_metrics}
                onChange={(e) => setFormData({ ...formData, success_metrics: e.target.value })}
                placeholder="How will success be measured?"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Communication Plan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Communication Plan</DialogTitle>
            <DialogDescription>Update communication strategy details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_communication_plan_id">Plan ID *</Label>
                <Input
                  id="edit_communication_plan_id"
                  value={formData.communication_plan_id}
                  onChange={(e) => setFormData({ ...formData, communication_plan_id: e.target.value })}
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
              <Label htmlFor="edit_audience">Audience *</Label>
              <Input
                id="edit_audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_message">Message *</Label>
              <Textarea
                id="edit_message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="As Needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_channel">Channel *</Label>
                <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Dashboard">Dashboard</SelectItem>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_owner">Owner *</Label>
                <Input
                  id="edit_owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_confidentiality_level">Confidentiality Level</Label>
                <Select value={formData.confidentiality_level} onValueChange={(value) => setFormData({ ...formData, confidentiality_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="Confidential">Confidential</SelectItem>
                    <SelectItem value="Restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_last_sent_date">Last Sent Date</Label>
                <Input
                  id="edit_last_sent_date"
                  type="date"
                  value={formData.last_sent_date}
                  onChange={(e) => setFormData({ ...formData, last_sent_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_next_send_date">Next Send Date</Label>
                <Input
                  id="edit_next_send_date"
                  type="date"
                  value={formData.next_send_date}
                  onChange={(e) => setFormData({ ...formData, next_send_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedPlan(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Communication Plan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}