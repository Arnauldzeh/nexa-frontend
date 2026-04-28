"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { getUsers, type User } from "@/lib/userStore";
import { type ProjectRole, PROJECT_ROLE_LABELS } from "@/lib/rbacStore";
import { toast } from "@/lib/toastStore";

// Permissions disponibles pour les membres
const AVAILABLE_PERMISSIONS = [
  { id: "upload_document", label: "Charger des documents" },
  { id: "download_document", label: "Télécharger des documents" },
  { id: "view_documents", label: "Consulter les documents" },
  { id: "edit_project", label: "Modifier le projet" },
  { id: "view_budget", label: "Voir le budget" },
  { id: "manage_team", label: "Gérer l'équipe" },
  { id: "create_tasks", label: "Créer des tâches" },
  { id: "assign_tasks", label: "Assigner des tâches" },
  { id: "view_reports", label: "Consulter les rapports" },
  { id: "export_data", label: "Exporter les données" },
];

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => Promise<void>;
  projectId: string;
  project: any;
  editingAssignment?: any;
}

export interface MemberFormData {
  userId?: string;
  newUserData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
  };
  functionalRole: string;
  projectRole: ProjectRole;
  permissions: string[];
  level: "project" | "component" | "subcomponent" | "activity";
  entityId: string;
  entityName: string;
  selectedComponent: string;
  selectedSubcomponent: string;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  project,
  editingAssignment,
}: AddMemberModalProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserSubmitted, setNewUserSubmitted] = useState(false);

  const [formData, setFormData] = useState<MemberFormData>({
    userId: "",
    functionalRole: "",
    projectRole: "contributeur",
    permissions: [],
    level: "project",
    entityId: "",
    entityName: "",
    selectedComponent: "",
    selectedSubcomponent: "",
  });

  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        userId: editingAssignment.userId,
        functionalRole: editingAssignment.functionalRole,
        projectRole: editingAssignment.projectRole,
        permissions: editingAssignment.permissions || [],
        level: editingAssignment.level,
        entityId: editingAssignment.entityId || "",
        entityName: editingAssignment.entityName || "",
        selectedComponent: "",
        selectedSubcomponent: "",
      });
      const user = allUsers.find((u) => u.id === editingAssignment.userId);
      if (user) setSelectedUser(user);
    }
  }, [editingAssignment, allUsers]);

  const loadUsers = async () => {
    try {
      const users = await getUsers();
      setAllUsers(users.filter((u) => u.status === "active"));
    } catch (error) {
      console.error("Error loading users:", error);
      setAllUsers([]);
    }
  };

  const filteredUsers = allUsers.filter((user) => {
    const searchStr =
      `${user.firstName} ${user.lastName} ${user.email} ${user.position || ""}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setFormData({ ...formData, userId: user.id });
    setSearchQuery(`${user.firstName} ${user.lastName}`);
    setShowUserDropdown(false);
    setShowNewUserForm(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowUserDropdown(true);
    setSelectedUser(null);
    setFormData({ ...formData, userId: "" });
  };

  const handleShowNewUserForm = () => {
    setShowNewUserForm(true);
    setShowUserDropdown(false);
    setSelectedUser(null);
    setFormData({ ...formData, userId: "" });
  };

  const generateLogin = () => {
    if (newUserData.firstName && newUserData.lastName) {
      return `${newUserData.firstName.toLowerCase()}.${newUserData.lastName.toLowerCase()}`;
    }
    return "";
  };

  const generateDefaultPassword = () => {
    return "Temp@2026"; // Mot de passe par défaut
  };

  const handleSubmitNewUser = async () => {
    // Validation
    if (
      !newUserData.firstName ||
      !newUserData.lastName ||
      !newUserData.email ||
      !newUserData.phone
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Simuler l'envoi à l'administrateur pour validation
    // Dans une vraie implémentation, cela créerait une demande en attente
    const login = generateLogin();
    const defaultPassword = generateDefaultPassword();

    toast.success(
      `Demande envoyée à l'administrateur pour validation. Login: ${login}, Mot de passe: ${defaultPassword}`
    );

    setNewUserSubmitted(true);
    setFormData({
      ...formData,
      newUserData: { ...newUserData },
    });
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId && !formData.newUserData) {
      toast.error("Veuillez sélectionner ou créer un utilisateur");
      return;
    }

    if (!formData.functionalRole) {
      toast.error("Veuillez saisir le rôle fonctionnel");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("Veuillez sélectionner au moins un droit d'accès");
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-default)] flex items-center justify-between sticky top-0 bg-[var(--bg-surface)] z-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {editingAssignment ? "Modifier l'affectation" : "Ajouter un membre"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-md)] transition-colors"
          >
            <X size={20} className="text-[var(--text-tertiary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Recherche utilisateur */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Rechercher un utilisateur *
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => !selectedUser && setShowUserDropdown(true)}
                placeholder="Saisir le nom de l'utilisateur..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                disabled={showNewUserForm || newUserSubmitted}
              />

              {/* Dropdown des résultats */}
              {showUserDropdown && !showNewUserForm && !newUserSubmitted && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] max-h-60 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className="w-full text-left px-4 py-3 hover:bg-[var(--bg-surface-hover)] transition-colors border-b border-[var(--border-subtle)] last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-[var(--text-primary)]">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-[var(--text-tertiary)] truncate">
                                {user.email} • {user.position || "N/A"}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <AlertCircle
                          size={32}
                          className="mx-auto mb-2 text-[var(--text-tertiary)] opacity-50"
                        />
                        <p className="text-sm text-[var(--text-tertiary)] mb-3">
                          Aucun utilisateur trouvé
                        </p>
                        <button
                          type="button"
                          onClick={handleShowNewUserForm}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          <Plus size={16} />
                          Créer une demande d'inscription
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Utilisateur sélectionné */}
            {selectedUser && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-[var(--radius-md)] flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {selectedUser.email} • {selectedUser.position || "N/A"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchQuery("");
                    setFormData({ ...formData, userId: "" });
                  }}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Bouton pour créer un nouvel utilisateur */}
            {!selectedUser && !showNewUserForm && !newUserSubmitted && (
              <button
                type="button"
                onClick={handleShowNewUserForm}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
              >
                <Plus size={12} />
                Utilisateur non trouvé ? Créer une demande d'inscription
              </button>
            )}
          </div>

          {/* Formulaire nouvel utilisateur */}
          {showNewUserForm && !newUserSubmitted && (
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-[var(--radius-md)] space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Demande d'inscription d'un nouvel utilisateur
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={newUserData.firstName}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newUserData.lastName}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Poste / Fonction *
                </label>
                <input
                  type="text"
                  value={newUserData.position}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, position: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required
                />
              </div>

              {/* Login auto-généré */}
              {newUserData.firstName && newUserData.lastName && (
                <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
                  <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Login (généré automatiquement)
                  </div>
                  <div className="text-sm font-mono font-bold text-[var(--accent)]">
                    {generateLogin()}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewUserForm(false);
                    setNewUserData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      position: "",
                    });
                  }}
                  className="px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmitNewUser}
                  className="px-4 py-1.5 bg-blue-500 text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Envoyer la demande
                </button>
              </div>
            </div>
          )}

          {/* Confirmation demande envoyée */}
          {newUserSubmitted && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-[var(--radius-md)]">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">
                    Demande envoyée à l'administrateur
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">
                    La demande d'inscription pour{" "}
                    <strong>
                      {newUserData.firstName} {newUserData.lastName}
                    </strong>{" "}
                    a été envoyée à l'administrateur pour validation.
                  </p>
                  <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-tertiary)]">Login :</span>
                      <span className="font-mono font-bold text-[var(--accent)]">
                        {generateLogin()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-tertiary)]">
                        Mot de passe par défaut :
                      </span>
                      <span className="font-mono font-bold text-[var(--accent)]">
                        {generateDefaultPassword()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mt-3 flex items-start gap-1.5">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>
                      L'utilisateur devra modifier son mot de passe lors de sa première
                      connexion. En attendant la validation, vous pouvez continuer à
                      configurer son affectation ci-dessous.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Niveau d'affectation */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Niveau d'affectation *
            </label>
            <select
              value={formData.level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  level: e.target.value as any,
                  entityId: "",
                  entityName: "",
                  selectedComponent: "",
                  selectedSubcomponent: "",
                })
              }
              className="w-full px-3 py-2.5 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Composant *
              </label>
              <select
                value={formData.level === "component" ? formData.entityId : formData.selectedComponent}
                onChange={(e) => {
                  if (formData.level === "component") {
                    const comp = project?.components.find((c: any) => c.id === e.target.value);
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
                className="w-full px-3 py-2.5 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                required
              >
                <option value="">Sélectionner un composant</option>
                {project?.components.map((comp: any) => (
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Sous-composant *
              </label>
              <select
                value={formData.level === "subcomponent" ? formData.entityId : formData.selectedSubcomponent}
                onChange={(e) => {
                  if (formData.level === "subcomponent") {
                    const comp = project?.components.find((c: any) => c.id === formData.selectedComponent);
                    const sc = comp?.sousComposants.find((s: any) => s.id === e.target.value);
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
                className="w-full px-3 py-2.5 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                required
              >
                <option value="">Sélectionner un sous-composant</option>
                {project?.components
                  .find((c: any) => c.id === formData.selectedComponent)
                  ?.sousComposants.map((sc: any) => (
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Activité *
              </label>
              <select
                value={formData.entityId}
                onChange={(e) => {
                  const comp = project?.components.find((c: any) => c.id === formData.selectedComponent);
                  const sc = comp?.sousComposants.find((s: any) => s.id === formData.selectedSubcomponent);
                  const actIndex = sc?.activities.findIndex((_: any, idx: number) => `${sc.id}-act-${idx}` === e.target.value);
                  const actObj = actIndex !== undefined && actIndex >= 0 ? sc?.activities[actIndex] : undefined;
                  const actName = actObj ? (typeof actObj === 'string' ? actObj : actObj.name) : "";
                  setFormData({
                    ...formData,
                    entityId: e.target.value,
                    entityName: actName ? `${comp?.name} > ${sc?.name} > ${actName}` : "",
                  });
                }}
                className="w-full px-3 py-2.5 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                required
              >
                <option value="">Sélectionner une activité</option>
                {project?.components
                  .find((c: any) => c.id === formData.selectedComponent)
                  ?.sousComposants.find((s: any) => s.id === formData.selectedSubcomponent)
                  ?.activities.map((act: any, idx: number) => {
                    const actId = `${formData.selectedSubcomponent}-act-${idx}`;
                    const actName = typeof act === 'string' ? act : act.name;
                    return (
                      <option key={actId} value={actId}>
                        {actName}
                      </option>
                    );
                  })}
              </select>
            </div>
          )}

          {/* Rôle fonctionnel (saisie manuelle) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Rôle fonctionnel *
            </label>
            <input
              type="text"
              value={formData.functionalRole}
              onChange={(e) =>
                setFormData({ ...formData, functionalRole: e.target.value })
              }
              placeholder="ex: Chef de projet, Ingénieur, Contrôleur..."
              className="w-full px-3 py-2.5 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
              required
            />
          </div>

          {/* Droits d'accès (RBAC) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Rôle système (RBAC) *
            </label>
            <select
              value={formData.projectRole}
              onChange={(e) =>
                setFormData({ ...formData, projectRole: e.target.value as ProjectRole })
              }
              className="w-full px-3 py-2.5 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
              required
            >
              {Object.entries(PROJECT_ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Permissions spécifiques (checkboxes) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
              Droits d'accès spécifiques *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2.5 p-3 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--border-default)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    {permission.label}
                  </span>
                </label>
              ))}
            </div>
            {formData.permissions.length === 0 && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                <AlertCircle size={12} />
                Veuillez sélectionner au moins un droit d'accès
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              {editingAssignment ? "Modifier" : "Ajouter à l'équipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
