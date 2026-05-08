import { ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Role } from '@/types';

interface CanProps {
  roles?: Role[];
  permission?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function Can({ roles, permission, children, fallback = null }: CanProps) {
  const { hasRole, hasPermission, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <>{fallback}</>;

  if (permission && hasPermission(permission)) {
    return <>{children}</>;
  }

  if (roles && roles.length > 0 && hasRole(...roles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
