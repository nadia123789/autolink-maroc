import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Car, 
  Wrench, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Phone,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const STATUTS = ['en_attente', 'confirme', 'en_cours', 'termine', 'annule'];
const STATUT_INFO = {
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

export default function GestRdv() {
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await api.get('/rdv');
    setRdv(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleStatut = async (id, statut) => {
    setUpdating(id);
    try {
      await api.put(`/rdv/${id}/statut`, { statut });
      setRdv(prev => prev.map(r => r.id === id ? { ...r, statut } : r));
    } catch (e) {
      alert('Erreur lors de la mise à jour.');
    } finally {
      setUpdating(null);
    }
  };

  // Filter by status and search
  const filteredRdv = rdv.filter(r => {
    const matchStatus = filtre === 'tous' || r.statut === filtre;
    const matchSearch = searchTerm === '' || 
      r.client_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusCount = (status) => {
    if (status === 'tous') return rdv.length;
    return rdv.filter(r => r.statut === status).length;
  };

  // Helper function to get next status info
  const getNextStatusInfo = (nextStatus) => {
    return STATUT_INFO[nextStatus] || { 
      label: nextStatus, 
      icon: Clock, 
      color: '#6b7280' 
    };
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
              Gestion des rendez-vous
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetch}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              padding: '10px 20px',
              borderRadius: '10px',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={18} />
            Actualiser
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Search size={20} color="#ef4444" />
            <input
              type="text"
              placeholder="Rechercher par client, véhicule ou immatriculation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                flex: 1,
                outline: 'none',
                fontSize: '14px'
              }}
            />
            {searchTerm && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                <XCircle size={16} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
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
            {['tous', ...STATUTS].map(f => {
              const statusInfo = STATUT_INFO[f];
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

        {/* RDV List - Card based layout */}
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
          ) : filteredRdv.length === 0 ? (
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
              <Calendar size={64} color="#4b5563" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>
                Aucun rendez-vous trouvé
              </h3>
              <p style={{ color: '#9ca3af' }}>
                {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Aucun rendez-vous dans cette catégorie.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {filteredRdv.map((r, index) => {
                const status = STATUT_INFO[r.statut] || { label: r.statut, class: 'badge-gray', icon: Clock, color: '#6b7280' };
                const StatusIcon = status.icon;
                const isExpanded = expandedId === r.id;
                const suivants = {
                  en_attente: ['confirme', 'annule'],
                  confirme:   ['en_cours', 'annule'],
                  en_cours:   ['termine'],
                  termine:    [],
                  annule:     [],
                }[r.statut] || [];

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
                      {/* Header */}
                      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}cc 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <User size={24} color="white" />
                          </motion.div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '16px', color: 'white' }}>
                              {r.client_prenom} {r.client_nom}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} />
                              {r.client_tel || 'Tél. non communiqué'}
                            </div>
                          </div>
                        </div>
                        <motion.span
                          animate={r.statut === 'en_cours' ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: `${status.color}20`,
                            color: status.color
                          }}
                        >
                          <StatusIcon size={14} />
                          {status.label}
                        </motion.span>
                      </div>

                      {/* Main Info */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '16px',
                        marginBottom: '16px',
                        padding: '16px',
                        background: '#0f0f0f',
                        borderRadius: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Car size={12} /> VÉHICULE
                          </div>
                          <div style={{ fontWeight: 500, color: 'white' }}>{r.marque} {r.modele}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{r.immatriculation}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> DATE & HEURE
                          </div>
                          <div style={{ fontWeight: 500, color: 'white' }}>
                            {new Date(r.date_rdv).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {new Date(r.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Wrench size={12} /> PRESTATION
                          </div>
                          <div style={{ fontWeight: 500, color: 'white' }}>{r.prestation_nom || '—'}</div>
                          {r.prix_final && (
                            <div style={{ fontSize: '12px', color: '#fbbf24' }}>{r.prix_final} MAD</div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {suivants.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {suivants.map(next => {
                              const nextStatusInfo = getNextStatusInfo(next);
                              const NextIcon = nextStatusInfo.icon;
                              
                              return (
                                <motion.button
                                  key={next}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleStatut(r.id, next)}
                                  disabled={updating === r.id}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    background: next === 'annule' ? '#7f1d1d' : 
                                               next === 'confirme' ? '#065f46' :
                                               next === 'en_cours' ? '#78350f' : '#2a2a2a',
                                    color: next === 'annule' ? '#fca5a5' : 
                                           next === 'confirme' ? '#10b981' :
                                           next === 'en_cours' ? '#fbbf24' : 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  {updating === r.id ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity }}
                                    >
                                      <RefreshCw size={14} />
                                    </motion.div>
                                  ) : (
                                    <NextIcon size={14} />
                                  )}
                                  {nextStatusInfo.label}
                                </motion.button>
                              );
                            })}
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px'
                            }}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {isExpanded ? 'Voir moins' : 'Voir plus'}
                          </motion.button>
                        </div>
                      )}

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              marginTop: '16px',
                              paddingTop: '16px',
                              borderTop: '1px solid #2a2a2a'
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                              {r.description_probleme && (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                                    Description du problème
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.4 }}>
                                    {r.description_probleme}
                                  </div>
                                </div>
                              )}
                              {r.created_at && (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                                    Créé le
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                                    {new Date(r.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
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