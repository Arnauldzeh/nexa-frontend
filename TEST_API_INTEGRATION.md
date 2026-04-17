# 🧪 Test de l'intégration API

## Prérequis

1. Backend démarré sur `http://localhost:4000`
2. Frontend démarré sur `http://localhost:3000`
3. MongoDB en cours d'exécution

## 🚀 Démarrage

### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## ✅ Tests à effectuer

### 1. Test de connexion (Login)

**URL**: http://localhost:3000/login

**Credentials**:
```
Login: admin
Password: admin123
```

**Vérifications**:
- [ ] Le login fonctionne
- [ ] Le token JWT est stocké dans sessionStorage
- [ ] Redirection vers `/dashboard`
- [ ] Les données utilisateur sont en anglais (`firstName`, `lastName`, etc.)

**Console Browser**:
```javascript
// Vérifier le token
sessionStorage.getItem('jwt_token')

// Vérifier les données user (si stockées)
JSON.parse(sessionStorage.getItem('user'))
```

---

### 2. Test de la page Users

**URL**: http://localhost:3000/users

**Vérifications**:
- [ ] La liste des utilisateurs s'affiche
- [ ] Les colonnes affichent les bonnes données:
  - Prénom (firstName)
  - Nom (lastName)
  - Email
  - Téléphone (phone)
  - Fonction (position)
  - Département (department)
  - Statut (active/inactive)
- [ ] Le bouton "Ajouter" ouvre le formulaire
- [ ] La création d'utilisateur fonctionne
- [ ] La modification fonctionne
- [ ] La suppression fonctionne

**Test de création**:
```
Prénom: Test
Nom: User
Email: test@edc.cm
Téléphone: +237 6 99 99 99 99
Fonction: Testeur
Département: IT
Login: testuser
Password: test123
Rôle: user
Statut: active
```

---

### 3. Test de la page Projects

**URL**: http://localhost:3000/projects

**Vérifications**:
- [ ] La liste des projets s'affiche
- [ ] Les données sont correctes:
  - Code projet
  - Nom
  - Budget formaté
  - Localisation (région, ville)
  - Progression
- [ ] Les composants et sous-composants s'affichent
- [ ] Pas d'erreur dans la console

---

### 4. Test de la page Alerts

**URL**: http://localhost:3000/alerts

**Vérifications**:
- [ ] Les alertes s'affichent
- [ ] Les filtres fonctionnent (severity, read status)
- [ ] Marquer comme lu fonctionne
- [ ] Le compteur d'alertes non lues est correct

---

### 5. Test du Dashboard

**URL**: http://localhost:3000/dashboard

**Vérifications**:
- [ ] Les statistiques s'affichent:
  - Nombre total de projets
  - Progression moyenne
  - Nombre d'alertes non lues
- [ ] Les graphiques se chargent
- [ ] Pas d'erreur dans la console

---

## 🔍 Vérification des transformations

### Dans la console du navigateur

```javascript
// Test de l'API directement
const response = await fetch('http://localhost:4000/api/users', {
  headers: {
    'Authorization': `Bearer ${sessionStorage.getItem('jwt_token')}`
  }
});
const data = await response.json();
console.log('Backend response:', data);
// Devrait montrer: prenom, nom, telephone, fonction, departement, statut

// Maintenant via le service frontend
import { userService } from '@/services/api';
const users = await userService.getAll();
console.log('Frontend data:', users);
// Devrait montrer: firstName, lastName, phone, position, department, status
```

---

## 🐛 Debugging

### Erreur: "Network Error"
**Cause**: Backend non démarré ou CORS mal configuré

**Solution**:
```bash
# Vérifier que le backend tourne
curl http://localhost:4000/api/health

# Vérifier CORS dans backend/.env
CORS_ORIGIN=http://localhost:3000
```

---

### Erreur: "401 Unauthorized"
**Cause**: Token invalide ou expiré

**Solution**:
```javascript
// Supprimer le token et se reconnecter
sessionStorage.removeItem('jwt_token');
// Aller sur /login
```

---

### Erreur: "Cannot read property 'prenom'"
**Cause**: Le composant essaie d'accéder aux noms français

**Solution**: Utiliser les noms anglais (`firstName`, `lastName`, etc.)

---

### Erreur: "axios is not defined"
**Cause**: axios non installé

**Solution**:
```bash
cd frontend
npm install axios
```

---

## 📊 Résultats attendus

### ✅ Succès
- Toutes les pages se chargent sans erreur
- Les données s'affichent correctement
- Les transformations sont invisibles pour l'utilisateur
- CRUD fonctionne sur tous les modules

### ❌ Échec
- Erreurs 500 dans la console
- Données undefined ou null
- Champs vides dans les formulaires
- Erreurs TypeScript

---

## 🎯 Checklist finale

- [ ] Login fonctionne
- [ ] Users CRUD fonctionne
- [ ] Projects s'affichent
- [ ] Alerts s'affichent
- [ ] Dashboard affiche les stats
- [ ] Pas d'erreur dans la console browser
- [ ] Pas d'erreur dans la console backend
- [ ] Les transformations sont transparentes
- [ ] Les types TypeScript sont corrects

---

**Si tous les tests passent**: ✅ L'intégration est complète et fonctionnelle!

**Si des tests échouent**: Consulter la section Debugging ci-dessus.
