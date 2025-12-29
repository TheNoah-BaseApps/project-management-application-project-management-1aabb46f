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
import { FileText, Plus, Search, Edit, Trash2, Calendar, User, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function StatusReportsPage() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [formData, setFormData] = useState({
    project_id: '',
    reporting_period: '',
    report_date: '',
    prepared_by: '',
    schedule_status: 'On Track',
    budget_status: 'On Track',
    scope_status: 'On Track',
    key_accomplishments: '',
    upcoming_milestones: '',
    critical_issues: '',
    risks_overview: '',
    change_request_summary: '',
    forecast_completion_date: '',
    variance_analysis: '',
    stakeholder_feedback: ''
  });

  useEffect(() => {
    fetchReports();
    fetchProjects();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch('/api/status-reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch status reports');
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
      const url = selectedReport 
        ? `/api/status-reports/${selectedReport.id}` 
        : '/api/status-reports';
      const method = selectedReport ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(selectedReport ? 'Report updated successfully' : 'Report created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        fetchReports();
        resetForm();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const res = await fetch(`/api/status-reports/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Report deleted successfully');
        fetchReports();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  }

  function openEditModal(report) {
    setSelectedReport(report);
    setFormData({
      project_id: report.project_id,
      reporting_period: report.reporting_period,
      report_date: report.report_date?.split('T')[0] || '',
      prepared_by: report.prepared_by,
      schedule_status: report.schedule_status,
      budget_status: report.budget_status,
      scope_status: report.scope_status,
      key_accomplishments: report.key_accomplishments || '',
      upcoming_milestones: report.upcoming_milestones || '',
      critical_issues: report.critical_issues || '',
      risks_overview: report.risks_overview || '',
      change_request_summary: report.change_request_summary || '',
      forecast_completion_date: report.forecast_completion_date?.split('T')[0] || '',
      variance_analysis: report.variance_analysis || '',
      stakeholder_feedback: report.stakeholder_feedback || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      project_id: '',
      reporting_period: '',
      report_date: '',
      prepared_by: '',
      schedule_status: 'On Track',
      budget_status: 'On Track',
      scope_status: 'On Track',
      key_accomplishments: '',
      upcoming_milestones: '',
      critical_issues: '',
      risks_overview: '',
      change_request_summary: '',
      forecast_completion_date: '',
      variance_analysis: '',
      stakeholder_feedback: ''
    });
    setSelectedReport(null);
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reporting_period.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.prepared_by.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || report.project_id === filterProject;
    return matchesSearch && matchesProject;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-800';
      case 'At Risk': return 'bg-yellow-100 text-yellow-800';
      case 'Off Track': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: reports.length,
    onTrack: reports.filter(r => r.schedule_status === 'On Track' && r.budget_status === 'On Track').length,
    atRisk: reports.filter(r => r.schedule_status === 'At Risk' || r.budget_status === 'At Risk').length,
    offTrack: reports.filter(r => r.schedule_status === 'Off Track' || r.budget_status === 'Off Track').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Status Reports</h1>
          <p className="text-gray-600 mt-1">Track project progress and performance</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            <FileText className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">On Track</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">At Risk</CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.atRisk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Off Track</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.offTrack}</div>
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
                placeholder="Search by period or preparer..."
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
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first status report</p>
            <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map(report => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {report.reporting_period}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.report_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {report.prepared_by}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(report)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-sm text-gray-600">Schedule</Label>
                    <Badge className={`mt-1 ${getStatusColor(report.schedule_status)}`}>
                      {report.schedule_status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Budget</Label>
                    <Badge className={`mt-1 ${getStatusColor(report.budget_status)}`}>
                      {report.budget_status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Scope</Label>
                    <Badge className={`mt-1 ${getStatusColor(report.scope_status)}`}>
                      {report.scope_status}
                    </Badge>
                  </div>
                </div>
                {report.key_accomplishments && (
                  <div className="mt-3">
                    <Label className="text-sm font-semibold">Key Accomplishments</Label>
                    <p className="text-sm text-gray-700 mt-1">{report.key_accomplishments}</p>
                  </div>
                )}
                {report.critical_issues && (
                  <div className="mt-3">
                    <Label className="text-sm font-semibold text-red-600">Critical Issues</Label>
                    <p className="text-sm text-gray-700 mt-1">{report.critical_issues}</p>
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
            <DialogTitle>{selectedReport ? 'Edit Status Report' : 'Create Status Report'}</DialogTitle>
            <DialogDescription>
              {selectedReport ? 'Update the status report details' : 'Fill in the details for the new status report'}
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
                <Label htmlFor="reporting_period">Reporting Period *</Label>
                <Input
                  id="reporting_period"
                  value={formData.reporting_period}
                  onChange={(e) => setFormData({...formData, reporting_period: e.target.value})}
                  placeholder="e.g., Q1 2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="report_date">Report Date *</Label>
                <Input
                  id="report_date"
                  type="date"
                  value={formData.report_date}
                  onChange={(e) => setFormData({...formData, report_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="prepared_by">Prepared By *</Label>
                <Input
                  id="prepared_by"
                  value={formData.prepared_by}
                  onChange={(e) => setFormData({...formData, prepared_by: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="schedule_status">Schedule Status *</Label>
                <Select value={formData.schedule_status} onValueChange={(value) => setFormData({...formData, schedule_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Off Track">Off Track</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget_status">Budget Status *</Label>
                <Select value={formData.budget_status} onValueChange={(value) => setFormData({...formData, budget_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Off Track">Off Track</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scope_status">Scope Status *</Label>
                <Select value={formData.scope_status} onValueChange={(value) => setFormData({...formData, scope_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Off Track">Off Track</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="forecast_completion_date">Forecast Completion</Label>
                <Input
                  id="forecast_completion_date"
                  type="date"
                  value={formData.forecast_completion_date}
                  onChange={(e) => setFormData({...formData, forecast_completion_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="key_accomplishments">Key Accomplishments</Label>
              <Textarea
                id="key_accomplishments"
                value={formData.key_accomplishments}
                onChange={(e) => setFormData({...formData, key_accomplishments: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="upcoming_milestones">Upcoming Milestones</Label>
              <Textarea
                id="upcoming_milestones"
                value={formData.upcoming_milestones}
                onChange={(e) => setFormData({...formData, upcoming_milestones: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="critical_issues">Critical Issues</Label>
              <Textarea
                id="critical_issues"
                value={formData.critical_issues}
                onChange={(e) => setFormData({...formData, critical_issues: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="risks_overview">Risks Overview</Label>
              <Textarea
                id="risks_overview"
                value={formData.risks_overview}
                onChange={(e) => setFormData({...formData, risks_overview: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="variance_analysis">Variance Analysis</Label>
              <Textarea
                id="variance_analysis"
                value={formData.variance_analysis}
                onChange={(e) => setFormData({...formData, variance_analysis: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="stakeholder_feedback">Stakeholder Feedback</Label>
              <Textarea
                id="stakeholder_feedback"
                value={formData.stakeholder_feedback}
                onChange={(e) => setFormData({...formData, stakeholder_feedback: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { resetForm(); setShowAddModal(false); setShowEditModal(false); }}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedReport ? 'Update Report' : 'Create Report'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}