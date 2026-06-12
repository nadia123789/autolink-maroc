import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Car, 
  Wrench, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Package,
  ArrowRight,
  BarChart3,
  Star
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const STATUT = {
  en_attente: { label: 'En attente', class: 'badge-warning', icon: Clock, color: '#f59e0b' },
  confirme:   { label: 'Confirmé',   class: 'badge-info', icon: CheckCircle, color: '#3b82f6' },
  en_cours:   { label: 'En cours',   class: 'badge-gold', icon: Wrench, color: '#f97316' },
  termine:    { label: 'Terminé',    class: 'badge-success', icon: CheckCircle, color: '#10b981' },
  annule:     { label: 'Annulé',     class: 'badge-danger', icon: AlertTriangle, color: '#ef4444' },
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

export default function GestDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/gestionnaire')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ padding: '32px 40px' }}>
        {/* Header */}
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
                    <Users size={32} />
                  </motion.div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 }}>
                    Tableau de bord
                  </h1>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ opacity: 0.9, fontSize: '16px' }}
                >
                  Bonjour, {user?.prenom}. Voici l'activité de votre établissement.
                </motion.p>
              </div>
            </div>
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
        ) : !data ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="alert alert-warning"
            style={{ 
              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
              border: '1px solid #ef4444',
              borderRadius: '16px',
              padding: '20px',
              color: '#fca5a5',
              textAlign: 'center'
            }}
          >
            <AlertTriangle size={24} style={{ marginBottom: '12px' }} />
            <strong>⚠️ Aucun établissement configuré.</strong>
            <p style={{ marginTop: '8px' }}>Créez votre profil prestataire d'abord.</p>
          </motion.div>
        ) : (
          <>
            {/* KPI Stats Cards */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid-4" 
              style={{ marginBottom: '32px', gap: '24px' }}
            >
              {[
                { icon: Calendar, number: data.rdvStats?.total || 0, label: 'RDV total', color: '#ef4444' },
                { icon: Clock, number: data.rdvStats?.en_attente || 0, label: 'En attente', color: '#f59e0b' },
                { icon: CheckCircle, number: data.rdvStats?.termines || 0, label: 'Terminés', color: '#10b981' },
                { icon: DollarSign, number: `${data.revenus?.total_mois || 0} MAD`, label: 'Revenus ce mois', color: '#fbbf24' },
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
                          fontSize: typeof s.number === 'string' ? '24px' : '36px', 
                          fontWeight: 'bold',
                          color: s.color,
                          fontFamily: 'var(--font-display)'
                        }}
                      >
                        {s.number}
                      </motion.div>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500' }}>
                      {s.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stock Alerts */}
            <AnimatePresence>
              {data.alertesStock?.length > 0 && (
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
                    <Package size={24} color="#fca5a5" />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#fca5a5' }}>⚠️ Stock faible</strong>
                    <p style={{ color: '#fed7aa', marginTop: '4px', fontSize: '14px' }}>
                      {data.alertesStock.map(p => `${p.nom} (${p.quantite_stock} restants)`).join(', ')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid-2" style={{ gap: '32px' }}>
              {/* RDV du jour */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                    <Calendar size={24} /> Rendez-vous aujourd'hui
                  </h2>
                  <span className="badge" style={{ 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: 'white',
                    fontSize: '14px',
                    padding: '4px 12px'
                  }}>
                    {data.rdvAujourdhui?.length || 0}
                  </span>
                </div>
                
                <AnimatePresence>
                  {!data.rdvAujourdhui?.length ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card"
                      style={{ 
                        textAlign: 'center', 
                        padding: '48px',
                        background: '#1a1a1a',
                        borderRadius: '20px',
                        border: '1px solid rgba(220, 38, 38, 0.2)'
                      }}
                    >
                      <Calendar size={48} color="#4b5563" style={{ marginBottom: '16px' }} />
                      <p style={{ color: '#9ca3af' }}>Aucun rendez-vous aujourd'hui.</p>
                    </motion.div>
                  ) : (
                    data.rdvAujourdhui.map((r, index) => {
                      const status = STATUT[r.statut] || { label: r.statut, class: 'badge-gray', icon: Clock, color: '#6b7280' };
                      const StatusIcon = status.icon;
                      
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -3 }}
                          className="card"
                          style={{ 
                            marginBottom: '12px',
                            background: '#1a1a1a',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid rgba(220, 38, 38, 0.2)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                              minWidth: '70px',
                              textAlign: 'center',
                              background: '#0f0f0f',
                              borderRadius: '12px',
                              padding: '10px',
                            }}>
                              <div style={{ color: '#ef4444', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '20px', lineHeight: 1 }}>
                                {new Date(r.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '16px', color: 'white' }}>{r.prenom} {r.nom}</div>
                              <div style={{ color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                <Car size={12} />
                                {r.marque} {r.modele} {r.immatriculation && `(${r.immatriculation})`}
                              </div>
                            </div>
                            <span className={`badge ${status.class}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <StatusIcon size={12} />
                              {status.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Revenus mensuels */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                    <TrendingUp size={24} /> Revenus (6 derniers mois)
                  </h2>
                </div>
                
                <AnimatePresence>
                  {!data.revenusMensuels?.length ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card"
                      style={{ 
                        textAlign: 'center', 
                        padding: '48px',
                        background: '#1a1a1a',
                        borderRadius: '20px',
                        border: '1px solid rgba(220, 38, 38, 0.2)'
                      }}
                    >
                      <BarChart3 size={48} color="#4b5563" style={{ marginBottom: '16px' }} />
                      <p style={{ color: '#9ca3af' }}>Pas encore de données.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="card"
                      style={{ 
                        padding: '24px',
                        background: '#1a1a1a',
                        borderRadius: '20px',
                        border: '1px solid rgba(220, 38, 38, 0.2)'
                      }}
                    >
                      {data.revenusMensuels.map((m, i) => {
                        const max = Math.max(...data.revenusMensuels.map(x => x.total));
                        const pct = max > 0 ? (m.total / max) * 100 : 0;
                        return (
                          <motion.div 
                            key={i} 
                            style={{ marginBottom: '20px' }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="flex-between" style={{ marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>{m.mois}</span>
                              <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-display)', fontSize: '15px' }}>
                                {Number(m.total).toLocaleString()} MAD
                              </span>
                            </div>
                            <div style={{ height: '8px', background: '#0f0f0f', borderRadius: '4px', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                style={{
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Additional Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '32px'
              }}
            >
              <div style={{
                background: '#1a1a1a',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Star size={20} color="#f59e0b" />
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>Taux de satisfaction</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {data.satisfaction || 0}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  avis clients
                </div>
              </div>

              <div style={{
                background: '#1a1a1a',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Users size={20} color="#3b82f6" />
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>Clients uniques</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {data.clientsUniques || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  ce mois-ci
                </div>
              </div>

              <div style={{
                background: '#1a1a1a',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Wrench size={20} color="#10b981" />
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>Prestations populaires</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#10b981' }}>
                  {data.prestationsPopulaires?.slice(0, 2).map(p => p.nom).join(', ') || '—'}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  les plus demandées
                </div>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}