import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const STATUT = {
  en_attente: { label:'En attente', class:'badge-warning' },
  confirme:   { label:'Confirmé',   class:'badge-info' },
  en_cours:   { label:'En cours',   class:'badge-gold' },
  termine:    { label:'Terminé',    class:'badge-success' },
  annule:     { label:'Annulé',     class:'badge-danger' },
};

function AlerteEcheance({ label, date }) {
  if (!date) return null;
  const diff = (new Date(date) - new Date()) / (1000*3600*24);
  if (diff < 0)  return <div className="alert alert-error" style={{marginBottom:'8px'}}>🔴 {label} expirée depuis {Math.abs(Math.round(diff))} jours</div>;
  if (diff < 30) return <div className="alert alert-warning" style={{marginBottom:'8px'}}>⚠️ {label} expire dans {Math.round(diff)} jours ({new Date(date).toLocaleDateString('fr-FR')})</div>;
  return null;
}

export default function HistoriqueVehicule() {
  const { id } = useParams();
  const [vehicule, setVehicule] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get(`/vehicules/${id}`)
      .then(r => setVehicule(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="dashboard-layout"><Sidebar /><main className="dashboard-content"><div className="loader"><div className="spinner"/></div></main></div>;
  if (!vehicule) return <div className="dashboard-layout"><Sidebar /><main className="dashboard-content"><p>Véhicule introuvable.</p></main></div>;

  const totalDepense = (vehicule.historique || []).filter(h => h.statut === 'termine').reduce((s, h) => s + (h.prix_final || 0), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        {/* Breadcrumb */}
        <div style={{marginBottom:'24px', fontSize:'14px', color:'var(--gray-light)'}}>
          <Link to="/client/vehicules" style={{color:'var(--gold)'}}>Mes véhicules</Link> › {vehicule.marque} {vehicule.modele}
        </div>

        {/* Fiche véhicule */}
        <div className="card" style={{marginBottom:'28px'}}>
          <div style={{display:'flex', gap:'24px', flexWrap:'wrap', alignItems:'flex-start'}}>
            <div style={{
              width:'80px', height:'80px', borderRadius:'20px',
              background:'linear-gradient(135deg, var(--dark-3), var(--dark-4))',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', flexShrink:0,
            }}>🚗</div>
            <div style={{flex:1}}>
              <h1 style={{fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:800}}>
                {vehicule.marque} {vehicule.modele}
                <span style={{color:'var(--gray-light)', fontWeight:400, fontSize:'16px', marginLeft:'10px'}}>{vehicule.annee}</span>
              </h1>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:'12px', marginTop:'16px'}}>
                {[
                  {l:'Immatriculation', v: vehicule.immatriculation || '—'},
                  {l:'Kilométrage',     v: vehicule.kilometrage ? `${vehicule.kilometrage.toLocaleString()} km` : '—'},
                  {l:'Carburant',       v: vehicule.carburant},
                  {l:'Couleur',         v: vehicule.couleur || '—'},
                  {l:'VIN',             v: vehicule.vin || '—'},
                  {l:'Total dépensé',   v: `${totalDepense.toLocaleString()} MAD`, gold:true},
                ].map(i => (
                  <div key={i.l} style={{background:'var(--dark-3)', padding:'12px', borderRadius:'10px'}}>
                    <div style={{fontSize:'11px', color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.5px'}}>{i.l}</div>
                    <div style={{fontWeight:700, marginTop:'4px', color: i.gold ? 'var(--gold)' : 'var(--white)'}}>{v => v}  {i.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alertes échéances */}
        <div style={{marginBottom:'20px'}}>
          <AlerteEcheance label="Assurance"        date={vehicule.date_assurance} />
          <AlerteEcheance label="Vignette"         date={vehicule.date_vignette} />
          <AlerteEcheance label="Visite technique" date={vehicule.date_visite_technique} />
        </div>

        {/* Dates importantes */}
        <div className="grid-3" style={{marginBottom:'28px'}}>
          {[
            {l:'🛡️ Assurance',        d: vehicule.date_assurance},
            {l:'📄 Vignette',          d: vehicule.date_vignette},
            {l:'🔍 Visite technique',  d: vehicule.date_visite_technique},
          ].map(e => {
            const diff = e.d ? Math.round((new Date(e.d) - new Date()) / (1000*3600*24)) : null;
            const color = diff === null ? 'var(--gray)' : diff < 0 ? 'var(--danger)' : diff < 30 ? 'var(--warning)' : 'var(--success)';
            return (
              <div key={e.l} className="card" style={{textAlign:'center'}}>
                <div style={{fontSize:'13px', color:'var(--gray-light)', marginBottom:'6px'}}>{e.l}</div>
                <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:'16px', color}}>
                  {e.d ? new Date(e.d).toLocaleDateString('fr-FR') : 'Non renseigné'}
                </div>
                {diff !== null && (
                  <div style={{fontSize:'12px', color, marginTop:'4px'}}>
                    {diff < 0 ? `Expirée (${Math.abs(diff)}j)` : `Dans ${diff} jours`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Historique interventions */}
        <h2 style={{fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:700, marginBottom:'16px'}}>
          📋 Historique des interventions ({vehicule.historique?.length || 0})
        </h2>

        {!vehicule.historique?.length ? (
          <div style={{textAlign:'center', padding:'60px', color:'var(--gray-light)'}}>
            <div style={{fontSize:'48px', marginBottom:'12px'}}>🔧</div>
            <p style={{marginBottom:'20px'}}>Aucune intervention enregistrée pour ce véhicule.</p>
            <Link to="/prestataires" className="btn btn-gold">Trouver un prestataire</Link>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {vehicule.historique.map(h => {
              const s = STATUT[h.statut] || {label:h.statut, class:'badge-gray'};
              return (
                <div key={h.id} className="card" style={{display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap'}}>
                  <div style={{
                    minWidth:'60px', textAlign:'center',
                    background:'var(--dark-3)', borderRadius:'12px', padding:'10px',
                  }}>
                    <div style={{color:'var(--gold)', fontFamily:'var(--font-display)', fontWeight:800, fontSize:'20px', lineHeight:1}}>
                      {new Date(h.date_rdv).getDate()}
                    </div>
                    <div style={{color:'var(--gray-light)', fontSize:'11px', textTransform:'uppercase'}}>
                      {new Date(h.date_rdv).toLocaleDateString('fr-FR',{month:'short'})}
                    </div>
                    <div style={{color:'var(--gray)', fontSize:'11px'}}>
                      {new Date(h.date_rdv).getFullYear()}
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'var(--font-display)', fontWeight:700, fontSize:'16px'}}>{h.prestataire}</div>
                    {h.prestation && <div style={{color:'var(--gold)', fontSize:'13px', marginTop:'3px'}}>🔧 {h.prestation}</div>}
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px'}}>
                    <span className={`badge ${s.class}`}>{s.label}</span>
                    {h.prix_final && (
                      <span style={{color:'var(--gold)', fontWeight:700, fontFamily:'var(--font-display)', fontSize:'16px'}}>
                        {Number(h.prix_final).toLocaleString()} MAD
                      </span>
                    )}
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
