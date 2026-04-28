"use client";

import { useState, useEffect } from "react";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  type User,
} from "@/lib/userStore";
import { Plus, Edit2, Trash2, Search, Mail, Phone, Briefcase } from "lucide-react";
import { toast } from "@/lib/toastStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { getErrorMessage } from "@/services/api/client";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "pending">("users");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
      
      // Récupérer les demandes en attente depuis le backend
      // Pour l'instant, on va filtrer les affectations avec userId="pending"
      // Dans une vraie implémentation, il faudrait un endpoint dédié
      const response = await fetch('/api/team/pending-requests');
      if (response.ok) {
        const pendingData = await response.json();
        setPendingRequests(pendingData.data || []);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    status: "active" as "active" | "inactive",
    platformRole: "user" as "admin" | "user",
    login: "",
    password: "user123", // Default for demo
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        position: user.position || "",
        department: user.department || "",
        status: user.status,
        platformRole: user.platformRole,
        login: user.login,
        password: "", // Don't show existing password
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        status: "active",
        platformRole: "user",
        login: "",
        password: "user123",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.login) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingUser) {
        // Update existing user
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          status: formData.status,
        };
        await updateUser(editingUser.id, updateData);
        toast.success("Utilisateur modifié");
      } else {
        // Create new user
        const createData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          login: formData.login,
          password: formData.password,
          platformRole: formData.platformRole,
          status: formData.status,
        };
        await addUser(createData);
        toast.success("Utilisateur créé");
      }

      await fetchUsers();
      handleCloseModal();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteUser(deleteConfirm.id);
      toast.success("Utilisateur supprimé");
      await fetchUsers();
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleApproveRequest = async (request: any) => {
    try {
      setSubmitting(true);
      
      // Créer l'utilisateur
      const login = `${request.newUserData.firstName.toLowerCase()}.${request.newUserData.lastName.toLowerCase()}`;
      const createData = {
        firstName: request.newUserData.firstName,
        lastName: request.newUserData.lastName,
        email: request.newUserData.email,
        phone: request.newUserData.phone,
        position: request.newUserData.position,
        department: "",
        login: login,
        password: "Temp@2026",
        platformRole: "user" as const,
        status: "active" as const,
      };
      
      const newUser = await addUser(createData);
      
      // Mettre à jour l'affectation avec le vrai userId
      await fetch(`/api/team/${request._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newUser.id }),
      });
      
      toast.success(`Utilisateur ${newUser.firstName} ${newUser.lastName} créé avec succès`);
      await fetchUsers();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setSubmitting(true);
      
      // Supprimer l'affectation en attente
      await fetch(`/api/team/${requestId}`, {
        method: 'DELETE',
      });
      
      toast.success("Demande rejetée");
      await fetchUsers();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email} ${user.position || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" className="min-h-[400px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorDisplay error={error} retry={fetchUsers} />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Gestion des Utilisateurs
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Gérez les utilisateurs et leurs informations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[var(--border-default)]">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "users"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Utilisateurs ({filteredUsers.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 relative ${
            activeTab === "pending"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Demandes en attente
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Actions bar */}
      {activeTab === "users" && (
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
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
            Nouvel utilisateur
          </button>
        </div>
      )}

      {/* Pending Requests Section */}
      {activeTab === "pending" && (
        <div className="space-y-4 mb-6">
          {pendingRequests.length === 0 ? (
            <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Aucune demande en attente
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Toutes les demandes d'inscription ont été traitées
              </p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div
                key={request._id}
                className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold">
                        {request.newUserData.firstName[0]}{request.newUserData.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {request.newUserData.firstName} {request.newUserData.lastName}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Demande d'inscription
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">Email</div>
                        <div className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                          <Mail size={14} />
                          {request.newUserData.email}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">Téléphone</div>
                        <div className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                          <Phone size={14} />
                          {request.newUserData.phone}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">Fonction</div>
                        <div className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                          <Briefcase size={14} />
                          {request.newUserData.position}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">Rôle fonctionnel</div>
                        <div className="text-sm text-[var(--text-primary)]">
                          {request.functionalRole}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-[var(--radius-md)]">
                      <div className="text-xs font-semibold text-blue-600 mb-1">Identifiants proposés</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-[var(--text-secondary)]">Login:</span>{" "}
                          <span className="font-mono font-bold text-[var(--text-primary)]">
                            {request.newUserData.firstName.toLowerCase()}.{request.newUserData.lastName.toLowerCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">Mot de passe:</span>{" "}
                          <span className="font-mono font-bold text-[var(--text-primary)]">Temp@2026</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleApproveRequest(request)}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Approuver
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users table */}
      {activeTab === "users" && (
        <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden shadow-sm">
          <table className="w-full">
          <thead className="bg-[var(--bg-inset)] border-b border-[var(--border-default)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Fonction
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName?.[0] || ""}{user.lastName?.[0] || ""}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {user.firstName} {user.lastName}
                      </div>
                      {user.department && (
                        <div className="text-xs text-[var(--text-tertiary)]">
                          {user.department}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Mail size={12} />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Phone size={12} />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {user.position && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Briefcase size={14} />
                      {user.position}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-green-500/10 text-green-600 border border-green-500/20"
                        : "bg-gray-500/10 text-gray-600 border border-gray-500/20"
                    }`}
                  >
                    {user.status === "active" ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-[var(--radius-md)] transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                      className="p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 rounded-[var(--radius-md)] transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            <p className="text-sm">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border-default)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Login *
                </label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  required={!editingUser}
                  disabled={!!editingUser}
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Fonction
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Département
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Rôle plateforme
                </label>
                <select
                  value={formData.platformRole}
                  onChange={(e) => setFormData({ ...formData, platformRole: e.target.value as "admin" | "user" })}
                  className="w-full px-3 py-2 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      {editingUser ? "Modification..." : "Création..."}
                    </>
                  ) : (
                    <>{editingUser ? "Modifier" : "Créer"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${deleteConfirm?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
