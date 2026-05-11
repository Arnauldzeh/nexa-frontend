"use client";

import { useState } from "react";
import { ActivityPlanningTable } from "@/components/planning/ActivityPlanningTable";

export default function PlanningTestPage() {
  const [livrables, setLivrables] = useState([
    {
      numero: "R1",
      intitule: "Rapport de démarrage",
      ponderation: 20,
      dateDebut: "2024-01-15",
      duree: 1,
      delai: 1,
    },
    {
      numero: "R2",
      intitule: "Rapport topographie",
      ponderation: 15,
      predecesseur: "R1",
      duree: 2,
      delai: 3,
    },
    {
      numero: "R3",
      intitule: "Rapport environnemental",
      ponderation: 25,
      dateDebut: "2024-01-15",
      duree: 5,
      delai: 5,
    },
    {
      numero: "R4",
      intitule: "Rapport final",
      ponderation: 40,
      predecesseur: "R2",
      duree: 4,
      delai: 7,
    },
  ]);

  const handleSave = async (newLivrables: any[]) => {
    console.log("Sauvegarde des livrables:", newLivrables);
    setLivrables(newLivrables);
    // Ici, vous feriez un appel API pour sauvegarder
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler un délai
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test du Tableau de Planification</h1>
        
        <ActivityPlanningTable
          activityPath="C1.SC1.A1"
          activityName="Étude d'optimisation du barrage de Mbakao"
          dateT0="2024-01-15"
          livrables={livrables}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
