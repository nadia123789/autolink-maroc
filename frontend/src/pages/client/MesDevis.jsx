import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Car,
  Calendar,
  Building2,
  DollarSign,
  X,
  Eye
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const STATUT = {
  brouillon: { label: 'Brouillon', class: 'badge-gray', icon: FileText, color: '#6b7280' },
  envoye:    { label: 'À valider',  class: 'badge-gold', icon: Clock, color: '#f59e0b' },
  accepte:   { label: 'Accepté',   class: 'badge-success', icon: CheckCircle, color: '#10b981' },
  refuse:    { label: 'Refusé',    class: 'badge-danger', icon: XCircle, color: '#ef4444' },
  expire:    { label: 'Expiré',    class: 'badge-gray', icon: AlertCircle, color: '#6b7280' },
};

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

function DevisDetail({ devis, onDecision, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDecision = async (decision) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/devis/${devis.id}/repondre`, { decision });
      onDecision();
    } catch (e) { 
      setError('Erreur lors de la réponse au devis.');
    }
    finally { setLoading(false); }
  };

  const s = STATUT[devis.statut] || { label: devis.statut, class: 'badge-gray', icon: FileText, color: '#6b7280' };
  const StatusIcon = s.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25 }}
        style={{ 
          width:'100%', 
          maxWidth:'750px', 
          maxHeight:'90vh', 
          overflowY:'auto', 
          background: '#1a1a1a', 
          borderRadius: '20px', 
          padding: '24px',
          border: '1px solid rgba(220, 38, 38, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between" style={{ marginBottom:'24px' }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:700, color: 'white' }}>
              Devis {devis.numero}
            </h2>
            <div style={{ color:'#9ca3af', fontSize:'13px', marginTop:'4px', display:'flex', alignItems:'center', gap: '8px' }}>
              <Building2 size={12} /> {devis.prestataire_nom}
              <span>·</span>
              <Calendar size={12} /> {new Date(devis.date_creation).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div className="flex gap-sm" style={{ alignItems: 'center' }}>
            <span className={`badge ${s.class}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <StatusIcon size={12} /> {s.label}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9ca3af' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Infos véhicule */}
        <div style={{ background: '#0f0f0f', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Car size={12} /> VÉHICULE
          </div>
          <div style={{ fontWeight: 600, color: 'white', marginBottom: '4px' }}>
            {devis.marque} {devis.modele} — {devis.immatriculation}
          </div>
          {devis.description_probleme && (
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '6px' }}>
              {devis.description_probleme}
            </div>
          )}
        </div>

        {/* Lignes */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', marginBottom: '12px' }}>Détails des prestations</div>
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: '#9ca3af', fontSize: '12px' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '10px', color: '#9ca3af', fontSize: '12px' }}>Qté</th>
                  <th style={{ textAlign: 'right', padding: '10px', color: '#9ca3af', fontSize: '12px' }}>Prix unit.</th>
                  <th style={{ textAlign: 'right', padding: '10px', color: '#9ca3af', fontSize: '12px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(devis.lignes || []).map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '10px', color: 'white' }}>{l.description}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#9ca3af' }}>{l.quantite}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#9ca3af' }}>{Number(l.prix_unitaire).toFixed(2)} MAD</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>{Number(l.total).toFixed(2)} MAD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux */}
        <div style={{ background: '#0f0f0f', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          {[
            { l:'Sous-total HT', v: `${Number(devis.sous_total).toFixed(2)} MAD` },
            { l:`TVA (${devis.tva}%)`, v: `${(devis.sous_total * devis.tva / 100).toFixed(2)} MAD` },
          ].map(r => (
            <div key={r.l} className="flex-between" style={{ marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>
              <span>{r.l}</span><span>{r.v}</span>
            </div>
          ))}
          <div className="flex-between" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: '#fbbf24', borderTop: '1px solid #333', paddingTop: '12px', marginTop: '4px' }}>
            <span>Total TTC</span>
            <span>{Number(devis.total_ttc).toFixed(2)} MAD</span>
          </div>
        </div>

        {devis.notes && (
          <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px', fontStyle: 'italic', background: '#0f0f0f', padding: '12px', borderRadius: '10px' }}>
            📝 Note : {devis.notes}
          </div>
        )}

        {/* Actions client */}
        {devis.statut === 'envoye' && (
          <div className="flex gap-md" style={{ gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDecision('accepte')} 
              disabled={loading} 
              className="btn btn-gold"
              style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              {loading ? 'Traitement...' : '✓ Accepter le devis'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDecision('refuse')} 
              disabled={loading} 
              className="btn btn-danger"
              style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              {loading ? 'Traitement...' : '✗ Refuser'}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function MesDevis() {
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/devis');
      setDevis(data);
    } catch (error) {
      console.error('Erreur lors du chargement des devis', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const aValider = devis.filter(d => d.statut === 'envoye').length;

  return (
    <div className="dashboard-layout" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <AnimatePresence>
        {selected && (
          <DevisDetail 
            devis={selected} 
            onClose={() => setSelected(null)} 
            onDecision={() => { setSelected(null); fetch(); }} 
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
            <FileText size={32} color="#dc2626" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>
              Mes devis
              {aValider > 0 && (
                <span className="badge" style={{ background: '#dc2626', color: 'white', marginLeft: '12px', fontSize: '14px', padding: '4px 10px' }}>
                  {aValider} à valider
                </span>
              )}
            </h1>
          </div>
          <p style={{ color: '#666', marginTop: '4px' }}>
            {devis.length} devis au total
          </p>
        </motion.div>

        {/* Alerte */}
        <AnimatePresence>
          {aValider > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Clock size={20} color="#dc2626" />
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#991b1b' }}>📋 Devis en attente</strong>
                <p style={{ color: '#7f1d1d', marginTop: '4px', fontSize: '13px' }}>
                  Vous avez <strong>{aValider} devis</strong> en attente de votre validation.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          ) : devis.length === 0 ? (
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
              <FileText size={64} color="#4b5563" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#dc2626', marginBottom: '12px' }}>Aucun devis reçu</h3>
              <p style={{ color: '#9ca3af' }}>Les devis des prestataires apparaîtront ici.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {devis.map((d, index) => {
                const s = STATUT[d.statut] || { label: d.statut, class: 'badge-gray', icon: FileText, color: '#6b7280' };
                const StatusIcon = s.icon;
                const isUrgent = d.statut === 'envoye';
                
                return (
                  <motion.div
                    key={d.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.01, x: 5 }}
                    onClick={() => setSelected(d)}
                    style={{
                      background: '#1a1a1a',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: isUrgent ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid rgba(220, 38, 38, 0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isUrgent && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          position: 'absolute',
                          top: '-30%',
                          right: '-10%',
                          width: '150px',
                          height: '150px',
                          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)',
                          borderRadius: '50%'
                        }}
                      />
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: s.color === '#f59e0b' ? '#fef3c7' : `linear-gradient(135deg, ${s.color}20 0%, ${s.color}10 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <StatusIcon size={26} color={s.color} />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'white' }}>
                            {d.prestataire_nom}
                          </h3>
                          <span className={`badge ${s.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <StatusIcon size={12} /> {s.label}
                          </span>
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Car size={12} /> {d.marque} {d.modele}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={12} /> N° {d.numero}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#fbbf24', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '18px' }}>
                          {Number(d.total_ttc).toFixed(2)} MAD
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                          <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Cliquez pour voir
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}