const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// POST /api/auth/inscription
const inscription = async (req, res) => {
  const { nom, prenom, email, telephone, mot_de_passe, role } = req.body;

  try {
    // Vérifier si email existe déjà
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hasher le mot de passe
    const hash = await bcrypt.hash(mot_de_passe, 10);

    // Rôle autorisé à l'inscription publique
    const roleAutorise = ['client', 'gestionnaire'].includes(role) ? role : 'client';

    const [result] = await db.query(
      'INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, hash, roleAutorise]
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: roleAutorise },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      user: { id: result.insertId, nom, prenom, email, role: roleAutorise }
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/auth/connexion
const connexion = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT id, nom, prenom, email, mot_de_passe, role, avatar, est_actif FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const user = rows[0];

    if (!user.est_actif) {
      return res.status(403).json({ message: 'Compte désactivé. Contactez l\'administration.' });
    }

    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { mot_de_passe: _, ...userSansPassword } = user;

    res.json({
      message: 'Connexion réussie.',
      token,
      user: userSansPassword
    });
  } catch (err) {
    console.error('Erreur connexion:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/auth/profil
const getProfil = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nom, prenom, email, telephone, role, avatar, date_creation FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { inscription, connexion, getProfil };
