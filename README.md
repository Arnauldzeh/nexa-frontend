# NEXA Frontend

Application web de gestion de projets et d'archivage de documents.

**DEMO :** [https://master.d3rv7wqdgixsbn.amplifyapp.com/](https://master.d3rv7wqdgixsbn.amplifyapp.com/)

**Identifiants de test :**
- Login : `admin`
- Mot de passe : `admin123`

## Technologies

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Styling
- **Axios** - Client HTTP
- **Recharts** - Graphiques
- **Leaflet** - Cartes interactives

## Prérequis

- Node.js 18+ 
- npm ou yarn
- Backend NEXA en cours d'exécution

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/Arnauldzeh/nexa-frontend.git
cd nexa-frontend
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```

Éditer `.env.local` et configurer l'URL du backend :
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Développement

Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Build Production

Créer un build optimisé :
```bash
npm run build
```

Lancer le serveur de production :
```bash
npm start
```

## Déploiement

### AWS Amplify (Recommandé)

1. Connecter votre repository GitHub à AWS Amplify
2. Configurer les variables d'environnement :
   - `NEXT_PUBLIC_API_URL` : URL de votre backend
3. Déployer automatiquement à chaque push


## Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL du backend API | `https://api.nexa.app/api` |

## Fonctionnalités

- Gestion de projets
- Archivage de documents
- Gestion d'équipe
- Tableau de bord avec statistiques
- Système de permissions (RBAC)
- Mode sombre/clair
- Interface responsive