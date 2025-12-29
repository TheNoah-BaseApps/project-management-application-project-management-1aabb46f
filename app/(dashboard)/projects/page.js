'use client';

import { useState } from 'react';
import ProjectList from '@/components/projects/ProjectList';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProjectCreated = () => {
    setIsCreateOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      <ProjectList key={refreshKey} />

      <CreateProjectModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}