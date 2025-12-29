'use client';

// Client-side permission hook
// Import permission helpers from server file
import {
  User,
  UserRole,
  hasRole,
  canApprove,
  canEdit,
  canDelete,
  canCreateProject,
  canViewAnalytics,
  canManageUsers,
  canViewAuditLogs,
  canExport,
  isOwner,
  canEditResource,
  canDeleteResource,
  getPermissionLevel,
} from './permissions.server';

export type { User, UserRole };

export interface PermissionHook {
  user: User | null;
  hasRole: (requiredRole: UserRole) => boolean;
  canApprove: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canCreateProject: () => boolean;
  canViewAnalytics: () => boolean;
  canManageUsers: () => boolean;
  canViewAuditLogs: () => boolean;
  canExport: () => boolean;
  isOwner: (ownerId: string) => boolean;
  canEditResource: (ownerId?: string) => boolean;
  canDeleteResource: () => boolean;
  getPermissionLevel: () => string;
}

/**
 * React hook for checking user permissions
 * Use this in client components
 * 
 * @example
 * const { canApprove, canEdit } = usePermissions(user);
 * if (canApprove()) { ... }
 */
export function usePermissions(user: User | null): PermissionHook {
  return {
    user,
    hasRole: (requiredRole: UserRole) => hasRole(user, requiredRole),
    canApprove: () => canApprove(user),
    canEdit: () => canEdit(user),
    canDelete: () => canDelete(user),
    canCreateProject: () => canCreateProject(user),
    canViewAnalytics: () => canViewAnalytics(user),
    canManageUsers: () => canManageUsers(user),
    canViewAuditLogs: () => canViewAuditLogs(user),
    canExport: () => canExport(user),
    isOwner: (ownerId: string) => isOwner(user, ownerId),
    canEditResource: (ownerId?: string) => canEditResource(user, ownerId),
    canDeleteResource: () => canDeleteResource(user),
    getPermissionLevel: () => getPermissionLevel(user),
  };
}

// Re-export server helpers for convenience
export {
  hasRole,
  canApprove,
  canEdit,
  canDelete,
  canCreateProject,
  canViewAnalytics,
  canManageUsers,
  canViewAuditLogs,
  canExport,
  isOwner,
  canEditResource,
  canDeleteResource,
  getPermissionLevel,
};