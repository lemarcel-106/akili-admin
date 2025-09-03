"use client"

import { useState, useEffect } from "react"
import { 
  KeyRound,
  Wrench,
  Clock,
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function LicensesPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Gestion des Licences
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Administration et suivi des licences système
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card de maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900 text-center">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-4 p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Wrench className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Page en Maintenance
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-amber-600 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Développement en cours</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  La section de gestion des licences est actuellement en cours de développement. 
                  Cette fonctionnalité permettra de gérer et suivre toutes les licences système, 
                  les abonnements et les autorisations d'accès.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Fonctionnalités prévues :</span>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
                    <li>• Gestion des licences utilisateurs</li>
                    <li>• Suivi des abonnements</li>
                    <li>• Génération de clés d'activation</li>
                    <li>• Statistiques d'utilisation</li>
                    <li>• Historique des renouvellements</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/dashboard">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8">
                    Retourner au tableau de bord
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { title: "Licences Actives", value: "---", icon: KeyRound },
            { title: "Utilisateurs", value: "---", icon: Clock },
            { title: "Expirations", value: "---", icon: AlertCircle }
          ].map((stat, index) => (
            <Card key={index} className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <stat.icon className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  )
}