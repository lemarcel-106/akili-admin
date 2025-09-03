"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Trophy,
  Gamepad2,
  Globe,
  FileText,
  ChevronRight,
  ChevronDown,
  LogOut,
  BookOpen,
  UserPlus,
  Link2,
  GraduationCap,
  Settings,
  User,
  Moon,
  Sun,
  Monitor,
  Palette,
  KeyRound,
  HelpCircle,
  MessageSquare
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { filterMenuByRole } from "@/lib/permissions"

const menuItems = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/dashboard"
  },
  {
    title: "Statistiques / Pays",
    icon: BarChart3,
    href: "/dashboard/statistics"
  },
  {
    title: "Ambassadeurs",
    icon: Users,
    href: "/dashboard/ambassadors",
    subItems: [
      { title: "Liste des ambassadeurs", href: "/dashboard/ambassadors/list", icon: Users },
      { title: "Ajouter un ambassadeur", href: "/dashboard/ambassadors/add", icon: UserPlus },
      { title: "Lien d'adhésion", href: "/dashboard/ambassadors/link", icon: Link2 }
    ]
  },
  {
    title: "Code d'excellence",
    icon: Trophy,
    href: "/dashboard/excellence-code"
  },
  {
    title: "Données de Jeux",
    icon: Settings,
    href: "/dashboard/game-data",
    subItems: [
      { title: "Pays", href: "/dashboard/game-data/countries", icon: Globe },
      { title: "Examens", href: "/dashboard/game-data/exams", icon: GraduationCap },
      { title: "Matières", href: "/dashboard/game-data/subjects", icon: BookOpen },
      { title: "Chapitres", href: "/dashboard/game-data/chapters", icon: FileText }
    ]
  },
  {
    title: "Questions/Réponses",
    icon: HelpCircle,
    href: "/dashboard/management",
    subItems: [
      { title: "Questions", href: "/dashboard/management/questions", icon: HelpCircle },
      { title: "Réponses", href: "/dashboard/management/answers", icon: MessageSquare }
    ]
  },
 
  {
    title: "Paramètres",
    icon: Settings,
    href: "/dashboard/settings",
    subItems: [
      { title: "Mon Profil", href: "/dashboard/profile", icon: User },
      { title: "Gestion des utilisateurs", href: "/dashboard/settings/users", icon: Users }
    ]
  }
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Filtrer les éléments de menu selon le rôle de l'utilisateur
  useEffect(() => {
    if (user?.role) {
      const filtered = filterMenuByRole(menuItems, user.role)
      setFilteredMenuItems(filtered)
    }
  }, [user?.role])
  

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const handleLogout = async () => {
    // Le logout g\u00e8re d\u00e9j\u00e0 la redirection
    await logout()
  }

  const handleNavigation = () => {
    onNavigate?.()
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'light':
        return <Sun className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Mode sombre'
      case 'light':
        return 'Mode clair'
      default:
        return 'Mode système'
    }
  }

  const renderMenuItem = (item: any) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const isActive = pathname === item.href || (hasSubItems && item.subItems.some((sub: any) => pathname === sub.href))

    return (
      <li key={item.title} className="mb-1">
        {hasSubItems ? (
          <>
            <div
              className={cn(
                "group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 border border-violet-400/20' 
                  : 'hover:bg-gradient-to-r hover:from-violet-500/90 hover:to-violet-600 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 hover:border-violet-400/30 border border-transparent'
              )}
              onClick={() => toggleExpanded(item.title)}
            >
              <div className="flex items-center gap-3 min-w-0 z-10">
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-all duration-300 text-muted-foreground",
                  isActive ? "!text-white" : "group-hover:!text-white group-hover:scale-110"
                )} />
                <span className={cn(
                  "font-semibold text-base truncate transition-all duration-300",
                  isActive ? "text-white" : "text-foreground group-hover:text-white"
                )}>{item.title}</span>
              </div>
              <ChevronRight className={cn(
                "h-5 w-5 shrink-0 transition-all duration-300 z-10",
                isExpanded && "rotate-90",
                isActive ? "text-white" : "text-muted-foreground group-hover:text-white"
              )} />
              {/* Effet de brillance au hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </div>
            {isExpanded && (
              <div className="ml-6 mt-2 space-y-1 border-l-2 border-violet-500/30 pl-4">
                {item.subItems.map((subItem: any) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={handleNavigation}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 min-w-0 relative overflow-hidden",
                      pathname === subItem.href 
                        ? 'bg-gradient-to-r from-violet-500/80 to-violet-600 text-white shadow-md shadow-violet-500/20 border border-violet-400/30' 
                        : 'text-muted-foreground hover:bg-gradient-to-r hover:from-violet-400/70 hover:to-violet-500/80 hover:text-white hover:shadow-md hover:shadow-violet-500/15 hover:border-violet-400/20 border border-transparent'
                    )}
                  >
                    <subItem.icon className={cn(
                      "h-4 w-4 shrink-0 transition-all duration-300 text-muted-foreground",
                      pathname === subItem.href ? "!text-white" : "group-hover:!text-white group-hover:scale-105"
                    )} />
                    <span className={cn(
                      "text-sm font-medium truncate transition-all duration-300",
                      pathname === subItem.href ? "text-white" : "group-hover:text-white"
                    )}>{subItem.title}</span>
                    {/* Effet de brillance au hover pour sous-items */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.href}
            onClick={handleNavigation}
            className={cn(
              "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 min-w-0 relative overflow-hidden",
              pathname === item.href 
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 border border-violet-400/20' 
                : 'hover:bg-gradient-to-r hover:from-violet-500/90 hover:to-violet-600 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 hover:border-violet-400/30 border border-transparent'
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 shrink-0 transition-all duration-300 text-muted-foreground",
              pathname === item.href ? "!text-white" : "group-hover:!text-white group-hover:scale-110"
            )} />
            <span className={cn(
              "font-semibold text-base truncate transition-all duration-300",
              pathname === item.href ? "text-white" : "text-foreground group-hover:text-white"
            )}>{item.title}</span>
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Link>
        )}
      </li>
    )
  }

  return (
    <aside className="w-full h-full bg-gradient-to-b from-background to-muted/20 border-r border-border shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-sm">
            <img 
              src="/images/logo.png" 
              alt="AKILI Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold tracking-tight leading-tight">AKILI Mobile</h2>
            <h3 className="text-xs font-semibold text-white/90 leading-tight">ADMINISTRATION</h3>
          </div>
        </div>
        {/* Affichage du rôle utilisateur */}
        {user?.role && (
          <div className="mt-3 px-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/25">
              <User className="h-3.5 w-3.5 text-white/90" />
              <span className="text-xs font-semibold text-white">
                {user.role === 'data_entry_operator' ? 'Opérateur de Saisie' :
                 user.role === 'admin' || user.role === 'super_admin' ? 'Administrateur' :
                 user.role === 'manager' ? 'Manager' :
                 user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <nav>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-3">
            Menu Principal
          </div>
          <ul className="space-y-2">
            {filteredMenuItems.map(renderMenuItem)}
          </ul>
        </nav>
      </div>

    
      
      {/* Footer with theme dropdown and logout */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Theme Dropdown */}
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between gap-3 text-muted-foreground hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/30">
                    {getThemeIcon()}
                  </div>
                  <span className="font-semibold">{getThemeLabel()}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => setTheme('light')}
                className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:text-violet-800 dark:hover:text-violet-200 focus:bg-violet-100 dark:focus:bg-violet-900/40"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Mode clair</span>
                {theme === 'light' && <div className="ml-auto w-2 h-2 rounded-full bg-violet-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme('dark')}
                className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:text-violet-800 dark:hover:text-violet-200 focus:bg-violet-100 dark:focus:bg-violet-900/40"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Mode sombre</span>
                {theme === 'dark' && <div className="ml-auto w-2 h-2 rounded-full bg-violet-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme('system')}
                className="cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:text-violet-800 dark:hover:text-violet-200 focus:bg-violet-100 dark:focus:bg-violet-900/40"
              >
                <Monitor className="mr-2 h-4 w-4" />
                <span>Mode système</span>
                {theme === 'system' && <div className="ml-auto w-2 h-2 rounded-full bg-violet-600" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300"
          onClick={handleLogout}
        >
          <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-semibold">Déconnexion</span>
        </Button>
      </div>
    </aside>
  )
}