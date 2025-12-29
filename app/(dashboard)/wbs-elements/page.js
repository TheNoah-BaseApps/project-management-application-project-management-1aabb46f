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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Network, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

export default function WBSElementsPage() {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    project_id: '',
    wbs_code: '',
    element_name: '',
    level: 1,
    parent_element: '',
    responsible_party: '',
    estimated_effort: '',
    start_date: '',
    end_date: '',
    completion_percentage: 0,
    dependencies: '',
    deliverables: '',
    wbs_version: '1.0',
  });

  useEffect(() => {
    fetchElements();
  }, []);

  async function fetchElements() {
    try {
      setLoading(true);
      const response = await fetch('/api/wbs-elements');
      const data = await response.json();

      if (data.success) {
        setElements(data.data);
      } else {
        toast.error('Failed to load WBS elements');
      }
    } catch (error) {
      console.error('Error fetching WBS elements:', error);
      toast.error('Error loading WBS elements');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = selectedElement
        ? `/api/wbs-elements/${selectedElement.id}`
        : '/api/wbs-elements';
      const method = selectedElement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          level: parseInt(formData.level),
          estimated_effort: formData.estimated_effort ? parseInt(formData.estimated_effort) : null,
          completion_percentage: parseInt(formData.completion_percentage),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(selectedElement ? 'WBS element updated' : 'WBS element created');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchElements();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving WBS element');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this WBS element?')) return;

    try {
      const response = await fetch(`/api/wbs-elements/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('WBS element deleted');
        fetchElements();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting element:', error);
      toast.error('Error deleting WBS element');
    }
  }

  function resetForm() {
    setFormData({
      project_id: '',
      wbs_code: '',
      element_name: '',
      level: 1,
      parent_element: '',
      responsible_party: '',
      estimated_effort: '',
      start_date: '',
      end_date: '',
      completion_percentage: 0,
      dependencies: '',
      deliverables: '',
      wbs_version: '1.0',
    });
    setSelectedElement(null);
  }

  function openEditModal(element) {
    setSelectedElement(element);
    setFormData({
      project_id: element.project_id || '',
      wbs_code: element.wbs_code || '',
      element_name: element.element_name || '',
      level: element.level || 1,
      parent_element: element.parent_element || '',
      responsible_party: element.responsible_party || '',
      estimated_effort: element.estimated_effort || '',
      start_date: element.start_date ? element.start_date.split('T')[0] : '',
      end_date: element.end_date ? element.end_date.split('T')[0] : '',
      completion_percentage: element.completion_percentage || 0,
      dependencies: element.dependencies || '',
      deliverables: element.deliverables || '',
      wbs_version: element.wbs_version || '1.0',
    });
    setShowEditModal(true);
  }

  const stats = {
    total: elements.length,
    completed: elements.filter(e => e.completion_percentage === 100).length,
    inProgress: elements.filter(e => e.completion_percentage > 0 && e.completion_percentage < 100).length,
    notStarted: elements.filter(e => e.completion_percentage === 0).length,
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Work Breakdown Structure</h1>
          <p className="text-gray-600 mt-1">Manage project WBS elements and task hierarchy</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add WBS Element
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Elements</CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-600">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>WBS Elements</CardTitle>
          <CardDescription>Hierarchical breakdown of project work</CardDescription>
        </CardHeader>
        <CardContent>
          {elements.length === 0 ? (
            <div className="text-center py-12">
              <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No WBS elements yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first WBS element</p>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add WBS Element
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WBS Code</TableHead>
                  <TableHead>Element Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Responsible Party</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {elements.map((element) => (
                  <TableRow key={element.id}>
                    <TableCell className="font-medium">{element.wbs_code}</TableCell>
                    <TableCell>{element.element_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Level {element.level}</Badge>
                    </TableCell>
                    <TableCell>{element.responsible_party}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${element.completion_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{element.completion_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {element.start_date && (
                        <div className="text-sm">
                          {new Date(element.start_date).toLocaleDateString()} - {' '}
                          {element.end_date ? new Date(element.end_date).toLocaleDateString() : 'N/A'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(element)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(element.id)}
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
            <DialogTitle>{selectedElement ? 'Edit WBS Element' : 'Add WBS Element'}</DialogTitle>
            <DialogDescription>
              {selectedElement ? 'Update WBS element details' : 'Create a new WBS element'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wbs_code">WBS Code *</Label>
                <Input
                  id="wbs_code"
                  value={formData.wbs_code}
                  onChange={(e) => setFormData({ ...formData, wbs_code: e.target.value })}
                  placeholder="1.1.1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="element_name">Element Name *</Label>
              <Input
                id="element_name"
                value={formData.element_name}
                onChange={(e) => setFormData({ ...formData, element_name: e.target.value })}
                placeholder="Task or deliverable name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible_party">Responsible Party *</Label>
                <Input
                  id="responsible_party"
                  value={formData.responsible_party}
                  onChange={(e) => setFormData({ ...formData, responsible_party: e.target.value })}
                  placeholder="Person or team name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="estimated_effort">Estimated Effort (hours)</Label>
                <Input
                  id="estimated_effort"
                  type="number"
                  min="0"
                  value={formData.estimated_effort}
                  onChange={(e) => setFormData({ ...formData, estimated_effort: e.target.value })}
                  placeholder="40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parent_element">Parent Element</Label>
                <Input
                  id="parent_element"
                  value={formData.parent_element}
                  onChange={(e) => setFormData({ ...formData, parent_element: e.target.value })}
                  placeholder="Parent WBS code"
                />
              </div>
              <div>
                <Label htmlFor="completion_percentage">Completion %</Label>
                <Input
                  id="completion_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completion_percentage}
                  onChange={(e) => setFormData({ ...formData, completion_percentage: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dependencies">Dependencies</Label>
              <Textarea
                id="dependencies"
                value={formData.dependencies}
                onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                placeholder="List dependent tasks or elements"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea
                id="deliverables"
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                placeholder="Expected deliverables"
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
                    {selectedElement ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  selectedElement ? 'Update Element' : 'Create Element'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}