"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  getAmbassadors,
  generatePromoCode,
  createPromoCode,
  generateUniqueCode,
  type Ambassador,
  type CreatePromoCodeData
} from "@/lib/ambassadors-api"
import {
  Copy,
  Check,
  Link2,
  QrCode,
  Share2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Sparkles
} from "lucide-react"
import { AmbassadorBadge } from "@/components/ambassadors/ambassador-badge"

export default function AdhesionLinkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ambassadorId = searchParams.get("id")
  
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatedLink, setGeneratedLink] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [codeType, setCodeType] = useState("percentage")
  const [usageLimit, setUsageLimit] = useState("")
  const [validityDays, setValidityDays] = useState("30")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAmbassadors()
  }, [])

  useEffect(() => {
    if (ambassadorId && ambassadors.length > 0) {
      const ambassador = ambassadors.find(a => a.id === parseInt(ambassadorId))
      if (ambassador) {
        setSelectedAmbassador(ambassador)
      }
    }
  }, [ambassadorId, ambassadors])

  const loadAmbassadors = async () => {
    setLoading(true)
    try {
      const response = await getAmbassadors({ is_active: true })
      if (response.success && response.ambassadors) {
        setAmbassadors(response.ambassadors)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des ambassadeurs:", error)
      setError("Impossible de charger la liste des ambassadeurs")
    } finally {
      setLoading(false)
    }
  }

  const generateLink = async () => {
    if (!selectedAmbassador) return

    setGenerating(true)
    setError(null)
    
    try {
      const code = customCode || generateUniqueCode("AKILI", 6)
      
      const promoData: CreatePromoCodeData = {
        id_ambassador: selectedAmbassador.id,
        code: code,
        type_code: codeType,
        usage_limit: usageLimit ? parseInt(usageLimit) : undefined,
        is_active: true
      }

      if (validityDays) {
        const validUntil = new Date()
        validUntil.setDate(validUntil.getDate() + parseInt(validityDays))
        promoData.valid_until = validUntil.toISOString()
      }

      const response = await createPromoCode(promoData)
      
      if (response.success && response.promoCode) {
        setPromoCode(response.promoCode.code)
        const baseUrl = window.location.origin
        const link = `${baseUrl}/register?promo=${response.promoCode.code}&ref=${selectedAmbassador.id}`
        setGeneratedLink(link)
      } else {
        setError(response.error || "Erreur lors de la génération du code")
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue")
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erreur lors de la copie:", err)
    }
  }

  const shareLink = () => {
    if (navigator.share && generatedLink) {
      navigator.share({
        title: `Code promo Akili - ${selectedAmbassador?.first_name} ${selectedAmbassador?.last_name}`,
        text: `Utilisez mon code promo ${promoCode} pour bénéficier d'une réduction !`,
        url: generatedLink
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
      <div className="p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.back()}
            className="mb-6 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Génération de Liens
            </h1>
            <p className="text-muted-foreground text-lg">
              Créez des liens d'adhésion et codes promo personnalisés pour vos ambassadeurs
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-7xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 xl:grid-cols-2 max-w-7xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-fit">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
              <CardTitle className="text-2xl">Configuration</CardTitle>
              <CardDescription className="text-base">
                Configurez les paramètres du lien et du code promo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <Label htmlFor="ambassador">Ambassadeur</Label>
              {loading ? (
                <div className="flex items-center justify-center h-10">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <Select
                  value={selectedAmbassador?.id.toString()}
                  onValueChange={(value) => {
                    const ambassador = ambassadors.find(a => a.id === parseInt(value))
                    setSelectedAmbassador(ambassador || null)
                  }}
                >
                  <SelectTrigger id="ambassador">
                    <SelectValue placeholder="Sélectionnez un ambassadeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {ambassadors.map(ambassador => (
                      <SelectItem key={ambassador.id} value={ambassador.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{ambassador.first_name} {ambassador.last_name}</span>
                          <AmbassadorBadge type={ambassador.ambassador_type} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedAmbassador && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ambassadeur sélectionné</span>
                  <AmbassadorBadge type={selectedAmbassador.ambassador_type} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedAmbassador.first_name} {selectedAmbassador.last_name}
                </p>
                {selectedAmbassador.email && (
                  <p className="text-xs text-muted-foreground">{selectedAmbassador.email}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedAmbassador.points} points</Badge>
                  {selectedAmbassador.promo_code && (
                    <Badge variant="secondary">Code existant: {selectedAmbassador.promo_code}</Badge>
                  )}
                </div>
              </div>
            )}

            <Separator />

            <Tabs defaultValue="auto" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="auto">Code automatique</TabsTrigger>
                <TabsTrigger value="custom">Code personnalisé</TabsTrigger>
              </TabsList>
              <TabsContent value="auto" className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Un code unique sera généré automatiquement
                </p>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono">Format: AKILIXXXXXX</p>
                </div>
              </TabsContent>
              <TabsContent value="custom" className="space-y-2">
                <Label htmlFor="custom-code">Code personnalisé</Label>
                <Input
                  id="custom-code"
                  placeholder="Ex: PROMO2024"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  Lettres et chiffres uniquement, 20 caractères max
                </p>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="type">Type de réduction</Label>
              <Select value={codeType} onValueChange={setCodeType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage de réduction</SelectItem>
                  <SelectItem value="fixed">Montant fixe</SelectItem>
                  <SelectItem value="trial">Période d'essai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limit">Limite d'utilisation</Label>
                <Input
                  id="limit"
                  type="number"
                  placeholder="Illimité"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validity">Validité (jours)</Label>
                <Input
                  id="validity"
                  type="number"
                  placeholder="30"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                />
              </div>
            </div>

              <Button
                className="w-full py-6 text-lg bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 hover:scale-105 transition-all"
                onClick={generateLink}
                disabled={!selectedAmbassador || generating}
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Générer le lien
                  </>
                )}
              </Button>
          </CardContent>
        </Card>

          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-fit">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900">
              <CardTitle className="text-2xl">Lien Généré</CardTitle>
              <CardDescription className="text-base">
                Partagez ce lien avec l'ambassadeur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
            {generatedLink ? (
              <>
                <div className="space-y-2">
                  <Label>Code promo</Label>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      readOnly
                      className="font-mono font-bold text-lg"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(promoCode)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Lien d'adhésion</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedLink)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Informations importantes</AlertTitle>
                  <AlertDescription className="space-y-1 mt-2">
                    <p>• Le code est valide pour {validityDays || "30"} jours</p>
                    {usageLimit && <p>• Limité à {usageLimit} utilisations</p>}
                    <p>• L'ambassadeur recevra des points pour chaque utilisation</p>
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(generatedLink, "_blank")}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Ouvrir le lien
                  </Button>
                  {navigator.share && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={shareLink}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Partager
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">QR Code</h4>
                  <div className="bg-white p-4 rounded-lg border flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <QrCode className="h-32 w-32 text-gray-400" />
                      <p className="text-xs text-muted-foreground">
                        QR Code disponible prochainement
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center mb-6">
                  <Link2 className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Aucun lien généré</h3>
                <p className="text-muted-foreground text-lg">
                  Configurez les paramètres et générez un lien personnalisé
                </p>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}