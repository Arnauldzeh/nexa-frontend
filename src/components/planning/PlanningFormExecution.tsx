"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Hammer, AlertCircle } from "lucide-react";

interface TacheExecution {
  numero: string;
  designation: string;
  unite?: string;
  quantite?: number;
  prixUnitaire?: number;
  dateDebut?: Date;
  dateFin?: Date;
  dureeJours?: number;
  avancement?: number;
  responsable?: string;
}

interface ExecutionData {
  tachesExecution: TacheExecution[];
}

interface Props {
  data: ExecutionData | null;
  onChange: (data: ExecutionData) => void;
}

const UNITES = ["ml", "m²", "m³", "ens", "u", "kg", "t", "j"];

export function PlanningFormExecution({ data, onChange }: Props) {
  const [taches, setTaches] = useState<TacheExecution[]>(
    data?.tachesExecution || [
      { numero: "T1", designation: "", unite: "ens", quantite: 0, prixUnitaire: 0 },
    ]
  );

  useEffect(() => {
    onChange({ tachesExecution: taches });
  }, [taches]);

  const addTache = () => {
    const nextNum = `T${taches.length + 1}`;
    setTaches([
      ...taches,
      { numero: nextNum, designation: "", unite: "ens", quantite: 0, prixUnitaire: 0 },
    ]);
  };

  const removeTache = (index: number) => {
    setTaches(taches.filter((_, i) => i !== index));
  };

  const updateTache = (index: number, field: keyof TacheExecution, value: any) => {
    setTaches(
      taches.map((t, i) => {
        if (i !== index) return t;
        return { ...t, [field]: value };
      })
    );
  };

  const calculateMontant = (quantite?: number, prixUnitaire?: number): number => {
    return (quantite || 0) * (prixUnitaire || 0);
  };

  const totalMontant = taches.reduce(
    (sum, t) => sum + calculateMontant(t.quantite, t.prixUnitaire),
    0
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden">
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Hammer size={16} />
          Planification Exécution
        </h2>
        <p className="text-[11px] text-[var(--text-secondary)] mt-1">
          Définissez les tâches d'exécution avec quantités et prix
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Info */}
        <div className="flex gap-3 p-3 rounded-[var(--radius-md)] bg-blue-500/10 border border-blue-500/20">
          <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-blue-600 dark:text-blue-400">
            Pour une planification détaillée avec import Excel, utilisez la fonctionnalité d'import
            de fichiers (Option C).
          </div>
        </div>

        {/* Tâches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Tâches d'Exécution
            </label>
            <div className="px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold bg-[var(--bg-inset)] text-[var(--text-secondary)]">
              Total : {formatNumber(totalMontant)} FCFA
            </div>
          </div>

          <div className="space-y-3">
            {taches.map((tache, index) => (
              <div
                key={index}
                className="p-4 bg-[var(--bg-inset)] rounded-[var(--radius-md)] border border-[var(--border-default)] space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Numéro */}
                  <input
                    type="text"
                    value={tache.numero}
                    onChange={(e) => updateTache(index, "numero", e.target.value)}
                    placeholder="T1"
                    className="w-16 px-2 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[12px] font-bold text-[var(--text-primary)] text-center focus:outline-none focus:border-[var(--accent)]"
                  />

                  {/* Désignation */}
                  <input
                    type="text"
                    value={tache.designation}
                    onChange={(e) => updateTache(index, "designation", e.target.value)}
                    placeholder="Désignation de la tâche..."
                    className="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                  />

                  {/* Supprimer */}
                  {taches.length > 1 && (
                    <button
                      onClick={() => removeTache(index)}
                      className="p-2 rounded-[var(--radius-sm)] hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {/* Unité */}
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                      Unité
                    </label>
                    <select
                      value={tache.unite || "ens"}
                      onChange={(e) => updateTache(index, "unite", e.target.value)}
                      className="w-full px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[11px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                    >
                      {UNITES.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantité */}
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tache.quantite || ""}
                      onChange={(e) =>
                        updateTache(index, "quantite", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* Prix Unitaire */}
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                      Prix Unit.
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tache.prixUnitaire || ""}
                      onChange={(e) =>
                        updateTache(index, "prixUnitaire", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                      Montant
                    </label>
                    <div className="px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[11px] font-semibold text-[var(--text-secondary)]">
                      {formatNumber(calculateMontant(tache.quantite, tache.prixUnitaire))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ajouter */}
          <button
            onClick={addTache}
            className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-[var(--radius-md)] transition-colors mt-3"
          >
            <Plus size={14} />
            Ajouter une tâche
          </button>
        </div>
      </div>
    </div>
  );
}
