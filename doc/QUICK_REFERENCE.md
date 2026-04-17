# 🚀 Référence rapide - Intégration API

## Installation
```bash
cd frontend
npm install axios
```

## Import des services
```typescript
import { 
  userService, 
  projectService, 
  alertService,
  documentService,
  teamService,
  authService,
  dashboardService,
  healthService,
  getErrorMessage 
} from '@/services/api';
```

## Transformation automatique

### Backend → Frontend
```
prenom       → firstName
nom          → lastName
telephone    → phone
fonction     → position
departement  → department
statut       → status
actif        → active
inactif      → inactive
```

## Pattern de base

```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const result = await service.getAll();
    setData(result);
  } catch (err: any) {
    setError(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

useEffect(() => { fetchData(); }, []);
```

## Services disponibles

### authService
```typescript
await authService.login({ login, password });
await authService.logout();
```

### userService (avec transformation)
```typescript
await userService.getAll();
await userService.getById(id);
await userService.create({ firstName, lastName, ... });
await userService.update(id, { position, department, ... });
await userService.delete(id);
```

### projectService
```typescript
await projectService.getAll(region?);
await projectService.getByCode(code);
await projectService.getStats();
await projectService.create(data);
await projectService.update(code, data);
await projectService.delete(code);
```

### documentService
```typescript
await documentService.upload(file, { projectId, phase, folderName });
await documentService.getAll(filters?);
await documentService.getById(id);
await documentService.getStats(projectId, phase?);
await documentService.download(id);
await documentService.approve(id);
await documentService.reject(id, { reason });
await documentService.trash(id, { reason });
await documentService.restore(id);
await documentService.delete(id);
```

### alertService
```typescript
await alertService.getAll(all?);
await alertService.getCount();
await alertService.getByProject(projectId);
await alertService.markAsRead(id);
await alertService.delete(id);
```

### teamService
```typescript
await teamService.assign(data);
await teamService.getProjectTeam(projectId);
await teamService.getUserProjects(userId);
await teamService.deactivate(id);
await teamService.remove(id);
```

### dashboardService
```typescript
const stats = await dashboardService.getStats();
// { projects: { total, avgProgress }, documents: {...}, alerts: { unread } }
```

### healthService
```typescript
const health = await healthService.check();
// { status, timestamp, uptime, database, memory }
```

## Démarrage

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API: http://localhost:4000/api
- Health: http://localhost:4000/api/health

## Credentials par défaut
```
Login: admin
Password: admin123
```

## Debugging

### Voir le token
```javascript
sessionStorage.getItem('jwt_token')
```

### Tester l'API directement
```javascript
const response = await fetch('http://localhost:4000/api/users', {
  headers: { 'Authorization': `Bearer ${sessionStorage.getItem('jwt_token')}` }
});
const data = await response.json();
console.log(data);
```

## Erreurs communes

| Erreur | Solution |
|--------|----------|
| Cannot find module 'axios' | `npm install axios` |
| prenom is not defined | Utiliser `firstName` |
| 401 Unauthorized | Se reconnecter |
| Network Error | Vérifier que le backend tourne |
| CORS Error | Vérifier `CORS_ORIGIN` dans `.env` |

## Documentation complète
- `INTEGRATION_API_COMPLETE.md` - Guide complet
- `INTEGRATION_SUMMARY.md` - Résumé détaillé
- `TEST_API_INTEGRATION.md` - Guide de test
- `EXAMPLE_API_USAGE.tsx` - Exemples de code
