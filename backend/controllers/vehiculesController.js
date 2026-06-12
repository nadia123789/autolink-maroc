const db = require('../config/db');

// GET /api/vehicules - Véhicules du client connecté
const getMesVehicules = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM vehicules WHERE client_id = ? ORDER BY date_creation DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/vehicules/:id
const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM vehicules WHERE id = ? AND client_id = ?',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Véhicule introuvable.' });

    // Historique interventions
    const [historique] = await db.query(
      `SELECT r.id, r.date_rdv, r.statut, r.prix_final, p.nom AS prestataire, pr.nom AS prestation
       FROM rendez_vous r
       JOIN prestataires p ON p.id = r.prestataire_id
       LEFT JOIN prestations pr ON pr.id = r.prestation_id
       WHERE r.vehicule_id = ? AND r.client_id = ?
       ORDER BY r.date_rdv DESC`,
      [req.params.id, req.user.id]
    );

    // Documents
    const [documents] = await db.query(
      'SELECT * FROM documents_vehicules WHERE vehicule_id = ?',
      [req.params.id]
    );

    res.json({ ...rows[0], historique, documents });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/vehicules - Ajouter un véhicule
const create = async (req, res) => {
  const { marque, modele, annee, immatriculation, couleur, kilometrage, carburant, vin,
          date_achat, date_vignette, date_assurance, date_visite_technique, notes } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO vehicules (client_id, marque, modele, annee, immatriculation, couleur, kilometrage, carburant, vin,
        date_achat, date_vignette, date_assurance, date_visite_technique, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, marque, modele, annee, immatriculation, couleur, kilometrage || 0, carburant, vin,
       date_achat, date_vignette, date_assurance, date_visite_technique, notes]
    );
    res.status(201).json({ message: 'Véhicule ajouté.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/vehicules/:id - Modifier
const update = async (req, res) => {
  const { marque, modele, annee, immatriculation, couleur, kilometrage, carburant,
          date_vignette, date_assurance, date_visite_technique, notes } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM vehicules WHERE id = ? AND client_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Véhicule introuvable.' });

    await db.query(
      `UPDATE vehicules SET marque=?, modele=?, annee=?, immatriculation=?, couleur=?, kilometrage=?, carburant=?,
        date_vignette=?, date_assurance=?, date_visite_technique=?, notes=?
       WHERE id = ?`,
      [marque, modele, annee, immatriculation, couleur, kilometrage, carburant,
       date_vignette, date_assurance, date_visite_technique, notes, req.params.id]
    );
    res.json({ message: 'Véhicule mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/vehicules/:id
const remove = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM vehicules WHERE id = ? AND client_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Véhicule introuvable.' });
    await db.query('DELETE FROM vehicules WHERE id = ?', [req.params.id]);
    res.json({ message: 'Véhicule supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getMesVehicules, getById, create, update, remove };
