"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { hasAccess, getDefaultRoute } from '@/lib/permissions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredPath?: string;
  fallbackPath?: string;
}

export default function RoleGuard({ 
  children, 
  requiredPath,
  fallbackPath 
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role && requiredPath) {
      if (!hasAccess(user.role, requiredPath)) {
        const redirectPath = fallbackPath || getDefaultRoute(user.role);
        router.push(redirectPath);
      }
    }
  }, [user, loading, requiredPath, fallbackPath, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'a pas accès, afficher un message d'erreur
  if (user?.role && requiredPath && !hasAccess(user.role, requiredPath)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}