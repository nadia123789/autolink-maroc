import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  CheckCircle, 
  Wrench, 
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  FileText,
  User,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const statutBadge = {
  en_attente: { label: 'En attente', class: 'badge-warning', icon: Clock },
  confirme:   { label: 'Confirmé',   class: 'badge-info', icon: CheckCircle },
  en_cours:   { label: 'En cours',   class: 'badge-gold', icon: Wrench },
  termine:    { label: 'Terminé',    class: 'badge-success', icon: CheckCircle },
  annule:     { label: 'Annulé',     class: 'badge-danger', icon: AlertTriangle },
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

export default function ClientDashboard() {
  const { user } = useAuth();
  const [vehicules, setVehicules] = useState([]);
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vehicules: 0,
    upcoming: 0,
    completed: 0,
    inProgress: 0
  });

  useEffect(() => {
    Promise.all([
      api.get('/vehicules'),
      api.get('/rdv'),
    ]).then(([v, r]) => {
      setVehicules(v.data);
      setRdv(r.data.slice(0, 5));
      
      const rdvData = r.data;
      setStats({
        vehicules: v.data.length,
        upcoming: rdvData.filter(r => ['en_attente', 'confirme'].includes(r.statut)).length,
        completed: rdvData.filter(r => r.statut === 'termine').length,
        inProgress: rdvData.filter(r => r.statut === 'en_cours').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const hasExpiringDocuments = (vehicule) => {
    const soon = (date) => {
      if (!date) return false;
      const diff = new Date(date) - new Date();
      return diff < 30 * 24 * 3600 * 1000 && diff > 0;
    };
    return soon(vehicule.date_assurance) || 
           soon(vehicule.date_vignette) || 
           soon(vehicule.date_visite_technique);
  };

  const getDaysUntilExpiry = (date) => {
    if (!date) return null;
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Calculate meaningful indicators based on real data
  const getCompletionRate = () => {
    const total = stats.completed + stats.inProgress + stats.upcoming;
    if (total === 0) return 0;
    return Math.round((stats.completed / total) * 100);
  };

  const getUpcomingPercentage = () => {
    const total = stats.upcoming + stats.inProgress;
    if (total === 0) return 0;
    return Math.round((stats.upcoming / total) * 100);
  };

  const getAveragePerVehicle = () => {
    if (stats.vehicules === 0) return 0;
    const totalRdvs = stats.completed + stats.inProgress + stats.upcoming;
    return (totalRdvs / stats.vehicules).toFixed(1);
  };

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ padding: '32px 40px' }}>
        {/* Animated Header with red gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          style={{ 
            background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '32px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(220, 38, 38, 0.3)'
          }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%'
            }}
          />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <User size={32} />
                  </motion.div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 }}>
                    Bonjour, {user?.prenom}
                  </h1>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ opacity: 0.9, fontSize: '16px' }}
                >
                  Bienvenue sur votre espace client AutoLink Maroc
                </motion.p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/client/rdv/nouveau" style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'white',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                  <Plus size={20} />
                  Nouveau rendez-vous
                </Link>
              </motion.div>
            </div>
            
            {/* Quick actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}
            >
              {[
                { icon: Car, label: 'Mes véhicules', link: '/client/vehicules' },
                { icon: Calendar, label: 'Mes RDV', link: '/client/rdv' },
                { icon: FileText, label: 'Documents', link: '/client/documents' },
                { icon: Settings, label: 'Paramètres', link: '/client/profile' },
              ].map((action, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={action.link} style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'white',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}>
                    <action.icon size={18} />
                    {action.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loader"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: '50px',
                height: '50px',
                border: '4px solid #dc2626',
                borderTopColor: 'transparent',
                borderRadius: '50%'
              }}
            />
          </motion.div>
        ) : (
          <>
            {/* Stats Cards with REAL calculated indicators */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid-4" 
              style={{ marginBottom: '32px', gap: '24px' }}
            >
              {[
                { 
                  icon: Car, 
                  number: stats.vehicules, 
                  label: 'Véhicule(s)', 
                  color: '#ef4444',
                  indicator: stats.vehicules === 0 ? 'Ajoutez votre 1er' : stats.vehicules === 1 ? 'Véhicule principal' : `${stats.vehicules} véhicules`,
                  iconColor: '#ef4444'
                },
                { 
                  icon: Calendar, 
                  number: stats.upcoming, 
                  label: 'RDV à venir', 
                  color: '#f97316',
                  indicator: stats.upcoming === 0 ? 'Aucun à venir' : stats.upcoming === 1 ? 'Prochainement' : `${stats.upcoming} rendez-vous`,
                  iconColor: '#f97316'
                },
                { 
                  icon: CheckCircle, 
                  number: stats.completed, 
                  label: 'Interventions terminées', 
                  color: '#10b981',
                  indicator: `${getCompletionRate()}% de complétion`,
                  iconColor: '#10b981'
                },
                { 
                  icon: Wrench, 
                  number: stats.inProgress, 
                  label: 'En cours', 
                  color: '#dc2626',
                  indicator: stats.inProgress === 0 ? 'Aucun en cours' : `${stats.inProgress} intervention(s) active(s)`,
                  iconColor: '#dc2626'
                },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 10px 30px rgba(220, 38, 38, 0.2)',
                    cursor: 'pointer',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '200px',
                      height: '200px',
                      background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`,
                      borderRadius: '50%'
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <s.icon size={32} color={s.color} />
                      </motion.div>
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                        style={{ 
                          fontSize: '36px', 
                          fontWeight: 'bold',
                          color: s.color,
                          fontFamily: 'var(--font-display)'
                        }}
                      >
                        {s.number}
                      </motion.div>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      {s.label}
                    </div>
                    {s.indicator && (
                      <motion.div 
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ 
                          fontSize: '11px', 
                          color: s.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: `${s.color}20`,
                          padding: '4px 8px',
                          borderRadius: '20px',
                          width: 'fit-content'
                        }}
                      >
                        <TrendingUp size={10} />
                        {s.indicator}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Additional creative stats row */}
            {(stats.vehicules > 0 || stats.completed > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '32px'
                }}
              >
                {stats.vehicules > 0 && (
                  <div style={{
                    background: '#1a1a1a',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid rgba(220, 38, 38, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <TrendingUp size={20} color="#10b981" />
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>Moyenne RDV/véhicule</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                      {getAveragePerVehicle()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      interventions par véhicule
                    </div>
                  </div>
                )}
                
                {stats.upcoming > 0 && (
                  <div style={{
                    background: '#1a1a1a',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid rgba(220, 38, 38, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Calendar size={20} color="#f97316" />
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>Taux de RDV à venir</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>
                      {getUpcomingPercentage()}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      des RDV actifs
                    </div>
                  </div>
                )}

                {stats.completed > 0 && (
                  <div style={{
                    background: '#1a1a1a',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid rgba(220, 38, 38, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <CheckCircle size={20} color="#10b981" />
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>Historique total</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                      {stats.completed}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      interventions réalisées
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Expiry Alerts - Real data only */}
            <AnimatePresence>
              {vehicules.some(hasExpiringDocuments) && (
                <motion.div 
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                    border: '1px solid #ef4444',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 5px 20px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <AlertTriangle size={24} color="#fca5a5" />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#fca5a5' }}>⚠️ Documents bientôt expirés</strong>
                    <p style={{ color: '#fed7aa', marginTop: '4px', fontSize: '14px' }}>
                      Certains documents de vos véhicules expirent dans moins de 30 jours. 
                      <Link to="/client/vehicules" style={{ color: '#fca5a5', fontWeight: '600', marginLeft: '8px', textDecoration: 'underline' }}>
                        Vérifier maintenant →
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid-2" style={{ gap: '32px' }}>
              {/* Vehicles Section - Real data */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                  <motion.h2 
                    whileHover={{ x: 5 }}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}
                  >
                    <Car size={24} /> Mes véhicules
                  </motion.h2>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/client/vehicules" style={{
                      color: '#ef4444',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Gérer <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                </div>
                
                <AnimatePresence>
                  {vehicules.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{
                        background: '#1a1a1a',
                        borderRadius: '20px',
                        padding: '48px',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                      }}
                    >
                      <Car size={48} color="#4b5563" style={{ marginBottom: '16px' }} />
                      <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Aucun véhicule enregistré.</p>
                      <Link to="/client/vehicules" style={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}>
                        Ajouter un véhicule
                      </Link>
                    </motion.div>
                  ) : (
                    vehicules.map((v, index) => {
                      const hasExpiry = hasExpiringDocuments(v);
                      const daysUntilExpiry = Math.min(
                        getDaysUntilExpiry(v.date_assurance) || Infinity,
                        getDaysUntilExpiry(v.date_vignette) || Infinity,
                        getDaysUntilExpiry(v.date_visite_technique) || Infinity
                      );
                      
                      return (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -3 }}
                          style={{
                            background: '#1a1a1a',
                            borderRadius: '16px',
                            padding: '20px',
                            marginBottom: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease',
                            borderLeft: hasExpiry ? '4px solid #ef4444' : '4px solid #10b981'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Car size={30} color="white" />
                            </motion.div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '4px', color: 'white' }}>
                                {v.marque} {v.modele}
                              </div>
                              <div style={{ color: '#9ca3af', fontSize: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <span>{v.immatriculation}</span>
                                <span>•</span>
                                <span>{v.annee}</span>
                                <span>•</span>
                                <span>{v.kilometrage?.toLocaleString()} km</span>
                              </div>
                              {hasExpiry && (
                                <motion.div 
                                  animate={{ x: [0, -5, 5, 0] }}
                                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                  style={{ 
                                    marginTop: '8px', 
                                    fontSize: '12px', 
                                    color: '#fca5a5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <AlertTriangle size={14} />
                                  Expire dans {daysUntilExpiry} jour(s)
                                </motion.div>
                              )}
                            </div>
                            <motion.div
                              animate={hasExpiry ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 1, repeat: Infinity }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: hasExpiry ? '#7f1d1d' : '#064e3b',
                                color: hasExpiry ? '#fca5a5' : '#10b981'
                              }}
                            >
                              {hasExpiry ? '⚠️ Attention' : '✓ À jour'}
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Appointments Section - Real data */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                  <motion.h2 
                    whileHover={{ x: 5 }}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}
                  >
                    <Calendar size={24} /> Mes rendez-vous
                  </motion.h2>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/client/rdv" style={{
                      color: '#ef4444',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Voir tout <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                </div>
                
                <AnimatePresence>
                  {rdv.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{
                        background: '#1a1a1a',
                        borderRadius: '20px',
                        padding: '48px',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                      }}
                    >
                      <Calendar size={48} color="#4b5563" style={{ marginBottom: '16px' }} />
                      <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Aucun rendez-vous programmé.</p>
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
                    rdv.map((r, index) => {
                      const StatIcon = statutBadge[r.statut]?.icon || Clock;
                      const status = statutBadge[r.statut] || { label: r.statut, class: 'badge-gray', icon: Clock };
                      
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          style={{
                            background: '#1a1a1a',
                            borderRadius: '16px',
                            padding: '20px',
                            marginBottom: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div className="flex-between" style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  background: '#2a2a2a',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <StatIcon size={20} color="#ef4444" />
                              </motion.div>
                              <strong style={{ fontSize: '16px', color: 'white' }}>{r.prestataire_nom}</strong>
                            </div>
                            <motion.span
                              animate={r.statut === 'en_cours' ? { scale: [1, 1.05, 1] } : {}}
                              transition={{ duration: 1, repeat: Infinity }}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: status.class === 'badge-warning' ? '#7f1d1d' :
                                            status.class === 'badge-success' ? '#064e3b' :
                                            status.class === 'badge-gold' ? '#78350f' :
                                            status.class === 'badge-danger' ? '#7f1d1d' : '#2a2a2a',
                                color: status.class === 'badge-warning' ? '#fca5a5' :
                                       status.class === 'badge-success' ? '#10b981' :
                                       status.class === 'badge-gold' ? '#fbbf24' :
                                       status.class === 'badge-danger' ? '#fca5a5' : '#9ca3af'
                              }}
                            >
                              {status.label}
                            </motion.span>
                          </div>
                          
                          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Car size={14} />
                            {r.marque} {r.modele}
                          </div>
                          
                          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} />
                            {new Date(r.date_rdv).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          
                          {r.prestation_nom && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              style={{ 
                                marginTop: '12px', 
                                padding: '8px 12px',
                                background: '#7f1d1d',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#fca5a5',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <Wrench size={14} />
                              {r.prestation_nom}
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}