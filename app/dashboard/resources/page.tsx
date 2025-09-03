"use client"

import { BookOpen, Users, Trophy, Gamepad2, Globe, Settings, BarChart3, Shield } from 'lucide-react'

const resourceSections = [
  {
    title: "Tableau de bord",
    icon: BarChart3,
    description: "Vue d'ensemble de votre plateforme",
    features: [
      "Consultez les statistiques générales de l'application",
      "Surveillez l'activité des utilisateurs en temps réel", 
      "Visualisez les métriques clés de performance",
      "Accédez rapidement aux actions importantes"
    ]
  },
  {
    title: "Statistiques / Pays",
    icon: Globe,
    description: "Analyse des données par région géographique",
    features: [
      "Visualisez les statistiques d'utilisation par pays",
      "Analysez les performances régionales",
      "Suivez l'expansion géographique de votre plateforme",
      "Comparez les métriques entre différents pays"
    ]
  },
  {
    title: "Gestion des Ambassadeurs",
    icon: Users,
    description: "Administration de votre réseau d'ambassadeurs",
    features: [
      "Consultez la liste complète de vos ambassadeurs",
      "Ajoutez de nouveaux ambassadeurs à votre réseau",
      "Générez des liens d'adhésion personnalisés",
      "Suivez les performances et l'engagement des ambassadeurs"
    ]
  },
  {
    title: "Code d'excellence",
    icon: Trophy,
    description: "Système de récompenses et reconnaissance",
    features: [
      "Gérez les codes d'excellence disponibles",
      "Attribuez des récompenses aux utilisateurs méritants",
      "Consultez l'historique des récompenses",
      "Configurez les critères d'obtention"
    ]
  },
  {
    title: "Données de Jeux",
    icon: Settings,
    description: "Configuration du contenu éducatif",
    features: [
      "Gérez les pays disponibles dans l'application",
      "Configurez les examens et leurs options",
      "Organisez les matières par catégories",
      "Structurez le contenu en chapitres"
    ]
  },
  {
    title: "Création de Jeux",
    icon: Gamepad2,
    description: "Outils de création de contenu ludique",
    features: [
      "Créez des jeux spécifiques à chaque pays",
      "Développez des activités de groupe collaboratives",
      "Concevez des jeux basés sur les examens",
      "Personnalisez l'expérience d'apprentissage"
    ]
  },
  {
    title: "Paramètres Utilisateur",
    icon: Shield,
    description: "Gestion de votre compte et sécurité",
    features: [
      "Modifiez vos informations personnelles",
      "Configurez l'authentification à deux facteurs (2FA)",
      "Gérez les utilisateurs de la plateforme",
      "Administrez les paramètres de sécurité"
    ]
  }
]

const securityFeatures = [
  {
    title: "Authentification par email",
    description: "Système de connexion sécurisé avec envoi de codes de vérification par email"
  },
  {
    title: "Authentification 2FA",
    description: "Protection renforcée avec Google Authenticator ou applications compatibles TOTP"
  },
  {
    title: "Gestion des sessions",
    description: "Contrôle automatique des sessions utilisateur avec expiration sécurisée"
  },
  {
    title: "Chiffrement des données",
    description: "Protection des informations sensibles avec chiffrement de niveau professionnel"
  }
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-base-200 -m-6 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-base-100 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-content" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content">Centre de Ressources</h1>
              <p className="text-base-content/70">Guide d&apos;utilisation de la plateforme AKILI Mobile Administration</p>
            </div>
          </div>
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/80 leading-relaxed">
              Découvrez toutes les fonctionnalités de votre plateforme d&apos;administration. Cette section vous guide à travers 
              les différents modules disponibles, leurs utilisations spécifiques et les bonnes pratiques pour optimiser 
              votre expérience.
            </p>
          </div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {resourceSections.map((section, index) => (
            <div key={index} className="bg-base-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-base-content mb-2">{section.title}</h3>
                  <p className="text-sm text-base-content/70 mb-4">{section.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {section.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-base-content/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Security Section */}
        <div className="bg-base-100 rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-success-content" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">Sécurité de la Plateforme</h2>
              <p className="text-base-content/70">Mécanismes de protection et stratégies de connexion</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-base-200 rounded-xl p-4">
                <h4 className="font-semibold text-base-content mb-2">{feature.title}</h4>
                <p className="text-sm text-base-content/80">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-info/10 border border-info/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-base-content mb-2">Recommandations de Sécurité</h4>
                <ul className="text-sm text-base-content/80 space-y-1">
                  <li>• Activez l&apos;authentification à deux facteurs (2FA) pour tous les comptes administrateurs</li>
                  <li>• Utilisez des mots de passe complexes d&apos;au moins 12 caractères</li>
                  <li>• Vérifiez régulièrement les connexions suspectes dans les logs</li>
                  <li>• Maintenez vos informations de contact à jour pour recevoir les alertes de sécurité</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-8 bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-primary-content">
          <h3 className="text-xl font-bold mb-4">Accès Rapide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/dashboard/profile" className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">Mon Profil</span>
            </a>
            <a href="/dashboard/settings/users" className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <Settings className="h-6 w-6" />
              <span className="text-sm font-medium">Utilisateurs</span>
            </a>
            <a href="/dashboard/settings/security" className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <Shield className="h-6 w-6" />
              <span className="text-sm font-medium">Sécurité</span>
            </a>
            <a href="/dashboard/statistics" className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Statistiques</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}