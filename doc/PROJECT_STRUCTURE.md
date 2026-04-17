# 🏗️ Structure du projet EDC Track

## 📁 Vue d'ensemble

```
EDCAPP/
├── 📄 Documentation (racine)
├── 🔧 Backend (NestJS)
├── 🎨 Frontend (Next.js)
└── 📚 Documentation projet
```

---

## 📄 Documentation (racine)

```
EDCAPP/
├── README.md                           # 📖 README principal
├── START_HERE.md                       # 🚀 Point de départ
├── CHANGELOG.md                        # 📝 Historique
├── TRAVAIL_ACCOMPLI.md                # 🎉 Travail réalisé
├── PROJECT_STRUCTURE.md               # 🏗️ Ce fichier
│
├── INTEGRATION_SUMMARY.md             # 📋 Résumé intégration
├── INTEGRATION_API_COMPLETE.md        # 📖 Guide complet
├── INTEGRATION_COMPLETE_FINAL.md      # ✅ Récapitulatif
├── QUICK_REFERENCE.md                 # ⚡ Référence rapide
├── VISUAL_SUMMARY.md                  # 🎨 Résumé visuel
├── DOCUMENTATION_INDEX.md             # 📚 Index navigation
├── NEXT_STEPS.md                      # 🎯 Prochaines étapes
│
├── COMPONENT_INTEGRATION_STATUS.md    # 📊 Statut composants
├── COMPONENT_UPDATE_GUIDE.md          # 📝 Guide mise à jour
├── COHERENCE_FRONTEND_BACKEND.md      # 🔗 Cohérence
├── FINAL_STATUS.md                    # 📊 Statut final
├── FRONTEND_CLEANUP_COMPLETE.md       # 🧹 Nettoyage
├── FRONTEND_CLEANUP_PLAN.md           # 📋 Plan nettoyage
└── INTEGRATION_COMPLETE.md            # ✅ Intégration
```

---

## 🔧 Backend (NestJS)

```
backend/
├── 📄 Configuration
│   ├── .env                           # Variables d'environnement
│   ├── .env.example                   # Exemple de configuration
│   ├── package.json                   # Dépendances
│   ├── tsconfig.json                  # Config TypeScript
│   └── nest-cli.json                  # Config NestJS
│
├── 📚 Documentation
│   ├── README.md                      # README backend
│   ├── SETUP_GUIDE.md                 # Guide d'installation
│   ├── API_DOCUMENTATION.md           # 📖 Doc API complète
│   ├── ARCHITECTURE_CREATED.md        # 🏗️ Architecture
│   ├── COMPLETION_SUMMARY.md          # ✅ Résumé
│   ├── POSTMAN_GUIDE.md              # 🧪 Tests Postman (FR)
│   ├── POSTMAN_TESTS_ENGLISH.md      # 🧪 Tests Postman (EN)
│   ├── postman_quick_tests.md        # ⚡ Tests rapides
│   └── TEST_API.md                    # 🧪 Tests API
│
├── 🗂️ Source
│   └── src/
│       ├── main.ts                    # Point d'entrée
│       ├── app.module.ts              # Module principal
│       │
│       └── modules/
│           ├── auth/                  # 🔐 Authentification
│           │   ├── auth.controller.ts
│           │   ├── auth.service.ts
│           │   └── strategies/
│           │
│           ├── users/                 # 👥 Utilisateurs
│           │   ├── users.controller.ts
│           │   ├── users.service.ts
│           │   └── schemas/
│           │       └── user.schema.ts
│           │
│           ├── projects/              # 📁 Projets
│           │   ├── projects.controller.ts
│           │   ├── projects.service.ts
│           │   └── schemas/
│           │
│           ├── documents/             # 📄 Documents
│           │   ├── documents.controller.ts
│           │   ├── documents.service.ts
│           │   └── schemas/
│           │
│           ├── team/                  # 👨‍💼 Équipes
│           │   ├── team.controller.ts
│           │   ├── team.service.ts
│           │   └── schemas/
│           │
│           └── alerts/                # 🔔 Alertes
│               ├── alerts.controller.ts
│               ├── alerts.service.ts
│               └── schemas/
│
├── 📦 Autres
│   ├── uploads/                       # Fichiers uploadés
│   ├── logs/                          # Logs
│   ├── backups/                       # Sauvegardes
│   ├── dist/                          # Build
│   └── node_modules/                  # Dépendances
│
└── 🧪 Tests
    └── EDC_Track_API.postman_collection.json
```

---

## 🎨 Frontend (Next.js)

```
frontend/
├── 📄 Configuration
│   ├── .env.local                     # Variables d'environnement
│   ├── .env.local.example             # Exemple
│   ├── package.json                   # Dépendances
│   ├── tsconfig.json                  # Config TypeScript
│   ├── next.config.ts                 # Config Next.js
│   ├── tailwind.config.ts             # Config Tailwind
│   └── postcss.config.mjs             # Config PostCSS
│
├── 📚 Documentation
│   ├── README.md                      # README frontend
│   ├── TEST_API_INTEGRATION.md        # 🧪 Guide de test
│   ├── EXAMPLE_API_USAGE.tsx          # 💻 Exemples de code
│   └── verify-integration.js          # ✅ Script vérification
│
├── 🎨 Source
│   └── src/
│       │
│       ├── 📱 app/                    # Pages Next.js
│       │   ├── layout.tsx             # Layout principal
│       │   ├── page.tsx               # Page d'accueil
│       │   │
│       │   ├── (auth)/                # 🔐 Pages authentification
│       │   │   └── login/
│       │   │       └── page.tsx
│       │   │
│       │   └── (dashboard)/           # 📊 Pages dashboard
│       │       ├── layout.tsx
│       │       │
│       │       ├── dashboard/         # 📊 Dashboard
│       │       │   └── page.tsx
│       │       │
│       │       ├── users/             # 👥 Utilisateurs
│       │       │   └── page.tsx       # ✅ Intégré
│       │       │
│       │       ├── projects/          # 📁 Projets
│       │       │   ├── page.tsx       # ✅ Intégré
│       │       │   └── [code]/
│       │       │       ├── page.tsx   # 🔄 À intégrer
│       │       │       ├── team/
│       │       │       │   └── page.tsx # 🔄 À intégrer
│       │       │       └── documents/
│       │       │           └── page.tsx
│       │       │
│       │       ├── alerts/            # 🔔 Alertes
│       │       │   └── page.tsx       # ✅ Intégré
│       │       │
│       │       ├── ged/               # 📄 GED
│       │       │   └── page.tsx       # 🔄 À intégrer
│       │       │
│       │       ├── suivi/             # 📈 Suivi
│       │       │   └── page.tsx       # 🔄 À intégrer
│       │       │
│       │       └── archives/          # 📦 Archives
│       │           └── page.tsx       # 🔄 À intégrer
│       │
│       ├── 🧩 components/             # Composants React
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── Footer.tsx
│       │   │
│       │   └── ui/                    # Composants UI
│       │       ├── Button.tsx
│       │       ├── Input.tsx
│       │       ├── Modal.tsx
│       │       ├── LoadingSpinner.tsx
│       │       └── ErrorDisplay.tsx
│       │
│       ├── 🔌 services/               # Services
│       │   └── api/                   # 🌐 Services API
│       │       ├── README.md          # 📖 Documentation
│       │       ├── client.ts          # ✅ Client Axios
│       │       ├── transformers.ts    # 🔄 Transformateurs
│       │       ├── index.ts           # Export centralisé
│       │       │
│       │       ├── authService.ts     # ✅ Auth (avec transfo)
│       │       ├── userService.ts     # ✅ Users (avec transfo)
│       │       ├── projectService.ts  # ✅ Projects
│       │       ├── documentService.ts # ✅ Documents
│       │       ├── teamService.ts     # ✅ Team
│       │       ├── alertService.ts    # ✅ Alerts
│       │       ├── dashboardService.ts # ✅ Dashboard (nouveau)
│       │       └── healthService.ts   # ✅ Health (nouveau)
│       │
│       ├── 📚 lib/                    # Utilitaires
│       │   ├── stores/                # Stores Zustand
│       │   │   ├── authStore.ts
│       │   │   ├── userStore.ts
│       │   │   ├── projectStore.ts
│       │   │   └── documentTrackingStore.ts
│       │   │
│       │   └── helpers/               # Fonctions helper
│       │       ├── budgetHelpers.ts
│       │       └── dateHelpers.ts
│       │
│       └── 🎨 styles/                 # Styles
│           └── globals.css
│
├── 📦 Autres
│   ├── public/                        # Assets publics
│   ├── .next/                         # Build Next.js
│   └── node_modules/                  # Dépendances
│
└── 📚 Documentation projet
    └── doc/
        ├── README.md
        ├── ARCHITECTURE_TECHNIQUE.md
        └── MODELE_DONNEES.md
```

---

## 📚 Documentation projet (doc/)

```
doc/
├── 📄 Cahiers des charges
│   ├── Cahier_des_Charges_EDC.md
│   ├── Cahier des Charges.pdf
│   ├── Cahier des charges simplifié.pdf
│   └── CAHIER DES CHARGES_Modifié.pdf
│
├── 📋 Planification
│   ├── Plan de Travail.pdf
│   ├── Vue generale.docx
│   └── NOTE REUNION PROJET EDC.docx
│
├── 🗄️ Base de données
│   ├── script_bd.sql
│   ├── seed_etape_type.sql
│   └── seed_roles.sql
│
└── 📊 Diagrammes
    ├── MPD.png
    ├── Classe_EDC.png
    ├── Use Case_EDC.png
    ├── classe.puml
    ├── mpd.puml
    └── usecase.puml
```

---

## 🎯 Légende

### Status des fichiers
- ✅ Intégré et fonctionnel
- 🔄 À intégrer
- 📖 Documentation
- 🧪 Tests
- 🔧 Configuration
- 🎨 Interface
- 🔐 Authentification
- 👥 Utilisateurs
- 📁 Projets
- 📄 Documents
- 🔔 Alertes
- 📊 Statistiques

### Types de fichiers
- `.ts` / `.tsx` - TypeScript/React
- `.js` - JavaScript
- `.json` - Configuration JSON
- `.md` - Documentation Markdown
- `.env` - Variables d'environnement
- `.sql` - Scripts SQL
- `.pdf` / `.docx` - Documents

---

## 📊 Statistiques

### Backend
- **Modules**: 6 (auth, users, projects, documents, team, alerts)
- **Controllers**: 6
- **Services**: 6
- **Schemas**: 6
- **Endpoints**: ~40

### Frontend
- **Pages**: 15 (5 intégrées, 10 à intégrer)
- **Composants**: ~30
- **Services API**: 8
- **Stores**: 4
- **Helpers**: 2

### Documentation
- **Fichiers racine**: 16
- **Backend**: 9
- **Frontend**: 4
- **Projet**: 15
- **Total**: 44 fichiers

---

## 🔍 Navigation rapide

### Pour démarrer
```
START_HERE.md → README.md → INTEGRATION_SUMMARY.md
```

### Pour développer
```
INTEGRATION_API_COMPLETE.md → EXAMPLE_API_USAGE.tsx → QUICK_REFERENCE.md
```

### Pour tester
```
TEST_API_INTEGRATION.md → verify-integration.js
```

### Pour comprendre
```
VISUAL_SUMMARY.md → PROJECT_STRUCTURE.md → DOCUMENTATION_INDEX.md
```

---

## 🎓 Parcours recommandé

### Nouveau développeur
1. `START_HERE.md` - Démarrage
2. `README.md` - Vue d'ensemble
3. `PROJECT_STRUCTURE.md` - Structure (ce fichier)
4. `INTEGRATION_SUMMARY.md` - Intégration
5. `QUICK_REFERENCE.md` - Référence

### Développeur frontend
1. `frontend/README.md`
2. `INTEGRATION_API_COMPLETE.md`
3. `frontend/EXAMPLE_API_USAGE.tsx`
4. `frontend/src/services/api/README.md`

### Développeur backend
1. `backend/README.md`
2. `backend/SETUP_GUIDE.md`
3. `backend/API_DOCUMENTATION.md`
4. `backend/ARCHITECTURE_CREATED.md`

### Testeur
1. `frontend/TEST_API_INTEGRATION.md`
2. `backend/POSTMAN_GUIDE.md`
3. `frontend/verify-integration.js`

---

**Version**: 1.0.0  
**Date**: 2026-04-16  
**Status**: ✅ Structure complète et documentée
