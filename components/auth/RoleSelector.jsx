'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const roles = [
  { value: 'admin', label: 'Admin', description: 'Full system access' },
  { value: 'manager', label: 'Manager', description: 'Approve budgets and plans' },
  { value: 'team_member', label: 'Team Member', description: 'Create and edit items' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export default function RoleSelector({ value, onChange, disabled }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div>
              <p className="font-medium">{role.label}</p>
              <p className="text-xs text-gray-500">{role.description}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}