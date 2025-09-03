"use client"

import { useState } from 'react'
import { Shield, Mail, CheckCircle, Lock, Smartphone, Server, Eye, FileText, Clock, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const securityStrategies = [
  {
    title: "Authentification par Email",
    icon: Mail,
    description: "Système de connexion sécurisé avec codes de vérification",
    features: [
      "Envoi automatique de codes de vérification à 6 chiffres",
      "Codes temporaires avec expiration après 15 minutes",
      "Protection contre les tentatives de brute force",
      "Historique des tentatives de connexion"
    ],
    status: "active",
    details: "Lorsqu&apos;un utilisateur tente de se connecter, un code unique à 6 chiffres est généré et envoyé à son adresse email. Ce code est valide pendant 15 minutes et ne peut être utilisé qu'une seule fois."
  },
  {
    title: "Authentification 2FA (TOTP)",
    icon: Smartphone,
    description: "Protection renforcée avec applications d&apos;authentification",
    features: [
      "Compatible Google Authenticator, Authy, Microsoft Authenticator",
      "Codes TOTP (Time-based One-Time Password) de 6 chiffres",
      "Clés secrètes de sauvegarde pour récupération",
      "QR codes pour configuration simplifiée"
    ],
    status: "optional",
    details: "L&apos;authentification à deux facteurs (2FA) ajoute une couche de sécurité supplémentaire en demandant un code généré par l&apos;application d&apos;authentification de l&apos;utilisateur en plus de son mot de passe."
  },
  {
    title: "Gestion des Sessions",
    icon: Clock,
    description: "Contrôle automatique des sessions utilisateur",
    features: [
      "Expiration automatique des sessions inactives",
      "Tokens JWT avec durée de vie limitée",
      "Révocation de session en cas d&apos;activité suspecte",
      "Limitation du nombre de sessions simultanées"
    ],
    status: "active",
    details: "Les sessions utilisateur sont automatiquement expirées après une période d&apos;inactivité définie. Les tokens d&apos;authentification sont régulièrement renouvelés pour maintenir la sécurité."
  }
]

const securityMeasures = [
  {
    title: "Chiffrement des Données",
    icon: Lock,
    description: "Protection des données sensibles",
    level: "Niveau Enterprise",
    details: [
      "Chiffrement AES-256 pour les données en transit",
      "Hachage bcrypt pour les mots de passe",
      "Chiffrement des tokens d&apos;authentification",
      "Protection SSL/TLS pour toutes les communications"
    ]
  },
  {
    title: "Surveillance et Logging",
    icon: Eye,
    description: "Monitoring des activités de sécurité",
    level: "Temps Réel",
    details: [
      "Journalisation de tous les événements d&apos;authentification",
      "Détection des tentatives de connexion suspectes",
      "Alertes automatiques en cas d&apos;anomalie",
      "Audit trail complet des actions administratives"
    ]
  },
  {
    title: "Protection Infrastructure",
    icon: Server,
    description: "Sécurisation de l'infrastructure",
    level: "Niveau Professionnel",
    details: [
      "Firewall applicatif (WAF) configuré",
      "Protection contre les attaques DDoS",
      "Sauvegardes automatiques chiffrées",
      "Mise à jour de sécurité automatique"
    ]
  },
  {
    title: "Conformité et Audit",
    icon: FileText,
    description: "Respect des standards de sécurité",
    level: "Standards Industriels",
    details: [
      "Conformité aux bonnes pratiques OWASP",
      "Audit de sécurité régulier",
      "Documentation des procédures",
      "Tests de pénétration périodiques"
    ]
  }
]

const connectionFlow = [
  {
    step: 1,
    title: "Saisie des identifiants",
    description: "L'utilisateur saisit son email et mot de passe"
  },
  {
    step: 2,
    title: "Vérification des identifiants",
    description: "Le système vérifie les informations dans la base de données sécurisée"
  },
  {
    step: 3,
    title: "Envoi du code par email",
    description: "Un code de vérification à 6 chiffres est envoyé par email"
  },
  {
    step: 4,
    title: "Saisie du code de vérification",
    description: "L'utilisateur saisit le code reçu (valide 15 minutes)"
  },
  {
    step: 5,
    title: "Vérification 2FA (optionnel)",
    description: "Si activé, l&apos;utilisateur saisit son code 2FA depuis son application"
  },
  {
    step: 6,
    title: "Création de session",
    description: "Une session sécurisée est créée avec token JWT"
  }
]

export default function SecurityPage() {
  const [selectedStrategy, setSelectedStrategy] = useState<typeof securityStrategies[0] | null>(null)
  const [selectedMeasure, setSelectedMeasure] = useState<typeof securityMeasures[0] | null>(null)
  const [showStrategyModal, setShowStrategyModal] = useState(false)
  const [showMeasureModal, setShowMeasureModal] = useState(false)

  const openStrategyModal = (strategy: typeof securityStrategies[0]) => {
    setSelectedStrategy(strategy)
    setShowStrategyModal(true)
  }

  const openMeasureModal = (measure: typeof securityMeasures[0]) => {
    setSelectedMeasure(measure)
    setShowMeasureModal(true)
  }

  return (
    <div className="min-h-screen bg-base-200 -m-6 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-base-100 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-success-content" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content">Centre de Sécurité</h1>
              <p className="text-base-content/70">Stratégies et mécanismes de protection de la plateforme</p>
            </div>
          </div>
          <div className="bg-success/10 border border-success/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-base-content mb-2">Sécurité Active</h4>
                <p className="text-sm text-base-content/80">
                  Tous les systèmes de sécurité sont opérationnels. La plateforme utilise plusieurs couches 
                  de protection pour garantir la sécurité de vos données et de vos utilisateurs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Strategies */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-base-content mb-6">Stratégies d&apos;Authentification</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {securityStrategies.map((strategy, index) => (
              <div key={index} className="bg-base-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    strategy.status === 'active' ? 'bg-success/10' : 'bg-warning/10'
                  }`}>
                    <strategy.icon className={`h-6 w-6 ${
                      strategy.status === 'active' ? 'text-success' : 'text-warning'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-base-content">{strategy.title}</h3>
                      <div className={`badge badge-sm ${
                        strategy.status === 'active' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {strategy.status === 'active' ? 'Actif' : 'Optionnel'}
                      </div>
                    </div>
                    <p className="text-sm text-base-content/70 mb-4">{strategy.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {strategy.features.slice(0, 2).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-base-content/80">{feature}</span>
                    </div>
                  ))}
                  {strategy.features.length > 2 && (
                    <div className="text-xs text-base-content/60 mt-2">
                      +{strategy.features.length - 2} autres fonctionnalités
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="bg-base-200 rounded-xl p-3 flex-1">
                    <p className="text-xs text-base-content/70 leading-relaxed line-clamp-2">{strategy.details}</p>
                  </div>
                  <button
                    onClick={() => openStrategyModal(strategy)}
                    className="btn btn-sm btn-primary btn-outline"
                    title="Voir plus de détails"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Flow */}
        <div className="bg-base-100 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-base-content mb-6">Processus de Connexion Sécurisé</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectionFlow.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-base-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content font-bold text-sm">
                      {step.step}
                    </div>
                    <h4 className="font-semibold text-base-content text-sm">{step.title}</h4>
                  </div>
                  <p className="text-xs text-base-content/70">{step.description}</p>
                </div>
                {index < connectionFlow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-0.5 bg-base-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Measures */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-base-content mb-6">Mesures de Sécurité Avancées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityMeasures.map((measure, index) => (
              <div key={index} className="bg-base-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <measure.icon className="h-6 w-6 text-info" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-base-content mb-1">{measure.title}</h3>
                    <p className="text-sm text-base-content/70 mb-2">{measure.description}</p>
                    <div className="badge badge-info badge-sm">{measure.level}</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {measure.details.slice(0, 2).map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-base-content/80">{detail}</span>
                    </div>
                  ))}
                  {measure.details.length > 2 && (
                    <div className="text-xs text-base-content/60 mt-2">
                      +{measure.details.length - 2} autres mesures
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => openMeasureModal(measure)}
                    className="btn btn-sm btn-info btn-outline"
                    title="Voir plus de détails"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-primary-content">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <Shield className="h-6 w-6" />
            Recommandations de Sécurité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Pour les Administrateurs</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                  Activez impérativement l&apos;authentification 2FA
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                  Utilisez des mots de passe complexes de 12+ caractères
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                  Vérifiez régulièrement les logs d&apos;accès
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                  Ne partagez jamais vos identifiants
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Pour les Utilisateurs</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                  Configurez la 2FA pour votre compte
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                  Vérifiez votre adresse email régulièrement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                  Déconnectez-vous après utilisation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-content rounded-full"></div>
                  Signalez toute activité suspecte
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Strategy Details Modal */}
        <Dialog open={showStrategyModal} onOpenChange={setShowStrategyModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedStrategy && (
                  <>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedStrategy.status === 'active' ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      <selectedStrategy.icon className={`h-6 w-6 ${
                        selectedStrategy.status === 'active' ? 'text-success' : 'text-warning'
                      }`} />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{selectedStrategy.title}</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        Stratégie d&apos;authentification détaillée
                      </div>
                    </div>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedStrategy && (
              <div className="space-y-6">
                {/* Status and Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`badge ${
                      selectedStrategy.status === 'active' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {selectedStrategy.status === 'active' ? 'Actuellement Actif' : 'Optionnel'}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedStrategy.description}</p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">{selectedStrategy.details}</p>
                  </div>
                </div>

                {/* Features List */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Fonctionnalités incluses
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedStrategy.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowStrategyModal(false)}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Security Measure Details Modal */}
        <Dialog open={showMeasureModal} onOpenChange={setShowMeasureModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedMeasure && (
                  <>
                    <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                      <selectedMeasure.icon className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{selectedMeasure.title}</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        Mesure de sécurité avancée
                      </div>
                    </div>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedMeasure && (
              <div className="space-y-6">
                {/* Level and Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="badge badge-info">{selectedMeasure.level}</div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedMeasure.description}</p>
                  </div>
                </div>

                {/* Security Details */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-info" />
                    Détails de sécurité
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedMeasure.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-muted">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium block">{detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">Mesure Active</div>
                      <div className="text-sm text-green-700">
                        Cette mesure de sécurité est actuellement déployée et opérationnelle.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowMeasureModal(false)}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}