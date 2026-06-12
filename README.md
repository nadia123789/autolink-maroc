# 🚗 AutoLink Maroc — Plateforme Automobile Complète

> Solution SaaS complète pour la gestion des prestataires automobile au Maroc  
> Stack : **React 18** · **Node.js/Express** · **MySQL (XAMPP)** · **IA Claude**

---

## 📁 Structure du projet

```
autolink-maroc/
├── database/
│   └── autolink_maroc.sql       ← Base de données complète (16+ tables)
├── backend/                     ← API REST Node.js/Express
│   ├── server.js                ← Point d'entrée
│   ├── .env.example             ← Variables d'environnement
│   ├── config/db.js             ← Connexion MySQL pool
│   ├── middleware/auth.js       ← JWT + rôles
│   ├── controllers/             ← 15 controllers
│   └── routes/                  ← 15 routes API
└── frontend/                    ← Application React
    └── src/
        ├── App.jsx              ← Routeur principal (30 routes)
        ├── index.css            ← Design system complet
        ├── components/          ← Navbar, Sidebar, Chatbot IA
        ├── context/             ← AuthContext global
        ├── utils/api.js         ← Axios + JWT auto
        └── pages/
            ├── (publiques)      ← Home, Prestataires, Connexion, Inscription
            ├── client/          ← 8 pages client
            ├── gestionnaire/    ← 8 pages gestionnaire
            ├── technicien/      ← 2 pages technicien
            └── admin/           ← 3 pages admin
```

---

## ⚙️ Installation rapide

### 1. Base de données (XAMPP)
```
1. Démarrez XAMPP → Apache + MySQL
2. Ouvrez phpMyAdmin : http://localhost/phpmyadmin
3. Importer → database/autolink_maroc.sql → Exécuter
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Éditez .env si besoin (mot de passe MySQL, clé Anthropic)
npm run dev        # développement (nodemon)
npm start          # production
```
→ API : **http://localhost:5000**

### 3. Frontend
```bash
cd frontend
npm install
npm start
```
→ App : **http://localhost:3000**

---

## 🔑 Comptes de test

Créez vos comptes via la page `/inscription` de l'application.

| Rôle         | Accès |
|---|---|
| Client       | `/client` — véhicules, RDV, devis, suivi, fidélité |
| Gestionnaire | `/gestionnaire` — profil, RDV, techniciens, stock, devis, promo |
| Technicien   | `/technicien` — interventions, guides |
| Admin        | `/admin` — utilisateurs, prestataires, stats |

> Pour créer un compte **Admin** : inscrivez-vous puis changez le rôle via phpMyAdmin : `UPDATE users SET role='admin' WHERE email='votre@email.com';`

---

## 🌐 Toutes les pages

### Pages publiques (sans compte)
| URL | Description |
|---|---|
| `/` | Accueil — hero, catégories, stats, CTA |
| `/prestataires` | Liste filtrée et paginée (catégorie, ville, recherche) |
| `/prestataires/:id` | Fiche détaillée — prestations, avis, photos |
| `/connexion` | Connexion JWT |
| `/inscription` | Inscription client ou gestionnaire |

### Espace Client
| URL | Description |
|---|---|
| `/client` | Dashboard — stats, véhicules, RDV récents, alertes |
| `/client/vehicules` | Gestion véhicules — CRUD, alertes expiration |
| `/client/vehicules/:id/historique` | Historique complet d'un véhicule |
| `/client/rdv` | Mes rendez-vous — filtres par statut |
| `/client/rdv/nouveau` | Prise de RDV en 3 étapes |
| `/client/suivi` | Suivi temps réel — barre de progression |
| `/client/devis` | Mes devis — valider/refuser |
| `/client/paiement` | Paiements + programme fidélité |
| `/client/notifications` | Toutes les notifications |

### Espace Gestionnaire
| URL | Description |
|---|---|
| `/gestionnaire` | Dashboard — KPIs, RDV du jour, revenus 6 mois |
| `/gestionnaire/profil` | Profil établissement + horaires + catalogue |
| `/gestionnaire/rdv` | Gestion RDV — changement statut |
| `/gestionnaire/techniciens` | Équipe — créer, assigner aux RDV |
| `/gestionnaire/clients` | Fiches clients — historique, dépenses |
| `/gestionnaire/devis` | Devis & factures — créer, envoyer, facturer |
| `/gestionnaire/stock` | Stock pièces — alertes seuil |
| `/gestionnaire/promotions` | Promotions & codes promo |

### Espace Technicien
| URL | Description |
|---|---|
| `/technicien` | Interventions — statuts, pièces, anomalies |
| `/technicien/guides` | 5 guides de réparation détaillés |

### Espace Admin
| URL | Description |
|---|---|
| `/admin` | Stats globales, graphique inscriptions |
| `/admin/utilisateurs` | CRUD utilisateurs, rôles, activer/désactiver |
| `/admin/prestataires` | Vérifier, activer/désactiver les établissements |

---

## 📡 API REST complète

### Auth
```
POST /api/auth/inscription
POST /api/auth/connexion
GET  /api/auth/profil              [JWT]
```

### Prestataires (public)
```
GET  /api/prestataires             ?categorie=&ville=&q=&page=&limit=
GET  /api/prestataires/:id
POST /api/prestataires             [gestionnaire]
PUT  /api/prestataires/:id         [gestionnaire]
```

### Véhicules
```
GET    /api/vehicules              [client]
GET    /api/vehicules/:id
POST   /api/vehicules
PUT    /api/vehicules/:id
DELETE /api/vehicules/:id
```

### Rendez-vous
```
GET    /api/rdv
GET    /api/rdv/:id
POST   /api/rdv                    [client]
PUT    /api/rdv/:id/statut         [gestionnaire/technicien]
DELETE /api/rdv/:id                [client — annulation]
```

### Devis
```
GET  /api/devis
GET  /api/devis/:id
POST /api/devis                    [gestionnaire]
PUT  /api/devis/:id/envoyer        [gestionnaire]
PUT  /api/devis/:id/repondre       [client — accepte/refuse]
POST /api/devis/:id/facturer       [gestionnaire]
```

### Gestionnaire
```
GET /PUT /api/gestionnaire/profil
GET/POST/PUT/DELETE /api/gestionnaire/prestations/:id
GET/POST/PUT/DELETE /api/gestionnaire/techniciens/:id
PUT /api/gestionnaire/rdv/:id/assigner
GET /api/gestionnaire/clients
GET /api/gestionnaire/clients/:id
```

### Technicien
```
GET  /api/technicien
PUT  /api/technicien/:id/statut
POST /api/technicien/:id/pieces
GET  /api/technicien/:id/pieces-disponibles
POST /api/technicien/:id/anomalie
```

### Promotions
```
GET  /api/promotions               [public]
POST /api/promotions/verifier      [client]
GET  /api/promotions/mes           [gestionnaire]
POST/PUT/DELETE /api/promotions/:id [gestionnaire]
```

### Avis
```
GET  /api/avis/prestataire/:id     [public]
POST /api/avis                     [client]
POST /api/avis/:id/reponse         [gestionnaire]
```

### Notifications
```
GET /api/notifications             [JWT]
PUT /api/notifications/lire-tout
PUT /api/notifications/:id/lire
DELETE /api/notifications/:id
```

### Dashboard
```
GET /api/dashboard/gestionnaire    [gestionnaire]
GET /api/dashboard/admin           [admin]
```

### Stock
```
GET/POST/PUT/DELETE /api/pieces    [gestionnaire]
```

### Chatbot IA
```
GET  /api/chatbot/suggestions      [public]
POST /api/chatbot                  [public/JWT enrichi]
```

### Admin
```
GET  /api/admin/stats
GET  /api/admin/users              ?q=&role=&page=
POST /api/admin/users
PUT  /api/admin/users/:id/statut
PUT  /api/admin/users/:id/role
DELETE /api/admin/users/:id
GET  /api/admin/prestataires
PUT  /api/admin/prestataires/:id/verifier
PUT  /api/admin/prestataires/:id/activer
```

---

## 🏗️ Modules CDC couverts

| Module | Statut | Description |
|---|---|---|
| M01 Core & Auth | ✅ | JWT, rôles, permissions |
| M02 Annuaire Prestataires | ✅ | Recherche, filtres, fiche détaillée |
| M03 Gestion Véhicules | ✅ | CRUD, historique, alertes échéances |
| M04 Prise de Rendez-vous | ✅ | Calendrier 24h/24, rappels |
| M05 Ordres d'Intervention | ✅ | Cycle complet, pièces, anomalies |
| M06 Gestion Clients CRM | ✅ | Fiches clients, historique, segmentation |
| M07 Devis & Facturation | ✅ | Devis auto, validation en ligne, TVA |
| M08 Paiement | ✅ | Espèces, virement, CMI simulé |
| M09 Marketing & Fidélité | ✅ | Codes promo, points, campagnes |
| M10 Chatbot IA | ✅ | Claude API, suggestions, historique |
| M11 Dashboard & Analytics | ✅ | Stats temps réel, revenus, KPIs |
| M12 Administration Système | ✅ | Panel admin complet |
| M13 Avis & Commentaires | ✅ | Notes, avis, réponses prestataire |

---

## 🛠️ Technologies

| Couche | Technologies |
|---|---|
| Frontend | React 18, React Router v6, Axios, CSS Variables |
| Backend | Node.js, Express 4, mysql2, bcryptjs, JWT |
| Base de données | MySQL 8 via XAMPP |
| IA | Anthropic Claude API (claude-opus-4-5) |
| Design | Syne + DM Sans (Google Fonts), thème dark/gold |

---

## 🔒 Sécurité
- Mots de passe hashés bcrypt (coût 10)
- Tokens JWT signés (7 jours)
- Middleware rôles sur toutes les routes protégées
- Validation appartenance des données (client ≠ autre client)
- CORS configuré sur domaine frontend uniquement

---

*AutoLink Maroc © 2024 — Tous droits réservés*
