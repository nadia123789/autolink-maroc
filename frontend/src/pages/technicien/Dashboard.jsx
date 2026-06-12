import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  User, 
  LogOut, 
  Car, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Package,
  FileText,
  Phone,
  ChevronRight,
  XCircle,
  Plus,
  Save,
  AlertCircle,
  TrendingUp,
  Briefcase,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
      staggerChildren: 0.05
    }
  }
};

// Sidebar technicien (red theme)
function TechSidebar() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/technicien', label: 'Mes interventions', icon: Wrench, end: true },
  ];
  
  return (
    <aside style={{
      width: '280px',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)',
      borderRight: '1px solid rgba(220, 38, 38, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100
    }}>
      <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(220, 38, 38, 0.2)' }}>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '22px', 
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AutoLink <span style={{ color: 'white', fontWeight: 400 }}>Maroc</span>
        </div>
      </div>
      
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(220, 38, 38, 0.2)' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Connecté en tant que</div>
        <div style={{ fontWeight: 600, color: 'white', marginBottom: '8px', fontSize: '15px' }}>
          {user?.prenom} {user?.nom}
        </div>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: 'white'
        }}>
          Technicien
        </span>
      </div>
      
      <nav style={{ flex: 1, padding: '20px 16px' }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              color: isActive ? '#ef4444' : '#9ca3af',
              background: isActive ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              marginBottom: '4px'
            })}>
            <l.icon size={20} />
            <span style={{ fontWeight: 500 }}>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div style={{ padding: '20px', borderTop: '1px solid rgba(220, 38, 38, 0.2)' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { deconnexion(); navigate('/'); }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            background: '#1a1a1a',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500
          }}>
          <LogOut size={16} />
          Déconnexion
        </motion.button>
      </div>
    </aside>
  );
}

// Badges statut (red theme)
const STATUT = {
  ouvert:            { label: 'Ouvert',             class: 'badge-gray', icon: Clock, color: '#6b7280' },
  en_cours:          { label: 'En cours',           class: 'badge-gold', icon: Wrench, color: '#f59e0b' },
  en_attente_pieces: { label: 'Attente pièces',     class: 'badge-warning', icon: Package, color: '#f97316' },
  termine:           { label: 'Terminé',            class: 'badge-success', icon: CheckCircle, color: '#10b981' },
};

// Modal détail + actions intervention
function InterventionModal({ intervention, onClose, onUpdate }) {
  const [statut, setStatut] = useState(intervention.ordre_statut);
  const [statutCible, setStatutCible] = useState(null);
  const [diagnostic, setDiagnostic] = useState(intervention.diagnostic || '');
  const [travaux, setTravaux] = useState(intervention.travaux_effectues || '');
  const [kmSortie, setKmSortie] = useState('');
  const [anomalie, setAnomalie] = useState('');
  const [pieceId, setPieceId] = useState('');
  const [pieceQte, setPieceQte] = useState(1);
  const [pieces, setPieces] = useState([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('infos');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/technicien/${intervention.ordre_id}/pieces-disponibles`)
      .then(r => setPieces(r.data))
      .catch(() => {});
  }, [intervention.ordre_id]);

  const handleSaveStatut = async () => {
    if (!statutCible) return;
    
    setSaving(true);
    setMsg('');
    try {
      await api.put(`/technicien/${intervention.ordre_id}/statut`, {
        statut: statutCible,
        diagnostic,
        travaux_effectues: travaux,
        kilometrage_sortie: kmSortie || undefined,
      });
      setMsg('✅ Intervention mise à jour.');
      setStatutCible(null);
      setStatut(statutCible);
      onUpdate();
      setTimeout(() => setMsg(''), 3000);
    } catch { 
      setMsg('❌ Erreur lors de la mise à jour.'); 
    }
    finally { 
      setSaving(false); 
    }
  };

  const handleAjouterPiece = async () => {
    if (!pieceId) return;
    const p = pieces.find(x => x.id === parseInt(pieceId));
    setSaving(true); setMsg('');
    try {
      await api.post(`/technicien/${intervention.ordre_id}/pieces`, {
        piece_id: parseInt(pieceId),
        quantite: pieceQte,
        prix_unitaire: p?.prix_vente || 0,
      });
      setMsg('✅ Pièce ajoutée.');
      onUpdate();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Erreur.'); }
    finally { setSaving(false); }
  };

  const handleAnomalie = async () => {
    if (!anomalie.trim()) return;
    setSaving(true); setMsg('');
    try {
      await api.post(`/technicien/${intervention.ordre_id}/anomalie`, { description: anomalie });
      setMsg('✅ Anomalie signalée au gestionnaire.');
      setAnomalie('');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Erreur.'); }
    finally { setSaving(false); }
  };

  const suivants = {
    ouvert:            ['en_cours'],
    en_cours:          ['en_attente_pieces', 'termine'],
    en_attente_pieces: ['en_cours', 'termine'],
    termine:           [],
  }[statut] || [];

  const tabs = ['infos', 'travaux', 'pièces', 'anomalie'];
  const currentStatusInfo = STATUT[statut] || { label: statut, class: 'badge-gray', icon: Clock, color: '#6b7280' };
  const CurrentIcon = currentStatusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(8px)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}
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
          maxWidth:'750px', 
          maxHeight:'90vh', 
          overflowY:'auto',
          background: '#1a1a1a',
          border: '1px solid rgba(220, 38, 38, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-between" style={{ marginBottom:'20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Car size={20} color="#ef4444" />
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:700, color: 'white' }}>
                {intervention.marque} {intervention.modele}
              </h2>
              <span style={{ color:'#9ca3af', fontSize:'14px' }}>({intervention.immatriculation})</span>
            </div>
            <div style={{ color:'#9ca3af', fontSize:'13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={12} />
              Client : {intervention.client_prenom} {intervention.client_nom}
              <Phone size={12} style={{ marginLeft: '4px' }} />
              {intervention.client_tel}
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}
          >
            <XCircle size={24} />
          </motion.button>
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: '20px' }}>
          <span className={`badge ${currentStatusInfo.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CurrentIcon size={14} />
            {currentStatusInfo.label}
          </span>
        </div>

        {/* Onglets */}
        <div className="flex gap-sm" style={{ marginBottom:'20px', borderBottom:'1px solid #2a2a2a', paddingBottom:'12px' }}>
          {tabs.map(t => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t)}
              className={`btn btn-sm ${tab === t ? 'btn-gold' : 'btn-ghost'}`}
              style={{ 
                textTransform:'capitalize',
                background: tab === t ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'transparent'
              }}>
              {t}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}
              style={{ marginBottom:'16px' }}
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB: Infos */}
        {tab === 'infos' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display:'flex', flexDirection:'column', gap:'16px' }}
          >
            <div className="grid-2">
              {[
                { l:'Véhicule',      v:`${intervention.marque} ${intervention.modele} (${intervention.annee || '—'})` },
                { l:'Carburant',     v: intervention.carburant || '—' },
                { l:'Kilométrage',   v:`${intervention.kilometrage?.toLocaleString() || '—'} km` },
                { l:'VIN',           v: intervention.vin || '—' },
                { l:'Date RDV',      v: new Date(intervention.date_rdv).toLocaleString('fr-FR') },
                { l:'Prestation',    v: intervention.prestation_nom || '—' },
              ].map(i => (
                <div key={i.l} style={{ background:'#0f0f0f', padding:'12px', borderRadius:'10px' }}>
                  <div style={{ fontSize:'11px', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px' }}>{i.l}</div>
                  <div style={{ fontWeight:600, marginTop:'4px', color: 'white' }}>{i.v}</div>
                </div>
              ))}
            </div>
            
            {intervention.description_probleme && (
              <div style={{ background:'rgba(220, 38, 38, 0.1)', border:'1px solid rgba(220, 38, 38, 0.2)', borderRadius:'10px', padding:'14px' }}>
                <div style={{ fontSize:'12px', color:'#ef4444', fontWeight:600, marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px' }}>
                  <AlertCircle size={14} /> PROBLÈME SIGNALÉ
                </div>
                <p style={{ color:'#d1d5db', fontSize:'14px', lineHeight:1.6 }}>{intervention.description_probleme}</p>
              </div>
            )}
            
            {/* Changer statut */}
            {suivants.length > 0 && (
              <div>
                <div style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'8px' }}>Passer au statut :</div>
                <div className="flex gap-sm">
                  {suivants.map(s => {
                    const nextStatus = STATUT[s];
                    return (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStatutCible(s)}
                        className={`btn btn-sm ${statutCible === s ? 'btn-gold' : 'btn-ghost'}`}
                      >
                        {nextStatus?.label}
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Afficher le bouton de confirmation */}
                {statutCible && statutCible !== intervention.ordre_statut && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop:'12px' }}
                  >
                    {statutCible === 'termine' && (
                      <div className="form-group" style={{ marginBottom:'10px' }}>
                        <label className="form-label" style={{ color:'#ef4444' }}>Kilométrage sortie</label>
                        <input 
                          className="form-input" 
                          type="number" 
                          placeholder={intervention.kilometrage}
                          value={kmSortie} 
                          onChange={e => setKmSortie(e.target.value)} 
                        />
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveStatut} 
                      disabled={saving} 
                      className="btn btn-gold"
                    >
                      {saving ? 'Enregistrement…' : `Confirmer → ${STATUT[statutCible]?.label}`}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB: Travaux */}
        {tab === 'travaux' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display:'flex', flexDirection:'column', gap:'14px' }}
          >
            <div className="form-group">
              <label className="form-label" style={{ color:'#ef4444' }}>Diagnostic</label>
              <textarea className="form-textarea" rows={4}
                placeholder="Décrivez le diagnostic technique…"
                value={diagnostic} onChange={e => setDiagnostic(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color:'#ef4444' }}>Travaux effectués</label>
              <textarea className="form-textarea" rows={4}
                placeholder="Listez les travaux réalisés…"
                value={travaux} onChange={e => setTravaux(e.target.value)} />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveStatut} 
              disabled={saving} 
              className="btn btn-gold"
            >
              <Save size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {saving ? 'Enregistrement…' : 'Sauvegarder'}
            </motion.button>
          </motion.div>
        )}

        {/* TAB: Pièces */}
        {tab === 'pièces' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display:'flex', flexDirection:'column', gap:'16px' }}
          >
            {intervention.pieces_utilisees?.length > 0 && (
              <div>
                <div style={{ fontSize:'13px', fontWeight:600, color:'#ef4444', marginBottom:'10px' }}>Pièces déjà utilisées</div>
                <div className="table-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                        <th style={{ textAlign: 'left', padding: '8px', color: '#9ca3af' }}>Pièce</th>
                        <th style={{ textAlign: 'left', padding: '8px', color: '#9ca3af' }}>Qté</th>
                        <th style={{ textAlign: 'right', padding: '8px', color: '#9ca3af' }}>Prix unit.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intervention.pieces_utilisees.map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #2a2a2a' }}>
                          <td style={{ padding: '8px', color: 'white' }}>{p.nom}</td>
                          <td style={{ padding: '8px', color: '#9ca3af' }}>{p.quantite}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#fbbf24' }}>{p.prix_unitaire} MAD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div style={{ fontWeight:600, color:'#ef4444', fontSize:'13px' }}>Ajouter une pièce du stock</div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" style={{ color:'#ef4444' }}>Pièce</label>
                <select className="form-select" value={pieceId} onChange={e => setPieceId(e.target.value)}>
                  <option value="">— Choisir —</option>
                  {pieces.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom} ({p.quantite_stock} en stock) — {p.prix_vente} MAD
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color:'#ef4444' }}>Quantité</label>
                <input className="form-input" type="number" min={1} value={pieceQte}
                  onChange={e => setPieceQte(parseInt(e.target.value))} />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAjouterPiece} 
              disabled={saving || !pieceId} 
              className="btn btn-gold"
            >
              <Plus size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Ajouter la pièce
            </motion.button>
          </motion.div>
        )}

        {/* TAB: Anomalie */}
        {tab === 'anomalie' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display:'flex', flexDirection:'column', gap:'14px' }}
          >
            <div style={{ background:'rgba(220, 38, 38, 0.1)', border:'1px solid rgba(220, 38, 38, 0.2)', borderRadius:'10px', padding:'14px', fontSize:'13px', color:'#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#ef4444" />
              Signalez toute anomalie supplémentaire détectée sur le véhicule. Le gestionnaire sera notifié immédiatement.
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color:'#ef4444' }}>Description de l'anomalie</label>
              <textarea className="form-textarea" rows={5}
                placeholder="Ex: Fuite d'huile détectée sous le moteur, rouille sur le châssis…"
                value={anomalie} onChange={e => setAnomalie(e.target.value)} />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnomalie} 
              disabled={saving || !anomalie.trim()} 
              className="btn btn-danger"
            >
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {saving ? 'Envoi…' : 'Signaler l\'anomalie'}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Page principale technicien
export default function TechnicienDashboard() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filtre, setFiltre] = useState('actifs');

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/technicien');
      setInterventions(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const filtres = {
    actifs: interventions.filter(i => ['ouvert','en_cours','en_attente_pieces'].includes(i.ordre_statut)),
    termine: interventions.filter(i => i.ordre_statut === 'termine'),
    tous: interventions,
  };
  const liste = filtres[filtre] || [];

  const stats = {
    actifs: filtres.actifs.length,
    enCours: interventions.filter(i => i.ordre_statut === 'en_cours').length,
    attentePieces: interventions.filter(i => i.ordre_statut === 'en_attente_pieces').length,
    termines: filtres.termine.length
  };

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <TechSidebar />
      
      <AnimatePresence>
        {selected && (
          <InterventionModal
            intervention={selected}
            onClose={() => setSelected(null)}
            onUpdate={() => { fetch(); }}
          />
        )}
      </AnimatePresence>
      
      <main className="dashboard-content" style={{ marginLeft: '280px', padding: '32px 40px' }}>
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
            Mes interventions
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '4px' }}>
            Bonjour {user?.prenom} — {stats.actifs} intervention(s) en cours
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid-4" 
          style={{ marginBottom: '32px', gap: '24px' }}
        >
          {[
            { number: stats.actifs, label: 'En cours / À faire', color: '#f59e0b', icon: Clock },
            { number: stats.enCours, label: 'En cours maintenant', color: '#3b82f6', icon: Wrench },
            { number: stats.attentePieces, label: 'Attente pièces', color: '#f97316', icon: Package },
            { number: stats.termines, label: 'Terminées', color: '#10b981', icon: CheckCircle },
          ].map((s, i) => (
            <motion.div
              key={i}
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
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '150px',
                  height: '150px',
                  background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`,
                  borderRadius: '50%'
                }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <s.icon size={28} color={s.color} />
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: s.color }}>
                    {s.number}
                  </div>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 500 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-sm" 
          style={{ marginBottom: '24px', flexWrap: 'wrap' }}
        >
          {[
            { k:'actifs',  l:`Actives (${filtres.actifs.length})` },
            { k:'termine', l:`Terminées (${filtres.termine.length})` },
            { k:'tous',    l:`Toutes (${filtres.tous.length})` },
          ].map(f => (
            <motion.button
              key={f.k}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltre(f.k)}
              className={`btn btn-sm ${filtre === f.k ? 'btn-gold' : 'btn-ghost'}`}
            >
              {f.l}
            </motion.button>
          ))}
        </motion.div>

        {/* Interventions List */}
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
          ) : liste.length === 0 ? (
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
              <Wrench size={64} color="#4b5563" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>Aucune intervention</h3>
              <p style={{ color: '#9ca3af' }}>Aucune intervention dans cette catégorie.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {liste.map((i) => {
                const status = STATUT[i.ordre_statut] || { label: i.ordre_statut, class: 'badge-gray', icon: Clock, color: '#6b7280' };
                const StatusIcon = status.icon;
                const isHighPriority = i.ordre_statut === 'en_cours';
                
                return (
                  <motion.div
                    key={i.ordre_id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.01, x: 5 }}
                    style={{
                      background: '#1a1a1a',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: isHighPriority ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid rgba(220, 38, 38, 0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => setSelected(i)}
                  >
                    {isHighPriority && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          position: 'absolute',
                          top: '-30%',
                          right: '-10%',
                          width: '150px',
                          height: '150px',
                          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)',
                          borderRadius: '50%'
                        }}
                      />
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          background: `linear-gradient(135deg, ${status.color}20 0%, ${status.color}10 100%)`,
                          border: `1px solid ${status.color}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Car size={28} color={status.color} />
                      </motion.div>
                      
                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'white' }}>
                            {i.marque} {i.modele}
                          </h3>
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>{i.immatriculation}</span>
                          <span className={`badge ${status.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af' }}>
                            <User size={12} />
                            {i.client_prenom} {i.client_nom}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af' }}>
                            <Calendar size={12} />
                            {new Date(i.date_rdv).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        
                        {i.prestation_nom && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ef4444', marginTop: '4px' }}>
                            <Wrench size={12} />
                            {i.prestation_nom}
                          </div>
                        )}
                        
                        {i.description_probleme && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                            "{i.description_probleme.substring(0, 80)}{i.description_probleme.length > 80 ? '…' : ''}"
                          </div>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight size={20} color="#ef4444" />
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