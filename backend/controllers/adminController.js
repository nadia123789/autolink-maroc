const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/admin/stats - CORRIGÉ
const getStats = async (req, res) => {
  try {
    // Stats utilisateurs
    const [usersResult] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(role = 'client') as clients,
        SUM(role = 'gestionnaire') as gestionnaires,
        SUM(role = 'technicien') as techniciens,
        SUM(role = 'admin') as admins,
        SUM(est_actif = 0) as inactifs
      FROM users
    `);
    const users = usersResult[0] || { total: 0, clients: 0, gestionnaires: 0, techniciens: 0, admins: 0, inactifs: 0 };

    // Stats prestataires
    const [prestatairesResult] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(est_verifie = 1) as verifies,
        SUM(est_actif = 1) as actifs
      FROM prestataires
    `);
    const prestataires = prestatairesResult[0] || { total: 0, verifies: 0, actifs: 0 };

    // Stats RDV
    const [rdvResult] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(statut = 'termine') as termines,
        SUM(statut = 'annule') as annules
      FROM rendez_vous
    `);
    const rdv = rdvResult[0] || { total: 0, termines: 0, annules: 0 };

    // Stats revenus (supprimé si tu ne veux plus l'afficher)
    const [revenusResult] = await db.query(`
      SELECT COALESCE(SUM(total_ttc), 0) as total 
      FROM factures 
      WHERE statut = 'payee'
    `);
    const revenus = revenusResult[0] || { total: 0 };

    // Inscriptions par mois (6 derniers mois)
    const [parMois] = await db.query(`
      SELECT 
        DATE_FORMAT(date_creation, '%Y-%m') as mois,
        DATE_FORMAT(date_creation, '%m') as mois_num,
        COUNT(*) as total 
      FROM users 
      WHERE date_creation >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
      GROUP BY DATE_FORMAT(date_creation, '%Y-%m'), DATE_FORMAT(date_creation, '%m')
      ORDER BY mois ASC
    `);

    // Formater les mois
    const moisFormates = parMois.map(item => ({
      ...item,
      mois: item.mois
    }));

    res.json({ 
      users, 
      prestataires, 
      rdv, 
      revenus, 
      parMois: moisFormates 
    });
  } catch (err) { 
    console.error('Erreur getStats:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { q, role, page = 1, limit = 20 } = req.query;
    let where = []; 
    let params = [];
    
    if (q) { 
      where.push('(nom LIKE ? OR prenom LIKE ? OR email LIKE ?)'); 
      params.push(`%${q}%`, `%${q}%`, `%${q}%`); 
    }
    if (role && role !== '') { 
      where.push('role = ?'); 
      params.push(role); 
    }
    
    const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const [rows] = await db.query(`
      SELECT id, nom, prenom, email, telephone, role, est_actif, date_creation 
      FROM users 
      ${w} 
      ORDER BY date_creation DESC 
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const [totalResult] = await db.query(`SELECT COUNT(*) as total FROM users ${w}`, params);
    const total = totalResult[0]?.total || 0;
    
    res.json({ data: rows, total });
  } catch (err) { 
    console.error('Erreur getUsers:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// PUT /api/admin/users/:id/statut
const toggleUserStatut = async (req, res) => {
  try {
    await db.query('UPDATE users SET est_actif = NOT est_actif WHERE id = ?', [req.params.id]);
    res.json({ message: 'Statut modifié.' });
  } catch (err) { 
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// PUT /api/admin/users/:id/role
const changeRole = async (req, res) => {
  const { role } = req.body;
  const rolesValides = ['client', 'gestionnaire', 'technicien', 'admin'];
  if (!rolesValides.includes(role)) return res.status(400).json({ message: 'Rôle invalide.' });
  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'Rôle mis à jour.' });
  } catch (err) { 
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'Impossible de supprimer votre propre compte.' });
  }
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) { 
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// GET /api/admin/prestataires - CORRIGÉ
const getPrestataires = async (req, res) => {
  try {
    const { q, verifie, page = 1, limit = 20 } = req.query;
    let where = []; 
    let params = [];
    
    if (q && q !== '') { 
      where.push('(p.nom LIKE ? OR p.ville LIKE ?)'); 
      params.push(`%${q}%`, `%${q}%`); 
    }
    if (verifie !== undefined && verifie !== '') { 
      where.push('p.est_verifie = ?'); 
      params.push(verifie === '1' ? 1 : 0); 
    }
    
    const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        u.nom as gest_nom, 
        u.prenom as gest_prenom, 
        u.email as gest_email
      FROM prestataires p 
      LEFT JOIN users u ON u.id = p.gestionnaire_id
      ${w} 
      ORDER BY p.date_creation DESC 
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const [totalResult] = await db.query(`SELECT COUNT(*) as total FROM prestataires p ${w}`, params);
    const total = totalResult[0]?.total || 0;
    
    res.json({ data: rows, total });
  } catch (err) { 
    console.error('Erreur getPrestataires:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// PUT /api/admin/prestataires/:id/verifier
const verifierPrestataire = async (req, res) => {
  try {
    await db.query('UPDATE prestataires SET est_verifie = NOT est_verifie WHERE id = ?', [req.params.id]);
    res.json({ message: 'Statut de vérification modifié.' });
  } catch (err) { 
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// PUT /api/admin/prestataires/:id/activer
const togglePrestataire = async (req, res) => {
  try {
    await db.query('UPDATE prestataires SET est_actif = NOT est_actif WHERE id = ?', [req.params.id]);
    res.json({ message: 'Statut du prestataire modifié.' });
  } catch (err) { 
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// POST /api/admin/users - Créer un compte (admin)
const createUser = async (req, res) => {
  const { nom, prenom, email, telephone, mot_de_passe, role } = req.body;
  try {
    const [exist] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length) return res.status(409).json({ message: 'Email déjà utilisé.' });
    
    const hash = await bcrypt.hash(mot_de_passe || 'AutoLink2024!', 10);
    const [result] = await db.query(
      'INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, hash, role || 'client']
    );
    res.status(201).json({ message: 'Utilisateur créé.', id: result.insertId });
  } catch (err) { 
    console.error('Erreur createUser:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

module.exports = { 
  getStats, 
  getUsers, 
  toggleUserStatut, 
  changeRole, 
  deleteUser, 
  getPrestataires, 
  verifierPrestataire, 
  togglePrestataire, 
  createUser 
};