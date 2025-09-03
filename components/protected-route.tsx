"use client"

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute, hasAccess, canAccessMainDashboard } from '@/lib/permissions';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // Utiliser replace pour \u00e9viter l'accumulation dans l'historique
        router.replace('/login');
      } else if (!requireAuth && isAuthenticated) {
        // Utiliser replace pour \u00e9viter l'accumulation dans l'historique
        router.replace('/dashboard');
      } else if (isAuthenticated && user?.role && !hasRedirected) {
        console.log('🔍 DÉBOGAGE PROTECTED-ROUTE - Vérification des permissions pour :', { 
          userRole: user.role, 
          pathname,
          canAccessMainDashboard: canAccessMainDashboard(user.role),
          hasAccessToCurrentPath: hasAccess(user.role, pathname)
        });
        
        // Vérifier l'accès pour tous les rôles avec des restrictions
        const isRestrictedRole = ['OPERATEUR_DE_SAISIE', 'operateur_de_saisie', 'data_entry_operator'].includes(user.role);
        
        if (isRestrictedRole) {
          console.log('🔍 DÉBOGAGE PROTECTED-ROUTE - Utilisateur avec rôle restreint détecté');
          
          // Si l'utilisateur essaie d'accéder au dashboard principal
          if (pathname === '/dashboard' && !canAccessMainDashboard(user.role)) {
            console.log('🔍 DÉBOGAGE PROTECTED-ROUTE - Redirection dashboard principal vers route par défaut');
            router.push(getDefaultRoute(user.role));
            setHasRedirected(true);
          }
          // Vérifier l'accès à la route actuelle
          else if (!hasAccess(user.role, pathname)) {
            console.log('🔍 DÉBOGAGE PROTECTED-ROUTE - Accès refusé, redirection vers route par défaut');
            router.push(getDefaultRoute(user.role));
            setHasRedirected(true);
          }
          else {
            console.log('🔍 DÉBOGAGE PROTECTED-ROUTE - Accès autorisé à la route actuelle');
          }
        } else {
          console.log('🔍 DÉBOGAGE PROTECTED-ROUTE - Utilisateur avec accès complet');
        }
      }
    }
  }, [isAuthenticated, loading, requireAuth, router, user, pathname, hasRedirected]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Vérification finale : si l'utilisateur est connecté mais n'a pas accès à la route actuelle
  if (isAuthenticated && user?.role && !hasRedirected) {
    const isRestrictedRole = ['OPERATEUR_DE_SAISIE', 'operateur_de_saisie', 'data_entry_operator'].includes(user.role);
    
    if (isRestrictedRole && !hasAccess(user.role, pathname)) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Accès Restreint
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page. 
              Votre rôle ({user.role}) ne permet pas l'accès à cette section.
            </p>
            <Button 
              onClick={() => router.push(getDefaultRoute(user.role))}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}