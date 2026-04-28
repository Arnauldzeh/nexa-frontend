"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Briefcase } from "lucide-react";

interface EtapePassation {
  ordre: number;
  nom: string;
  delaiJours: number;
  dateDebut?: Date;
  dateFin?: Date;
  statut?: "non_demarre" | "en_cours" | "termine" | "en_retard";
  responsable?: string;
}

interface PassationData {
  typePassation: string;
  etapesPassation: EtapePassation[];
}

interface Props {
  data: PassationData | null;
  onChange: (data: PassationData) => void;
}

const TYPES_PASSATION = [
  { id: "DAO_ouvert", label: "DAO Ouvert" },
  { id: "DAO_restreint", label: "DAO Restreint" },
  { id: "appel_offres_national", label: "Appel d'offres National" },
  { id: "appel_offres_international", label: "Appel d'offres International" },
  { id: "gre_a_gre", label: "Gré à gré" },
  { id: "autre", label: "Autre" },
];

const ETAPES_PREDEFINIES = [
  { nom: "Rédaction du DAO", delaiJours: 14 },
  { nom: "Publication de l'avis", delaiJours: 7 },
  { nom: "Réception des offres", delaiJours: 30 },
  { nom: "Évaluation des offres", delaiJours: 21 },
  { nom: "Négociation", delaiJours: 7 },
  { nom: "Signature du contrat", delaiJours: 7 },
];

export function PlanningFormPassation({ data, onChange }: Props) {
  const [typePassation, setTypePassation] = useState(data?.typePassation || "");
  const [etapes, setEtapes] = useState<EtapePassation[]>(
    data?.etapesPassation || []
  );

  useEffect(() => {
    onChange({ typePassation, etapesPassation: etapes });
  }, [typePassation, etapes]);

  const chargerEtapesPredefinies = () => {
    const etapesPredefinies = ETAPES_PREDEFINIES.map((e, index) => ({
      ordre: index + 1,
      nom: e.nom,
      delaiJours: e.delaiJours,
      statut: "non_demarre" as const,
    }));
    setEtapes(etapesPredefinies);
  };

  const addEtape = () => {
    setEtapes([
      ...etapes,
      {
        ordre: etapes.length + 1,
        nom: "",
        delaiJours: 7,
        statut: "non_demarre",
      },
    ]);
  };

  const removeEtape = (index: number) => {
    const updated = etapes.filter((_, i) => i !== index);
    // Réordonner
    const reordered = updated.map((e, i) => ({ ...e, ordre: i + 1 }));
    setEtapes(reordered);
  };

  const updateEtape = (index: number, field: keyof EtapePassation, value: any) => {
    setEtapes(
      etapes.map((e, i) => {
        if (i !== index) return e;
        return { ...e, [field]: value };
      })
    );
  };

  const totalJours = etapes.reduce((sum, e) => sum + (e.delaiJours || 0), 0);

  return (
    <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden">
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Briefcase size={16} />
          Planification Passation
        </h2>
        <p className="text-[11px] text-[var(--text-secondary)] mt-1">
          Définissez le type de passation et les étapes du processus
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Type de Passation */}
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Type de Passation
          </label>
          <select
            value={typePassation}
            onChange={(e) => setTypePassation(e.target.value)}
            className="w-full max-w-md px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="">Sélectionnez un type...</option>
            {TYPES_PASSATION.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Étapes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Étapes du Processus
            </label>
            <div className="flex items-center gap-2">
              {etapes.length === 0 && (
                <button
                  onClick={chargerEtapesPredefinies}
                  className="px-3 py-1.5 text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 rounded-[var(--radius-sm)] transition-colors"
                >
                  Charger étapes prédéfinies
                </button>
              )}
              <div className="px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold bg-[var(--bg-inset)] text-[var(--text-secondary)]">
                Durée totale : {totalJours} jours
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {etapes.map((etape, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-[var(--bg-inset)] rounded-[var(--radius-md)] border border-[var(--border-default)]"
              >
                {/* Ordre */}
                <div className="w-8 h-8 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] flex items-center justify-center text-[11px] font-bold text-[var(--text-secondary)] flex-shrink-0">
                  {etape.ordre}
                </div>

                {/* Nom */}
                <input
                  type="text"
                  value={etape.nom}
                  onChange={(e) => updateEtape(index, "nom", e.target.value)}
                  placeholder="Nom de l'étape..."
                  className="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                />

                {/* Délai */}
                <div className="w-32">
                  <input
                    type="number"
                    min="0"
                    value={etape.delaiJours || ""}
                    onChange={(e) =>
                      updateEtape(index, "delaiJours", parseInt(e.target.value) || 0)
                    }
                    placeholder="Jours"
                    className="w-full px-2 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[12px] text-[var(--text-primary)] text-right focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Supprimer */}
                <button
                  onClick={() => removeEtape(index)}
                  className="p-2 rounded-[var(--radius-sm)] hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Ajouter */}
          <button
            onClick={addEtape}
            className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-[var(--radius-md)] transition-colors mt-3"
          >
            <Plus size={14} />
            Ajouter une étape
          </button>
        </div>
      </div>
    </div>
  );
}
