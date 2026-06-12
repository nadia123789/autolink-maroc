import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  User,
  Car,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Search,
  AlertCircle,
  Stethoscope,
  Filter,
  Eye,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  X,
  UserCheck,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

// ── Badges statut ──
const STATUT_BADGE = {
  ouvert:            { label: 'Ouvert',         color: '#6b7280', bg: 'rgba(107,114,128,0.15)', icon: Clock },
  en_cours:          { label: 'En cours',       color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  icon: Wrench },
  en_attente_pieces: { label: 'Attente pièces', color: '#f97316', bg: 'rgba(249,115,22,0.15)',  icon: Package },
  termine:           { label: 'Terminé',        color: '#10b981', bg: 'rgba(16,185,129,0.15)',  icon: CheckCircle },
};

// ── Section collapsible dans le modal ──
function Section({ title, icon, children, empty, color = '#ef4444' }) {
  const [open, setOpen] = useState(true);
  const hasContent = React.Children.count(children) > 0;

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', background: 'none',
          border: 'none', cursor: 'pointer', marginBottom: '10px',
          padding: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 700, color }}>
          {icon} {title}
        </div>
        {open
          ? <ChevronUp size={15} color="#6b7280" />
          : <ChevronDown size={15} color="#6b7280" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {hasContent ? children : (
              <div style={{ color: '#4b5563', fontSize: '13px', fontStyle: 'italic', padding: '10px 14px' }}>
                {empty}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Modal détail diagnostic ──
function DiagnosticModal({ item, onClose }) {
  const lines   = (item.diagnostic || '').split('\n').filter(Boolean);
  const travaux = (item.travaux_effectues || '').split('\n').filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 25 }}
        className="card"
        style={{
          width: '100%', maxWidth: '680px', maxHeight: '88vh', overflowY: 'auto',
          background: '#1a1a1a', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '20px',
          padding: '28px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex-between" style={{ marginBottom: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Stethoscope size={22} color="#ef4444" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>
                Rapport de diagnostic
              </h2>
            </div>
            <div style={{ color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Car size={13} />
              {item.marque} {item.modele} —
              <span style={{ color: '#ef4444' }}>{item.immatriculation}</span>
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
          >
            <X size={24} />
          </motion.button>
        </div>

        {/* Infos véhicule + client */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '22px' }}>
          {[
            { l: 'Client',     v: `${item.client_prenom} ${item.client_nom}` },
            { l: 'Téléphone',  v: item.client_tel || '—' },
            { l: 'Technicien', v: item.technicien_nom || '—' },
            { l: 'Prestation', v: item.prestation_nom || '—' },
            { l: 'Date RDV',   v: new Date(item.date_rdv).toLocaleDateString('fr-FR') },
            { l: 'KM entrée',  v: item.kilometrage_entree ? `${Number(item.kilometrage_entree).toLocaleString()} km` : '—' },
            { l: 'KM sortie',  v: item.kilometrage_sortie ? `${Number(item.kilometrage_sortie).toLocaleString()} km` : '—' },
            { l: 'Date début', v: item.date_debut ? new Date(item.date_debut).toLocaleDateString('fr-FR') : '—' },
            { l: 'Date fin',   v: item.date_fin   ? new Date(item.date_fin).toLocaleDateString('fr-FR')   : '—' },
          ].map(({ l, v }) => (
            <div key={l} style={{ background: '#0f0f0f', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{l}</div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Problème client */}
        {item.description_probleme && (
          <div style={{
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: '12px', padding: '14px', marginBottom: '4px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertCircle size={13} /> PROBLÈME SIGNALÉ PAR LE CLIENT
            </div>
            <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{item.description_probleme}</p>
          </div>
        )}

        {/* Diagnostic */}
        <Section title="Diagnostic technique" icon={<Stethoscope size={16} color="#ef4444" />} empty="Aucun diagnostic saisi.">
          {lines.map((line, i) => {
            const isAnomaly = line.includes('⚠️ ANOMALIE');
            return (
              <div key={i} style={{
                display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', marginBottom: '6px',
                background: isAnomaly ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                border: isAnomaly ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
              }}>
                {isAnomaly
                  ? <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  : <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>›</span>}
                <span style={{ color: isAnomaly ? '#fca5a5' : '#d1d5db', fontSize: '13px', lineHeight: 1.6 }}>
                  {line.replace('⚠️ ANOMALIE:', '').trim()}
                </span>
              </div>
            );
          })}
        </Section>

        {/* Travaux */}
        <Section title="Travaux effectués" icon={<ClipboardList size={16} color="#10b981" />} empty="Aucun travail saisi." color="#10b981">
          {travaux.map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', marginBottom: '6px',
              background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)',
            }}>
              <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ color: '#d1d5db', fontSize: '13px', lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </Section>

        {/* Pièces utilisées */}
        {item.pieces_utilisees?.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={15} /> Pièces utilisées
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {['Pièce', 'Réf.', 'Qté', 'Prix unit.'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.pieces_utilisees.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1f1f1f' }}>
                    <td style={{ padding: '9px 10px', color: 'white',   fontSize: '13px' }}>{p.nom}</td>
                    <td style={{ padding: '9px 10px', color: '#6b7280', fontSize: '12px' }}>{p.reference || '—'}</td>
                    <td style={{ padding: '9px 10px', color: '#9ca3af', fontSize: '13px' }}>{p.quantite}</td>
                    <td style={{ padding: '9px 10px', color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>{p.prix_unitaire} MAD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Page principale ──
export default function DiagnosticPage() {
  const [interventions, setInterventions] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [search,        setSearch]        = useState('');
  const [filtreStatut,  setFiltreStatut]  = useState('tous');

  useEffect(() => {
    api.get('/gestionnaire/diagnostics')
      .then(({ data }) => setInterventions(data))
      .finally(() => setLoading(false));
  }, []);

  const avecDiag = interventions.filter(i => i.diagnostic || i.travaux_effectues);

  const filtered = avecDiag.filter(i => {
    const matchSearch = !search || [
      i.marque, i.modele, i.immatriculation,
      i.client_nom, i.client_prenom,
      i.technicien_nom,
      i.diagnostic, i.travaux_effectues,
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatut = filtreStatut === 'tous' || i.ordre_statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  const stats = {
    total:        avecDiag.length,
    enCours:      avecDiag.filter(i => i.ordre_statut === 'en_cours').length,
    termines:     avecDiag.filter(i => i.ordre_statut === 'termine').length,
    avecAnomalie: avecDiag.filter(i => i.diagnostic?.includes('⚠️ ANOMALIE')).length,
  };

  if (loading) return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '50px', height: '50px', border: '3px solid #dc2626', borderTopColor: 'transparent', borderRadius: '50%' }}
        />
      </main>
    </div>
  );

  return (
    <div className="dashboard-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Sidebar />

      <AnimatePresence>
        {selected && (
          <DiagnosticModal item={selected} onClose={() => setSelected(null)} />
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
            fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Diagnostics
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '4px' }}>
            {stats.total} diagnostic(s) enregistré(s) par vos techniciens
          </p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}
        >
          {[
            { number: stats.total,        label: 'Total diagnostics',   color: '#ef4444', icon: Stethoscope },
            { number: stats.enCours,      label: 'En cours',            color: '#f59e0b', icon: Wrench },
            { number: stats.termines,     label: 'Terminés',            color: '#10b981', icon: CheckCircle },
            { number: stats.avecAnomalie, label: 'Anomalies signalées', color: '#f97316', icon: AlertTriangle },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                borderRadius: '20px', padding: '24px',
                boxShadow: '0 10px 30px rgba(220,38,38,0.2)',
                border: '1px solid rgba(220,38,38,0.2)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                style={{
                  position: 'absolute', top: '-50%', right: '-50%',
                  width: '150px', height: '150px',
                  background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`,
                  borderRadius: '50%',
                }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <s.icon size={28} color={s.color} />
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: s.color }}>{s.number}</div>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 500 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recherche + filtres */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-sm"
          style={{ marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Rechercher par véhicule, client, technicien…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 40px',
                background: '#1a1a1a', border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '12px', color: 'white', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {[
            { k: 'tous',              l: 'Tous' },
            { k: 'en_cours',          l: 'En cours' },
            { k: 'en_attente_pieces', l: 'Attente pièces' },
            { k: 'termine',           l: 'Terminés' },
          ].map(f => (
            <motion.button
              key={f.k}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltreStatut(f.k)}
              style={{
                padding: '10px 20px', borderRadius: '12px',
                background: filtreStatut === f.k
                  ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                  : 'transparent',
                color: filtreStatut === f.k ? 'white' : '#9ca3af',
                border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: filtreStatut === f.k ? 600 : 500,
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.3s ease',
              }}
            >
              <Filter size={13} />
              {f.l}
            </motion.button>
          ))}
        </motion.div>

        {/* Liste */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                textAlign: 'center', padding: '80px',
                background: '#1a1a1a', borderRadius: '24px',
                border: '1px solid rgba(220,38,38,0.2)',
              }}
            >
              <Stethoscope size={64} color="#4b5563" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>Aucun diagnostic</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                {search
                  ? `Aucun résultat pour "${search}"`
                  : 'Aucun diagnostic enregistré pour l\'instant.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {filtered.map((item, index) => {
                const status      = STATUT_BADGE[item.ordre_statut] || { label: item.ordre_statut, color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: Clock };
                const StatusIcon  = status.icon;
                const hasAnomaly  = item.diagnostic?.includes('⚠️ ANOMALIE');
                const diagPreview = item.diagnostic?.replace(/⚠️ ANOMALIE:/g, '').trim().substring(0, 120);
                const travauxPreview = item.travaux_effectues?.trim().substring(0, 80);

                return (
                  <motion.div
                    key={item.ordre_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -3 }}
                    className="card"
                    style={{
                      background: '#1a1a1a', borderRadius: '16px', padding: '20px 24px',
                      cursor: 'pointer',
                      border: hasAnomaly
                        ? '1px solid rgba(239,68,68,0.35)'
                        : '1px solid rgba(220,38,38,0.2)',
                      position: 'relative', overflow: 'hidden',
                    }}
                    onClick={() => setSelected(item)}
                  >
                    {/* Glow animé */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{
                        position: 'absolute', top: '-50%', right: '-50%',
                        width: '150px', height: '150px',
                        background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                      }}
                    />

                    {/* Badge anomalie */}
                    {hasAnomaly && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white', fontSize: '10px', fontWeight: 700,
                        padding: '4px 12px', borderRadius: '0 16px 0 10px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <AlertTriangle size={10} /> ANOMALIE
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                      {/* Icône statut */}
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        style={{
                          width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                          background: `linear-gradient(135deg, ${status.color}20 0%, ${status.color}10 100%)`,
                          border: `1px solid ${status.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Car size={28} color={status.color} />
                      </motion.div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Titre */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'white', margin: 0 }}>
                            {item.marque} {item.modele}
                          </h3>
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>{item.immatriculation}</span>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '3px 10px', borderRadius: '20px',
                            background: status.bg, color: status.color,
                            fontSize: '11px', fontWeight: 600,
                          }}>
                            <StatusIcon size={11} /> {status.label}
                          </span>
                        </div>

                        {/* Client + technicien + date */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#9ca3af' }}>
                            <User size={12} /> {item.client_prenom} {item.client_nom}
                          </span>
                          {item.technicien_nom && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#ef4444' }}>
                              <UserCheck size={12} /> {item.technicien_nom}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#9ca3af' }}>
                            <Calendar size={12} /> {new Date(item.date_rdv).toLocaleDateString('fr-FR')}
                          </span>
                          {item.prestation_nom && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#9ca3af' }}>
                              <Wrench size={12} /> {item.prestation_nom}
                            </span>
                          )}
                        </div>

                        {/* Preview diagnostic */}
                        {diagPreview && (
                          <div style={{
                            background: 'rgba(239,68,68,0.07)', borderLeft: '3px solid #ef4444',
                            borderRadius: '0 8px 8px 0', padding: '8px 12px', marginBottom: '8px',
                          }}>
                            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Diagnostic
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#d1d5db', lineHeight: 1.5 }}>
                              {diagPreview}{item.diagnostic?.length > 120 ? '…' : ''}
                            </p>
                          </div>
                        )}

                        {/* Preview travaux */}
                        {travauxPreview && (
                          <div style={{
                            background: 'rgba(16,185,129,0.06)', borderLeft: '3px solid #10b981',
                            borderRadius: '0 8px 8px 0', padding: '8px 12px',
                          }}>
                            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Travaux
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#d1d5db', lineHeight: 1.5 }}>
                              {travauxPreview}{item.travaux_effectues?.length > 80 ? '…' : ''}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Bouton voir */}
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        style={{
                          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                          background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Eye size={17} color="#ef4444" />
                      </motion.div>
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
