# EDC Track - Système de Suivi de Projets

Application de gestion et suivi de projets pour EDC (Energy Development Corporation).

## 🎯 Vue d'ensemble

EDC Track est une application web complète pour la gestion de projets d'infrastructure avec:
- Gestion de projets avec structure hiérarchique (composants → sous-composants → activités)
- Gestion d'équipe avec affectations granulaires
- GED (Gestion Électronique de Documents) avec versioning
- Système d'alertes et notifications
- Audit trail complet
- RBAC (Role-Based Access Control)

## 🏗️ Architecture

### Frontend
- **Next.js 14** (App Router)
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling
- **Zustand** pour le state management (temporaire)

### Backend (à développer)
- **NestJS** avec TypeScript
- **MongoDB** avec Mongoose ODM
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers

### Déploiement
- **100% On-Premise** (serveur interne EDC)
- **Nginx** comme reverse proxy
- **PM2** pour le process management
- Fichiers stockés sur système de fichiers local

## 📚 Documentation

Toute la documentation est disponible dans le dossier `doc/`:

- **[doc/README.md](doc/README.md)** - Index de la documentation
- **[doc/ARCHITECTURE_TECHNIQUE.md](doc/ARCHITECTURE_TECHNIQUE.md)** - Architecture complète
- **[doc/MODELE_DONNEES.md](doc/MODELE_DONNEES.md)** - Modèle de données MongoDB
- **[doc/IMPLEMENTATION_COMPLETE.md](doc/IMPLEMENTATION_COMPLETE.md)** - Historique des implémentations

## 🚀 Fichiers Backend

Fichiers prêts à l'emploi pour le développement backend:

- **[backend-models.ts](backend-models.ts)** - Schémas Mongoose
- **[backend-dtos.ts](backend-dtos.ts)** - DTOs de validation
- **[backend-usage-example.ts](backend-usage-example.ts)** - Exemples d'utilisation
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Guide de configuration
- **[README_BACKEND_FILES.md](README_BACKEND_FILES.md)** - Vue d'ensemble backend

## 🏃 Quick Start

### Frontend (actuel)

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Ouvrir http://localhost:3000
```

### Backend (à développer)

Voir **[README_BACKEND_FILES.md](README_BACKEND_FILES.md)** pour le guide complet.

```bash
# Créer le projet backend
nest new edc-track-backend
cd edc-track-backend

# Installer les dépendances
npm install @nestjs/mongoose mongoose @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install class-validator class-transformer

# Copier les fichiers
cp ../backend-models.ts src/schemas/
cp ../backend-dtos.ts src/dtos/

# Configurer .env
MONGODB_URI=mongodb://edc_user:password@localhost:27017/edc_track
JWT_SECRET=votre_secret_jwt
PORT=4000

# Démarrer
npm run start:dev
```

## 📋 Fonctionnalités implémentées

### ✅ Frontend
- Interface de gestion des projets
- Formulaire de création de projet (3 steps)
- Gestion d'équipe avec affectations multi-niveaux
- Interface GED (archives)
- Planification
- Gestion des utilisateurs
- Confirmation dialogs pour toutes les suppressions
- RBAC désactivé pour les tests

### ⏳ Backend (à développer)
- API REST avec NestJS
- Authentification JWT
- CRUD pour toutes les entités
- Upload/Download de fichiers
- Système d'audit
- Système d'alertes

## 🗂️ Structure du projet

```
edc-track/
├── doc/                          # Documentation complète
│   ├── README.md
│   ├── ARCHITECTURE_TECHNIQUE.md
│   ├── MODELE_DONNEES.md
│   └── IMPLEMENTATION_COMPLETE.md
├── src/                          # Frontend Next.js
│   ├── app/                      # Pages et layouts
│   ├── components/               # Composants React
│   ├── lib/                      # Stores et utilitaires
│   └── hooks/                    # Custom hooks
├── public/                       # Assets statiques
├── wireframe/                    # Wireframes HTML
├── backend-models.ts             # Schémas Mongoose
├── backend-dtos.ts               # DTOs de validation
├── backend-usage-example.ts      # Exemples backend
├── BACKEND_SETUP.md              # Guide backend
├── README_BACKEND_FILES.md       # Vue d'ensemble backend
└── README.md                     # Ce fichier
```

## 🔐 Sécurité

- Authentification JWT
- RBAC avec rôles plateforme et projet
- Audit trail de toutes les actions sensibles
- Validation des données avec class-validator
- Guards NestJS pour protection des routes

## 🛠️ Technologies

### Frontend
- Next.js 14, React 18, TypeScript
- Tailwind CSS
- Zustand
- Lucide Icons

### Backend
- NestJS, TypeScript
- MongoDB, Mongoose
- JWT, Passport
- Bcrypt, Multer

### Infrastructure
- Nginx
- PM2
- MongoDB 6.0+
- Ubuntu Server 22.04 LTS

## 📊 Collections MongoDB

- **users** - Utilisateurs et authentification
- **projects** - Projets avec structure hiérarchique complète
- **teamAssignments** - Affectations d'équipe
- **documents** - Métadonnées des fichiers GED
- **auditLogs** - Logs d'audit
- **alerts** - Alertes et notifications

## 🚀 Prochaines étapes

1. **Backend NestJS** - Implémenter l'API REST
2. **Authentification** - JWT + Guards
3. **Upload fichiers** - Multer + versioning
4. **Intégration** - Connecter frontend au backend
5. **Tests** - Tests unitaires et e2e
6. **Déploiement** - Configuration production

## 📞 Support

Pour toute question:
1. Consulter la documentation dans `doc/`
2. Voir les exemples dans `backend-usage-example.ts`
3. Lire le guide de setup dans `BACKEND_SETUP.md`

## 📄 Licence

Propriétaire - EDC (Energy Development Corporation)

---

**Version**: 1.0  
**Date**: Janvier 2024  
**Équipe**: EDC Track Development Team
