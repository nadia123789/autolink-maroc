const db = require('../config/db');

// GET /api/promotions - Publiques (visiteur)
const getPubliques = async (req, res) => {
  try {
    const { prestataire_id } = req.query;
    let where = [`p.est_actif = TRUE`, `(p.date_fin IS NULL OR p.date_fin >= CURDATE())`];
    let params = [];
    if (prestataire_id) { where.push('p.prestataire_id = ?'); params.push(prestataire_id); }

    const [rows] = await db.query(
      `SELECT p.*, pr.nom AS prestataire_nom, pr.ville
       FROM promotions p
       JOIN prestataires pr ON pr.id = p.prestataire_id
       WHERE ${where.join(' AND ')}
       ORDER BY p.id DESC`,
      params
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

// GET /api/promotions/mes - Gestionnaire: ses promotions
const getMes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.* FROM promotions p
       JOIN prestataires pr ON pr.id = p.prestataire_id
       WHERE pr.gestionnaire_id = ?
      ORDER BY p.id DESC`,
      [req.user.id]
    );

    res.json(rows);

  } catch (err) {
    console.error("ERREUR GETMES :", err);
    res.status(500).json({
      message: err.message
    });
  }
};
// POST /api/promotions/verifier - Vérifier un code promo (client)
const verifierCode = async (req, res) => {
  const { code, prestataire_id } = req.body;
  try {
    const [rows] = await db.query(
      `SELECT * FROM promotions
       WHERE code = ? AND prestataire_id = ? AND est_actif = TRUE
         AND (date_debut IS NULL OR date_debut <= CURDATE())
         AND (date_fin IS NULL OR date_fin >= CURDATE())
         AND (utilisations_max IS NULL OR utilisations_actuelles < utilisations_max)`,
      [code, prestataire_id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Code promo invalide ou expiré.' });
    res.json({ valide: true, promotion: rows[0] });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

// POST /api/promotions - Créer (gestionnaire)
const create = async (req, res) => {
  const { nom, code, description, type, valeur, min_commande, date_debut, date_fin, utilisations_max } = req.body;
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) return res.status(400).json({ message: 'Aucun établissement.' });

    // Vérifier unicité du code
    if (code) {
      const [exist] = await db.query('SELECT id FROM promotions WHERE code = ?', [code]);
      if (exist.length) return res.status(409).json({ message: 'Ce code promo existe déjà.' });
    }

    const [result] = await db.query(
      `INSERT INTO promotions (prestataire_id, nom, code, description, type, valeur, min_commande, date_debut, date_fin, utilisations_max)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [prest[0].id, nom, code?.toUpperCase(), description, type, valeur, min_commande || 0, date_debut, date_fin, utilisations_max]
    );
    res.status(201).json({ message: 'Promotion créée.', id: result.insertId });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

// PUT /api/promotions/:id
const update = async (req, res) => {
  const { nom, description, type, valeur, min_commande, date_debut, date_fin, utilisations_max, est_actif } = req.body;
  try {
    await db.query(
      `UPDATE promotions SET nom=?, description=?, type=?, valeur=?, min_commande=?,
        date_debut=?, date_fin=?, utilisations_max=?, est_actif=?
       WHERE id = ? AND prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id = ?)`,
      [nom, description, type, valeur, min_commande, date_debut, date_fin, utilisations_max, est_actif, req.params.id, req.user.id]
    );
    res.json({ message: 'Promotion mise à jour.' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

// DELETE /api/promotions/:id
const remove = async (req, res) => {
  try {
    await db.query(
      `DELETE FROM promotions WHERE id = ? AND prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id = ?)`,
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Promotion supprimée.' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

module.exports = { getPubliques, getMes, verifierCode, create, update, remove };
