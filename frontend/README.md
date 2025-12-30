# Frontend - Plateforme de Gestion des Stages

Application React pour la gestion des stages, connectée à l'API Django backend.

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── Navbar.js       # Barre de navigation
│   └── ProtectedRoute.js # Route protégée par authentification
├── context/            # Contextes React
│   └── AuthContext.js  # Gestion de l'authentification
├── pages/              # Pages de l'application
│   ├── Home.js         # Page d'accueil
│   ├── Login.js        # Page de connexion
│   ├── Register.js     # Page d'inscription
│   ├── DashboardStagiaire.js    # Dashboard stagiaire
│   ├── DashboardEntreprise.js   # Dashboard entreprise
│   ├── DashboardAdmin.js        # Dashboard admin
│   ├── OffresList.js   # Liste des offres
│   ├── OffreDetail.js  # Détails d'une offre
│   ├── OffreCreate.js  # Création d'une offre
│   ├── CVManagement.js # Gestion du CV
│   └── CandidaturesList.js # Liste des candidatures
├── services/           # Services API
│   └── api.js          # Configuration axios et endpoints API
└── App.js              # Composant principal avec routing

```

## Fonctionnalités

### Pour les Stagiaires
- Inscription et connexion
- Dépôt et gestion de CV (PDF uniquement, max 5MB)
- Consultation des offres de stage validées
- Postulation aux offres
- Suivi des candidatures

### Pour les Entreprises
- Inscription et connexion
- Publication d'offres de stage
- Consultation des CV des stagiaires
- Téléchargement des CV
- Gestion des candidatures (accepter/refuser)

### Pour les Administrateurs
- Gestion des utilisateurs
- Validation/refus des offres
- Supervision de la plateforme

## Configuration

L'URL de l'API backend est configurée dans `src/services/api.js` :
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

Modifiez cette valeur si votre backend tourne sur un autre port ou domaine.

## Technologies utilisées

- **React 19** - Bibliothèque UI
- **React Router** - Routing
- **Material-UI (MUI)** - Composants UI
- **Axios** - Client HTTP
- **JWT** - Authentification

## Scripts disponibles

- `npm start` - Démarrer le serveur de développement
- `npm build` - Construire l'application pour la production
- `npm test` - Lancer les tests
- `npm run analyze` - Analyser la taille du bundle

## Notes

- Assurez-vous que le backend Django est en cours d'exécution sur `http://localhost:8000`
- Les tokens JWT sont stockés dans le localStorage
- L'application est responsive et fonctionne sur mobile, tablette et desktop
