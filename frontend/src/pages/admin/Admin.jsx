import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  UserCheck,
  UserX,
  Shield,
  Wrench,
  Star,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingDown
} from 'lucide-react';
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

// Modern Bar Chart Component
function ModernBarChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <BarChart3 size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
        <p style={{ color: '#9ca3af' }}>Aucune donnée disponible</p>
      </div>
    );
  }
  
  const max = Math.max(...data.map(d => d.total || 0));
  
  const getMonthName = (dateStr) => {
    if (!dateStr) return '';
    const months = {
      '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril', '05': 'Mai', '06': 'Juin',
      '07': 'Juillet', '08': 'Août', '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
    };
    if (months[dateStr]) return months[dateStr];
    const month = dateStr.slice(5, 7);
    return months[month] || dateStr;
  };

  const totalInscriptions = data.reduce((sum, d) => sum + (d.total || 0), 0);
  const moyenneMensuelle = Math.round(totalInscriptions / data.length);
  const firstMonthValue = data[0]?.total || 0;
  const lastMonthValue = data[data.length - 1]?.total || 0;
  const tendance = lastMonthValue > firstMonthValue ? '+23%' : lastMonthValue < firstMonthValue ? '-12%' : 'Stable';
  const tendanceColor = lastMonthValue > firstMonthValue ? '#10b981' : lastMonthValue < firstMonthValue ? '#ef4444' : '#6b7280';

  return (
    <div style={{ padding: '24px' }}>
      {/* Chart Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '12px' }}>
              <BarChart3 size={20} color="#dc2626" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>
              Évolution des inscriptions
            </h3>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>6 derniers mois</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Nouveaux utilisateurs</span>
        </div>
      </div>

      {/* Bars Container */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '280px', marginBottom: '20px', padding: '0 10px' }}>
        {data.map((item, idx) => {
          const value = item.total || 0;
          const height = max > 0 ? (value / max) * 240 : 0;
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}px` }}
                  transition={{ duration: 0.5, delay: idx * 0.05, type: "spring", stiffness: 200 }}
                  style={{
                    width: '100%',
                    background: hoveredIndex === idx 
                      ? 'linear-gradient(180deg, #ef4444, #dc2626)'
                      : 'linear-gradient(180deg, #fca5a5, #dc2626)',
                    borderRadius: '12px 12px 8px 8px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    minHeight: '4px',
                    boxShadow: hoveredIndex === idx ? '0 4px 15px rgba(220,38,38,0.3)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {hoveredIndex === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -25, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1a1a2e',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        marginBottom: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      <span style={{ color: '#fbbf24' }}>+{value}</span> inscription{value > 1 ? 's' : ''}
                    </motion.div>
                  )}
                </motion.div>
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#6b7280', 
                fontWeight: 500, 
                textAlign: 'center',
                transform: hoveredIndex === idx ? 'translateY(-2px)' : 'none',
                transition: 'transform 0.2s'
              }}>
                {getMonthName(item.mois || item.date || `Mois ${idx + 1}`)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '24px', 
          paddingTop: '20px', 
          borderTop: '1px solid #f0f0f0', 
          flexWrap: 'wrap', 
          gap: '16px',
          background: '#fafafa',
          borderRadius: '16px',
          padding: '16px'
        }}
      >
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Total inscriptions</div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}
          >
            {totalInscriptions}
          </motion.div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Moyenne mensuelle</div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}
          >
            {moyenneMensuelle}
          </motion.div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Tendance</div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            style={{ fontSize: '16px', fontWeight: 800, color: tendanceColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            {tendance === '+23%' ? <TrendingUp size={16} /> : tendance === '-12%' ? <TrendingDown size={16} /> : null}
            {tendance}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function AdminSidebar() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/admin', label: 'Tableau de bord', icon: BarChart3 },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/admin/prestataires', label: 'Prestataires', icon: Building2 },
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
          AutoLink <span style={{ color: 'white', fontWeight: 400 }}>Admin</span>
        </div>
      </div>
      
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(220, 38, 38, 0.2)' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Administrateur</div>
        <div style={{ fontWeight: 600, color: 'white', marginBottom: '8px', fontSize: '15px' }}>
          {user?.prenom} {user?.nom}
        </div>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          background: '#dc2626',
          color: 'white'
        }}>
          Admin
        </span>
      </div>
      
      <nav style={{ flex: 1, padding: '20px 16px' }}>
        {links.map(l => {
          const Icon = l.icon;
          return (
            <motion.button
              key={l.to}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(l.to)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                color: '#9ca3af',
                background: 'transparent',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '4px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <Icon size={20} />
              <span style={{ fontWeight: 500 }}>{l.label}</span>
            </motion.button>
          );
        })}
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
          }}
        >
          → Déconnexion
        </motion.button>
      </div>
    </aside>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => { 
      setStats(r.data); 
      setLoading(false); 
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ marginLeft: '280px', padding: '32px 40px' }}>
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
            Tableau de bord Admin
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Vue globale de la plateforme AutoLink Maroc</p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
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
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid-4"
              style={{ marginBottom: '32px', gap: '24px' }}
            >
              {[
                { number: stats.users?.total || 0, label: 'Utilisateurs total', color: '#ef4444', icon: Users, bg: '#fef2f2' },
                { number: stats.users?.clients || 0, label: 'Clients', color: '#3b82f6', icon: UserCheck, bg: '#eff6ff' },
                { number: stats.prestataires?.total || 0, label: 'Prestataires', color: '#f59e0b', icon: Building2, bg: '#fffbeb' },
                { number: stats.users?.gestionnaires || 0, label: 'Gestionnaires', color: '#10b981', icon: Shield, bg: '#ecfdf5' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ background: s.bg, padding: '12px', borderRadius: '14px' }}>
                      <s.icon size={24} color={s.color} />
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: i * 0.1 }}
                      style={{ fontSize: '32px', fontWeight: 800, color: s.color }}
                    >
                      {s.number}
                    </motion.div>
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid-2" style={{ gap: '24px' }}>
              {/* Users Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px' }}>
                    <Users size={20} color="#dc2626" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>
                    Utilisateurs
                  </h3>
                </div>
                {[
                  { l: 'Clients', v: stats.users?.clients || 0, color: '#3b82f6', bg: '#eff6ff' },
                  { l: 'Gestionnaires', v: stats.users?.gestionnaires || 0, color: '#f59e0b', bg: '#fffbeb' },
                  { l: 'Techniciens', v: stats.users?.techniciens || 0, color: '#8b5cf6', bg: '#f5f3ff' },
                  { l: 'Administrateurs', v: stats.users?.admins || 0, color: '#ef4444', bg: '#fef2f2' },
                  { l: 'Comptes inactifs', v: stats.users?.inactifs || 0, color: '#ef4444', bg: '#fef2f2', danger: true },
                ].map((r, idx) => (
                  <motion.div 
                    key={r.l} 
                    className="flex-between" 
                    style={{ padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                  >
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{r.l}</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.4 + idx * 0.05 }}
                      style={{
                        background: r.bg,
                        color: r.color,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontSize: '14px'
                      }}
                    >
                      {r.v}
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Providers Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px' }}>
                    <Building2 size={20} color="#dc2626" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>
                    Prestataires & RDV
                  </h3>
                </div>
                {[
                  { l: 'Total prestataires', v: stats.prestataires?.total || 0, color: '#f59e0b', bg: '#fffbeb' },
                  { l: 'Vérifiés', v: stats.prestataires?.verifies || 0, color: '#10b981', bg: '#ecfdf5' },
                  { l: 'Actifs', v: stats.prestataires?.actifs || 0, color: '#3b82f6', bg: '#eff6ff' },
                  { l: 'Total RDV', v: stats.rdv?.total || 0, color: '#8b5cf6', bg: '#f5f3ff' },
                  { l: 'RDV terminés', v: stats.rdv?.termines || 0, color: '#10b981', bg: '#ecfdf5' },
                ].map((r, idx) => (
                  <motion.div 
                    key={r.l} 
                    className="flex-between" 
                    style={{ padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                  >
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{r.l}</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.4 + idx * 0.05 }}
                      style={{
                        background: r.bg,
                        color: r.color,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontSize: '14px'
                      }}
                    >
                      {r.v}
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Modern Bar Chart */}
            {stats.parMois && stats.parMois.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  marginTop: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                <ModernBarChart data={stats.parMois} />
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export function AdminUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newUser, setNewUser] = useState({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', role: 'client' });

  const fetch = async () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.q = search;
    if (role) params.role = role;
    const { data } = await api.get('/admin/users', { params });
    setUsers(data.data);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [search, role, page]);

  const toggleStatut = async (id) => { await api.put(`/admin/users/${id}/statut`); fetch(); };
  const changeRole = async (id, r) => { await api.put(`/admin/users/${id}/role`, { role: r }); fetch(); };
  const deleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setDeletingId(id);
    await api.delete(`/admin/users/${id}`);
    setDeletingId(null);
    fetch();
  };
  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setModal(false);
      fetch();
    } catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  const ROLES = ['client', 'gestionnaire', 'technicien', 'admin'];
  const ROLE_COLORS = {
    client: { bg: '#eff6ff', color: '#3b82f6' },
    gestionnaire: { bg: '#fffbeb', color: '#f59e0b' },
    technicien: { bg: '#fffbeb', color: '#f59e0b' },
    admin: { bg: '#fef2f2', color: '#dc2626' }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <AdminSidebar />
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '20px', padding: '24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>Créer un utilisateur</h2>
                <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#999' }}>×</button>
              </div>
              <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="grid-2">
                  <div className="form-group"><label style={{ color: '#333' }}>Prénom</label><input className="form-input" required value={newUser.prenom} onChange={e => setNewUser(p => ({ ...p, prenom: e.target.value }))} /></div>
                  <div className="form-group"><label style={{ color: '#333' }}>Nom</label><input className="form-input" required value={newUser.nom} onChange={e => setNewUser(p => ({ ...p, nom: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label style={{ color: '#333' }}>Email</label><input className="form-input" type="email" required value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="form-group"><label style={{ color: '#333' }}>Téléphone</label><input className="form-input" value={newUser.telephone} onChange={e => setNewUser(p => ({ ...p, telephone: e.target.value }))} /></div>
                <div className="form-group"><label style={{ color: '#333' }}>Mot de passe</label><input className="form-input" type="password" placeholder="AutoLink2024!" value={newUser.mot_de_passe} onChange={e => setNewUser(p => ({ ...p, mot_de_passe: e.target.value }))} /></div>
                <div className="form-group"><label style={{ color: '#333' }}>Rôle</label>
                  <select className="form-select" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-md" style={{ marginTop: '8px' }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Créer</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setModal(false)} style={{ background: '#f3f4f6', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Annuler</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <main style={{ marginLeft: '280px', padding: '32px 40px' }}>
        <div className="flex-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>Utilisateurs</h1>
            <p style={{ color: '#6b7280', marginTop: '4px' }}>{total} comptes</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModal(true)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Créer un compte
          </motion.button>
        </div>

        <div className="flex gap-md" style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input className="form-input" placeholder="Rechercher…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: '40px' }} />
          </div>
          <select className="form-select" value={role} onChange={e => { setRole(e.target.value); setPage(1); }} style={{ width: '160px' }}>
            <option value="">Tous les rôles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div className="table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Utilisateur</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Rôle</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Statut</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Inscription</th>
                      <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const roleInfo = ROLE_COLORS[u.role] || { bg: '#f3f4f6', color: '#6b7280' };
                      return (
                        <motion.tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 600, color: '#333' }}>{u.prenom} {u.nom}</div>
                            <div style={{ color: '#999', fontSize: '12px' }}>{u.telephone}</div>
                          </td>
                          <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>{u.email}</td>
                          <td style={{ padding: '12px' }}>
                            <select
                              value={u.role}
                              onChange={e => changeRole(u.id, e.target.value)}
                              style={{
                                background: roleInfo.bg,
                                color: roleInfo.color,
                                border: 'none',
                                borderRadius: '20px',
                                padding: '4px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              background: u.est_actif ? '#d1fae5' : '#fee2e2',
                              color: u.est_actif ? '#065f46' : '#991b1b',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              {u.est_actif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>{new Date(u.date_creation).toLocaleDateString('fr-FR')}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div className="flex gap-sm" style={{ justifyContent: 'center', gap: '8px' }}>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toggleStatut(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                {u.est_actif ? <Lock size={16} color="#6b7280" /> : <Unlock size={16} color="#dc2626" />}
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                {deletingId === u.id ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <Trash2 size={16} color="#dc2626" />}
                              </motion.button>
                            </div>
                          </td>
                         </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {total > 20 && (
              <div className="flex-center gap-md" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm">← Précédent</motion.button>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Page {page} / {Math.ceil(total / 20)}</span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="btn btn-ghost btn-sm">Suivant →</motion.button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export function AdminPrestataires() {
  const [prest, setPrest] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetch = async () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.q = search;
    const { data } = await api.get('/admin/prestataires', { params });
    setPrest(data.data);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [search, page]);

  const verifier = async (id) => { await api.put(`/admin/prestataires/${id}/verifier`); fetch(); };
  const toggle = async (id) => { await api.put(`/admin/prestataires/${id}/activer`); fetch(); };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ marginLeft: '280px', padding: '32px 40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>Prestataires partenaires</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>{total} établissements</p>
        </div>

        <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input className="form-input" placeholder="Rechercher…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: '40px' }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div className="table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Établissement</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Gestionnaire</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Ville</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Catégorie</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Note</th>
                      <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Statuts</th>
                      <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prest.map(p => (
                      <motion.tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#333' }}>{p.nom}</td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                          {p.gest_prenom} {p.gest_nom}<br />{p.gest_email}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>{p.ville}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                            {p.categorie}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
                            <Star size={14} fill="#f59e0b" /> {p.note_moyenne ? Number(p.note_moyenne).toFixed(1) : '—'}
                          </div>
                          <div style={{ color: '#999', fontSize: '11px' }}>{p.total_avis} avis</div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div className="flex gap-sm" style={{ flexDirection: 'column', gap: '6px' }}>
                            <span style={{
                              background: p.est_verifie ? '#d1fae5' : '#f3f4f6',
                              color: p.est_verifie ? '#065f46' : '#6b7280',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 600
                            }}>
                              {p.est_verifie ? '✓ Vérifié' : 'Non vérifié'}
                            </span>
                            <span style={{
                              background: p.est_actif ? '#dbeafe' : '#fee2e2',
                              color: p.est_actif ? '#3b82f6' : '#dc2626',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 600
                            }}>
                              {p.est_actif ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div className="flex gap-sm" style={{ justifyContent: 'center', gap: '8px' }}>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => verifier(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title={p.est_verifie ? 'Retirer vérification' : 'Vérifier'}>
                              <CheckCircle size={18} color={p.est_verifie ? '#10b981' : '#9ca3af'} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toggle(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title={p.est_actif ? 'Désactiver' : 'Activer'}>
                              {p.est_actif ? <Lock size={18} color="#6b7280" /> : <Unlock size={18} color="#dc2626" />}
                            </motion.button>
                          </div>
                        </td>
                       </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {total > 20 && (
              <div className="flex-center gap-md" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm">← Précédent</motion.button>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Page {page} / {Math.ceil(total / 20)}</span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="btn btn-ghost btn-sm">Suivant →</motion.button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}