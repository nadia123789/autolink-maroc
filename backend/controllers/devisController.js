const db = require('../config/db');

// ── Utilitaire numéro devis ─────────────────────────────────
const genNumero = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

// GET /api/devis - Liste (gestionnaire: ses devis | client: ses devis)
const getAll = async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'client') {
      query = `SELECT d.*, r.date_rdv, p.nom AS prestataire_nom, v.marque, v.modele
               FROM devis d
               JOIN rendez_vous r ON r.id = d.rendez_vous_id
               JOIN prestataires p ON p.id = r.prestataire_id
               JOIN vehicules v ON v.id = r.vehicule_id
               WHERE r.client_id = ? ORDER BY d.date_creation DESC`;
      params = [req.user.id];
    } else {
      query = `SELECT d.*, r.date_rdv, u.nom AS client_nom, u.prenom AS client_prenom, v.marque, v.modele
               FROM devis d
               JOIN rendez_vous r ON r.id = d.rendez_vous_id
               JOIN users u ON u.id = r.client_id
               JOIN vehicules v ON v.id = r.vehicule_id
               WHERE r.prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id = ?)
               ORDER BY d.date_creation DESC`;
      params = [req.user.id];
    }
    const [rows] = await db.query(query, params);

    // Lignes de chaque devis
    for (const d of rows) {
      const [lignes] = await db.query('SELECT * FROM devis_lignes WHERE devis_id = ?', [d.id]);
      d.lignes = lignes;
    }
    res.json(rows);
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// GET /api/devis/:id
const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, r.date_rdv, r.description_probleme,
              u.nom AS client_nom, u.prenom AS client_prenom, u.email AS client_email, u.telephone AS client_tel,
              p.nom AS prestataire_nom, p.adresse AS prestataire_adresse, p.telephone AS prestataire_tel,
              v.marque, v.modele, v.immatriculation
       FROM devis d
       JOIN rendez_vous r ON r.id = d.rendez_vous_id
       JOIN users u ON u.id = r.client_id
       JOIN prestataires p ON p.id = r.prestataire_id
       JOIN vehicules v ON v.id = r.vehicule_id
       WHERE d.id = ?`, [req.params.id]);
    
    if (!rows.length) return res.status(404).json({ message: 'Devis introuvable.' });
    
    const [lignes] = await db.query('SELECT * FROM devis_lignes WHERE devis_id = ?', [req.params.id]);
    res.json({ ...rows[0], lignes });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// POST /api/devis - Créer un devis (gestionnaire)
const create = async (req, res) => {
  const { rendez_vous_id, lignes = [], tva = 20, notes, validite_jours = 15 } = req.body;
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    const sous_total = lignes.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
    const total_ttc = sous_total * (1 + tva / 100);
    const numero = genNumero('DEV');
    
    const [result] = await conn.query(
      `INSERT INTO devis (rendez_vous_id, numero, statut, sous_total, tva, total_ttc, validite_jours, notes)
       VALUES (?, ?, 'brouillon', ?, ?, ?, ?, ?)`,
      [rendez_vous_id, numero, sous_total, tva, total_ttc, validite_jours, notes]
    );
    
    for (const l of lignes) {
      await conn.query(
        'INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire, total) VALUES (?,?,?,?,?)',
        [result.insertId, l.description, l.quantite, l.prix_unitaire, l.prix_unitaire * l.quantite]
      );
    }
    
    // Notifier le client
    const [rdv] = await conn.query('SELECT client_id FROM rendez_vous WHERE id = ?', [rendez_vous_id]);
    if (rdv.length) {
      await conn.query(
        `INSERT INTO notifications (user_id, type, titre, message, lien) 
         VALUES (?, 'devis', '📋 Nouveau devis', 'Un devis est disponible pour votre rendez-vous.', ?)`,
        [rdv[0].client_id, `/client/devis/${result.insertId}`]
      );
    }
    
    await conn.commit();
    res.status(201).json({ message: 'Devis créé.', id: result.insertId, numero });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  } finally { 
    conn.release(); 
  }
};

// PUT /api/devis/:id/envoyer
const envoyer = async (req, res) => {
  try {
    await db.query(`UPDATE devis SET statut = 'envoye' WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Devis envoyé.' });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' }); 
  }
};

// PUT /api/devis/:id/repondre - Client accepte ou refuse (VERSION CORRIGÉE)
const repondre = async (req, res) => {
  const { decision } = req.body;
  if (!['accepte', 'refuse'].includes(decision)) {
    return res.status(400).json({ message: 'Décision invalide.' });
  }
  
  try {
    // Vérifier les droits et récupérer les infos nécessaires
    const [rows] = await db.query(
      `SELECT d.id, d.rendez_vous_id, r.client_id, r.prestataire_id 
       FROM devis d
       JOIN rendez_vous r ON r.id = d.rendez_vous_id
       WHERE d.id = ? AND r.client_id = ?`,
      [req.params.id, req.user.id]
    );
    
    if (!rows.length) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const { rendez_vous_id, prestataire_id } = rows[0];

    // Mettre à jour statut du devis
    await db.query(`UPDATE devis SET statut = ? WHERE id = ?`, [decision, req.params.id]);

    if (decision === 'accepte') {
      // 1. Mettre à jour le RDV → en_cours
      await db.query(
        `UPDATE rendez_vous SET statut = 'en_cours' WHERE id = ?`,
        [rendez_vous_id]
      );

      // 2. Mettre à jour l'ordre d'intervention → en_cours + date_debut
      await db.query(
        `UPDATE ordres_intervention 
         SET statut = 'en_cours', date_debut = NOW()
         WHERE rendez_vous_id = ? AND statut = 'ouvert'`,
        [rendez_vous_id]
      );

      // 3. Récupérer le technicien assigné
      const [ordre] = await db.query(
        `SELECT oi.id AS ordre_id, t.user_id AS tech_user_id,
                u.prenom AS client_prenom, u.nom AS client_nom,
                v.marque, v.modele
         FROM ordres_intervention oi
         LEFT JOIN techniciens t ON t.id = oi.technicien_id
         JOIN rendez_vous r ON r.id = oi.rendez_vous_id
         JOIN users u ON u.id = r.client_id
         JOIN vehicules v ON v.id = r.vehicule_id
         WHERE oi.rendez_vous_id = ?`,
        [rendez_vous_id]
      );

      // 4. Notification au technicien
      if (ordre.length && ordre[0].tech_user_id) {
        await db.query(
          `INSERT INTO notifications (user_id, type, titre, message, lien)
           VALUES (?, 'travaux_debut', '🔧 Travaux autorisés', ?, ?)`,
          [
            ordre[0].tech_user_id,
            `Le client ${ordre[0].client_prenom} ${ordre[0].client_nom} a accepté le devis. Vous pouvez commencer les travaux sur ${ordre[0].marque} ${ordre[0].modele}.`,
            '/technicien/ordres'
          ]
        );
      }

      // 5. Notification au client
      await db.query(
        `INSERT INTO notifications (user_id, type, titre, message, lien)
         VALUES (?, 'travaux_debut', '🔧 Travaux en cours', ?, ?)`,
        [
          req.user.id,
          'Votre devis a été accepté. Les travaux sur votre véhicule vont commencer.',
          '/client/suivi'
        ]
      );
    } else {
      // Notification pour refus
      await db.query(
        `INSERT INTO notifications (user_id, type, titre, message, lien)
         VALUES (?, 'devis_refus', '❌ Devis refusé', 'Vous avez refusé le devis. Un nouveau devis pourra être établi.', ?)`,
        [req.user.id, '/client/rendez-vous']
      );
    }

    // 6. Notifier le gestionnaire dans tous les cas
    const [gest] = await db.query(
      'SELECT gestionnaire_id FROM prestataires WHERE id = ?',
      [prestataire_id]
    );
    
    if (gest.length) {
      await db.query(
        `INSERT INTO notifications (user_id, type, titre, message, lien) 
         VALUES (?, 'devis_reponse', ?, ?, ?)`,
        [
          gest[0].gestionnaire_id,
          decision === 'accepte' ? '✅ Devis accepté' : '❌ Devis refusé',
          `Le client a ${decision === 'accepte' ? 'accepté' : 'refusé'} le devis.`,
          `/gestionnaire/devis/${req.params.id}`
        ]
      );
    }

    res.json({ message: `Devis ${decision}.` });
  } catch (err) {
    console.error('Erreur dans repondre:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/devis/:id/facturer - Convertir devis en facture
const facturer = async (req, res) => {
  const { mode_paiement = 'especes' } = req.body;
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    const [devis] = await conn.query('SELECT * FROM devis WHERE id = ?', [req.params.id]);
    if (!devis.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Devis introuvable.' });
    }
    
    if (devis[0].statut !== 'accepte') {
      await conn.rollback();
      return res.status(400).json({ message: 'Le devis doit être accepté avant d\'être facturé.' });
    }

    const numero = genNumero('FAC');
    const [result] = await conn.query(
      `INSERT INTO factures (rendez_vous_id, devis_id, numero, statut, mode_paiement, sous_total, tva, total_ttc, date_paiement)
       VALUES (?, ?, ?, 'payee', ?, ?, ?, ?, NOW())`,
      [devis[0].rendez_vous_id, devis[0].id, numero, mode_paiement, devis[0].sous_total, devis[0].tva, devis[0].total_ttc]
    );
    
    // Mettre à jour prix final du RDV
    await conn.query('UPDATE rendez_vous SET prix_final = ? WHERE id = ?', 
      [devis[0].total_ttc, devis[0].rendez_vous_id]);
    
    // Mettre à jour le statut du devis
    await conn.query('UPDATE devis SET statut = "facture" WHERE id = ?', [req.params.id]);
    
    await conn.commit();
    res.status(201).json({ message: 'Facture créée.', id: result.insertId, numero });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  } finally { 
    conn.release(); 
  }
};

// Exportation des fonctions (une seule fois)
module.exports = { 
  getAll, 
  getById, 
  create, 
  envoyer, 
  repondre,  // Une seule définition
  facturer 
};