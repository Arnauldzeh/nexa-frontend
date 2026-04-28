"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2, Save, Check, X, Calendar } from "lucide-react";
import type { Project } from "@/lib/projectStore";
import type { Planning } from "@/services/api/planningService";
import { planningService } from "@/services/api/planningService";
import { toast } from "@/lib/toastStore";

interface MSProjectViewProps {
  project: Project;
  plannings: Planning[];
  onActivityClick: (activityPath: string) => void;
  onRefresh: () => void;
}

interface TaskRow {
  id: string;
  level: number;
  name: string;
  type: "project" | "component" | "subcomponent" | "activity" | "subtask";
  activityPath?: string;
  activityType?: string;
  hasChildren: boolean;
  isExpanded: boolean;
  planning?: Planning;
  dateDebut?: string;
  dateFin?: string;
  duree?: number;
  responsable?: string;
  budget?: number;
  parentId?: string;
  isEditing?: boolean;
  isNew?: boolean;
  canAddSubtask?: boolean;
}

const ACTIVITY_COLORS = {
  travaux: "#3b82f6",
  fourniture: "#f59e0b",
  services: "#10b981",
  etudes: "#8b5cf6",
  pi: "#ec4899",
};

export function MSProjectView({ project, plannings, onActivityClick, onRefresh }: MSProjectViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [monthsToShow, setMonthsToShow] = useState<Date[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedTaskIds, setDeletedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    buildTaskTree();
    calculateTimeline();
  }, [project, plannings, expandedIds]);

  const buildTaskTree = () => {
    const rows: TaskRow[] = [];

    // Parcourir directement les activités (sans afficher projet/composante/sous-composante)
    project.components.forEach((comp) => {
      const compId = comp.id;
      
      comp.sousComposants.forEach((sc) => {
        sc.activities.forEach((act, actIdx) => {
          const activityPath = `${compId}.${sc.id}.A${actIdx + 1}`;
          const planning = plannings.find((p) => p.activityPath === activityPath);
          const actName = typeof act === "string" ? act : act.name;
          const actType = typeof act === "string" ? "travaux" : act.typeActivite;

          // Afficher l'activité au niveau 0 (racine)
          rows.push({
            id: activityPath,
            level: 0,
            name: `${comp.name} > ${sc.name} > ${actName}`,
            type: "activity",
            activityPath,
            activityType: actType,
            hasChildren: !!(planning?.tachesExecution && planning.tachesExecution.length > 0),
            isExpanded: expandedIds.has(activityPath),
            planning,
            dateDebut: planning?.dateDebutActualisee || planning?.dateDebutInitiale
              ? new Date(planning.dateDebutActualisee || planning.dateDebutInitiale!).toISOString().split("T")[0]
              : undefined,
            dateFin: planning?.dateFinActualisee || planning?.dateFinInitiale
              ? new Date(planning.dateFinActualisee || planning.dateFinInitiale!).toISOString().split("T")[0]
              : undefined,
            duree: planning?.delaiActualiseMois || planning?.delaiInitialMois,
            responsable: planning?.responsablePrincipal,
            budget: planning?.budgetActualiseTotal || planning?.budgetInitialTotal,
            canAddSubtask: true,
          });

          // Sous-tâches (si planification exécution)
          if (expandedIds.has(activityPath) && planning?.tachesExecution) {
            planning.tachesExecution.forEach((tache, tIdx) => {
              rows.push({
                id: `${activityPath}.T${tIdx}`,
                level: 1,
                name: tache.designation,
                type: "subtask",
                hasChildren: false,
                isExpanded: false,
                parentId: activityPath,
                dateDebut: tache.dateDebut ? new Date(tache.dateDebut).toISOString().split("T")[0] : undefined,
                dateFin: tache.dateFin ? new Date(tache.dateFin).toISOString().split("T")[0] : undefined,
                duree: tache.dureeJours,
                responsable: tache.responsable,
                budget: (tache.quantite || 0) * (tache.prixUnitaire || 0),
              });
            });
          }
        });
      });
    });

    setTasks(rows);
  };

  const calculateTimeline = () => {
    let minDate = new Date();
    let maxDate = new Date();
    let hasData = false;

    plannings.forEach((p) => {
      const debut = p.dateDebutActualisee || p.dateDebutInitiale;
      const fin = p.dateFinActualisee || p.dateFinInitiale;

      if (debut) {
        const d = new Date(debut);
        if (!hasData || d < minDate) minDate = d;
        hasData = true;
      }
      if (fin) {
        const f = new Date(fin);
        if (!hasData || f > maxDate) maxDate = f;
        hasData = true;
      }
    });

    if (!hasData) {
      minDate = new Date();
      maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 12);
    }

    minDate.setMonth(minDate.getMonth() - 1);
    maxDate.setMonth(maxDate.getMonth() + 2);

    setTimelineStart(minDate);
    setTimelineEnd(maxDate);

    const months: Date[] = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    setMonthsToShow(months);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCellEdit = (rowId: string, field: string, value: any) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === rowId) {
          return { ...task, [field]: value };
        }
        return task;
      })
    );
    setHasChanges(true);
  };

  const handleAddSubtask = (parentActivityPath: string) => {
    const newTaskId = `${parentActivityPath}.T${Date.now()}`;
    const parentTask = tasks.find((t) => t.id === parentActivityPath);
    
    if (!parentTask) return;

    const newTask: TaskRow = {
      id: newTaskId,
      level: 1,
      name: "Nouvelle tâche",
      type: "subtask",
      hasChildren: false,
      isExpanded: false,
      parentId: parentActivityPath,
      isNew: true,
      isEditing: true,
      dateDebut: undefined,
      dateFin: undefined,
      duree: 1,
    };

    // Insérer après la dernière sous-tâche du parent ou après le parent
    const parentIndex = tasks.findIndex((t) => t.id === parentActivityPath);
    let insertIndex = parentIndex + 1;
    
    // Trouver la dernière sous-tâche
    for (let i = parentIndex + 1; i < tasks.length; i++) {
      if (tasks[i].parentId === parentActivityPath) {
        insertIndex = i + 1;
      } else if (tasks[i].level <= parentTask.level) {
        break;
      }
    }

    setTasks((prev) => {
      const newTasks = [...prev];
      newTasks.splice(insertIndex, 0, newTask);
      return newTasks;
    });

    // Expand parent
    if (!expandedIds.has(parentActivityPath)) {
      toggleExpand(parentActivityPath);
    }

    setHasChanges(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm("Supprimer cette tâche ?")) return;
    
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeletedTaskIds((prev) => new Set(prev).add(taskId));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      // Grouper les modifications par activité
      const modifiedActivities = new Map<string, { 
        planning: Planning; 
        subtasks: TaskRow[];
        activityTask?: TaskRow;
      }>();
      
      // Collecter toutes les sous-tâches et activités modifiées
      tasks.forEach((task) => {
        if (task.type === "activity" && task.activityPath) {
          const planning = plannings.find((p) => p.activityPath === task.activityPath);
          if (!planning) return;

          if (!modifiedActivities.has(task.activityPath)) {
            modifiedActivities.set(task.activityPath, { planning, subtasks: [], activityTask: task });
          } else {
            modifiedActivities.get(task.activityPath)!.activityTask = task;
          }
        } else if (task.type === "subtask" && task.parentId) {
          const planning = plannings.find((p) => p.activityPath === task.parentId);
          if (!planning) return;

          if (!modifiedActivities.has(task.parentId)) {
            modifiedActivities.set(task.parentId, { planning, subtasks: [] });
          }
          modifiedActivities.get(task.parentId)!.subtasks.push(task);
        }
      });

      // Sauvegarder chaque activité modifiée
      for (const [activityPath, { planning, subtasks, activityTask }] of modifiedActivities.entries()) {
        const updateData: any = {};

        // Mettre à jour les champs de l'activité si modifiés
        if (activityTask) {
          if (activityTask.dateDebut !== (planning.dateDebutActualisee || planning.dateDebutInitiale)?.toString().split('T')[0]) {
            updateData.dateDebutActualisee = activityTask.dateDebut ? new Date(activityTask.dateDebut) : undefined;
          }
          if (activityTask.dateFin !== (planning.dateFinActualisee || planning.dateFinInitiale)?.toString().split('T')[0]) {
            updateData.dateFinActualisee = activityTask.dateFin ? new Date(activityTask.dateFin) : undefined;
          }
          if (activityTask.duree !== (planning.delaiActualiseMois || planning.delaiInitialMois)) {
            updateData.delaiActualiseMois = activityTask.duree;
          }
          if (activityTask.responsable !== planning.responsablePrincipal) {
            updateData.responsablePrincipal = activityTask.responsable;
          }
          if (activityTask.budget !== (planning.budgetActualiseTotal || planning.budgetInitialTotal)) {
            updateData.budgetActualiseTotal = activityTask.budget;
          }
        }

        // Mettre à jour les tâches d'exécution
        if (subtasks.length > 0 || (planning.tachesExecution && planning.tachesExecution.length > 0)) {
          const tachesExecution = subtasks.map((st, idx) => {
            // Extraire l'index de la tâche depuis l'ID si c'est une tâche existante
            const taskIdMatch = st.id.match(/\.T(\d+)$/);
            const taskNumber = taskIdMatch ? parseInt(taskIdMatch[1]) + 1 : idx + 1;
            
            return {
              numero: `T${taskNumber}`,
              designation: st.name,
              dateDebut: st.dateDebut ? new Date(st.dateDebut) : undefined,
              dateFin: st.dateFin ? new Date(st.dateFin) : undefined,
              dureeJours: st.duree,
              responsable: st.responsable,
              quantite: 1,
              prixUnitaire: st.budget || 0,
            };
          });

          updateData.tachesExecution = tachesExecution;
        }

        // Envoyer la mise à jour si des changements existent
        if (Object.keys(updateData).length > 0) {
          await planningService.update(project.code, activityPath, updateData);
        }
      }

      // Gérer les activités dont toutes les tâches ont été supprimées
      for (const planning of plannings) {
        if (planning.tachesExecution && planning.tachesExecution.length > 0) {
          const hasRemainingTasks = tasks.some(
            (t) => t.type === "subtask" && t.parentId === planning.activityPath
          );
          
          if (!hasRemainingTasks && !modifiedActivities.has(planning.activityPath)) {
            // Toutes les tâches ont été supprimées
            await planningService.update(project.code, planning.activityPath, {
              tachesExecution: [],
            });
          }
        }
      }

      toast.success("Modifications sauvegardées");
      setHasChanges(false);
      setDeletedTaskIds(new Set());
      onRefresh();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const calculateBarPosition = (dateDebut?: string, dateFin?: string) => {
    if (!dateDebut || !dateFin) return null;

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const startDays = (debut.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const durationDays = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24);

    const left = (startDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.max(1, width)}%` };
  };

  const getRowStyle = (level: number, type: string) => {
    const baseStyle = "hover:bg-[var(--bg-surface-hover)] transition-colors border-b border-[var(--border-subtle)]";
    if (type === "activity") return `${baseStyle} bg-[var(--bg-inset)]/30 font-medium`;
    if (type === "subtask") return `${baseStyle}`;
    return baseStyle;
  };

  const getIndentation = (level: number) => level * 24;

  const renderEditableCell = (task: TaskRow, field: string, value: any) => {
    const isEditing = editingCell?.rowId === task.id && editingCell?.field === field;

    if (isEditing) {
      if (field === "dateDebut" || field === "dateFin") {
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => handleCellEdit(task.id, field, e.target.value)}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingCell(null);
              if (e.key === "Escape") setEditingCell(null);
            }}
            autoFocus
            className="w-full px-1 py-0.5 bg-white dark:bg-gray-800 border border-[var(--accent)] rounded text-[11px] focus:outline-none"
          />
        );
      } else if (field === "duree" || field === "budget") {
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => handleCellEdit(task.id, field, parseFloat(e.target.value) || 0)}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingCell(null);
              if (e.key === "Escape") setEditingCell(null);
            }}
            autoFocus
            className="w-full px-1 py-0.5 bg-white dark:bg-gray-800 border border-[var(--accent)] rounded text-[11px] text-right focus:outline-none"
          />
        );
      } else {
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => handleCellEdit(task.id, field, e.target.value)}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingCell(null);
              if (e.key === "Escape") setEditingCell(null);
            }}
            autoFocus
            className="w-full px-1 py-0.5 bg-white dark:bg-gray-800 border border-[var(--accent)] rounded text-[11px] focus:outline-none"
          />
        );
      }
    }

    return (
      <div
        onClick={() => task.type === "activity" || task.type === "subtask" ? setEditingCell({ rowId: task.id, field }) : null}
        className={`px-1 py-0.5 truncate ${task.type === "activity" || task.type === "subtask" ? "cursor-text hover:bg-[var(--bg-inset)] rounded" : ""}`}
      >
        {field === "dateDebut" || field === "dateFin"
          ? value
            ? new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" })
            : "—"
          : field === "duree"
          ? value
            ? `${value} ${value > 1 ? "mois" : "mois"}`
            : "—"
          : field === "budget"
          ? value
            ? new Intl.NumberFormat("fr-FR", { notation: "compact", compactDisplay: "short" }).format(value)
            : "—"
          : value || "—"}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {hasChanges && (
        <div className="flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-[12px] text-amber-600 dark:text-amber-400">
            <Calendar size={14} />
            <span className="font-semibold">Modifications non sauvegardées</span>
            <span className="text-[10px] opacity-70">• Cliquez sur une cellule pour éditer • Entrée pour valider • Échap pour annuler</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm("Annuler toutes les modifications ?")) {
                  buildTaskTree();
                  setHasChanges(false);
                  setDeletedTaskIds(new Set());
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white text-[11px] font-semibold rounded-[var(--radius-md)] hover:bg-gray-600 transition-colors"
            >
              <X size={14} />
              Annuler
            </button>
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-[11px] font-semibold rounded-[var(--radius-md)] hover:bg-green-700 transition-colors"
            >
              <Save size={14} />
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Main View */}
      <div className="flex flex-1 border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-surface)]">
        {/* LEFT PANEL - Table */}
        <div className="w-[650px] flex-shrink-0 border-r border-[var(--border-default)] flex flex-col">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[var(--bg-inset)] border-b border-[var(--border-default)] text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider sticky top-0 z-10">
            <div className="col-span-4">Nom de la tâche</div>
            <div className="col-span-1 text-center">Durée</div>
            <div className="col-span-2 text-center">Début</div>
            <div className="col-span-2 text-center">Fin</div>
            <div className="col-span-2 text-center">Responsable</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`grid grid-cols-12 gap-2 px-3 py-2 text-[12px] ${getRowStyle(task.level, task.type)}`}
              >
                {/* Nom */}
                <div className="col-span-4 flex items-center gap-1" style={{ paddingLeft: getIndentation(task.level) }}>
                  {task.hasChildren && (
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="p-0.5 hover:bg-[var(--bg-inset)] rounded transition-colors flex-shrink-0"
                    >
                      {task.isExpanded ? (
                        <ChevronDown size={14} className="text-[var(--text-secondary)]" />
                      ) : (
                        <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                      )}
                    </button>
                  )}
                  {!task.hasChildren && <div className="w-[18px] flex-shrink-0" />}

                  {task.activityType && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ACTIVITY_COLORS[task.activityType as keyof typeof ACTIVITY_COLORS] }}
                    />
                  )}

                  <span
                    className={`truncate ${
                      task.type === "activity"
                        ? "font-semibold text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                    onClick={() => task.activityPath && onActivityClick(task.activityPath)}
                    style={{ cursor: task.activityPath ? "pointer" : "default" }}
                  >
                    {task.name}
                  </span>
                </div>

                {/* Durée */}
                <div className="col-span-1 text-center text-[var(--text-secondary)]">
                  {renderEditableCell(task, "duree", task.duree)}
                </div>

                {/* Début */}
                <div className="col-span-2 text-center text-[var(--text-secondary)]">
                  {renderEditableCell(task, "dateDebut", task.dateDebut)}
                </div>

                {/* Fin */}
                <div className="col-span-2 text-center text-[var(--text-secondary)]">
                  {renderEditableCell(task, "dateFin", task.dateFin)}
                </div>

                {/* Responsable */}
                <div className="col-span-2 text-center text-[var(--text-secondary)]">
                  {renderEditableCell(task, "responsable", task.responsable)}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-center gap-1">
                  {task.canAddSubtask && (
                    <button
                      onClick={() => handleAddSubtask(task.id)}
                      className="p-1 hover:bg-green-500/10 text-green-600 rounded transition-colors"
                      title="Ajouter une sous-tâche"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                  {task.type === "subtask" && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Gantt Chart */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline Header */}
          <div className="flex border-b border-[var(--border-default)] bg-[var(--bg-inset)] sticky top-0 z-10">
            {monthsToShow.map((month, index) => (
              <div
                key={index}
                className="flex-1 min-w-[80px] px-2 py-2 border-r border-[var(--border-subtle)] text-center"
              >
                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">
                  {month.toLocaleDateString("fr-FR", { month: "short" })}
                </div>
                <div className="text-[11px] font-semibold text-[var(--text-primary)]">
                  {month.getFullYear()}
                </div>
              </div>
            ))}
          </div>

          {/* Gantt Bars */}
          <div className="flex-1 overflow-y-auto relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {monthsToShow.map((_, index) => (
                <div key={index} className="flex-1 min-w-[80px] border-r border-[var(--border-subtle)]" />
              ))}
            </div>

            {/* Task bars */}
            <div className="relative">
              {tasks.map((task) => {
                const barPosition = calculateBarPosition(task.dateDebut, task.dateFin);

                return (
                  <div
                    key={task.id}
                    className="h-[41px] border-b border-[var(--border-subtle)] relative"
                    style={{ minHeight: "41px" }}
                  >
                    {barPosition && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-6 rounded-[var(--radius-sm)] shadow-sm flex items-center px-2 text-white text-[10px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                        style={{
                          left: barPosition.left,
                          width: barPosition.width,
                          backgroundColor:
                            task.activityType
                              ? ACTIVITY_COLORS[task.activityType as keyof typeof ACTIVITY_COLORS]
                              : task.level === 0
                              ? "#3b82f6"
                              : task.level === 1
                              ? "#6366f1"
                              : task.level === 2
                              ? "#8b5cf6"
                              : "#a855f7",
                        }}
                        onClick={() => task.activityPath && onActivityClick(task.activityPath)}
                      >
                        <span className="truncate">{task.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
