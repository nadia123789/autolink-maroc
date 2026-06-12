const db = require('../config/db');

// GET /api/technicien/interventions - Ordres assignés au technicien connecté
const getMesInterventions = async (req, res) => {
  try {
    console.log('=== DEBUG getMesInterventions ===');
    console.log('req.user:', req.user);
    
    // Trouver le profil technicien de l'user connecté
    const [tech] = await db.query(
      'SELECT id FROM techniciens WHERE user_id = ?',
      [req.user.id]
    );
    
    console.log('Technicien trouvé:', tech);
    
    if (!tech.length) {
      console.log('Aucun technicien trouvé pour user_id:', req.user.id);
      return res.status(404).json({ message: 'Profil technicien introuvable.' });
    }
    
    const techId = tech[0].id;
    console.log('TechId:', techId);
    
    const [rows] = await db.query(
      `SELECT
        oi.id AS ordre_id,
        oi.statut AS ordre_statut,
        oi.diagnostic,
        oi.travaux_effectues,
        oi.kilometrage_entree,
        oi.date_debut,
        oi.date_fin,
        r.id AS rdv_id,
        r.date_rdv,
        r.statut AS rdv_statut,
        r.description_probleme,
        r.prix_estime,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_tel,
        v.marque, v.modele, v.annee, v.immatriculation, v.couleur, v.kilometrage,
        v.carburant, v.vin,
        pr.nom AS prestation_nom,
        p.nom AS prestataire_nom
      FROM ordres_intervention oi
      JOIN rendez_vous r ON r.id = oi.rendez_vous_id
      JOIN users u ON u.id = r.client_id
      JOIN vehicules v ON v.id = r.vehicule_id
      LEFT JOIN prestations pr ON pr.id = r.prestation_id
      JOIN prestataires p ON p.id = r.prestataire_id
      WHERE oi.technicien_id = ?
      ORDER BY
        FIELD(oi.statut, 'en_cours', 'ouvert', 'en_attente_pieces', 'termine'),
        r.date_rdv ASC`,
      [techId]
    );
    
    console.log(`Nombre d'interventions trouvées: ${rows.length}`);
    
    // Pièces utilisées par ordre
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
    
    console.log('Données renvoyées avec succès');
    res.json(rows);
  } catch (err) {
    console.error('Erreur dans getMesInterventions:', err);
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// PUT /api/technicien/interventions/:id/statut
const updateStatut = async (req, res) => {
  const { statut, diagnostic, travaux_effectues, kilometrage_sortie } = req.body;
  const statutsValides = ['ouvert', 'en_cours', 'en_attente_pieces', 'termine'];
  if (!statutsValides.includes(statut)) return res.status(400).json({ message: 'Statut invalide.' });

  try {
    const [tech] = await db.query('SELECT id FROM techniciens WHERE user_id = ?', [req.user.id]);
    if (!tech.length) return res.status(403).json({ message: 'Accès refusé.' });

    const updates = { statut };
    if (diagnostic) updates.diagnostic = diagnostic;
    if (travaux_effectues) updates.travaux_effectues = travaux_effectues;
    if (kilometrage_sortie) updates.kilometrage_sortie = kilometrage_sortie;
    if (statut === 'en_cours' && !req.body.date_debut) updates.date_debut = new Date();
    if (statut === 'termine') updates.date_fin = new Date();

    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id, tech[0].id];

    await db.query(
      `UPDATE ordres_intervention SET ${fields} WHERE id = ? AND technicien_id = ?`,
      values
    );

    // Si terminé → mettre à jour le RDV aussi
    if (statut === 'termine') {
      await db.query(
        `UPDATE rendez_vous r
         JOIN ordres_intervention oi ON oi.rendez_vous_id = r.id
         SET r.statut = 'termine'
         WHERE oi.id = ?`,
        [req.params.id]
      );
    }

    res.json({ message: 'Statut mis à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/technicien/interventions/:id/pieces - Ajouter pièce utilisée
const ajouterPiece = async (req, res) => {
  const { piece_id, quantite, prix_unitaire } = req.body;
  try {
    const [tech] = await db.query('SELECT id FROM techniciens WHERE user_id = ?', [req.user.id]);
    if (!tech.length) return res.status(403).json({ message: 'Accès refusé.' });

    // Vérifier que l'ordre appartient bien au technicien
    const [ordre] = await db.query(
      'SELECT id FROM ordres_intervention WHERE id = ? AND technicien_id = ?',
      [req.params.id, tech[0].id]
    );
    if (!ordre.length) return res.status(403).json({ message: 'Accès refusé.' });

    // Enregistrer l'utilisation
    await db.query(
      'INSERT INTO pieces_utilisees (ordre_id, piece_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
      [req.params.id, piece_id, quantite, prix_unitaire]
    );

    // Décrémenter le stock
    await db.query(
      'UPDATE pieces SET quantite_stock = quantite_stock - ? WHERE id = ?',
      [quantite, piece_id]
    );

    res.status(201).json({ message: 'Pièce ajoutée à l\'intervention.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/technicien/interventions/:id/pieces-disponibles - Stock dispo
const getPiecesDispo = async (req, res) => {
  try {
    const [tech] = await db.query(
      `SELECT t.id, t.prestataire_id FROM techniciens t WHERE t.user_id = ?`,
      [req.user.id]
    );
    if (!tech.length) return res.status(403).json({ message: 'Accès refusé.' });

    const [pieces] = await db.query(
      `SELECT id, nom, reference, marque, quantite_stock, prix_vente
       FROM pieces
       WHERE prestataire_id = ? AND quantite_stock > 0
       ORDER BY nom ASC`,
      [tech[0].prestataire_id]
    );
    res.json(pieces);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/technicien/interventions/:id/anomalie - Signaler une anomalie
const signalerAnomalie = async (req, res) => {
  const { description } = req.body;
  try {
    const [ordre] = await db.query(
      `SELECT oi.rendez_vous_id, r.prestataire_id
       FROM ordres_intervention oi
       JOIN rendez_vous r ON r.id = oi.rendez_vous_id
       WHERE oi.id = ?`,
      [req.params.id]
    );
    if (!ordre.length) return res.status(404).json({ message: 'Ordre introuvable.' });

    // Ajouter l'anomalie dans diagnostic
    await db.query(
      `UPDATE ordres_intervention
       SET diagnostic = CONCAT(COALESCE(diagnostic, ''), '\n⚠️ ANOMALIE: ', ?)
       WHERE id = ?`,
      [description, req.params.id]
    );

    // Notifier le gestionnaire
    const [gest] = await db.query(
      'SELECT gestionnaire_id FROM prestataires WHERE id = ?',
      [ordre[0].prestataire_id]
    );
    if (gest.length) {
      await db.query(
        `INSERT INTO notifications (user_id, type, titre, message, lien)
         VALUES (?, 'anomalie', '⚠️ Anomalie signalée', ?, ?)`,
        [gest[0].gestionnaire_id, description.substring(0, 200), `/gestionnaire/rdv`]
      );
    }

    res.json({ message: 'Anomalie signalée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getMesInterventions, updateStatut, ajouterPiece, getPiecesDispo, signalerAnomalie };
   