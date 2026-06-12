const db = require('../config/db');

// GET /api/rdv - Mes rendez-vous
const getMesRdv = async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'client') {
      query = `
        SELECT r.*, p.nom AS prestataire_nom, p.adresse AS prestataire_adresse,
               v.marque, v.modele, v.immatriculation, pr.nom AS prestation_nom
        FROM rendez_vous r
        JOIN prestataires p ON p.id = r.prestataire_id
        JOIN vehicules v ON v.id = r.vehicule_id
        LEFT JOIN prestations pr ON pr.id = r.prestation_id
        WHERE r.client_id = ?
        ORDER BY r.date_rdv DESC`;
      params = [req.user.id];

    } else if (req.user.role === 'gestionnaire') {
      query = `
        SELECT r.*, u.nom AS client_nom, u.prenom AS client_prenom, u.telephone AS client_tel,
               v.marque, v.modele, v.immatriculation, pr.nom AS prestation_nom
        FROM rendez_vous r
        JOIN users u ON u.id = r.client_id
        JOIN vehicules v ON v.id = r.vehicule_id
        LEFT JOIN prestations pr ON pr.id = r.prestation_id
        WHERE r.prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id = ?)
        ORDER BY r.date_rdv DESC`;
      params = [req.user.id];

    } else if (req.user.role === 'technicien') {
      query = `
        SELECT r.*, u.nom AS client_nom, u.prenom AS client_prenom,
               v.marque, v.modele, v.immatriculation, pr.nom AS prestation_nom
        FROM rendez_vous r
        JOIN users u ON u.id = r.client_id
        JOIN vehicules v ON v.id = r.vehicule_id
        LEFT JOIN prestations pr ON pr.id = r.prestation_id
        JOIN techniciens t ON t.id = r.technicien_id
        WHERE t.user_id = ?
        ORDER BY r.date_rdv DESC`;
      params = [req.user.id];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/rdv/:id
const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, p.nom AS prestataire_nom, p.adresse AS prestataire_adresse, p.telephone AS prestataire_tel,
              v.marque, v.modele, v.immatriculation, v.couleur, v.kilometrage,
              u.nom AS client_nom, u.prenom AS client_prenom, u.telephone AS client_tel,
              pr.nom AS prestation_nom
       FROM rendez_vous r
       JOIN prestataires p ON p.id = r.prestataire_id
       JOIN vehicules v ON v.id = r.vehicule_id
       JOIN users u ON u.id = r.client_id
       LEFT JOIN prestations pr ON pr.id = r.prestation_id
       WHERE r.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Rendez-vous introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/rdv - Prendre un rendez-vous
const create = async (req, res) => {
  const { prestataire_id, vehicule_id, prestation_id, date_rdv, description_probleme } = req.body;
  try {
    // Vérifier que le véhicule appartient au client
    const [vehicule] = await db.query('SELECT id FROM vehicules WHERE id = ? AND client_id = ?', [vehicule_id, req.user.id]);
    if (!vehicule.length) return res.status(400).json({ message: 'Véhicule invalide.' });

    const [result] = await db.query(
      `INSERT INTO rendez_vous (client_id, prestataire_id, vehicule_id, prestation_id, date_rdv, description_probleme)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, prestataire_id, vehicule_id, prestation_id, date_rdv, description_probleme]
    );

    // Notifier le gestionnaire
    const [prestataire] = await db.query('SELECT gestionnaire_id FROM prestataires WHERE id = ?', [prestataire_id]);
    if (prestataire.length) {
      await db.query(
        `INSERT INTO notifications (user_id, type, titre, message, lien)
         VALUES (?, 'nouveau_rdv', 'Nouveau rendez-vous', 'Un client a pris un rendez-vous.', ?)`,
        [prestataire[0].gestionnaire_id, `/gestionnaire/rdv/${result.insertId}`]
      );
    }

    res.status(201).json({ message: 'Rendez-vous créé avec succès.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/rdv/:id/statut - Changer le statut
const updateStatut = async (req, res) => {

  const { statut } = req.body;

  const statutsValides = [
    'en_attente',
    'confirme',
    'en_cours',
    'termine',
    'annule'
  ];


  if (!statutsValides.includes(statut)) {
    return res.status(400).json({
      message: 'Statut invalide.'
    });
  }


  try {


    // changer le statut
    await db.query(
      `
      UPDATE rendez_vous
      SET statut = ?
      WHERE id = ?
      `,
      [
        statut,
        req.params.id
      ]
    );



    // si confirmé -> notifier le client
    if(statut === "confirme"){


      const [rdv] = await db.query(
        `
        SELECT client_id
        FROM rendez_vous
        WHERE id = ?
        `,
        [
          req.params.id
        ]
      );


      if(rdv.length){


        await db.query(
          `
          INSERT INTO notifications
          (user_id,type,titre,message,lien)

          VALUES(?,?,?,?,?)
          `,
          [
            rdv[0].client_id,
            "rdv_confirme",
            "Rendez-vous confirmé",
            "Votre rendez-vous a été confirmé par le garage.",
            `/client/rdv/${req.params.id}`
          ]
        );


      }

    }



    res.json({
      message:"Statut mis à jour."
    });



  } catch(err){

    console.error(err);

    res.status(500).json({
      message:"Erreur serveur."
    });

  }

};
// DELETE /api/rdv/:id - Annuler (client uniquement)
const annuler = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, statut FROM rendez_vous WHERE id = ? AND client_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Rendez-vous introuvable.' });
    if (['en_cours', 'termine'].includes(rows[0].statut)) {
      return res.status(400).json({ message: 'Ce rendez-vous ne peut pas être annulé.' });
    }
    await db.query('UPDATE rendez_vous SET statut = "annule" WHERE id = ?', [req.params.id]);
    res.json({ message: 'Rendez-vous annulé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getMesRdv, getById, create, updateStatut, annuler };
