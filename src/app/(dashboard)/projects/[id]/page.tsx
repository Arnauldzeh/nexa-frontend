"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Settings, Users, Layers, Plus, Trash2, Edit2,
  ChevronUp, ChevronDown, Save, MapPin, DollarSign, Calendar,
  CheckCircle2,
} from "lucide-react";
import { getProjectById, updateProject, type Project, type Component, type SousComposant } from "@/lib/projectStore";
import { getProjectTeam, getUserById, getUserFullName, type TeamAssignment } from "@/lib/userStore";
import { toast } from "@/lib/toastStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type ConfirmState = {
  type: "component" | "subcomponent" | "activity";
  title: string;
  message: string;
  onConfirm: () => void;
} | null;

// ══════════════════════════════════════
// ACTIVITY TYPES
// ══════════════════════════════════════
export const ACTIVITY_TYPES = [
  { id: "travaux", label: "Travaux", color: "bg-blue-500", bgColor: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { id: "fourniture", label: "Fourniture", color: "bg-amber-500", bgColor: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { id: "services", label: "Services", color: "bg-green-500", bgColor: "bg-green-500/10 text-green-600 border-green-500/20" },
  { id: "etudes", label: "Études", color: "bg-purple-500", bgColor: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { id: "pi", label: "Prestations Intellectuelles", color: "bg-rose-500", bgColor: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
];

const getActivityName = (act: string | { name: string; typeActivite: string }): string =>
  typeof act === "string" ? act : act.name;

const getActivityType = (act: string | { name: string; typeActivite: string }): string =>
  typeof act === "string" ? "travaux" : act.typeActivite;

// ══════════════════════════════════════
// PAGE
// ══════════════════════════════════════
export default function ProjectConfigPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"info" | "structure" | "team">("info");

  // Load project
  useEffect(() => {
    async function loadProject() {
      const proj = await getProjectById(projectId);
      setProject(proj);
      if (proj) {
        setComponents(proj.components || []);
      }
    }
    loadProject();
  }, [projectId]);

  // ── Editable structure state ──
  const [components, setComponents] = useState<Component[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  // ── Team data ──
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  
  useEffect(() => {
    async function loadTeam() {
      const team = await getProjectTeam(projectId);
      setTeamAssignments(team);
    }
    loadTeam();
  }, [projectId]);

  const markChanged = () => setHasChanges(true);

  // ── Structure actions ──
  const addComponent = () => {
    setComponents(prev => [...prev, { id: `c${Date.now()}`, name: "", sousComposants: [] }]);
    markChanged();
  };
  const removeComponent = (idx: number) => {
    setConfirmState({
      type: "component",
      title: "Supprimer le composant",
      message: "Êtes-vous sûr de vouloir supprimer ce composant ? Cette action est irréversible.",
      onConfirm: () => {
        setComponents(prev => prev.filter((_, i) => i !== idx));
        markChanged();
      }
    });
  };
  const updateComponentName = (idx: number, name: string) => {
    setComponents(prev => prev.map((c, i) => i === idx ? { ...c, name } : c));
    markChanged();
  };
  const updateComponentBudget = (idx: number, budget: string) => {
    setComponents(prev => prev.map((c, i) => i === idx ? { ...c, budget } : c));
    markChanged();
  };
  const addSousComposant = (compIdx: number) => {
    setComponents(prev => prev.map((c, i) => i === compIdx ? { ...c, sousComposants: [...c.sousComposants, { id: `sc${Date.now()}`, name: "", activities: [] }] } : c));
    markChanged();
  };
  const removeSousComposant = (compIdx: number, scIdx: number) => {
    setConfirmState({
      type: "subcomponent",
      title: "Supprimer le sous-composant",
      message: "Êtes-vous sûr de vouloir supprimer ce sous-composant ? Cette action est irréversible.",
      onConfirm: () => {
        setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.filter((_, si) => si !== scIdx) } : c));
        markChanged();
      }
    });
  };
  const updateSCName = (compIdx: number, scIdx: number, name: string) => {
    setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? { ...sc, name } : sc) } : c));
    markChanged();
  };
  const addActivity = (compIdx: number, scIdx: number, typeActivite: string = "travaux") => {
    const newAct = { name: "", typeActivite };
    setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? { ...sc, activities: [...sc.activities, newAct] } : sc) } : c));
    markChanged();
  };
  const updateActivityName = (compIdx: number, scIdx: number, actIdx: number, name: string) => {
    setComponents(prev => prev.map((c, ci) => ci === compIdx ? {
      ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? {
        ...sc, activities: sc.activities.map((a, ai) => ai === actIdx ? (typeof a === "string" ? { name, typeActivite: "travaux" } : { ...a, name }) : a)
      } : sc)
    } : c));
    markChanged();
  };
  const updateActivityType = (compIdx: number, scIdx: number, actIdx: number, typeActivite: string) => {
    setComponents(prev => prev.map((c, ci) => ci === compIdx ? {
      ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? {
        ...sc, activities: sc.activities.map((a, ai) => ai === actIdx ? (typeof a === "string" ? { name: a, typeActivite } : { ...a, typeActivite }) : a)
      } : sc)
    } : c));
    markChanged();
  };
  const removeActivity = (compIdx: number, scIdx: number, actIdx: number) => {
    setConfirmState({
      type: "activity",
      title: "Supprimer l'activité",
      message: "Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible.",
      onConfirm: () => {
        setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? { ...sc, activities: sc.activities.filter((_, ai) => ai !== actIdx) } : sc) } : c));
        markChanged();
      }
    });
  };

  // ═══ Promotion / Rétrogradation ═══
  const demoteComponent = (ci: number) => {
      if (ci <= 0) return;
      setComponents(prev => {
          const comp = prev[ci];
          const newSC: SousComposantData = { id: `sc${Date.now()}`, name: comp.name, activities: comp.sousComposants.flatMap(sc => sc.activities.length > 0 ? sc.activities : [{ name: sc.name, typeActivite: "travaux" } as const]) };
          const result = prev.filter((_, i) => i !== ci);
          result[ci - 1] = { ...result[ci - 1], sousComposants: [...result[ci - 1].sousComposants, newSC] };
          return result;
      });
      markChanged();
  };

  const promoteSC = (ci: number, si: number) => {
      setComponents(prev => {
          const comp = prev[ci];
          const sc = comp.sousComposants[si];
          const newComp: ComponentData = { id: `c${Date.now()}`, name: sc.name, sousComposants: [], budget: "" };
          if (sc.activities.length > 0) {
              newComp.sousComposants = sc.activities.map((a, idx) => ({ id: `sc${Date.now() + idx + 1}`, name: getActivityName(a), activities: [] }));
          }
          const updatedComp = { ...comp, sousComposants: comp.sousComposants.filter((_, j) => j !== si) };
          const result = [...prev];
          result[ci] = updatedComp;
          result.splice(ci + 1, 0, newComp);
          return result;
      });
      markChanged();
  };

  const demoteSC = (ci: number, si: number) => {
      if (si <= 0) return;
      setComponents(prev => prev.map((c, i) => {
          if (i !== ci) return c;
          const sc = c.sousComposants[si];
          const updatedSCs = c.sousComposants.filter((_, j) => j !== si);
          const prevSCIdx = si - 1;
          updatedSCs[prevSCIdx] = {
              ...updatedSCs[prevSCIdx],
              activities: [...updatedSCs[prevSCIdx].activities, { name: sc.name, typeActivite: "travaux" }, ...sc.activities],
          };
          return { ...c, sousComposants: updatedSCs };
      }));
      markChanged();
  };

  const promoteActivity = (ci: number, si: number, ai: number) => {
      setComponents(prev => prev.map((c, i) => {
          if (i !== ci) return c;
          const actName = getActivityName(c.sousComposants[si].activities[ai]);
          const newSC: SousComposantData = { id: `sc${Date.now()}`, name: actName, activities: [] };
          const updatedSC = c.sousComposants.map((sc, j) => j === si ? { ...sc, activities: sc.activities.filter((_, k) => k !== ai) } : sc);
          updatedSC.splice(si + 1, 0, newSC);
          return { ...c, sousComposants: updatedSC };
      }));
      markChanged();
  };

  // ── Save ──
  const handleSave = () => {
    updateProject(projectId, { components });
    setHasChanges(false);
    toast.success("Structure du projet mise à jour");
  };

  // ── Stats ──
  const totalSC = components.reduce((sum, c) => sum + c.sousComposants.length, 0);
  const totalActivities = components.reduce((sum, c) => sum + c.sousComposants.reduce((s, sc) => s + sc.activities.length, 0), 0);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-secondary)]">Projet introuvable</p>
        <Link href="/projects" className="text-[var(--accent)] text-sm mt-2 inline-block">Retour</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-8 pt-5 pb-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-[var(--shadow-sm)] flex-shrink-0">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight">
                {project.name}
                <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] bg-[var(--bg-inset)] text-[var(--text-tertiary)] font-bold">
                  {project.code}
                </span>
              </h1>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                Initialisation &bull; Configuration du projet
              </div>
            </div>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-[var(--radius-md)] text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
            >
              <Save size={16} /> Enregistrer
            </button>
          )}
        </div>
      </div>

      {/* TAB BAR */}
      <div className="flex items-center px-8 bg-[var(--bg-surface)] border-b border-[var(--border-default)] flex-shrink-0">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 py-3 pr-4 mr-1 text-[11px] font-bold text-[var(--text-secondary)] border-r border-[var(--border-default)] hover:text-[var(--accent)] transition-colors"
        >
          <ChevronLeft size={14} /> Tous les projets
        </Link>
        <div className="flex gap-0.5 ml-2">
          {([
            { id: "info", label: "Informations", icon: Settings },
            { id: "structure", label: "Structure & Activités", icon: Layers },
            { id: "team", label: "Équipe", icon: Users },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-[var(--text-primary)] text-[var(--text-primary)] font-bold"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* ══ TAB: Informations ══ */}
        {activeTab === "info" && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="p-5 border-b border-[var(--border-subtle)]">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Informations générales</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Nom du projet</div>
                    <div className="text-[14px] font-semibold text-[var(--text-primary)]">{project.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Code</div>
                    <div className="text-[14px] font-semibold text-[var(--text-primary)]">{project.code}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Description</div>
                  <div className="text-[13px] text-[var(--text-secondary)]">{project.description || "—"}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={10} /> Localisation</div>
                    <div className="text-[13px] text-[var(--text-secondary)]">{[project.localisation?.ville, project.localisation?.departement, project.localisation?.region].filter(Boolean).join(", ") || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign size={10} /> Budget</div>
                    <div className="text-[13px] text-[var(--text-secondary)]">{project.budget || "—"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={10} /> Date début</div>
                    <div className="text-[13px] text-[var(--text-secondary)]">{project.dateDebut || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={10} /> Date fin</div>
                    <div className="text-[13px] text-[var(--text-secondary)]">{project.dateFin || "—"}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Financement</div>
                  <div className="text-[13px] text-[var(--text-secondary)]">{project.bailleur || "—"}</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] p-4 text-center">
                <div className="text-2xl font-bold text-[var(--text-primary)]">{components.length}</div>
                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-1">Composants</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] p-4 text-center">
                <div className="text-2xl font-bold text-[var(--text-primary)]">{totalSC}</div>
                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-1">Sous-composants</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] p-4 text-center">
                <div className="text-2xl font-bold text-[var(--text-primary)]">{totalActivities}</div>
                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-1">Activités</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: Structure & Activités ══ */}
        {activeTab === "structure" && (
          <div className="max-w-4xl space-y-5">
            {/* Info banner */}
            <div className="flex gap-3 p-3 rounded-[var(--radius-md)] bg-blue-500/10 border border-blue-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                <strong>{components.length}</strong> composant{components.length > 1 ? "s" : ""}, <strong>{totalSC}</strong> sous-composant{totalSC > 1 ? "s" : ""}, <strong>{totalActivities}</strong> activité{totalActivities > 1 ? "s" : ""}.
                Pour chaque activité, sélectionnez le <strong>type</strong> (Travaux, Fourniture, Services, Études, Prestations Intellectuelles). Utilisez les flèches pour <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-green-500/10 rounded text-green-500 text-[10px] font-bold">Monter d&apos;un niveau</span> ou <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-orange-500/10 rounded text-orange-500 text-[10px] font-bold">Descendre d&apos;un niveau</span>.
              </div>
            </div>

            {/* Activity type legend */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mr-1">Types :</span>
              {ACTIVITY_TYPES.map((t) => (
                <span key={t.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${t.bgColor}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${t.color}`} />
                  {t.label}
                </span>
              ))}
            </div>

            {/* Component tree */}
            <div className="bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 space-y-3">
              {components.map((comp, ci) => (
                <div key={comp.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4">
                  {/* Component header */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/15 text-blue-500 rounded-[var(--radius-sm)] flex items-center justify-center font-bold text-[10px] flex-shrink-0">C{ci + 1}</div>
                    <input type="text" value={comp.name} onChange={e => updateComponentName(ci, e.target.value)} placeholder="Nom du composant..." className="flex-1 min-w-0 bg-transparent border-b-2 border-transparent hover:border-[var(--border-default)] focus:border-[var(--accent)] outline-none text-[14px] font-bold text-[var(--text-primary)] px-1 py-1 transition-colors" />
                    <div className="relative w-[150px] flex-shrink-0">
                      <input type="text" value={comp.budget || ""} onChange={e => updateComponentBudget(ci, e.target.value)} placeholder="Budget" className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[11px] text-[var(--text-primary)] pr-12 focus:outline-none focus:border-[var(--accent)] transition-colors" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[var(--text-tertiary)] font-bold">FCFA</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1 border-l border-[var(--border-subtle)] pl-2">
                       <button type="button" onClick={() => demoteComponent(ci)} disabled={ci === 0} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-orange-500/10 text-orange-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all" title="Transformer en Sous-composant"><ChevronDown size={14} /></button>
                       <button type="button" onClick={() => removeComponent(ci)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all" title="Supprimer"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Sous-composants */}
                  <div className="ml-9 pl-3 border-l-2 border-blue-500/20 space-y-1 mt-3">
                    {comp.sousComposants.map((sc, si) => (
                      <div key={sc.id}>
                        <div className="flex items-center gap-2 py-1.5">
                          <div className="w-5 h-5 bg-amber-500/15 text-amber-500 rounded-[var(--radius-sm)] flex items-center justify-center font-bold text-[8px] flex-shrink-0">SC</div>
                          <input type="text" value={sc.name} onChange={e => updateSCName(ci, si, e.target.value)} placeholder="Sous-composant..." className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-[var(--border-default)] focus:border-[var(--accent)] outline-none text-[12px] font-semibold text-[var(--text-secondary)] px-1 py-0.5 transition-colors" />
                          <div className="flex items-center gap-1 flex-shrink-0 border-l border-[var(--border-subtle)] pl-1.5">
                              <button type="button" onClick={() => promoteSC(ci, si)} className="p-1 rounded-[var(--radius-sm)] hover:bg-green-500/10 text-green-500 transition-all" title="Transformer en Composant"><ChevronUp size={14} /></button>
                              <button type="button" onClick={() => demoteSC(ci, si)} disabled={si === 0} className="p-1 rounded-[var(--radius-sm)] hover:bg-orange-500/10 text-orange-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all" title="Transformer en Activité"><ChevronDown size={14} /></button>
                              <button type="button" onClick={() => removeSousComposant(ci, si)} className="p-1 rounded-[var(--radius-sm)] hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all" title="Supprimer"><Trash2 size={12} /></button>
                          </div>
                        </div>

                        {/* Activities with type selector */}
                        <div className="ml-7 pl-3 border-l border-amber-500/15 space-y-1 mt-0.5">
                          {sc.activities.map((act, ai) => {
                            const actName = getActivityName(act);
                            const actType = getActivityType(act);
                            const typeInfo = ACTIVITY_TYPES.find(t => t.id === actType) || ACTIVITY_TYPES[0];
                            return (
                              <div key={ai} className="flex items-center gap-1.5 py-0.5 group">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${typeInfo.color}`} />
                                <input
                                  type="text"
                                  value={actName}
                                  onChange={e => updateActivityName(ci, si, ai, e.target.value)}
                                  placeholder="Nom de l'activité..."
                                  className="flex-1 min-w-0 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-sm)] outline-none text-[11px] text-[var(--text-secondary)] px-2 py-1 focus:border-[var(--accent)] transition-colors"
                                />
                                {/* Type selector */}
                                <select
                                  value={actType}
                                  onChange={e => updateActivityType(ci, si, ai, e.target.value)}
                                  className="bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[10px] font-semibold text-[var(--text-secondary)] px-1.5 py-1 focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer w-[140px] flex-shrink-0"
                                >
                                  {ACTIVITY_TYPES.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                  ))}
                                </select>
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border-l border-[var(--border-subtle)] pl-1">
                                    <button type="button" onClick={() => promoteActivity(ci, si, ai)} className="p-0.5 rounded-[var(--radius-sm)] hover:bg-green-500/10 text-green-500 transition-all" title="Transformer en Sous-composant"><ChevronUp size={13} /></button>
                                    <button type="button" onClick={() => removeActivity(ci, si, ai)} className="p-0.5 rounded-[var(--radius-sm)] hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all" title="Supprimer"><Trash2 size={11} /></button>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add activity with type dropdown */}
                          <div className="flex items-center gap-1.5 mt-1 py-1">
                            <button type="button" onClick={() => addActivity(ci, si, "travaux")} className="flex items-center gap-1 text-[10px] font-medium text-[var(--accent)] hover:underline"><Plus size={10} /> Activité</button>
                            <span className="text-[var(--text-tertiary)] text-[9px]">—</span>
                            {ACTIVITY_TYPES.map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => addActivity(ci, si, t.id)}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border hover:opacity-80 transition-opacity ${t.bgColor}`}
                                title={`Ajouter une activité de type ${t.label}`}
                              >
                                <div className={`w-1 h-1 rounded-full ${t.color}`} />
                                {t.label.substring(0, 4)}.
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addSousComposant(ci)} className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mt-2 pt-1"><Plus size={12} /> Sous-composant</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addComponent} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--border-default)] rounded-[var(--radius-md)] text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-all">
                <Plus size={14} /> Ajouter un composant
              </button>
            </div>

            {/* Save button */}
            {hasChanges && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-[var(--radius-md)] text-[13px] font-semibold hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Save size={14} /> Enregistrer les modifications
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: Équipe ══ */}
        {activeTab === "team" && (
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Équipe du projet</h2>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{teamAssignments.length} membre{teamAssignments.length > 1 ? "s" : ""} affecté{teamAssignments.length > 1 ? "s" : ""}</p>
              </div>
              <Link
                href={`/projects/${projectId}/team`}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <Users size={16} /> Gérer l&apos;équipe
              </Link>
            </div>

            <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-[var(--bg-inset)] border-b border-[var(--border-default)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Membre</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Rôle</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Niveau</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Affectation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {teamAssignments.map((assignment) => {
                    const user = getUserById(assignment.userId);
                    if (!user) return null;
                    return (
                      <tr key={assignment.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                              {user.prenom?.[0] || ""}{user.nom?.[0] || ""}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-[var(--text-primary)]">
                                {getUserFullName(assignment.userId)}
                              </span>
                              <span className="text-xs text-[var(--text-tertiary)]">
                                {assignment.functionalRole} • {assignment.level === "project" ? "Niveau Projet" : "Sous-composant"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            {assignment.functionalRole}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                          {assignment.level === "project" ? "Projet" : assignment.level === "component" ? "Composant" : assignment.level === "subcomponent" ? "Sous-composant" : "Activité"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                          {assignment.entityName || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {teamAssignments.length === 0 && (
                <div className="text-center py-12 text-[var(--text-tertiary)]">
                  <Users size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun membre dans l&apos;équipe</p>
                  <Link href={`/projects/${projectId}/team`} className="text-[var(--accent)] text-sm font-semibold hover:underline mt-2 inline-block">
                    Affecter des membres
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmState !== null}
        title={confirmState?.title || ""}
        message={confirmState?.message || ""}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={() => {
          confirmState?.onConfirm();
          setConfirmState(null);
        }}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
