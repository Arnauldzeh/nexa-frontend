"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, AlertCircle, Upload } from "lucide-react";
import { FileImportModal } from "./FileImportModal";

interface Livrable {
  numero: string;
  intitule: string;
  ponderation: number;
  delaiMois: number;
  dateEcheance?: Date;
  description?: string;
  statut?: "en_attente" | "soumis" | "valide" | "rejete";
}

interface EtudeData {
  livrables: Livrable[];
  dateT0Etude: string;
}

interface Props {
  data: EtudeData | null;
  onChange: (data: EtudeData) => void;
  dateDebutInitiale?: string;
}

export function PlanningFormEtude({ data, onChange, dateDebutInitiale }: Props) {
  const [livrables, setLivrables] = useState<Livrable[]>(
    data?.livrables || [
      { numero: "R1", intitule: "", ponderation: 0, delaiMois: 1, statut: "en_attente" },
    ]
  );
  const [dateT0, setDateT0] = useState(data?.dateT0Etude || dateDebutInitiale || "");
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    onChange({ livrables, dateT0Etude: dateT0 });
  }, [livrables, dateT0]);

  const addLivrable = () => {
    const nextNum = `R${livrables.length + 1}`;
    setLivrables([
      ...livrables,
      { numero: nextNum, intitule: "", ponderation: 0, delaiMois: 1, statut: "en_attente" },
    ]);
  };

  const removeLivrable = (index: number) => {
    setLivrables(livrables.filter((_, i) => i !== index));
  };

  const updateLivrable = (index: number, field: keyof Livrable, value: any) => {
    setLivrables(
      livrables.map((l, i) => {
        if (i !== index) return l;
        return { ...l, [field]: value };
      })
    );
  };

  const calculateDateEcheance = (delaiMois: number): string => {
    if (!dateT0) return "—";
    const date = new Date(dateT0);
    date.setMonth(date.getMonth() + delaiMois);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const totalPonderation = livrables.reduce((sum, l) => sum + (l.ponderation || 0), 0);
  const isValidPonderation = totalPonderation === 100;

  const handleImport = (importedData: any[], calibrage: Record<string, number>) => {
    const imported = importedData.map((row) => ({
      numero: row.numero || "",
      intitule: row.intitule || "",
      ponderation: row.ponderation || 0,
      delaiMois: row.delaiMois || 0,
      description: row.description || "",
      statut: "en_attente" as const,
    }));
    setLivrables(imported);
  };

  return (
    <>
      <FileImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        importType="etude"
      />
    <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden">
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FileText size={16} />
          Planification Étude Préalable
        </h2>
        <p className="text-[11px] text-[var(--text-secondary)] mt-1">
          Définissez les livrables (rapports) avec leur pondération et délais
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Date T0 */}
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Date T0 (Démarrage de l'étude)
          </label>
          <input
            type="date"
            value={dateT0}
            onChange={(e) => setDateT0(e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
            Les échéances seront calculées à partir de cette date (T0 + X mois)
          </p>
        </div>

        {/* Livrables */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Livrables / Rapports
            </label>
            <div
              className={`px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold ${
                isValidPonderation
                  ? "bg-green-500/10 text-green-600"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              Total : {totalPonderation}% {isValidPonderation ? "✓" : "⚠ Doit être 100%"}
            </div>
          </div>

          <div className="space-y-3">
            {livrables.map((livrable, index) => (
              <div
                key={index}
                className="p-4 bg-[var(--bg-inset)] rounded-[var(--radius-md)] border border-[var(--border-default)] space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Numéro */}
                  <input
                    type="text"
                    value={livrable.numero}
                    onChange={(e) => updateLivrable(index, "numero", e.target.value)}
                    placeholder="R1"
                    className="w-16 px-2 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[12px] font-bold text-[var(--text-primary)] text-center focus:outline-none focus:border-[var(--accent)]"
                  />

                  {/* Intitulé */}
                  <input
                    type="text"
                    value={livrable.intitule}
                    onChange={(e) => updateLivrable(index, "intitule", e.target.value)}
                    placeholder="Intitulé du livrable..."
                    className="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                  />

                  {/* Supprimer */}
                  {livrables.length > 1 && (
                    <button
                      onClick={() => removeLivrable(index)}
                      className="p-2 rounded-[var(--radius-sm)] hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Pondération */}
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                      Pondération (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={livrable.ponderation || ""}
                      onChange={(e) =>
                        updateLivrable(index, "ponderation", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* Délai */}
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                      Délai (mois)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={livrable.delaiMois || ""}
                      onChange={(e) =>
                        updateLivrable(index, "delaiMois", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* Échéance calculée */}
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                      Échéance
                    </label>
                    <div className="px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[11px] font-semibold text-[var(--text-secondary)]">
                      {calculateDateEcheance(livrable.delaiMois)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={livrable.description || ""}
                    onChange={(e) => updateLivrable(index, "description", e.target.value)}
                    placeholder="Description du livrable..."
                    rows={2}
                    className="w-full px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={addLivrable}
              className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-[var(--radius-md)] transition-colors"
            >
              <Plus size={14} />
              Ajouter un livrable
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-[var(--radius-md)] transition-colors"
            >
              <Upload size={14} />
              Importer depuis Excel
            </button>
          </div>
        </div>

        {/* Alerte pondération */}
        {!isValidPonderation && livrables.length > 0 && (
          <div className="flex gap-3 p-3 rounded-[var(--radius-md)] bg-amber-500/10 border border-amber-500/20">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-600 dark:text-amber-400">
              <strong>Attention :</strong> La somme des pondérations doit être égale à 100%. Actuellement
              : {totalPonderation}%
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
