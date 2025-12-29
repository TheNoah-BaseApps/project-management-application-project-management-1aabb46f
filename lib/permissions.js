'use client';

import { useState, useEffect } from 'react';

export function canApprove(role) {
  return ['admin', 'manager'].includes(role);
}

export function canEdit(role) {
  return ['admin', 'manager', 'team_member'].includes(role);
}

export function canDelete(role) {
  return ['admin', 'manager'].includes(role);
}

export function canView(role) {
  return ['admin', 'manager', 'team_member', 'viewer'].includes(role);
}

export function isAdmin(role) {
  return role === 'admin';
}

export function usePermissions() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setRole(data.data?.role);
        }
      } catch (error) {
        console.error('Fetch user error:', error);
      }
    };

    fetchUser();
  }, []);

  return {
    role,
    canApprove: () => canApprove(role),
    canEdit: () => canEdit(role),
    canDelete: () => canDelete(role),
    canView: () => canView(role),
    isAdmin: () => isAdmin(role),
  };
}