"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ArrowLeft, Loader2, Save, User, Mail, Phone, Trophy, Activity, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AmbassadorBadge } from "@/components/ambassadors/ambassador-badge"

const formSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  ambassador_type: z.enum(["standard", "silver", "gold", "diamond"]),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

export default function AddAmbassadorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const ambassadorData: CreateAmbassadorData = {
        ...data,
        email: data.email || undefined,
      }

      const response = await createAmbassador(ambassadorData)
      
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard/ambassadors/list")
        }, 1500)
      } else {
        setError("error" in response ? response.error : "Une erreur est survenue")
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue")
    } finally {
      setLoading(false)
    }
  }

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Nouvel Ambassadeur
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Enrichissez votre réseau en ajoutant un nouvel ambassadeur
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <Clock className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-6xl mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 max-w-6xl mx-auto">
            <AlertDescription className="text-green-800">
              Ambassadeur créé avec succès ! Redirection...
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg border-0 bg-white dark:bg-gray-900 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <User className="h-6 w-6 text-violet-600" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Renseignez les informations de base de l'ambassadeur
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" placeholder="Jean" />
                        </div>
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
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" placeholder="Dupont" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type="email" 
                            className="pl-10" 
                            placeholder="jean.dupont@example.com" 
                          />
                        </div>
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
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type="tel" 
                            className="pl-10" 
                            placeholder="+33 6 12 34 56 78" 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Optionnel - numéro de contact
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg border-0 bg-white dark:bg-gray-900 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-violet-600" />
                    Configuration
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Définissez le niveau et le statut de l'ambassadeur
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-6 p-8">
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
                        <SelectItem value="standard">
                          <div className="flex items-center gap-2">
                            <span>Standard</span>
                            <span className="text-xs text-muted-foreground">(0-99 points)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="silver">
                          <div className="flex items-center gap-2">
                            <span>Argent</span>
                            <span className="text-xs text-muted-foreground">(100-499 points)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gold">
                          <div className="flex items-center gap-2">
                            <span>Or</span>
                            <span className="text-xs text-muted-foreground">(500-999 points)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="diamond">
                          <div className="flex items-center gap-2">
                            <span>Diamant</span>
                            <span className="text-xs text-muted-foreground">(1000+ points)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Le niveau détermine les avantages et commissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Niveau sélectionné</Label>
                  <p className="text-sm text-muted-foreground">
                    Aperçu du badge ambassadeur
                  </p>
                </div>
                <AmbassadorBadge type={form.watch("ambassador_type")} />
              </div>

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
            </CardContent>
          </Card>

            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-4 pt-4"
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                disabled={loading}
                className="min-w-[150px] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                size="lg"
                className="min-w-[200px] bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Créer l'ambassadeur
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  )
}