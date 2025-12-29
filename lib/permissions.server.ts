// Server-only permission helpers
// NO "use client" directive
// NO React or hooks
// Import this in API routes and server components

export type UserRole = 'admin' | 'project_manager' | 'team_member' | 'stakeholder';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Role hierarchy: admin > project_manager > team_member > stakeholder
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  project_manager: 3,
  team_member: 2,
  stakeholder: 1,
};

/**
 * Check if user has required role or higher in hierarchy
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can approve budget items
 * Only admins and project managers can approve
 */
export function canApprove(user: User | null): boolean {
  return hasRole(user, 'project_manager');
}

/**
 * Check if user can edit project data
 * Admins, project managers, and team members can edit
 */
export function canEdit(user: User | null): boolean {
  return hasRole(user, 'team_member');
}

/**
 * Check if user can delete records
 * Only admins and project managers can delete
 */
export function canDelete(user: User | null): boolean {
  return hasRole(user, 'project_manager');
}

/**
 * Check if user can create new projects
 * Only admins and project managers can create projects
 */
export function canCreateProject(user: User | null): boolean {
  return hasRole(user, 'project_manager');
}

/**
 * Check if user can view analytics
 * All authenticated users can view analytics
 */
export function canViewAnalytics(user: User | null): boolean {
  return user !== null;
}

/**
 * Check if user can manage users (create, edit, delete users)
 * Only admins can manage users
 */
export function canManageUsers(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user can view audit logs
 * Only admins and project managers can view audit logs
 */
export function canViewAuditLogs(user: User | null): boolean {
  return hasRole(user, 'project_manager');
}

/**
 * Check if user can export data
 * Admins and project managers can export
 */
export function canExport(user: User | null): boolean {
  return hasRole(user, 'project_manager');
}

/**
 * Check if user owns a resource
 */
export function isOwner(user: User | null, ownerId: string): boolean {
  return user?.id === ownerId;
}

/**
 * Check if user can edit a specific resource
 * User can edit if they are the owner OR have edit permissions
 */
export function canEditResource(user: User | null, ownerId?: string): boolean {
  if (!user) return false;
  if (ownerId && isOwner(user, ownerId)) return true;
  return canEdit(user);
}

/**
 * Check if user can delete a specific resource
 * User can delete if they have delete permissions
 * (Ownership doesn't grant delete permission)
 */
export function canDeleteResource(user: User | null): boolean {
  return canDelete(user);
}

/**
 * Get user's permission level description
 */
export function getPermissionLevel(user: User | null): string {
  if (!user) return 'None';
  
  const permissions: string[] = [];
  
  if (canManageUsers(user)) permissions.push('Manage Users');
  if (canApprove(user)) permissions.push('Approve');
  if (canDelete(user)) permissions.push('Delete');
  if (canEdit(user)) permissions.push('Edit');
  if (canViewAnalytics(user)) permissions.push('View');
  
  return permissions.join(', ') || 'View Only';
}