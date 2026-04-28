"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  Save,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Clock,
  User,
  FileText,
  Briefcase,
  Hammer,
} from "lucide-react";
import { getProjectById, type Project } from "@/lib/projectStore";
import { planningService, type Planning, type CreatePlanningDto, type UpdatePlanningDto } from "@/services/api/planningService";
import { toast } from "@/lib/toastStore";
import { PlanningFormEtude } from "@/components/planning/PlanningFormEtude";
import { PlanningFormPassation } from "@/components/planning/PlanningFormPassation";
import { PlanningFormExecution } from "@/components/planning/PlanningFormExecution";
import { BudgetMultiDevise } from "@/components/planning/BudgetMultiDevise";

// Types d'activités
const ACTIVITY_TYPES = {
  travaux: { label: "Travaux", icon: Hammer, color: "blue" },
  fourniture: { label: "Fourniture", icon: Briefcase, color: "amber" },
  services: { label: "Services", icon: User, color: "green" },
  etudes: { label: "Études", icon: FileText, color: "purple" },
  pi: { label: "Prestations Intellectuelles", icon: FileText, color: "rose" },
};

export default function ActivityPlanningPage() {
  const params = useParams();
  const router = useRouter();
  const projectCode = typeof params.projectCode === "string" ? params.projectCode : "";
  const activityPath = typeof params.activityPath === "string" ? params.activityPath : "";

  const [project, setProject] = useState<Project | null>(null);
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Informations de l'activité
  const [activityName, setActivityName] = useState("");
  const [activityType, setActivityType] = useState<"travaux" | "fourniture" | "services" | "etudes" | "pi">("travaux");

  // Types de planification activés
  const [hasEtudePrealable, setHasEtudePrealable] = useState(false);
  const [hasPassation, setHasPassation] = useState(false);
  const [hasExecution, setHasExecution] = useState(false);

  // Données communes
  const [budgetInitial, setBudgetInitial] = useState<Array<{ devise: string; montant: number; pourcentage?: number }>>([
    { devise: "FCFA", montant: 0, pourcentage: 100 }
  ]);
  const [dateDebutInitiale, setDateDebutInitiale] = useState<string>("");
  const [dateFinInitiale, setDateFinInitiale] = useState<string>("");
  const [responsablePrincipal, setResponsablePrincipal] = useState("");
  const [notes, setNotes] = useState("");

  // Données spécifiques (gérées par les sous-composants)
  const [etudeData, setEtudeData] = useState<any>(null);
  const [passationData, setPassationData] = useState<any>(null);
  const [executionData, setExecutionData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [projectCode, activityPath]);

  async function loadData() {
    setLoading(true);
    try {
      // Charger le projet
      const proj = await getProjectById(projectCode);
      if (!proj) {
        toast.error("Projet introuvable");
        router.push("/planification");
        return;
      }
      setProject(proj);

      // Trouver l'activité dans la structure
      const activity = findActivityByPath(proj, activityPath);
      if (activity) {
        setActivityName(activity.name);
        setActivityType(activity.type);
      }

      // Charger la planification existante
      try {
        const existingPlanning = await planningService.getOne(projectCode, activityPath);
        setPlanning(existingPlanning);
        setIsEditMode(true);
        populateFormFromPlanning(existingPlanning);
      } catch (error) {
        // Pas de planification existante, mode création
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  function findActivityByPath(proj: Project, path: string) {
    const parts = path.split(".");
    if (parts.length < 3) return null;

    const [compId, scId, actId] = parts;
    const comp = proj.components.find((c) => c.id === compId);
    if (!comp) return null;

    const sc = comp.sousComposants.find((s) => s.id === scId);
    if (!sc) return null;

    const actIndex = parseInt(actId.replace("A", "")) - 1;
    const act = sc.activities[actIndex];
    if (!act) return null;

    return {
      name: typeof act === "string" ? act : act.name,
      type: (typeof act === "string" ? "travaux" : act.typeActivite) as any,
    };
  }

  function populateFormFromPlanning(p: Planning) {
    setHasEtudePrealable(p.hasEtudePrealable);
    setHasPassation(p.hasPassation);
    setHasExecution(p.hasExecution);
    setBudgetInitial(p.budgetInitial || []);
    setDateDebutInitiale(p.dateDebutInitiale ? new Date(p.dateDebutInitiale).toISOString().split("T")[0] : "");
    setDateFinInitiale(p.dateFinInitiale ? new Date(p.dateFinInitiale).toISOString().split("T")[0] : "");
    setResponsablePrincipal(p.responsablePrincipal || "");
    setNotes(p.notes || "");

    // Données spécifiques
    if (p.hasEtudePrealable) {
      setEtudeData({
        livrables: p.livrables || [],
        dateT0Etude: p.dateT0Etude ? new Date(p.dateT0Etude).toISOString().split("T")[0] : "",
      });
    }
    if (p.hasPassation) {
      setPassationData({
        typePassation: p.typePassation || "",
        etapesPassation: p.etapesPassation || [],
      });
    }
    if (p.hasExecution) {
      setExecutionData({
        tachesExecution: p.tachesExecution || [],
      });
    }
  }

  async function handleSave() {
    // Validation
    if (!hasEtudePrealable && !hasPassation && !hasExecution) {
      toast.error("Sélectionnez au moins un type de planification");
      return;
    }

    if (budgetInitial.length === 0 || budgetInitial.every((b) => b.montant === 0)) {
      toast.error("Veuillez saisir un budget");
      return;
    }

    setSaving(true);
    try {
      const budgetInitialTotal = budgetInitial.reduce((sum, b) => sum + b.montant, 0);

      const data: CreatePlanningDto | UpdatePlanningDto = {
        projectCode,
        activityPath,
        activityName,
        activityType,
        hasEtudePrealable,
        hasPassation,
        hasExecution,
        budgetInitial,
        budgetInitialTotal,
        dateDebutInitiale: dateDebutInitiale ? new Date(dateDebutInitiale) : undefined,
        dateFinInitiale: dateFinInitiale ? new Date(dateFinInitiale) : undefined,
        delaiInitialMois: dateDebutInitiale && dateFinInitiale
          ? Math.round(
              (new Date(dateFinInitiale).getTime() - new Date(dateDebutInitiale).getTime()) /
                (1000 * 60 * 60 * 24 * 30)
            )
          : undefined,
        responsablePrincipal: responsablePrincipal || undefined,
        notes: notes || undefined,
        // Données spécifiques
        ...(hasEtudePrealable && etudeData
          ? {
              livrables: etudeData.livrables || [],
              dateT0Etude: etudeData.dateT0Etude ? new Date(etudeData.dateT0Etude) : undefined,
            }
          : {}),
        ...(hasPassation && passationData
          ? {
              typePassation: passationData.typePassation,
              etapesPassation: passationData.etapesPassation || [],
            }
          : {}),
        ...(hasExecution && executionData
          ? {
              tachesExecution: executionData.tachesExecution || [],
            }
          : {}),
      };

      if (isEditMode) {
        await planningService.update(projectCode, activityPath, data as UpdatePlanningDto);
        toast.success("Planification mise à jour");
      } else {
        await planningService.create(data as CreatePlanningDto);
        toast.success("Planification créée");
        setIsEditMode(true);
      }

      // Recharger
      await loadData();
    } catch (error: any) {
      console.error("Erreur sauvegarde:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette planification ?")) return;

    try {
      await planningService.delete(projectCode, activityPath);
      toast.success("Planification supprimée");
      router.push(`/planification/${projectCode}`);
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-secondary)]">Projet introuvable</p>
        <Link href="/planification" className="text-[var(--accent)] text-sm mt-2 inline-block">
          Retour
        </Link>
      </div>
    );
  }

  const ActivityIcon = ACTIVITY_TYPES[activityType]?.icon || FileText;
  const activityColor = ACTIVITY_TYPES[activityType]?.color || "blue";

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-8 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href={`/planification/${projectCode}`}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <ChevronLeft size={14} /> Retour au projet
          </Link>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-${activityColor}-500 to-${activityColor}-600 flex items-center justify-center text-white shadow-[var(--shadow-sm)] flex-shrink-0`}
            >
              <ActivityIcon size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight">
                {activityName}
                <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] bg-[var(--bg-inset)] text-[var(--text-tertiary)] font-bold">
                  {activityPath}
                </span>
              </h1>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                {project.name} • {ACTIVITY_TYPES[activityType]?.label}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-[var(--radius-md)] text-sm font-semibold hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-[var(--radius-md)] text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} /> {saving ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Info Banner */}
          <div className="flex gap-3 p-4 rounded-[var(--radius-lg)] bg-blue-500/10 border border-blue-500/20">
            <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-[12px] text-blue-600 dark:text-blue-400 leading-relaxed">
              <strong>Planification de l'activité</strong> : Sélectionnez les types de planification nécessaires
              (Étude, Passation, Exécution) et remplissez les informations correspondantes. Les données initiales
              pourront être actualisées ultérieurement.
            </div>
          </div>

          {/* Types de Planification */}
          <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border-subtle)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <CheckCircle2 size={16} />
                Types de Planification
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Sélectionnez au moins un type de planification pour cette activité
              </p>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] border-2 border-[var(--border-default)] hover:border-[var(--accent)] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEtudePrealable}
                  onChange={(e) => setHasEtudePrealable(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[var(--accent)]"
                />
                <div>
                  <div className="text-[13px] font-bold text-[var(--text-primary)]">Étude Préalable</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    Livrables, rapports, pondération
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] border-2 border-[var(--border-default)] hover:border-[var(--accent)] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPassation}
                  onChange={(e) => setHasPassation(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[var(--accent)]"
                />
                <div>
                  <div className="text-[13px] font-bold text-[var(--text-primary)]">Passation</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    DAO, appel d'offres, étapes
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] border-2 border-[var(--border-default)] hover:border-[var(--accent)] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExecution}
                  onChange={(e) => setHasExecution(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[var(--accent)]"
                />
                <div>
                  <div className="text-[13px] font-bold text-[var(--text-primary)]">Exécution</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    Tâches, quantités, prix
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Données Communes */}
          <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border-subtle)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <DollarSign size={16} />
                Informations Générales
              </h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Budget Multi-Devises */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  Budget Initial
                </label>
                <BudgetMultiDevise budgets={budgetInitial} onChange={setBudgetInitial} />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Date de Début
                  </label>
                  <input
                    type="date"
                    value={dateDebutInitiale}
                    onChange={(e) => setDateDebutInitiale(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Date de Fin
                  </label>
                  <input
                    type="date"
                    value={dateFinInitiale}
                    onChange={(e) => setDateFinInitiale(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              {/* Responsable */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  Responsable Principal
                </label>
                <input
                  type="text"
                  value={responsablePrincipal}
                  onChange={(e) => setResponsablePrincipal(e.target.value)}
                  placeholder="ID ou nom du responsable"
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes et observations..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Formulaires Spécifiques */}
          {hasEtudePrealable && (
            <PlanningFormEtude
              data={etudeData}
              onChange={setEtudeData}
              dateDebutInitiale={dateDebutInitiale}
            />
          )}

          {hasPassation && (
            <PlanningFormPassation data={passationData} onChange={setPassationData} />
          )}

          {hasExecution && (
            <PlanningFormExecution data={executionData} onChange={setExecutionData} />
          )}
        </div>
      </div>
    </div>
  );
}
