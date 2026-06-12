import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  Wrench,
  Calendar,
  Car,
  ChevronRight,
  Briefcase,
  Clock,
  AlertCircle,
  Users,
  Award
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

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

function TechModal({ tech, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    if (tech?.id) {
      return { 
        nom: tech.nom || '', 
        prenom: tech.prenom || '', 
        email: tech.email || '', 
        telephone: tech.telephone || '', 
        mot_de_passe: '', 
        specialites: tech.specialites ? JSON.parse(tech.specialites) : [], 
        disponible: tech.disponible !== undefined ? tech.disponible : true 
      };
    }
    return { 
      nom: '', 
      prenom: '', 
      email: '', 
      telephone: '', 
      mot_de_passe: '', 
      specialites: [], 
      disponible: true 
    };
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const SPECS = ['Mécanique générale','Vidange','Freins','Climatisation','Électricité','Carrosserie','Diagnostic','Pneus'];

  const toggleSpec = (s) => {
    setForm(prev => {
      const currentSpecs = prev.specialites || [];
      return {
        ...prev, 
        specialites: currentSpecs.includes(s) 
          ? currentSpecs.filter(x => x !== s) 
          : [...currentSpecs, s]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setError('');
    try {
      if (tech?.id) {
        await api.put(`/gestionnaire/techniciens/${tech.id}`, { 
          specialites: form.specialites || [], 
          disponible: form.disponible 
        });
      } else {
        await api.post('/gestionnaire/techniciens', form);
      }
      onSave();
    } catch (err) { 
      setError(err.response?.data?.message || 'Erreur.'); 
    }
    finally { 
      setLoading(false); 
    }
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
        style={{ width:'100%', maxWidth:'560px', maxHeight:'90vh', overflowY:'auto', background:'#1a1a1a', border:'1px solid rgba(220, 38, 38, 0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between" style={{ marginBottom:'20px' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:700, color:'#ef4444' }}>
            {tech?.id ? 'Modifier' : 'Ajouter'} un technicien
          </h2>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}
          >
            <XCircle size={24} />
          </motion.button>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="alert alert-error"
              style={{ background:'#7f1d1d', color:'#fca5a5', border:'1px solid #ef4444' }}
            >
              <AlertCircle size={16} style={{ display:'inline', marginRight:'8px' }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {!tech?.id && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ color:'#ef4444' }}>Prénom *</label>
                  <input className="form-input" required value={form.prenom} onChange={e => setForm(p=>({...p,prenom:e.target.value}))} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color:'#ef4444' }}>Nom *</label>
                  <input className="form-input" required value={form.nom} onChange={e => setForm(p=>({...p,nom:e.target.value}))} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color:'#ef4444' }}>Email *</label>
                <input className="form-input" type="email" required value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color:'#ef4444' }}>Téléphone</label>
                <input className="form-input" value={form.telephone} onChange={e => setForm(p=>({...p,telephone:e.target.value}))} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color:'#ef4444' }}>Mot de passe</label>
                <input className="form-input" type="password" placeholder="Laissez vide : Tech2024!" value={form.mot_de_passe} onChange={e => setForm(p=>({...p,mot_de_passe:e.target.value}))} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }} />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label className="form-label" style={{ color:'#ef4444' }}>Spécialités</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'4px' }}>
              {SPECS.map(s => (
                <motion.button
                  key={s}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSpec(s)}
                  className={`btn btn-sm ${(form.specialites || []).includes(s) ? 'btn-gold' : 'btn-ghost'}`}
                  style={(form.specialites || []).includes(s) ? { background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color:'white' } : {}}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
          
          {tech?.id && (
            <div className="form-group">
              <label className="form-label" style={{ color:'#ef4444' }}>Disponibilité</label>
              <select className="form-select" value={form.disponible} onChange={e => setForm(p=>({...p,disponible:e.target.value==='true'}))} style={{ background:'#2a2a2a', border:'1px solid #3a3a3a', color:'white' }}>
                <option value="true">Disponible</option>
                <option value="false">Indisponible</option>
              </select>
            </div>
          )}
          
          <div className="flex gap-md" style={{ marginTop:'8px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading} 
              className="btn btn-gold btn-full"
              style={{ background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ display:'inline-block' }}
                >
                  <Clock size={18} />
                </motion.div>
              ) : tech?.id ? 'Mettre à jour' : 'Créer le compte'}
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

export default function GestTechniciens() {
  const [techs, setTechs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [rdv, setRdv]         = useState([]);
  const [assignModal, setAssignModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    const [t, r] = await Promise.all([api.get('/gestionnaire/techniciens'), api.get('/rdv')]);
    setTechs(t.data);
    setRdv(r.data.filter(r => ['en_attente','confirme'].includes(r.statut) && !r.technicien_id));
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Supprimer ce technicien et son compte ? Cette action est irréversible.')) return;
    setDeletingId(id);
    await api.delete(`/gestionnaire/techniciens/${id}`);
    setDeletingId(null);
    fetch();
  };

  const handleAssign = async (rdvId, techId) => {
    await api.put(`/gestionnaire/rdv/${rdvId}/assigner`, { technicien_id: techId });
    setAssignModal(null);
    fetch();
  };

  return (
    <div className="dashboard-layout" style={{ background:'#0a0a0a', minHeight:'100vh' }}>
      <Sidebar />
      
      <AnimatePresence>
        {modal !== null && (
          <TechModal tech={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetch(); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}
            onClick={() => setAssignModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="card"
              style={{ width:'100%', maxWidth:'480px', background:'#1a1a1a', border:'1px solid rgba(220, 38, 38, 0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between" style={{ marginBottom:'20px' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'18px', fontWeight:700, color:'#ef4444' }}>
                  Assigner un technicien
                </h3>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAssignModal(null)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}
                >
                  <XCircle size={24} />
                </motion.button>
              </div>
              
              <div style={{ 
                background:'#0f0f0f', 
                borderRadius:'12px', 
                padding:'16px', 
                marginBottom:'20px',
                display:'flex',
                alignItems:'center',
                gap:'12px'
              }}>
                <Calendar size={20} color="#ef4444" />
                <div>
                  <div style={{ fontWeight:600, color:'white' }}>
                    {assignModal.marque} {assignModal.modele}
                  </div>
                  <div style={{ fontSize:'13px', color:'#9ca3af' }}>
                    {assignModal.client_prenom} {assignModal.client_nom} — {new Date(assignModal.date_rdv).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
              
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'400px', overflowY:'auto' }}>
                {techs.filter(t => t.disponible).map(t => {
                  let specs = [];
                  try {
                    specs = JSON.parse(t.specialites || '[]');
                  } catch(e) {
                    specs = [];
                  }
                  return (
                    <motion.button
                      key={t.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAssign(assignModal.id, t.id)}
                      style={{
                        padding:'16px',
                        borderRadius:'12px',
                        background:'#2a2a2a',
                        border:'1px solid rgba(220, 38, 38, 0.2)',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap:'12px',
                        textAlign:'left'
                      }}
                    >
                      <div style={{
                        width:'48px',
                        height:'48px',
                        borderRadius:'12px',
                        background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center'
                      }}>
                        <User size={24} color="white" />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, color:'white' }}>{t.prenom} {t.nom}</div>
                        {specs.length > 0 && (
                          <div style={{ fontSize:'11px', color:'#9ca3af', display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'4px' }}>
                            {specs.slice(0,3).map(s => (
                              <span key={s} style={{ background:'#3a3a3a', padding:'2px 6px', borderRadius:'4px' }}>{s}</span>
                            ))}
                            {specs.length > 3 && <span>+{specs.length-3}</span>}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={18} color="#ef4444" />
                    </motion.button>
                  );
                })}
                {techs.filter(t => t.disponible).length === 0 && (
                  <p style={{ color:'#9ca3af', textAlign:'center', padding:'40px' }}>
                    Aucun technicien disponible.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="dashboard-content" style={{ padding:'32px 40px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-between" 
          style={{ marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}
        >
          <div>
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              style={{ 
                fontFamily:'var(--font-display)', 
                fontSize:'32px', 
                fontWeight:800,
                background:'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent'
              }}
            >
              Techniciens
            </motion.h1>
            <motion.p 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ color:'#9ca3af', marginTop:'4px' }}
            >
              {techs.length} technicien(s) dans votre équipe
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModal({})}
            className="btn btn-gold"
            style={{ 
              background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              display:'flex',
              alignItems:'center',
              gap:'8px'
            }}
          >
            <Plus size={18} /> Ajouter un technicien
          </motion.button>
        </motion.div>

        {/* RDV sans technicien alert */}
        <AnimatePresence>
          {rdv.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="card"
              style={{ 
                marginBottom:'28px', 
                background:'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                border:'1px solid #ef4444',
                padding:'20px'
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                <AlertCircle size={24} color="#fca5a5" />
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'#fca5a5' }}>
                  {rdv.length} RDV sans technicien assigné
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {rdv.slice(0,5).map(r => (
                  <motion.div
                    key={r.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex-between"
                    style={{ 
                      padding:'12px 16px', 
                      background:'rgba(0,0,0,0.3)', 
                      borderRadius:'10px',
                      flexWrap:'wrap',
                      gap:'12px'
                    }}
                  >
                    <div style={{ fontSize:'14px', color:'white' }}>
                      <strong>{r.client_prenom} {r.client_nom}</strong> · {r.marque} {r.modele} · {new Date(r.date_rdv).toLocaleDateString('fr-FR')}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAssignModal(r)}
                      className="btn btn-gold btn-sm"
                      style={{ background:'white', color:'#dc2626' }}
                    >
                      Assigner
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Techniciens List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease:"linear" }}
                style={{
                  width:'50px',
                  height:'50px',
                  border:'3px solid #dc2626',
                  borderTopColor:'transparent',
                  borderRadius:'50%'
                }}
              />
            </motion.div>
          ) : techs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ 
                textAlign:'center', 
                padding:'80px', 
                background:'#1a1a1a',
                borderRadius:'24px',
                border:'1px solid rgba(220, 38, 38, 0.2)'
              }}
            >
              <Users size={64} color="#4b5563" style={{ marginBottom:'16px' }} />
              <h3 style={{ color:'#ef4444', marginBottom:'12px' }}>Aucun technicien</h3>
              <p style={{ color:'#9ca3af', marginBottom:'20px' }}>Ajoutez votre équipe de techniciens.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModal({})}
                className="btn btn-gold"
                style={{ background:'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
              >
                Ajouter le premier technicien
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid-2"
              style={{ gap:'24px' }}
            >
              {techs.map((t, index) => {
                let specs = [];
                try {
                  specs = JSON.parse(t.specialites || '[]');
                } catch(e) {
                  specs = [];
                }
                return (
                  <motion.div
                    key={t.id}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    className="card"
                    style={{
                      background:'#1a1a1a',
                      borderRadius:'20px',
                      padding:'24px',
                      border:'1px solid rgba(220, 38, 38, 0.2)',
                      position:'relative',
                      overflow:'hidden'
                    }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{
                        position:'absolute',
                        top:'-50%',
                        right:'-50%',
                        width:'200px',
                        height:'200px',
                        background:`radial-gradient(circle, ${t.disponible ? '#10b98120' : '#ef444420'} 0%, transparent 70%)`,
                        borderRadius:'50%'
                      }}
                    />
                    
                    <div style={{ position:'relative', zIndex:2 }}>
                      <div className="flex gap-md" style={{ alignItems:'center', marginBottom:'16px' }}>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            width:'60px',
                            height:'60px',
                            borderRadius:'16px',
                            background:`linear-gradient(135deg, ${t.disponible ? '#10b981' : '#dc2626'} 0%, ${t.disponible ? '#059669' : '#991b1b'} 100%)`,
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            flexShrink:0
                          }}
                        >
                          <User size={30} color="white" />
                        </motion.div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'18px', color:'white' }}>
                            {t.prenom} {t.nom}
                          </div>
                          <div style={{ color:'#9ca3af', fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', marginTop:'4px' }}>
                            <Mail size={12} /> {t.email}
                          </div>
                          {t.telephone && (
                            <div style={{ color:'#9ca3af', fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', marginTop:'2px' }}>
                              <Phone size={12} /> {t.telephone}
                            </div>
                          )}
                        </div>
                        <motion.span
                          animate={t.disponible ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`badge ${t.disponible ? 'badge-success' : 'badge-danger'}`}
                          style={{
                            display:'flex',
                            alignItems:'center',
                            gap:'4px',
                            padding:'6px 12px'
                          }}
                        >
                          {t.disponible ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {t.disponible ? 'Disponible' : 'Occupé'}
                        </motion.span>
                      </div>
                      
                      {specs.length > 0 && (
                        <div className="flex gap-sm" style={{ flexWrap:'wrap', marginBottom:'20px' }}>
                          {specs.map(s => (
                            <motion.span
                              key={s}
                              whileHover={{ scale: 1.05 }}
                              className="badge badge-gray"
                              style={{ 
                                fontSize:'11px',
                                background:'#2a2a2a',
                                color:'#ef4444',
                                display:'flex',
                                alignItems:'center',
                                gap:'4px'
                              }}
                            >
                              <Wrench size={10} /> {s}
                            </motion.span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-sm">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setModal(t)}
                          className="btn btn-ghost btn-sm"
                          style={{ 
                            flex:1,
                            display:'flex',
                            alignItems:'center',
                            gap:'6px',
                            background:'#2a2a2a',
                            color:'#ef4444'
                          }}
                        >
                          <Edit2 size={14} /> Modifier
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, background:'#7f1d1d' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(t.id)}
                          className="btn btn-danger btn-sm"
                          style={{ 
                            display:'flex',
                            alignItems:'center',
                            gap:'6px',
                            background:'#dc2626'
                          }}
                        >
                          {deletingId === t.id ? (
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