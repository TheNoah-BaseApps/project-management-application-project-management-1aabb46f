'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Network,
  Flag,
  CheckCircle,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', href: '/projects' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Network, label: 'WBS Elements', href: '/wbs-elements' },
  { icon: Flag, label: 'Timeline & Milestones', href: '/project-milestones' },
  { icon: FileText, label: 'Audit Logs', href: '/audit-logs' },
  { icon: FileText, label: 'Status Reports', href: '/status-reports' },
  { icon: Users, label: 'Resource Allocations', href: '/resource-allocations' },
  { icon: FileText, label: 'Scope Definitions', href: '/scope-definitions' },
  { icon: Users, label: 'Stakeholders', href: '/stakeholders' },
  { icon: CheckCircle, label: 'Task Assignments', href: '/task-assignments' },
  { icon: FolderPlus, label: 'Project Initiations', href: '/project-initiations' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-white border-r min-h-screen transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}