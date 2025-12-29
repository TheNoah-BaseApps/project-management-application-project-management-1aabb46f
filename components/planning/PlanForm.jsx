'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanForm({ projectId, existingPlan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    methodology: existingPlan?.methodology || '',
    tools_to_be_used: existingPlan?.tools_to_be_used || '',
    deliverables: existingPlan?.deliverables || '',
    dependencies: existingPlan?.dependencies || '',
    quality_standards: existingPlan?.quality_standards || '',
    communication_plan: existingPlan?.communication_plan || '',
    change_control_process: existingPlan?.change_control_process || '',
    planning_assumptions: existingPlan?.planning_assumptions || '',
    planning_constraints: existingPlan?.planning_constraints || '',
    planning_risks: existingPlan?.planning_risks || '',
    baseline_scope: existingPlan?.baseline_scope || '',
    baseline_schedule: existingPlan?.baseline_schedule || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const url = existingPlan
        ? `/api/project-plans/${existingPlan.id}`
        : `/api/projects/${projectId}/plan`;
      const method = existingPlan ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save project plan');
      }

      toast.success(existingPlan ? 'Plan updated successfully' : 'Plan created successfully');
    } catch (err) {
      console.error('Save plan error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Project Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="methodology">Methodology</Label>
            <Input
              id="methodology"
              placeholder="e.g., Agile, Waterfall, Hybrid"
              value={formData.methodology}
              onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tools_to_be_used">Tools to be Used</Label>
            <Textarea
              id="tools_to_be_used"
              placeholder="List tools and software"
              value={formData.tools_to_be_used}
              onChange={(e) => setFormData({ ...formData, tools_to_be_used: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deliverables & Dependencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deliverables">Deliverables</Label>
            <Textarea
              id="deliverables"
              placeholder="List project deliverables"
              value={formData.deliverables}
              onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependencies">Dependencies</Label>
            <Textarea
              id="dependencies"
              placeholder="List project dependencies"
              value={formData.dependencies}
              onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality & Communication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quality_standards">Quality Standards</Label>
            <Textarea
              id="quality_standards"
              placeholder="Define quality standards and metrics"
              value={formData.quality_standards}
              onChange={(e) => setFormData({ ...formData, quality_standards: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication_plan">Communication Plan</Label>
            <Textarea
              id="communication_plan"
              placeholder="Describe communication strategies"
              value={formData.communication_plan}
              onChange={(e) => setFormData({ ...formData, communication_plan: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="change_control_process">Change Control Process</Label>
            <Textarea
              id="change_control_process"
              placeholder="Define change control procedures"
              value={formData.change_control_process}
              onChange={(e) => setFormData({ ...formData, change_control_process: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assumptions, Constraints & Risks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="planning_assumptions">Assumptions</Label>
            <Textarea
              id="planning_assumptions"
              placeholder="List planning assumptions"
              value={formData.planning_assumptions}
              onChange={(e) => setFormData({ ...formData, planning_assumptions: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planning_constraints">Constraints</Label>
            <Textarea
              id="planning_constraints"
              placeholder="List planning constraints"
              value={formData.planning_constraints}
              onChange={(e) => setFormData({ ...formData, planning_constraints: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planning_risks">Risks</Label>
            <Textarea
              id="planning_risks"
              placeholder="Identify potential risks"
              value={formData.planning_risks}
              onChange={(e) => setFormData({ ...formData, planning_risks: e.target.value })}
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Baselines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseline_scope">Baseline Scope</Label>
            <Textarea
              id="baseline_scope"
              placeholder="Define baseline scope"
              value={formData.baseline_scope}
              onChange={(e) => setFormData({ ...formData, baseline_scope: e.target.value })}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseline_schedule">Baseline Schedule</Label>
            <Textarea
              id="baseline_schedule"
              placeholder="Define baseline schedule"
              value={formData.baseline_schedule}
              onChange={(e) => setFormData({ ...formData, baseline_schedule: e.target.value })}
              rows={4}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            existingPlan ? 'Update Plan' : 'Create Plan'
          )}
        </Button>
      </div>
    </form>
  );
}