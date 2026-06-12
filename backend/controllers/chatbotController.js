
const db = require('../config/db');

const chat = async (req, res) => {
  const { message, historique = [] } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ message: 'Message vide.' });
  }

  try {
    let contexteUser = '';

    if (req.user) {
      const [users] = await db.query(
        'SELECT nom, prenom, role FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length > 0) {
        const user = users[0];
        contexteUser = `Utilisateur connecté : ${user.prenom} ${user.nom} (Rôle : ${user.role})`;

        if (user.role === 'client') {
          const [vehicules] = await db.query(
            `SELECT marque, modele, annee, kilometrage FROM vehicules WHERE client_id = ?`,
            [req.user.id]
          );
          if (vehicules.length > 0) {
            contexteUser += '\nVéhicules :\n';
            vehicules.forEach(v => {
              contexteUser += `- ${v.marque} ${v.modele} ${v.annee || ''} (${v.kilometrage || 0} km)\n`;
            });
          }
        }
      }
    }

    const historiqueMessages = historique.slice(-10).map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    }));

    const systemPrompt = `Tu es l'assistant IA officiel d'AutoLink Maroc.

Mission :
- Répondre aux questions automobiles.
- Aider sur les pannes.
- Donner des conseils d'entretien.
- Expliquer les services AutoLink Maroc.
- Répondre sur les rendez-vous, garages, mécaniciens et véhicules.
- Donner des estimations de prix au Maroc lorsque c'est pertinent.

Règles :
- Réponds toujours en français.
- Sois professionnel et clair.
- Utilise des listes quand nécessaire.
- Si tu n'es pas sûr d'une information, indique-le.
- Ne donne pas de conseils médicaux.
- Pour une panne grave, recommande un professionnel.
${contexteUser ? `\n${contexteUser}` : ''}`;

    // ✅ Appel Groq (format OpenAI-compatible)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`  // ✅ Clé dans .env
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',  // ou 'llama3-8b-8192' pour plus rapide
        messages: [
          { role: 'system', content: systemPrompt },
          ...historiqueMessages,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    console.log('===== GROQ RESPONSE =====');
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Erreur Groq:', data);
      return res.status(500).json({
        message: data.error?.message || 'Erreur lors de la communication avec Groq.'
      });
    }

    const reponse = data.choices?.[0]?.message?.content
      || "Désolé, je n'ai pas pu générer une réponse.";

    if (req.user) {
      await db.query(
        `INSERT INTO notifications (user_id, type, titre, message) VALUES (?, 'chatbot', 'Conversation IA', ?)`,
        [req.user.id, `Q: ${message.substring(0, 100)}`]
      ).catch(() => {});
    }

    res.json({ reponse });

  } catch (err) {
    console.error('Erreur chatbot:', err);
    res.status(500).json({ message: 'Erreur du service chatbot.' });
  }
};

const getSuggestions = async (req, res) => {
  res.json([
    { icon: '🔧', texte: 'Quand dois-je faire ma vidange ?' },
    { icon: '🛞', texte: 'Comment savoir si mes pneus sont usés ?' },
    { icon: '❄️', texte: 'Ma climatisation ne refroidit plus, pourquoi ?' },
    { icon: '🔋', texte: 'Comment tester ma batterie de voiture ?' },
    { icon: '💡', texte: 'Mon voyant moteur est allumé, que faire ?' },
    { icon: '📅', texte: 'Comment prendre un rendez-vous sur AutoLink ?' },
    { icon: '🇲🇦', texte: 'Quand renouveler ma vignette au Maroc ?' },
    { icon: '💰', texte: "Quel est le prix d'une vidange à Casablanca ?" }
  ]);
};

module.exports = {
  chat,
  getSuggestions  // ✅ maintenant définie
};