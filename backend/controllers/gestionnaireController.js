const db = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// ── PROFIL ÉTABLISSEMENT ─────────────────────────────────────

// GET /api/gestionnaire/profil
const getProfil = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!rows.length) return res.json(null);
    const [photos] = await db.query('SELECT * FROM photos_prestataires WHERE prestataire_id = ? ORDER BY est_principale DESC', [rows[0].id]);
    res.json({ ...rows[0], photos });
  } catch (err) { 
    console.error('Get profil error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// PUT /api/gestionnaire/profil
const updateProfil = async (req, res) => {
  const { nom, description, categorie, telephone, email, adresse, ville, latitude, longitude, horaires } = req.body;
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) {
      // Créer si n'existe pas
      const slug = nom.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '-' + Date.now();
      await db.query(
        `INSERT INTO prestataires (gestionnaire_id,nom,slug,description,categorie,telephone,email,adresse,ville,latitude,longitude,horaires)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [req.user.id, nom, slug, description, categorie, telephone, email, adresse, ville, latitude, longitude, JSON.stringify(horaires)]
      );
    } else {
      await db.query(
        `UPDATE prestataires SET nom=?,description=?,categorie=?,telephone=?,email=?,adresse=?,ville=?,latitude=?,longitude=?,horaires=? WHERE gestionnaire_id=?`,
        [nom, description, categorie, telephone, email, adresse, ville, latitude, longitude, JSON.stringify(horaires), req.user.id]
      );
    }
    res.json({ message: 'Profil mis à jour.' });
  } catch (err) { 
    console.error('Update profil error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// ── LOGO UPLOAD ──────────────────────────────────────────────

// POST /api/gestionnaire/logo
const uploadLogo = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé.' });
    }

    const [prest] = await db.query('SELECT id, logo FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) {
      return res.status(400).json({ message: 'Aucun établissement trouvé.' });
    }

    const prestataireId = prest[0].id;
    const oldLogo = prest[0].logo;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(req.file.originalname);
    const filename = `logo_${prestataireId}_${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, req.file.buffer);

    // URL to access the logo
    const logoPath = `/uploads/logos/${filename}`;

    // Delete old logo if exists
    if (oldLogo) {
      const oldPath = path.join(__dirname, '..', oldLogo);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update database
    await db.query(
      'UPDATE prestataires SET logo = ? WHERE id = ?',
      [logoPath, prestataireId]
    );

    res.json({ 
      message: 'Logo téléchargé avec succès.', 
      logo: logoPath 
    });

  } catch (err) {
    console.error('Upload logo error:', err);
    res.status(500).json({ message: 'Erreur lors du téléchargement du logo.' });
  }
};

// DELETE /api/gestionnaire/logo
const deleteLogo = async (req, res) => {
  try {
    const [prest] = await db.query('SELECT id, logo FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) {
      return res.status(400).json({ message: 'Aucun établissement trouvé.' });
    }

    const prestataire = prest[0];
    
    if (prestataire.logo) {
      // Delete file from filesystem
      const filepath = path.join(__dirname, '..', prestataire.logo);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      
      // Remove from database
      await db.query(
        'UPDATE prestataires SET logo = NULL WHERE id = ?',
        [prestataire.id]
      );
    }

    res.json({ message: 'Logo supprimé avec succès.' });

  } catch (err) {
    console.error('Delete logo error:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression du logo.' });
  }
};

// ── CATALOGUE PRESTATIONS ────────────────────────────────────

// GET /api/gestionnaire/prestations
const getPrestations = async (req, res) => {
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) return res.json([]);
    const [rows] = await db.query('SELECT * FROM prestations WHERE prestataire_id = ? ORDER BY categorie,nom', [prest[0].id]);
    res.json(rows);
  } catch (err) { 
    console.error('Get prestations error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// POST /api/gestionnaire/prestations
const createPrestation = async (req, res) => {
  const { nom, description, categorie, prix_min, prix_max, duree_minutes } = req.body;
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) return res.status(400).json({ message: 'Aucun établissement.' });
    const [result] = await db.query(
      'INSERT INTO prestations (prestataire_id,nom,description,categorie,prix_min,prix_max,duree_minutes) VALUES (?,?,?,?,?,?,?)',
      [prest[0].id, nom, description, categorie, prix_min, prix_max, duree_minutes]
    );
    res.status(201).json({ message: 'Prestation créée.', id: result.insertId });
  } catch (err) { 
    console.error('Create prestation error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// PUT /api/gestionnaire/prestations/:id
const updatePrestation = async (req, res) => {
  const { nom, description, categorie, prix_min, prix_max, duree_minutes, est_disponible } = req.body;
  try {
    await db.query(
      `UPDATE prestations SET nom=?,description=?,categorie=?,prix_min=?,prix_max=?,duree_minutes=?,est_disponible=?
       WHERE id=? AND prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id=?)`,
      [nom, description, categorie, prix_min, prix_max, duree_minutes, est_disponible, req.params.id, req.user.id]
    );
    res.json({ message: 'Prestation mise à jour.' });
  } catch (err) { 
    console.error('Update prestation error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// DELETE /api/gestionnaire/prestations/:id
const deletePrestation = async (req, res) => {
  try {
    await db.query(
      `DELETE FROM prestations WHERE id=? AND prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id=?)`,
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Prestation supprimée.' });
  } catch (err) { 
    console.error('Delete prestation error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// ── TECHNICIENS ──────────────────────────────────────────────

// GET /api/gestionnaire/techniciens
const getTechniciens = async (req, res) => {
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) return res.json([]);
    const [rows] = await db.query(
      `SELECT t.*, u.nom, u.prenom, u.email, u.telephone, u.est_actif
       FROM techniciens t JOIN users u ON u.id = t.user_id
       WHERE t.prestataire_id = ?`,
      [prest[0].id]
    );
    res.json(rows);
  } catch (err) { 
    console.error('Get techniciens error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// POST /api/gestionnaire/techniciens - Créer compte technicien
const createTechnicien = async (req, res) => {
  const { nom, prenom, email, telephone, mot_de_passe, specialites } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [prest] = await conn.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) { await conn.rollback(); return res.status(400).json({ message: 'Aucun établissement.' }); }

    const [exist] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length) { await conn.rollback(); return res.status(409).json({ message: 'Email déjà utilisé.' }); }

    const hash = await bcrypt.hash(mot_de_passe || 'Tech2024!', 10);
    const [userRes] = await conn.query(
      'INSERT INTO users (nom,prenom,email,telephone,mot_de_passe,role) VALUES (?,?,?,?,?,?)',
      [nom, prenom, email, telephone, hash, 'technicien']
    );
    const [techRes] = await conn.query(
      'INSERT INTO techniciens (user_id,prestataire_id,specialites) VALUES (?,?,?)',
      [userRes.insertId, prest[0].id, JSON.stringify(specialites || [])]
    );
    await conn.commit();
    res.status(201).json({ message: 'Technicien créé.', user_id: userRes.insertId, tech_id: techRes.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('Create technicien error:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  } finally { conn.release(); }
};

// PUT /api/gestionnaire/techniciens/:id
const updateTechnicien = async (req, res) => {
  const { specialites, disponible } = req.body;
  try {
    await db.query(
      `UPDATE techniciens SET specialites=?, disponible=?
       WHERE id=? AND prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id=?)`,
      [JSON.stringify(specialites), disponible, req.params.id, req.user.id]
    );
    res.json({ message: 'Technicien mis à jour.' });
  } catch (err) { 
    console.error('Update technicien error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// DELETE /api/gestionnaire/techniciens/:id
const deleteTechnicien = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.user_id FROM techniciens t WHERE t.id=? AND t.prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id=?)`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(403).json({ message: 'Accès refusé.' });
    await db.query('DELETE FROM techniciens WHERE id = ?', [req.params.id]);
    await db.query('DELETE FROM users WHERE id = ?', [rows[0].user_id]);
    res.json({ message: 'Technicien supprimé.' });
  } catch (err) { 
    console.error('Delete technicien error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// ── ASSIGNER TECHNICIEN À UN RDV ─────────────────────────────

const assignerTechnicien = async (req, res) => {
  const { technicien_id } = req.body;

  try {
    console.log('RDV =', req.params.id);
    console.log('TECH =', technicien_id);

    const [ordre] = await db.query(
      `SELECT id
       FROM ordres_intervention
       WHERE rendez_vous_id=?`,
      [req.params.id]
    );

    console.log('ORDRE EXISTANT =', ordre);

    if (ordre.length) {
      console.log('UPDATE ordre');
      await db.query(
        `UPDATE ordres_intervention
         SET technicien_id=?
         WHERE rendez_vous_id=?`,
        [technicien_id, req.params.id]
      );
    } else {
      console.log('INSERT ordre');
      const [insert] = await db.query(
        `
        INSERT INTO ordres_intervention
        (
          rendez_vous_id,
          technicien_id,
          statut,
          date_debut
        )
        VALUES (?, ?, 'ouvert', NOW())
        `,
        [req.params.id, technicien_id]
      );
      console.log('INSERT RESULT =', insert);
    }

    const [check] = await db.query(
      `
      SELECT *
      FROM ordres_intervention
      WHERE rendez_vous_id=?
      `,
      [req.params.id]
    );

    console.log('ORDRE FINAL =', check);

    await db.query(
      `
      UPDATE rendez_vous
      SET technicien_id=?,
          statut='confirme'
      WHERE id=?
      `,
      [technicien_id, req.params.id]
    );

    return res.json({ message:'ok' });

  } catch(err) {
    console.error('ERREUR ASSIGN =', err);
    return res.status(500).json({
      message: err.message
    });
  }
};

// ── FICHES CLIENTS ───────────────────────────────────────────

// GET /api/gestionnaire/clients
const getClients = async (req, res) => {
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id=?', [req.user.id]);
    if (!prest.length) return res.json([]);
    const [rows] = await db.query(
      `SELECT u.id, u.nom, u.prenom, u.email, u.telephone,
              COUNT(r.id) AS total_rdv,
              SUM(r.statut='termine') AS rdv_termines,
              SUM(COALESCE(r.prix_final,0)) AS total_depense,
              MAX(r.date_rdv) AS dernier_rdv
       FROM users u
       JOIN rendez_vous r ON r.client_id = u.id
       WHERE r.prestataire_id = ?
       GROUP BY u.id ORDER BY dernier_rdv DESC`,
      [prest[0].id]
    );
    res.json(rows);
  } catch (err) { 
    console.error('Get clients error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// GET /api/gestionnaire/clients/:id - Fiche client détaillée
const getClientDetail = async (req, res) => {
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id=?', [req.user.id]);
    if (!prest.length) return res.status(403).json({ message: 'Accès refusé.' });
    const [user] = await db.query('SELECT id,nom,prenom,email,telephone,date_creation FROM users WHERE id=?', [req.params.id]);
    if (!user.length) return res.status(404).json({ message: 'Client introuvable.' });
    const [rdv] = await db.query(
      `SELECT r.*, v.marque, v.modele, v.immatriculation, pr.nom AS prestation_nom
       FROM rendez_vous r
       JOIN vehicules v ON v.id=r.vehicule_id
       LEFT JOIN prestations pr ON pr.id=r.prestation_id
       WHERE r.client_id=? AND r.prestataire_id=? ORDER BY r.date_rdv DESC`,
      [req.params.id, prest[0].id]
    );
    const [vehicules] = await db.query('SELECT * FROM vehicules WHERE client_id=?', [req.params.id]);
    res.json({ ...user[0], rdv, vehicules });
  } catch (err) { 
    console.error('Get client detail error:', err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// GET /api/gestionnaire/diagnostics
const getDiagnostics = async (req, res) => {
  try {
    const [prest] = await db.query(
      'SELECT id FROM prestataires WHERE gestionnaire_id = ?',
      [req.user.id]
    );
    if (!prest.length) return res.json([]);

    const [rows] = await db.query(
      `SELECT
        oi.id AS ordre_id,
        oi.statut AS ordre_statut,
        oi.diagnostic,
        oi.travaux_effectues,
        oi.kilometrage_entree,
        oi.kilometrage_sortie,
        oi.date_debut,
        oi.date_fin,
        r.date_rdv,
        r.description_probleme,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_tel,
        v.marque, v.modele, v.annee, v.immatriculation, v.kilometrage,
        v.carburant, v.vin,
        pr.nom AS prestation_nom,
        CONCAT(ut.prenom, ' ', ut.nom) AS technicien_nom
      FROM ordres_intervention oi
      JOIN rendez_vous r ON r.id = oi.rendez_vous_id
      JOIN users u ON u.id = r.client_id
      JOIN vehicules v ON v.id = r.vehicule_id
      LEFT JOIN prestations pr ON pr.id = r.prestation_id
      LEFT JOIN techniciens t ON t.id = oi.technicien_id
      LEFT JOIN users ut ON ut.id = t.user_id
      WHERE r.prestataire_id = ?
        AND (oi.diagnostic IS NOT NULL OR oi.travaux_effectues IS NOT NULL)
      ORDER BY r.date_rdv DESC`,
      [prest[0].id]
    );

    for (const ordre of rows) {
      const [pieces] = await db.query(
        `SELECT pu.quantite, pu.prix_unitaire, pc.nom, pc.reference
         FROM pieces_utilisees pu
         JOIN pieces pc ON pc.id = pu.piece_id
         WHERE pu.ordre_id = ?`,
        [ordre.ordre_id]
      );
      ordre.pieces_utilisees = pieces;
    }

    res.json(rows);
  } catch (err) {
    console.error('Get diagnostics error:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  getProfil, 
  updateProfil,
  uploadLogo,
  deleteLogo,
  getPrestations, 
  createPrestation, 
  updatePrestation, 
  deletePrestation,
  getTechniciens, 
  createTechnicien, 
  updateTechnicien, 
  deleteTechnicien,
  assignerTechnicien,
  getClients, 
  getClientDetail, 
  getDiagnostics,
};