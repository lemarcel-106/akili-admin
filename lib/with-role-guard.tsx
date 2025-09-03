"use client"

import RoleGuard from '@/components/role-guard';
import { ComponentType } from 'react';

export function withRoleGuard<P extends object>(
  Component: ComponentType<P>,
  requiredPath: string
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard requiredPath={requiredPath}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}