const db = require('../config/db');

// Utilitaire: vérifier que la pièce appartient au prestataire du gestionnaire
const verifierAppartenance = async (pieceId, userId) => {
  const [rows] = await db.query(
    `SELECT p.id FROM pieces p
     JOIN prestataires pr ON pr.id = p.prestataire_id
     WHERE p.id = ? AND pr.gestionnaire_id = ?`,
    [pieceId, userId]
  );
  return rows.length > 0;
};

// GET /api/pieces - Liste stock
const getAll = async (req, res) => {
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) return res.json([]);

    const { q, alerte } = req.query;
    let where = ['p.prestataire_id = ?'];
    let params = [prest[0].id];
    if (q) { where.push('(p.nom LIKE ? OR p.reference LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    if (alerte === '1') { where.push('p.quantite_stock <= p.seuil_alerte'); }

    const [rows] = await db.query(
      `SELECT * FROM pieces p WHERE ${where.join(' AND ')} ORDER BY p.nom ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/pieces
const create = async (req, res) => {
  const { nom, reference, marque, categorie, quantite_stock, seuil_alerte, prix_achat, prix_vente, fournisseur } = req.body;
  try {
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) return res.status(400).json({ message: 'Aucun établissement trouvé.' });

    const [result] = await db.query(
      `INSERT INTO pieces (prestataire_id, nom, reference, marque, categorie, quantite_stock, seuil_alerte, prix_achat, prix_vente, fournisseur)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [prest[0].id, nom, reference, marque, categorie, quantite_stock || 0, seuil_alerte || 5, prix_achat, prix_vente, fournisseur]
    );
    res.status(201).json({ message: 'Pièce ajoutée.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/pieces/:id
const update = async (req, res) => {
  try {
    if (!await verifierAppartenance(req.params.id, req.user.id)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    const { nom, reference, marque, categorie, quantite_stock, seuil_alerte, prix_achat, prix_vente, fournisseur } = req.body;
    await db.query(
      `UPDATE pieces SET nom=?, reference=?, marque=?, categorie=?, quantite_stock=?, seuil_alerte=?, prix_achat=?, prix_vente=?, fournisseur=?
       WHERE id = ?`,
      [nom, reference, marque, categorie, quantite_stock, seuil_alerte, prix_achat, prix_vente, fournisseur, req.params.id]
    );
    res.json({ message: 'Pièce mise à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/pieces/:id
const remove = async (req, res) => {
  try {
    if (!await verifierAppartenance(req.params.id, req.user.id)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    await db.query('DELETE FROM pieces WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pièce supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getAll, create, update, remove };
