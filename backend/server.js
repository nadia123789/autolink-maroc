const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── ROUTES ──────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/prestataires',  require('./routes/prestataires'));
app.use('/api/vehicules',     require('./routes/vehicules'));
app.use('/api/rdv',           require('./routes/rdv'));
app.use('/api/avis',          require('./routes/avis'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/pieces',        require('./routes/pieces'));
app.use('/api/technicien',    require('./routes/technicien'));
app.use('/api/chatbot',       require('./routes/chatbot'));
app.use('/api/devis',         require('./routes/devis'));
app.use('/api/promotions',    require('./routes/promotions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/gestionnaire',  require('./routes/gestionnaire'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} introuvable.` }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: 'Erreur serveur.' }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚗 AutoLink Maroc API → http://localhost:${PORT}`);
  console.log(`🌍 Env: ${process.env.NODE_ENV || 'development'}\n`);
});
