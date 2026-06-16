import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  X
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

function Stars({ note, size = 18, interactive = false, onStarClick, onStarHover, hover }) {
  const n = parseFloat(note) || 0;
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <motion.button
          key={i}
          whileHover={interactive ? { scale: 1.2 } : {}}
          whileTap={interactive ? { scale: 0.9 } : {}}
          onClick={() => interactive && onStarClick && onStarClick(i)}
          onMouseEnter={() => interactive && onStarHover && onStarHover(i)}
          onMouseLeave={() => interactive && onStarHover && onStarHover(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: interactive ? 'pointer' : 'default',
            padding: 0,
            display: 'flex'
          }}
          type="button"
        >
          <Star
            size={size}
            color={(interactive ? (hover || n) : n) >= i ? '#fbbf24' : '#d1d5db'}
            fill={(interactive ? (hover || n) : n) >= i ? '#fbbf24' : 'none'}
          />
        </motion.button>
      ))}
    </div>
  );
}

export default function PrestatairePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('prestations');
  
  // Avis form states
  const [showAvisForm, setShowAvisForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const prestataireRes = await api.get(`/prestataires/${id}`);
        const avisRes = await api.get(`/avis/prestataire/${id}`);
        
        setData({
          ...prestataireRes.data,
          avis: avisRes.data || []
        });
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleAvisSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate(`/login?redirect=/prestataires/${id}`);
      return;
    }
    
    if (user?.role !== 'client') {
      setFormError('Seuls les clients peuvent laisser un avis.');
      return;
    }
    
    if (rating === 0) {
      setFormError('Veuillez donner une note');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/avis', {
        prestataire_id: parseInt(id),
        note: rating,
        commentaire: commentaire
      });

      // Refresh avis
      const avisRes = await api.get(`/avis/prestataire/${id}`);
      setData(prev => ({
        ...prev,
        avis: avisRes.data || []
      }));

      // Reset form
      setShowAvisForm(false);
      setRating(0);
      setCommentaire('');
      setFormError('');
      
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la publication de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle "Donner mon avis" button click
  const handleGiveAvis = () => {
    if (!user) {
      navigate(`/login?redirect=/prestataires/${id}?tab=avis`);
      return;
    }
    setShowAvisForm(true);
  };

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
  const totalAvis = data.avis?.length || 0;

  // Map category to icon and color
  const CAT_ICONS = {
    garage: { icon: Wrench, color: '#dc2626' },
    carrosserie: { icon: Wrench, color: '#f59e0b' },
    electricite: { icon: Wrench, color: '#3b82f6' },
    depannage: { icon: Wrench, color: '#ef4444' },
    assurance: { icon: Wrench, color: '#10b981' },
    controle_technique: { icon: Wrench, color: '#8b5cf6' }
  };
  
  const catInfo = CAT_ICONS[data.categorie] || { icon: Wrench, color: '#dc2626' };
  const Icon = catInfo.icon;

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
                background: data.logo ? 'white' : `linear-gradient(135deg, ${catInfo.color}10 0%, ${catInfo.color}05 100%)`,
                border: `1px solid ${data.logo ? '#e5e7eb' : catInfo.color + '20'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {data.logo ? (
                <img 
                  src={data.logo} 
                  alt={data.nom} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    padding: '8px'
                  }} 
                />
              ) : (
                <Icon size={56} color={catInfo.color} />
              )}
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
                    ({totalAvis} avis)
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
              {/* Add Avis Button */}
              {!showAvisForm && (
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGiveAvis}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '24px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                  onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
                >
                  <MessageSquare size={18} />
                  Donner mon avis
                </motion.button>
              )}

              {/* Avis Form - Only show if user is logged in as client */}
              {showAvisForm && user && user?.role === 'client' && (
                <motion.div
                  variants={fadeInUp}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '32px',
                    marginBottom: '24px',
                    border: '1px solid #e5e7eb',
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={() => {
                      setShowAvisForm(false);
                      setFormError('');
                    }}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      color: '#6b7280',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <X size={24} />
                  </button>

                  <h3 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '8px'
                  }}>
                    Donner mon avis
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '24px',
                    fontSize: '14px'
                  }}>
                    Pour {data.nom}
                  </p>

                  {formError && (
                    <div style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      padding: '12px',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      fontSize: '14px'
                    }}>
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleAvisSubmit}>
                    {/* Rating */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontWeight: 600,
                        color: '#1a1a2e',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        Votre note
                      </label>
                      <Stars
                        note={rating}
                        size={40}
                        interactive={true}
                        onStarClick={setRating}
                        onStarHover={setHover}
                        hover={hover}
                      />
                      {rating > 0 && (
                        <p style={{
                          marginTop: '8px',
                          color: '#6b7280',
                          fontSize: '13px'
                        }}>
                          Vous avez donné {rating} étoile{rating > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        fontWeight: 600,
                        color: '#1a1a2e',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        Votre commentaire (optionnel)
                      </label>
                      <textarea
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Partagez votre expérience avec ce prestataire..."
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          fontSize: '14px',
                          minHeight: '100px',
                          resize: 'vertical',
                          fontFamily: "'Inter', sans-serif",
                          transition: 'border-color 0.3s'
                        }}
                        maxLength={500}
                      />
                      <div style={{
                        textAlign: 'right',
                        fontSize: '12px',
                        color: '#9ca3af',
                        marginTop: '4px'
                      }}>
                        {commentaire.length}/500
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAvisForm(false);
                          setFormError('');
                        }}
                        style={{
                          padding: '12px 24px',
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          fontWeight: 600,
                          color: '#4b5563',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >
                        Annuler
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting || rating === 0}
                        style={{
                          padding: '12px 32px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: 600,
                          cursor: (submitting || rating === 0) ? 'not-allowed' : 'pointer',
                          opacity: (submitting || rating === 0) ? 0.6 : 1,
                          transition: 'all 0.3s'
                        }}
                      >
                        {submitting ? 'Publication...' : 'Publier mon avis'}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Avis List */}
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
                  <h3 style={{ color: '#1a1a2e', marginBottom: '8px' }}>Aucun avis pour le moment</h3>
                  <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                    Soyez le premier à donner votre avis sur ce prestataire
                  </p>
                </motion.div>
              ) : (
                <div style={{ maxWidth: '800px' }}>
                  {data.avis.map((a, index) => (
                    <motion.div
                      key={a.id || index}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {a.avatar ? (
                            <img 
                              src={a.avatar} 
                              alt={`${a.prenom} ${a.nom}`}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
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
                              fontSize: '18px',
                              flexShrink: 0
                            }}>
                              {a.prenom?.[0] || a.nom?.[0] || 'U'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: '#1a1a2e' }}>
                              {a.prenom} {a.nom?.[0] || ''}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                              {a.date_creation 
                                ? new Date(a.date_creation).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : 'Date inconnue'
                              }
                            </div>
                          </div>
                        </div>
                        <div>
                          <Stars note={a.note || 0} />
                        </div>
                      </div>
                      
                      {a.commentaire && (
                        <p style={{
                          color: '#4b5563',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          marginBottom: '16px',
                          fontStyle: 'italic'
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