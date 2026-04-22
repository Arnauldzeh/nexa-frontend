"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Users,
  Plus,
  Trash2,
  Search,
  Edit2,
} from "lucide-react";
import { getProjectById } from "@/lib/projectStore";
import { getActivityName } from "@/lib/projectStore";
import {
  getUsers,
  getProjectTeam,
  addTeamAssignment,
  removeTeamAssignment,
  updateTeamAssignment,
  getUserById,
  FUNCTIONAL_ROLES_PROJET,
  FUNCTIONAL_ROLES_COMPOSANT,
  FUNCTIONAL_ROLES_SOUS_COMPOSANT,
  FUNCTIONAL_ROLES_ACTIVITE,
  type User,
  type TeamAssignment,
} from "@/lib/userStore";
import { type ProjectRole, PROJECT_ROLE_LABELS } from "@/lib/rbacStore";
import { toast } from "@/lib/toastStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function ProjectTeamPage() {
  const params = useParams();
  const projectId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [project, setProject] = useState<any>(null);
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<TeamAssignment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Load project
  useEffect(() => {
    async function loadProject() {
      const proj = await getProjectById(projectId);
      setProject(proj);
    }
    loadProject();
  }, [projectId]);

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    functionalRole: "",
    projectRole: "contributeur" as ProjectRole,
    activeInProject: true,
    level: "project" as "project" | "component" | "subcomponent" | "activity",
    entityId: "",
    entityName: "",
    // Pour la cascade
    selectedComponent: "",
    selectedSubcomponent: "",
  });

  useEffect(() => {
    refreshData();
  }, [projectId]);

  const refreshData = async () => {
    try {
      const [team, users] = await Promise.all([
        getProjectTeam(projectId),
        getUsers()
      ]);
      setTeamAssignments(team);
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading team data:', error);
      setTeamAssignments([]);
      setAllUsers([]);
    }
  };

  const handleOpenModal = (assignment?: TeamAssignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        userId: assignment.userId,
        functionalRole: assignment.functionalRole,
        projectRole: assignment.projectRole,
        activeInProject: assignment.activeInProject,
        level: assignment.level,
        entityId: assignment.entityId || "",
        entityName: assignment.entityName || "",
        selectedComponent: "",
        selectedSubcomponent: "",
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        userId: "",
        functionalRole: "",
        projectRole: "contributeur",
        activeInProject: true,
        level: "project",
        entityId: "",
        entityName: "",
        selectedComponent: "",
        selectedSubcomponent: "",
      });
    }
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAssignment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.functionalRole) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (editingAssignment) {
        // Pour modifier: supprimer l'ancien et créer un nouveau
        await removeTeamAssignment(editingAssignment._id);
        await addTeamAssignment({
          projectId,
          userId: formData.userId,
          functionalRole: formData.functionalRole,
          projectRole: formData.projectRole,
          level: formData.level,
          entityId: formData.entityId,
          entityName: formData.entityName,
        });
        toast.success("Affectation modifiée");
      } else {
        await addTeamAssignment({
          projectId,
          userId: formData.userId,
          functionalRole: formData.functionalRole,
          projectRole: formData.projectRole,
          level: formData.level,
          entityId: formData.entityId,
          entityName: formData.entityName,
        });
        toast.success("Membre ajouté à l'équipe");
      }

      await refreshData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving team assignment:', error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await removeTeamAssignment(deleteConfirm.id);
        toast.success("Membre retiré de l'équipe");
        await refreshData();
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error removing team member:', error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const getRoleOptions = () => {
    switch (formData.level) {
      case "project":
        return FUNCTIONAL_ROLES_PROJET;
      case "component":
        return FUNCTIONAL_ROLES_COMPOSANT;
      case "subcomponent":
        return FUNCTIONAL_ROLES_SOUS_COMPOSANT;
      case "activity":
        return FUNCTIONAL_ROLES_ACTIVITE;
      default:
        return FUNCTIONAL_ROLES_PROJET;
    }
  };

  const getEntityOptions = () => {
    if (!project) return [];
    
    if (formData.level === "component") {
      return project.components.map((c) => ({ id: c.id, name: c.name }));
    }
    
    if (formData.level === "subcomponent") {
      if (!formData.selectedComponent) return [];
      const comp = project.components.find(c => c.id === formData.selectedComponent);
      if (!comp) return [];
      return comp.sousComposants.map((sc) => ({ 
        id: sc.id, 
        name: `${comp.name} > ${sc.name}` 
      }));
    }
    
    if (formData.level === "activity") {
      if (!formData.selectedComponent || !formData.selectedSubcomponent) return [];
      const comp = project.components.find(c => c.id === formData.selectedComponent);
      if (!comp) return [];
      const sc = comp.sousComposants.find(s => s.id === formData.selectedSubcomponent);
      if (!sc) return [];
      return sc.activities.map((act, idx) => ({ 
        id: `${sc.id}-act-${idx}`, 
        name: `${comp.name} > ${sc.name} > ${getActivityName(act)}` 
      }));
    }
    
    return [];
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "project":
        return "Projet";
      case "component":
        return "Composant";
      case "subcomponent":
        return "Sous-composant";
      case "activity":
        return "Activité";
      default:
        return level;
    }
  };

  const filteredAssignments = (teamAssignments || []).filter((assignment) => {
    const user = allUsers.find(u => u.id === assignment.userId);
    if (!user) return false;
    const searchStr = `${user.firstName} ${user.lastName} ${assignment.functionalRole} ${assignment.entityName || ""}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-[var(--text-secondary)]">Projet introuvable</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Same as project page */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-8 pt-5 pb-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-[var(--shadow-sm)] flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight">
                {project.name}
                <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] bg-[var(--bg-inset)] text-[var(--text-tertiary)] font-bold">
                  {project.code}
                </span>
              </h1>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                Équipe Projet • {project.description}
              </div>
            </div>
          </div>
          <Link
            href={`/projects/${projectId}/team`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Users size={16} />
            Équipe projet
          </Link>
        </div>
      </div>

      {/* NAV BAR */}
      <div className="flex items-center px-8 bg-[var(--bg-surface)] border-b border-[var(--border-default)] flex-shrink-0">
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center gap-1.5 py-3 pr-4 mr-1 text-[11px] font-bold text-[var(--text-secondary)] border-r border-[var(--border-default)] hover:text-[var(--accent)] transition-colors"
        >
          <ChevronLeft size={14} /> Retour au projet
        </Link>
        <div className="flex gap-0.5 ml-2">
          <button className="py-3 px-4 text-[13px] font-bold border-b-2 border-[var(--text-primary)] text-[var(--text-primary)] whitespace-nowrap">
            Équipe
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus size={16} />
            Ajouter un membre
          </button>
        </div>

        {/* Team table */}
        <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-[var(--bg-inset)] border-b border-[var(--border-default)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Affectation
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredAssignments.map((assignment) => {
                const user = allUsers.find(u => u.id === assignment.userId);
                if (!user) return null;

                return (
                  <tr
                    key={assignment._id}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.firstName?.[0] || ""}
                          {user.lastName?.[0] || ""}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-[var(--text-tertiary)]">
                            {user.position || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 w-fit">
                          {assignment.functionalRole}
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
                          {PROJECT_ROLE_LABELS[assignment.projectRole]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {getLevelLabel(assignment.level)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {assignment.entityName || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(assignment)}
                          className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-[var(--radius-md)] transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment._id, `${user.firstName} ${user.lastName}`)}
                          className="p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 rounded-[var(--radius-md)] transition-colors"
                          title="Retirer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 text-[var(--text-tertiary)]">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {searchQuery
                  ? "Aucun membre trouvé"
                  : "Aucun membre dans l'équipe"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border-default)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {editingAssignment
                  ? "Modifier l'affectation"
                  : "Ajouter un membre"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Utilisateur *
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {allUsers
                    .filter((u) => u.status === "active")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.position || "N/A"}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Niveau d'affectation *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as
                        | "project"
                        | "component"
                        | "subcomponent"
                        | "activity",
                      functionalRole: "",
                      projectRole: "contributeur",
                      entityId: "",
                      entityName: "",
                      selectedComponent: "",
                      selectedSubcomponent: "",
                    })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required
                >
                  <option value="project">Projet</option>
                  <option value="component">Composant</option>
                  <option value="subcomponent">Sous-composant</option>
                  <option value="activity">Activité</option>
                </select>
              </div>

              {/* Cascade: Component selection */}
              {(formData.level === "component" || formData.level === "subcomponent" || formData.level === "activity") && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Composant *
                  </label>
                  <select
                    value={formData.level === "component" ? formData.entityId : formData.selectedComponent}
                    onChange={(e) => {
                      if (formData.level === "component") {
                        const comp = project?.components.find(c => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          entityId: e.target.value,
                          entityName: comp?.name || "",
                        });
                      } else {
                        setFormData({
                          ...formData,
                          selectedComponent: e.target.value,
                          selectedSubcomponent: "",
                          entityId: "",
                          entityName: "",
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                    required
                  >
                    <option value="">Sélectionner un composant</option>
                    {project?.components.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cascade: Subcomponent selection */}
              {(formData.level === "subcomponent" || formData.level === "activity") && formData.selectedComponent && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Sous-composant *
                  </label>
                  <select
                    value={formData.level === "subcomponent" ? formData.entityId : formData.selectedSubcomponent}
                    onChange={(e) => {
                      if (formData.level === "subcomponent") {
                        const comp = project?.components.find(c => c.id === formData.selectedComponent);
                        const sc = comp?.sousComposants.find(s => s.id === e.target.value);
                        setFormData({
                          ...formData,
                          entityId: e.target.value,
                          entityName: sc ? `${comp?.name} > ${sc.name}` : "",
                        });
                      } else {
                        setFormData({
                          ...formData,
                          selectedSubcomponent: e.target.value,
                          entityId: "",
                          entityName: "",
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                    required
                  >
                    <option value="">Sélectionner un sous-composant</option>
                    {project?.components
                      .find(c => c.id === formData.selectedComponent)
                      ?.sousComposants.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Cascade: Activity selection */}
              {formData.level === "activity" && formData.selectedComponent && formData.selectedSubcomponent && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Activité *
                  </label>
                  <select
                    value={formData.entityId}
                    onChange={(e) => {
                      const comp = project?.components.find(c => c.id === formData.selectedComponent);
                      const sc = comp?.sousComposants.find(s => s.id === formData.selectedSubcomponent);
                      const actIndex = sc?.activities.findIndex((_, idx) => `${sc.id}-act-${idx}` === e.target.value);
                      const actObj = actIndex !== undefined && actIndex >= 0 ? sc?.activities[actIndex] : undefined;
                      const actName = actObj ? getActivityName(actObj) : "";
                      setFormData({
                        ...formData,
                        entityId: e.target.value,
                        entityName: actName ? `${comp?.name} > ${sc?.name} > ${actName}` : "",
                      });
                    }}
                    className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                    required
                  >
                    <option value="">Sélectionner une activité</option>
                    {project?.components
                      .find(c => c.id === formData.selectedComponent)
                      ?.sousComposants.find(s => s.id === formData.selectedSubcomponent)
                      ?.activities.map((act, idx) => {
                        const actId = `${formData.selectedSubcomponent}-act-${idx}`;
                        return (
                          <option key={actId} value={actId}>
                            {getActivityName(act)}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Rôle Fonctionnel *
                </label>
                <select
                  value={formData.functionalRole}
                  onChange={(e) =>
                    setFormData({ ...formData, functionalRole: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  {getRoleOptions().map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Droits d'accès (RBAC) *
                </label>
                <select
                  value={formData.projectRole}
                  onChange={(e) =>
                    setFormData({ ...formData, projectRole: e.target.value as ProjectRole })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required
                >
                  {Object.entries(PROJECT_ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  {editingAssignment ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Retirer le membre"
        message={`Êtes-vous sûr de vouloir retirer "${deleteConfirm?.name}" de l'équipe ? Cette action est irréversible.`}
        confirmLabel="Retirer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
