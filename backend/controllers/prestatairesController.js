const db = require('../config/db');

// GET /api/prestataires - Liste avec filtres
const getAll = async (req, res) => {
  try {
    const { categorie, ville, q, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let where = ['p.est_actif = TRUE'];
    let params = [];

    if (categorie) { where.push('p.categorie = ?'); params.push(categorie); }
    if (ville)      { where.push('p.ville LIKE ?'); params.push(`%${ville}%`); }
    if (q)          { where.push('(p.nom LIKE ? OR p.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await db.query(
      `SELECT p.id, p.nom, p.slug, p.categorie, p.ville, p.adresse, p.telephone,
              CAST(p.note_moyenne AS DECIMAL(3,2)) AS note_moyenne, p.total_avis, p.logo, p.est_verifie, p.latitude, p.longitude,
              u.nom AS gestionnaire_nom
       FROM prestataires p
       JOIN users u ON u.id = p.gestionnaire_id
       ${whereClause}
       ORDER BY p.note_moyenne DESC, p.est_verifie DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM prestataires p ${whereClause}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/prestataires/:id
const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.nom AS gestionnaire_nom, u.email AS gestionnaire_email
       FROM prestataires p
       JOIN users u ON u.id = p.gestionnaire_id
       WHERE p.id = ? AND p.est_actif = TRUE`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Prestataire introuvable.' });

    const prestataire = rows[0];

    // Prestations
    const [prestations] = await db.query(
      'SELECT * FROM prestations WHERE prestataire_id = ? AND est_disponible = TRUE',
      [prestataire.id]
    );

    // Avis
    const [avis] = await db.query(
      `SELECT a.*, u.nom, u.prenom, u.avatar
       FROM avis a JOIN users u ON u.id = a.client_id
       WHERE a.prestataire_id = ? AND a.est_publie = TRUE
       ORDER BY a.date_creation DESC LIMIT 10`,
      [prestataire.id]
    );

    // Photos
    const [photos] = await db.query(
      'SELECT * FROM photos_prestataires WHERE prestataire_id = ? ORDER BY est_principale DESC',
      [prestataire.id]
    );

    res.json({ ...prestataire, prestations, avis, photos });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/prestataires - Créer (gestionnaire authentifié)
const create = async (req, res) => {
  const { nom, description, categorie, telephone, email, adresse, ville, latitude, longitude, horaires } = req.body;
  try {
    const slug = nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const [result] = await db.query(
      `INSERT INTO prestataires (gestionnaire_id, nom, slug, description, categorie, telephone, email, adresse, ville, latitude, longitude, horaires)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, nom, slug, description, categorie, telephone, email, adresse, ville, latitude, longitude, JSON.stringify(horaires)]
    );
    res.status(201).json({ message: 'Prestataire créé.', id: result.insertId, slug });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/prestataires/:id - Modifier
const update = async (req, res) => {
  const { nom, description, categorie, telephone, email, adresse, ville, latitude, longitude, horaires } = req.body;
  try {
    // Vérifier que c'est le bon gestionnaire (ou admin)
    const [rows] = await db.query('SELECT gestionnaire_id FROM prestataires WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Prestataire introuvable.' });
    if (rows[0].gestionnaire_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    await db.query(
      `UPDATE prestataires SET nom=?, description=?, categorie=?, telephone=?, email=?, adresse=?, ville=?, latitude=?, longitude=?, horaires=?
       WHERE id = ?`,
      [nom, description, categorie, telephone, email, adresse, ville, latitude, longitude, JSON.stringify(horaires), req.params.id]
    );
    res.json({ message: 'Prestataire mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getAll, getById, create, update };
