"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DollarSign,
  Users,
  Globe,
  Award,
  Medal,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  ChevronRight,
  CreditCard,
  Wallet,
  Zap,
  Activity
} from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { canAccessMainDashboard, getDefaultRoute } from "@/lib/permissions"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Rediriger les OPERATEUR_DE_SAISIE vers leur page par défaut
  useEffect(() => {
    if (!loading && user?.role && !canAccessMainDashboard(user.role)) {
      router.push(getDefaultRoute(user.role))
    }
  }, [user, loading, router])
  
  // Afficher un loader pendant la vérification
  if (loading || (!loading && user?.role && !canAccessMainDashboard(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: "To. Revenue",
      subtitle: "Achats de licences",
      value: "415,566",
      icon: DollarSign,
      trend: "+12.5%",
      isPositive: true
    },
    {
      title: "To. Ambassadeurs",
      subtitle: "Ambassadeurs actifs",
      value: "2,847",
      icon: Users,
      trend: "+8.2%",
      isPositive: true
    },
    {
      title: "To. Pays",
      subtitle: "Pays disponibles",
      value: "67",
      icon: Globe,
      trend: "+3",
      isPositive: true
    },
    {
      title: "To. Licences",
      subtitle: "Licences générées",
      value: "18,429",
      icon: Award,
      trend: "+23.1%",
      isPositive: true
    },
    {
      title: "To. Codes Excellence",
      subtitle: "Codes générés",
      value: "5,672",
      icon: Medal,
      trend: "+15.8%",
      isPositive: true
    },
    {
      title: "To. Questions/Réponses",
      subtitle: "Q&R globales",
      value: "12,348",
      icon: MessageSquare,
      trend: "+7.4%",
      isPositive: true
    }
  ]

  const recentActivity = [
    {
      id: 1,
      user: "Marie Dubois",
      action: "Nouvelle licence Premium",
      project: "Ambassadeur France",
      time: "Il y a 2 min",
      status: "success",
      amount: "€1,249.00"
    },
    {
      id: 2,
      user: "Jean Martin",
      action: "Code d'excellence généré",
      project: "Programme Elite",
      time: "Il y a 15 min",
      status: "processing",
      amount: "€599.00"
    },
    {
      id: 3,
      user: "Sophie Laurent",
      action: "Nouveau pays ajouté",
      project: "Expansion Maroc",
      time: "Il y a 28 min",
      status: "success",
      amount: "€2,100.00"
    },
    {
      id: 4,
      user: "Pierre Leroy",
      action: "Q&R mise à jour",
      project: "Support Global",
      time: "Il y a 1h",
      status: "success",
      amount: "€450.00"
    }
  ]

  const topProjects = [
    {
      name: "Programme Ambassadeurs",
      progress: 87,
      status: "En cours",
      revenue: "€125,430",
      participants: 2847
    },
    {
      name: "Expansion Internationale", 
      progress: 64,
      status: "Actif",
      revenue: "€89,250",
      participants: 67
    },
    {
      name: "Codes d'Excellence",
      progress: 43,
      status: "Nouveau",
      revenue: "€67,890",
      participants: 5672
    }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Dashboard Akili
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Vue d'ensemble de votre plateforme d'administration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {mounted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Clock className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {currentTime.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Metrics Cards - Style avec icônes incrustées */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <Card className="relative overflow-hidden bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0">
                  <CardContent className="p-6 relative">
                    {/* Contenu principal */}
                    <div className="space-y-4 relative z-10">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {metric.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {metric.subtitle}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-gray-900 dark:text-gray-100">
                          {metric.value}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <Zap className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                          </div>
                            <span className={cn(
                              "text-sm font-bold flex items-center gap-1 px-2 py-1 rounded-full",
                              metric.isPositive 
                                ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" 
                                : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                            )}>
                            {metric.isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {metric.trend}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Icône incrustée en bas à droite */}
                    <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                      <Icon className="h-24 w-24 text-violet-600 dark:text-violet-400" />
                    </div>

                    {/* Gradient overlay subtil */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent rounded-2xl" />
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="xl:col-span-2"
          >
            <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Activité Récente
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Dernières actions sur la plateforme
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-xl">
                    Tout voir
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-violet-200 dark:ring-violet-800">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-violet-600 text-white font-bold">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {activity.user}
                          </p>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            activity.status === "success" && "bg-green-500",
                            activity.status === "processing" && "bg-yellow-500",
                            activity.status === "error" && "bg-red-500"
                          )} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {activity.action}
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className="text-xs border-violet-200 text-violet-700 dark:border-violet-700 dark:text-violet-300"
                          >
                            {activity.project}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {activity.time}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-lg text-gray-900 dark:text-gray-100">
                          {activity.amount}
                        </p>
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-bold",
                          activity.status === "success" && "text-green-600",
                          activity.status === "processing" && "text-yellow-600",
                          activity.status === "error" && "text-red-600"
                        )}>
                          {activity.status === "success" && <CheckCircle className="h-3 w-3" />}
                          {activity.status === "processing" && <Clock className="h-3 w-3" />}
                          {activity.status === "error" && <XCircle className="h-3 w-3" />}
                          <span className="capitalize">{activity.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Programs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900 h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Programmes Phares
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Performance exceptionnelle
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {topProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/20 dark:to-violet-900/10 border border-violet-200/50 dark:border-violet-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        {project.name}
                      </h4>
                      <Badge 
                        className="bg-violet-600 hover:bg-violet-700 text-white border-0"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progression
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 1, delay: 1.2 + index * 0.2 }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-violet-200/50 dark:border-violet-800/30">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Revenus
                        </p>
                        <p className="font-black text-gray-900 dark:text-gray-100">
                          {project.revenue}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Participants
                        </p>
                        <p className="font-black text-gray-900 dark:text-gray-100">
                          {project.participants.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-violet-600 to-violet-700 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Wallet className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">
                    €542,890
                  </h3>
                  <p className="text-violet-100">
                    Revenus totaux ce mois
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">
                    2,847
                  </h3>
                  <p className="text-violet-100">
                    Ambassadeurs actifs
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">
                    67
                  </h3>
                  <p className="text-violet-100">
                    Pays couverts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}