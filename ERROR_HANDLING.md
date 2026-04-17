# 🛡️ Gestion des erreurs - Frontend

## Vue d'ensemble

Le frontend gère maintenant les erreurs de manière robuste avec des messages utilisateur clairs et un logging approprié.

---

## 🔧 Intercepteur Axios

### Gestion des erreurs réseau
```typescript
// Erreur de connexion
if (!error.response) {
  return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
}
```

### Gestion par code HTTP

| Code | Signification | Action |
|------|---------------|--------|
| 400 | Bad Request | Message d'erreur affiché |
| 401 | Unauthorized | Redirection vers `/login` + nettoyage session |
| 403 | Forbidden | Message "Accès refusé" |
| 404 | Not Found | Message "Ressource non trouvée" |
| 409 | Conflict | Message "Cette ressource existe déjà" |
| 422 | Validation Error | Message "Données invalides" |
| 500 | Server Error | Message "Erreur serveur" |
| 503 | Service Unavailable | Message "Service indisponible" |

---

## 📝 Fonction `getErrorMessage()`

### Priorité de récupération des messages

1. **Message backend** : `error.response.data.message`
2. **Erreur backend (array)** : `error.response.data.error[]`
3. **Erreur backend (string)** : `error.response.data.error`
4. **Message Axios** : `error.message`
5. **Message par défaut** : "Une erreur est survenue"

### Cas spéciaux

```typescript
// Timeout
if (error.code === 'ECONNABORTED') {
  return 'La requête a expiré. Veuillez réessayer.';
}

// Network error
if (error.message === 'Network Error') {
  return 'Erreur de connexion au serveur.';
}
```

---

## 🎯 Utilisation dans les composants

### Pattern recommandé

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const data = await service.getAll();
    // Traiter les données
    
  } catch (err: any) {
    setError(getErrorMessage(err));
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
  }
};
```

### Affichage des erreurs

```typescript
{error && (
  <div className="rounded-md bg-red-50 p-4 border border-red-200">
    <AlertCircle className="h-5 w-5 text-red-500" />
    <div>
      <h3 className="text-sm font-medium text-red-800">Erreur</h3>
      <p className="text-sm text-red-700">{error}</p>
    </div>
  </div>
)}
```

---

## 🔍 Logging

### Console logs par type d'erreur

```typescript
// Bad Request (400)
console.error('Bad request:', errorData);

// Unauthorized (401)
console.error('Unauthorized access');

// Forbidden (403)
console.error('Access forbidden:', errorData);

// Not Found (404)
console.error('Resource not found:', errorData);

// Conflict (409)
console.error('Conflict:', errorData);

// Validation (422)
console.error('Validation error:', errorData);

// Server Error (500)
console.error('Server error:', errorData);

// Service Unavailable (503)
console.error('Service unavailable:', errorData);

// Network Error
console.error('Network error:', error.message);
```

---

## 🎨 Composant ErrorDisplay

Le composant `ErrorDisplay` est disponible pour afficher les erreurs de manière cohérente :

```typescript
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

<ErrorDisplay 
  error={error} 
  retry={fetchData}
  className="my-4"
/>
```

---

## 🔐 Gestion de l'authentification

### Erreur 401 (Unauthorized)

Lorsqu'une erreur 401 est détectée :

1. ✅ Le token JWT est supprimé de `sessionStorage`
2. ✅ Les données utilisateur sont supprimées
3. ✅ Redirection automatique vers `/login`
4. ✅ Message d'erreur affiché sur la page de login

```typescript
case 401:
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }
  break;
```

---

## 📊 Messages d'erreur utilisateur

### Messages en français

Tous les messages d'erreur sont traduits en français pour l'utilisateur :

- ✅ "Erreur de connexion au serveur"
- ✅ "La requête a expiré. Veuillez réessayer."
- ✅ "Session expirée. Veuillez vous reconnecter."
- ✅ "Accès refusé. Vous n'avez pas les permissions nécessaires."
- ✅ "Ressource non trouvée."
- ✅ "Conflit. Cette ressource existe déjà."
- ✅ "Données invalides. Vérifiez les champs du formulaire."
- ✅ "Erreur serveur. Veuillez réessayer plus tard."
- ✅ "Service temporairement indisponible."

---

## 🧪 Tests de gestion d'erreurs

### Scénarios à tester

1. **Backend arrêté**
   - Message : "Erreur de connexion au serveur"
   - Action : Vérifier la connexion

2. **Token expiré**
   - Message : "Session expirée"
   - Action : Redirection vers `/login`

3. **Mauvais credentials**
   - Message : Message du backend
   - Action : Affichage sur la page de login

4. **Ressource non trouvée**
   - Message : "Ressource non trouvée"
   - Action : Affichage de l'erreur

5. **Timeout (30s)**
   - Message : "La requête a expiré"
   - Action : Bouton "Réessayer"

6. **Erreur de validation**
   - Message : Détails de validation du backend
   - Action : Affichage des champs en erreur

---

## 🔄 Retry automatique

Pour implémenter un retry automatique :

```typescript
const fetchWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await service.getAll();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## 📝 Bonnes pratiques

### ✅ À faire

1. Toujours utiliser `getErrorMessage()` pour extraire les erreurs
2. Afficher les erreurs de manière claire à l'utilisateur
3. Logger les erreurs dans la console pour le debugging
4. Ajouter un bouton "Réessayer" quand c'est pertinent
5. Nettoyer l'erreur avant une nouvelle tentative

### ❌ À éviter

1. Ne pas afficher les erreurs techniques brutes à l'utilisateur
2. Ne pas ignorer les erreurs silencieusement
3. Ne pas oublier le `finally` pour arrêter le loading
4. Ne pas oublier de nettoyer l'état d'erreur

---

## 🎯 Améliorations futures

### Possibles améliorations

1. **Toast notifications** : Afficher les erreurs en toast
2. **Sentry integration** : Logger les erreurs dans Sentry
3. **Retry automatique** : Pour les erreurs réseau temporaires
4. **Offline mode** : Détecter et gérer le mode hors ligne
5. **Error boundaries** : Capturer les erreurs React
6. **Rate limiting** : Gérer les erreurs 429 (Too Many Requests)

---

## 📚 Exemples complets

### Exemple 1: Page avec gestion d'erreur

```typescript
export default function UsersPage() {
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} retry={fetchUsers} />;

  return <div>{/* Afficher les users */}</div>;
}
```

### Exemple 2: Formulaire avec gestion d'erreur

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setSubmitting(true);
    setError(null);
    
    await userService.create(formData);
    
    // Succès
    toast.success('Utilisateur créé avec succès');
    await fetchUsers();
    
  } catch (err: any) {
    const errorMsg = getErrorMessage(err);
    setError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setSubmitting(false);
  }
};
```

---

## ✅ Résumé

La gestion des erreurs du frontend est maintenant :

- ✅ **Robuste** : Gère tous les types d'erreurs
- ✅ **User-friendly** : Messages clairs en français
- ✅ **Debuggable** : Logs détaillés dans la console
- ✅ **Sécurisée** : Gestion automatique des erreurs 401
- ✅ **Cohérente** : Pattern uniforme dans toute l'application

---

**Version**: 1.0.0  
**Date**: 2026-04-16  
**Status**: ✅ Gestion des erreurs complète et robuste
