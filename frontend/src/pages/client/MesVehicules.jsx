import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  Fuel, 
  Palette, 
  Hash, 
  Gauge,
  FileText,
  Shield,
  CheckCircle,
  X,
  Save,
  Clock,
  AlertCircle
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const VIDE = {
  marque: '', modele: '', annee: '', immatriculation: '', couleur: '',
  kilometrage: '', carburant: 'diesel', vin: '',
  date_vignette: '', date_assurance: '', date_visite_technique: '', notes: '',
};

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

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

function VehiculeModal({ vehicule, onClose, onSave }) {
  const [form, setForm] = useState(vehicule || VIDE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const f = (field) => ({
    value: form[field] || '',
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (vehicule?.id) {
        await api.put(`/vehicules/${vehicule.id}`, form);
      } else {
        await api.post('/vehicules', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25 }}
        className="card"
        style={{ 
          width: '100%', 
          maxWidth: '600px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          background: '#1a1a1a',
          border: '1px solid rgba(220, 38, 38, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <motion.h2 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#ef4444' }}
          >
            {vehicule?.id ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
          </motion.h2>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
          >
            <X size={24} />
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="alert alert-error"
              style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444' }}
            >
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Marque *</label>
              <input className="form-input" required placeholder="Dacia" {...f('marque')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Modèle *</label>
              <input className="form-input" required placeholder="Logan" {...f('modele')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Année</label>
              <input className="form-input" type="number" min="1990" max="2030" placeholder="2020" {...f('annee')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Immatriculation</label>
              <input className="form-input" placeholder="123-A-45" {...f('immatriculation')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Kilométrage</label>
              <input className="form-input" type="number" placeholder="75000" {...f('kilometrage')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Carburant</label>
              <select className="form-select" {...f('carburant')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }}>
                <option value="diesel">Diesel</option>
                <option value="essence">Essence</option>
                <option value="hybride">Hybride</option>
                <option value="electrique">Électrique</option>
                <option value="gpl">GPL</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Couleur</label>
              <input className="form-input" placeholder="Blanc" {...f('couleur')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>VIN (N° série)</label>
              <input className="form-input" placeholder="VIN17..." {...f('vin')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 600, 
              color: '#ef4444', 
              fontSize: '14px', 
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px'
            }}
          >
            <FileText size={14} style={{ display: 'inline', marginRight: '8px' }} />
            Documents & échéances
          </motion.div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Vignette (expiration)</label>
              <input className="form-input" type="date" {...f('date_vignette')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#ef4444' }}>Assurance (expiration)</label>
              <input className="form-input" type="date" {...f('date_assurance')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color: '#ef4444' }}>Visite technique (expiration)</label>
            <input className="form-input" type="date" {...f('date_visite_technique')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color: '#ef4444' }}>Notes</label>
            <textarea className="form-textarea" placeholder="Remarques, équipements..." {...f('notes')} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white' }} />
          </div>

          <div className="flex gap-md" style={{ marginTop: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading} 
              className="btn btn-gold btn-full"
              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ display: 'inline-block' }}
                >
                  <Clock size={18} />
                </motion.div>
              ) : vehicule?.id ? <><Save size={18} /> Mettre à jour</> : <><Plus size={18} /> Ajouter</>}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={onClose} 
              className="btn btn-ghost"
            >
              Annuler
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DocAlert({ label, date }) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diff = (d - now) / (1000 * 3600 * 24);
  
  const getIcon = () => {
    if (diff < 0) return <AlertTriangle size={12} />;
    if (diff < 30) return <Clock size={12} />;
    return <Shield size={12} />;
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`badge ${diff < 0 ? 'badge-danger' : diff < 30 ? 'badge-warning' : 'badge-success'}`}
      style={{ 
        fontSize: '11px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {getIcon()} {label} {diff < 0 ? 'expirée' : diff < 30 ? `dans ${Math.ceil(diff)}j` : 'OK'}
    </motion.span>
  );
}

export default function MesVehicules() {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await api.get('/vehicules');
    setVehicules(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Supprimer ce véhicule ? Cette action est irréversible.')) return;
    setDeletingId(id);
    await api.delete(`/vehicules/${id}`);
    setDeletingId(null);
    fetch();
  };

  const getExpiryStatus = (date) => {
    if (!date) return null;
    const diff = (new Date(date) - new Date()) / (1000 * 3600 * 24);
    if (diff < 0) return 'expired';
    if (diff < 30) return 'warning';
    return 'ok';
  };

  const getStatusColor = (vehicule) => {
    const statuses = ['date_assurance', 'date_vignette', 'date_visite_technique'].map(
      field => getExpiryStatus(vehicule[field])
    );
    if (statuses.includes('expired')) return '#ef4444';
    if (statuses.includes('warning')) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      <AnimatePresence>
        {modal !== null && (
          <VehiculeModal
            vehicule={modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetch(); }}
          />
        )}
      </AnimatePresence>
      <main className="dashboard-content" style={{ padding: '32px 40px' }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-between" 
          style={{ marginBottom: '32px' }}
        >
          <div>
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Mes véhicules
            </motion.h1>
            <motion.p 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ color: '#9ca3af', marginTop: '4px' }}
            >
              {vehicules.length} véhicule(s) enregistré(s)
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModal({})} 
            className="btn btn-gold"
            style={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} /> Ajouter un véhicule
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="loader" 
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: '60px',
                  height: '60px',
                  border: '3px solid #dc2626',
                  borderTopColor: 'transparent',
                  borderRadius: '50%'
                }}
              />
            </motion.div>
          ) : vehicules.length === 0 ? (
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
                style={{ fontSize: '72px', marginBottom: '20px' }}
              >
                <Car size={72} color="#4b5563" />
              </motion.div>
              <motion.h2 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                style={{ fontFamily: 'var(--font-display)', marginBottom: '12px', color: '#ef4444' }}
              >
                Aucun véhicule
              </motion.h2>
              <motion.p 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: '24px', color: '#9ca3af' }}
              >
                Ajoutez votre véhicule pour gérer vos entretiens et documents.
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModal({})} 
                className="btn btn-gold"
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
              >
                Ajouter mon premier véhicule
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid-2"
              style={{ gap: '24px' }}
            >
              {vehicules.map((v, index) => {
                const statusColor = getStatusColor(v);
                return (
                  <motion.div
                    key={v.id}
                    variants={fadeInUp}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    style={{
                      background: '#1a1a1a',
                      borderRadius: '20px',
                      padding: '24px',
                      border: `1px solid ${statusColor}30`,
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
                        background: `radial-gradient(circle, ${statusColor}20 0%, transparent 70%)`,
                        borderRadius: '50%'
                      }}
                    />
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <div className="flex gap-md" style={{ alignItems: 'center' }}>
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '16px',
                              background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}cc 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Car size={30} color="white" />
                          </motion.div>
                          <div>
                            <motion.div 
                              initial={{ x: -10 }}
                              animate={{ x: 0 }}
                              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'white' }}
                            >
                              {v.marque} {v.modele}
                            </motion.div>
                            <div style={{ color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span>{v.annee}</span>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Palette size={12} /> {v.couleur || '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="badge badge-gold"
                          style={{ 
                            background: '#7f1d1d',
                            color: '#fca5a5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Fuel size={12} /> {v.carburant}
                        </motion.span>
                      </div>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '12px', 
                        marginBottom: '20px',
                        background: '#0f0f0f',
                        padding: '12px',
                        borderRadius: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Hash size={10} /> Immatriculation
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'white' }}>{v.immatriculation || '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Gauge size={10} /> Kilométrage
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'white' }}>{v.kilometrage ? `${v.kilometrage.toLocaleString()} km` : '—'}</div>
                        </div>
                      </div>

                      <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: '20px' }}>
                        <DocAlert label="Assurance" date={v.date_assurance} />
                        <DocAlert label="Vignette" date={v.date_vignette} />
                        <DocAlert label="Visite technique" date={v.date_visite_technique} />
                      </div>

                      <div className="flex gap-sm">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setModal(v)} 
                          className="btn btn-ghost btn-sm"
                          style={{ 
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#2a2a2a',
                            color: '#ef4444'
                          }}
                        >
                          <Edit2 size={14} /> Modifier
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, background: '#7f1d1d' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(v.id)} 
                          className="btn btn-danger btn-sm"
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: deletingId === v.id ? '#7f1d1d' : '#dc2626'
                          }}
                        >
                          {deletingId === v.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Clock size={14} />
                            </motion.div>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </motion.button>
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