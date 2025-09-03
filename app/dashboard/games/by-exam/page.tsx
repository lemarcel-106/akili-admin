"use client"

import { useState } from "react"
import { BookOpen, Plus } from "lucide-react"
import { EnhancedSelect } from "@/components/enhanced-select"

export default function GamesByExamPage() {
  const [selectedExam, setSelectedExam] = useState("")
  const [selectedYear, setSelectedYear] = useState("")

  const examOptions = [
    { value: "bepc", label: "BEPC - Cameroun" },
    { value: "bac", label: "Baccalauréat - Cameroun" },
    { value: "bfem", label: "BFEM - Sénégal" },
    { value: "cep", label: "CEP - Sénégal" }
  ]

  const yearOptions = [
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Créer un Jeu par Examen</h1>
        <p className="text-base-content/60">Créez des jeux spécifiques aux examens</p>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="card-title text-xl font-bold">Nouveau Jeu d&apos;Examen</h2>
            <p className="text-base-content/60">Configurez un jeu basé sur un examen spécifique</p>
          </div>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text">Examen *</span>
                </label>
                <EnhancedSelect
                  options={examOptions}
                  value={selectedExam}
                  placeholder="Sélectionnez un examen"
                  clearable={true}
                  onChange={setSelectedExam}
                  onClear={() => setSelectedExam("")}
                />
              </div>

              <div className="space-y-2">
                <label className="label">
                  <span className="label-text">Année</span>
                </label>
                <EnhancedSelect
                  options={yearOptions}
                  value={selectedYear}
                  placeholder="Sélectionnez l'année"
                  clearable={true}
                  onChange={setSelectedYear}
                  onClear={() => setSelectedYear("")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="gameTitle" className="label">
                <span className="label-text">Titre du jeu *</span>
              </label>
              <input
                id="gameTitle"
                type="text"
                placeholder="Ex: Préparation BEPC 2024"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="topics" className="label">
                <span className="label-text">Sujets à couvrir</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Mathématiques",
                  "Français",
                  "Sciences",
                  "Histoire-Géo",
                  "Anglais",
                  "SVT"
                ].map((subject) => (
                  <label key={subject} className="flex items-center gap-2">
                    <input type="checkbox" className="checkbox" />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="questions" className="label">
                  <span className="label-text">Nombre de questions</span>
                </label>
                <input
                  id="questions"
                  type="number"
                  min="5"
                  placeholder="20"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="time" className="label">
                  <span className="label-text">Temps limite (min)</span>
                </label>
                <input
                  id="time"
                  type="number"
                  min="5"
                  placeholder="30"
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Créer le jeu d&apos;examen
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="card-title text-xl font-bold">Jeux d&apos;Examens Populaires</h2>
            <p className="text-base-content/60">Les jeux les plus joués</p>
          </div>
          <div className="space-y-3">
            {[
              { title: "BEPC 2024 - Révision Complète", exam: "BEPC", plays: 1234, rating: 4.8 },
              { title: "Bac S - Mathématiques", exam: "Baccalauréat", plays: 876, rating: 4.6 },
              { title: "BFEM Blanc 2024", exam: "BFEM", plays: 654, rating: 4.7 },
            ].map((game, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{game.title}</p>
                    <p className="text-sm text-base-content/60">
                      {game.exam} • {game.plays} parties • ★ {game.rating}
                    </p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm">Jouer</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}