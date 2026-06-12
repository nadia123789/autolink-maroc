import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const VIDE = { nom: '', reference: '', marque: '', categorie: '', quantite_stock: '', seuil_alerte: '5', prix_achat: '', prix_vente: '', fournisseur: '' };

function PieceModal({ piece, onClose, onSave }) {
  const [form, setForm] = useState(piece || VIDE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const f = (field) => ({ value: form[field] || '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (piece?.id) await api.put(`/pieces/${piece.id}`, form);
      else await api.post('/pieces', form);
      onSave();
    } catch (err) { setError(err.response?.data?.message || 'Erreur.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div className="card" style={{ width:'100%', maxWidth:'560px', maxHeight:'90vh', overflowY:'auto' }}>
        <div className="flex-between" style={{ marginBottom:'24px' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:700 }}>{piece?.id ? 'Modifier la pièce' : 'Ajouter une pièce'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'24px', color:'var(--gray-light)' }}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div className="form-group"><label className="form-label">Nom *</label><input className="form-input" required placeholder="Filtre à huile" {...f('nom')} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Référence</label><input className="form-input" placeholder="REF-001" {...f('reference')} /></div>
            <div className="form-group"><label className="form-label">Marque</label><input className="form-input" placeholder="Bosch" {...f('marque')} /></div>
          </div>
          <div className="form-group"><label className="form-label">Catégorie</label><input className="form-input" placeholder="Filtration, Freinage..." {...f('categorie')} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Stock actuel</label><input className="form-input" type="number" min="0" placeholder="10" {...f('quantite_stock')} /></div>
            <div className="form-group"><label className="form-label">Seuil alerte</label><input className="form-input" type="number" min="0" placeholder="5" {...f('seuil_alerte')} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Prix achat (MAD)</label><input className="form-input" type="number" step="0.01" {...f('prix_achat')} /></div>
            <div className="form-group"><label className="form-label">Prix vente (MAD)</label><input className="form-input" type="number" step="0.01" {...f('prix_vente')} /></div>
          </div>
          <div className="form-group"><label className="form-label">Fournisseur</label><input className="form-input" placeholder="Nom du fournisseur" {...f('fournisseur')} /></div>
          <div className="flex gap-md" style={{ marginTop:'8px' }}>
            <button type="submit" disabled={loading} className="btn btn-gold btn-full">{loading ? 'Enregistrement…' : piece?.id ? 'Mettre à jour' : 'Ajouter'}</button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GestStock() {
  const [pieces, setPieces]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [search, setSearch]   = useState('');
  const [alerteOnly, setAlerteOnly] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const params = {};
    if (search) params.q = search;
    if (alerteOnly) params.alerte = '1';
    const { data } = await api.get('/pieces', { params });
    setPieces(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [search, alerteOnly]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette pièce ?')) return;
    await api.delete(`/pieces/${id}`);
    fetch();
  };

  const alertes = pieces.filter(p => p.quantite_stock <= p.seuil_alerte);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      {modal !== null && <PieceModal piece={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetch(); }} />}
      <main className="dashboard-content">
        <div className="flex-between" style={{ marginBottom:'32px' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'28px', fontWeight:800 }}>Stock pièces détachées</h1>
            <p style={{ color:'var(--gray-light)', marginTop:'4px' }}>{pieces.length} référence(s)</p>
          </div>
          <button onClick={() => setModal({})} className="btn btn-gold">+ Ajouter une pièce</button>
        </div>

        {alertes.length > 0 && (
          <div className="alert alert-warning" style={{ marginBottom:'24px' }}>
            ⚠️ <strong>{alertes.length} pièce(s)</strong> en stock faible : {alertes.map(p => p.nom).join(', ')}
          </div>
        )}

        <div className="flex gap-md" style={{ marginBottom:'24px', flexWrap:'wrap' }}>
          <input className="form-input" placeholder="Rechercher une pièce…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex:'1 1 240px' }} />
          <button onClick={() => setAlerteOnly(a => !a)} className={`btn ${alerteOnly ? 'btn-gold' : 'btn-ghost'} btn-sm`}>
            {alerteOnly ? '⚠️ Stock faible seulement' : 'Toutes les pièces'}
          </button>
        </div>

        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : pieces.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px', color:'var(--gray-light)' }}>
            <div style={{ fontSize:'64px', marginBottom:'16px' }}>📦</div>
            <p style={{ marginBottom:'20px' }}>Aucune pièce en stock.</p>
            <button onClick={() => setModal({})} className="btn btn-gold">Ajouter la première pièce</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Pièce</th>
                  <th>Référence</th>
                  <th>Catégorie</th>
                  <th>Stock</th>
                  <th>Prix achat</th>
                  <th>Prix vente</th>
                  <th>Fournisseur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pieces.map(p => {
                  const enAlerte = p.quantite_stock <= p.seuil_alerte;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight:600 }}>{p.nom}</div>
                        {p.marque && <div style={{ color:'var(--gray-light)', fontSize:'12px' }}>{p.marque}</div>}
                      </td>
                      <td style={{ color:'var(--gray-light)', fontSize:'13px' }}>{p.reference || '—'}</td>
                      <td style={{ color:'var(--gray-light)', fontSize:'13px' }}>{p.categorie || '—'}</td>
                      <td>
                        <span className={`badge ${enAlerte ? 'badge-danger' : 'badge-success'}`}>
                          {p.quantite_stock} {enAlerte ? '⚠️' : ''}
                        </span>
                        <div style={{ color:'var(--gray)', fontSize:'11px', marginTop:'2px' }}>seuil: {p.seuil_alerte}</div>
                      </td>
                      <td style={{ color:'var(--gray-light)' }}>{p.prix_achat ? `${p.prix_achat} MAD` : '—'}</td>
                      <td style={{ color:'var(--gold)', fontWeight:600 }}>{p.prix_vente ? `${p.prix_vente} MAD` : '—'}</td>
                      <td style={{ color:'var(--gray-light)', fontSize:'13px' }}>{p.fournisseur || '—'}</td>
                      <td>
                        <div className="flex gap-sm">
                          <button onClick={() => setModal(p)} className="btn btn-ghost btn-sm">✏️</button>
                          <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-sm">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
