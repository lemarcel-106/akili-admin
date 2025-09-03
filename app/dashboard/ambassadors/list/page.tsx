"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  getAmbassadors, 
  type Ambassador,
  type AmbassadorFilters 
} from "@/lib/ambassadors-api"
import { 
  Users, 
  UserPlus, 
  Trophy, 
  TrendingUp,
  Link2,
  Activity,
  Clock,
  Search,
  BarChart3,
  Target,
  Calendar,
  Award
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AmbassadorBadge } from "@/components/ambassadors/ambassador-badge"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" 
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createAmbassador, type CreateAmbassadorData } from "@/lib/ambassadors-api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  ambassador_type: z.enum(["standard", "silver", "gold", "diamond"]),
  is_active: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

export default function AmbassadorsListPage() {
  const router = useRouter()
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalPoints: 0,
    averagePoints: 0
  })
  const [selectedAmbassadorForStats, setSelectedAmbassadorForStats] = useState<Ambassador | null>(null)
  const [showAddAmbassadorModal, setShowAddAmbassadorModal] = useState(false)
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      ambassador_type: "standard",
      is_active: true,
    },
  })

  useEffect(() => {
    loadAmbassadors()
  }, [])

  const loadAmbassadors = async () => {
    setLoading(true)
    try {
      const response = await getAmbassadors({ ordering: "-created_at" })
      if (response.success && response.ambassadors) {
        setAmbassadors(response.ambassadors)
        calculateStats(response.ambassadors)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des ambassadeurs:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ambassadorsList: Ambassador[]) => {
    const total = ambassadorsList.length
    const active = ambassadorsList.filter(a => a.is_active).length
    const totalPoints = ambassadorsList.reduce((sum, a) => sum + a.points, 0)
    const averagePoints = total > 0 ? Math.round(totalPoints / total) : 0

    setStats({
      total,
      active,
      totalPoints,
      averagePoints
    })
  }

  const onSubmitAmbassador = async (data: FormData) => {
    setFormLoading(true)
    setFormError(null)

    try {
      const ambassadorData: CreateAmbassadorData = {
        ...data,
        email: data.email || undefined,
      }

      const response = await createAmbassador(ambassadorData)
      
      if (response.success) {
        setShowAddAmbassadorModal(false)
        form.reset()
        await loadAmbassadors()
      } else {
        setFormError(response.error || "Une erreur est survenue")
      }
    } catch (err) {
      setFormError("Une erreur inattendue est survenue")
    } finally {
      setFormLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6 flex flex-col gap-8 h-screen">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestion des Ambassadeurs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gérez vos ambassadeurs et suivez leurs performances en temps réel
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Clock className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGenerateLinkModal(true)}
                className="rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Générer un lien
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddAmbassadorModal(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Nouvel ambassadeur
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {[
            {
              title: "Total Ambassadeurs",
              subtitle: "Tous les ambassadeurs",
              value: stats.total,
              icon: Users,
              trend: "+2.1%",
              isPositive: true
            },
            {
              title: "Ambassadeurs Actifs",
              subtitle: `${Math.round((stats.active / stats.total) * 100) || 0}% du total`,
              value: stats.active,
              icon: TrendingUp,
              trend: "+5.3%",
              isPositive: true
            },
            {
              title: "Points Totaux",
              subtitle: "Points cumulés",
              value: stats.totalPoints.toLocaleString(),
              icon: Trophy,
              trend: "+12.8%",
              isPositive: true
            },
            {
              title: "Moyenne Points",
              subtitle: "Par ambassadeur",
              value: stats.averagePoints,
              icon: Trophy,
              trend: "+8.7%",
              isPositive: true
            }
          ].map((metric, index) => {
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
                    <div className="space-y-4 relative z-10">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {metric.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {metric.subtitle}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-4xl font-black text-gray-900 dark:text-gray-100">
                          {metric.value}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <Activity className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                          </div>
                          <span className="text-sm font-bold flex items-center gap-1 px-2 py-1 rounded-full text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30">
                            <TrendingUp className="h-3 w-3" />
                            {metric.trend}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Icône incrustée */}
                    <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                      <Icon className="h-24 w-24 text-violet-600 dark:text-violet-400" />
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent rounded-2xl" />
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Section de filtre ambassadeur */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex-1 min-h-0"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Statistiques Détaillées
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Sélectionnez un ambassadeur pour voir ses performances détaillées
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-80">
              <Select
                value={selectedAmbassadorForStats?.id.toString() || ""}
                onValueChange={(value) => {
                  const ambassador = ambassadors.find(a => a.id === parseInt(value))
                  setSelectedAmbassadorForStats(ambassador || null)
                }}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Rechercher un ambassadeur..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {ambassadors.map(ambassador => (
                    <SelectItem key={ambassador.id} value={ambassador.id.toString()}>
                      <div className="flex items-center gap-2 w-full">
                        <span>{ambassador.first_name} {ambassador.last_name}</span>
                        <AmbassadorBadge type={ambassador.ambassador_type} />
                        <Badge variant={ambassador.is_active ? "default" : "secondary"} className="ml-auto">
                          {ambassador.points} pts
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedAmbassadorForStats ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-700 dark:text-blue-300 text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Points Actuels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {selectedAmbassadorForStats.points}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Niveau {selectedAmbassadorForStats.ambassador_type}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700 dark:text-green-300 text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Statut
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {selectedAmbassadorForStats.is_active ? "Actif" : "Inactif"}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    État du compte
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-700 dark:text-purple-300 text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Code Promo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {selectedAmbassadorForStats.promo_code || "Aucun"}
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Code personnel
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 border-violet-200 dark:border-violet-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-violet-700 dark:text-violet-300 text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Inscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold text-violet-900 dark:text-violet-100">
                    {new Date(selectedAmbassadorForStats.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                    Date d'ajout
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl min-h-96">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/20 dark:to-violet-800/20 flex items-center justify-center mb-6">
                  <Search className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Aucun ambassadeur sélectionné
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Sélectionnez un ambassadeur pour voir ses statistiques détaillées
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Modal Ajouter Ambassadeur */}
        <Dialog open={showAddAmbassadorModal} onOpenChange={setShowAddAmbassadorModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-violet-600" />
                Nouvel Ambassadeur
              </DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel ambassadeur à votre réseau
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitAmbassador)} className="space-y-6">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Jean" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Dupont" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="jean.dupont@example.com" />
                        </FormControl>
                        <FormDescription>
                          Optionnel - pour recevoir les notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="+33 6 12 34 56 78" />
                        </FormControl>
                        <FormDescription>
                          Optionnel - numéro de contact
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ambassador_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau d'ambassadeur</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard (0-99 points)</SelectItem>
                          <SelectItem value="silver">Argent (100-499 points)</SelectItem>
                          <SelectItem value="gold">Or (500-999 points)</SelectItem>
                          <SelectItem value="diamond">Diamant (1000+ points)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Le niveau détermine les avantages et commissions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Compte actif
                        </FormLabel>
                        <FormDescription>
                          L'ambassadeur pourra utiliser son code promo
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddAmbassadorModal(false)}
                    disabled={formLoading}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={formLoading}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {formLoading ? "Création..." : "Créer l'ambassadeur"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal Générer Lien */}
        <Dialog open={showGenerateLinkModal} onOpenChange={setShowGenerateLinkModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Link2 className="h-6 w-6 text-violet-600" />
                Générer un Lien d'Adhésion
              </DialogTitle>
              <DialogDescription>
                Créez des liens d'adhésion et codes promo personnalisés
              </DialogDescription>
            </DialogHeader>
            
            <div className="text-center py-8">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/20 dark:to-violet-800/20 flex items-center justify-center mb-4">
                <Link2 className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Fonctionnalité à venir
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                La génération de liens sera bientôt disponible dans ce modal
              </p>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}