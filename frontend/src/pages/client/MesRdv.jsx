import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Car, 
  Wrench, 
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const STATUT = {
  en_attente: { label: 'En attente', class: 'badge-warning', icon: Clock, color: '#f59e0b' },
  confirme:   { label: 'Confirmé',   class: 'badge-info', icon: CheckCircle, color: '#3b82f6' },
  en_cours:   { label: 'En cours',   class: 'badge-gold', icon: Wrench, color: '#f97316' },
  termine:    { label: 'Terminé',    class: 'badge-success', icon: CheckCircle, color: '#10b981' },
  annule:     { label: 'Annulé',     class: 'badge-danger', icon: XCircle, color: '#ef4444' },
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
      staggerChildren: 0.05
    }
  }
};

export default function MesRdv() {
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [expandedId, setExpandedId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await api.get('/rdv');
    setRdv(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleAnnuler = async (id) => {
    if (!window.confirm('⚠️ Annuler ce rendez-vous ? Cette action est irréversible.')) return;
    await api.delete(`/rdv/${id}`);
    fetch();
  };

  const filtres = ['tous', 'en_attente', 'confirme', 'en_cours', 'termine', 'annule'];
  const rdvFiltres = filtre === 'tous' ? rdv : rdv.filter(r => r.statut === filtre);

  const getStatusCount = (status) => {
    if (status === 'tous') return rdv.length;
    return rdv.filter(r => r.statut === status).length;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (d.toDateString() === tomorrow.toDateString()) return "Demain";
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ padding: '32px 40px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-between" 
          style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}
        >
          <div>
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '32px', 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Mes rendez-vous
            </motion.h1>
            <motion.p 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ color: '#9ca3af', marginTop: '4px' }}
            >
              {rdv.length} rendez-vous au total
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/client/rdv/nouveau" style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}>
              <Calendar size={18} />
              Nouveau RDV
            </Link>
          </motion.div>
        </motion.div>

        {/* Filters - Creative design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            marginBottom: '32px',
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Filter size={18} color="#ef4444" />
            <span style={{ color: '#9ca3af', fontWeight: 500, fontSize: '14px' }}>Filtrer par statut</span>
          </div>
          <div className="flex gap-sm" style={{ flexWrap: 'wrap', gap: '8px' }}>
            {filtres.map(f => {
              const statusInfo = STATUT[f];
              const count = getStatusCount(f);
              const isActive = filtre === f;
              
              return (
                <motion.button
                  key={f}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFiltre(f)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: isActive ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : '#2a2a2a',
                    color: isActive ? 'white' : '#9ca3af',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {f !== 'tous' && statusInfo?.icon && <statusInfo.icon size={14} />}
                  {f === 'tous' ? 'Tous' : statusInfo?.label}
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#3a3a3a',
                    padding: '2px 6px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    marginLeft: '4px'
                  }}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* RDV List */}
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
          ) : rdvFiltres.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ 
                textAlign: 'center', 
                padding: '80px', 
                background: '#1a1a1a',
                borderRadius: '24px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '64px', marginBottom: '16px' }}
              >
                <Calendar size={64} color="#4b5563" />
              </motion.div>
              <motion.h3 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                style={{ color: '#ef4444', marginBottom: '12px' }}
              >
                Aucun rendez-vous trouvé
              </motion.h3>
              <motion.p 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ color: '#9ca3af', marginBottom: '20px' }}
              >
                {filtre !== 'tous' ? `Aucun rendez-vous avec le statut "${STATUT[filtre]?.label}"` : 'Vous n\'avez aucun rendez-vous programmé'}
              </motion.p>
              <Link to="/prestataires" style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Trouver un prestataire
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {rdvFiltres.map((r, index) => {
                const status = STATUT[r.statut] || { label: r.statut, class: 'badge-gray', icon: Clock, color: '#6b7280' };
                const StatusIcon = status.icon;
                const peutAnnuler = ['en_attente', 'confirme'].includes(r.statut);
                const isExpanded = expandedId === r.id;
                const rdvDate = new Date(r.date_rdv);
                const isToday = rdvDate.toDateString() === new Date().toDateString();
                
                return (
                  <motion.div
                    key={r.id}
                    variants={fadeInUp}
                    layout
                    style={{
                      background: '#1a1a1a',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: `1px solid ${status.color}30`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        {/* Date Card - Creative */}
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 2 }}
                          style={{
                            minWidth: '90px',
                            textAlign: 'center',
                            background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}cc 100%)`,
                            borderRadius: '16px',
                            padding: '12px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {isToday && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '8px',
                                height: '8px',
                                background: '#10b981',
                                borderRadius: '50%'
                              }}
                            />
                          )}
                          <div style={{ 
                            color: 'white', 
                            fontFamily: 'var(--font-display)', 
                            fontWeight: 800, 
                            fontSize: '28px', 
                            lineHeight: 1 
                          }}>
                            {rdvDate.getDate()}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>
                            {rdvDate.toLocaleDateString('fr-FR', { month: 'short' })}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '500', marginTop: '4px' }}>
                            {rdvDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </motion.div>

                        {/* Main Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'white' }}>
                              {r.prestataire_nom}
                            </h3>
                            <motion.span
                              animate={r.statut === 'en_cours' ? { scale: [1, 1.05, 1] } : {}}
                              transition={{ duration: 1, repeat: Infinity }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: `${status.color}20`,
                                color: status.color
                              }}
                            >
                              <StatusIcon size={12} />
                              {status.label}
                            </motion.span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <div style={{ color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Car size={14} />
                              {r.marque} {r.modele} {r.immatriculation && `(${r.immatriculation})`}
                            </div>
                            {formatDate(r.date_rdv) && (
                              <div style={{ color: status.color, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CalendarIcon size={12} />
                                {formatDate(r.date_rdv)}
                              </div>
                            )}
                          </div>
                          
                          {r.prestation_nom && (
                            <div style={{ 
                              color: status.color, 
                              fontSize: '13px', 
                              marginTop: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <Wrench size={14} />
                              {r.prestation_nom}
                            </div>
                          )}
                        </div>

                        {/* Right Side */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          {r.prix_final && (
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              style={{ 
                                color: '#fbbf24', 
                                fontWeight: 700, 
                                fontFamily: 'var(--font-display)',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <DollarSign size={16} />
                              {r.prix_final} MAD
                            </motion.div>
                          )}
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {peutAnnuler && (
                              <motion.button
                                whileHover={{ scale: 1.05, background: '#7f1d1d' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAnnuler(r.id)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '10px',
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <XCircle size={14} />
                                Annuler
                              </motion.button>
                            )}
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '10px',
                                background: '#2a2a2a',
                                color: '#9ca3af',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px'
                              }}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              {isExpanded ? 'Réduire' : 'Détails'}
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              marginTop: '20px',
                              paddingTop: '20px',
                              borderTop: '1px solid #2a2a2a'
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                              {r.description_probleme && (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Description du problème
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.5 }}>
                                    "{r.description_probleme}"
                                  </div>
                                </div>
                              )}
                              
                              {r.prestataire_adresse && (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Adresse du garage
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={14} />
                                    {r.prestataire_adresse}
                                  </div>
                                </div>
                              )}
                              
                              {r.prestataire_telephone && (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Contact
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Phone size={14} />
                                    {r.prestataire_telephone}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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