// ══════════════════════════════════════════════════════════════
// EXEMPLE D'UTILISATION DES SERVICES API
// ══════════════════════════════════════════════════════════════
// Ce fichier montre comment utiliser les services API avec
// la transformation automatique des données (FR → EN)
// ══════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect } from 'react';
import { 
  userService, 
  projectService, 
  alertService,
  dashboardService,
  getErrorMessage,
  type User,
  type Project,
  type Alert,
} from '@/services/api';

// ══════════════════════════════════════════════════════════════
// EXEMPLE 1: Récupérer et afficher des utilisateurs
// ══════════════════════════════════════════════════════════════

export function UsersExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ✅ Les données sont automatiquement transformées
        // Backend: { prenom, nom, telephone, fonction, departement, statut }
        // Frontend: { firstName, lastName, phone, position, department, status }
        const data = await userService.getAll();
        
        setUsers(data);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Utilisateurs</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {/* ✅ Utiliser les noms ANGLAIS */}
            {user.firstName} {user.lastName} - {user.position} ({user.department})
            {/* ❌ NE PAS utiliser: user.prenom, user.nom, user.fonction */}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EXEMPLE 2: Créer un utilisateur
// ══════════════════════════════════════════════════════════════

export function CreateUserExample() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // ✅ Utiliser les noms ANGLAIS dans le formulaire
      const newUser = await userService.create({
        firstName: 'Jean',        // → Backend: prenom
        lastName: 'Dupont',       // → Backend: nom
        email: 'jean@edc.cm',
        phone: '+237 6 99 99 99 99',  // → Backend: telephone
        position: 'Chef de Projet',   // → Backend: fonction
        department: 'IT',             // → Backend: departement
        login: 'jdupont',
        password: 'password123',
        platformRole: 'user',
        status: 'active',             // → Backend: statut: 'actif'
      });
      
      console.log('Utilisateur créé:', newUser);
      // newUser.firstName ✅
      // newUser.prenom ❌ (n'existe pas)
      
    } catch (err: any) {
      console.error('Erreur:', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Création...' : 'Créer utilisateur'}
      </button>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════
// EXEMPLE 3: Mettre à jour un utilisateur
// ══════════════════════════════════════════════════════════════

export function UpdateUserExample({ userId }: { userId: string }) {
  const handleUpdate = async () => {
    try {
      // ✅ Utiliser les noms ANGLAIS
      const updatedUser = await userService.update(userId, {
        position: 'Directeur de Projet',  // → Backend: fonction
        department: 'Direction',          // → Backend: departement
        status: 'active',                 // → Backend: statut: 'actif'
      });
      
      console.log('Utilisateur mis à jour:', updatedUser);
    } catch (err: any) {
      console.error('Erreur:', getErrorMessage(err));
    }
  };

  return (
    <button onClick={handleUpdate}>
      Mettre à jour
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// EXEMPLE 4: Récupérer des projets
// ══════════════════════════════════════════════════════════════

export function ProjectsExample() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // ✅ Pas de transformation nécessaire pour les projets
        // (les noms sont déjà en anglais dans le backend)
        const data = await projectService.getAll();
        setProjects(data);
      } catch (err: any) {
        console.error('Erreur:', getErrorMessage(err));
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <h2>Projets</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.code}>
            {project.name} - {project.budget} {project.devise}
            <br />
            Localisation: {project.localisation?.region}, {project.localisation?.ville}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EXEMPLE 5: Récupérer les statistiques du dashboard
// ══════════════════════════════════════════════════════════════

export function DashboardStatsExample() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ Récupère les stats de plusieurs endpoints en parallèle
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err: any) {
        console.error('Erreur:', getErrorMessage(err));
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Statistiques</h2>
      <p>Projets: {stats.projects.total}</p>
      <p>Progression moyenne: {stats.projects.avgProgress}%</p>
      <p>Alertes non lues: {stats.alerts.unread}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EXEMPLE 6: Gérer les alertes
// ══════════════════════════════════════════════════════════════

export function AlertsExample() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertService.getAll();
        setAlerts(data);
      } catch (err: any) {
        console.error('Erreur:', getErrorMessage(err));
      }
    };

    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await alertService.markAsRead(alertId);
      // Rafraîchir la liste
      const data = await alertService.getAll();
      setAlerts(data);
    } catch (err: any) {
      console.error('Erreur:', getErrorMessage(err));
    }
  };

  return (
    <div>
      <h2>Alertes</h2>
      <ul>
        {alerts.map((alert) => (
          <li key={alert._id}>
            <strong>{alert.title}</strong> - {alert.severity}
            <br />
            {alert.message}
            {!alert.isRead && (
              <button onClick={() => handleMarkAsRead(alert._id)}>
                Marquer comme lu
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EXEMPLE 7: Pattern complet avec loading et error
// ══════════════════════════════════════════════════════════════

export function CompletePatternExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (userData: any) => {
    try {
      await userService.create(userData);
      await fetchUsers(); // Rafraîchir la liste
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdate = async (id: string, userData: any) => {
    try {
      await userService.update(id, userData);
      await fetchUsers(); // Rafraîchir la liste
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.delete(id);
      await fetchUsers(); // Rafraîchir la liste
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error} <button onClick={fetchUsers}>Réessayer</button></div>;

  return (
    <div>
      <h2>Gestion des utilisateurs</h2>
      {/* Votre UI ici */}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// NOTES IMPORTANTES
// ══════════════════════════════════════════════════════════════

/*
✅ À FAIRE:
- Toujours utiliser les noms ANGLAIS dans le frontend
- Utiliser getErrorMessage() pour les erreurs
- Ajouter loading et error states
- Rafraîchir les données après create/update/delete

❌ À NE PAS FAIRE:
- N'utilisez JAMAIS les noms français (prenom, nom, etc.)
- Ne pas appeler les transformateurs manuellement
- Ne pas modifier le backend
- Ne pas oublier le try/catch

🔄 TRANSFORMATION AUTOMATIQUE:
Les services font automatiquement la transformation:
- userService.getAll() → transforme prenom → firstName
- userService.create({ firstName }) → transforme → { prenom }
- authService.login() → transforme la réponse

📝 TYPES TYPESCRIPT:
Toujours utiliser les types du frontend:
- User (pas BackendUser)
- LoginResponse (pas BackendLoginResponse)
- Les types backend sont internes aux services
*/
