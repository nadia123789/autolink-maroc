const db = require('../config/db');

// GET /api/avis/prestataire/:id
const getByPrestataire = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.note, a.commentaire, a.reponse_prestataire, a.date_creation,
              u.nom, u.prenom, u.avatar
       FROM avis a 
       JOIN users u ON u.id = a.client_id
       WHERE a.prestataire_id = ? AND a.est_publie = TRUE
       ORDER BY a.date_creation DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching avis:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/avis - Déposer un avis
const create = async (req, res) => {
  const { prestataire_id, note, commentaire } = req.body;
  
  if (!prestataire_id) {
    return res.status(400).json({ message: 'ID du prestataire requis.' });
  }
  
  if (note < 1 || note > 5) {
    return res.status(400).json({ message: 'Note invalide (1-5).' });
  }
  
  try {
    // Check if user already left a review for this prestataire
    const [existing] = await db.query(
      'SELECT id FROM avis WHERE client_id = ? AND prestataire_id = ?', 
      [req.user.id, prestataire_id]
    );
    
    if (existing.length) {
      return res.status(409).json({ message: 'Vous avez déjà laissé un avis pour ce prestataire.' });
    }

    // Insert the review
    await db.query(
      'INSERT INTO avis (client_id, prestataire_id, note, commentaire, est_publie) VALUES (?, ?, ?, ?, TRUE)',
      [req.user.id, prestataire_id, note, commentaire || null]
    );
    
    // Update prestataire average rating
    await updatePrestataireRating(prestataire_id);
    
    res.status(201).json({ message: 'Avis publié avec succès.' });
  } catch (err) {
    console.error('Error creating avis:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/avis/:id/reponse - Réponse du prestataire
const repondre = async (req, res) => {
  const { reponse } = req.body;
  
  if (!reponse || reponse.trim() === '') {
    return res.status(400).json({ message: 'La réponse ne peut pas être vide.' });
  }
  
  try {
    const [result] = await db.query(
      `UPDATE avis SET reponse_prestataire = ?
       WHERE id = ? AND prestataire_id IN (SELECT id FROM prestataires WHERE gestionnaire_id = ?)`,
      [reponse, req.params.id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Avis non trouvé ou vous n\'êtes pas autorisé.' });
    }
    
    res.json({ message: 'Réponse publiée avec succès.' });
  } catch (err) {
    console.error('Error responding to avis:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Helper function to update prestataire average rating
const updatePrestataireRating = async (prestataireId) => {
  try {
    // Calculate average rating
    const [result] = await db.query(
      `SELECT AVG(note) as avg_note, COUNT(*) as total_avis 
       FROM avis 
       WHERE prestataire_id = ? AND est_publie = TRUE`,
      [prestataireId]
    );
    
    const avgNote = result[0]?.avg_note || 0;
    const totalAvis = result[0]?.total_avis || 0;
    
    // Update prestataire
    await db.query(
      `UPDATE prestataires 
       SET note_moyenne = ?, total_avis = ? 
       WHERE id = ?`,
      [parseFloat(avgNote), parseInt(totalAvis), prestataireId]
    );
  } catch (err) {
    console.error('Error updating prestataire rating:', err);
  }
};

module.exports = { 
  getByPrestataire, 
  create, 
  repondre
};