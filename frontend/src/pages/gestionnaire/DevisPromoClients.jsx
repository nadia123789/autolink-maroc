import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Percent, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Send, 
  XCircle,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  Eye,
  Calendar,
  Car,
  Phone,
  Mail,
  Gift,
  DollarSign
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
      staggerChildren: 0.05
    }
  }
};

// ── DEVIS GESTIONNAIRE ───────────────────────────────────────
const STATUT_DEVIS = {
  brouillon: { label: 'Brouillon', class: 'badge-gray', icon: FileText, color: '#6b7280' },
  envoye:    { label: 'Envoyé',    class: 'badge-info', icon: Send, color: '#3b82f6' },
  accepte:   { label: 'Accepté',   class: 'badge-success', icon: CheckCircle, color: '#10b981' },
  refuse:    { label: 'Refusé',    class: 'badge-danger', icon: XCircle, color: '#ef4444' },
  expire:    { label: 'Expiré',    class: 'badge-gray', icon: Clock, color: '#6b7280' },
};

function CreerDevisModal({ rdvList, onClose, onSave }) {
  const [rdvId, setRdvId] = useState('');
  const [lignes, setLignes] = useState([{ description: '', quantite: 1, prix_unitaire: '' }]);
  const [tva, setTva] = useState(20);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addLigne = () => setLignes(p => [...p, { description: '', quantite: 1, prix_unitaire: '' }]);
  const updateLigne = (i, field, val) => setLignes(p => p.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  const removeLigne = (i) => setLignes(p => p.filter((_, idx) => idx !== i));
  const sousTotal = lignes.reduce((s, l) => s + (parseFloat(l.prix_unitaire) || 0) * (parseFloat(l.quantite) || 1), 0);
  const totalTTC = sousTotal * (1 + tva / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/devis', { rendez_vous_id: parseInt(rdvId), lignes, tva, notes });
      onSave();
    } catch { 
      setError('Erreur lors de la création du devis.');
    }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25 }}
        style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', background: '#1a1a1a', borderRadius: '20px', padding: '24px', border: '1px solid #333' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>Créer un devis</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#999' }}>×</button>
        </div>

        {error && (
          <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#dc2626' }}>Rendez-vous *</label>
            <select className="form-select" required value={rdvId} onChange={e => setRdvId(e.target.value)} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }}>
              <option value="">— Sélectionner un RDV —</option>
              {rdvList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.client_prenom} {r.client_nom} · {r.marque} {r.modele} · {new Date(r.date_rdv).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex-between" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ color: '#dc2626' }}>Lignes du devis</label>
              <button type="button" onClick={addLigne} className="btn btn-ghost btn-sm" style={{ color: '#dc2626', border: '1px solid #dc2626' }}>+ Ajouter une ligne</button>
            </div>
            {lignes.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input className="form-input" placeholder="Description" value={l.description} onChange={e => updateLigne(i, 'description', e.target.value)} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} />
                <input className="form-input" type="number" min="1" placeholder="Qté" value={l.quantite} onChange={e => updateLigne(i, 'quantite', e.target.value)} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} />
                <input className="form-input" type="number" step="0.01" placeholder="Prix" value={l.prix_unitaire} onChange={e => updateLigne(i, 'prix_unitaire', e.target.value)} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} />
                {lignes.length > 1 && (
                  <button type="button" onClick={() => removeLigne(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '20px' }}>×</button>
                )}
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ color: '#dc2626' }}>TVA (%)</label>
              <input className="form-input" type="number" value={tva} onChange={e => setTva(e.target.value)} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} />
            </div>
            <div style={{ padding: '14px', background: '#0f0f0f', borderRadius: '12px' }}>
              <div style={{ color: '#999', fontSize: '13px' }}>HT : {sousTotal.toFixed(2)} MAD</div>
              <div style={{ color: '#fbbf24', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginTop: '4px' }}>TTC : {totalTTC.toFixed(2)} MAD</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#dc2626' }}>Notes</label>
            <textarea className="form-textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} />
          </div>

          <div className="flex gap-md">
            <button type="submit" disabled={loading} className="btn btn-gold" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Création…' : 'Créer le devis'}</button>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ background: '#2a2a2a', color: '#999', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function GestDevis() {
  const [devis, setDevis] = useState([]);
  const [rdvList, setRdvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const [d, r] = await Promise.all([api.get('/devis'), api.get('/rdv')]);
    setDevis(d.data);
    setRdvList(r.data.filter(r => ['en_attente', 'confirme', 'en_cours'].includes(r.statut)));
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const envoyer = async (id) => {
    await api.put(`/devis/${id}/envoyer`);
    fetch();
  };

  const facturer = async (id) => {
    const mode = prompt('Mode de paiement :\n1. especes\n2. virement\n3. cmi\n4. cheque\n\nEntrez le mode :') || 'especes';
    await api.post(`/devis/${id}/facturer`, { mode_paiement: mode });
    alert('Facture créée.');
    fetch();
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <AnimatePresence>
        {modal && <CreerDevisModal rdvList={rdvList} onClose={() => setModal(false)} onSave={() => { setModal(false); fetch(); }} />}
      </AnimatePresence>
      <main style={{ marginLeft: '280px', padding: '32px 40px' }}>
        <div className="flex-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>Devis & Factures</h1>
            <p style={{ color: '#666', marginTop: '4px' }}>{devis.length} devis au total</p>
          </div>
          <button onClick={() => setModal(true)} className="btn btn-gold" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Plus size={18} /> Créer un devis
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div className="spinner" />
          </div>
        ) : devis.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#1a1a1a', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <FileText size={48} color="#666" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Aucun devis</h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>Créez votre premier devis pour un client.</p>
            <button onClick={() => setModal(true)} className="btn btn-gold" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>Créer un devis</button>
          </div>
        ) : (
          <div style={{ background: 'transparent' }}>
            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>N°</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>Client</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>Véhicule</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>Montant</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>Statut</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.map(d => {
                    const status = STATUT_DEVIS[d.statut] || { label: d.statut, class: 'badge-gray', icon: FileText };
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '12px', color: '#dc2626', fontWeight: 700 }}>{d.numero}</td>
                        <td style={{ padding: '12px', color: '#e5e7eb' }}>{d.client_prenom} {d.client_nom}</td>
                        <td style={{ padding: '12px', color: '#999' }}>{d.marque} {d.modele}</td>
                        <td style={{ padding: '12px', color: '#fbbf24', fontWeight: 700 }}>{Number(d.total_ttc).toFixed(2)} MAD</td>
                        <td style={{ padding: '12px' }}><span className={`badge ${status.class}`}>{status.label}</span></td>
                        <td style={{ padding: '12px', color: '#999' }}>{new Date(d.date_creation).toLocaleDateString('fr-FR')}</td>
                        <td style={{ padding: '12px' }}>
                          {d.statut === 'brouillon' && <button onClick={() => envoyer(d.id)} className="btn btn-gold btn-sm" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Envoyer</button>}
                          {d.statut === 'accepte' && <button onClick={() => facturer(d.id)} className="btn btn-ghost btn-sm" style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Facturer</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── PROMOTIONS GESTIONNAIRE ──────────────────────────────────
export function GestPromotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const VIDE = { nom: '', code: '', description: '', type: 'pourcentage', valeur: '', min_commande: '', date_debut: '', date_fin: '', utilisations_max: '' };

  const fetch = async () => { setLoading(true); const { data } = await api.get('/promotions/mes'); setPromos(data); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette promotion ?')) return;
    await api.delete(`/promotions/${id}`);
    fetch();
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal.id) await api.put(`/promotions/${modal.id}`, modal);
      else await api.post('/promotions', modal);
      setModal(null);
      fetch();
    } catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', background: '#1a1a1a', borderRadius: '20px', padding: '24px', border: '1px solid #333' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>{modal.id ? 'Modifier' : 'Créer'} une promotion</h2>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#999' }}>×</button>
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group"><label style={{ color: '#dc2626' }}>Nom *</label><input className="form-input" required value={modal.nom} onChange={e => setModal(p => ({ ...p, nom: e.target.value }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} /></div>
                <div className="form-group"><label style={{ color: '#dc2626' }}>Code promo</label><input className="form-input" placeholder="AUTO10" value={modal.code || ''} onChange={e => setModal(p => ({ ...p, code: e.target.value.toUpperCase() }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} /></div>
                <div className="form-group"><label style={{ color: '#dc2626' }}>Description</label><textarea className="form-textarea" rows={2} value={modal.description || ''} onChange={e => setModal(p => ({ ...p, description: e.target.value }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} /></div>
                <div className="grid-2">
                  <div className="form-group"><label style={{ color: '#dc2626' }}>Type</label>
                    <select className="form-select" value={modal.type} onChange={e => setModal(p => ({ ...p, type: e.target.value }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }}>
                      <option value="pourcentage">Pourcentage (%)</option>
                      <option value="montant_fixe">Montant fixe (MAD)</option>
                    </select>
                  </div>
                  <div className="form-group"><label style={{ color: '#dc2626' }}>Valeur *</label><input className="form-input" type="number" step="0.01" required value={modal.valeur || ''} onChange={e => setModal(p => ({ ...p, valeur: e.target.value }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label style={{ color: '#dc2626' }}>Date début</label><input className="form-input" type="date" value={modal.date_debut || ''} onChange={e => setModal(p => ({ ...p, date_debut: e.target.value }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} /></div>
                  <div className="form-group"><label style={{ color: '#dc2626' }}>Date fin</label><input className="form-input" type="date" value={modal.date_fin || ''} onChange={e => setModal(p => ({ ...p, date_fin: e.target.value }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label style={{ color: '#dc2626' }}>Min commande</label><input className="form-input" type="number" value={modal.min_commande || ''} onChange={e => setModal(p => ({ ...p, min_commande: e.target.value }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} /></div>
                  <div className="form-group"><label style={{ color: '#dc2626' }}>Utilisations max</label><input className="form-input" type="number" value={modal.utilisations_max || ''} onChange={e => setModal(p => ({ ...p, utilisations_max: e.target.value }))} style={{ background: '#2a2a2a', border: '1px solid #444', color: 'white' }} /></div>
                </div>
                <div className="flex gap-md" style={{ marginTop: '8px' }}>
                  <button type="submit" className="btn btn-gold" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{modal.id ? 'Mettre à jour' : 'Créer'}</button>
                  <button type="button" onClick={() => setModal(null)} className="btn btn-ghost" style={{ background: '#2a2a2a', color: '#999', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <main style={{ marginLeft: '280px', padding: '32px 40px' }}>
        <div className="flex-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>Promotions & Marketing</h1>
            <p style={{ color: '#666', marginTop: '4px' }}>{promos.length} promotion(s)</p>
          </div>
          <button onClick={() => setModal(VIDE)} className="btn btn-gold" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Plus size={18} /> Créer une promotion
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div className="spinner" />
          </div>
        ) : promos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#1a1a1a', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Gift size={48} color="#666" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Aucune promotion</h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>Créez des promotions pour attirer plus de clients.</p>
            <button onClick={() => setModal(VIDE)} className="btn btn-gold" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>Créer une promotion</button>
          </div>
        ) : (
          <div className="grid-2" style={{ gap: '20px' }}>
            {promos.map(p => {
              const actif = p.est_actif && (!p.date_fin || new Date(p.date_fin) >= new Date());
              return (
                <div key={p.id} style={{ background: '#1a1a1a', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${actif ? '#10b981' : '#dc2626'}` }}>
                  <div className="flex-between" style={{ marginBottom: '12px' }}>
                    <span style={{ background: actif ? '#064e3b' : '#7f1d1d', color: actif ? '#10b981' : '#fca5a5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{actif ? 'Active' : 'Inactive'}</span>
                    {p.code && <span style={{ background: '#78350f', color: '#fbbf24', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontFamily: 'monospace' }}>{p.code}</span>}
                  </div>
                  <h3 style={{ fontSize: '18px', marginBottom: '6px', color: '#e5e7eb' }}>{p.nom}</h3>
                  {p.description && <p style={{ color: '#999', fontSize: '13px', marginBottom: '12px' }}>{p.description}</p>}
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '22px', marginBottom: '10px' }}>{p.type === 'pourcentage' ? `-${p.valeur}%` : `-${p.valeur} MAD`}</div>
                  <div style={{ color: '#666', fontSize: '11px', marginBottom: '16px' }}>
                    {p.date_debut && `Du ${new Date(p.date_debut).toLocaleDateString('fr-FR')} `}
                    {p.date_fin && `au ${new Date(p.date_fin).toLocaleDateString('fr-FR')}`}
                    {p.utilisations_actuelles != null && ` · ${p.utilisations_actuelles}/${p.utilisations_max || '∞'} utilisations`}
                  </div>
                  <div className="flex gap-sm">
                    <button onClick={() => setModal(p)} className="btn btn-ghost" style={{ flex: 1, background: '#2a2a2a', color: '#dc2626', border: '1px solid #dc2626', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>Modifier</button>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-danger" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Supprimer</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ── FICHES CLIENTS ───────────────────────────────────────────
export function GestClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => { api.get('/gestionnaire/clients').then(r => { setClients(r.data); setLoading(false); }); }, []);

  const filtres = clients.filter(c => `${c.nom} ${c.prenom} ${c.email}`.toLowerCase().includes(search.toLowerCase()));

  const openDetail = async (id) => {
    const { data } = await api.get(`/gestionnaire/clients/${id}`);
    setDetail(data);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setDetail(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#1a1a1a', borderRadius: '20px', padding: '24px', border: '1px solid #333' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e5e7eb' }}>{detail.prenom} {detail.nom}</h2>
                  <div style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>{detail.email} · {detail.telephone}</div>
                </div>
                <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#999' }}>×</button>
              </div>
              
              <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: '12px' }}>Véhicules ({detail.vehicules?.length})</div>
              {detail.vehicules?.map(v => (
                <div key={v.id} style={{ padding: '12px', background: '#0f0f0f', borderRadius: '10px', marginBottom: '8px', color: '#e5e7eb' }}>
                  {v.marque} {v.modele} · {v.immatriculation} · {v.kilometrage?.toLocaleString()} km
                </div>
              ))}
              
              <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: '12px', marginTop: '20px' }}>Historique RDV ({detail.rdv?.length})</div>
              {detail.rdv?.map(r => (
                <div key={r.id} className="flex-between" style={{ padding: '12px', background: '#0f0f0f', borderRadius: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#999' }}>{new Date(r.date_rdv).toLocaleDateString('fr-FR')} · {r.marque} {r.modele}</span>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>{r.prix_final ? `${r.prix_final} MAD` : r.statut}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <main style={{ marginLeft: '280px', padding: '32px 40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>Fiches clients</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>{clients.length} client(s)</p>
        </div>
        
        <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#fff' }} />
          <input 
            className="form-input" 
            placeholder="Rechercher un client…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ 
              paddingLeft: '40px', 
              background: '#dc2626', 
              border: 'none', 
              color: 'white',
              placeholder: { color: '#fca5a5' }
            }} 
          />
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div className="spinner" />
          </div>
        ) : filtres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#1a1a1a', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Users size={48} color="#666" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Aucun client trouvé</h3>
            <p style={{ color: '#999' }}>{search ? 'Aucun résultat pour votre recherche.' : 'Aucun client pour le moment.'}</p>
          </div>
        ) : (
          <div style={{ background: 'transparent' }}>
            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>Client</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#999' }}>Contact</th>
                    <th style={{ textAlign: 'center', padding: '12px', color: '#999' }}>RDV total</th>
                    <th style={{ textAlign: 'center', padding: '12px', color: '#999' }}>Terminés</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: '#999' }}>Total dépensé</th>
                    <th style={{ textAlign: 'center', padding: '12px', color: '#999' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtres.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#e5e7eb' }}>{c.prenom} {c.nom}</td>
                      <td style={{ padding: '12px', color: '#999' }}>{c.email}<br/>{c.telephone}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#e5e7eb' }}>{c.total_rdv}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}><span style={{ background: '#064e3b', color: '#10b981', padding: '4px 8px', borderRadius: '20px', fontSize: '12px' }}>{c.rdv_termines}</span></td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>{Number(c.total_depense || 0).toFixed(0)} MAD</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={() => openDetail(c.id)} className="btn btn-ghost" style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Voir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}