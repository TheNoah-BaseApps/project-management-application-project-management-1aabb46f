'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileEdit, Plus, Pencil, Trash2, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangeRequestsPage() {
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    change_request_id: '',
    request_date: new Date().toISOString().split('T')[0],
    requested_by: '',
    change_type: 'Scope',
    description: '',
    impact_analysis: '',
    priority: 'Medium',
    status: 'Pending',
    approval_decision: '',
    approved_by: '',
    approval_date: '',
    implementation_date: '',
    related_documents: '',
    baseline_updates_required: '',
    change_board_review_date: ''
  });

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/change-requests');
      const data = await response.json();
      if (data.success) {
        setChangeRequests(data.data);
      } else {
        toast.error('Failed to fetch change requests');
      }
    } catch (error) {
      console.error('Error fetching change requests:', error);
      toast.error('Error loading change requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Change request created successfully');
        setShowAddModal(false);
        resetForm();
        fetchChangeRequests();
      } else {
        toast.error(data.error || 'Failed to create change request');
      }
    } catch (error) {
      console.error('Error creating change request:', error);
      toast.error('Error creating change request');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/change-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Change request updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchChangeRequests();
      } else {
        toast.error(data.error || 'Failed to update change request');
      }
    } catch (error) {
      console.error('Error updating change request:', error);
      toast.error('Error updating change request');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this change request?')) return;

    try {
      const response = await fetch(`/api/change-requests/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Change request deleted successfully');
        fetchChangeRequests();
      } else {
        toast.error(data.error || 'Failed to delete change request');
      }
    } catch (error) {
      console.error('Error deleting change request:', error);
      toast.error('Error deleting change request');
    }
  };

  const openEditModal = (request) => {
    setSelectedRequest(request);
    setFormData({
      change_request_id: request.change_request_id,
      request_date: request.request_date?.split('T')[0] || '',
      requested_by: request.requested_by,
      change_type: request.change_type,
      description: request.description,
      impact_analysis: request.impact_analysis || '',
      priority: request.priority,
      status: request.status,
      approval_decision: request.approval_decision || '',
      approved_by: request.approved_by || '',
      approval_date: request.approval_date?.split('T')[0] || '',
      implementation_date: request.implementation_date?.split('T')[0] || '',
      related_documents: request.related_documents || '',
      baseline_updates_required: request.baseline_updates_required || '',
      change_board_review_date: request.change_board_review_date?.split('T')[0] || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      change_request_id: '',
      request_date: new Date().toISOString().split('T')[0],
      requested_by: '',
      change_type: 'Scope',
      description: '',
      impact_analysis: '',
      priority: 'Medium',
      status: 'Pending',
      approval_decision: '',
      approved_by: '',
      approval_date: '',
      implementation_date: '',
      related_documents: '',
      baseline_updates_required: '',
      change_board_review_date: ''
    });
    setSelectedRequest(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Implemented': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: changeRequests.length,
    pending: changeRequests.filter(cr => cr.status === 'Pending').length,
    approved: changeRequests.filter(cr => cr.status === 'Approved').length,
    rejected: changeRequests.filter(cr => cr.status === 'Rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading change requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Change Request Management</h1>
          <p className="mt-2 text-gray-600">Track and manage project change requests and approvals</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Change Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            <FileEdit className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Requests List</CardTitle>
          <CardDescription>Manage and track all change requests</CardDescription>
        </CardHeader>
        <CardContent>
          {changeRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileEdit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No change requests found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first change request</p>
              <Button onClick={() => setShowAddModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Change Request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.change_request_id}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.change_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.requested_by}</TableCell>
                      <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(request)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(request.id)}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Change Request</DialogTitle>
            <DialogDescription>Create a new change request record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="change_request_id">Change Request ID *</Label>
                <Input
                  id="change_request_id"
                  value={formData.change_request_id}
                  onChange={(e) => setFormData({ ...formData, change_request_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request_date">Request Date *</Label>
                <Input
                  id="request_date"
                  type="date"
                  value={formData.request_date}
                  onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requested_by">Requested By *</Label>
                <Input
                  id="requested_by"
                  value={formData.requested_by}
                  onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="change_type">Change Type *</Label>
                <Select value={formData.change_type} onValueChange={(value) => setFormData({ ...formData, change_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scope">Scope</SelectItem>
                    <SelectItem value="Schedule">Schedule</SelectItem>
                    <SelectItem value="Budget">Budget</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                    <SelectItem value="Resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Implemented">Implemented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact_analysis">Impact Analysis</Label>
              <Textarea
                id="impact_analysis"
                value={formData.impact_analysis}
                onChange={(e) => setFormData({ ...formData, impact_analysis: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Change Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Change Request</DialogTitle>
            <DialogDescription>Update change request details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_change_request_id">Change Request ID *</Label>
                <Input
                  id="edit_change_request_id"
                  value={formData.change_request_id}
                  onChange={(e) => setFormData({ ...formData, change_request_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_request_date">Request Date *</Label>
                <Input
                  id="edit_request_date"
                  type="date"
                  value={formData.request_date}
                  onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description *</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_requested_by">Requested By *</Label>
                <Input
                  id="edit_requested_by"
                  value={formData.requested_by}
                  onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_change_type">Change Type *</Label>
                <Select value={formData.change_type} onValueChange={(value) => setFormData({ ...formData, change_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scope">Scope</SelectItem>
                    <SelectItem value="Schedule">Schedule</SelectItem>
                    <SelectItem value="Budget">Budget</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                    <SelectItem value="Resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Implemented">Implemented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_approval_decision">Approval Decision</Label>
              <Input
                id="edit_approval_decision"
                value={formData.approval_decision}
                onChange={(e) => setFormData({ ...formData, approval_decision: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_approved_by">Approved By</Label>
                <Input
                  id="edit_approved_by"
                  value={formData.approved_by}
                  onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_approval_date">Approval Date</Label>
                <Input
                  id="edit_approval_date"
                  type="date"
                  value={formData.approval_date}
                  onChange={(e) => setFormData({ ...formData, approval_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Change Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}