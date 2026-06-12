import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Phone, 
  Star, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Wrench,
  Calendar,
  MessageSquare,
  ThumbsUp,
  User,
  Mail,
  ArrowRight
} from 'lucide-react';
import api from '../utils/api';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function Stars({ note }) {
  const n = parseFloat(note) || 0;
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={18}
          color={i <= Math.round(n) ? '#fbbf24' : '#d1d5db'}
          fill={i <= Math.round(n) ? '#fbbf24' : 'none'}
        />
      ))}
    </div>
  );
}

export default function PrestatairePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('prestations');

  useEffect(() => {
    api.get(`/prestataires/${id}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          width: '50px',
          height: '50px',
          border: '3px solid #dc2626',
          borderTopColor: 'transparent',
          borderRadius: '50%'
        }}
      />
    </div>
  );
  
  if (!data) return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
        <Wrench size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Prestataire introuvable</h3>
        <Link to="/prestataires" style={{ color: '#dc2626', textDecoration: 'none' }}>← Retour à la liste</Link>
      </div>
    </div>
  );

  const note = parseFloat(data.note_moyenne) || 0;

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Section - White Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '48px 40px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            {/* Logo/Icon */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(220,38,38,0.05) 100%)',
                border: '1px solid rgba(220,38,38,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Wrench size={56} color="#dc2626" />
            </motion.div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#1a1a2e'
                }}>
                  {data.nom}
                </h1>
                {data.est_verifie && (
                  <span style={{
                    background: '#d1fae5',
                    color: '#065f46',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle size={14} /> {t('provider.verified')}
                  </span>
                )}
              </div>
              
              <div style={{ color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <MapPin size={16} color="#dc2626" />
                {data.adresse}, {data.ville}
              </div>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Stars note={note} />
                  <strong style={{ color: '#dc2626', fontSize: '16px' }}>
                    {note > 0 ? note.toFixed(1) : t('provider.new')}
                  </strong>
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                    ({data.total_avis || 0} avis)
                  </span>
                </div>
                
                {data.telephone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px' }}>
                    <Phone size={14} color="#dc2626" />
                    {data.telephone}
                  </div>
                )}
              </div>

              {data.description && (
                <p style={{
                  color: '#4b5563',
                  marginTop: '16px',
                  maxWidth: '700px',
                  lineHeight: 1.7,
                  fontSize: '15px'
                }}>
                  {data.description}
                </p>
              )}
            </div>

            {/* CTA Button */}
            {user?.role === 'client' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={`/client/rdv/nouveau?prestataire=${data.id}`}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                  onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
                >
                  <Calendar size={18} />
                  {t('provider.take_rdv')}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', padding: '0 40px', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            {[
              { id: 'prestations', label: 'Prestations', icon: Wrench },
              { id: 'avis', label: 'Avis', icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = onglet === tab.id;
              const count = tab.id === 'prestations' 
                ? data.prestations?.length || 0 
                : data.avis?.length || 0;
              
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOnglet(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '16px 0',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '15px',
                    color: isActive ? '#dc2626' : '#6b7280',
                    borderBottom: isActive ? '2px solid #dc2626' : '2px solid transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      background: isActive ? '#dc2626' : '#e5e7eb',
                      color: isActive ? 'white' : '#6b7280',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      marginLeft: '4px'
                    }}>
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
        <AnimatePresence mode="wait">
          {/* Prestations Tab */}
          {onglet === 'prestations' && (
            <motion.div
              key="prestations"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {data.prestations?.length === 0 ? (
                <motion.div
                  variants={fadeInUp}
                  style={{
                    textAlign: 'center',
                    padding: '60px',
                    background: 'white',
                    borderRadius: '20px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <Wrench size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <p style={{ color: '#6b7280' }}>{t('provider.no_service')}</p>
                </motion.div>
              ) : (
                <div className="grid-2" style={{ gap: '20px' }}>
                  {data.prestations.map((p, index) => (
                    <motion.div
                      key={p.id}
                      variants={fadeInUp}
                      whileHover={{ y: -5 }}
                      style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '1px solid #f0f0f0',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#dc2626';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(220,38,38,0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#f0f0f0';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '12px' }}>
                        <h3 style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#1a1a2e'
                        }}>
                          {p.nom}
                        </h3>
                        {p.duree_minutes && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#6b7280',
                            fontSize: '13px'
                          }}>
                            <Clock size={14} /> {p.duree_minutes} min
                          </span>
                        )}
                      </div>
                      
                      {p.description && (
                        <p style={{
                          color: '#6b7280',
                          fontSize: '14px',
                          marginBottom: '16px',
                          lineHeight: 1.6
                        }}>
                          {p.description}
                        </p>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#dc2626',
                        fontWeight: 700,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '18px',
                        paddingTop: '12px',
                        borderTop: '1px solid #f0f0f0',
                        marginTop: '8px'
                      }}>
                        <DollarSign size={18} />
                        {p.prix_min && p.prix_max
                          ? `${p.prix_min} – ${p.prix_max} MAD`
                          : p.prix_min
                            ? `Dès ${p.prix_min} MAD`
                            : 'Sur devis'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Avis Tab */}
          {onglet === 'avis' && (
            <motion.div
              key="avis"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {data.avis?.length === 0 ? (
                <motion.div
                  variants={fadeInUp}
                  style={{
                    textAlign: 'center',
                    padding: '60px',
                    background: 'white',
                    borderRadius: '20px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <p style={{ color: '#6b7280' }}>{t('provider.no_review')}</p>
                  {user?.role === 'client' && (
                    <Link
                      to={`/prestataires/${data.id}/avis`}
                      style={{
                        display: 'inline-block',
                        marginTop: '16px',
                        color: '#dc2626',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      Donner mon avis →
                    </Link>
                  )}
                </motion.div>
              ) : (
                <div style={{ maxWidth: '800px' }}>
                  {data.avis.map((a, index) => (
                    <motion.div
                      key={a.id}
                      variants={fadeInUp}
                      whileHover={{ x: 5 }}
                      style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        marginBottom: '16px',
                        border: '1px solid #f0f0f0',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(220,38,38,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#dc2626',
                            fontSize: '18px'
                          }}>
                            {a.prenom?.[0]}{a.nom?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1a1a2e' }}>
                              {a.prenom} {a.nom?.[0]}.
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                              {new Date(a.date_creation).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Stars note={a.note} />
                        </div>
                      </div>
                      
                      {a.commentaire && (
                        <p style={{
                          color: '#4b5563',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          marginBottom: '16px'
                        }}>
                          "{a.commentaire}"
                        </p>
                      )}
                      
                      {a.reponse_prestataire && (
                        <div style={{
                          marginTop: '16px',
                          padding: '16px',
                          background: '#fef2f2',
                          borderRadius: '12px',
                          borderLeft: '3px solid #dc2626'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#dc2626',
                            marginBottom: '8px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <ThumbsUp size={14} /> Réponse du prestataire
                          </div>
                          <p style={{ color: '#4b5563', fontSize: '13px', lineHeight: 1.5 }}>
                            {a.reponse_prestataire}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}