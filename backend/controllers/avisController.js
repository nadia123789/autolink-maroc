const db = require('../config/db');

// GET /api/avis/prestataire/:id
const getByPrestataire = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.note, a.commentaire, a.reponse_prestataire, a.date_creation,
              u.nom, u.prenom, u.avatar
       FROM avis a JOIN users u ON u.id = a.client_id
       WHERE a.prestataire_id = ? AND a.est_publie = TRUE
       ORDER BY a.date_creation DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/avis - Déposer un avis
const create = async (req, res) => {
  const { prestataire_id, rendez_vous_id, note, commentaire } = req.body;
  if (note < 1 || note > 5) return res.status(400).json({ message: 'Note invalide (1-5).' });
  try {
    // Vérifier que le client a bien eu un RDV terminé avec ce prestataire
    const [rdv] = await db.query(
      'SELECT id FROM rendez_vous WHERE id = ? AND client_id = ? AND prestataire_id = ? AND statut = "termine"',
      [rendez_vous_id, req.user.id, prestataire_id]
    );
    if (!rdv.length) return res.status(400).json({ message: 'Vous devez avoir complété un rendez-vous pour laisser un avis.' });

    // Un seul avis par rendez-vous
    const [existing] = await db.query('SELECT id FROM avis WHERE rendez_vous_id = ? AND client_id = ?', [rendez_vous_id, req.user.id]);
    if (existing.length) return res.status(409).json({ message: 'Vous avez déjà laissé un avis pour ce rendez-vous.' });

    await db.query(
      'INSERT INTO avis (client_id, prestataire_id, rendez_vous_id, note, commentaire) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, prestataire_id, rendez_vous_id, note, commentaire]
    );
    res.status(201).json({ message: 'Avis publié avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/avis/:id/reponse - Réponse du prestataire
const repondre = async (req, res) => {
  const { reponse } = req.body;
  try {
    await db.query(
      `UPDATE avis SET reponse_prestataire = ?
       WHERE id = ? AND prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id = ?)`,
      [reponse, req.params.id, req.user.id]
    );
    res.json({ message: 'Réponse publiée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getByPrestataire, create, repondre };
