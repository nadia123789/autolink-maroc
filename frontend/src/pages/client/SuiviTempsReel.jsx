import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Calendar, 
  Wrench, 
  CheckCircle, 
  Clock,
  MapPin,
  Phone,
  User,
  ArrowRight,
  AlertCircle,
  Navigation
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const STATUT_RDV = {
  en_attente: { label: 'En attente de confirmation', icon: Clock, class: 'badge-warning', color: '#f59e0b', pct: 10 },
  confirme:   { label: 'Rendez-vous confirmé',       icon: CheckCircle, class: 'badge-info', color: '#3b82f6', pct: 25 },
  en_cours:   { label: 'Travaux en cours',           icon: Wrench, class: 'badge-gold', color: '#f97316', pct: 65 },
  termine:    { label: 'Véhicule prêt',              icon: CheckCircle, class: 'badge-success', color: '#10b981', pct: 100 },
  annule:     { label: 'Annulé',                     icon: AlertCircle, class: 'badge-danger', color: '#ef4444', pct: 0 },
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

function SuiviCard({ rdv }) {
  const s = STATUT_RDV[rdv.statut] || STATUT_RDV.en_attente;
  const StatusIcon = s.icon;
  const etapes = ['en_attente', 'confirme', 'en_cours', 'termine'];
  const idx = etapes.indexOf(rdv.statut);
  const isActive = rdv.statut !== 'annule' && rdv.statut !== 'termine';

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -5 }}
      style={{ 
        marginBottom: '20px', 
        background: '#1a1a1a', 
        borderRadius: '20px', 
        padding: '24px',
        border: `1px solid ${isActive ? 'rgba(220, 38, 38, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isActive && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)',
            borderRadius: '50%'
          }}
        />
      )}
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${s.color}20 0%, ${s.color}10 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <StatusIcon size={24} color={s.color} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'white' }}>
                {rdv.prestataire_nom}
              </h3>
            </div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px', marginLeft: '58px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Car size={12} /> {rdv.marque} {rdv.modele}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {new Date(rdv.date_rdv).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
          <span className={`badge ${s.class}`} style={{ 
            fontSize: '13px', 
            padding: '6px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: `${s.color}20`,
            color: s.color
          }}>
            <StatusIcon size={14} /> {s.label}
          </span>
        </div>

        {rdv.statut !== 'annule' && (
          <>
            {/* Barre de progression */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ height: '8px', background: '#0f0f0f', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                {etapes.map((e, i) => {
                  const done = i <= idx;
                  const stepInfo = STATUT_RDV[e];
                  const StepIcon = stepInfo?.icon;
                  return (
                    <div key={e} style={{ textAlign: 'center', flex: 1 }}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          margin: '0 auto 6px',
                          background: done ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : '#2a2a2a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: done ? 'white' : '#6b7280',
                          transition: 'all 0.3s'
                        }}
                      >
                        {done ? <CheckCircle size={16} /> : <span style={{ fontSize: '12px' }}>{i + 1}</span>}
                      </motion.div>
                      <div style={{ fontSize: '10px', color: done ? '#ef4444' : '#6b7280', fontWeight: done ? 600 : 400 }}>
                        {stepInfo?.label.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {rdv.prestation_nom && (
              <div style={{ 
                fontSize: '13px', 
                color: '#ef4444', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Wrench size={14} /> {rdv.prestation_nom}
              </div>
            )}
            
            {rdv.prestataire_adresse && (
              <div style={{ 
                fontSize: '13px', 
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <MapPin size={14} /> {rdv.prestataire_adresse}
              </div>
            )}

            {rdv.prestataire_telephone && (
              <div style={{ 
                fontSize: '13px', 
                color: '#9ca3af', 
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Phone size={14} /> {rdv.prestataire_telephone}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function SuiviTempsReel() {
  const [rdvActifs, setRdvActifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetch = async () => {
    try {
      const { data } = await api.get('/rdv');
      setRdvActifs(data.filter(r => !['annule'].includes(r.statut)));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des RDV', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // Rafraîchir toutes les 30 secondes
    const timer = setInterval(fetch, 30000);
    return () => clearInterval(timer);
  }, []);

  const actifs = rdvActifs.filter(r => r.statut !== 'termine');
  const termines = rdvActifs.filter(r => r.statut === 'termine');

  return (
    <div className="dashboard-layout" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ padding: '32px 40px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '32px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Navigation size={32} color="#dc2626" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>
              Suivi en temps réel
            </h1>
          </div>
          <p style={{ color: '#666', marginTop: '4px' }}>
            Suivez l'avancement de vos véhicules en atelier. 
            <span style={{ fontSize: '12px', marginLeft: '12px', color: '#999' }}>
              🔄 Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          </p>
        </motion.div>

        {/* Stats rapides */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid-3"
          style={{ marginBottom: '32px', gap: '20px' }}
        >
          <div style={{ 
            background: '#1a1a1a', 
            borderRadius: '16px', 
            padding: '20px',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{actifs.length}</div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>En cours / À venir</div>
          </div>
          <div style={{ 
            background: '#1a1a1a', 
            borderRadius: '16px', 
            padding: '20px',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{termines.length}</div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Terminés aujourd'hui</div>
          </div>
          <div style={{ 
            background: '#1a1a1a', 
            borderRadius: '16px', 
            padding: '20px',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>{rdvActifs.length}</div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Total actifs</div>
          </div>
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
          ) : rdvActifs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ 
                textAlign: 'center', 
                padding: '60px', 
                background: '#1a1a1a',
                borderRadius: '20px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}
            >
              <CheckCircle size={64} color="#4b5563" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: '#dc2626' }}>
                Aucun suivi actif
              </h2>
              <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
                Tous vos véhicules sont disponibles ou vous n'avez pas de RDV en cours.
              </p>
              <Link to="/prestataires" className="btn btn-gold" style={{ background: '#dc2626', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                Prendre un rendez-vous
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* RDV Actifs / En cours */}
              {actifs.length > 0 && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: '#dc2626', marginBottom: '16px', marginTop: '8px' }}>
                    📍 En cours / À venir ({actifs.length})
                  </h3>
                  {actifs.map(r => (
                    <SuiviCard key={r.id} rdv={r} />
                  ))}
                </>
              )}

              {/* RDV Terminés */}
              {termines.length > 0 && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: '#10b981', marginBottom: '16px', marginTop: '24px' }}>
                    ✅ Terminés aujourd'hui ({termines.length})
                  </h3>
                  {termines.map(r => (
                    <SuiviCard key={r.id} rdv={r} />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}