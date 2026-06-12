const db = require('../config/db');

// GET /api/notifications - Mes notifications
const getMes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY date_creation DESC LIMIT 50`,
      [req.user.id]
    );
    const non_lues = rows.filter(n => !n.est_lue).length;
    res.json({ notifications: rows, non_lues });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

// PUT /api/notifications/lire-tout
const lireTout = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET est_lue = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Notifications marquées comme lues.' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

// PUT /api/notifications/:id/lire
const lireUne = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET est_lue = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'OK.' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

// DELETE /api/notifications/:id
const supprimer = async (req, res) => {
  try {
    await db.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Supprimée.' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

module.exports = { getMes, lireTout, lireUne, supprimer };
