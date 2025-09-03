"use client"

import { Users, Plus } from "lucide-react"

export default function GroupGamesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Création de Jeux en Groupe</h1>
        <p className="text-base-content/60">Créez des jeux collaboratifs pour des groupes d&apos;étudiants</p>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="card-title text-xl font-bold">Nouveau Jeu de Groupe</h2>
            <p className="text-base-content/60">Configurez un jeu pour plusieurs participants</p>
          </div>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Nom du groupe *</span>
              </label>
              <input
                id="groupName"
                className="input input-bordered w-full"
                placeholder="Ex: Classe de 3ème A"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text">Nombre min de joueurs *</span>
                </label>
                <input
                  id="minPlayers"
                  type="number"
                  min="2"
                  className="input input-bordered w-full"
                  placeholder="2"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text">Nombre max de joueurs *</span>
                </label>
                <input
                  id="maxPlayers"
                  type="number"
                  min="2"
                  className="input input-bordered w-full"
                  placeholder="10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Mode de jeu *</span>
              </label>
              <select
                id="gameMode"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="">Sélectionnez un mode</option>
                <option value="competitive">Compétitif</option>
                <option value="collaborative">Collaboratif</option>
                <option value="tournament">Élimination</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Durée estimée (minutes)</span>
              </label>
              <input
                id="duration"
                type="number"
                min="5"
                className="input input-bordered w-full"
                placeholder="30"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Créer le jeu de groupe
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="card-title text-xl font-bold">Jeux de Groupe Actifs</h2>
            <p className="text-base-content/60">Sessions de jeu en cours</p>
          </div>
          <div className="space-y-3">
            {[
              { name: "Tournoi Math 3ème", players: "8/10", mode: "Compétitif", status: "En cours" },
              { name: "Quiz Sciences 4ème B", players: "5/6", mode: "Collaboratif", status: "En attente" },
              { name: "Défi Histoire", players: "12/12", mode: "Élimination", status: "En cours" },
            ].map((game, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{game.name}</p>
                    <p className="text-sm text-base-content/60">{game.mode} • {game.players} joueurs</p>
                  </div>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    game.status === "En cours" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {game.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}