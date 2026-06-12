const db = require('../config/db');

// GET /api/dashboard/gestionnaire - Stats du gestionnaire
const gestionnaire = async (req, res) => {
  try {
    // Trouver le prestataire du gestionnaire
    const [prest] = await db.query('SELECT id FROM prestataires WHERE gestionnaire_id = ?', [req.user.id]);
    if (!prest.length) return res.status(404).json({ message: 'Aucun établissement trouvé.' });
    const pid = prest[0].id;

    // Stats RDV
    const [[rdvStats]] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(statut = 'en_attente') AS en_attente,
        SUM(statut = 'confirme') AS confirmes,
        SUM(statut = 'en_cours') AS en_cours,
        SUM(statut = 'termine') AS termines,
        SUM(statut = 'annule') AS annules
       FROM rendez_vous WHERE prestataire_id = ?`,
      [pid]
    );

    // Revenus du mois
    const [[revenus]] = await db.query(
      `SELECT COALESCE(SUM(prix_final), 0) AS total_mois
       FROM rendez_vous
       WHERE prestataire_id = ? AND statut = 'termine'
         AND MONTH(date_rdv) = MONTH(NOW()) AND YEAR(date_rdv) = YEAR(NOW())`,
      [pid]
    );

    // Alertes stock
    const [alertesStock] = await db.query(
      'SELECT nom, quantite_stock, seuil_alerte FROM pieces WHERE prestataire_id = ? AND quantite_stock <= seuil_alerte',
      [pid]
    );

    // RDV aujourd'hui
    const [rdvAujourdhui] = await db.query(
      `SELECT r.id, r.date_rdv, r.statut, u.nom, u.prenom, v.marque, v.modele
       FROM rendez_vous r
       JOIN users u ON u.id = r.client_id
       JOIN vehicules v ON v.id = r.vehicule_id
       WHERE r.prestataire_id = ? AND DATE(r.date_rdv) = CURDATE()
       ORDER BY r.date_rdv ASC`,
      [pid]
    );

    // Revenus 6 derniers mois
    const [revenusMensuels] = await db.query(
      `SELECT DATE_FORMAT(date_rdv, '%Y-%m') AS mois, SUM(COALESCE(prix_final,0)) AS total
       FROM rendez_vous
       WHERE prestataire_id = ? AND statut = 'termine' AND date_rdv >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY mois ORDER BY mois ASC`,
      [pid]
    );

    res.json({ rdvStats, revenus, alertesStock, rdvAujourdhui, revenusMensuels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/dashboard/admin - Stats globales
const admin = async (req, res) => {
  try {
    const [[userStats]] = await db.query(
      `SELECT COUNT(*) AS total,
        SUM(role='client') AS clients,
        SUM(role='gestionnaire') AS gestionnaires,
        SUM(role='technicien') AS techniciens
       FROM users`
    );
    const [[prestatairesStats]] = await db.query(
      `SELECT COUNT(*) AS total, SUM(est_verifie) AS verifies, SUM(est_actif) AS actifs FROM prestataires`
    );
    const [[rdvStats]] = await db.query(
      `SELECT COUNT(*) AS total, SUM(statut='termine') AS termines FROM rendez_vous`
    );
    res.json({ userStats, prestatairesStats, rdvStats });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { gestionnaire, admin };
