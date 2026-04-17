# 🏗️ EDC Track - Système de gestion de projets

Application web complète pour la gestion et le suivi des projets d'infrastructure au Cameroun.

## 🚀 Démarrage rapide

### Installation

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run start:dev

# Frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Accès
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API: http://localhost:4000/api

### Credentials par défaut
```
Login: admin
Password: admin123
```

## 📚 Documentation

### 🚀 Démarrage rapide
- **[START_HERE.md](START_HERE.md)** - 🚀 Commencez ici (5 min)
- **[TL;DR.md](TL;DR.md)** - ⚡ Résumé ultra-court (30 sec)
- **[README.md](README.md)** - 📖 Ce fichier

### 🎯 Documentation principale
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - 📋 Vue d'ensemble de l'intégration
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - ⚡ Référence rapide des services API
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - 📚 Index complet de la documentation

### 📖 Guides détaillés
- **[INTEGRATION_API_COMPLETE.md](INTEGRATION_API_COMPLETE.md)** - Guide complet d'intégration
- **[frontend/EXAMPLE_API_USAGE.tsx](frontend/EXAMPLE_API_USAGE.tsx)** - Exemples de code
- **[frontend/TEST_API_INTEGRATION.md](frontend/TEST_API_INTEGRATION.md)** - Guide de test

### 🎯 Planification
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Prochaines étapes et priorités
- **[COMPONENT_INTEGRATION_STATUS.md](COMPONENT_INTEGRATION_STATUS.md)** - Statut d'intégration

## 🏗️ Architecture

### Backend (NestJS)
- API RESTful
- MongoDB
- JWT Authentication
- Upload de fichiers
- Gestion des alertes

### Frontend (Next.js)
- React 19
- TypeScript
- Tailwind CSS
- Axios pour les appels API
- Transformation automatique des données (FR ↔ EN)

## ✨ Fonctionnalités

### ✅ Implémentées
- 🔐 Authentification (login/logout)
- 👥 Gestion des utilisateurs (CRUD)
- 📁 Gestion des projets (CRUD)
- 📄 Gestion des documents (upload, approve, reject)
- 👨‍💼 Affectations d'équipe
- 🔔 Système d'alertes
- 📊 Dashboard avec statistiques

### 🔄 En cours
- Page détail projet
- Page équipe projet
- Pages documents/GED
- Pages de suivi

## 🔄 Transformation automatique

Le backend utilise des noms en français, le frontend en anglais. La transformation est automatique :

```typescript
// Backend → Frontend
prenom       → firstName
nom          → lastName
telephone    → phone
fonction     → position
departement  → department
statut       → status
```

## 🛠️ Stack technique

### Backend
- NestJS 10
- MongoDB
- Mongoose
- JWT
- Multer (upload)
- Winston (logs)

### Frontend
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Axios
- Recharts (graphiques)
- Leaflet (cartes)

## 📦 Services API disponibles

- `authService` - Authentification
- `userService` - Utilisateurs (avec transformation)
- `projectService` - Projets
- `documentService` - Documents
- `teamService` - Équipes
- `alertService` - Alertes
- `dashboardService` - Statistiques
- `healthService` - Health check

## 🧪 Tests

```bash
# Tests backend
cd backend
npm test

# Tests frontend
cd frontend
npm test

# Tests E2E
npm run test:e2e
```

Voir [frontend/TEST_API_INTEGRATION.md](frontend/TEST_API_INTEGRATION.md) pour les tests manuels.

## 📊 Statut du projet

- **Backend**: ✅ Complet et fonctionnel
- **Frontend**: 🔄 En cours d'intégration
- **API Integration**: ✅ Couche de transformation complète
- **Pages intégrées**: 5/15 (33%)

## 🎯 Prochaines étapes

1. Tester l'intégration actuelle
2. Intégrer la page Project Detail
3. Intégrer la page Project Team
4. Intégrer les pages Documents/GED
5. Intégrer les pages de suivi

Voir [NEXT_STEPS.md](NEXT_STEPS.md) pour plus de détails.

## 🐛 Debugging

### Erreurs communes

| Erreur | Solution |
|--------|----------|
| Cannot find module 'axios' | `cd frontend && npm install axios` |
| 401 Unauthorized | Se reconnecter |
| Network Error | Vérifier que le backend tourne |
| CORS Error | Vérifier `CORS_ORIGIN` dans `.env` |

Voir [frontend/TEST_API_INTEGRATION.md](frontend/TEST_API_INTEGRATION.md) pour plus d'aide.

## 📝 Contribution

1. Toujours utiliser les noms anglais dans le frontend
2. Suivre le pattern async/await + loading/error states
3. Utiliser les services existants
4. Ne pas modifier le backend
5. Documenter les changements

## 📄 Licence

Propriétaire - EDC Cameroun

## 👥 Équipe

- Backend: NestJS + MongoDB
- Frontend: Next.js + React
- Intégration: Couche de transformation automatique

---

**Version**: 1.0.0  
**Date**: 2026-04-16  
**Status**: ✅ Intégration API complète, pages en cours d'intégration

Pour plus d'informations, consultez [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
