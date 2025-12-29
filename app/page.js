'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle, DollarSign, FolderKanban, FileText, Users, Network, Flag, FolderPlus, MessageSquare, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">Project Manager</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Log In
              </Button>
              <Button onClick={() => router.push('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Project Management
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive platform for budgeting, planning, execution, and risk management with workflow automation and analytics
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/register')}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>
                  Track costs, variance analysis, and approval workflows
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FolderKanban className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Project Planning</CardTitle>
                <CardDescription>
                  Define methodology, deliverables, and dependencies
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Real-time insights and variance reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Workflow Automation</CardTitle>
                <CardDescription>
                  Sequential workflows from budgeting to planning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Status Reports</CardTitle>
                <CardDescription>
                  Track project progress with comprehensive status reporting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Resource Allocations</CardTitle>
                <CardDescription>
                  Manage resource assignments and track utilization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Network className="h-10 w-10 text-teal-600 mb-2" />
                <CardTitle>WBS Elements</CardTitle>
                <CardDescription>
                  Hierarchical breakdown of project work and tasks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Flag className="h-10 w-10 text-pink-600 mb-2" />
                <CardTitle>Timeline & Milestones</CardTitle>
                <CardDescription>
                  Track project timeline and milestone planning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-amber-600 mb-2" />
                <CardTitle>Scope Definitions</CardTitle>
                <CardDescription>
                  Define and approve project scope with change tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-cyan-600 mb-2" />
                <CardTitle>Stakeholders</CardTitle>
                <CardDescription>
                  Identify and manage stakeholder engagement strategies
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-emerald-600 mb-2" />
                <CardTitle>Task Assignments</CardTitle>
                <CardDescription>
                  Track task progress, assignments, and completion status
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FolderPlus className="h-10 w-10 text-violet-600 mb-2" />
                <CardTitle>Project Initiations</CardTitle>
                <CardDescription>
                  Manage project intake requests and approval workflows
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>Communication Plans</CardTitle>
                <CardDescription>
                  Manage stakeholder communication strategies and engagement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-yellow-600 mb-2" />
                <CardTitle>Agile Sprint Planning</CardTitle>
                <CardDescription>
                  Track sprint planning, velocity, and daily scrum execution
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Role-Based Access Control</h3>
                  <p className="text-gray-600">Admin, Manager, Team Member, and Viewer roles with granular permissions</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cost Forecasting</h3>
                  <p className="text-gray-600">Real-time cost tracking with contingency calculations and variance analysis</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Approval Workflows</h3>
                  <p className="text-gray-600">Multi-level approval system for budgets and project plans</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Audit Trail</h3>
                  <p className="text-gray-600">Complete audit logging for budget changes and approvals</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2024 Project Management Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}