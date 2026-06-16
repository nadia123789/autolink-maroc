import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Clock, 
  BookOpen, 
  Save, 
  Plus, 
  Edit2, 
  Trash2,
  X,
  DollarSign,
  AlertCircle,
  Upload,
  Trash
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const CATEGORIES_PREST = ['Entretien', 'Freinage', 'Climatisation', 'Électricité', 'Carrosserie', 'Pneus', 'Vidange', 'Autre'];

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

// ── Logo Upload Component ──
function LogoUpload({ logo, onLogoUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(logo);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(logo);
  }, [logo]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Seuls les formats JPEG, PNG, GIF et WEBP sont autorisés.');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 2MB.');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await api.post('/gestionnaire/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onLogoUpdate(response.data.logo);
      setPreview(response.data.logo);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du téléchargement.');
      setPreview(logo);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Supprimer le logo ?')) return;
    
    setUploading(true);
    try {
      await api.delete('/gestionnaire/logo');
      onLogoUpdate(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Erreur lors de la suppression.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ color: '#ef4444', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
        Logo de l'établissement
      </label>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px',
        padding: '16px',
        background: '#111111',
        borderRadius: '12px',
        border: '1px solid #2a2a2a'
      }}>
        {/* Logo preview */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '2px solid #3a3a3a'
        }}>
          {preview ? (
            <img 
              src={preview.startsWith('http') ? preview : `http://localhost:5000${preview}`}
              alt="Logo"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<Building2 size={32} color="#4b5563" />';
              }}
            />
          ) : (
            <Building2 size={32} color="#4b5563" />
          )}
        </div>

        {/* Upload controls */}
        <div style={{ flex: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="logo-upload"
          />
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                opacity: uploading ? 0.6 : 1
              }}
            >
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Clock size={16} />
                  </motion.div>
                  Téléchargement...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {preview ? 'Changer le logo' : 'Ajouter un logo'}
                </>
              )}
            </motion.button>

            {preview && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRemoveLogo}
                disabled={uploading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '13px',
                  opacity: uploading ? 0.6 : 1
                }}
              >
                <Trash size={16} />
                Supprimer
              </motion.button>
            )}
          </div>

          {error && (
            <div style={{ 
              color: '#fca5a5', 
              fontSize: '12px', 
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          
          <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '6px' }}>
            Formats acceptés : JPEG, PNG, GIF, WEBP • Max 2MB
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal prestation ──
function PrestationModal({ p, onClose, onSave }) {
  const [form, setForm] = useState(p || { nom:'', description:'', categorie:'Entretien', prix_min:'', prix_max:'', duree_minutes:'', est_disponible:true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const f = field => ({ 
    value: form[field] ?? '', 
    onChange: e => setForm(prev => ({ ...prev, [field]: e.target.value })) 
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');
    try {
      if (p?.id) await api.put(`/gestionnaire/prestations/${p.id}`, form);
      else await api.post('/gestionnaire/prestations', form);
      onSave();
    } catch { 
      setError('Erreur lors de l\'enregistrement.');
    }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25 }}
        className="card"
        style={{ 
          width:'100%', 
          maxWidth:'560px', 
          background: '#1a1a1a',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          borderRadius: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between" style={{ marginBottom:'20px' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:700, color: '#ef4444' }}>
            {p?.id ? 'Modifier' : 'Ajouter'} une prestation
          </h2>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}
          >
            <X size={24} />
          </motion.button>
        </div>
        
        {error && (
          <div style={{ background:'#7f1d1d', color:'#fca5a5', padding:'12px', borderRadius:'10px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div className="form-group">
            <label className="form-label" style={{ color:'#ef4444' }}>Nom *</label>
            <input className="form-input" required {...f('nom')} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color:'#ef4444' }}>Catégorie</label>
            <select className="form-select" {...f('categorie')} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }}>
              {CATEGORIES_PREST.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color:'#ef4444' }}>Description</label>
            <textarea className="form-textarea" rows={2} {...f('description')} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ color:'#ef4444' }}>Prix min (MAD)</label>
              <input className="form-input" type="number" {...f('prix_min')} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color:'#ef4444' }}>Prix max (MAD)</label>
              <input className="form-input" type="number" {...f('prix_max')} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color:'#ef4444' }}>Durée (minutes)</label>
            <input className="form-input" type="number" {...f('duree_minutes')} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
          </div>
          <div className="flex gap-md" style={{ marginTop:'8px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading} 
              className="btn btn-gold btn-full"
              style={{ background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
            >
              {loading ? 'Enregistrement…' : (p?.id ? 'Mettre à jour' : 'Ajouter')}
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

// ── Main Component ──
export default function GestProfil() {
  const [tab, setTab] = useState('profil');
  const [profil, setProfil] = useState(null);
  const [prestations, setPrestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    nom: '',
    description: '',
    categorie: 'garage',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    latitude: '',
    longitude: '',
    logo: null,
    horaires: { 
      lun: '08:00-18:00', 
      mar: '08:00-18:00', 
      mer: '08:00-18:00', 
      jeu: '08:00-18:00', 
      ven: '08:00-18:00', 
      sam: '08:00-14:00', 
      dim: 'Fermé' 
    }
  });

  useEffect(() => {
    Promise.all([
      api.get('/gestionnaire/profil'), 
      api.get('/gestionnaire/prestations')
    ])
      .then(([p, pr]) => {
        if (p.data) { 
          setProfil(p.data); 
          setForm(prev => ({ 
            ...prev, 
            ...p.data, 
            horaires: p.data.horaires || prev.horaires,
            logo: p.data.logo || null
          })); 
        }
        setPrestations(pr.data);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setMsg('❌ Erreur lors du chargement des données.');
      })
      .finally(() => setLoading(false));
  }, []);

  const saveProfil = async (e) => {
    e.preventDefault(); 
    setSaving(true); 
    setMsg('');
    try { 
      await api.put('/gestionnaire/profil', form); 
      setMsg('✅ Profil mis à jour avec succès.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { 
      console.error('Save error:', err);
      setMsg('❌ Erreur lors de la sauvegarde.');
    }
    finally { setSaving(false); }
  };

  const deletePrestation = async (id) => {
    if (!window.confirm('⚠️ Supprimer cette prestation ? Cette action est irréversible.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/gestionnaire/prestations/${id}`);
      setPrestations(prev => prev.filter(p => p.id !== id));
      setMsg('✅ Prestation supprimée avec succès.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setMsg('❌ Erreur lors de la suppression.');
    }
    setDeletingId(null);
  };

  const handleLogoUpdate = (logo) => {
    setForm(prev => ({ ...prev, logo }));
    setMsg('✅ Logo mis à jour avec succès.');
    setTimeout(() => setMsg(''), 3000);
  };

  const CATS = ['garage','carrosserie','electricite','depannage','assurance','controle_technique','autre'];
  const JOURS = { lun:'Lundi', mar:'Mardi', mer:'Mercredi', jeu:'Jeudi', ven:'Vendredi', sam:'Samedi', dim:'Dimanche' };

  const tabs = [
    { id: 'profil', label: 'Profil', icon: Building2 },
    { id: 'horaires', label: 'Horaires', icon: Clock },
    { id: 'catalogue', label: 'Catalogue', icon: BookOpen }
  ];

  if (loading) return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
      </main>
    </div>
  );

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      
      <AnimatePresence>
        {modal !== null && (
          <PrestationModal 
            p={modal} 
            onClose={() => setModal(null)} 
            onSave={() => { 
              setModal(null); 
              api.get('/gestionnaire/prestations').then(r => setPrestations(r.data)); 
            }} 
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
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '32px', 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Mon établissement
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '4px' }}>
            Gérez votre profil et votre catalogue de services
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-sm" 
          style={{ marginBottom: '28px', borderBottom: '1px solid #2a2a2a', paddingBottom: '12px' }}
        >
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  background: tab === t.id ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'transparent',
                  color: tab === t.id ? 'white' : '#9ca3af',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: tab === t.id ? '600' : '500',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon size={18} />
                {t.label}
              </motion.button>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="alert"
              style={{ 
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: msg.startsWith('✅') ? '#064e3b' : '#7f1d1d',
                color: msg.startsWith('✅') ? '#10b981' : '#fca5a5',
                border: `1px solid ${msg.startsWith('✅') ? '#10b981' : '#ef4444'}`
              }}
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB PROFIL */}
        {tab === 'profil' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <form onSubmit={saveProfil} style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px', background: '#1a1a1a', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '20px' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>Informations générales</h3>
                
                {/* Logo Upload */}
                <LogoUpload 
                  logo={form.logo} 
                  onLogoUpdate={handleLogoUpdate} 
                />
                
                <div className="form-group">
                  <label className="form-label" style={{ color: '#ef4444' }}>Nom de l'établissement *</label>
                  <input 
                    className="form-input" 
                    required 
                    value={form.nom} 
                    onChange={e => setForm(p => ({...p, nom: e.target.value}))} 
                    style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ color: '#ef4444' }}>Catégorie</label>
                  <select 
                    className="form-select" 
                    value={form.categorie} 
                    onChange={e => setForm(p => ({...p, categorie: e.target.value}))} 
                    style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }}
                  >
                    {CATS.map(c => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ color: '#ef4444' }}>Description</label>
                  <textarea 
                    className="form-textarea" 
                    rows={4} 
                    value={form.description} 
                    onChange={e => setForm(p => ({...p, description: e.target.value}))} 
                    style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} 
                  />
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#ef4444' }}>Téléphone</label>
                    <input 
                      className="form-input" 
                      value={form.telephone} 
                      onChange={e => setForm(p => ({...p, telephone: e.target.value}))} 
                      style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#ef4444' }}>Email</label>
                    <input 
                      className="form-input" 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm(p => ({...p, email: e.target.value}))} 
                      style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ color: '#ef4444' }}>Adresse</label>
                  <input 
                    className="form-input" 
                    value={form.adresse} 
                    onChange={e => setForm(p => ({...p, adresse: e.target.value}))} 
                    style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} 
                  />
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#ef4444' }}>Ville</label>
                    <input 
                      className="form-input" 
                      value={form.ville} 
                      onChange={e => setForm(p => ({...p, ville: e.target.value}))} 
                      style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} 
                    />
                  </div>
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#ef4444' }}>Latitude</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="any" 
                      value={form.latitude} 
                      onChange={e => setForm(p => ({...p, latitude: e.target.value}))} 
                      style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#ef4444' }}>Longitude</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="any" 
                      value={form.longitude} 
                      onChange={e => setForm(p => ({...p, longitude: e.target.value}))} 
                      style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} 
                    />
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={saving} 
                className="btn btn-gold"
                style={{ 
                  background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', 
                  padding: '12px 24px', 
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Save size={18} />
                {saving ? 'Sauvegarde…' : 'Sauvegarder le profil'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* TAB HORAIRES */}
        {tab === 'horaires' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <form onSubmit={saveProfil} style={{ maxWidth: '500px' }}>
              <div className="card" style={{ padding: '24px', background: '#1a1a1a', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '20px' }}>
                <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '13px' }}>
                  Format : HH:MM-HH:MM ou "Fermé"
                </p>
                {Object.entries(JOURS).map(([k, label]) => (
                  <div key={k} className="flex gap-md" style={{ alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '90px', fontWeight: 500, color: '#ef4444' }}>{label}</div>
                    <input 
                      className="form-input" 
                      style={{ flex: 1, background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }}
                      value={form.horaires?.[k] || ''} 
                      placeholder="08:00-18:00 ou Fermé"
                      onChange={e => setForm(p => ({ 
                        ...p, 
                        horaires: { ...p.horaires, [k]: e.target.value } 
                      }))} 
                    />
                  </div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={saving} 
                className="btn btn-gold"
                style={{ 
                  background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', 
                  marginTop: '20px', 
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Save size={18} />
                {saving ? 'Sauvegarde…' : 'Sauvegarder les horaires'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* TAB CATALOGUE */}
        {tab === 'catalogue' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <div style={{ color: '#9ca3af' }}>{prestations.length} prestation(s)</div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModal({})} 
                className="btn btn-gold"
                style={{ 
                  background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Ajouter
              </motion.button>
            </div>
            
            <AnimatePresence mode="wait">
              {prestations.length === 0 ? (
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
                  <BookOpen size={48} color="#4b5563" style={{ marginBottom: '16px' }} />
                  <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>Aucune prestation</h3>
                  <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Ajoutez vos services pour les proposer aux clients.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModal({})} 
                    className="btn btn-gold"
                    style={{ 
                      background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Ajouter la première prestation
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid-2"
                  style={{ gap: '20px' }}
                >
                  {prestations.map((p) => (
                    <motion.div
                      key={p.id}
                      variants={fadeInUp}
                      whileHover={{ y: -5 }}
                      className="card"
                      style={{
                        background: '#1a1a1a',
                        borderRadius: '16px',
                        padding: '20px',
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
                          width: '150px',
                          height: '150px',
                          background: `radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%)`,
                          borderRadius: '50%'
                        }}
                      />
                      
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                          <span className="badge" style={{ 
                            background: '#2a2a2a', 
                            color: '#ef4444',
                            fontSize: '11px',
                            padding: '4px 10px',
                            borderRadius: '20px'
                          }}>
                            {p.categorie}
                          </span>
                          <span 
                            className="badge" 
                            style={{ 
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: p.est_disponible ? '#064e3b' : '#7f1d1d',
                              color: p.est_disponible ? '#10b981' : '#fca5a5'
                            }}
                          >
                            {p.est_disponible ? 'Disponible' : 'Indisponible'}
                          </span>
                        </div>
                        
                        <h3 style={{ fontFamily:'var(--font-display)', fontSize: '18px', marginBottom: '8px', color: 'white' }}>
                          {p.nom}
                        </h3>
                        
                        {p.description && (
                          <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>
                            {p.description}
                          </p>
                        )}
                        
                        <div style={{ 
                          color: '#fbbf24', 
                          fontWeight: 700, 
                          fontFamily:'var(--font-display)', 
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={14} />
                            {p.prix_min && p.prix_max ? `${p.prix_min} – ${p.prix_max} MAD` : p.prix_min ? `Dès ${p.prix_min} MAD` : 'Sur devis'}
                          </span>
                          {p.duree_minutes && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontWeight: 400, fontSize: '13px' }}>
                              <Clock size={12} />
                              {p.duree_minutes} min
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-sm">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setModal(p)} 
                            className="btn btn-ghost btn-sm"
                            style={{ 
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#2a2a2a',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={14} /> Modifier
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, background: '#7f1d1d' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deletePrestation(p.id)} 
                            className="btn btn-danger btn-sm"
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#dc2626',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              color: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            {deletingId === p.id ? (
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
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}