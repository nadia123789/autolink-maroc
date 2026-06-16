import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  CheckCircle,
  Wrench,
  PaintBucket,
  Zap,
  Truck,
  Shield,
  ClipboardCheck,
  Building2,
  ChevronLeft,
  ChevronRight
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
      staggerChildren: 0.05
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
          size={16}
          color={i <= Math.round(n) ? '#fbbf24' : '#e5e7eb'}
          fill={i <= Math.round(n) ? '#fbbf24' : 'none'}
        />
      ))}
    </div>
  );
}

function PrestateurCard({ p, index }) {
  const { t } = useTranslation();
  const note = parseFloat(p.note_moyenne) || 0;
  
  const CAT_ICONS = {
    garage: { icon: Wrench, color: '#dc2626' },
    carrosserie: { icon: PaintBucket, color: '#f59e0b' },
    electricite: { icon: Zap, color: '#3b82f6' },
    depannage: { icon: Truck, color: '#ef4444' },
    assurance: { icon: Shield, color: '#10b981' },
    controle_technique: { icon: ClipboardCheck, color: '#8b5cf6' }
  };
  
  const catInfo = CAT_ICONS[p.categorie] || { icon: Building2, color: '#6b7280' };
  const Icon = catInfo.icon;

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -10 }}
    >
      <Link to={`/prestataires/${p.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          height: '100%',
          border: '1px solid #f0f0f0',
          transition: 'all 0.3s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(220,38,38,0.1)';
          e.currentTarget.style.borderColor = '#dc2626';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
          e.currentTarget.style.borderColor = '#f0f0f0';
        }}>
          
          {/* Header - Logo/Categorie */}
          <div style={{
            height: '120px',
            background: `linear-gradient(135deg, ${catInfo.color}10 0%, ${catInfo.color}05 100%)`,
            borderRadius: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: `1px solid ${catInfo.color}20`
          }}>
            {p.logo ? (
              <img 
                src={p.logo} 
                alt={p.nom} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  padding: '4px'
                }} 
              />
            ) : (
              <Icon size={48} color={catInfo.color} />
            )}
          </div>

          {/* Badges */}
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{
              background: 'rgba(220,38,38,0.1)',
              color: '#dc2626',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              {t(`categories.${p.categorie}`, p.categorie)}
            </span>
            {p.est_verifie && (
              <span style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle size={12} /> {t('provider.verified')}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#1a1a2e'
          }}>
            {p.nom}
          </h3>

          {/* Address */}
          <div style={{
            color: '#6b7280',
            fontSize: '13px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <MapPin size={14} color="#dc2626" />
            {p.ville}{p.adresse ? ` — ${p.adresse.substring(0, 35)}${p.adresse.length > 35 ? '…' : ''}` : ''}
          </div>

          {/* Rating */}
          <div className="flex gap-sm" style={{ alignItems: 'center', marginBottom: '12px' }}>
            <Stars note={note} />
            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '14px' }}>
              {note > 0 ? note.toFixed(1) : t('provider.new')}
            </span>
            {p.total_avis > 0 && (
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                ({p.total_avis} avis)
              </span>
            )}
          </div>

          {/* Phone */}
          {p.telephone && (
            <div style={{
              marginTop: '12px',
              fontSize: '13px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingTop: '12px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Phone size={14} color="#dc2626" />
              {p.telephone}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function PrestatairesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [ville, setVille] = useState(searchParams.get('ville') || '');
  const [categorie, setCategorie] = useState(searchParams.get('categorie') || '');
  const [page, setPage] = useState(1);

  const CATEGORIES = [
    { id: '', label: 'Tous', icon: Building2 },
    { id: 'garage', label: 'Mécanique', icon: Wrench },
    { id: 'carrosserie', label: 'Carrosserie', icon: PaintBucket },
    { id: 'electricite', label: 'Électricité', icon: Zap },
    { id: 'depannage', label: 'Dépannage', icon: Truck },
    { id: 'assurance', label: 'Assurance', icon: Shield },
    { id: 'controle_technique', label: 'Contrôle technique', icon: ClipboardCheck },
  ];

  const fetchPrestataires = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (q) params.q = q;
      if (ville) params.ville = ville;
      if (categorie) params.categorie = categorie;
      const { data } = await api.get('/prestataires', { params });
      setPrestataires(data.data);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [q, ville, categorie, page]);

  useEffect(() => { fetchPrestataires(); }, [fetchPrestataires]);

  const handleSearch = (e) => { 
    e.preventDefault(); 
    setPage(1); 
    fetchPrestataires(); 
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '32px' }}
        >
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '36px',
            fontWeight: 800,
            color: '#dc2626',
            marginBottom: '8px'
          }}>
            {t('nav.prestataires')}
          </h1>
          <p style={{ color: '#6b7280' }}>
            {total} {t('nav.prestataires').toLowerCase()} trouvés
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: '12px', flexWrap: 'wrap',
            background: 'white', border: '1px solid #e5e7eb',
            borderRadius: '20px', padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: '24px'
          }}>
            <div style={{ flex: 2, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#dc2626' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '42px', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                placeholder={t('home.search_placeholder')}
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#dc2626' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '42px', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                placeholder={t('home.city_placeholder')}
                value={ville}
                onChange={e => setVille(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '12px' }}
              value={categorie}
              onChange={e => setCategorie(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-gold"
              style={{ background: '#dc2626', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              {t('home.search_btn')}
            </motion.button>
          </form>
        </motion.div>

        {/* Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-sm"
          style={{ flexWrap: 'wrap', marginBottom: '32px', gap: '10px' }}
        >
          {CATEGORIES.map(c => {
            const Icon = c.icon;
            const isActive = categorie === c.id;
            return (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setCategorie(c.id); setPage(1); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '40px',
                  background: isActive ? '#dc2626' : 'white',
                  color: isActive ? 'white' : '#4b5563',
                  border: isActive ? 'none' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.3s'
                }}
              >
                <Icon size={16} />
                {c.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Results */}
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
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                  width: '50px',
                  height: '50px',
                  border: '3px solid #dc2626',
                  borderTopColor: 'transparent',
                  borderRadius: '50%'
                }}
              />
            </motion.div>
          ) : prestataires.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                textAlign: 'center',
                padding: '80px',
                background: 'white',
                borderRadius: '24px',
                border: '1px solid #e5e7eb'
              }}
            >
              <Search size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#dc2626', marginBottom: '12px' }}>Aucun prestataire trouvé</h3>
              <p style={{ color: '#6b7280' }}>Essayez d'autres critères de recherche</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid-3"
              style={{ gap: '24px' }}
            >
              {prestataires.map((p, index) => (
                <PrestateurCard key={p.id} p={p} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-center gap-md"
            style={{
              marginTop: '48px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '10px',
                background: 'white',
                border: '1px solid #e5e7eb',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1,
                color: '#4b5563'
              }}
            >
              <ChevronLeft size={16} /> Précédent
            </motion.button>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Page {page} sur {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '10px',
                background: 'white',
                border: '1px solid #e5e7eb',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.5 : 1,
                color: '#4b5563'
              }}
            >
              Suivant <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </div>
    </main>
  );
}