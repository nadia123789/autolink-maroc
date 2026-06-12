# AutoLink Maroc — Plateforme Automobile Complète

> Solution SaaS complète pour la gestion des prestataires automobile au Maroc  
> Stack : **React 18** · **Node.js/Express** · **MySQL (XAMPP)** · **IA Groq**

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
3. Importer →autolink_maroc.sql → Exécuter
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
