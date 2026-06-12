import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  Smartphone,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Car,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// ── Paiement simulé ──────────────────────────────────────────
function PaiementModal({ facture, onClose, onSuccess }) {
  const [mode, setMode] = useState('especes');
  const [codePromo, setCode] = useState('');
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [etape, setEtape] = useState('choix');

  const modes = [
    { id: 'especes',  label: 'Espèces', icon: Wallet, desc: 'Paiement en caisse' },
    { id: 'virement', label: 'Virement bancaire', icon: Building2, desc: 'RIB fourni à l\'atelier' },
    { id: 'cmi',      label: 'Carte bancaire (CMI)', icon: CreditCard, desc: 'Paiement sécurisé en ligne' },
  ];

  const verifierCode = async () => {
    if (!codePromo.trim()) return;
    setError('');
    try {
      const { data } = await api.post('/promotions/verifier', {
        code: codePromo,
        prestataire_id: facture.prestataire_id,
      });
      setPromo(data.promotion);
    } catch { 
      setError('Code promo invalide ou expiré.');
      setPromo(null); 
    }
  };

  const montantRemise = promo
    ? promo.type === 'pourcentage'
      ? facture.montant * promo.valeur / 100
      : Math.min(promo.valeur, facture.montant)
    : 0;
  const montantFinal = Math.max(0, facture.montant - montantRemise);
  const pointsGagnes = Math.round(montantFinal / 10);

  const handlePayer = async () => {
    setLoading(true);
    setError('');
    try {
      await new Promise(r => setTimeout(r, 1500));
      setEtape('succes');
      setTimeout(() => { onSuccess(); }, 2000);
    } catch {
      setError('Erreur lors du paiement.');
    } finally {
      setLoading(false);
    }
  };

  const currentMode = modes.find(m => m.id === mode);
  const ModeIcon = currentMode?.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25 }}
        style={{ 
          width: '100%', 
          maxWidth: '520px', 
          background: '#1a1a1a', 
          borderRadius: '20px', 
          padding: '24px',
          border: '1px solid rgba(220, 38, 38, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {etape === 'succes' ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <CheckCircle size={72} color="#10b981" style={{ marginBottom: '20px' }} />
            </motion.div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: '#10b981', marginBottom: '12px' }}>Paiement confirmé !</h2>
            <p style={{ color: '#9ca3af' }}>
              Merci pour votre paiement de <strong style={{ color: '#fbbf24' }}>{montantFinal.toFixed(2)} MAD</strong>
            </p>
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '16px' }}>
              +{pointsGagnes} points de fidélité ajoutés 🎉
            </p>
          </div>
        ) : (
          <>
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>Paiement</h2>
                <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '2px' }}>{facture.prestataire}</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={24} />
              </button>
            </div>

            {error && (
              <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Montant */}
            <div style={{ background: '#0f0f0f', borderRadius: '14px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Montant à payer</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px', color: '#fbbf24' }}>
                {montantFinal.toFixed(2)} MAD
              </div>
              {promo && (
                <div style={{ color: '#10b981', fontSize: '13px', marginTop: '4px' }}>
                  🎁 Remise : -{montantRemise.toFixed(2)} MAD ({promo.nom})
                </div>
              )}
            </div>

            {/* Code promo */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ color: '#dc2626' }}>Code promotionnel</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input 
                  className="form-input" 
                  placeholder="CODE PROMO" 
                  value={codePromo} 
                  onChange={e => setCode(e.target.value.toUpperCase())} 
                  style={{ flex: 1, background: '#2a2a2a', border: '1px solid #444', color: 'white' }} 
                />
                <button 
                  onClick={verifierCode} 
                  className="btn btn-ghost btn-sm" 
                  style={{ border: '1px solid #dc2626', color: '#dc2626' }}
                >
                  Appliquer
                </button>
              </div>
            </div>

            {/* Mode de paiement */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ marginBottom: '10px', display: 'block', color: '#dc2626' }}>Mode de paiement</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {modes.map(m => {
                  const Icon = m.icon;
                  const isSelected = mode === m.id;
                  return (
                    <motion.div
                      key={m.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setMode(m.id)} 
                      style={{
                        padding: '14px 16px', 
                        borderRadius: '12px', 
                        cursor: 'pointer',
                        border: `2px solid ${isSelected ? '#dc2626' : '#333'}`,
                        background: isSelected ? 'rgba(220, 38, 38, 0.1)' : '#0f0f0f',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '14px', 
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: isSelected ? '#dc2626' : '#2a2a2a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={20} color={isSelected ? 'white' : '#9ca3af'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'white' }}>{m.label}</div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>{m.desc}</div>
                      </div>
                      {isSelected && <CheckCircle size={20} color="#dc2626" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {mode === 'cmi' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ background: 'rgba(220, 38, 38, 0.05)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}
              >
                <div style={{ fontWeight: 600, marginBottom: '12px', color: '#dc2626' }}>💳 Informations carte</div>
                <input className="form-input" placeholder="Numéro de carte" style={{ marginBottom: '8px', background: '#2a2a2a', border: '1px solid #444', color: 'white' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input className="form-input" placeholder="MM/AA" style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} />
                  <input className="form-input" placeholder="CVV" style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} />
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayer} 
              disabled={loading} 
              className="btn btn-gold btn-full btn-lg"
              style={{ background: '#dc2626', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ display: 'inline-block' }}
                >
                  <Clock size={18} />
                </motion.div>
              ) : (
                `Payer ${montantFinal.toFixed(2)} MAD`
              )}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Page principale ──────────────────────────────────────────
export default function PaiementFidelite() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    api.get('/devis')
      .then(r => {
        setFactures(r.data.filter(d => ['accepte', 'brouillon', 'envoye'].includes(d.statut)));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-layout" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <AnimatePresence>
        {modal && (
          <PaiementModal 
            facture={modal} 
            onClose={() => setModal(null)} 
            onSuccess={() => { setModal(null); }} 
          />
        )}
      </AnimatePresence>
      <main className="dashboard-content" style={{ padding: '32px 40px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '32px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CreditCard size={32} color="#dc2626" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>
              Paiements
            </h1>
          </div>
          <p style={{ color: '#666', marginTop: '4px' }}>
            Gérez vos paiements en attente
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: '50px',
                  height: '50px',
                  border: '3px solid #dc2626',
                  borderTopColor: 'transparent',
                  borderRadius: '50%'
                }}
              />
            </motion.div>
          ) : factures.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ 
                textAlign: 'center', 
                padding: '80px', 
                background: '#1a1a1a',
                borderRadius: '20px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}
            >
              <CreditCard size={64} color="#4b5563" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#dc2626', marginBottom: '12px' }}>Aucun paiement en attente</h3>
              <p style={{ color: '#9ca3af' }}>Toutes vos factures sont réglées.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {factures.map((f, index) => (
                <motion.div
                  key={f.id}
                  variants={fadeInUp}
                  whileHover={{ y: -3 }}
                  style={{
                    background: '#1a1a1a',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={26} color="#dc2626" />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'white' }}>
                      {f.prestataire_nom}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Car size={12} /> {f.marque} {f.modele}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={12} /> N° {f.numero}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(f.date_creation).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: '#fbbf24', marginBottom: '8px' }}>
                      {Number(f.total_ttc).toFixed(2)} MAD
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setModal({
                        ...f, 
                        montant: Number(f.total_ttc), 
                        prestataire: f.prestataire_nom, 
                        prestataire_id: f.prestataire_id
                      })}
                      className="btn btn-gold btn-sm"
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <CreditCard size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Payer maintenant
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}