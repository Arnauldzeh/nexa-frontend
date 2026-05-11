"use client";

import { useEffect, useState } from "react";
import { MSProjectViewV2 } from "@/components/planning/MSProjectViewV2";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/projectStore";
import type { Planning } from "@/services/api/planningService";

// Données de test
const mockProject: Project = {
  id: "test-project",
  code: "TEST-001",
  name: "Projet Test Planning V2",
  description: "Test du nouveau tableau MS Project",
  status: "active",
  startDate: new Date("2024-01-15"),
  endDate: new Date("2024-12-31"),
  budget: 1000000,
  components: [
    {
      id: "C1",
      name: "Études préalables",
      typeActivite: "etudes",
      sousComposants: [
        {
          id: "SC1",
          name: "Étude technique",
          typeActivite: "etudes",
          activities: [
            { name: "Étude d'optimisation", typeActivite: "etudes" },
            { name: "Analyse de faisabilité", typeActivite: "etudes" },
          ],
        },
      ],
    },
    {
      id: "C2",
      name: "Travaux de construction",
      typeActivite: "travaux",
      sousComposants: [],
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPlannings: Planning[] = [
  {
    _id: "plan1",
    projectCode: "TEST-001",
    activityPath: "C1.SC1.A1",
    typeActivite: "etudes",
    dateDebutInitiale: new Date("2024-01-15"),
    dateFinInitiale: new Date("2024-04-15"),
    delaiInitialMois: 3,
    dateT0Etude: new Date("2024-01-01"),
    livrables: [
      {
        numero: "R1",
        intitule: "Rapport de démarrage",
        ponderation: 20,
        dateDebut: "2024-01-15",
        dateFin: "2024-02-01",
        duree: 0.5,
        delai: 0.5,
      },
      {
        numero: "R2",
        intitule: "Rapport intermédiaire",
        ponderation: 30,
        dateDebut: "2024-02-01",
        duree: 1,
        predecesseur: "R1",
      },
      {
        numero: "R3",
        intitule: "Rapport final",
        ponderation: 50,
        dateDebut: "2024-03-01",
        duree: 1.5,
        predecesseur: "R2",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "plan2",
    projectCode: "TEST-001",
    activityPath: "C1.SC1.A2",
    typeActivite: "etudes",
    dateDebutInitiale: new Date("2024-02-01"),
    dateFinInitiale: new Date("2024-05-01"),
    delaiInitialMois: 3,
    dateT0Etude: new Date("2024-01-01"),
    livrables: [
      {
        numero: "T1",
        intitule: "Analyse préliminaire",
        ponderation: 40,
        dateDebut: "2024-02-01",
        duree: 1,
      },
      {
        numero: "T2",
        intitule: "Étude détaillée",
        ponderation: 60,
        dateDebut: "2024-03-01",
        duree: 2,
        predecesseur: "T1",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "plan3",
    projectCode: "TEST-001",
    activityPath: "C2",
    typeActivite: "travaux",
    dateDebutInitiale: new Date("2024-05-01"),
    dateFinInitiale: new Date("2024-12-31"),
    delaiInitialMois: 8,
    livrables: [
      {
        numero: "L1",
        intitule: "Fondations",
        ponderation: 30,
        dateDebut: "2024-05-01",
        duree: 2,
      },
      {
        numero: "L2",
        intitule: "Structure",
        ponderation: 40,
        dateDebut: "2024-07-01",
        duree: 3,
        predecesseur: "L1",
      },
      {
        numero: "L3",
        intitule: "Finitions",
        ponderation: 30,
        dateDebut: "2024-10-01",
        duree: 3,
        predecesseur: "L2",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function TestMSProjectV2Page() {
  const router = useRouter();
  const [plannings, setPlannings] = useState<Planning[]>(mockPlannings);

  const handleRefresh = () => {
    console.log("Refresh requested");
    // Dans un vrai cas, on rechargerait les données depuis l'API
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--bg-inset)] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              Test MS Project View V2
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Nouveau tableau avec colonnes intelligentes
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Instructions de test
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Cliquez sur ▶/▼ pour développer/réduire les niveaux</li>
          <li>• Cliquez sur une cellule de livrable pour éditer (sauf champs calculés en gris)</li>
          <li>• Les champs calculés automatiquement : Date fin (si Date début + Durée), Échéance (si Délai)</li>
          <li>• Prédécesseur : entrez le numéro d'un autre livrable (ex: R1, R2)</li>
          <li>• La pondération totale par activité doit faire 100%</li>
          <li>• Cliquez "Sauvegarder" pour valider les modifications</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <MSProjectViewV2
          project={mockProject}
          plannings={plannings}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
