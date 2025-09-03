"use client"

import { Gamepad2, Plus } from "lucide-react"
import { useState } from "react"

export default function GamesByCountryPage() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [gameTitle, setGameTitle] = useState("")
  const [gameType, setGameType] = useState("")
  const [difficulty, setDifficulty] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Créer un Jeu par Pays</h1>
        <p className="text-base-content/60">Créez des jeux adaptés au programme de chaque pays</p>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="card-title text-xl font-bold">Nouveau Jeu</h2>
            <p className="text-base-content/60">Configurez les paramètres du jeu</p>
          </div>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text">Pays *</span>
                </label>
                <select
                  id="country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Sélectionnez un pays</option>
                  <option value="CM">Cameroun</option>
                  <option value="SN">Sénégal</option>
                  <option value="CI">Côte d&apos;Ivoire</option>
                  <option value="GA">Gabon</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="label">
                  <span className="label-text">Examen</span>
                </label>
                <select
                  id="exam"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Sélectionnez un examen</option>
                  <option value="bepc">BEPC</option>
                  <option value="bac">Baccalauréat</option>
                  <option value="cep">CEP</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Titre du jeu *</span>
              </label>
              <input
                id="title"
                className="input input-bordered w-full"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                placeholder="Ex: Quiz Mathématiques BEPC"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text">Type de jeu *</span>
                </label>
                <select
                  id="type"
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="quiz">Quiz</option>
                  <option value="memory">Memory</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="matching">Association</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="label">
                  <span className="label-text">Difficulté *</span>
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Sélectionnez la difficulté</option>
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Matière</span>
              </label>
              <select
                id="subject"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">Sélectionnez une matière</option>
                <option value="math">Mathématiques</option>
                <option value="french">Français</option>
                <option value="science">Sciences</option>
                <option value="history">Histoire</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                id="description"
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                placeholder="Décrivez le jeu et ses objectifs pédagogiques..."
              />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Créer le jeu
              </button>
              <button type="button" className="btn btn-outline">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Games */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="card-title text-xl font-bold">Jeux Récents</h2>
            <p className="text-base-content/60">Derniers jeux créés par pays</p>
          </div>
          <div className="space-y-3">
            {[
              { title: "Quiz Math BEPC", country: "Cameroun", type: "Quiz", created: "Il y a 2 heures" },
              { title: "Memory Sciences", country: "Sénégal", type: "Memory", created: "Il y a 5 heures" },
              { title: "Puzzle Géographie", country: "Côte d'Ivoire", type: "Puzzle", created: "Hier" },
            ].map((game, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{game.title}</p>
                    <p className="text-sm text-base-content/60">{game.country} • {game.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-base-content/60">{game.created}</p>
                  <button className="btn btn-sm btn-ghost">Modifier</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}